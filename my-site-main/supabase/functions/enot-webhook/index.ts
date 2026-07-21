// Supabase Edge Function: Enot.io Webhook
// Deploy: supabase functions deploy enot-webhook --no-verify-jwt
// Webhook URL should be set in Enot.io settings to: https://<PROJECT_REF>.supabase.co/functions/v1/enot-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function hmacSha256(key: string, data: string): Promise<string> {
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
    return Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        // Enot requires matching the exact raw body string for the signature,
        // so we read the raw text first before parsing JSON
        const rawBodyStr = await req.text();
        const body = JSON.parse(rawBodyStr);
        const signatureHeader = req.headers.get("x-api-sha256-signature");

        console.log("Enot webhook received for order:", body.order_id);

        const SECRET_KEY = Deno.env.get("ENOT_SECRET_KEY");

        if (!SECRET_KEY) {
            console.error("Enot.io secret key not configured");
            return new Response("Internal error", { status: 500 });
        }

        // Validate signature: HMAC-SHA256(raw_body, SECRET_KEY)
        const expectedSignature = await hmacSha256(SECRET_KEY, rawBodyStr);

        if (signatureHeader !== expectedSignature) {
            console.error("Invalid signature from Enot.io");
            return new Response("Invalid signature", { status: 403 });
        }

        // Check if payment was successful
        if (body.status !== "success") {
            console.log("Webhook payload status is not success", body.status);
            return new Response("OK", { status: 200 }); // acknowledge anyway
        }

        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const orderId = body.order_id;
        const amountStr = body.amount;

        // Find payment by order_id (stored in yookassa_id column)
        const { data: payment } = await supabase
            .from("payments")
            .select("*")
            .eq("yookassa_id", orderId)
            .single();

        if (!payment) {
            console.error("Payment not found for order:", orderId);
            return new Response("Payment not found", { status: 404 });
        }

        // Idempotency check
        if (payment.status === "succeeded") {
            console.log("Payment already processed:", orderId);
            return new Response("OK", { status: 200 });
        }

        // Update payment status
        await supabase
            .from("payments")
            .update({ status: "succeeded" })
            .eq("yookassa_id", orderId);

        // Credit user balance
        const userId = payment.user_id;
        const creditAmount = Math.floor(parseFloat(amountStr || "0"));

        const { data: profile } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", userId)
            .single();

        if (profile) {
            const newBalance = (profile.balance || 0) + creditAmount;
            await supabase
                .from("profiles")
                .update({ balance: newBalance })
                .eq("id", userId);

            console.log(`Balance updated for ${userId}: +${creditAmount}₽ → ${newBalance}₽`);

            // Send notification
            await supabase.from("notifications").insert({
                user_id: userId,
                title: "💰 Баланс пополнен",
                message: `На ваш счёт зачислено ${creditAmount}₽ (через Enot). Новый баланс: ${newBalance}₽`,
                type: "payment",
            });
        }

        // Return a standard 200 OK
        return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Internal error", { status: 500 });
    }
});
