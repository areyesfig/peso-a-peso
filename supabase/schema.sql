-- ============================================================
-- Schema para Budget Analyzer
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: statements
-- ============================================================
create table if not exists statements (
  id                uuid    default gen_random_uuid() primary key,
  user_id           uuid    references auth.users not null,
  filename          text    not null,
  file_type         text    not null check (file_type in ('pdf', 'csv')),
  period            text,
  summary           jsonb,
  transaction_count int     default 0,
  created_at        timestamptz default now()
);

-- ============================================================
-- TABLA: transactions
-- ============================================================
create table if not exists transactions (
  id            uuid    default gen_random_uuid() primary key,
  statement_id  uuid    references statements(id) on delete cascade not null,
  user_id       uuid    references auth.users not null,
  date          date,
  description   text    not null,
  merchant      text,                          -- nombre limpio extraído por la IA
  amount        numeric(12,2) not null,
  type          text    not null default 'expense'
                        check (type in ('income','expense')),
  category      text    not null,
  created_at    timestamptz default now()
);

-- ============================================================
-- TABLA: category_corrections
-- Registro de correcciones manuales del usuario (bottom sheet)
-- ============================================================
create table if not exists category_corrections (
  id              uuid    default gen_random_uuid() primary key,
  transaction_id  uuid    references transactions(id) on delete cascade not null,
  user_id         uuid    references auth.users not null,
  old_category    text    not null,
  new_category    text    not null,
  created_at      timestamptz default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index if not exists idx_statements_user_created
  on statements (user_id, created_at desc);

create index if not exists idx_transactions_statement
  on transactions (statement_id);

create index if not exists idx_transactions_user_date
  on transactions (user_id, date desc);

create index if not exists idx_corrections_transaction
  on category_corrections (transaction_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table statements          enable row level security;
alter table transactions         enable row level security;
alter table category_corrections enable row level security;

-- statements
create policy "Users manage own statements"
  on statements for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- transactions
create policy "Users manage own transactions"
  on transactions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- corrections
create policy "Users manage own corrections"
  on category_corrections for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FUNCIÓN: actualiza category en transaction y registra en corrections
-- ============================================================
create or replace function apply_category_correction(
  p_transaction_id  uuid,
  p_new_category    text
)
returns void
language plpgsql security definer
as $$
declare
  v_old_category text;
  v_user_id      uuid := auth.uid();
begin
  -- obtener categoría actual
  select category into v_old_category
  from transactions
  where id = p_transaction_id and user_id = v_user_id;

  if not found then
    raise exception 'Transacción no encontrada';
  end if;

  -- actualizar
  update transactions
  set category = p_new_category
  where id = p_transaction_id and user_id = v_user_id;

  -- registrar corrección
  insert into category_corrections (transaction_id, user_id, old_category, new_category)
  values (p_transaction_id, v_user_id, v_old_category, p_new_category);
end;
$$;
