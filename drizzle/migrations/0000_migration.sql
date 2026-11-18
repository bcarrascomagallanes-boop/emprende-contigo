create type public.app_role as enum ('admin','emprendedor','cliente');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique,
  name text not null,
  owner_name text not null default '',
  description text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.businesses to anon;
grant select, insert, update, delete on public.businesses to authenticated;
grant all on public.businesses to service_role;
alter table public.businesses enable row level security;

create or replace function public.can_manage_business(_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(),'admin') or exists (select 1 from public.businesses where id = _business_id and owner_id = auth.uid())
$$;

create policy "businesses public read" on public.businesses for select to anon, authenticated using (true);
create policy "businesses owner insert" on public.businesses for insert to authenticated with check (owner_id = auth.uid() and public.has_role(auth.uid(),'emprendedor'));
create policy "businesses manage update" on public.businesses for update to authenticated using (public.can_manage_business(id)) with check (public.can_manage_business(id));
create policy "businesses admin delete" on public.businesses for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  category text not null default 'Cabello',
  price numeric(10,2) not null default 0,
  minutes int not null default 60,
  created_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "services public read" on public.services for select to anon, authenticated using (true);
create policy "services manage insert" on public.services for insert to authenticated with check (public.can_manage_business(business_id));
create policy "services manage update" on public.services for update to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));
create policy "services manage delete" on public.services for delete to authenticated using (public.can_manage_business(business_id));

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text not null default '',
  discount int not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.offers to anon;
grant select, insert, update, delete on public.offers to authenticated;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "offers public read" on public.offers for select to anon, authenticated using (active or public.can_manage_business(business_id));
create policy "offers manage insert" on public.offers for insert to authenticated with check (public.can_manage_business(business_id));
create policy "offers manage update" on public.offers for update to authenticated using (public.can_manage_business(business_id)) with check (public.can_manage_business(business_id));
create policy "offers manage delete" on public.offers for delete to authenticated using (public.can_manage_business(business_id));

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  price numeric(10,2) not null default 0,
  client_id uuid not null,
  client_name text not null default '',
  date date not null,
  time text not null,
  status text not null default 'pendiente',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.appointments to authenticated;
grant all on public.appointments to service_role;
alter table public.appointments enable row level security;
create policy "appointments read" on public.appointments for select to authenticated using (client_id = auth.uid() or public.can_manage_business(business_id));
create policy "appointments client insert" on public.appointments for insert to authenticated with check (client_id = auth.uid());
create policy "appointments update" on public.appointments for update to authenticated using (client_id = auth.uid() or public.can_manage_business(business_id)) with check (client_id = auth.uid() or public.can_manage_business(business_id));
create policy "appointments delete" on public.appointments for delete to authenticated using (public.can_manage_business(business_id));

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  client_id uuid not null,
  client_name text not null default '',
  sender_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);
grant select, insert on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "messages read" on public.messages for select to authenticated using (client_id = auth.uid() or public.can_manage_business(business_id));
create policy "messages insert" on public.messages for insert to authenticated with check (sender_id = auth.uid() and (client_id = auth.uid() or public.can_manage_business(business_id)));

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.appointments;

-- Admin only for the two authorized, verified emails
create or replace function public.grant_admin_if_authorized()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email_confirmed_at is not null
     and lower(new.email) in ('bcarrascomagallanes@gmail.com','angieeugenia09@gmail.com') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _role text := coalesce(new.raw_user_meta_data->>'role', 'cliente');
  _name text := coalesce(new.raw_user_meta_data->>'full_name', '');
begin
  if _role not in ('cliente','emprendedor') then _role := 'cliente'; end if;
  insert into public.profiles (id, full_name, email) values (new.id, _name, coalesce(new.email,''));
  insert into public.user_roles (user_id, role) values (new.id, _role::public.app_role) on conflict do nothing;
  if _role = 'emprendedor' then
    insert into public.businesses (owner_id, name, owner_name)
    values (new.id, coalesce(nullif(new.raw_user_meta_data->>'business_name',''), 'Mi negocio'), _name);
  end if;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.grant_admin_if_authorized();
create trigger on_auth_user_confirmed_admin after update of email_confirmed_at on auth.users for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.grant_admin_if_authorized();

-- Featured business (Gina) with her services
insert into public.businesses (id, owner_id, name, owner_name, description, featured) values
 ('00000000-0000-0000-0000-00000000a001', null, 'Gina Magallanes Studio', 'Gina Magallanes', 'Keratinas, alisados, manicure y pedicure spa.', true);
insert into public.services (business_id, name, category, price, minutes) values
 ('00000000-0000-0000-0000-00000000a001','Alisado de Keratina Orgánica Premium','Cabello',80,150),
 ('00000000-0000-0000-0000-00000000a001','Manicura Rusa + Spa Rejuvenecedor','Uñas',18,60),
 ('00000000-0000-0000-0000-00000000a001','Pedicura Clínica + Tratamiento de Parafina','Uñas',25,60),
 ('00000000-0000-0000-0000-00000000a001','Tratamiento Sellador de Brillo Espejo','Cabello',35,60);
insert into public.offers (business_id, title, description, discount) values
 ('00000000-0000-0000-0000-00000000a001','Martes de uñas','Descuento en manicure y pedicure los martes.',20);