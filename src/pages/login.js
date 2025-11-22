import { useState } from "react";
import '../styles/index.css';
import { Mail, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert("Login realizado com sucesso!");
      console.log("Sessão:", data.session);
      console.log("Usuário:", data.user);
    }
  };

  return (
    <div className="login">
      <header>
        <div className="menu">
          <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
          <Link id="nomeheader" to="/">SkillMatch</Link>
        </div>
        <div className="menu" id="menuLinks">
          <Link to="/login">Entrar</Link>
          <Link to="/cadastro">Cadastro</Link>
        </div>
      </header>

      <section className="signUp-section login-section">
        <h2>LOGIN</h2>
        <div className="signUp-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                placeholder="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <div className="form-group btn-div">
              <button type="submit" className="btnsubmit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* rodapé */}
      <footer className="footer">
        <div className="footer1">
          {/* LOGO */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <img src="/logoNome.png" alt="SkillMatch Logo" className="w-10 h-10" />
            </div>
          </div>

          {/* DESENVOLVIDO */}
          <div className="text-center md:text-left">
            <h2 className="font-bold text-red-700">Desenvolvido por:</h2>
            <div className="mails">
              <a href="mailto:viiallvesx@gmail.com">Ana Vitória Alves</a>
              <a href="mailto:gibarbutti@gmail.com">Giovanna Barbutti</a>
              <a href="mailto: thomasdamasena2@gmail.com">Thomas Solera</a>
            </div>
          </div>

          {/* CONTATO */}
          <div className="text-center md:text-left">
            <h2 className="font-bold text-red-700">Contato</h2>
            <div className="flex items-center gap-2">
              <Instagram size={16} className="text-gray-700" />
              <span>@skillmatch.app</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-700" />
              <a href="mailto:skillmatchapp0@gmail.com">skillmatchapp0@gmail.com</a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="text-center mt-6 text-xs text-purple-700" style={{ color: '#93032e' }}>
          © 2025 SkillMatch. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
