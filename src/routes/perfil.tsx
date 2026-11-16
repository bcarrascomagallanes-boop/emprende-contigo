import { createFileRoute } from '@tanstack/react-router';
import { CustomerProfile } from '@/components/customer-app';
import { customerHead } from '@/lib/customer-catalog';
export const Route = createFileRoute('/perfil')({ head: () => customerHead('Mi perfil', 'Tu espacio personal en BiAn Beauty.'), component: CustomerProfile });