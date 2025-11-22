import '../styles/index.css';
import { Mail, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function EditFreelancer() {
  const [type, setType] = useState("freelancer");
  const [loading, setLoading] = useState(false);

  // Função para simular a atualização de dados
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Aqui você pode adicionar a lógica para enviar as alterações para o backend (Supabase, por exemplo)

    alert("✅ Dados atualizados com sucesso!");
    setLoading(false);
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
          <Link to="/editar">Editar Perfil</Link>
        </div>
      </header>

      <section className="signUp-section">
        <h2>EDITAR DADOS</h2>
        <div className="signUp-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="userType">
                <label htmlFor="type">Você é:</label>
                <select value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <input placeholder="João Silva" type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <input placeholder="Digite seu cpf" type="text" id="cpf" name="cpf" required />
            </div>
            <div className="form-group">
              <input placeholder="data de nascimento" type="date" id="birthday" name="birthday" required />
            </div>
            <div className="form-group">
              <input placeholder="digite seu email:" type="email" id="email" name="email"  required />
            </div>
            <div className="form-group">
              <input placeholder="Nova Senha" type="password" id="senha" name="senha" />
            </div>
            <div className="form-group">
              <input placeholder="Confirme a Senha" type="password" id="confirmarSenha" name="confirmarSenha" />
            </div>

            <button type="submit" className="btnsubmit" disabled={loading}>
              {loading ? "Atualizando..." : "Salvar Alterações"}
            </button>
          </form>
        </div>
      </section>

      {/* rodapé */}
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
