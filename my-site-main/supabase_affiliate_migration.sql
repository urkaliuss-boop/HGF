-- Add referral fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_balance NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_earned_from_refs NUMERIC DEFAULT 0 NOT NULL;

-- 1. Create a function to handle B2C referral earnings (Tasks)
-- This function will be triggered when a task is marked as 'approved' in task_submissions
CREATE OR REPLACE FUNCTION handle_b2c_referral_earnings()
RETURNS trigger AS $$
DECLARE
    referrer_id UUID;
    task_price NUMERIC;
    bonus NUMERIC;
BEGIN
    -- Only process if status changed to approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        
        -- Get the inviter (referrer) of the user who completed the task
        SELECT invited_by INTO referrer_id FROM public.profiles WHERE id = NEW.worker_id;
        
        -- If there is a referrer
        IF referrer_id IS NOT NULL THEN
            -- Get the task price
            SELECT price INTO task_price FROM public.tasks WHERE id = NEW.task_id;
            
            IF task_price IS NOT NULL THEN
                -- Calculate bonus (5% for B2C tasks)
                bonus := task_price * 0.05;
                
                -- Update the referrer's balance and total earned
                UPDATE public.profiles
                SET 
                    referral_balance = referral_balance + bonus,
                    balance = balance + bonus,
                    total_earned_from_refs = total_earned_from_refs + bonus
                WHERE id = referrer_id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists to avoid errors on reapplying
DROP TRIGGER IF EXISTS on_task_approved_referral_bonus ON public.task_submissions;

-- Create trigger for B2C referrals
CREATE TRIGGER on_task_approved_referral_bonus
AFTER UPDATE OF status ON public.task_submissions
FOR EACH ROW
EXECUTE FUNCTION handle_b2c_referral_earnings();


-- 2. Create a function to handle B2B referral earnings (Payments/Top-ups)
-- This function will be triggered when a payment is marked as 'succeeded' in payments
CREATE OR REPLACE FUNCTION handle_b2b_referral_earnings()
RETURNS trigger AS $$
DECLARE
    referrer_id UUID;
    bonus NUMERIC;
BEGIN
    -- Only process if status changed to succeeded
    IF NEW.status = 'succeeded' AND (OLD.status IS NULL OR OLD.status != 'succeeded') THEN
        
        -- Get the inviter (referrer) of the user who made the payment
        SELECT invited_by INTO referrer_id FROM public.profiles WHERE id = NEW.user_id;
        
        -- If there is a referrer
        IF referrer_id IS NOT NULL THEN
            -- Calculate bonus (10% for B2B payments)
            bonus := NEW.amount * 0.10;
            
            -- Update the referrer's balance and total earned
            UPDATE public.profiles
            SET 
                referral_balance = referral_balance + bonus,
                balance = balance + bonus,
                total_earned_from_refs = total_earned_from_refs + bonus
            WHERE id = referrer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_payment_succeeded_referral_bonus ON public.payments;

-- Create trigger for B2B referrals
CREATE TRIGGER on_payment_succeeded_referral_bonus
AFTER UPDATE OF status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION handle_b2b_referral_earnings();
