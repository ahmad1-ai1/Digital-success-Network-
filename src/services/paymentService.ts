import { supabase } from '../lib/supabase';
import { paymentProofFromDb } from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { PaymentProof, PaymentMethod } from '../types';

export const paymentService = {
  getProofs(userId: string): PaymentProof[] {
    return devStore.getData().paymentProofs.filter(p => p.userId === userId).sort((a, b) =>
      new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
    );
  },

  getProofsByUser(userId: string): PaymentProof[] {
    return this.getProofs(userId);
  },

  getAllProofs(): PaymentProof[] {
    return [...devStore.getData().paymentProofs].sort((a, b) =>
      new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
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
        devStore.save(db => {
          // Merge into devStore
          const otherProofs = db.paymentProofs.filter(p => p.userId !== userId);
          db.paymentProofs = [...proofs, ...otherProofs];
        });
        return proofs;
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
  ): Promise<{ success: boolean; proof?: PaymentProof; error?: string }> {
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
      paymentMethod = (arg1.paymentMethod as PaymentMethod) || 'JazzCash';
      transactionId = arg1.transactionId;
      screenshotUrl = arg1.screenshotUrl || arg1.receiptUrl || '';
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

    if (!userId) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        userId = sessionData?.session?.user?.id || '';
      } catch {
        // ignore
      }
    }

    if (!userId) {
      return { success: false, error: 'User session not found. Please log in again.' };
    }

    const db = devStore.getData();
    let user = db.users.find(u => u.id === userId);
    let userFullName = user?.fullName;
    let userEmail = user?.email;

    if (!userFullName || !userEmail) {
      try {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .maybeSingle();
        if (!profErr && prof) {
          userFullName = prof.full_name || 'Member';
          userEmail = prof.email || '';
        }
      } catch (err) {
        console.warn('Could not query profile for submitProof:', err);
      }
    }

    if (!userFullName) userFullName = 'Member';
    if (!userEmail) userEmail = '';

    if (!transactionId || !transactionId.trim()) {
      return { success: false, error: 'Please provide a valid Transaction ID / Reference.' };
    }

    const finalAmount = amount > 0 ? amount : 1300;
    const cleanTxId = transactionId.trim().toUpperCase();

    // 1. Insert into Supabase public.payment_proofs
    const insertPayload = {
      user_id: userId,
      user_full_name: userFullName,
      user_email: userEmail,
      amount: finalAmount,
      payment_method: paymentMethod,
      transaction_id: cleanTxId,
      screenshot_url: screenshotUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      sender_name: senderName || null,
      sender_account: senderAccount || null,
      notes: notes || null,
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('payment_proofs')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('Could not insert payment proof into Supabase:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit payment proof to database.'
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'Database failed to return the created payment proof record.'
      };
    }

    const dbId = data.id;

    // 2. Ensure profile record in Supabase reflects pending payment proof status
    const { error: profUpdateErr } = await supabase
      .from('profiles')
      .update({
        payment_proof_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profUpdateErr) {
      console.warn('Could not update profile payment_proof_status in Supabase:', profUpdateErr);
    }

    const proof: PaymentProof = {
      id: dbId,
      userId,
      userFullName,
      userEmail,
      amount: finalAmount,
      paymentMethod,
      transactionId: cleanTxId,
      screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      receiptUrl: screenshotUrl || undefined,
      senderName: senderName || undefined,
      senderAccount: senderAccount || undefined,
      notes: notes || undefined,
      dateSubmitted: data.date_submitted || new Date().toISOString(),
      status: 'pending'
    };

    devStore.save(d => {
      d.paymentProofs.unshift(proof);
      if (d.profiles[userId]) {
        d.profiles[userId].paymentProofStatus = 'pending';
      }
      d.notifications.push({
        id: `notif-${Date.now()}`,
        userId,
        title: 'Payment Proof Submitted',
        message: `Your activation proof of ${proof.amount} PKR via ${paymentMethod} is received. Central Operations will review shortly.`,
        type: 'account_activated',
        read: false,
        createdAt: new Date().toISOString()
      });
    });

    return { success: true, proof };
  }
};
