# Quiz Brasil — Expo Casa Brasil

Site com duas telas separadas:

- `/jogo` → roda no tablet. A pessoa toca em começar, tem 60s, responde o máximo de perguntas certas.
- `/ranking` → roda no monitor do evento. Mostra o pódio e o ranking ao vivo, atualiza sozinho quando alguém termina o quiz no tablet.

As duas telas são o mesmo site, cada dispositivo só abre uma URL diferente. Elas se comunicam através do Supabase (banco de dados), então funcionam em aparelhos diferentes ao mesmo tempo.

## 1. Criar o projeto no Supabase

1. Crie uma conta grátis em [supabase.com](https://supabase.com) e crie um novo projeto.
2. Vá em **SQL Editor** → **New query**, cole o conteúdo do arquivo `supabase-schema.sql` e rode.
3. Vá em **Project Settings → API**. Copie a **Project URL** e a chave **anon public**.

## 2. Configurar o projeto localmente

```bash
npm install
cp .env.example .env
```

Abra o `.env` e cole a URL e a chave que você copiou do Supabase.

```bash
npm run dev
```

Abre em `http://localhost:5173`. Teste `/jogo` e `/ranking` em duas abas.

## 3. Editar as perguntas

Todas as perguntas ficam em `src/data/questions.js`. É só um array, dá pra editar, adicionar ou remover perguntas sem mexer em mais nada. Coloquei 24 perguntas de exemplo sobre o Brasil (geografia, música, comida, história, futebol). Ajuste pro nível que fizer sentido pro público do evento.

Se quiser mudar o tempo de 60 segundos, é a constante `DURATION` no topo de `src/pages/Quiz.jsx`.

## 4. Deploy no Vercel

1. Suba o projeto pro GitHub (mesmo fluxo que você já usa).
2. No Vercel, importe o repositório.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores do seu `.env`.
4. Deploy.

Você vai ter uma URL tipo `casa-brasil-quiz.vercel.app`.

## 5. No dia do evento

- **Tablet**: abre `casa-brasil-quiz.vercel.app` (a tela inicial já pede nome, telefone e tem um botão "Ver ranking ao vivo"). Deixa em tela cheia. Cada pessoa joga uma vez só, não tem botão de tentar de novo — depois que salva a pontuação, só dá pra "Finalizar" e a próxima pessoa preenche os dados dela.
- **Monitor/TV**: abre `casa-brasil-quiz.vercel.app/ranking`. Fica ligado o evento inteiro, atualiza sozinho.
- O telefone é só pra vocês conseguirem avisar o ganhador se ele já tiver ido embora do evento. Fica salvo no Supabase, não aparece em lugar nenhum público (nem no ranking do telão).
- Sem wi-fi no local = sem funcionar, já que depende do Supabase. Confirma a rede do espaço com antecedência ou leva um hotspot de backup.

## Como funciona o ranking

Ordena por número de acertos (do maior pro menor). Em caso de empate, quem respondeu menos perguntas pra chegar naquele número de acertos fica na frente (foi mais certeiro). Se ainda empatar, quem jogou primeiro fica na frente. Dá pra mudar essa lógica em `src/pages/Leaderboard.jsx`, na função `fetchScores`.

## Resetar o ranking entre o teste e o evento de verdade

No Supabase, vá em **Table Editor → scores** e apague as linhas de teste antes do evento começar.
