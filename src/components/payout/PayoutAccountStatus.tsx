import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  CreditCard,
  Shield,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PayoutAccount } from '@/hooks/usePayoutData';

interface PayoutAccountStatusProps {
  payoutAccount: PayoutAccount | null;
}

export function PayoutAccountStatus({ payoutAccount }: PayoutAccountStatusProps) {
  const navigate = useNavigate();
  const isActive = payoutAccount?.account_status === 'active';

  if (isActive) {
    return (
      <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-green-700 dark:text-green-400">Payout Account Active</h3>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Bank account ending in •••• {payoutAccount.bank_last4 || '****'} is ready to receive payments.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/account')} className="shrink-0">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent">
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">Set Up Your Payout Account</h3>
            <p className="text-sm text-muted-foreground">
              Add your bank details to receive payments for completed tasks. This only takes a minute.
            </p>
          </div>
          <Button onClick={() => navigate('/account')} className="shrink-0 gap-2">
            Set Up Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
