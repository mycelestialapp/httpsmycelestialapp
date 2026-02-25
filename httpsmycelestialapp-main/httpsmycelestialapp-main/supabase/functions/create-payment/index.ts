import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOPUP_PRICES: Record<string, { priceId: string; dust: number }> = {
  dust_50:  { priceId: "price_1T3ultJl2234Nccs4CaRPn9C", dust: 50 },
  dust_150: { priceId: "price_1T3uoYJl2234Nccs85IxiHK0", dust: 150 },
  dust_500: { priceId: "price_1T3uojJl2234Nccsupg68tDb", dust: 500 },
  plan_daily: { priceId: "price_1T4DflJl2234Nccsivm3ykKG", dust: 0 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { package: pkg } = await req.json();
    const topup = TOPUP_PRICES[pkg];
    if (!topup) throw new Error("Invalid package");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const BASE_URL = "https://mycelestial.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: topup.priceId, quantity: 1 }],
      mode: "payment",
      locale: "auto",
      automatic_tax: { enabled: false },
      success_url: topup.dust > 0
        ? `${BASE_URL}/payment-success?dust=${topup.dust}&session_id={CHECKOUT_SESSION_ID}`
        : `${BASE_URL}/payment-success?plan=daily&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/subscribe`,
      metadata: {
        user_id: user.id,
        dust_amount: topup.dust.toString(),
        package: pkg,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
