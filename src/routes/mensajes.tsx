import { createFileRoute } from '@tanstack/react-router';
import { CustomerMessages } from '@/components/customer-app';
import { customerHead } from '@/lib/customer-catalog';
export const Route = createFileRoute('/mensajes')({ head: () => customerHead('Mis mensajes', 'Conversaciones con especialistas de BiAn Beauty.'), component: CustomerMessages });