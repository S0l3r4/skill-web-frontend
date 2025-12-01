[file name]: profile.js (frontend completo)
[file content begin]
import '../styles/index.css';
import '../styles/profile.css';
import { Mail, Instagram, Edit, Linkedin, Calendar, Briefcase, MapPin, Phone, Globe, Code } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // BUSCAR PERFIL DO USUÁRIO
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log("🔄 Buscando perfil do usuário...");

      const response = await fetch('https://skill-web-backend.onrender.com/api/profileRoutes', {
        method: 'GET',
        credentials: 'include', // Importante para enviar cookies de sessão
        headers: {
          'Content-Type': 'application/json',
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
      console.log("✅ Dados recebidos:", result);
      console.log("📊 Skills recebidas:", result.user?.skills);

      if (result.success) {
        setUser(result.user);
        console.log("✅ Perfil carregado com sucesso!");
      } else {
        throw new Error(result.error || 'Erro ao carregar perfil');
      }

    } catch (error) {
      console.error('❌ Erro completo:', error);
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

  // LOGOUT
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3002/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      // Limpar localStorage/sessionStorage se necessário
      localStorage.removeItem('user');
      sessionStorage.removeItem('isAuthenticated');
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
    const numbers = docString.replace(/\D/g, '');

    if (type === 'freelancer' && numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    if (type === 'empresa' && numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return docString;
  };

  // Função para renderizar ícone baseado na skill
  const getSkillIcon = (skill) => {
    const lowerSkill = skill.toLowerCase();
    
    if (lowerSkill.includes('javascript') || lowerSkill.includes('js') || 
        lowerSkill.includes('typescript') || lowerSkill.includes('react') ||
        lowerSkill.includes('node') || lowerSkill.includes('python') ||
        lowerSkill.includes('php') || lowerSkill.includes('java')) {
      return <Code size={16} />;
    }
    
    if (lowerSkill.includes('git') || lowerSkill.includes('docker') || 
        lowerSkill.includes('aws') || lowerSkill.includes('figma') ||
        lowerSkill.includes('photoshop') || lowerSkill.includes('illustrator')) {
      return "🛠️";
    }
    
    if (lowerSkill.includes('inglês') || lowerSkill.includes('espanhol') ||
        lowerSkill.includes('alemão') || lowerSkill.includes('francês') ||
        lowerSkill.includes('português')) {
      return "🌐";
    }
    
    if (lowerSkill.includes('comunicação') || lowerSkill.includes('liderança') ||
        lowerSkill.includes('trabalho em equipe') || lowerSkill.includes('scrum') ||
        lowerSkill.includes('agile')) {
      return "💬";
    }
    
    return "⭐";
  };

  // Estados de loading
  if (loading) {
    return (
      <div className="profile">
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
          <p>Carregando seu perfil...</p>
          <small>Aguarde enquanto buscamos suas informações</small>
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
            <h3>Erro ao carregar perfil</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleRefresh} className="btn-submit">
                Tentar Novamente
              </button>
              <button onClick={handleLogout} className="btn-cancel">
                Fazer Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <header>
        <div className="menu-profile">
          <div className="menu">
            <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
            <Link id="nomeheader" to="/">SkillMatch</Link>
          </div>
          <div className="profile-header-actions">
            <button onClick={handleRefresh} className="refresh-btn">
              Atualizar
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Sair
            </button>
          </div>
        </div>
      </header>

      <section className="profile-section">
        {/* Cabeçalho do perfil */}
        <div className="profile-header-simple">
          <div className="avatar-container-simple">
            <img
              src="" alt="Avatar"
              className="profile-avatar-simple"
            />
          </div>

          <div className="profile-info-simple">
            <h1 className="profile-name-simple">{user?.name_user || user?.name || 'Usuário'}</h1>

            <div className="profile-type-badge">
              <span className={`type-badge ${user?.type_user || user?.type}`}>
                {user?.type_user === 'freelancer' || user?.type === 'freelancer' ? 'FREELANCER' :
                  user?.type_user === 'empresa' || user?.type === 'empresa' ? 'EMPRESA' : 'USUÁRIO'}
              </span>
            </div>

            <div className="profile-email-simple">
              <Mail size={18} />
              <span>{user?.email_user || user?.email || 'Email não informado'}</span>
            </div>
          </div>
        </div>

        {/* Informações do Freelancer */}
        {(user?.type_user === 'freelancer' || user?.type === 'freelancer') && (
          <div className="details-container">
            <h3 className="details-title">Informações do Freelancer</h3>

            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-icon-wrapper">
                  <Briefcase size={20} />
                </div>
                <div className="detail-content">
                  <label>Ocupação</label>
                  <span>{user?.ocupation_freelancer || user?.occupation || 'Não informada'}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon-wrapper">
                  <Calendar size={20} />
                </div>
                <div className="detail-content">
                  <label>Data de Nascimento</label>
                  <span>{formatDate(user?.birthday_freelancer || user?.birthday)}</span>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-icon-wrapper">
                  <span>🔒</span>
                </div>
                <div className="detail-content">
                  <label>CPF</label>
                  <span>{formatDocument(user?.cpf_freelancer || user?.cpf, 'freelancer')}</span>
                </div>
              </div>

              {(user?.link_portfolio_freelancer || user?.portfolio) && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Globe size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Portfólio</label>
                    <a href={user.link_portfolio_freelancer || user.portfolio} target="_blank" rel="noopener noreferrer">
                      Ver Portfólio
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações da Empresa */}
        {(user?.type_user === 'empresa' || user?.type === 'empresa') && (
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
        {(user?.phone_user || user?.phone || user?.city_user || user?.city || user?.state_user || user?.state || user?.linkedin_link_user || user?.linkedin || user?.insta_link_user || user?.instagram) && (
          <div className="details-container">
            <h3 className="details-title">Informações de Contato</h3>

            <div className="details-grid">
              {(user?.phone_user || user?.phone) && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Phone size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Telefone</label>
                    <span>{user.phone_user || user.phone}</span>
                  </div>
                </div>
              )}

              {(user?.city_user || user?.city || user?.state_user || user?.state) && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <MapPin size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Localização</label>
                    <span>
                      {user.city_user || user.city}{user.city_user || user.city ? ', ' : ''}{user.state_user || user.state}
                    </span>
                  </div>
                </div>
              )}

              {(user?.linkedin_link_user || user?.linkedin) && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Linkedin size={20} />
                  </div>
                  <div className="detail-content">
                    <label>LinkedIn</label>
                    <a href={user.linkedin_link_user || user.linkedin} target="_blank" rel="noopener noreferrer">
                      {user.linkedin_link_user || user.linkedin}
                    </a>
                  </div>
                </div>
              )}

              {(user?.insta_link_user || user?.instagram) && (
                <div className="detail-card">
                  <div className="detail-icon-wrapper">
                    <Instagram size={20} />
                  </div>
                  <div className="detail-content">
                    <label>Instagram</label>
                    <a href={user.insta_link_user || user.instagram} target="_blank" rel="noopener noreferrer">
                      {user.insta_link_user || user.instagram}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Biografia */}
        {(user?.bio_user || user?.bio) && (
          <div className="details-container">
            <h3 className="details-title">Sobre</h3>
            <div className="bio-content">
              <p>{user.bio_user || user.bio}</p>
            </div>
          </div>
        )}

        {/* Skills - Ajustado para pegar tanto do novo quanto do antigo formato */}
        {(user?.skills && Array.isArray(user.skills) && user.skills.length > 0) && (
          <div className="details-container">
            <h3 className="details-title">
              <Code size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Habilidades e Competências
            </h3>
            <div className="skills-container">
              <div className="skills-grid">
                {user.skills
                  .filter(skill => skill && skill.trim() !== '')
                  .map((skill, index) => (
                    <div key={`skill-${index}`} className="skill-badge">
                      <span className="skill-icon">
                        {getSkillIcon(skill)}
                      </span>
                      <span className="skill-text">
                        {skill}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando não há skills para freelancer */}
        {(!user?.skills || user.skills.length === 0) && 
         (user?.type_user === 'freelancer' || user?.type === 'freelancer') && (
          <div className="details-container">
            <h3 className="details-title">
              <Code size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Habilidades e Competências
            </h3>
            <div className="no-skills-message">
              <p>Nenhuma habilidade cadastrada. Adicione suas skills no perfil!</p>
            </div>
          </div>
        )}

        {/* Botão de Edição */}
        <div className="profile-actions">
          {user?.type_user === 'empresa' || user?.type === 'empresa' ? (
            <Link to="/editarEmpresa" className="edit-profile-btn">
              <Edit size={18} />
              Editar Perfil
            </Link>
          ) : (
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
[file content end]
