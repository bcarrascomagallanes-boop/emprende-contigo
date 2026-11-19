import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
export type Business = Tables<'businesses'>; export type Service = Tables<'services'>; export type Offer = Tables<'offers'>;
export type Appointment = Tables<'appointments'>; export type Message = Tables<'messages'>;
export const money = (value: number) => `$${Number(value).toFixed(2)}`;
export const categories = ['Cabello', 'Uñas', 'Maquillaje', 'Cejas y pestañas', 'Spa'];
const must = <T,>(r: { data: T | null; error: { message: string } | null }) => { if (r.error) throw new Error(r.error.message); return r.data as T; };
export const useBusinesses = () => useQuery({ queryKey: ['businesses'], queryFn: async () => must(await supabase.from('businesses').select('*').order('featured', { ascending: false }).order('name')) });
export const useServices = (businessId?: string) => useQuery({ queryKey: ['services', businessId ?? 'all'], queryFn: async () => { let q = supabase.from('services').select('*').order('created_at'); if (businessId) q = q.eq('business_id', businessId); return must(await q); } });
export const useOffers = (businessId?: string) => useQuery({ queryKey: ['offers', businessId ?? 'all'], queryFn: async () => { let q = supabase.from('offers').select('*').order('created_at'); if (businessId) q = q.eq('business_id', businessId); return must(await q); } });
export const useAppointments = (filter: { businessId?: string | undefined; clientId?: string | undefined }) => useQuery({ queryKey: ['appointments', filter.businessId ?? '', filter.clientId ?? ''], enabled: !!(filter.businessId || filter.clientId), queryFn: async () => { let q = supabase.from('appointments').select('*').order('date').order('time'); if (filter.businessId) q = q.eq('business_id', filter.businessId); if (filter.clientId) q = q.eq('client_id', filter.clientId); return must(await q); } });
export const useMessages = (filter: { businessId?: string | undefined; clientId?: string | undefined }) => useQuery({ queryKey: ['messages', filter.businessId ?? '', filter.clientId ?? ''], enabled: !!(filter.businessId || filter.clientId), queryFn: async () => { let q = supabase.from('messages').select('*').order('created_at'); if (filter.businessId) q = q.eq('business_id', filter.businessId); if (filter.clientId) q = q.eq('client_id', filter.clientId); return must(await q); } });
/** Live refresh of messages and appointments for both sides of a conversation. */
export function useLiveUpdates() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase.channel(`live-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => queryClient.invalidateQueries({ queryKey: ['messages'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => queryClient.invalidateQueries({ queryKey: ['appointments'] }))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);
}
