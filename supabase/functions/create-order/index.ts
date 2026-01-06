import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
  quantity: number;
  customization?: string;
}

interface OrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  deliveryMethod: string;
  cartItems: CartItem[];
  totalAmount: number;
  proofOfPaymentUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const orderData: OrderRequest = await req.json();
    console.log("Creating order:", orderData);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        delivery_method: orderData.deliveryMethod,
        total_amount: orderData.totalAmount,
        proof_of_payment_url: orderData.proofOfPaymentUrl,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw orderError;
    }

    // Create order items
    const orderItems = orderData.cartItems.map(item => ({
      order_id: order.id,
      product_name: item.product.name,
      product_description: item.product.description,
      quantity: item.quantity,
      price: item.product.price,
      customization: item.customization,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }

    // Send email notification
    const itemsList = orderData.cartItems
      .map(item => `- ${item.product.name} (Qty: ${item.quantity}) - $${item.product.price}${item.customization ? ` - ${item.customization}` : ''}`)
      .join('\n');

    const emailHtml = `
      <h2>New Order Received! 🛍️</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${orderData.customerName}</p>
      <p><strong>Email:</strong> ${orderData.customerEmail}</p>
      <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
      <p><strong>Address:</strong> ${orderData.customerAddress}</p>
      <p><strong>Delivery Method:</strong> ${orderData.deliveryMethod}</p>
      
      <h3>Order Items:</h3>
      <pre>${itemsList}</pre>
      
      <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
      
      ${orderData.proofOfPaymentUrl ? `<p><strong>Proof of Payment:</strong> <a href="${orderData.proofOfPaymentUrl}">View Image</a></p>` : ''}
      
      <p>Please process this order as soon as possible.</p>
    `;

    // Send email to store owner (you can change this email)
    const { error: emailError } = await resend.emails.send({
      from: "GOAT Store <onboarding@resend.dev>",
      to: [orderData.customerEmail], // Change this to your store email
      subject: `New Order #${order.id.slice(0, 8)} - $${orderData.totalAmount}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the order creation if email fails
    }

    console.log("Order created successfully:", order.id);

    return new Response(
      JSON.stringify({ success: true, orderId: order.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-order function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);