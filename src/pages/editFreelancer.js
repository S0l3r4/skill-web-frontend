import '../styles/index.css';
import '../styles/profile.css';
import { ArrowLeft, Save, User, MapPin, Phone, Globe, BookOpen, Lock, Award, Mail, Instagram } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function EditFreelancer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Dados básicos
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    linkedin: '',
    instagram: '',
    bio: '',

    // Dados do freelancer
    cpf: '',
    birthday: '',
    occupation: '',
    portfolio: '',

    // Habilidades
    skills: ['', '', '', '', '', ''],

    // Senha
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Buscar dados do usuário
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const token = session.access_token;

      const response = await fetch('https://skill-web-backend.onrender.com/api/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

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
          birthday: user.birthday_freelancer ? user.birthday_freelancer.split('T')[0] : '',
          occupation: user.occupation_freelancer || user.ocupation_freelancer || user.ocuppation_freelancer || '',
          portfolio: user.link_portfolio_freelancer || '',
          skills: ['', '', '', '', '', ''],
          password: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(result.error || 'Erro ao carregar dados');
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando usuário digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d{0,3})/, '$1.$2');
      if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }
    return numbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };

  const handleCpfChange = (e) => {
    const formattedCPF = formatCPF(e.target.value);
    setFormData(prev => ({
      ...prev,
      cpf: formattedCPF
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Validações obrigatórias
    if (!formData.name.trim()) errors.name = "Nome completo é obrigatório";
    if (!formData.email.trim()) errors.email = "Email é obrigatório";
    if (!formData.cpf.trim()) errors.cpf = "CPF é obrigatório";
    if (!formData.birthday) errors.birthday = "Data de nascimento é obrigatória";
    if (!formData.occupation.trim()) errors.occupation = "Ocupação é obrigatória";

    // Validações de formato
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
      errors.cpf = "CPF deve ter 11 dígitos";
    }

    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) errors.birthday = "Você deve ter pelo menos 16 anos";
    }

    if (formData.state && formData.state.length !== 2) {
      errors.state = "UF deve ter 2 caracteres";
    }

    // Validação de senha
    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) {
        errors.password = "Senha deve ter no mínimo 6 caracteres";
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "As senhas não coincidem";
      }
    }

    // Validação de habilidades
    const validSkills = formData.skills.filter(skill => skill.trim() !== '');
    if (validSkills.length === 0) {
      errors.skills = "Adicione pelo menos uma habilidade";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (!validateForm()) {
        throw new Error("Corrija os erros no formulário antes de enviar");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const token = session.access_token;

      // Preparar dados para envio
      const updateData = {
        // Dados básicos
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        linkedin: formData.linkedin.trim() || null,
        instagram: formData.instagram.trim() || null,
        bio: formData.bio.trim() || null,

        // Dados do freelancer
        cpf: formData.cpf.replace(/\D/g, ''),
        birthday: formData.birthday,
        occupation: formData.occupation.trim(),
        portfolio: formData.portfolio.trim() || null,

        // Habilidades
        skills: formData.skills.filter(skill => skill.trim() !== '')
      };

      // Adicionar senha se fornecida
      if (formData.password) {
        updateData.senha = formData.password;
      }

      // Enviar para o backend
      const response = await fetch('https://skill-web-backend.onrender.com/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao atualizar: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSuccess("Perfil atualizado com sucesso!");
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        throw new Error(result.error || 'Erro ao atualizar perfil');
      }

    } catch (error) {
      console.error('Erro ao atualizar:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error && !submitting) {
    return <ErrorScreen error={error} onRetry={fetchUserData} />;
  }

  return (
    <div className="signUp">
      <Header />
      
      <section className="signUp-section">
        <div className="edit-header">
          <h2>
            <User size={24} />
            EDITAR PERFIL - FREELANCER
          </h2>
          <Link to="/profile" className="back-link">
            <ArrowLeft size={20} />
            Voltar ao Perfil
          </Link>
        </div>

        {/* Mensagens de status */}
        {success && (
          <div className="alert success">
            <Save size={20} />
            <span>{success} Redirecionando...</span>
          </div>
        )}

        {error && (
          <div className="alert error">
            <span>{error}</span>
          </div>
        )}

        <div className="signUp-form edit-form">
          <form onSubmit={handleSubmit}>
            {/* Dados Pessoais */}
            <FormSection 
              icon={<User size={20} />}
              title="Dados Pessoais"
            >
              <FormField
                label="Nome Completo *"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={formErrors.name}
                placeholder="João Silva"
                required
                disabled={submitting}
              />

              <FormField
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={formErrors.email}
                placeholder="seu@email.com"
                required
                disabled={submitting}
              />

              <div className="form-row">
                <FormField
                  label="CPF *"
                  name="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={handleCpfChange}
                  error={formErrors.cpf}
                  placeholder="000.000.000-00"
                  maxLength="14"
                  required
                  disabled={submitting}
                />

                <FormField
                  label="Data de Nascimento *"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  error={formErrors.birthday}
                  required
                  disabled={submitting}
                />
              </div>

              <FormField
                label="Ocupação/Profissão *"
                name="occupation"
                type="text"
                value={formData.occupation}
                onChange={handleInputChange}
                error={formErrors.occupation}
                placeholder="Desenvolvedor Front-end, Designer UX, etc."
                required
                disabled={submitting}
              />
            </FormSection>

            {/* Contato e Localização */}
            <FormSection 
              icon={<MapPin size={20} />}
              title="Contato e Localização"
            >
              <FormField
                label="Telefone/WhatsApp"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
                disabled={submitting}
              />

              <div className="form-row">
                <FormField
                  label="Cidade"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo, Rio de Janeiro..."
                  disabled={submitting}
                />

                <FormField
                  label="Estado (UF)"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleInputChange}
                  error={formErrors.state}
                  placeholder="SP, RJ, MG"
                  maxLength="2"
                  disabled={submitting}
                />
              </div>
            </FormSection>

            {/* Redes Sociais e Portfólio */}
            <FormSection 
              icon={<Globe size={20} />}
              title="Redes Sociais e Portfólio"
            >
              <FormField
                label="LinkedIn"
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/seuperfil"
                disabled={submitting}
              />

              <FormField
                label="Instagram"
                name="instagram"
                type="url"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/seuperfil"
                disabled={submitting}
              />

              <FormField
                label="Portfólio"
                name="portfolio"
                type="url"
                value={formData.portfolio}
                onChange={handleInputChange}
                placeholder="https://meuportfolio.com"
                disabled={submitting}
              />
            </FormSection>

            {/* Habilidades */}
            <FormSection 
              icon={<Award size={20} />}
              title="Habilidades e Competências"
              description="Adicione suas principais habilidades (tecnologias, ferramentas, soft skills). Pelo menos uma habilidade é obrigatória."
            >
              {formErrors.skills && (
                <div className="error-text">{formErrors.skills}</div>
              )}
              
              <div className="skills-grid">
                {formData.skills.map((skill, index) => (
                  <FormField
                    key={index}
                    label={`Habilidade ${index + 1} ${index === 0 ? '*' : ''}`}
                    name={`skill-${index}`}
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder={getSkillPlaceholder(index)}
                    required={index === 0}
                    disabled={submitting}
                  />
                ))}
              </div>
            </FormSection>

            {/* Biografia */}
            <FormSection 
              icon={<BookOpen size={20} />}
              title="Biografia e Apresentação"
              description="Conte um pouco sobre sua experiência, formação, objetivos profissionais e o que te motiva."
            >
              <div className="form-group">
                <label className="form-label">Sobre você</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Ex: Sou desenvolvedor front-end com 3 anos de experiência, especializado em React e TypeScript..."
                  rows="6"
                  className="form-textarea"
                  disabled={submitting}
                />
              </div>
            </FormSection>

            {/* Alteração de Senha */}
            <FormSection 
              icon={<Lock size={20} />}
              title="Alteração de Senha"
              description="Preencha apenas se desejar alterar sua senha atual. Deixe os campos em branco para manter a senha atual."
            >
              <div className="form-row">
                <FormField
                  label="Nova Senha"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={formErrors.password}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                  disabled={submitting}
                />

                <FormField
                  label="Confirme a Senha"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={formErrors.confirmPassword}
                  placeholder="Digite a mesma senha"
                  minLength="6"
                  disabled={submitting}
                />
              </div>
            </FormSection>

            {/* Ações Finais */}
            <FormSection title="Finalizar Edição">
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Salvar Alterações
                    </>
                  )}
                </button>

                <Link to="/profile" className="btn-secondary">
                  <ArrowLeft size={18} />
                  Cancelar
                </Link>
              </div>
            </FormSection>
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

