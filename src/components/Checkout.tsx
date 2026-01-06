import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, CheckCircle, Package, Truck } from "lucide-react";
import { CartItem } from "./Cart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onOrderComplete: () => void;
}

interface OrderForm {
  fullName: string;
  whatsappNumber: string;
  deliveryMethod: "collect" | "delivery";
  address: string;
  proofOfPayment: File | null;
}

export default function Checkout({
  isOpen,
  onClose,
  items,
  total,
  onOrderComplete,
}: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<OrderForm>({
    fullName: "",
    whatsappNumber: "",
    deliveryMethod: "collect",
    address: "",
    proofOfPayment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setForm({ ...form, proofOfPayment: file });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image or PDF file",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let proofOfPaymentUrl = "";
      
      // Upload proof of payment file if provided
      if (form.proofOfPayment) {
        const fileExt = form.proofOfPayment.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('order-proofs')
          .upload(fileName, form.proofOfPayment);
          
        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('order-proofs')
          .getPublicUrl(fileName);
          
        proofOfPaymentUrl = publicUrl;
      }

      // Prepare order data
      const orderData = {
        customerName: form.fullName,
        customerEmail: `${form.whatsappNumber}@whatsapp.local`, // Using WhatsApp as email placeholder
        customerPhone: form.whatsappNumber,
        customerAddress: form.deliveryMethod === "delivery" ? form.address : "Store Pickup",
        deliveryMethod: form.deliveryMethod === "collect" ? "pickup" : "delivery",
        cartItems: items.map(item => ({
          id: item.cartId,
          product: {
            id: item.cartId,
            name: item.name,
            description: item.description || "",
            price: item.price,
          },
          quantity: item.quantity,
          customization: item.customization,
        })),
        totalAmount: total,
        proofOfPaymentUrl,
      };

      // Call the edge function to create order
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: orderData,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Order Submitted Successfully!",
        description: `Order #${(data.orderId || '').slice(0, 8)} has been created. We'll contact you on WhatsApp to confirm.`,
      });
      
      setIsSubmitting(false);
      onOrderComplete();
      onClose();
      
      // Reset form
      setForm({
        fullName: "",
        whatsappNumber: "",
        deliveryMethod: "collect",
        address: "",
        proofOfPayment: null,
      });
      setStep(1);
      
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast({
        title: "Order Submission Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = form.fullName && form.whatsappNumber;
  const canProceedToStep3 = canProceedToStep2 && (form.deliveryMethod === "collect" || form.address);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-gold">Complete Your Order</DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.cartId} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                    {item.customization && " (Custom)"}
                  </span>
                  <span>R{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-gold">R{total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Customer Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-6 h-6 bg-gold text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              Customer Information
            </h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-input border-border"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  placeholder="+27 XX XXX XXXX"
                  className="bg-input border-border"
                />
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!canProceedToStep2}
              className="w-full"
              variant="red"
            >
              Continue to Delivery
            </Button>
          </div>
        )}

        {/* Step 2: Delivery Method */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-6 h-6 bg-gold text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              Delivery Method
            </h3>
            
            <RadioGroup
              value={form.deliveryMethod}
              onValueChange={(value: "collect" | "delivery") =>
                setForm({ ...form, deliveryMethod: value })
              }
            >
              <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                <RadioGroupItem value="collect" id="collect" />
                <Label htmlFor="collect" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Package className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Collection</div>
                    <div className="text-sm text-muted-foreground">
                      Pick up from our store (Free)
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-4 border border-border rounded-lg">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Truck className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Delivery</div>
                    <div className="text-sm text-muted-foreground">
                      We'll deliver to your address
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {form.deliveryMethod === "delivery" && (
              <div>
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Enter your full delivery address including street, city, and postal code"
                  className="bg-input border-border"
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
                className="flex-1"
                variant="red"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Proof of Payment */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-6 h-6 bg-gold text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              Proof of Payment
            </h3>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Payment Details:</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Please make payment of <strong className="text-gold">R{total.toFixed(2)}</strong> to:
              </p>
              <div className="text-sm space-y-1">
                <p><strong>Bank:</strong> Capitec</p>
                <p><strong>Account:</strong> GOAT Clothing</p>
                <p><strong>Account Number:</strong> 1234567890</p>
                <p><strong>Reference:</strong> {form.fullName}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="proof">Upload Proof of Payment *</Label>
              <div className="mt-1">
                <input
                  id="proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="proof"
                  className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors"
                >
                  {form.proofOfPayment ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-500">{form.proofOfPayment.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Click to upload image or PDF</span>
                    </>
                  )}
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.proofOfPayment || isSubmitting}
                className="flex-1"
                variant="premium"
              >
                {isSubmitting ? "Submitting..." : "Complete Order"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}