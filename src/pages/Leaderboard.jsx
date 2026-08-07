import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import logo from "../assets/logo-white.png";

// Dados de mentira só pra demonstrar como o ranking fica preenchido.
// Assim que a primeira pessoa de verdade jogar no evento, isso some
// sozinho e entra o ranking real (veja o fallback lá embaixo).
const MOCK_SCORES = [
  { nome: "Marcela", acertos: 14, perguntas_respondidas: 15, created_at: "1" },
  { nome: "Thiago", acertos: 13, perguntas_respondidas: 14, created_at: "2" },
  { nome: "Camila", acertos: 12, perguntas_respondidas: 13, created_at: "3" },
  { nome: "Rafael", acertos: 11, perguntas_respondidas: 12, created_at: "4" },
  { nome: "Bianca", acertos: 10, perguntas_respondidas: 11, created_at: "5" },
  { nome: "Diego", acertos: 9, perguntas_respondidas: 10, created_at: "6" },
  { nome: "Larissa", acertos: 8, perguntas_respondidas: 9, created_at: "7" },
];

async function fetchScores() {
  const { data, error } = await supabase
    .from("scores")
    .select("nome, acertos, perguntas_respondidas, created_at")
    .order("acertos", { ascending: false })
    .order("perguntas_respondidas", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(10);
  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export default function Leaderboard({ onBack }) {
  const [scores, setScores] = useState(MOCK_SCORES);

  useEffect(() => {
    fetchScores().then((data) => {
      if (data.length > 0) setScores(data);
    });

    // Atualiza em tempo real quando alguém salva uma pontuação nova.
    const channel = supabase
      .channel("scores-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "scores" }, () => {
        fetchScores().then((data) => data.length > 0 && setScores(data));
      })
      .subscribe();

    // Reforço: refaz a busca a cada 8s, caso o realtime não esteja habilitado
    // na tabela (evita depender só do websocket durante o evento).
    const poll = setInterval(() => {
      fetchScores().then((data) => data.length > 0 && setScores(data));
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, []);

  const [first, second, third] = scores;
  const rest = scores.slice(3);

  return (
    <div className="screen lb-screen">
      <img src={logo} alt="Projeto Casa Brasil Barrie" className="brand-logo brand-logo-lb" />
      <span className="eyebrow">Expo Brasil</span>
      <h1 className="lb-title">Ranking do Quiz</h1>
      <p className="lb-sub">Mais acertos em 50 segundos</p>

      <div className="podium">
        {second && (
          <div className="podium-step silver">
            <div className="podium-rank">2º lugar</div>
            <div className="podium-name">{second.nome}</div>
            <div className="podium-score">{second.acertos}</div>
          </div>
        )}
        {first && (
          <div className="podium-step gold">
            <div className="podium-rank">1º lugar</div>
            <div className="podium-name">{first.nome}</div>
            <div className="podium-score">{first.acertos}</div>
          </div>
        )}
        {third && (
          <div className="podium-step bronze">
            <div className="podium-rank">3º lugar</div>
            <div className="podium-name">{third.nome}</div>
            <div className="podium-score">{third.acertos}</div>
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <div className="lb-list">
          {rest.map((s, i) => (
            <div className="lb-row" key={`${s.nome}-${s.created_at}`}>
              <div className="rank">{i + 4}</div>
              <div className="name">{s.nome}</div>
              <div className="score">{s.acertos} pts</div>
            </div>
          ))}
        </div>
      )}

      {onBack && (
        <button className="btn-link lb-back" onClick={onBack}>
          Voltar pro jogo
        </button>
      )}

      <div className="lb-footer">acertos.casabrasil</div>
    </div>
  );
}
