import { supabase } from '../lib/supabase';

export interface SubscriptionInfo {
  status: 'free' | 'active' | 'expired' | 'canceled';
  endDate?: string;
  isActive: boolean;
  cancelAtPeriodEnd?: boolean;
}

export class SubscriptionService {
  static async getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
    try {
      // Step 1: Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('subscription_status, subscription_end_date, subscription_id')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { status: 'free', isActive: false, cancelAtPeriodEnd: false };
      }

      // Step 2: Fetch subscription details if a subscription ID exists
      let cancelAtPeriodEnd = false;
      if (profile && profile.subscription_id) {
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select('cancel_at_period_end')
          .eq('stripe_subscription_id', profile.subscription_id)
          .single();
        
        if (subError && subError.code !== 'PGRST116') { // Ignore "no rows" error
          console.error('Error fetching subscription details:', subError);
        }

        if (subscription) {
          cancelAtPeriodEnd = subscription.cancel_at_period_end;
        }
      }

      // Step 3: Determine status based on all info
      const now = new Date();
      const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
      
      let status: 'free' | 'active' | 'expired' | 'canceled' = 'free';
      let isActive = false;

      if ((profile.subscription_status === 'active' || profile.subscription_status === 'premium') && endDate) {
        if (endDate > now) {
          status = cancelAtPeriodEnd ? 'canceled' : 'active';
          isActive = true;
        } else {
          status = 'expired';
          isActive = false;
        }
      } else if (profile.subscription_status === 'active' || profile.subscription_status === 'premium') {
        // If no end date but status is active/premium, consider it active
        status = 'active';
        isActive = true;
      }

      return {
        status,
        endDate: profile.subscription_end_date,
        isActive,
        cancelAtPeriodEnd,
      };
    } catch (error) {
      console.error('Error in getSubscriptionInfo:', error);
      return { status: 'free', isActive: false, cancelAtPeriodEnd: false };
    }
  }

  static async createCheckoutSession(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }

  static async createCustomerPortalSession(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await supabase.functions.invoke('create-customer-portal-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data.url;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      return null;
    }
  }

  static async getSubscriptionDetails(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching subscription details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSubscriptionDetails:', error);
      return null;
    }
  }

  static async getPaymentHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payment history:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error in getPaymentHistory:', error);
      return [];
    }
  }

  static isPremiumFeatureEnabled(subscriptionInfo: SubscriptionInfo): boolean {
    return subscriptionInfo.isActive && (subscriptionInfo.status === 'active' || subscriptionInfo.status === 'canceled');
  }

  static getTrialDaysRemaining(subscriptionInfo: SubscriptionInfo): number {
    if (!subscriptionInfo.endDate) return 0;
    
    const now = new Date();
    const endDate = new Date(subscriptionInfo.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
} 