import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import type { Purchase } from '@/lib/types';

interface AdminDashboardProps {
  userRole: 'director' | 'finance' | null;
}

const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPurchases = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPurchases(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleStatusChange = async (
    purchaseId: string, 
    status: Purchase['status'],
    approvalType?: 'director' | 'finance'
  ) => {
    try {
      const now = new Date().toISOString();
      const updates: any = { status };

      if (approvalType === 'director') {
        updates.director_approval = { approved: true, date: now };
      } else if (approvalType === 'finance') {
        updates.finance_approval = { approved: true, date: now };
      }

      const { error: updateError } = await supabase
        .from('purchases')
        .update(updates)
        .eq('id', purchaseId);

      if (updateError) throw updateError;
      fetchPurchases();
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update purchase status');
    }
  };

  const handleDelete = async (purchaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (deleteError) throw deleteError;
      fetchPurchases();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete purchase');
    }
  };

  const canDirectorApprove = (purchase: Purchase): boolean => {
    return (
      userRole === 'director' &&
      purchase.status === 'pending' &&
      purchase.amount >= 10000 &&
      !purchase.director_approval?.approved
    );
  };

  const canFinanceApprove = (purchase: Purchase): boolean => {
    return (
      userRole === 'finance' &&
      (purchase.status === 'pending' || purchase.status === 'director_approved') &&
      (purchase.amount < 10000 || purchase.director_approval?.approved) &&
      !purchase.finance_approval?.approved
    );
  };

  const canReject = (purchase: Purchase): boolean => {
    return (
      (userRole === 'director' || userRole === 'finance') &&
      purchase.status !== 'finance_approved' &&
      purchase.status !== 'rejected'
    );
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.uploader_name.toLowerCase().includes(search.toLowerCase()) ||
      purchase.vendor_name.toLowerCase().includes(search.toLowerCase());
    return filter === 'all' ? matchesSearch : matchesSearch && purchase.status === filter;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const stats = {
    total: filteredPurchases.length,
    pending: filteredPurchases.filter(p => p.status === 'pending').length,
    approved: filteredPurchases.filter(p => p.status === 'finance_approved').length,
    rejected: filteredPurchases.filter(p => p.status === 'rejected').length,
    totalAmount: filteredPurchases.reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <Card className="w-full p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </Card>
        <Card className="p-4 bg-yellow-50">
          <p className="text-sm text-yellow-600">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-700">{stats.pending}</h3>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-sm text-green-600">Approved</p>
          <h3 className="text-2xl font-bold text-green-700">{stats.approved}</h3>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-sm text-purple-600">Total Amount</p>
          <h3 className="text-xl font-bold text-purple-700">{formatIndianCurrency(stats.totalAmount)}</h3>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="director_approved">Director Approved</SelectItem>
            <SelectItem value="finance_approved">Finance Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Hub</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{format(new Date(purchase.created_at), 'PP')}</TableCell>
                <TableCell>{purchase.uploader_name}</TableCell>
                <TableCell>{purchase.vendor_name}</TableCell>
                <TableCell>{purchase.purpose}</TableCell>
                <TableCell>{formatIndianCurrency(purchase.amount)}</TableCell>
                <TableCell className="capitalize">{purchase.hub}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${purchase.status === 'finance_approved' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'director_approved' ? 'bg-blue-100 text-blue-800' :
                      purchase.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {purchase.status.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {purchase.file_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={purchase.file_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {canDirectorApprove(purchase) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleStatusChange(purchase.id, 'director_approved', 'director')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {canFinanceApprove(purchase) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleStatusChange(purchase.id, 'finance_approved', 'finance')}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {canReject(purchase) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleStatusChange(purchase.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {(userRole === 'director' || userRole === 'finance') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}