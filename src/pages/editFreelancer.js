import '../styles/index.css';
import '../styles/profile.css';
import { ArrowLeft, Instagram, Mail, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function EditFreelancer() {
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Dados básicos
    name_user: '',
    email_user: '',
    phone_user: '',
    city_user: '',
    state_user: '',
    linkedin_link_user: '',
    insta_link_user: '',
    bio_user: '',

    // Dados específicos do freelancer - CORRIGIDO: usar ocuppation_freelancer
    cpf_freelancer: '',
    birthday_freelancer: '',
    ocuppation_freelancer: '', // NOME CORRETO DO CAMPO NO BANCO
    link_portfolio_freelancer: '',

    // Skills
    skill_1: '',
    skill_2: '',
    skill_3: '',
    skill_4: '',
    skill_5: '',
    skill_6: '',

    // Senha
    senha: '',
    confirmarSenha: ''
  });

  // BUSCAR DADOS DO USUÁRIO
  const fetchUserData = async () => {
    try {
      setLoadingData(true);
      setError('');
      console.log("Buscando dados do freelancer...");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Usuário não autenticado - faça login novamente");
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
        if (response.status === 401) {
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

      const result = await response.json();
      console.log("Dados recebidos do backend:", result);

      if (result.success) {
        const user = result.user;

        // Preencher formulário com tratamento seguro para null/undefined
        setFormData({
          name_user: user.name_user || '',
          email_user: user.email_user || '',
          phone_user: user.phone_user || '',
          city_user: user.city_user || '',
          state_user: user.state_user || '',
          linkedin_link_user: user.linkedin_link_user || '',
          insta_link_user: user.insta_link_user || '',
          bio_user: user.bio_user || '',
          cpf_freelancer: user.cpf_freelancer || '',
          birthday_freelancer: user.birthday_freelancer ? user.birthday_freelancer.split('T')[0] : '',
          // CORREÇÃO: usar o nome exato do campo do banco
          ocuppation_freelancer: user.ocuppation_freelancer || '',
          link_portfolio_freelancer: user.link_portfolio_freelancer || '',
          // Skills - inicializar vazias
          skill_1: '',
          skill_2: '',
          skill_3: '',
          skill_4: '',
          skill_5: '',
          skill_6: '',
          senha: '',
          confirmarSenha: ''
        });

        console.log("Dados carregados com sucesso!");
        console.log("Ocupação carregada:", user.ocuppation_freelancer);
      } else {
        throw new Error(result.error || 'Erro ao carregar dados do perfil');
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message);
      if (error.message.includes("não autenticado") || error.message.includes("Sessão expirada")) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // HANDLE INPUT CHANGE
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // FORMATAR CPF
  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      value = value.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    setFormData(prev => ({
      ...prev,
      cpf_freelancer: value
    }));
  };

  // VALIDAR FORMULÁRIO - CORREÇÃO: usar ocuppation_freelancer
  const validateForm = () => {
    const errors = [];

    // Garantir que cpf seja tratado como string antes de usar .trim()
    const cpfString = formData.cpf_freelancer ? String(formData.cpf_freelancer) : '';
    
    if (!formData.name_user || !formData.name_user.trim()) {
      errors.push("Nome completo é obrigatório");
    }

    if (!formData.email_user || !formData.email_user.trim()) {
      errors.push("Email é obrigatório");
    }

    if (!cpfString.trim()) {
      errors.push("CPF é obrigatório");
    } else if (cpfString.replace(/\D/g, '').length !== 11) {
      errors.push("CPF deve ter 11 dígitos");
    }

    if (!formData.birthday_freelancer) {
      errors.push("Data de nascimento é obrigatória");
    } else {
      const birthDate = new Date(formData.birthday_freelancer);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) {
        errors.push("Você deve ter pelo menos 16 anos");
      }
    }

    // CORREÇÃO: usar ocuppation_freelancer (nome correto do campo)
    if (!formData.ocuppation_freelancer || !formData.ocuppation_freelancer.toString().trim()) {
      errors.push("Ocupação é obrigatória");
    }

    if (formData.senha || formData.confirmarSenha) {
      if (formData.senha !== formData.confirmarSenha) {
        errors.push("As senhas não coincidem");
      }
      if (formData.senha && formData.senha.length < 6) {
        errors.push("A senha deve ter no mínimo 6 caracteres");
      }
    }

    return errors;
  };

  // ENVIAR DADOS PARA ATUALIZAÇÃO - CORREÇÃO: usar ocuppation_freelancer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log("Iniciando atualização...");
      console.log("Dados do formulário:", formData);

      // Validar formulário
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão expirada - faça login novamente");
      }

      const token = session.access_token;

      // PREPARAR DADOS DE FORMA SEGURA - CORREÇÃO: usar occupation (sem o 'p' extra) para o backend
      const updateData = {
        // Dados da tabela USER
        name: formData.name_user.trim(),
        email: formData.email_user.trim(),
        phone: formData.phone_user ? formData.phone_user.trim() : null,
        city: formData.city_user ? formData.city_user.trim() : null,
        state: formData.state_user ? formData.state_user.trim() : null,
        linkedin: formData.linkedin_link_user ? formData.linkedin_link_user.trim() : null,
        instagram: formData.insta_link_user ? formData.insta_link_user.trim() : null,
        bio: formData.bio_user ? formData.bio_user.trim() : null,

        // Dados da tabela FREELANCER
        cpf: formData.cpf_freelancer ? String(formData.cpf_freelancer).replace(/\D/g, '') : null,
        birthday: formData.birthday_freelancer || null,
        // CORREÇÃO: enviar como 'occupation' (sem o 'p' extra) para o backend processar
        occupation: formData.ocuppation_freelancer ? String(formData.ocuppation_freelancer).trim() : null,
        portfolio: formData.link_portfolio_freelancer ? formData.link_portfolio_freelancer.trim() : null,

        // Skills
        skills: [
          formData.skill_1,
          formData.skill_2,
          formData.skill_3,
          formData.skill_4,
          formData.skill_5,
          formData.skill_6
        ].filter(skill => skill && skill.trim() !== '')
      };

      // Adicionar senha apenas se fornecida
      if (formData.senha && formData.senha.trim()) {
        updateData.senha = formData.senha;
      }

      console.log("Dados preparados para envio:", updateData);

      // Chamar backend para atualizar
      const response = await fetch('https://skill-web-backend.onrender.com/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta:", errorText);
        throw new Error(`Erro ao atualizar perfil: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log("Resposta completa:", result);

      if (result.success) {
        alert("Perfil atualizado com sucesso!");
        navigate('/profile');
      } else {
        throw new Error(result.error || 'Erro desconhecido ao atualizar perfil');
      }

    } catch (error) {
      console.error('Erro completo:', error);
      alert('Erro ao atualizar: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Tela de carregamento
  if (loadingData) {
    return (
      <div className="signUp">
        <header>
          <div className="menu">
            <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
            <Link id="nomeheader" to="/">SkillMatch</Link>
          </div>
        </header>

        <section className="signUp-section">
          <div className="edit-header">
            <h2>EDITAR PERFIL - FREELANCER</h2>
          </div>

          <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p>Carregando seus dados...</p>
            <small>Aguarde enquanto buscamos suas informações</small>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div className="signUp">
        <header>
          <div className="menu">
            <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
            <Link id="nomeheader" to="/">SkillMatch</Link>
          </div>
        </header>

        <section className="signUp-section">
          <div className="edit-header">
            <h2>EDITAR PERFIL - FREELANCER</h2>
          </div>

          <div className="error-container">
            <div className="error-message">
              <div className="error-icon">
                <AlertCircle size={48} color="#dc3545" />
              </div>
              <h3>Erro ao Carregar Dados</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={fetchUserData} className="btn-submit">
                  Tentar Novamente
                </button>
                <Link to="/profile" className="btn-cancel">
                  Voltar ao Perfil
                </Link>
                <Link to="/login" className="btn-cancel">
                  Fazer Login
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="signUp">
      <header>
        <div className="menu">
          <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
          <Link id="nomeheader" to="/">SkillMatch</Link>
        </div>
      </header>

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
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">Dados Pessoais</h3>

              <div className="form-group">
                <label htmlFor="name_user" className="form-label-edit">Nome Completo *</label>
                <input
                  placeholder="João Silva"
                  type="text"
                  id="name_user"
                  name="name_user"
                  value={formData.name_user}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_user" className="form-label-edit">Email *</label>
                <input
                  placeholder="seu@email.com"
                  type="email"
                  id="email_user"
                  name="email_user"
                  value={formData.email_user}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-row-edit">
                <div className="form-group">
                  <label htmlFor="cpf_freelancer" className="form-label-edit">CPF *</label>
                  <input
                    placeholder="000.000.000-00"
                    type="text"
                    id="cpf_freelancer"
                    name="cpf_freelancer"
                    value={formData.cpf_freelancer}
                    onChange={handleCpfChange}
                    maxLength="14"
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthday_freelancer" className="form-label-edit">Data de Nascimento *</label>
                  <input
                    type="date"
                    id="birthday_freelancer"
                    name="birthday_freelancer"
                    value={formData.birthday_freelancer}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ocuppation_freelancer" className="form-label-edit">Ocupação/Profissão *</label>
                <input
                  placeholder="Ex: Desenvolvedor Front-end, Designer UX, Marketing Digital"
                  type="text"
                  id="ocuppation_freelancer"
                  name="ocuppation_freelancer"
                  value={formData.ocuppation_freelancer}
                  onChange={handleInputChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* CONTATO E LOCALIZAÇÃO */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">Contato e Localização</h3>

              <div className="form-group">
                <label htmlFor="phone_user" className="form-label-edit">Telefone/WhatsApp</label>
                <input
                  placeholder="(11) 99999-9999"
                  type="tel"
                  id="phone_user"
                  name="phone_user"
                  value={formData.phone_user}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-row-edit">
                <div className="form-group">
                  <label htmlFor="city_user" className="form-label-edit">Cidade</label>
                  <input
                    placeholder="São Paulo, Rio de Janeiro, Belo Horizonte..."
                    type="text"
                    id="city_user"
                    name="city_user"
                    value={formData.city_user}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state_user" className="form-label-edit">Estado (UF)</label>
                  <input
                    placeholder="SP, RJ, MG, etc."
                    type="text"
                    id="state_user"
                    name="state_user"
                    value={formData.state_user}
                    onChange={handleInputChange}
                    maxLength="2"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* REDES SOCIAIS E PORTFÓLIO */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">Redes Sociais e Portfólio</h3>

              <div className="form-group">
                <label htmlFor="linkedin_link_user" className="form-label-edit">LinkedIn</label>
                <input
                  placeholder="https://linkedin.com/in/seuperfil"
                  type="url"
                  id="linkedin_link_user"
                  name="linkedin_link_user"
                  value={formData.linkedin_link_user}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="insta_link_user" className="form-label-edit">Instagram</label>
                <input
                  placeholder="https://instagram.com/seuperfil"
                  type="url"
                  id="insta_link_user"
                  name="insta_link_user"
                  value={formData.insta_link_user}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="link_portfolio_freelancer" className="form-label-edit">Link do Portfólio</label>
                <input
                  placeholder="https://meuportfolio.com ou https://github.com/seuperfil"
                  type="url"
                  id="link_portfolio_freelancer"
                  name="link_portfolio_freelancer"
                  value={formData.link_portfolio_freelancer}
                  onChange={handleInputChange}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* HABILIDADES */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">Habilidades e Competências</h3>

              <div className="form-info-edit">
                Adicione suas principais habilidades (tecnologias, ferramentas, soft skills).
              </div>

              <div className="skills-input-grid">
                <div className="form-group">
                  <label htmlFor="skill_1" className="form-label-edit">Habilidade 1</label>
                  <input
                    placeholder="Ex: JavaScript, React, TypeScript"
                    type="text"
                    id="skill_1"
                    name="skill_1"
                    value={formData.skill_1}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_2" className="form-label-edit">Habilidade 2</label>
                  <input
                    placeholder="Ex: Node.js, Python, PHP"
                    type="text"
                    id="skill_2"
                    name="skill_2"
                    value={formData.skill_2}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_3" className="form-label-edit">Habilidade 3</label>
                  <input
                    placeholder="Ex: UI/UX Design, Figma, Adobe XD"
                    type="text"
                    id="skill_3"
                    name="skill_3"
                    value={formData.skill_3}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_4" className="form-label-edit">Habilidade 4</label>
                  <input
                    placeholder="Ex: Git, Docker, AWS"
                    type="text"
                    id="skill_4"
                    name="skill_4"
                    value={formData.skill_4}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_5" className="form-label-edit">Habilidade 5</label>
                  <input
                    placeholder="Ex: Comunicação, Liderança, Scrum"
                    type="text"
                    id="skill_5"
                    name="skill_5"
                    value={formData.skill_5}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_6" className="form-label-edit">Habilidade 6</label>
                  <input
                    placeholder="Ex: Inglês, Espanhol, Alemão"
                    type="text"
                    id="skill_6"
                    name="skill_6"
                    value={formData.skill_6}
                    onChange={handleInputChange}
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* BIOGRAFIA */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">Biografia e Apresentação</h3>

              <div className="form-info-edit">
                Conte um pouco sobre sua experiência, formação, objetivos profissionais e o que te motiva.
              </div>

              <div className="form-group">
                <label htmlFor="bio_user" className="form-label-edit">Sobre você</label>
                <textarea
                  placeholder="Ex: Sou desenvolvedor front-end com 3 anos de experiência, especializado em React e TypeScript. Formado em Ciência da Computação, busco oportunidades para trabalhar em projetos desafiadores que impactem positivamente os usuários..."
                  id="bio_user"
                  name="bio_user"
                  rows="6"
                  value={formData.bio_user}
                  onChange={handleInputChange}
                  className="form-textarea"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* ALTERAÇÃO DE SENHA */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">Alteração de Senha</h3>
              <p className="form-info-edit">
                Preencha apenas se desejar alterar sua senha atual.
                Deixe os campos em branco para manter a senha atual.
              </p>

              <div className="form-row-edit">
                <div className="form-group">
                  <label htmlFor="senha" className="form-label-edit">Nova Senha</label>
                  <input
                    placeholder="Mínimo 6 caracteres"
                    type="password"
                    id="senha"
                    name="senha"
                    value={formData.senha}
                    onChange={handleInputChange}
                    minLength="6"
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmarSenha" className="form-label-edit">Confirme a Nova Senha</label>
                  <input
                    placeholder="Digite a mesma senha novamente"
                    type="password"
                    id="confirmarSenha"
                    name="confirmarSenha"
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    minLength="6"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="form-section-edit" style={{ marginBottom: '20px' }}>
              <h3 className="section-title">Finalizar Edição</h3>

              <div className="form-info-edit">
                Revise todas as informações antes de salvar. Após a confirmação,
                suas alterações serão atualizadas imediatamente no seu perfil.
              </div>

              <div className="form-actions-edit">
                <button type="submit" className="btnsubmit btn-edit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="spinner"></div>
                      Atualizando Perfil...
                    </>
                  ) : (
                    "Salvar Todas as Alterações"
                  )}
                </button>

                <Link to="/profile" className="btn-cancel-edit">
                  Cancelar e Voltar
                </Link>
              </div>

              <div style={{
                marginTop: '25px',
                padding: '18px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                borderLeft: '4px solid #28a745',
                border: '1px solid #e9ecef'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.9em',
                  color: '#155724',
                  lineHeight: '1.5'
                }}>
                  <strong>Dica:</strong> Após salvar, visite seu perfil para visualizar como ficou!
                </p>
              </div>
            </div>

          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Componente Footer
function Footer() {
  return (
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
  );
}