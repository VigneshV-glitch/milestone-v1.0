/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trip, Vehicle, Driver } from '../types';
import { tripService } from '../services/trip.service';
import { vehicleService } from '../services/vehicle.service';
import { driverService } from '../services/driver.service';
import { activityService } from '../services/activity.service';
import { supabase, isSupabaseConfigured } from '../supabase/client';

export function useTMSData() {
  const queryClient = useQueryClient();

  // 1. Trips Query
  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripService.getTrips(),
    staleTime: 1000 * 30,
  });

  // 2. Vehicles Query
  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.getVehicles(),
    staleTime: 1000 * 30,
  });

  // 3. Drivers Query
  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driverService.getDrivers(),
    staleTime: 1000 * 30,
  });

  // 4. Activities Query
  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getActivities(),
    staleTime: 1000 * 15,
  });

  // Setup Supabase Realtime Subscriptions & Window event listeners
  useEffect(() => {
    const handleRefetch = () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_kpis'] });
    };

    window.addEventListener('tms_data_changed', handleRefetch);
    window.addEventListener('storage', handleRefetch);

    let realtimeChannel: any = null;
    if (isSupabaseConfigured) {
      const channelId = `tms-realtime-${Math.random().toString(36).substring(2, 9)}`;
      realtimeChannel = supabase
        .channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          handleRefetch();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('tms_data_changed', handleRefetch);
      window.removeEventListener('storage', handleRefetch);
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [queryClient]);

  // Mutations
  const updateTripStatusMutation = useMutation({
    mutationFn: ({ tripId, nextStatus }: { tripId: string; nextStatus: string }) =>
      tripService.updateTripStatus(tripId, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const bulkUpdateTripStatusMutation = useMutation({
    mutationFn: ({ tripIds, nextStatus }: { tripIds: string[]; nextStatus: string }) =>
      tripService.bulkUpdateTripStatus(tripIds, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const assignResourcesMutation = useMutation({
    mutationFn: ({ tripId, vehicleId, driverName }: { tripId: string; vehicleId: string; driverName: string }) =>
      tripService.assignResources(tripId, vehicleId, driverName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });

  const saveTripMutation = useMutation({
    mutationFn: (trip: Trip) => tripService.updateTrip(trip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  return {
    trips: tripsQuery.data || [],
    vehicles: vehiclesQuery.data || [],
    drivers: driversQuery.data || [],
    activities: activitiesQuery.data || [],
    isLoading: tripsQuery.isLoading || vehiclesQuery.isLoading || driversQuery.isLoading,
    updateTripStatus: (tripId: string, nextStatus: string) =>
      updateTripStatusMutation.mutateAsync({ tripId, nextStatus }),
    bulkUpdateTripStatus: (tripIds: string[], nextStatus: string) =>
      bulkUpdateTripStatusMutation.mutateAsync({ tripIds, nextStatus }),
    assignResources: (tripId: string, vehicleId: string, driverName: string) =>
      assignResourcesMutation.mutateAsync({ tripId, vehicleId, driverName }),
    saveTrip: (updatedTrip: Trip) => saveTripMutation.mutateAsync(updatedTrip),
    refresh: () => {
      tripsQuery.refetch();
      vehiclesQuery.refetch();
      driversQuery.refetch();
      activitiesQuery.refetch();
    },
  };
}
