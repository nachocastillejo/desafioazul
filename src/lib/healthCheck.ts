import { supabase } from './supabase';

export const healthCheck = async () => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      };
    }

    return {
      status: 'healthy',
      message: 'All systems operational',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Health check exception:', error);
    return {
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Auto health check every 5 minutes in production
if (import.meta.env.PROD) {
  setInterval(async () => {
    const health = await healthCheck();
    if (health.status === 'error') {
      console.error('🚨 Production health check failed:', health);
      // Aquí podrías enviar una alerta a tu sistema de monitoreo
    }
  }, 5 * 60 * 1000); // 5 minutos
} 