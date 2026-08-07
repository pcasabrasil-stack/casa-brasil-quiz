import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const configured = Boolean(supabaseUrl && supabaseAnonKey);

if (!configured) {
  console.warn(
    "Faltam as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. O quiz funciona pra testar, mas pontuação não salva e o ranking fica vazio até você configurar o .env (veja .env.example)."
  );
}

// Cliente "vazio" usado só quando o .env ainda não foi configurado, pra dar
// pra rodar `npm run dev` e ver a tela do jogo e do ranking sem quebrar.
// Assim que o .env tiver as chaves reais, isso é ignorado e usa o Supabase de verdade.
const stubClient = {
  from() {
    return {
      insert: async () => ({ error: { message: "Supabase não configurado (modo teste)" } }),
      select() {
        return this;
      },
      order() {
        return this;
      },
      limit: async () => ({ data: [], error: null }),
    };
  },
  channel() {
    return {
      on() {
        return this;
      },
      subscribe() {
        return this;
      },
    };
  },
  removeChannel() {},
};

export const supabase = configured ? createClient(supabaseUrl, supabaseAnonKey) : stubClient;
