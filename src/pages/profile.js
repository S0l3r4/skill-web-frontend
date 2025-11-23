import '../styles/index.css';
import '../styles/profile.css';
import { Mail, Instagram, Edit, RefreshCw, Linkedin, Calendar, Briefcase, MapPin, Phone, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ BUSCAR PERFIL COM AUTENTICAÇÃO SUPABASE
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log("🔄 Buscando perfil via backend...");

      // ✅ OBTER SESSÃO ATUAL DO SUPABASE
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Usuário não autenticado - faça login novamente");
      }

      const token = session.access_token;
      console.log("🔐 Token obtido:", token ? "Sim" : "Não");

      // ✅ CHAMAR BACKEND COM TOKEN
      const response = await fetch('https://skill-web-backend.onrender.com/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("📥 Status da resposta:", response.status);

      if (response.status === 401) {
        throw new Error("Sessão expirada - faça login novamente");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do servidor: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("📦 Dados recebidos:", result);

      if (result.success) {
        setUser(result.user);
        console.log("✅ Perfil carregado com sucesso!");
      } else {
        throw new Error(result.error || 'Erro ao carregar perfil');
      }

    } catch (error) {
      console.error('💥 Erro completo:', error);
      setError(error.message);

      if (error.message.includes('não autenticado') || error.message.includes('Sessão expirada')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ✅ LOGOUT CORRETO
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      }
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      navigate('/login');
    }
  };

  const handleRefresh = () => {
    fetchUserProfile();
  };

  // Funções auxiliares
  const formatDate = (dateString) => {
    if (!dateString) return 'Não informada';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatDocument = (doc, type) => {
    if (!doc) return 'Não informado';
    const numbers = doc.replace(/\D/g, '');
    if (type === 'freelancer') {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (type === 'empresa') {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return doc;
  };

  // Estados de loading
  if (loading) {
    return (
      <div className="profile">
        <header>
          <div className="menu">
            <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
            <Link id="nomeheader" to="/">SkillMatch</Link>
          </div>
          <div className="menu" id="menuLinks">
            <button onClick={handleRefresh} className="refresh-btn">
              <RefreshCw size={16} />
              Recarregar
            </button>
          </div>
        </header>
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Carregando seu perfil...</p>
          <small>Autenticando e buscando dados</small>
        </div>
      </div>
    );
  }

  // Estados de erro
  if (error && !user) {
    return (
      <div className="profile">
        <header>
          <div className="menu">
            <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
            <Link id="nomeheader" to="/">SkillMatch</Link>
          </div>
          <div className="menu" id="menuLinks">
            <button onClick={handleRefresh} className="refresh-btn">
              Tentar Novamente
            </button>
            <Link to="/login">Fazer Login</Link>
          </div>
        </header>
        <div className="error-container">
          <div className="error-message">
            <h3>❌ Erro ao carregar perfil</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleLogout} className="btn-cancel">
                Fazer Logout
              </button>
              <Link to="/login" className="btn-cancel">
                Ir para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ JSX - usando as chaves corretas
  return (
    <div className="profile">
      <header>
        <div className="menu-profile">
          <div className="menu">
            <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
            <Link id="nomeheader" to="/">SkillMatch</Link>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </header>

      <section className="profile-section">
        {/* Cabeçalho do perfil */}
        <div className="profile-header-simple">
          <div className="avatar-container-simple">
            <img
              src="data:image/jpeg;base64,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"
              alt="Avatar"
              className="profile-avatar-simple"
            />
          </div>

          <div className="profile-info-simple">
            <h1 className="profile-name-simple">{user?.name_user || 'Usuário'}</h1>

            <div className="profile-type-badge">
              <span className={`type-badge ${user?.type_user}`}>
                {user?.type_user === 'freelancer' ? 'FREELANCER' :
                  user?.type_user === 'empresa' ? 'EMPRESA' : 'USUÁRIO'}
              </span>
            </div>

            <div className="profile-email-simple">
              <Mail size={18} />
              <span>{user?.email_user || 'Email não informado'}</span>
            </div>
          </div>
        </div>

        {/* Informações do Freelancer */}
        {user?.type_user === 'freelancer' && (
          <div className="details-container">
            <h3 className="details-title">Informações do Freelancer</h3>

            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-icon-wrapper">
                  <Briefcase size={20} />
                </div>
                <div className="detail-content">
                  <label>Ocupação</label>
                  <span>{user?.ocupation_freelancer || 'Não informada'}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon-wrapper">
                  <Calendar size={20} />
                </div>
                <div className="detail-content">
                  <label>Data de Nascimento</label>
                  <span>{formatDate(user?.birthday_freelancer)}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon-wrapper">
                  <span>🔒</span>
                </div>
                <div className="detail-content">
                  <label>CPF</label>
                  <span>{formatDocument(user?.cpf_freelancer, 'freelancer')}</span>
                </div>
              </div>

              {user?.link_portfolio_freelancer && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Globe size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Portfólio</label>
                    <a href={user.link_portfolio_freelancer} target="_blank" rel="noopener noreferrer">
                      Ver Portfólio
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações da Empresa */}
        {user?.type_user === 'empresa' && (
          <div className="details-container">
            <h3 className="details-title">Informações da Empresa</h3>

            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-icon-wrapper">
                  <span>🏢</span>
                </div>
                <div className="detail-content">
                  <label>CNPJ</label>
                  <span>{formatDocument(user?.cnpj_company, 'empresa')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informações de Contato */}
        {(user?.phone_user || user?.city_user || user?.state_user || user?.linkedin_link_user || user?.insta_link_user) && (
          <div className="details-container">
            <h3 className="details-title">Informações de Contato</h3>

            <div className="details-grid">
              {user?.phone_user && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Phone size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Telefone</label>
                    <span>{user.phone_user}</span>
                  </div>
                </div>
              )}

              {(user?.city_user || user?.state_user) && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <MapPin size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Localização</label>
                    <span>
                      {user.city_user && user.state_user
                        ? `${user.city_user}, ${user.state_user}`
                        : user.city_user || user.state_user
                      }
                    </span>
                  </div>
                </div>
              )}

              {user?.linkedin_link_user && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Linkedin size={20} />
                  </div>
                  <div className="detail-content">
                    <label>LinkedIn</label>
                    <a href={user.linkedin_link_user} target="_blank" rel="noopener noreferrer">
                      {user.linkedin_link_user}
                    </a>
                  </div>
                </div>
              )}

              {user?.insta_link_user && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Instagram size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Instagram</label>
                    <a href={user.insta_link_user} target="_blank" rel="noopener noreferrer">
                      {user.insta_link_user}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Biografia */}
        {user?.bio_user && (
          <div className="details-container">
            <h3 className="details-title">Sobre</h3>
            <div className="bio-content">
              <p>{user.bio_user}</p>
            </div>
          </div>
        )}

        {/* Botão de Edição */}
        <div className="profile-actions">
          {user?.type_user === 'empresa' && (
            <Link to="/editarEmpresa" className="edit-profile-btn">
              <Edit size={18} />
              Editar Perfil
            </Link>
          )}

          {user?.type_user === 'freelancer' && (
            <Link to="/editar" className="edit-profile-btn">
              <Edit size={18} />
              Editar Perfil
            </Link>
          )}
        </div>
        
      </section>

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

        <div className="text-center mt-6 text-xs" style={{ color: '#93032e' }}>
          © 2025 SkillMatch. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}