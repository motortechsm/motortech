-- Move as funções de permissão para um espaço privado (fora da API pública)
create schema if not exists privado;
revoke all on schema privado from public, anon;
grant usage on schema privado to authenticated;
alter function public.eh_equipe() set schema privado;
alter function public.eh_admin() set schema privado;
alter function public.criar_perfil_novo_usuario() set schema privado;
