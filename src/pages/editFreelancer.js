import '../styles/index.css';
import '../styles/profile.css';
import { ArrowLeft, Instagram, Mail, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function EditFreelancer() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Estado simplificado - apenas campos essenciais
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    linkedin: '',
    instagram: '',
    bio: '',
    cpf: '',
    birthday: '',
    occupation: '',
    portfolio: '',
    senha: '',
    confirmarSenha: ''
  });

  // BUSCAR DADOS
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoadingData(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Faça login novamente");

      const token = session.access_token;

      const response = await fetch('https://skill-web-backend.onrender.com/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar dados');

      const result = await response.json();
      
      if (result.success) {
        const user = result.user;
        setFormData({
          name: user.name_user || '',
          email: user.email_user || '',
          phone: user.phone_user || '',
          city: user.city_user || '',
          state: user.state_user || '',
          linkedin: user.linkedin_link_user || '',
          instagram: user.insta_link_user || '',
          bio: user.bio_user || '',
          cpf: user.cpf_freelancer || '',
          birthday: user.birthday_freelancer || '',
          occupation: user.ocupation_freelancer || user.occupation_freelancer || '',
          portfolio: user.link_portfolio_freelancer || '',
          senha: '',
          confirmarSenha: ''
        });
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Erro:', error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Formatar CPF
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length > 9) value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      else if (value.length > 6) value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      else if (value.length > 3) value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
    
    setFormData(prev => ({ ...prev, cpf: value }));
  };

  // SUBMIT SIMPLIFICADO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações básicas
      if (!formData.name.trim()) throw new Error("Nome é obrigatório");
      if (!formData.email.trim()) throw new Error("Email é obrigatório");
      if (formData.senha && formData.senha !== formData.confirmarSenha) {
        throw new Error("Senhas não coincidem");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");

      const token = session.access_token;

      // Dados para enviar - EXTREMAMENTE SIMPLES
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        bio: formData.bio,
        cpf: formData.cpf.replace(/\D/g, ''),
        birthday: formData.birthday,
        occupation: formData.occupation,
        portfolio: formData.portfolio
      };

      // Só adiciona senha se foi preenchida
      if (formData.senha) {
        updateData.senha = formData.senha;
      }

      console.log('Enviando:', updateData);

      const response = await fetch('https://skill-web-backend.onrender.com/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      console.log('Resposta:', result);

      if (result.success) {
        alert('Perfil atualizado!');
        navigate('/profile');
      } else {
        throw new Error(result.error || 'Erro ao atualizar');
      }

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Telas de loading e erro
  if (loadingData) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={fetchUserData} />;
  }

  return (
    <div className="signUp">
      <Header />
      
      <section className="signUp-section">
        <div className="edit-header">
          <h2>EDITAR PERFIL - FREELANCER</h2>
          <Link to="/profile" className="back-link">
            <ArrowLeft size={20} />
            Voltar ao Perfil
          </Link>
        </div>

        <div className="signUp-form edit-form">
          <form onSubmit={handleSubmit}>
            
            {/* DADOS PESSOAIS */}
            <div className="form-section-edit">
              <h3 className="section-title">📝 Dados Pessoais</h3>

              <div className="form-group">
                <label className="form-label-edit">Nome Completo *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label-edit">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row-edit">
                <div className="form-group">
                  <label className="form-label-edit">CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    maxLength="14"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-edit">Data Nascimento</label>
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label-edit">Ocupação</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* CONTATO */}
            <div className="form-section-edit">
              <h3 className="section-title">📞 Contato</h3>

              <div className="form-group">
                <label className="form-label-edit">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-row-edit">
                <div className="form-group">
                  <label className="form-label-edit">Cidade</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-edit">Estado</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    maxLength="2"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* REDES SOCIAIS */}
            <div className="form-section-edit">
              <h3 className="section-title">🌐 Redes Sociais</h3>

              <div className="form-group">
                <label className="form-label-edit">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label-edit">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label-edit">Portfólio</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* BIOGRAFIA */}
            <div className="form-section-edit">
              <h3 className="section-title">📖 Biografia</h3>

              <div className="form-group">
                <label className="form-label-edit">Sobre você</label>
                <textarea
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* SENHA */}
            <div className="form-section-edit">
              <h3 className="section-title">🔒 Senha</h3>
              
              <div className="form-row-edit">
                <div className="form-group">
                  <label className="form-label-edit">Nova Senha</label>
                  <input
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-edit">Confirmar Senha</label>
                  <input
                    type="password"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="form-actions-edit">
              <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <Link to="/profile" className="btn-cancel-edit">
                Cancelar
              </Link>
            </div>

          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Componentes auxiliares
function Header() {
  return (
    <header>
      <div className="menu">
        <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
        <Link id="nomeheader" to="/">SkillMatch</Link>
      </div>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="signUp">
      <Header />
      <section className="signUp-section">
        <div className="edit-header">
          <h2>EDITAR PERFIL - FREELANCER</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Carregando dados...</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="signUp">
      <Header />
      <section className="signUp-section">
        <div className="edit-header">
          <h2>EDITAR PERFIL - FREELANCER</h2>
        </div>
        <div className="error-container">
          <div className="error-message">
            <AlertCircle size={48} color="#dc3545" />
            <h3>Erro</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={onRetry} className="btn-submit">
                Tentar Novamente
              </button>
              <Link to="/profile" className="btn-cancel">
                Voltar ao Perfil
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer1">
        <div className="flex flex-col items-center md:items-start">
          <img src="/logoNome.png" alt="SkillMatch Logo" className="w-10 h-10" />
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
            <Instagram size={16} />
            <span>@skillmatch.app</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <a href="mailto:skillmatchapp0@gmail.com">skillmatchapp0@gmail.com</a>
          </div>
        </div>
      </div>
      <div className="text-center mt-6 text-xs" style={{ color: '#93032e' }}>
        © 2025 SkillMatch. Todos os direitos reservados.
      </div>
    </footer>
  );
}