function FormSection({ icon, title, description, children }) {
  return (
    <div className="form-section">
      <h3 className="section-title">
        {icon}
        {title}
      </h3>
      {description && <p className="section-description">{description}</p>}
      {children}
    </div>
  );
}

function FormField({ label, name, type, value, onChange, error, placeholder, required, disabled, ...props }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={error ? 'input-error' : ''}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
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
          <div className="loading-spinner"></div>
          <p>Carregando seus dados...</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  const navigate = useNavigate();
  
  return (
    <div className="signUp">
      <Header />
      <section className="signUp-section">
        <div className="edit-header">
          <h2>EDITAR PERFIL - FREELANCER</h2>
        </div>
        <div className="error-container">
          <div className="error-content">
            <h3>Erro ao Carregar Dados</h3>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={onRetry} className="btn-primary">
                Tentar Novamente
              </button>
              <button onClick={() => navigate('/profile')} className="btn-secondary">
                Voltar ao Perfil
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary">
                Fazer Login
              </button>
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
      <div className="footer-content">
        <div className="footer-section">
          <img src="/logoNome.png" alt="SkillMatch" className="footer-logo" />
        </div>
        
        <div className="footer-section">
          <h3>Desenvolvido por:</h3>
          <div className="developer-links">
            <a href="mailto:viiallvesx@gmail.com">Ana Vitória Alves</a>
            <a href="mailto:gibarbutti@gmail.com">Giovanna Barbutti</a>
            <a href="mailto:thomasdamasena2@gmail.com">Thomas Solera</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Contato</h3>
          <div className="contact-info">
            <div className="contact-item">
              <Instagram size={16} />
              <span>@skillmatch.app</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <a href="mailto:skillmatchapp0@gmail.com">skillmatchapp0@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 SkillMatch. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

// Função auxiliar
function getSkillPlaceholder(index) {
  const placeholders = [
    "React, JavaScript, TypeScript",
    "UI/UX Design, Figma",
    "Node.js, Python",
    "Git, Docker, AWS", 
    "Comunicação, Liderança",
    "Inglês, Espanhol"
  ];
  return placeholders[index] || "Sua habilidade";
}