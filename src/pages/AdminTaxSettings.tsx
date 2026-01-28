import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Receipt, Plus, Pencil, Calculator, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface TaxConfig {
  id: string;
  province: string;
  tax_type: string;
  rate: number;
  description: string | null;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
  applies_to: string;
  threshold_amount: number;
  created_at: string;
  updated_at: string;
}

interface TaxCalculation {
  id: string;
  payment_id: string | null;
  booking_id: string | null;
  user_id: string;
  gross_amount: number;
  gst_amount: number;
  pst_amount: number;
  contractor_withholding: number;
  total_tax: number;
  net_amount: number;
  province: string;
  tax_year: number;
  created_at: string;
}

export default function AdminTaxSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<TaxConfig | null>(null);
  const [formData, setFormData] = useState({
    tax_type: "GST",
    rate: 0,
    description: "",
    is_active: true,
    applies_to: "all",
    threshold_amount: 0,
  });

  // Fetch tax configurations
  const { data: taxConfigs, isLoading: configsLoading } = useQuery({
    queryKey: ["tax-configurations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_configurations")
        .select("*")
        .order("tax_type");
      if (error) throw error;
      return data as TaxConfig[];
    },
  });

  // Fetch recent tax calculations
  const { data: recentCalculations } = useQuery({
    queryKey: ["tax-calculations-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as TaxCalculation[];
    },
  });

  // Fetch tax statistics
  const { data: taxStats } = useQuery({
    queryKey: ["tax-stats"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("total_tax, gst_amount, pst_amount")
        .eq("tax_year", currentYear);
      if (error) throw error;

      const totalCollected = data?.reduce((sum, calc) => sum + (calc.total_tax || 0), 0) || 0;
      const totalGST = data?.reduce((sum, calc) => sum + (calc.gst_amount || 0), 0) || 0;
      const totalPST = data?.reduce((sum, calc) => sum + (calc.pst_amount || 0), 0) || 0;

      return {
        totalCollected,
        totalGST,
        totalPST,
        transactionCount: data?.length || 0,
      };
    },
  });

  // Update tax configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (config: Partial<TaxConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from("tax_configurations")
        .update({
          rate: config.rate,
          description: config.description,
          is_active: config.is_active,
          applies_to: config.applies_to,
          threshold_amount: config.threshold_amount,
        })
        .eq("id", config.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-configurations"] });
      toast({
        title: "Tax configuration updated",
        description: "The tax rate has been updated successfully.",
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (config: TaxConfig) => {
    setSelectedConfig(config);
    setFormData({
      tax_type: config.tax_type,
      rate: config.rate,
      description: config.description || "",
      is_active: config.is_active,
      applies_to: config.applies_to,
      threshold_amount: config.threshold_amount,
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedConfig) return;
    updateConfigMutation.mutate({
      id: selectedConfig.id,
      ...formData,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const getTaxTypeBadgeColor = (type: string) => {
    switch (type) {
      case "GST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PST":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "contractor_withholding":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "";
    }
  };

  return (
    <AdminLayout title="Tax Settings" description="Manage Saskatchewan tax rates and contractor withholding">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Receipt className="h-8 w-8 text-primary" />
              Tax Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage Saskatchewan tax rates and contractor withholding
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tax Collected (YTD)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(taxStats?.totalCollected || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {taxStats?.transactionCount || 0} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GST Collected</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">5%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(taxStats?.totalGST || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Federal tax</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PST Collected</CardTitle>
              <Badge className="bg-green-100 text-green-800">6%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(taxStats?.totalPST || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Saskatchewan provincial</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Combined Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">11%</div>
              <p className="text-xs text-muted-foreground">GST + PST</p>
            </CardContent>
          </Card>
        </div>

        {/* Tax Configurations Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Tax Rate Configuration</CardTitle>
            <CardDescription>
              Configure GST, PST, and contractor withholding rates for Saskatchewan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {configsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading configurations...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxConfigs?.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <Badge className={getTaxTypeBadgeColor(config.tax_type)}>
                          {config.tax_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{config.rate}%</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {config.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{config.applies_to}</Badge>
                      </TableCell>
                      <TableCell>
                        {config.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(config.effective_from), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(config)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Tax Calculations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Tax Calculations</CardTitle>
            <CardDescription>
              Latest tax deductions applied to payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentCalculations && recentCalculations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Gross Amount</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>PST</TableHead>
                    <TableHead>Withholding</TableHead>
                    <TableHead>Total Tax</TableHead>
                    <TableHead>Net Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCalculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell>
                        {format(new Date(calc.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{formatCurrency(calc.gross_amount)}</TableCell>
                      <TableCell>{formatCurrency(calc.gst_amount)}</TableCell>
                      <TableCell>{formatCurrency(calc.pst_amount)}</TableCell>
                      <TableCell>
                        {formatCurrency(calc.contractor_withholding)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(calc.total_tax)}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {formatCurrency(calc.net_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tax calculations recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Calculator Preview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tax Calculator Preview
            </CardTitle>
            <CardDescription>
              Test the tax calculation with a sample amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaxCalculatorPreview />
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tax Configuration</DialogTitle>
              <DialogDescription>
                Update the {selectedConfig?.tax_type} tax rate and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Applies To</Label>
                <Select
                  value={formData.applies_to}
                  onValueChange={(value) =>
                    setFormData({ ...formData, applies_to: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="platform_fee">Platform Fee Only</SelectItem>
                    <SelectItem value="contractor_payout">
                      Contractor Payout Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.tax_type === "contractor_withholding" && (
                <div className="space-y-2">
                  <Label>Threshold Amount ($)</Label>
                  <Input
                    type="number"
                    value={formData.threshold_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        threshold_amount: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Withholding only applies to payouts above this amount
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function TaxCalculatorPreview() {
  const [amount, setAmount] = useState(100);

  const gstRate = 5;
  const pstRate = 6;
  const platformFeeRate = 15;

  const gst = amount * (gstRate / 100);
  const pst = amount * (pstRate / 100);
  const platformFee = amount * (platformFeeRate / 100);
  const totalTax = gst + pst;
  const customerPays = amount + totalTax;
  const doerReceives = amount - platformFee;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
      value
    );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Task Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium">Calculation Result</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Task Amount</span>
            <span>{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>+ GST ({gstRate}%)</span>
            <span>{formatCurrency(gst)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>+ PST ({pstRate}%)</span>
            <span>{formatCurrency(pst)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Customer Pays</span>
            <span className="text-primary">{formatCurrency(customerPays)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-muted-foreground">
            <span>- Platform Fee ({platformFeeRate}%)</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Task Doer Receives</span>
            <span className="text-green-600">{formatCurrency(doerReceives)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
