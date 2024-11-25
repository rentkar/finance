import { headers } from 'next/headers';

interface VeryfiResponse {
  success: boolean;
  data?: {
    vendorName?: string;
    amount?: number;
    date?: string;
    invoiceNumber?: string;
    taxNumber?: string;
    category?: string;
    lineItems?: any[];
    rawText?: string;
    confidence?: number;
  };
  error?: string;
}

export async function processDocumentWithVeryfi(file: File): Promise<VeryfiResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process document');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Veryfi processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process document'
    };
  }
}