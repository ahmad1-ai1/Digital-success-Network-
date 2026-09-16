import { supabase } from '../lib/supabase';
import { paymentProofFromDb } from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { PaymentProof, PaymentMethod } from '../types';

export const paymentService = {
  getProofs(userId: string): PaymentProof[] {
    return devStore
      .getData()
      .paymentProofs
      .filter((p) => p.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.dateSubmitted).getTime() -
          new Date(a.dateSubmitted).getTime()
      );
  },

  getProofsByUser(userId: string): PaymentProof[] {
    return this.getProofs(userId);
  },

  getAllProofs(): PaymentProof[] {
    return [...devStore.getData().paymentProofs].sort(
      (a, b) =>
        new Date(b.dateSubmitted).getTime() -
        new Date(a.dateSubmitted).getTime()
    );
  },

  async fetchProofs(userId: string): Promise<PaymentProof[]> {
    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .select('*')
        .eq('user_id', userId)
        .order('date_submitted', { ascending: false });

      if (!error && data) {
        const proofs = data.map(paymentProofFromDb);

        devStore.save((db) => {
          const otherProofs = db.paymentProofs.filter(
            (p) => p.userId !== userId
          );

          db.paymentProofs = [...proofs, ...otherProofs];
        });

        return proofs;
      }

      if (error) {
        console.warn('Error fetching proofs from Supabase:', error);
      }
    } catch (err) {
      console.warn('Error fetching proofs from Supabase:', err);
    }

    return this.getProofs(userId);
  },

  async submitProof(
    arg1:
      | string
      | {
          userId: string;
          amount: number;
          paymentMethod: PaymentMethod | string;
          transactionId: string;
          screenshotUrl?: string;
          receiptUrl?: string;
          senderName?: string;
          senderAccount?: string;
          notes?: string;
        },
    arg2?: number,
    arg3?: PaymentMethod,
    arg4?: string,
    arg5?: string
  ): Promise<{
    success: boolean;
    proof?: PaymentProof;
    error?: string;
  }> {
    let userId = '';
    let amount = 0;
    let paymentMethod: PaymentMethod = 'JazzCash';
    let transactionId = '';
    let screenshotUrl = '';
    let senderName = '';
    let senderAccount = '';
    let notes = '';

    if (typeof arg1 === 'object') {
      userId = arg1.userId;
      amount = arg1.amount;
      paymentMethod =
        (arg1.paymentMethod as PaymentMethod) || 'JazzCash';
      transactionId = arg1.transactionId;
      screenshotUrl =
        arg1.screenshotUrl || arg1.receiptUrl || '';
      senderName = arg1.senderName || '';
      senderAccount = arg1.senderAccount || '';
      notes = arg1.notes || '';
    } else {
      userId = arg1;
      amount = arg2 || 0;
      paymentMethod = arg3 || 'JazzCash';
      transactionId = arg4 || '';
      screenshotUrl = arg5 || '';
    }

    const db = devStore.getData();
    const user = db.users.find((u) => u.id === userId);

    if (!user) {
      return {
        success: false,
        error: 'User not found.',
      };
    }

    if (!transactionId.trim()) {
      return {
        success: false,
        error: 'Please provide a valid Transaction ID / Reference.',
      };
    }

    const finalAmount =
      amount > 0 ? amount : db.settings.activationFeePKR;

    const cleanTxId = transactionId.trim();

    try {
      const { data, error } = await supabase
        .from('payment_proofs')
        .insert({
          user_id: userId,
          user_full_name: user.fullName,
          user_email: user.email,
          amount: finalAmount,
          payment_method: paymentMethod,
          transaction_id: cleanTxId,
          screenshot_url: screenshotUrl || '',
          sender_name: senderName || null,
          sender_account: senderAccount || null,
          notes: notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error(
          'Payment proof Supabase insert failed:',
          error
        );

        return {
          success: false,
          error:
            error.message || 'Failed to submit payment proof.',
        };
      }

      if (!data) {
        return {
          success: false,
          error: 'Payment proof was not saved.',
        };
      }

      const proof = paymentProofFromDb(data);

      devStore.save((store) => {
        store.paymentProofs = [
          proof,
          ...store.paymentProofs.filter(
            (p) => p.id !== proof.id
          ),
        ];

        if (store.profiles[userId]) {
          store.profiles[userId].paymentProofStatus = 'pending';
        }

        store.notifications.push({
          id: `notif-${Date.now()}`,
          userId,
          title: 'Payment Proof Submitted',
          message: `Your activation proof of ${proof.amount} PKR via ${paymentMethod} is received. Central Operations will review shortly.`,
          type: 'account_activated',
          read: false,
          createdAt: new Date().toISOString(),
        });
      });

      return {
        success: true,
        proof,
      };
    } catch (err) {
      console.error(
        'Unexpected payment proof submission error:',
        err
      );

      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Failed to submit payment proof.',
      };
    }
  },
};
