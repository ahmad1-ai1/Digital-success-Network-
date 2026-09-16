import { supabase } from '../lib/supabase';
import { kycFromDb } from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { KYCRecord } from '../types';

export const kycService = {
  getKYCRecord(userId: string): KYCRecord | null {
    const record = devStore.getData().kycRecords.find(k => k.userId === userId);
    return record || null;
  },

  async fetchKYCRecord(userId: string): Promise<KYCRecord | null> {
    try {
      const { data, error } = await supabase
        .from('kyc_records')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        const record = kycFromDb(data);
        devStore.save(db => {
          const idx = db.kycRecords.findIndex(k => k.userId === userId);
          if (idx >= 0) db.kycRecords[idx] = record;
          else db.kycRecords.unshift(record);
          if (db.profiles[userId]) {
            db.profiles[userId].kycStatus = record.status;
          }
        });
        return record;
      }
    } catch (err) {
      console.warn('Error fetching KYC from Supabase:', err);
    }
    return this.getKYCRecord(userId);
  },

  getAllKYC(): KYCRecord[] {
    return [...devStore.getData().kycRecords].sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  },

  async submitKYC(
    arg1:
      | string
      | {
          userId: string;
          cnicNumber: string;
          fullName?: string;
          dateOfBirth?: string;
          frontDocumentUrl?: string;
          backDocumentUrl?: string;
          cnicFrontUrl?: string;
          cnicBackUrl?: string;
          selfieUrl?: string;
        },
    arg2?: string,
    arg3?: string,
    arg4?: string,
    arg5?: string
  ): Promise<{ success: boolean; record?: KYCRecord; error?: string }> {
    let userId = '';
    let cnicNumber = '';
    let cnicFrontUrl = '';
    let cnicBackUrl = '';
    let selfieUrl = '';
    let fullName = '';
    let dateOfBirth = '';

    if (typeof arg1 === 'object') {
      userId = arg1.userId;
      cnicNumber = arg1.cnicNumber;
      cnicFrontUrl = arg1.cnicFrontUrl || arg1.frontDocumentUrl || '';
      cnicBackUrl = arg1.cnicBackUrl || arg1.backDocumentUrl || '';
      selfieUrl = arg1.selfieUrl || '';
      fullName = arg1.fullName || '';
      dateOfBirth = arg1.dateOfBirth || '';
    } else {
      userId = arg1;
      cnicNumber = arg2 || '';
      cnicFrontUrl = arg3 || '';
      cnicBackUrl = arg4 || '';
      selfieUrl = arg5 || '';
    }

    const cleanCNIC = cnicNumber.trim();
    if (!cleanCNIC || cleanCNIC.length < 13) {
      return { success: false, error: 'Please enter a valid 13-digit CNIC number (e.g. 37405-1234567-1).' };
    }

    let recordId = `kyc-${Date.now()}`;

    // 1. Persist to Supabase
    try {
      const { data, error } = await supabase
        .from('kyc_records')
        .upsert(
          {
            user_id: userId,
            cnic_number: cleanCNIC,
            full_name: fullName || null,
            date_of_birth: dateOfBirth || null,
            cnic_front_url: cnicFrontUrl || null,
            cnic_back_url: cnicBackUrl || null,
            selfie_url: selfieUrl || null,
            status: 'pending',
            submitted_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (!error && data) {
        recordId = data.id;
      }
    } catch (err) {
      console.warn('Could not persist KYC to Supabase:', err);
    }

    const record: KYCRecord = {
      id: recordId,
      userId,
      cnicNumber: cleanCNIC,
      fullName: fullName || undefined,
      dateOfBirth: dateOfBirth || undefined,
      cnicFrontUrl: cnicFrontUrl || '',
      cnicBackUrl: cnicBackUrl || '',
      frontDocumentUrl: cnicFrontUrl || undefined,
      backDocumentUrl: cnicBackUrl || undefined,
      selfieUrl: selfieUrl || '',
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    devStore.save(data => {
      const idx = data.kycRecords.findIndex(k => k.userId === userId);
      if (idx >= 0) {
        data.kycRecords[idx] = record;
      } else {
        data.kycRecords.unshift(record);
      }

      if (data.profiles[userId]) {
        data.profiles[userId].kycStatus = 'pending';
      }

      data.notifications.push({
        id: `notif-${Date.now()}`,
        userId,
        title: 'KYC Documents Submitted',
        message: 'Your CNIC and verification selfie have been submitted for identity verification.',
        type: 'account_activated',
        read: false,
        createdAt: new Date().toISOString()
      });
    });

    return { success: true, record };
  }
};
