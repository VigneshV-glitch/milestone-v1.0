import { supabase, isSupabaseConfigured } from '../supabase/client';
import { DelayEvent } from '../types';
import { activityService } from './activity.service';

export const delayService = {
  async getDelayEvents(tripId?: string): Promise<DelayEvent[]> {
    if (!isSupabaseConfigured) {
      const trips = JSON.parse(localStorage.getItem('tms_trips') || '[]');
      const allEvents: DelayEvent[] = [];
      trips.forEach((t: any) => {
        if (t.delayEvents) allEvents.push(...t.delayEvents);
      });
      return tripId ? allEvents.filter((e) => e.tripId === tripId) : allEvents;
    }

    let query = supabase.from('delay_events').select('*').order('reported_at', { ascending: false });
    if (tripId) query = query.eq('trip_id', tripId);

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      tripId: row.trip_id,
      reason: row.reason,
      severity: row.severity,
      remarks: row.remarks || '',
      reportedBy: row.reported_by,
      reportedAt: row.reported_at,
      estimatedRecovery: row.estimated_recovery,
      status: row.status,
    }));
  },

  async reportDelay(delayEvent: DelayEvent): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('delay_events').insert({
        id: delayEvent.id,
        trip_id: delayEvent.tripId,
        reason: delayEvent.reason,
        severity: delayEvent.severity,
        remarks: delayEvent.remarks,
        reported_by: delayEvent.reportedBy,
        reported_at: delayEvent.reportedAt || new Date().toISOString(),
        estimated_recovery: delayEvent.estimatedRecovery || null,
        status: 'Open',
      });

      if (error) return { success: false, error: error.message };

      // Update trip delay status
      await supabase
        .from('trips')
        .update({
          status: 'Delayed',
          delay_reason: delayEvent.reason,
          status_color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        })
        .eq('id', delayEvent.tripId);
    }

    await activityService.logActivity(
      `Delay reported for Trip ${delayEvent.tripId}: ${delayEvent.reason} (${delayEvent.severity})`,
      'error'
    );
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },

  async resolveDelay(delayId: string, remarks?: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('delay_events')
        .update({
          status: 'Resolved',
          remarks: remarks ? `Resolved: ${remarks}` : 'Resolved',
        })
        .eq('id', delayId);

      if (error) return { success: false, error: error.message };
    }

    await activityService.logActivity(`Delay event ${delayId} marked resolved`, 'success');
    window.dispatchEvent(new Event('tms_data_changed'));
    return { success: true };
  },
};
