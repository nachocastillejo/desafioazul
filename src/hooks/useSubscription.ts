import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionService, SubscriptionInfo } from '../services/subscriptionService';

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    status: 'free',
    isActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptionInfo();
    } else {
      setSubscriptionInfo({ status: 'free', isActive: false });
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptionInfo = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const info = await SubscriptionService.getSubscriptionInfo(user.id);
      setSubscriptionInfo(info);
    } catch (err) {
      setError('Error fetching subscription information');
      console.error('Error fetching subscription info:', err);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async () => {
    try {
      setError(null);
      const url = await SubscriptionService.createCheckoutSession();
      if (url) {
        window.location.href = url;
      } else {
        setError('Error creating checkout session');
      }
    } catch (err) {
      setError('Error creating checkout session');
      console.error('Error creating checkout session:', err);
    }
  };

  const isPremium = SubscriptionService.isPremiumFeatureEnabled(subscriptionInfo);
  
  const refreshSubscription = () => {
    fetchSubscriptionInfo();
  };

  const createCustomerPortalSession = async () => {
    try {
      const url = await SubscriptionService.createCustomerPortalSession();
      if (url) {
        window.location.href = url;
      } else {
        console.error("Could not create customer portal session.");
        // Optionally, set an error state to show in the UI
      }
    } catch (error) {
      console.error("Error creating customer portal session:", error);
      // Optionally, set an error state
    }
  };

  return {
    subscriptionInfo,
    loading,
    error,
    isPremium,
    createCheckoutSession,
    refreshSubscription,
    createCustomerPortalSession,
  };
} 