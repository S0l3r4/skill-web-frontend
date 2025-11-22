import '../styles/index.css';
import { Mail, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
;

export default function SignUp() {
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ FUNÇÃO CORRIGIDA COM SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.type = type;

    if (data.senha !== data.confirmarSenha) {
      alert("⚠️ As senhas não coincidem!");
      setLoading(false);
      return;
    }

    try {
      // ✅ CHAMA SEU BACKEND, não o Supabase diretamente
      const response = await fetch('https://skill-web-backend.onrender.com/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          senha: data.senha,
          name: data.name,
          type: data.type,
          cpf: data.cpf,
          cnpj: data.cnpj,
          birthday: data.birthday
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      alert("✅ Cadastro realizado com sucesso!");
      e.target.reset();
      setType("");

    } catch (err) {
      console.error("Erro no cadastro:", err);
      alert("❌ Erro no cadastro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signUp">
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

      <section className="signUp-section">
        <h2>CADASTRO</h2>
        <div className="signUp-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="userType">
                <label htmlFor="type">Você é:</label>
                <select value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="">Selecione seu tipo</option>
                  <option className="typeValue" value="freelancer">Freelancer</option>
                  <option className="typeValue" value="empresa">Empresa</option>
                </select>
              </div>
            </div>

            {type === "empresa" && (
              <>
                <div className="form-group">
                  <input placeholder="Nome da Empresa" type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <input placeholder="CNPJ" type="text" id="cnpj" name="cnpj" required />
                </div>
              </>
            )}

            {type === "freelancer" && (
              <>
                <div className="form-group">
                  <input placeholder="Nome" type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <input placeholder="CPF" type="text" id="cpf" name="cpf" required />
                </div>
                <div className="form-group">
                  <input placeholder="Data Nascimento" type="date" id="birthday" name="birthday" required />
                </div>
              </>
            )}

            <div className="form-group">
              <input placeholder="Email" type="email" id="email" name="email" required />
            </div>

            <div className="form-group">
              <input placeholder="Crie uma Senha" type="password" id="senha" name="senha" required />
            </div>

            <div className="form-group">
              <input placeholder="Confirme sua Senha" type="password" id="confirmarSenha" name="confirmarSenha" required />
            </div>

            <button type="submit" className="btnsubmit" disabled={loading}>
              {loading ? "Enviando..." : "Cadastrar"}
            </button>
          </form>
        </div>
      </section>

      {/* footer */}
      <footer className="footer">
        <div className="footer1">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <img src="/logoNome.png" alt="SkillMatch Logo" className="w-10 h-10" />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="font-bold text-red-700">Desenvolvido por:</h2>
            <div className="mails">
              <a href="mailto:viiallvesx@gmail.com">Ana Vitória Alves</a>
              <a href="mailto:gibarbutti@gmail.com">Giovanna Barbutti</a>
              <a href="mailto:thomasdamasena2@gmail.com">Thomas Solera</a>
            </div>
          </div>

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

        <div className="text-center mt-6 text-xs text-purple-700" style={{ color: '#93032e' }}>
          © 2025 SkillMatch. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
