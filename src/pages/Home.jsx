import { useState } from "react";
import logo from "../assets/logo-white.png";
import ribbon from "../assets/ribbon.png";
import { formatPhone } from "../lib/formatPhone.js";

export default function Home({ onStart, onViewRanking }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const canStart = name.trim() && phone.trim();

  function handleStart() {
    if (!canStart) return;
    onStart(name.trim(), phone.trim());
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
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        onKeyDown={(e) => e.key === "Enter" && handleStart()}
      />

      <button className="btn-primary" style={{ marginTop: 20 }} onClick={handleStart} disabled={!canStart}>
        Começar
      </button>

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
