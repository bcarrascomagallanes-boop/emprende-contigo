import { createFileRoute } from '@tanstack/react-router';
import { CustomerBookings } from '@/components/customer-app';
import { customerHead } from '@/lib/customer-catalog';
export const Route = createFileRoute('/reservas')({ head: () => customerHead('Mis reservas', 'Consulta tus citas de belleza en BiAn Beauty.'), component: CustomerBookings });