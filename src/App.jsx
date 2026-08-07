import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Quiz from "./pages/Quiz.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

// Roteamento simples baseado no caminho da URL.
// Não usa react-router de propósito: são só 3 telas fixas.
//   /            -> tela inicial (tablet do jogo), pede nome e telefone
//   /jogo        -> quiz em si
//   /ranking     -> leaderboard (monitor do evento)
export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [player, setPlayer] = useState({ name: "", phone: "" });

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  if (path.startsWith("/ranking")) return <Leaderboard onBack={() => navigate("/")} />;
  if (path.startsWith("/jogo"))
    return (
      <Quiz
        playerName={player.name}
        playerPhone={player.phone}
        onExit={() => {
          setPlayer({ name: "", phone: "" });
          navigate("/");
        }}
      />
    );
  return (
    <Home
      onStart={(name, phone) => {
        setPlayer({ name, phone });
        navigate("/jogo");
      }}
      onViewRanking={() => navigate("/ranking")}
    />
  );
}
