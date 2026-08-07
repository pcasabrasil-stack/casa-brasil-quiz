import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import logo from "../assets/logo-white.png";

async function fetchScores() {
  const { data, error } = await supabase
    .from("scores")
    .select("nome, telefone, acertos, perguntas_respondidas, created_at")
    .order("acertos", { ascending: false })
    .order("perguntas_respondidas", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) {
    console.error(error);
    return [];
  }

  const seen = new Set();
  const best = [];
  for (const row of data) {
    const key = row.telefone || row.nome;
    if (seen.has(key)) continue;
    seen.add(key);
    best.push(row);
  }
  return best.slice(0, 10);
}

export default function Leaderboard({ onBack }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetchScores().then(setScores);

    const channel = supabase
      .channel("scores-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "scores" }, () => {
        fetchScores().then(setScores);
      })
      .subscribe();

    const poll = setInterval(() => fetchScores().then(setScores), 8000);

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

      {scores.length === 0 ? (
        <div className="lb-empty">Ainda ninguém jogou. Bora ser o primeiro!</div>
      ) : (
        <>
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
        </>
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
