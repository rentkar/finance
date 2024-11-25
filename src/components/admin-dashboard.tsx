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
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, CheckCircle, XCircle, Download, Calendar, Trash2, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { supabase } from '@/lib/supabase';
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

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function AdminDashboard({ userRole }: AdminDashboardProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleStatusChange = async (
    purchaseId: string,
    status: 'director_approved' | 'finance_approved' | 'rejected'
  ) => {
    try {
      const purchase = purchases.find(p => p.id === purchaseId);
      if (!purchase) return;

      const updates: any = { status };

      if (status === 'director_approved') {
        updates.director_approval = {
          approved: true,
          date: new Date().toISOString(),
        };
      } else if (status === 'finance_approved') {
        updates.finance_approval = {
          approved: true,
          date: new Date().toISOString(),
        };
      } else if (status === 'rejected') {
        updates.status = 'rejected';
        updates.director_approval = null;
        updates.finance_approval = null;
      }

      const { error } = await supabase
        .from('purchases')
        .update(updates)
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Purchase ${status.replace('_', ' ')}`,
      });

      fetchPurchases();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (purchaseId: string) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;

    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase deleted successfully",
      });

      fetchPurchases();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive",
      });
    }
  };

  const canShowApprovalButtons = (purchase: Purchase) => {
    if (!userRole || purchase.status === 'rejected') return false;

    if (userRole === 'director') {
      return purchase.amount >= 10000 && !purchase.director_approval?.approved;
    }

    if (userRole === 'finance') {
      if (purchase.amount >= 10000) {
        return purchase.director_approval?.approved && !purchase.finance_approval?.approved;
      }
      return !purchase.finance_approval?.approved;
    }

    return false;
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.uploader_name.toLowerCase().includes(search.toLowerCase()) ||
      purchase.vendor_name.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || purchase.status === filter;
    
    let matchesMonth = true;
    if (selectedMonth !== 'all') {
      const purchaseDate = new Date(purchase.created_at);
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, month));
      const endDate = endOfMonth(new Date(year, month));
      matchesMonth = isWithinInterval(purchaseDate, { start: startDate, end: endDate });
    }

    return matchesSearch && matchesFilter && matchesMonth;
  });

  // Calculate statistics
  const stats = {
    total: filteredPurchases.length,
    pending: filteredPurchases.filter(p => p.status === 'pending').length,
    directorApproved: filteredPurchases.filter(p => p.status === 'director_approved').length,
    financeApproved: filteredPurchases.filter(p => p.status === 'finance_approved').length,
    rejected: filteredPurchases.filter(p => p.status === 'rejected').length,
    totalAmount: filteredPurchases.reduce((sum, p) => sum + p.amount, 0),
  };

  // Generate month options
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Add months for current year
    for (let i = currentMonth; i >= 0; i--) {
      options.push({
        value: `${currentYear}-${i}`,
        label: `${months[i]} ${currentYear}`,
      });
    }

    // Add months for previous year
    for (let i = 11; i > currentMonth; i--) {
      options.push({
        value: `${currentYear - 1}-${i}`,
        label: `${months[i]} ${currentYear - 1}`,
      });
    }

    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full p-6">
      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 bg-white">
          <p className="text-sm text-muted-foreground">Total Requests</p>
          <h3 className="text-2xl font-bold">{stats.total}</h3>
        </Card>
        <Card className="p-4 bg-yellow-50">
          <p className="text-sm text-yellow-600">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-700">{stats.pending}</h3>
        </Card>
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-blue-600">Director Approved</p>
          <h3 className="text-2xl font-bold text-blue-700">{stats.directorApproved}</h3>
        </Card>
        <Card className="p-4 bg-green-50">
          <p className="text-sm text-green-600">Finance Approved</p>
          <h3 className="text-2xl font-bold text-green-700">{stats.financeApproved}</h3>
        </Card>
        <Card className="p-4 bg-red-50">
          <p className="text-sm text-red-600">Rejected</p>
          <h3 className="text-2xl font-bold text-red-700">{stats.rejected}</h3>
        </Card>
        <Card className="p-4 bg-purple-50">
          <p className="text-sm text-purple-600">Total Amount</p>
          <h3 className="text-xl font-bold text-purple-700">{formatIndianCurrency(stats.totalAmount)}</h3>
        </Card>
      </div>

      {/* Filters */}
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
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            {getMonthOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
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
              <TableHead>Bill Type</TableHead>
              <TableHead>Payment Sequence</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>File</TableHead>
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
                <TableCell className="whitespace-nowrap">
                  {formatIndianCurrency(purchase.amount)}
                </TableCell>
                <TableCell className="capitalize">{purchase.hub}</TableCell>
                <TableCell className="capitalize">{purchase.bill_type}</TableCell>
                <TableCell>
                  {purchase.payment_sequence === 'payment_first'
                    ? 'Payment First'
                    : purchase.payment_sequence === 'bill_first'
                    ? 'Bill First'
                    : 'Payment Without Bill'}
                </TableCell>
                <TableCell>{format(new Date(purchase.payment_date), 'PP')}</TableCell>
                <TableCell>
                  {purchase.file_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={purchase.file_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                  )}
                </TableCell>
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
                  <div className="flex gap-2">
                    {canShowApprovalButtons(purchase) && (
                      <>
                        {userRole === 'director' && purchase.amount >= 10000 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleStatusChange(purchase.id, 'director_approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Director
                          </Button>
                        )}
                        {userRole === 'finance' && (
                          (purchase.amount < 10000 || purchase.director_approval?.approved) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusChange(purchase.id, 'finance_approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Finance
                            </Button>
                          )
                        )}
                      </>
                    )}
                    {(userRole === 'director' || userRole === 'finance') && 
                     purchase.status !== 'rejected' && 
                     purchase.status !== 'finance_approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleStatusChange(purchase.id, 'rejected')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    )}
                    {userRole && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-gray-600 hover:text-gray-700"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
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