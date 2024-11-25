import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const base64Data = await fileToBase64(file);
    const response = await fetch('https://api.veryfi.com/api/v8/partner/documents', {
      method: 'POST',
      headers: {
        'CLIENT-ID': process.env.VERYFI_CLIENT_ID!,
        'Authorization': `apikey ${process.env.VERYFI_USERNAME}:${process.env.VERYFI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_data: base64Data,
        file_name: file.name,
        categories: ['Utilities', 'Supplies', 'Services'],
        auto_delete: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to process document' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: {
        vendorName: data.vendor?.name,
        amount: data.total,
        date: data.date,
        invoiceNumber: data.invoice_number,
        taxNumber: data.tax_id,
        category: data.category,
        lineItems: data.line_items,
        rawText: data.ocr_text,
        confidence: data.confidence,
      },
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process document'
      },
      { status: 500 }
    );
  }
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString('base64');
}