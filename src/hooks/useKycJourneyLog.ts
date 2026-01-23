import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type KycEventType =
  | 'registration.started'
  | 'registration.step_completed'
  | 'registration.submitted'
  | 'registration.success'
  | 'registration.error'
  | 'registration.api_error'
  | 'kyc.link_received'
  | 'kyc.link_clicked'
  | 'kyc.retry_requested'
  | 'kyc.email_sent'  // Dr Green confirms KYC email was sent to client
  | 'email.requested';

export interface KycEventData {
  step?: number;
  stepName?: string;
  hasKycLink?: boolean;
  countryCode?: string;
  error?: string;
  [key: string]: unknown;
}

export function useKycJourneyLog() {
  const logEvent = useCallback(async (
    eventType: KycEventType,
    clientId: string = 'pending',
    eventData: KycEventData = {}
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[KYC Journey] Cannot log event - no user');
        return;
      }

      // Use type assertion since types may not be synced yet
      const { error } = await (supabase.from('kyc_journey_logs') as any).insert({
        user_id: user.id,
        client_id: clientId,
        event_type: eventType,
        event_source: 'client',
        event_data: eventData,
      });

      if (error) {
        console.warn('[KYC Journey] Failed to log event:', error);
      } else {
        console.log(`[KYC Journey] Logged: ${eventType}`, eventData);
      }
    } catch (error) {
      console.warn('[KYC Journey] Error logging event:', error);
    }
  }, []);

  return { logEvent };
}
