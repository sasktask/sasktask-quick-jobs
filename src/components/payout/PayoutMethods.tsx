import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Building2, 
  Plus,
  CheckCircle,
  MoreVertical,
  Trash2,
  Star,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PayoutMethod {
  id: string;
  type: 'bank' | 'debit';
  name: string;
  last4: string;
  isDefault: boolean;
  instantEligible: boolean;
}

interface PayoutMethodsProps {
  payoutAccount: any;
  onAddMethod: () => void;
}

export function PayoutMethods({ payoutAccount, onAddMethod }: PayoutMethodsProps) {
  const [methods] = useState<PayoutMethod[]>(() => {
    if (payoutAccount?.bank_last4) {
      return [{
        id: '1',
        type: 'bank',
        name: 'Checking Account',
        last4: payoutAccount.bank_last4,
        isDefault: true,
        instantEligible: true
      }];
    }
    return [];
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <CardDescription>Where your earnings are deposited</CardDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onAddMethod} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {methods.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No Payment Methods</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a bank account to receive your earnings
            </p>
            <Button onClick={onAddMethod} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Bank Account
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => (
              <div 
                key={method.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                  method.isDefault 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  method.type === 'bank' 
                    ? 'bg-blue-500/10' 
                    : 'bg-purple-500/10'
                }`}>
                  {method.type === 'bank' ? (
                    <Building2 className="h-6 w-6 text-blue-600" />
                  ) : (
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Star className="h-3 w-3" />
                        Default
                      </Badge>
                    )}
                    {method.instantEligible && (
                      <Badge className="text-xs gap-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                        <Zap className="h-3 w-3" />
                        Instant
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    •••• •••• •••• {method.last4}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!method.isDefault && (
                        <DropdownMenuItem className="gap-2">
                          <Star className="h-4 w-4" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">About Payment Methods</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Bank accounts</strong> receive weekly 
                payouts at no additional cost. Processing takes 1-3 business days.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
              <span>
                <strong className="text-foreground">Instant eligible</strong> accounts can 
                cash out anytime for a $0.50 fee. Funds arrive within minutes.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
