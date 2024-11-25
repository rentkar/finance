import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function PurchaseForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date>();
  const [formData, setFormData] = useState({
    uploaderName: '',
    vendorName: '',
    purpose: '',
    paymentSequence: '',
    amount: '',
    billType: '',
    hub: '',
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
    
    if (!paymentDate) {
      toast({
        title: "Error",
        description: "Please select a payment date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload file if provided and required
      let fileUrl = null;
      let fileName = null;

      if (file && formData.paymentSequence !== 'payment_without_bill') {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bills')
          .upload(`${Date.now()}-${file.name}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('bills')
          .getPublicUrl(uploadData.path);

        fileUrl = publicUrl;
        fileName = file.name;
      }

      // Prepare purchase data
      const purchaseData = {
        uploader_name: formData.uploaderName,
        vendor_name: formData.vendorName,
        purpose: formData.purpose,
        amount: parseFloat(formData.amount),
        payment_sequence: formData.paymentSequence,
        bill_type: formData.billType.toLowerCase(), // Ensure lowercase to match enum
        hub: formData.hub.toLowerCase(), // Ensure lowercase to match enum
        payment_date: paymentDate.toISOString(),
        file_url: fileUrl,
        file_name: fileName,
        status: 'pending',
      };

      const { error: insertError } = await supabase
        .from('purchases')
        .insert([purchaseData]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Purchase submitted successfully",
      });

      // Reset form
      setFormData({
        uploaderName: '',
        vendorName: '',
        purpose: '',
        paymentSequence: '',
        amount: '',
        billType: '',
        hub: '',
      });
      setFile(null);
      setPaymentDate(undefined);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit purchase",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="uploaderName">Uploader Name</Label>
          <Input
            id="uploaderName"
            required
            placeholder="Enter your name"
            disabled={loading}
            value={formData.uploaderName}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendorName">Vendor Name</Label>
          <Input
            id="vendorName"
            required
            placeholder="Enter vendor name"
            disabled={loading}
            value={formData.vendorName}
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
          <Label htmlFor="billType">Bill Type</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.billType}
            onValueChange={(value) => handleSelectChange('billType', value)}
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
          <Label>Payment Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !paymentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={paymentDate}
                onSelect={setPaymentDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentSequence">Payment Sequence</Label>
          <Select 
            required 
            disabled={loading}
            value={formData.paymentSequence}
            onValueChange={(value) => handleSelectChange('paymentSequence', value)}
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
            className="cursor-pointer"
            required={formData.paymentSequence !== 'payment_without_bill'}
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit Purchase
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}