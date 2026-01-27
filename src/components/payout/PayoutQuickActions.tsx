import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDownToLine, 
  Settings, 
  FileText, 
  CreditCard,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PayoutQuickActionsProps {
  inEscrow: number;
  isPayoutAccountActive: boolean;
  onRequestWithdrawal: () => void;
}

export function PayoutQuickActions({ 
  inEscrow, 
  isPayoutAccountActive, 
  onRequestWithdrawal 
}: PayoutQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Manage your earnings and payouts
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isPayoutAccountActive && inEscrow > 0 && (
              <Button onClick={onRequestWithdrawal} className="gap-2">
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw ${inEscrow.toFixed(2)}
              </Button>
            )}
            
            {!isPayoutAccountActive && (
              <Button onClick={() => navigate('/account')} variant="default" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Set Up Bank Account
                <Badge variant="secondary" className="ml-1 text-xs">Required</Badge>
              </Button>
            )}
            
            <Button variant="outline" size="icon" onClick={() => navigate('/account')} title="Account Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
