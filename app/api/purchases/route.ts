import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Failed to fetch purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const data = {
      uploader_name: formData.get('uploaderName'),
      vendor_name: formData.get('vendorName'),
      purpose: formData.get('purpose'),
      payment_sequence: formData.get('paymentSequence'),
      amount: parseFloat(formData.get('amount') as string),
      bill_type: formData.get('billType'),
      hub: formData.get('hub'),
      payment_date: formData.get('paymentDate'),
      status: 'pending',
    };

    const file = formData.get('file') as File;
    if (file) {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('bills')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('bills')
        .getPublicUrl(fileName);

      data['file_url'] = publicUrl;
      data['file_name'] = file.name;
    }

    const { data: purchase, error } = await supabase
      .from('purchases')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Failed to create purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase' }, { status: 500 });
  }
}