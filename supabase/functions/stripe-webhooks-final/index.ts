import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature'
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16'
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  console.log(`--- New Webhook Received ---`);

  try {
    const signature = req.headers.get('Stripe-Signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return new Response('Webhook secret not configured.', {
        status: 400
      });
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );
      console.log(`Event [${event.id}] of type [${event.type}] verified.`);
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, {
        status: 400
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const fullSubscription = await stripe.subscriptions.retrieve(subscription.id);
        await upsertSubscriptionRecord(supabaseClient, fullSubscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscriptionFromInvoice = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await upsertSubscriptionRecord(supabaseClient, subscriptionFromInvoice);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log(`--- Webhook Handled Successfully ---`);
    return new Response(
      JSON.stringify({
        received: true
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error(`--- Webhook Handler Error: ${error.message} ---`, error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});

// --- VERSIÓN CON MÁS LOGS ---
async function upsertSubscriptionRecord(supabase: any, subscription: Stripe.Subscription) {
  console.log(`Processing subscription [${subscription.id}] with status [${subscription.status}]`);
  console.log('Full subscription object received:', JSON.stringify(subscription, null, 2));

  const userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    console.error(`No supabase_user_id in metadata for subscription [${subscription.id}]`);
    return;
  }

  const subscriptionData = {
    user_id: userId,
    status: subscription.status,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null
  };

  // 1. Log para ver qué vamos a guardar
  console.log('Data for subscriptions upsert:', subscriptionData);

  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'stripe_subscription_id'
    });

  if (upsertError) {
    console.error(`Error upserting subscription [${subscription.id}]:`, upsertError);
    return;
  }

  console.log(`Successfully upserted subscription [${subscription.id}]`);

  // 2. Crear objeto para actualizar el perfil y loguearlo
  const profileUpdateData: any = {
    subscription_status: subscription.status,
    subscription_id: subscription.id,
    customer_id: subscription.customer as string,
    subscription_end_date: subscriptionData.current_period_end
  };

  if (subscription.status === 'active' || subscription.status === 'canceled') {
    profileUpdateData.free_tests_taken = 0;
  }

  console.log('Data for user_profiles update:', profileUpdateData);

  const { error: profileError } = await supabase
    .from('user_profiles')
    .update(profileUpdateData)
    .eq('id', userId);

  if (profileError) {
    console.error(`Error updating user profile for user [${userId}]:`, profileError);
  } else {
    console.log(`Successfully updated user profile for user [${userId}].`);
  }
} 