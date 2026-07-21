// Supabase Edge Function: YooKassa Webhook
// Deploy: supabase functions deploy yukassa-webhook --no-verify-jwt
// В ЮKassa Dashboard → Интеграция → HTTP-уведомления → URL:
// https://<YOUR_PROJECT>.supabase.co/functions/v1/yukassa-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        const body = await req.json();

        console.log("Webhook received:", JSON.stringify(body));

        // YooKassa sends notification with event type
        if (body.event !== "payment.succeeded") {
            // Handle cancellations
            if (body.event === "payment.canceled") {
                const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
                const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
                const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

                await supabase
                    .from("payments")
                    .update({ status: "cancelled" })
                    .eq("yookassa_id", body.object.id);
            }
            return new Response("OK", { status: 200 });
        }

        const payment = body.object;
        const amount = Math.floor(parseFloat(payment.amount.value));
        const yookassaId = payment.id;
        const userId = payment.metadata?.user_id;

        if (!userId) {
            console.error("No user_id in metadata");
            return new Response("No user_id", { status: 400 });
        }

        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        // Check if payment was already processed (idempotency)
        const { data: existingPayment } = await supabase
            .from("payments")
            .select("status")
            .eq("yookassa_id", yookassaId)
            .single();

        if (existingPayment?.status === "succeeded") {
            console.log("Payment already processed:", yookassaId);
            return new Response("Already processed", { status: 200 });
        }

        // Update payment status
        await supabase
            .from("payments")
            .update({ status: "succeeded" })
            .eq("yookassa_id", yookassaId);

        // Add balance to user
        const { data: profile } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", userId)
            .single();

        if (profile) {
            const newBalance = (profile.balance || 0) + amount;
            await supabase
                .from("profiles")
                .update({ balance: newBalance })
                .eq("id", userId);

            console.log(`Balance updated for ${userId}: +${amount}₽ → ${newBalance}₽`);

            // Send notification
            await supabase.from("notifications").insert({
                user_id: userId,
                title: "💰 Баланс пополнен",
                message: `На ваш счёт зачислено ${amount}₽. Новый баланс: ${newBalance}₽`,
                type: "payment",
            });
        }

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Internal error", { status: 500 });
    }
});
