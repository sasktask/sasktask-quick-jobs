import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Download, Loader2 } from "lucide-react";

interface InvoiceViewerProps {
  bookingId: string;
  paymentId?: string;
}

export const InvoiceViewer = ({ bookingId, paymentId }: InvoiceViewerProps) => {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [bookingId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("invoices" as any)
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();

      setInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: { bookingId, paymentId }
      });

      if (error) throw error;

      toast({
        title: "Invoice Generated",
        description: `Invoice #${data.invoice.invoice_number} created successfully`,
      });

      setInvoice(data.invoice);
      
      // Download HTML invoice
      const blob = new Blob([data.html], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${data.invoice.invoice_number}.html`;
      a.click();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      draft: "secondary",
      sent: "default",
      paid: "outline",
      overdue: "destructive",
      cancelled: "secondary"
    };
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice
          </CardTitle>
          <CardDescription>Generate a professional invoice for this task</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateInvoice} disabled={generating} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice #{invoice.invoice_number}
            </CardTitle>
            <CardDescription>
              Generated on {new Date(invoice.invoice_date).toLocaleDateString()}
            </CardDescription>
          </div>
          {getStatusBadge(invoice.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Due Date:</span>
            <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total Amount:</span>
            <p className="font-semibold text-primary text-lg">${invoice.total_amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Fee:</span>
            <span>-${invoice.platform_fee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (GST):</span>
            <span>-${invoice.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-bold">Total:</span>
            <span className="font-bold text-primary">${invoice.total_amount.toFixed(2)}</span>
          </div>
        </div>

        <Button onClick={generateInvoice} variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
      </CardContent>
    </Card>
  );
};
