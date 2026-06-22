-- 
-- SUPABASE DATABASE SCHEMAS & RLS POLICIES FOR AJUDAE
-- Run these queries in your Supabase SQL Editor to bootstrap the database completely.
-- 

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILE TABLE (Linked to auth.users)
drop table if exists public.users_profile cascade;
create table if not exists public.users_profile (
  id uuid references auth.users on delete cascade primary key,
  nome_completo text not null,
  cpf text not null unique,
  cidade text not null,
  estado varchar(2) not null,
  telefone text not null,
  email text not null unique,
  chave_pix text,
  banco_pix text,
  is_admin boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on users_profile
alter table public.users_profile enable row level security;

-- Helper security definer function to avoid recursive RLS policy loops on users_profile
create or replace function public.is_admin()
returns boolean security definer
set search_path = public
language plpgsql as $$
begin
  return exists (
    select 1 from public.users_profile
    where id = auth.uid() and is_admin = true
  );
end;
$$;

-- Policies for profiles
drop policy if exists "Permitir leitura para si mesmo ou admin" on public.users_profile;
create policy "Permitir leitura para si mesmo ou admin" on public.users_profile
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "Permitir updates apenas por si mesmo ou admin" on public.users_profile;

-- A política original permitia que o usuário atualizasse `is_admin`, agora deve ser estrita, impedindo atualização do `is_admin` exceto se já for admin. Essa restrição é normalmente feita bloqueando colunas, mas como o Supabase RLS no PostgreSQL não permite RLS por coluna diretamente no update, o recomendado é usar check constraints em views ou, via RLS, verificar a transição.
-- Solução ideal via function para não escalonar:
CREATE OR REPLACE FUNCTION public.check_is_admin_update() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_admin = true AND NOT public.is_admin() THEN
            NEW.is_admin := false;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.is_admin <> OLD.is_admin AND NOT public.is_admin() THEN
            RAISE EXCEPTION 'Acesso negado: Somente administradores podem alterar o status de admin.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_is_admin_escalation ON public.users_profile;
CREATE TRIGGER prevent_is_admin_escalation
  BEFORE INSERT OR UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE PROCEDURE public.check_is_admin_update();

create policy "Permitir updates apenas por si mesmo ou admin" on public.users_profile
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "Permitir insercao pela propria conta" on public.users_profile;
create policy "Permitir insercao pela propria conta" on public.users_profile
  for insert with check (auth.uid() = id or public.is_admin());


-- 2. GROUPS TABLE (Coluna A - Available templates created by Admin)
drop table if exists public.groups cascade;
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  nome_grupo text not null,
  valor_base numeric(10,2) not null,
  valor_ativacao numeric(10,2) not null,
  status text default 'disponivel' not null, -- disponivel, aguardando_ativacao
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.groups enable row level security;

drop policy if exists "Qualquer usuario autenticado pode ver os grupos do admin" on public.groups;
create policy "Qualquer usuario autenticado pode ver os grupos do admin" on public.groups
  for select using (auth.role() = 'authenticated');

drop policy if exists "Apenas admin pode gerenciar grupos do admin" on public.groups;
create policy "Apenas admin pode gerenciar grupos do admin" on public.groups
  for all using (public.is_admin());


-- 3. ACTIVE GROUPS TABLE (Coluna B - Active groups cloned on pay)
drop table if exists public.active_groups cascade;
create table if not exists public.active_groups (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.groups(id) on delete set null,
  nome_grupo text not null,
  valor_base numeric(10,2) not null,
  valor_ativacao numeric(10,2) not null,
  status text default 'ativo' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  activated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.active_groups enable row level security;

drop policy if exists "Qualquer autenticado pode ver os grupos ativos" on public.active_groups;
create policy "Qualquer autenticado pode ver os grupos ativos" on public.active_groups
  for select using (auth.role() = 'authenticated');

drop policy if exists "Apenas admin pode gerenciar grupos ativos diretamente" on public.active_groups;
create policy "Apenas admin pode gerenciar grupos ativos diretamente" on public.active_groups
  for all using (public.is_admin());


-- 4. ACTIVE GROUP MEMBERS (Participants within Coluna A or Coluna B)
drop table if exists public.active_group_members cascade;
create table if not exists public.active_group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade,             -- templates
  active_group_id uuid references public.active_groups(id) on delete cascade, -- actual cloned active groups
  user_id uuid references public.users_profile(id) on delete cascade not null,
  nome_completo text not null,
  cidade text not null,
  estado varchar(2) not null,
  position integer not null check (position >= 1 and position <= 4),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.active_group_members enable row level security;

drop policy if exists "Autenticados podem ler membros de grupos" on public.active_group_members;
create policy "Autenticados podem ler membros de grupos" on public.active_group_members
  for select using (auth.role() = 'authenticated');

drop policy if exists "Apenas admin pode gerenciar participantes manualmente" on public.active_group_members;
create policy "Apenas admin pode gerenciar participantes manualmente" on public.active_group_members
  for all using (public.is_admin());


-- 5. COPIABLE INVITES
drop table if exists public.invites cascade;
create table if not exists public.invites (
  id uuid default gen_random_uuid() primary key,
  active_group_id uuid references public.active_groups(id) on delete cascade not null,
  inviter_user_id uuid references public.users_profile(id) on delete cascade not null,
  invite_code text not null unique,
  max_uses integer default 10 not null,
  used_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.invites enable row level security;

drop policy if exists "Qualquer autenticado pode ler convites" on public.invites;
create policy "Qualquer autenticado pode ler convites" on public.invites
  for select using (auth.role() = 'authenticated');

drop policy if exists "Qualquer autenticado pode criar seus próprios convites" on public.invites;
create policy "Qualquer autenticado pode criar seus próprios convites" on public.invites
  for insert with check (auth.uid() = inviter_user_id);

drop policy if exists "Apenas admin ou o proprio criador pode alterar o limite" on public.invites;
create policy "Apenas admin ou o proprio criador pode alterar o limite" on public.invites
  for update using (auth.uid() = inviter_user_id or public.is_admin());


-- 6. WALLET TABLE
drop table if exists public.wallet cascade;
create table if not exists public.wallet (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null unique,
  saldo_atual numeric(10,2) default 0.00 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wallet enable row level security;

drop policy if exists "Usuario le sua propria carteira" on public.wallet;
create policy "Usuario le sua propria carteira" on public.wallet
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Apenas admin altera carteira" on public.wallet;
create policy "Apenas admin altera carteira" on public.wallet
  for update using (public.is_admin());

drop policy if exists "Apenas admin insere carteira" on public.wallet;
create policy "Apenas admin insere carteira" on public.wallet
  for insert with check (public.is_admin());


-- 7. TRANSACTIONS
drop table if exists public.wallet_transactions cascade;
create table if not exists public.wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  tipo text not null, -- 'entrada', 'saida', 'saque', 'ajuste_admin_adicao', 'ajuste_admin_subtracao', 'taxa_plataforma', 'recebimento_grupo'
  valor numeric(10,2) not null,
  descricao text not null,
  related_user_id uuid references public.users_profile(id) on delete set null,
  related_group_id uuid references public.active_groups(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.wallet_transactions enable row level security;

drop policy if exists "Usuario le suas proprias transacoes" on public.wallet_transactions;
create policy "Usuario le suas proprias transacoes" on public.wallet_transactions
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Usuario nao altera transacoes" on public.wallet_transactions;
create policy "Usuario nao altera transacoes" on public.wallet_transactions
  for update using (false);

drop policy if exists "Apenas admin manipula insercao manual de transacao" on public.wallet_transactions;
create policy "Apenas admin manipula insercao manual de transacao" on public.wallet_transactions
  for insert with check (public.is_admin());


-- 8. WITHDRAWALS
drop table if exists public.withdrawals cascade;
create table if not exists public.withdrawals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  valor numeric(10,2) not null check (valor >= 25.00),
  status text default 'pendente' not null, -- pendente, aprovado, rejeitado, excluido
  transaction_id uuid references public.wallet_transactions(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone
);

alter table public.withdrawals enable row level security;

drop policy if exists "Usuario le seus saques" on public.withdrawals;
create policy "Usuario le seus saques" on public.withdrawals
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Usuario cria pedido de saque" on public.withdrawals;
create policy "Usuario cria pedido de saque" on public.withdrawals
  for insert with check (public.is_admin());

drop policy if exists "Usuario nao altera saques e admin apenas update" on public.withdrawals;
create policy "Usuario nao altera saques e admin apenas update" on public.withdrawals
  for update using (public.is_admin());


-- 9. PIX PAYMENTS
drop table if exists public.payments_pix cascade;
create table if not exists public.payments_pix (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  target_id uuid not null, -- group_id or active_group_id
  target_type text not null, -- 'disponivel', 'invite'
  txid text not null unique,
  valor numeric(10,2) not null,
  status text default 'pendente' not null, -- pendente, pago, cancelado
  qrcode text not null,
  copia_cola text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  paid_at timestamp with time zone,
  processed_at timestamp with time zone,
  locked_at timestamp with time zone
);

alter table public.payments_pix enable row level security;

drop policy if exists "Usuario le seus proprios pagamentos" on public.payments_pix;
create policy "Usuario le seus proprios pagamentos" on public.payments_pix
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Usuario inicia seus pagamentos" on public.payments_pix;
create policy "Usuario inicia seus pagamentos" on public.payments_pix
  for insert with check (auth.uid() = user_id);


drop table if exists public.user_invited_groups cascade;
create table if not exists public.user_invited_groups (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  invite_code text not null,
  invite_id uuid references public.invites(id) on delete cascade not null,
  active_group_id uuid references public.active_groups(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_invited_groups enable row level security;

drop policy if exists "Usuario le seus proprios grupos convidados" on public.user_invited_groups;
create policy "Usuario le seus proprios grupos convidados" on public.user_invited_groups
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Usuario deleta seus proprios grupos" on public.user_invited_groups;
create policy "Usuario deleta seus proprios grupos" on public.user_invited_groups
  for delete using (auth.uid() = user_id);

drop policy if exists "Apenas admin insere grupos convidados manualmente" on public.user_invited_groups;
create policy "Apenas admin insere grupos convidados manualmente" on public.user_invited_groups
  for insert with check (public.is_admin());

drop policy if exists "Usuario nao da update em grupos" on public.user_invited_groups;
create policy "Usuario nao da update em grupos" on public.user_invited_groups
  for update using (public.is_admin());

-- 10. SYSTEM NOTIFICATIONS
drop table if exists public.notifications cascade;
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_profile(id) on delete cascade not null,
  titulo text not null,
  mensagem text not null,
  valor numeric(10,2),
  is_read boolean default false not null,
  admin_message_id uuid,
  tipo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create table if not exists public.admin_messages (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  mensagem text not null,
  tipo text not null, -- 'popup' | 'bell'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_messages enable row level security;

drop policy if exists "Usuario gerencia suas notificacoes" on public.notifications;
create policy "Usuario gerencia suas notificacoes" on public.notifications
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Usuario marca suas notificacoes como lidas" on public.notifications;
create policy "Usuario marca suas notificacoes como lidas" on public.notifications
  for update using (auth.uid() = user_id);


-- 11. PLATFORM BALANCE (Audit tracker)
drop table if exists public.platform_balance cascade;
create table if not exists public.platform_balance (
  id text primary key default 'platform',
  total_recebido numeric(10,2) default 0.00 not null,
  total_distribuido numeric(10,2) default 0.00 not null,
  total_lucro numeric(10,2) default 0.00 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.platform_balance enable row level security;

drop policy if exists "Admins acessam o caixa da plataforma" on public.platform_balance;
create policy "Admins acessam o caixa da plataforma" on public.platform_balance
  for select using (public.is_admin());

CREATE OR REPLACE FUNCTION public.increment_platform_balance(
  p_received numeric,
  p_distributed numeric,
  p_profit numeric
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.platform_balance (id, total_recebido, total_distribuido, total_lucro, updated_at)
  VALUES ('platform', p_received, p_distributed, p_profit, timezone('utc'::text, now()))
  ON CONFLICT (id) DO UPDATE
  SET 
    total_recebido = public.platform_balance.total_recebido + EXCLUDED.total_recebido,
    total_distribuido = public.platform_balance.total_distribuido + EXCLUDED.total_distribuido,
    total_lucro = public.platform_balance.total_lucro + EXCLUDED.total_lucro,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- AUTOMATED TRIGGERS & UTILITIES
-- =========================================================================

-- Trigger to automatically create a user_profile and a wallet on new user sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (id, nome_completo, cpf, cidade, estado, telefone, email, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', 'Usuário Novo'),
    coalesce(new.raw_user_meta_data->>'cpf', '000.000.000-00'),
    coalesce(new.raw_user_meta_data->>'cidade', 'São Paulo'),
    coalesce(new.raw_user_meta_data->>'estado', 'SP'),
    coalesce(new.raw_user_meta_data->>'telefone', '(11) 90000-0000'),
    new.email,
    -- Match our administrator account!
    false
  );

  insert into public.wallet (user_id, saldo_atual)
  values (new.id, 0.00);

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger first to ensure it can be safely re-created
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- LOGGING & AUDITING (EFI WEBHOOKS)
-- =========================================================================

drop table if exists public.webhook_logs cascade;
create table if not exists public.webhook_logs (
  id uuid default gen_random_uuid() primary key,
  txid text,
  payment_id uuid references public.payments_pix(id) on delete set null,
  payload jsonb not null,
  status text not null, -- 'success', 'processing', 'failed'
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.webhook_logs enable row level security;
create policy "Apenas admin pode ler logs do webhook" on public.webhook_logs
  for select using (public.is_admin());

drop table if exists public.audit_logs cascade;
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users_profile(id) on delete set null,
  action text not null, -- 'CREATE_PIX', 'CANCEL_PIX', 'ACTIVATE_GROUP_FROM_PIX'
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;
create policy "Apenas admin pode ler logs de autidoria" on public.audit_logs
  for select using (public.is_admin());



-- =========================================================================
-- SECURE WITHDRAWAL FUNCTION (RACE GONDITION PREVENTER)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.request_withdrawal(p_user_id uuid, p_amount numeric, p_pix_key text, p_bank text, p_full_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet public.wallet;
    v_transaction_id uuid;
    v_withdrawal_id uuid;
BEGIN
    -- 1. Lock the wallet row to prevent race conditions
    SELECT * INTO v_wallet
    FROM public.wallet
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Carteira não encontrada.');
    END IF;

    IF v_wallet.saldo_atual < p_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Saldo insuficiente.');
    END IF;

    -- 2. Create wallet transaction record (Trigger will deduct balance safely)
    v_transaction_id := gen_random_uuid();
    INSERT INTO public.wallet_transactions (id, user_id, tipo, valor, descricao)
    VALUES (v_transaction_id, p_user_id, 'saque', -p_amount, 'Solicitação de Saque\nChave Pix: ' || p_pix_key);

    -- 4. Create withdrawal request
    v_withdrawal_id := gen_random_uuid();
    INSERT INTO public.withdrawals (id, user_id, valor, status, transaction_id)
    VALUES (v_withdrawal_id, p_user_id, p_amount, 'pendente', v_transaction_id);

    RETURN jsonb_build_object(
      'success', true,
      'withdrawal_id', v_withdrawal_id,
      'transaction_id', v_transaction_id,
      'new_balance', v_wallet.saldo_atual - p_amount
    );
END;
$$;

-- CORRECTION 1: MISSING RLS POLICIES --
drop policy if exists "Usuario insere seus proprios perfis" on public.users_profile;
create policy "Usuario insere seus proprios perfis" on public.users_profile
  for insert with check (auth.uid() = id);

drop policy if exists "Admin pode ler mensagens" on public.admin_messages;
create policy "Admin pode ler mensagens" on public.admin_messages
  for select using (public.is_admin());

drop policy if exists "Admin gerencia mensagens" on public.admin_messages;
create policy "Admin gerencia mensagens" on public.admin_messages
  for all using (public.is_admin());


-- CORRECTION 3: POSITIVE BALANCE CONSTRAINTS --
ALTER TABLE public.wallet
DROP CONSTRAINT IF EXISTS positive_balance;

ALTER TABLE public.wallet
ADD CONSTRAINT positive_balance CHECK (saldo_atual >= 0);


-- CORRECTION 2: DATABASE TRIGGERS FOR WALLET TRANSACTIONS --
CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.wallet SET saldo_atual = saldo_atual + NEW.valor WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_wallet_transaction_insert ON public.wallet_transactions;

CREATE TRIGGER on_wallet_transaction_insert
    AFTER INSERT ON public.wallet_transactions
    FOR EACH ROW EXECUTE PROCEDURE public.update_wallet_balance();

CREATE OR REPLACE FUNCTION public.update_wallet_balance_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.wallet SET saldo_atual = saldo_atual - OLD.valor WHERE user_id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_wallet_transaction_delete ON public.wallet_transactions;

CREATE TRIGGER on_wallet_transaction_delete
    AFTER DELETE ON public.wallet_transactions
    FOR EACH ROW EXECUTE PROCEDURE public.update_wallet_balance_on_delete();


-- CORRECTION 4: MISSING FOREIGN KEYS IN PAYMENT_PIX (Relacionamentos) --
ALTER TABLE public.payments_pix
ADD COLUMN IF NOT EXISTS invite_id uuid references public.invites(id) on delete set null;


-- =========================================================================
-- OPTIMIZATION: BTREE INDEXES FOR FOREIGN KEYS
-- =========================================================================

create index if not exists idx_active_groups_parent_id on public.active_groups(parent_id);

create index if not exists idx_agm_group_id on public.active_group_members(group_id);
create index if not exists idx_agm_active_group_id on public.active_group_members(active_group_id);
create index if not exists idx_agm_user_id on public.active_group_members(user_id);

create index if not exists idx_invites_active_group_id on public.invites(active_group_id);
create index if not exists idx_invites_inviter_user_id on public.invites(inviter_user_id);

create index if not exists idx_wallet_transactions_user_id on public.wallet_transactions(user_id);
create index if not exists idx_wallet_transactions_related_user_id on public.wallet_transactions(related_user_id);
create index if not exists idx_wallet_transactions_related_group_id on public.wallet_transactions(related_group_id);

create index if not exists idx_withdrawals_user_id on public.withdrawals(user_id);
create index if not exists idx_withdrawals_transaction_id on public.withdrawals(transaction_id);

create index if not exists idx_payments_pix_user_id on public.payments_pix(user_id);
create index if not exists idx_payments_pix_invite_id on public.payments_pix(invite_id);

create index if not exists idx_uig_user_id on public.user_invited_groups(user_id);
create index if not exists idx_uig_invite_id on public.user_invited_groups(invite_id);
create index if not exists idx_uig_active_group_id on public.user_invited_groups(active_group_id);

create index if not exists idx_notifications_user_id on public.notifications(user_id);

create index if not exists idx_webhook_logs_payment_id on public.webhook_logs(payment_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
