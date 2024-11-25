import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const purchaseId = formData.get('purchaseId') as string;

    if (!file || !purchaseId) {
      return NextResponse.json(
        { error: 'File and purchase ID are required' },
        { status: 400 }
      );
    }

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

    // Update purchase record
    const { data: purchase, error: updateError } = await supabase
      .from('purchases')
      .update({
        file_url: publicUrl,
        file_name: file.name
      })
      .eq('id', purchaseId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}