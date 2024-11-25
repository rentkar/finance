import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { supabase } from '@/lib/db';
import { format } from 'date-fns';

export async function GET() {
  try {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Purchases');

    worksheet.columns = [
      { header: 'Date Created', key: 'createdAt', width: 20 },
      { header: 'Uploader Name', key: 'uploaderName', width: 20 },
      { header: 'Vendor Name', key: 'vendorName', width: 30 },
      { header: 'Purpose', key: 'purpose', width: 15 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Hub', key: 'hub', width: 15 },
      { header: 'Bill Type', key: 'billType', width: 15 },
      { header: 'Payment Date', key: 'paymentDate', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'OCR Vendor Name', key: 'ocrVendorName', width: 30 },
      { header: 'OCR Amount', key: 'ocrAmount', width: 15 },
      { header: 'OCR Invoice Number', key: 'ocrInvoiceNumber', width: 20 },
      { header: 'OCR Tax Number', key: 'ocrTaxNumber', width: 20 },
      { header: 'OCR Confidence', key: 'ocrConfidence', width: 15 },
    ];

    purchases?.forEach((purchase) => {
      const ocrData = purchase.ocr_data || {};
      worksheet.addRow({
        createdAt: format(new Date(purchase.created_at), 'yyyy-MM-dd HH:mm:ss'),
        uploaderName: purchase.uploader_name,
        vendorName: purchase.vendor_name,
        purpose: purchase.purpose,
        amount: purchase.amount,
        hub: purchase.hub,
        billType: purchase.bill_type,
        paymentDate: format(new Date(purchase.payment_date), 'yyyy-MM-dd'),
        status: purchase.status,
        ocrVendorName: ocrData.vendorName || 'N/A',
        ocrAmount: ocrData.amount || 'N/A',
        ocrInvoiceNumber: ocrData.invoiceNumber || 'N/A',
        ocrTaxNumber: ocrData.taxNumber || 'N/A',
        ocrConfidence: ocrData.confidence ? `${Math.round(ocrData.confidence)}%` : 'N/A',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=purchases.xlsx',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}