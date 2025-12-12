import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEOHead } from "@/components/SEOHead";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
  Search,
  Eye,
  Download,
  MoreVertical,
  Lock,
  Unlock,
  RefreshCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  platform_fee: number;
  payout_amount: number;
  status: string | null;
  escrow_status: string | null;
  created_at: string;
  paid_at: string | null;
  released_at: string | null;
  booking_id: string;
  task_id: string;
  payer_id: string;
  payee_id: string;
  payer: { full_name: string | null; email: string } | null;
  payee: { full_name: string | null; email: string } | null;
  task: { title: string } | null;
}

export default function AdminPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [escrowFilter, setEscrowFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: "hold" | "release" | "refund" | null;
    payment: Payment | null;
  }>({ type: null, payment: null });
  const [actionReason, setActionReason] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPlatformFees: 0,
    pendingPayments: 0,
    completedPayments: 0,
    heldPayments: 0,
    refundedPayments: 0,
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          payer:profiles!payments_payer_id_fkey(full_name, email),
          payee:profiles!payments_payee_id_fkey(full_name, email),
          task:tasks(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      
      // Calculate stats
      const completed = data?.filter(p => p.status === "completed") || [];
      const pending = data?.filter(p => p.status === "pending") || [];
      const held = data?.filter(p => p.escrow_status === "held") || [];
      const refunded = data?.filter(p => p.status === "refunded") || [];
      
      setStats({
        totalRevenue: completed.reduce((sum, p) => sum + p.amount, 0),
        totalPlatformFees: completed.reduce((sum, p) => sum + p.platform_fee, 0),
        pendingPayments: pending.length,
        completedPayments: completed.length,
        heldPayments: held.length,
        refundedPayments: refunded.length,
      });
    } catch (error: any) {
      console.error("Error loading payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleHoldPayment = async () => {
    if (!actionDialog.payment) return;

    try {
      const { error } = await supabase
        .from("payments")
        .update({
          escrow_status: "held",
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionDialog.payment.id);

      if (error) throw error;

      // Create notification for payee
      await supabase.from("notifications").insert({
        user_id: actionDialog.payment.payee_id,
        title: "Payment On Hold",
        message: `Your payment of $${actionDialog.payment.payout_amount} has been placed on hold by admin. ${actionReason ? `Reason: ${actionReason}` : ""}`,
        type: "payment",
      });

      toast.success("Payment placed on hold");
      loadPayments();
      setActionDialog({ type: null, payment: null });
      setActionReason("");
    } catch (error: any) {
      console.error("Error holding payment:", error);
      toast.error("Failed to hold payment");
    }
  };

  const handleReleasePayment = async () => {
    if (!actionDialog.payment) return;

    try {
      const { error } = await supabase
        .from("payments")
        .update({
          escrow_status: "released",
          released_at: new Date().toISOString(),
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionDialog.payment.id);

      if (error) throw error;

      // Create notification for payee
      await supabase.from("notifications").insert({
        user_id: actionDialog.payment.payee_id,
        title: "Payment Released",
        message: `Your payment of $${actionDialog.payment.payout_amount} has been released and is on its way!`,
        type: "payment",
      });

      toast.success("Payment released successfully");
      loadPayments();
      setActionDialog({ type: null, payment: null });
      setActionReason("");
    } catch (error: any) {
      console.error("Error releasing payment:", error);
      toast.error("Failed to release payment");
    }
  };

  const handleRefundPayment = async () => {
    if (!actionDialog.payment) return;

    try {
      const { error } = await supabase
        .from("payments")
        .update({
          status: "refunded",
          escrow_status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", actionDialog.payment.id);

      if (error) throw error;

      // Notify both parties
      await supabase.from("notifications").insert([
        {
          user_id: actionDialog.payment.payer_id,
          title: "Payment Refunded",
          message: `Your payment of $${actionDialog.payment.amount} has been refunded. ${actionReason ? `Reason: ${actionReason}` : ""}`,
          type: "payment",
        },
        {
          user_id: actionDialog.payment.payee_id,
          title: "Payment Refunded",
          message: `The payment of $${actionDialog.payment.payout_amount} for your task has been refunded to the client. ${actionReason ? `Reason: ${actionReason}` : ""}`,
          type: "payment",
        },
      ]);

      toast.success("Payment refunded successfully");
      loadPayments();
      setActionDialog({ type: null, payment: null });
      setActionReason("");
    } catch (error: any) {
      console.error("Error refunding payment:", error);
      toast.error("Failed to refund payment");
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "processing":
        return "bg-blue-600";
      case "failed":
        return "bg-red-600";
      case "refunded":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const getEscrowColor = (status: string | null) => {
    switch (status) {
      case "held":
        return "border-yellow-500 text-yellow-600";
      case "released":
        return "border-green-500 text-green-600";
      case "refunded":
        return "border-purple-500 text-purple-600";
      default:
        return "border-gray-500 text-gray-600";
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.payer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.task?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesEscrow = escrowFilter === "all" || p.escrow_status === escrowFilter;

    return matchesSearch && matchesStatus && matchesEscrow;
  });

  const exportPayments = () => {
    const csv = [
      ["ID", "Date", "Payer", "Payee", "Task", "Amount", "Platform Fee", "Status", "Escrow"].join(","),
      ...filteredPayments.map((p) =>
        [
          p.id,
          format(new Date(p.created_at), "yyyy-MM-dd"),
          p.payer?.full_name || "",
          p.payee?.full_name || "",
          p.task?.title || "",
          p.amount,
          p.platform_fee,
          p.status,
          p.escrow_status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <>
      <SEOHead title="Payment Management - Admin" description="Manage platform payments" />
      <AdminLayout title="Payment Management" description="View and manage all platform payments, hold/release funds">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Platform Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${stats.totalPlatformFees.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Held
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.heldPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completedPayments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Refunded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.refundedPayments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by payer, payee, or task..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={escrowFilter} onValueChange={setEscrowFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Escrow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Escrow</SelectItem>
                  <SelectItem value="held">Held</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportPayments}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Payer</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Escrow</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(payment.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {payment.task?.title || "N/A"}
                      </TableCell>
                      <TableCell>{payment.payer?.full_name || "N/A"}</TableCell>
                      <TableCell>{payment.payee?.full_name || "N/A"}</TableCell>
                      <TableCell className="font-medium">${payment.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">
                        ${payment.platform_fee.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getEscrowColor(payment.escrow_status)}>
                          {payment.escrow_status || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/task/${payment.task_id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Task
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {payment.escrow_status !== "held" && payment.status !== "refunded" && (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "hold", payment })}
                                className="text-orange-600"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Hold Payment
                              </DropdownMenuItem>
                            )}
                            {payment.escrow_status === "held" && (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "release", payment })}
                                className="text-green-600"
                              >
                                <Unlock className="h-4 w-4 mr-2" />
                                Release Payment
                              </DropdownMenuItem>
                            )}
                            {payment.status !== "refunded" && payment.status !== "completed" && (
                              <DropdownMenuItem
                                onClick={() => setActionDialog({ type: "refund", payment })}
                                className="text-red-600"
                              >
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Refund Payment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Hold Payment Dialog */}
        <Dialog
          open={actionDialog.type === "hold"}
          onOpenChange={() => {
            setActionDialog({ type: null, payment: null });
            setActionReason("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <Lock className="h-5 w-5" />
                Hold Payment
              </DialogTitle>
              <DialogDescription>
                This will place the payment of ${actionDialog.payment?.payout_amount.toFixed(2)} on hold. 
                The payee will be notified.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason for holding payment (optional)..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, payment: null })}>
                Cancel
              </Button>
              <Button onClick={handleHoldPayment} className="bg-orange-600 hover:bg-orange-700">
                <Lock className="h-4 w-4 mr-2" />
                Hold Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Release Payment Dialog */}
        <Dialog
          open={actionDialog.type === "release"}
          onOpenChange={() => {
            setActionDialog({ type: null, payment: null });
            setActionReason("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Unlock className="h-5 w-5" />
                Release Payment
              </DialogTitle>
              <DialogDescription>
                This will release the payment of ${actionDialog.payment?.payout_amount.toFixed(2)} to the payee.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, payment: null })}>
                Cancel
              </Button>
              <Button onClick={handleReleasePayment} className="bg-green-600 hover:bg-green-700">
                <Unlock className="h-4 w-4 mr-2" />
                Release Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Refund Payment Dialog */}
        <Dialog
          open={actionDialog.type === "refund"}
          onOpenChange={() => {
            setActionDialog({ type: null, payment: null });
            setActionReason("");
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <RefreshCcw className="h-5 w-5" />
                Refund Payment
              </DialogTitle>
              <DialogDescription>
                This will refund ${actionDialog.payment?.amount.toFixed(2)} to the payer. 
                Both parties will be notified.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason for refund (optional)..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog({ type: null, payment: null })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRefundPayment}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refund Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}
