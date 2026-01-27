import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DollarSign, 
  Search,
  Filter,
  Download,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import type { PayoutTransaction } from '@/hooks/usePayoutData';
import { useNavigate } from 'react-router-dom';

interface TransactionsListProps {
  transactions: PayoutTransaction[];
}

type StatusFilter = 'all' | 'released' | 'held' | 'pending';

export function TransactionsList({ transactions }: TransactionsListProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        tx.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.payer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const displayStatus = tx.escrow_status || tx.status;
      const matchesStatus = statusFilter === 'all' || displayStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const getStatusBadge = (status: string, escrowStatus: string | null) => {
    const displayStatus = escrowStatus || status;
    
    const config: Record<string, { color: string; label: string }> = {
      released: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Paid Out' },
      held: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'In Escrow' },
      pending: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', label: 'Pending' },
      completed: { color: 'bg-green-500/10 text-green-600 border-green-500/20', label: 'Completed' },
    };

    const { color, label } = config[displayStatus] || config.pending;

    return (
      <Badge variant="outline" className={`${color} capitalize`}>
        {label}
      </Badge>
    );
  };

  const totalFiltered = filteredTransactions.reduce((sum, tx) => sum + (tx.payout_amount || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings History
            </CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} 
              {statusFilter !== 'all' && ` (${statusFilter})`}
              {' • '}Total: ${totalFiltered.toFixed(2)}
            </CardDescription>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by task or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="released">Paid Out</SelectItem>
              <SelectItem value="held">In Escrow</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">
              {transactions.length === 0 ? 'No Earnings Yet' : 'No Results Found'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {transactions.length === 0 
                ? 'Complete tasks to start earning money!'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {transactions.length === 0 && (
              <Button className="mt-4" onClick={() => navigate('/browse')}>
                Browse Tasks
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {tx.task?.title || 'Task Payment'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">From: {tx.payer?.full_name || 'Client'}</span>
                    <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{format(new Date(tx.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground sm:hidden mt-1">
                    {format(new Date(tx.created_at), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <p className="font-bold text-green-600 text-lg">
                    +${tx.payout_amount.toFixed(2)}
                  </p>
                  {getStatusBadge(tx.status, tx.escrow_status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
