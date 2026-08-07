-- Rode isso no SQL Editor do seu projeto Supabase (Supabase Dashboard > SQL Editor > New query)

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  acertos int not null,
  perguntas_respondidas int not null,
  created_at timestamptz not null default now()
);

-- Habilita Row Level Security
alter table scores enable row level security;

-- Permite que qualquer pessoa (tablet do evento) insira uma pontuação
create policy "Qualquer um pode inserir pontuação"
  on scores for insert
  to anon
  with check (true);

-- Permite que qualquer pessoa (monitor do ranking) leia as pontuações
create policy "Qualquer um pode ver o ranking"
  on scores for select
  to anon
  using (true);

-- Habilita realtime na tabela (Database > Replication no dashboard,
-- ou rode o comando abaixo)
alter publication supabase_realtime add table scores;

-- Se você já tinha criado a tabela "scores" antes (sem telefone), rode só
-- essa linha pra adicionar a coluna sem perder os dados:
-- alter table scores add column if not exists telefone text;
