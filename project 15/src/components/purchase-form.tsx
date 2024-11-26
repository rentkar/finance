import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Purchase } from '@/lib/types';

export function PurchaseForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    uploader_name: '',
    vendor_name: '',
    purpose: '',
    payment_sequence: '',
    amount: '',
    bill_type: '',
    hub: '',
    payment_date: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create purchase record first
      const purchaseData: Omit<Purchase, 'id' | 'created_at' | 'status' | 'director_approval' | 'finance_approval'> = {
        uploader_name: formData.uploader_name,
        vendor_name: formData.vendor_name,
        purpose: formData.purpose as Purchase['purpose'],
        payment_sequence: formData.payment_sequence as Purchase['payment_sequence'],
        bill_type: formData.bill_type as Purchase['bill_type'],
        hub: formData.hub as Purchase['hub'],
        amount: parseFloat(formData.amount),
        file_url: null,
        file_name: null,
        payment_date: formData.payment_date,
      };

      const { data: purchase, error: insertError } = await supabase
        .from('purchases')
        .insert([purchaseData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Handle file upload if exists
      if (file && purchase) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${purchase.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('purchase-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('purchase-files')
          .getPublicUrl(filePath);

        // Update purchase record with file info
        const { error: updateError } = await supabase
          .from('purchases')
          .update({
            file_url: publicUrl,
            file_name: file.name
          })
          .eq('id', purchase.id);

        if (updateError) throw updateError;
      }

      // Reset form
      setFormData({
        uploader_name: '',
        vendor_name: '',
        purpose: '',
        payment_sequence: '',
        amount: '',
        bill_type: '',
        hub: '',
        payment_date: '',
      });
      setFile(null);
      (e.target as HTMLFormElement).reset();

    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit purchase request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="uploader_name">Uploader Name</Label>
          <Input
            id="uploader_name"
            required
            placeholder="Enter your name"
            disabled={loading}
            value={formData.uploader_name}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor_name">Vendor Name</Label>
          <Input
            id="vendor_name"
            required
            placeholder="Enter vendor name"
            disabled={loading}
            value={formData.vendor_name}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.purpose}
            onValueChange={(value) => handleSelectChange('purpose', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Procurement">Procurement</SelectItem>
              <SelectItem value="Salary">Salary</SelectItem>
              <SelectItem value="Repair">Repair</SelectItem>
              <SelectItem value="Small Purchase">Small Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hub">Hub Location</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.hub}
            onValueChange={(value) => handleSelectChange('hub', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hub location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="pune">Pune</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bill_type">Bill Type</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.bill_type}
            onValueChange={(value) => handleSelectChange('bill_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bill type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantum">Quantum</SelectItem>
              <SelectItem value="covalent">Covalent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date</Label>
          <Input
            id="payment_date"
            type="date"
            required
            disabled={loading}
            value={formData.payment_date}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_sequence">Payment Sequence</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.payment_sequence}
            onValueChange={(value) => handleSelectChange('payment_sequence', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment sequence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment_first">Payment First, Bill Later</SelectItem>
              <SelectItem value="bill_first">Bill First, Payment Later</SelectItem>
              <SelectItem value="payment_without_bill">Payment Without Bill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            required
            min="0"
            step="0.01"
            placeholder="Enter amount in rupees"
            disabled={loading}
            value={formData.amount}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Upload Bill</Label>
          <Input
            id="file"
            type="file"
            required={formData.payment_sequence !== 'payment_without_bill'}
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected file: {file.name}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            'Submitting...'
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit Purchase
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}