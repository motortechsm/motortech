-- Visitantes precisam avaliar as regras de segurança (o espaço "privado" não é exposto na API)
grant usage on schema privado to anon;
grant execute on function privado.eh_equipe() to anon;
grant execute on function privado.eh_admin() to anon;
