import { useEffect, useRef, useState } from "react";
import { questions } from "../data/questions.js";
import { supabase } from "../lib/supabaseClient.js";

const DURATION = 50; // segundos. Mude aqui se quiser testar com menos tempo.
const RADIUS = 40;
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

  // Salva a pontuação automaticamente assim que o tempo acaba. Só tenta uma
  // vez: é um quiz de tentativa única por pessoa, sem repescagem.
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
    const isCorrect = i === current.correta;
    if (isCorrect) setScore((s) => s + 1);
    setAnswered((a) => a + 1);

    setTimeout(() => {
      lockRef.current = false;
      setSelected(null);
      setQIndex((idx) => idx + 1);
    }, 350);
  }

  const accentClass = secondsLeft <= 10 ? "timer-ring low" : "timer-ring";

  if (phase === "finished") {
    return (
      <div className="screen">
        <span className="eyebrow">Tempo esgotado</span>
        <p className="result-label" style={{ marginBottom: 0 }}>
          {playerName}
        </p>
        <div className="result-number">{score}</div>
        <p className="result-label">
          acertos em {answered} pergunta{answered === 1 ? "" : "s"} respondida
          {answered === 1 ? "" : "s"}
        </p>

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
      <div className="quiz-header">
        <div className="score-pill">{score} pts</div>
        <div className={accentClass}>
          <svg viewBox="0 0 100 100">
            <circle className="track" cx="50" cy="50" r={RADIUS} />
            <circle
              className="progress"
              cx="50"
              cy="50"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="value">{secondsLeft}</div>
        </div>
      </div>

      <div className="question-wrap">
        <div className="question-count">Pergunta {answered + 1}</div>
        <h2 className="question-text">{current.pergunta}</h2>
        <div className="options-grid">
          {current.opcoes.map((op, i) => {
            let cls = "option-btn";
            if (selected !== null) {
              if (i === current.correta) cls += " correct";
              else if (i === selected) cls += " wrong";
            }
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
