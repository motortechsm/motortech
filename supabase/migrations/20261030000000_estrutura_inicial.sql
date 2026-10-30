-- MotorTech: estrutura inicial do banco de dados
-- Tabelas vazias para produtos, categorias, pedidos e usuários do painel.
-- Toda tabela tem Row Level Security (RLS) ligado.

-- =========================================================
-- Tipos
-- =========================================================
create type public.papel_usuario as enum ('admin', 'vendedor');
create type public.condicao_produto as enum ('novo', 'recondicionado', 'usado');
create type public.status_pedido as enum (
  'aguardando_pagamento', 'pago', 'em_separacao', 'enviado', 'entregue', 'cancelado'
);
create type public.origem_pedido as enum ('site', 'whatsapp', 'balcao');

-- =========================================================
-- Função: atualiza o campo atualizado_em automaticamente
-- =========================================================
create or replace function public.definir_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- =========================================================
-- Usuários do painel (admin e vendedores)
-- =========================================================
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  papel public.papel_usuario not null default 'vendedor',
  -- Novo cadastro começa bloqueado; a administradora libera pelo painel.
  ativo boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.definir_atualizado_em();

-- Cria o perfil (bloqueado) quando alguém se cadastra
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome', ''));
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();

-- Funções de permissão (usadas pelas regras de segurança)
create or replace function public.eh_equipe()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and ativo
  );
$$;

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and ativo and papel = 'admin'
  );
$$;

revoke execute on function public.eh_equipe() from public, anon;
revoke execute on function public.eh_admin() from public, anon;
grant execute on function public.eh_equipe() to authenticated;
grant execute on function public.eh_admin() to authenticated;
revoke execute on function public.criar_perfil_novo_usuario() from public, anon, authenticated;

-- =========================================================
-- Categorias
-- =========================================================
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem integer not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger categorias_atualizado_em
  before update on public.categorias
  for each row execute function public.definir_atualizado_em();

-- =========================================================
-- Produtos (módulos)
-- =========================================================
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  codigo_peca text,
  numero_serie text,
  categoria_id uuid references public.categorias (id) on delete set null,
  marca_veiculo text,
  modelo_veiculo text,
  ano_inicio integer check (ano_inicio between 1950 and 2100),
  ano_fim integer check (ano_fim between 1950 and 2100),
  condicao public.condicao_produto not null default 'novo',
  descricao text,
  preco numeric(10, 2) not null default 0 check (preco >= 0),
  estoque integer not null default 0 check (estoque >= 0),
  -- Endereços das fotos (preenchidos por último, pelo painel)
  fotos text[] not null default '{}',
  -- Produto novo começa oculto da loja até ser revisado
  ativo boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (ano_fim is null or ano_inicio is null or ano_fim >= ano_inicio)
);

create index produtos_categoria_idx on public.produtos (categoria_id);
create index produtos_ativo_idx on public.produtos (ativo);

create trigger produtos_atualizado_em
  before update on public.produtos
  for each row execute function public.definir_atualizado_em();

-- =========================================================
-- Pedidos
-- =========================================================
create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  cliente_nome text not null,
  cliente_telefone text,
  cliente_email text,
  origem public.origem_pedido not null default 'site',
  status public.status_pedido not null default 'aguardando_pagamento',
  total numeric(10, 2) not null default 0 check (total >= 0),
  vendedor_id uuid references public.perfis (id) on delete set null,
  observacoes text,
  -- Mercado Pago
  mp_preferencia_id text,
  mp_pagamento_id text unique,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index pedidos_status_idx on public.pedidos (status);
create index pedidos_vendedor_idx on public.pedidos (vendedor_id);

create trigger pedidos_atualizado_em
  before update on public.pedidos
  for each row execute function public.definir_atualizado_em();

create table public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  produto_id uuid references public.produtos (id) on delete set null,
  -- Cópia do nome e preço no momento da venda
  nome_produto text not null,
  preco_unitario numeric(10, 2) not null check (preco_unitario >= 0),
  quantidade integer not null check (quantidade > 0)
);

create index pedido_itens_pedido_idx on public.pedido_itens (pedido_id);
create index pedido_itens_produto_idx on public.pedido_itens (produto_id);

-- =========================================================
-- Regras de segurança (RLS)
-- =========================================================
alter table public.perfis enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;

-- Perfis: cada um vê o próprio; a admin vê e gerencia todos
create policy "perfis: ver o proprio ou admin ve todos"
  on public.perfis for select to authenticated
  using (id = (select auth.uid()) or (select public.eh_admin()));

create policy "perfis: admin altera"
  on public.perfis for update to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

-- Categorias: público vê as ativas; equipe vê todas; admin gerencia
create policy "categorias: publico ve ativas"
  on public.categorias for select to anon, authenticated
  using (ativo or (select public.eh_equipe()));

create policy "categorias: admin insere"
  on public.categorias for insert to authenticated
  with check ((select public.eh_admin()));

create policy "categorias: admin altera"
  on public.categorias for update to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "categorias: admin apaga"
  on public.categorias for delete to authenticated
  using ((select public.eh_admin()));

-- Produtos: público vê os ativos; equipe vê todos; admin gerencia
create policy "produtos: publico ve ativos"
  on public.produtos for select to anon, authenticated
  using (ativo or (select public.eh_equipe()));

create policy "produtos: admin insere"
  on public.produtos for insert to authenticated
  with check ((select public.eh_admin()));

create policy "produtos: admin altera"
  on public.produtos for update to authenticated
  using ((select public.eh_admin()))
  with check ((select public.eh_admin()));

create policy "produtos: admin apaga"
  on public.produtos for delete to authenticated
  using ((select public.eh_admin()));

-- Pedidos: só a equipe acessa. Pedidos do site são criados pelo servidor.
create policy "pedidos: equipe ve"
  on public.pedidos for select to authenticated
  using ((select public.eh_equipe()));

create policy "pedidos: equipe cria"
  on public.pedidos for insert to authenticated
  with check ((select public.eh_equipe()));

create policy "pedidos: equipe altera"
  on public.pedidos for update to authenticated
  using ((select public.eh_equipe()))
  with check ((select public.eh_equipe()));

create policy "pedidos: admin apaga"
  on public.pedidos for delete to authenticated
  using ((select public.eh_admin()));

create policy "itens: equipe ve"
  on public.pedido_itens for select to authenticated
  using ((select public.eh_equipe()));

create policy "itens: equipe cria"
  on public.pedido_itens for insert to authenticated
  with check ((select public.eh_equipe()));

create policy "itens: equipe altera"
  on public.pedido_itens for update to authenticated
  using ((select public.eh_equipe()))
  with check ((select public.eh_equipe()));

create policy "itens: equipe apaga"
  on public.pedido_itens for delete to authenticated
  using ((select public.eh_equipe()));
