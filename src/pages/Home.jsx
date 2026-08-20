import { useState } from "react";
import logo from "../assets/logo-white.png";
import ribbon from "../assets/ribbon.png";
import { formatPhone } from "../lib/formatPhone.js";
import { supabase } from "../lib/supabaseClient.js";

export default function Home({ onStart, onViewRanking }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const canStart = name.trim() && phone.trim() && !checking;

  async function handleStart() {
    if (!canStart) return;
    setErrorMsg("");
    setChecking(true);

    const trimmedPhone = phone.trim();
    const { data, error } = await supabase
      .from("scores")
      .select("id")
      .eq("telefone", trimmedPhone)
      .limit(1);

    setChecking(false);

    if (error) {
      setErrorMsg("Não deu pra verificar agora. Tenta de novo.");
      return;
    }

    if (data && data.length > 0) {
      setErrorMsg("Esse telefone já jogou. Só vale uma tentativa por pessoa.");
      return;
    }

    onStart(name.trim(), trimmedPhone);
  }

  return (
    <div className="screen">
      <img src={logo} alt="Projeto Casa Brasil Barrie" className="brand-logo" />
      <span className="eyebrow">Expo Brasil</span>
      <h1 className="home-title">
        Quiz <span className="accent">Brasil</span>
      </h1>

      <input
        className="name-input"
        style={{ marginTop: 28 }}
        placeholder="Nome"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <input
        className="name-input"
        style={{ marginTop: 12 }}
        placeholder="Telefone"
        type="tel"
        inputMode="numeric"
        value={phone}
        maxLength={16}
        onChange={(e) => {
          setPhone(formatPhone(e.target.value));
          setErrorMsg("");
        }}
        onKeyDown={(e) => e.key === "Enter" && handleStart()}
      />

      <button className="btn-primary" style={{ marginTop: 20 }} onClick={handleStart} disabled={!canStart}>
        {checking ? "Verificando..." : "Começar"}
      </button>

      {errorMsg && (
        <div className="status-msg" style={{ color: "var(--danger)" }}>
          {errorMsg}
        </div>
      )}

      <div className="home-rules">
        <div className="rule-chip">
          <strong>50s</strong>
          tempo total
        </div>
        <div className="rule-chip">
          <strong>1 ponto</strong>
          por acerto
        </div>
      </div>

      <button className="btn-secondary" style={{ marginTop: 20 }} onClick={onViewRanking}>
        Ver ranking
      </button>

      <img src={ribbon} alt="" className="corner-ribbon" />
    </div>
  );
}
