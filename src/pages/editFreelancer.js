import '../styles/index.css';
import '../styles/profile.css';
import { ArrowLeft, Instagram, Mail, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function EditFreelancer() {
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    email: '',
    cpf: '',
    birthday: '',
    occupation: '',

    // Contato e Localização
    phone: '',
    city: '',
    state: '',

    // Redes Sociais e Portfólio
    linkedin: '',
    instagram: '',
    portfolio: '',

    // Biografia
    bio: '',

    // Habilidades
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
      console.log("Buscando dados do usuário...");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Usuário não autenticado - faça login novamente");
      }

      const token = session.access_token;

      // Buscar dados do backend
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
      console.log("Dados recebidos:", result);

      if (result.success) {
        const user = result.user;

        // Preencher formulário com dados do usuário
        setFormData({
          name: user.name_user || '',
          email: user.email_user || '',
          cpf: user.cpf_freelancer || '',
          birthday: user.birthday_freelancer || '',
          occupation: user.ocuppation_freelancer || user.ocupation_freelancer || user.occupation_freelancer || '',
          phone: user.phone_user || '',
          city: user.city_user || '',
          state: user.state_user || '',
          linkedin: user.linkedin_link_user || '',
          instagram: user.insta_link_user || '',
          portfolio: user.link_portfolio_freelancer || '',
          bio: user.bio_user || '',
          // Habilidades (você precisará adaptar conforme sua estrutura)
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
      } else {
        throw new Error(result.error || 'Erro ao carregar dados');
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error.message);
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
      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{3})/, '$1.$2');
      }
    }

    setFormData(prev => ({
      ...prev,
      cpf: value
    }));
  };

  // VALIDAR FORMULÁRIO
  const validateForm = () => {
    if (!formData.name.trim()) {
      throw new Error("Nome completo é obrigatório");
    }
    if (!formData.email.trim()) {
      throw new Error("Email é obrigatório");
    }
    if (!formData.cpf.toString().trim()) {
      throw new Error("CPF é obrigatório");
    }
    if (!formData.birthday) {
      throw new Error("Data de nascimento é obrigatória");
    }
    if (!formData.occupation.trim()) {
      throw new Error("Ocupação é obrigatória");
    }
    if (!formData.skill_1.trim()) {
      throw new Error("Pelo menos uma habilidade é obrigatória");
    }
    if (formData.senha && formData.senha.length < 6) {
      throw new Error("A senha deve ter no mínimo 6 caracteres");
    }
    if (formData.senha !== formData.confirmarSenha) {
      throw new Error("As senhas não coincidem");
    }

    // Validar CPF (formato básico)
    const cpfNumbers = formData.cpf.toString().replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      throw new Error("CPF deve ter 11 dígitos");
    }
  };

  // ENVIAR DADOS PARA ATUALIZAÇÃO
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // Validar formulário
      validateForm();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Sessão expirada - faça login novamente");
      }

      const token = session.access_token;

      // Preparar dados para envio
      const updateData = {
        // Dados básicos
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        bio: formData.bio,

        // Dados do freelancer
        cpf: formData.cpf?.toString().replace(/\D/g, ''),
        birthday: formData.birthday,
        occupation: formData.occupation, // ← frontend usa 1 "p"
        portfolio: formData.portfolio,

        // SKILLS PARA A TABELA SEPARADA
        skills: [
          formData.skill_1,
          formData.skill_2,
          formData.skill_3,
          formData.skill_4,
          formData.skill_5,
          formData.skill_6
        ].filter(skill => skill.trim() !== ''),

        // Senha
        ...(formData.senha && { senha: formData.senha })
      };

      console.log("Enviando dados para atualização:", updateData);

      // Chamar backend para atualizar
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
      console.log("Resposta da atualização:", result);

      if (result.success) {
        alert("Perfil atualizado com sucesso!");
        navigate('/profile');
      } else {
        throw new Error(result.error || 'Erro ao atualizar perfil');
      }

    } catch (error) {
      console.error('Erro ao atualizar:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // RENDERIZAÇÃO (use o mesmo JSX que você já tem)

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

            {/* DADOS PESSOAIS - BLOCO 1 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">📝 Dados Pessoais</h3>

              <div className="form-group">
                <label htmlFor="name_user" className="form-label-edit">Nome Completo *</label>
                <input
                  placeholder="João Silva"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email_user" className="form-label-edit">Email *</label>
                <input
                  placeholder="seu@email.com"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row-edit">
                <div className="form-group">
                  <label htmlFor="cpf_freelancer" className="form-label-edit">CPF *</label>
                  <input
                    placeholder="000.000.000-00"
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    maxLength="14"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthday_freelancer" className="form-label-edit">Data de Nascimento *</label>
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="occupation" className="form-label-edit">Ocupação/Profissão *</label>
                <input
                  placeholder="Ex: Desenvolvedor Front-end, Designer UX, Marketing Digital"
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* CONTATO E LOCALIZAÇÃO - BLOCO 2 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">📞 Contato e Localização</h3>

              <div className="form-group">
                <label htmlFor="phone_user" className="form-label-edit">Telefone/WhatsApp</label>
                <input
                  placeholder="(11) 99999-9999"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-row-edit">
                <div className="form-group">
                  <label htmlFor="city_user" className="form-label-edit">Cidade</label>
                  <input
                    placeholder="São Paulo, Rio de Janeiro, Belo Horizonte..."
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state_user" className="form-label-edit">Estado (UF)</label>
                  <input
                    placeholder="SP, RJ, MG, etc."
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    maxLength="2"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* REDES SOCIAIS E PORTFÓLIO - BLOCO 3 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">🌐 Redes Sociais e Portfólio</h3>

              <div className="form-group">
                <label htmlFor="linkedin_link_user" className="form-label-edit">LinkedIn</label>
                <input
                  placeholder="https://linkedin.com/in/seuperfil"
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="insta_link_user" className="form-label-edit">Instagram</label>
                <input
                  placeholder="https://instagram.com/seuperfil"
                  type="url"
                  id="insta"
                  name="insta"
                  value={formData.insta}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="link_portfolio_freelancer" className="form-label-edit">Link do Portfólio</label>
                <input
                  placeholder="https://meuportfolio.com ou https://github.com/seuperfil"
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* BIOGRAFIA - BLOCO 4 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">📖 Biografia e Apresentação</h3>

              <div className="form-info-edit">
                Conte um pouco sobre sua experiência, formação, objetivos profissionais e o que te motiva.
              </div>

              <div className="form-group">
                <label htmlFor="bio_user" className="form-label-edit">Sobre você</label>
                <textarea
                  placeholder="Ex: Sou desenvolvedor front-end com 3 anos de experiência, especializado em React e TypeScript. Formado em Ciência da Computação, busco oportunidades para trabalhar em projetos desafiadores que impactem positivamente os usuários..."
                  id="bio"
                  name="bio"
                  rows="6"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="form-textarea"
                  disabled={loading}
                />
              </div>
            </div>

            {/* HABILIDADES E COMPETÊNCIAS - BLOCO 5 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">💼 Habilidades & Competências</h3>
              <p className="form-info-edit">
                Adicione até 6 habilidades principais que representam seu expertise.
                Seja específico: inclua tecnologias, ferramentas, metodologias e soft skills.
              </p>

              <div className="skills-input-grid">
                <div className="form-group">
                  <label htmlFor="skill_1" className="form-label-edit">Habilidade Principal 1 *</label>
                  <input
                    placeholder="Ex: JavaScript, React, UI/UX Design, Marketing Digital, Gestão de Projetos"
                    type="text"
                    id="skill_1"
                    name="skill_1"
                    value={formData.skill_1}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_2" className="form-label-edit">Habilidade Principal 2</label>
                  <input
                    placeholder="Ex: TypeScript, Node.js, Figma, SEO, Scrum"
                    type="text"
                    id="skill_2"
                    name="skill_2"
                    value={formData.skill_2}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_3" className="form-label-edit">Habilidade Principal 3</label>
                  <input
                    placeholder="Ex: Python, Vue.js, Adobe Photoshop, Copywriting, Metodologias Ágeis"
                    type="text"
                    id="skill_3"
                    name="skill_3"
                    value={formData.skill_3}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_4" className="form-label-edit">Habilidade Principal 4</label>
                  <input
                    placeholder="Ex: PHP, Angular, Illustrator, Google Analytics, Liderança"
                    type="text"
                    id="skill_4"
                    name="skill_4"
                    value={formData.skill_4}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_5" className="form-label-edit">Habilidade Principal 5</label>
                  <input
                    placeholder="Ex: Java, Next.js, After Effects, WordPress, Comunicação"
                    type="text"
                    id="skill_5"
                    name="skill_5"
                    value={formData.skill_5}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skill_6" className="form-label-edit">Habilidade Principal 6</label>
                  <input
                    placeholder="Ex: SQL, Flutter, Premiere Pro, Inbound Marketing, Resolução de Problemas"
                    type="text"
                    id="skill_6"
                    name="skill_6"
                    value={formData.skill_6}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* ALTERAÇÃO DE SENHA - BLOCO 6 */}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO - BLOCO 7 */}
            <div className="form-section-edit" style={{ marginBottom: '20px' }}>
              <h3 className="section-title">Finalizar Edição</h3>

              <div className="form-info-edit">
                Revise todas as informações antes de salvar. Após a confirmação,
                suas alterações serão atualizadas imediatamente no seu perfil.
              </div>

              <div className="form-actions-edit">
                <button type="submit" className="btnsubmit btn-edit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Atualizando Perfil...
                    </>
                  ) : (
                    "💾 Salvar Todas as Alterações"
                  )}
                </button>

                <Link to="/profile" className="btn-cancel-edit">
                  ↩ Cancelar e Voltar
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
                  <strong>💡 Dica:</strong> Após salvar, visite seu perfil para visualizar como ficou!
                  Suas habilidades aparecerão na seção dedicada do seu perfil.
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

// Componente Footer (mantido igual)
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

