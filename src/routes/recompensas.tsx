import { createFileRoute } from '@tanstack/react-router';
import { CustomerRewards } from '@/components/customer-app';
import { customerHead } from '@/lib/customer-catalog';
export const Route = createFileRoute('/recompensas')({ head: () => customerHead('Mis recompensas', 'Beneficios para clientas de BiAn Beauty.'), component: CustomerRewards });