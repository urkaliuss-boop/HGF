// Supabase Edge Function: Create Enot.io Invoice
// Deploy: supabase functions deploy create-payment --no-verify-jwt
// Secrets: supabase secrets set ENOT_SHOP_ID=your_id ENOT_SECRET_KEY=key_1

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { amount, user_id, success_url, fail_url } = await req.json();

        if (!amount || !user_id || amount < 100) {
            return new Response(
                JSON.stringify({ error: "Минимальная сумма: 100₽" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const SHOP_ID = Deno.env.get("ENOT_SHOP_ID");
        const SECRET_KEY = Deno.env.get("ENOT_SECRET_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        if (!SHOP_ID || !SECRET_KEY) {
            return new Response(
                JSON.stringify({ error: "Enot.io не настроена (нет ключей)" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Generate unique order ID
        const orderId = `order_${user_id.slice(0, 8)}_${Date.now()}`;
        const currency = "RUB";

        // Save payment to database first
        await supabase.from("payments").insert({
            user_id,
            amount,
            yookassa_id: orderId, // using yookassa_id column to store our order_id as foreign key
            status: "pending",
        });

        // Webhook URL
        const webhookUrl = `${SUPABASE_URL}/functions/v1/enot-webhook`;

        // Create invoice via Enot API
        const enotResponse = await fetch("https://api.enot.io/invoice/create", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "x-api-key": SECRET_KEY
            },
            body: JSON.stringify({
                amount: amount,
                order_id: orderId,
                currency: currency,
                shop_id: SHOP_ID,
                hook_url: webhookUrl,
                success_url: success_url || "https://noxiss.work/business-cabinet",
                fail_url: fail_url || "https://noxiss.work/business-cabinet",
                comment: `Пополнение баланса платформы - ${amount} RUB`
            }),
        });

        const enotData = await enotResponse.json();

        if (!enotResponse.ok || !enotData.data?.url) {
            console.error("Enot.io error:", enotData);
            return new Response(
                JSON.stringify({ error: "Ошибка создания платежа Enot", details: enotData }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                payment_url: enotData.data.url,
                invoice_id: orderId,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
