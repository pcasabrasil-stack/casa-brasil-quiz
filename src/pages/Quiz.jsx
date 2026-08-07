import { useEffect, useRef, useState } from "react";
import { questions } from "../data/questions.js";
import { supabase } from "../lib/supabaseClient.js";

const DURATION = 50; // segundos. Mude aqui se quiser testar com menos tempo.
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Quiz({ playerName, playerPhone, onExit }) {
  const [pool] = useState(() => shuffle(questions));
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [phase, setPhase] = useState("playing"); // playing | finished
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error

  const startRef = useRef(Date.now());
  const lockRef = useRef(false);
  const savedRef = useRef(false);

  const current = pool[qIndex % pool.length];

  useEffect(() => {
    if (phase !== "playing") return;
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const left = Math.max(0, DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0) setPhase("finished");
    };
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "finished" || savedRef.current) return;
    savedRef.current = true;
    setSaveStatus("saving");
    supabase
      .from("scores")
      .insert({
        nome: playerName,
        telefone: playerPhone,
        acertos: score,
        perguntas_respondidas: answered,
      })
      .then(({ error }) => setSaveStatus(error ? "error" : "saved"));
  }, [phase, playerName, playerPhone, score, answered]);

  const secondsLeft = Math.ceil(timeLeft);
  const dashOffset = CIRCUMFERENCE * (1 - timeLeft / DURATION);

  function handleAnswer(i) {
    if (lockRef.current || phase !== "playing") return;
    lockRef.current = true;
    setSelected(i);
    if (i === current.correta) setScore((s) => s + 1);
    setAnswered((a) => a + 1);

    setTimeout(() => {
      lockRef.current = false;
      setSelected(null);
      setQIndex((idx) => idx + 1);
    }, 350);
  }

  const accentClass = secondsLeft <= 10 ? "timer-ring low" : "timer-ring";

  if (phase === "finished") {
    const wrong = answered - score;
    return (
      <div className="screen">
        <span className="eyebrow">Tempo esgotado</span>
        <p className="result-label" style={{ marginBottom: 0 }}>
          {playerName}
        </p>
        <div className="result-number">{score}</div>
        <p className="result-label">acertos</p>

        <div className="result-stats">
          <div className="stat-chip">
            <strong>{answered}</strong>
            respondidas
          </div>
          <div className="stat-chip correct">
            <strong>{score}</strong>
            certas
          </div>
          <div className="stat-chip wrong">
            <strong>{wrong}</strong>
            erradas
          </div>
        </div>

        <div className="status-msg" style={{ color: saveStatus === "saved" ? "var(--green)" : undefined }}>
          {saveStatus === "saving" && "Salvando pontuação..."}
          {saveStatus === "saved" && "Pontuação salva! Confira o ranking no telão."}
        </div>

        <button className="btn-secondary" onClick={onExit}>
          Finalizar
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className={accentClass}>
        <svg viewBox="0 0 128 128">
          <circle className="track" cx="64" cy="64" r={RADIUS} />
          <circle
            className="progress"
            cx="64"
            cy="64"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="value">{secondsLeft}</div>
      </div>

      <div className="question-wrap">
        <div className="question-count">Pergunta {answered + 1}</div>
        <h2 className="question-text">{current.pergunta}</h2>
        <div className="options-grid">
          {current.opcoes.map((op, i) => {
            const cls = selected === i ? "option-btn selected" : "option-btn";
            return (
              <button
                key={i}
                className={cls}
                disabled={selected !== null}
                onClick={() => handleAnswer(i)}
              >
                {op}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
