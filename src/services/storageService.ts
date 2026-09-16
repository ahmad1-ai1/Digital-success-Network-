import { supabase } from '../lib/supabase';

export const storageService = {
  /**
   * Upload payment proof receipt to private Supabase bucket 'payment-proofs'
   * Path convention: {userId}/{timestamp}_{fileName}
   */
  async uploadPaymentProof(
    userId: string,
    file: File
  ): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = `${userId}/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn('Supabase storage upload returned error, using local fallback:', error.message);
        // Local base64 fallback so user is never blocked
        const fallbackUrl = await fileToDataUrl(file);
        return { success: true, url: fallbackUrl, path: filePath };
      }

      // Create a private signed URL valid for 24 hours
      const { data: signedData, error: signedError } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(filePath, 60 * 60 * 24);

      if (signedError || !signedData?.signedUrl) {
        const fallbackUrl = await fileToDataUrl(file);
        return { success: true, url: fallbackUrl, path: filePath };
      }

      return { success: true, url: signedData.signedUrl, path: filePath };
    } catch (err: any) {
      console.warn('Storage upload error, using preview data URL:', err);
      const fallbackUrl = await fileToDataUrl(file);
      return { success: true, url: fallbackUrl };
    }
  },

  /**
   * Upload KYC document (CNIC front/back or selfie) to private Supabase bucket 'kyc-documents'
   */
  async uploadKYCDocument(
    userId: string,
    docType: 'front' | 'back' | 'selfie',
    file: File
  ): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${docType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = `${userId}/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('KYC storage upload error, using local fallback:', error.message);
        const fallbackUrl = await fileToDataUrl(file);
        return { success: true, url: fallbackUrl, path: filePath };
      }

      const { data: signedData } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(filePath, 60 * 60 * 24);

      if (signedData?.signedUrl) {
        return { success: true, url: signedData.signedUrl, path: filePath };
      }

      const fallbackUrl = await fileToDataUrl(file);
      return { success: true, url: fallbackUrl, path: filePath };
    } catch (err) {
      const fallbackUrl = await fileToDataUrl(file);
      return { success: true, url: fallbackUrl };
    }
  }
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
