import '../styles/index.css';
import '../styles/profile.css';
import { Mail, Instagram, Edit, RefreshCw, Linkedin, Calendar, Briefcase, MapPin, Phone, Globe, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // BUSCAR PERFIL COM AUTENTICAÇÃO SUPABASE
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log("Buscando perfil via backend...");

      // OBTER SESSÃO ATUAL DO SUPABASE
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Usuário não autenticado - faça login novamente");
      }

      const token = session.access_token;
      console.log("Token obtido:", token ? "Sim" : "Não");

      // CHAMAR BACKEND COM TOKEN
      const response = await fetch('https://skill-web-backend.onrender.com/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("Status da resposta:", response.status);

      if (response.status === 401) {
        throw new Error("Sessão expirada - faça login novamente");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do servidor: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Dados recebidos:", result);

      if (result.success) {
        setUser(result.user);
        console.log("Perfil carregado com sucesso!");
      } else {
        throw new Error(result.error || 'Erro ao carregar perfil');
      }

    } catch (error) {
      console.error('Erro completo:', error);
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

  // LOGOUT CORRETO
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

  const formatDocument = (document, type) => {
    if (!document) return 'Não informado';

    // Converte para string primeiro
    const docString = document.toString();

    if (type === 'freelancer' && docString.length === 11) {
      return docString.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    return docString;
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
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>
        <section className="profile-section">
          <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p>Carregando seu perfil...</p>
            <small>Autenticando e buscando dados</small>
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        </section>
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
          <div className="header-actions">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>
        <section className="profile-section">
          <div className="error-container">
            <div className="error-message">
              <h3>Erro ao carregar perfil</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={handleRefresh} className="btn-submit">
                  <RefreshCw size={18} />
                  Tentar Novamente
                </button>
                <button onClick={handleLogout} className="btn-cancel">
                  <LogOut size={18} />
                  Fazer Logout
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="profile">
      <header>
        <div className="menu">
          <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
          <Link id="nomeheader" to="/">SkillMatch</Link>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </header>

      <section className="profile-section">
        {/* Cabeçalho do perfil */}
        <div className="profile-header-simple">
          <div className="avatar-container-simple">
            <div className="profile-avatar-placeholder">
              {/* Avatar vazio para você colocar depois */}
            </div>
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
          <>
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

            {/* Skills do Freelancer */}
            {user?.skills && user.skills.length > 0 && (
              <div className="details-container">
                <h3 className="details-title">Habilidades</h3>
                <div className="skills-container">
                  <div className="skills-grid">
                    {user.skills.map((skill, index) => (
                      skill && skill.trim() && (
                        <div key={index} className="skill-tag">
                          {skill}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
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
            <Link to="/editar-empresa" className="edit-profile-btn">
              <Edit size={18} />
              Editar Perfil
            </Link>
          )}

          {user?.type_user === 'freelancer' && (
            <Link to="/editar-freelancer" className="edit-profile-btn">
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