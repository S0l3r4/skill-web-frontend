import '../styles/index.css';
import { Mail, Instagram, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function EditFreelancer() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name_user: '',
    email_user: '',
    cpf_freelancer: '',
    birthday_freelancer: '',
    phone_user: '',
    city_user: '',
    state_user: '',
    linkedin_link_user: '',
    insta_link_user: '',
    bio_user: '',
    ocuppation_freelancer: '',
    link_portfolio_freelancer: '',
    senha: '',
    confirmarSenha: '',
    skill_1: '',
    skill_2: '',
    skill_3: '',
    skill_4: '',
    skill_5: '',
    skill_6: ''
  });

  const navigate = useNavigate();

  // ✅ CARREGAR DADOS DIRETO DO SUPABASE
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoadingData(true);
      setError('');
      console.log("🔄 Buscando dados do usuário no Supabase...");

      // Verificar sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Usuário não está logado. Faça login novamente.");
      }

      console.log("✅ Sessão ativa:", session.user.email);

      // Buscar dados do usuário na tabela USER
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("email_user", session.user.email)
        .single();

      if (userError) {
        console.error("❌ Erro ao buscar usuário:", userError);
        throw new Error("Erro ao carregar dados do usuário");
      }

      console.log("📦 Dados do usuário:", userData);

      // Buscar dados do freelancer
      const { data: freelancerData, error: freelancerError } = await supabase
        .from("freelancer")
        .select("*")
        .eq("id_user", userData.id_user)
        .single();

      if (freelancerError && freelancerError.code !== 'PGRST116') {
        console.error("❌ Erro ao buscar freelancer:", freelancerError);
      }

      // Buscar habilidades
      const { data: skillsData, error: skillsError } = await supabase
        .from("skills")
        .select("*")
        .eq("id_freelancer", freelancerData?.id_freelancer)
        .single();

      if (skillsError && skillsError.code !== 'PGRST116') {
        console.error("❌ Erro ao buscar habilidades:", skillsError);
      }

      // Combinar todos os dados
      setUser({
        ...session.user,
        ...userData,
        ...freelancerData,
        ...skillsData
      });

      // Preencher formulário
      setFormData({
        name_user: userData.name_user || '',
        email_user: session.user.email || '',
        cpf_freelancer: freelancerData?.cpf_freelancer || '',
        birthday_freelancer: freelancerData?.birthday_freelancer || '',
        phone_user: userData.phone_user || '',
        city_user: userData.city_user || '',
        state_user: userData.state_user || '',
        linkedin_link_user: userData.linkedin_link_user || '',
        insta_link_user: userData.insta_link_user || '',
        bio_user: userData.bio_user || '',
        ocuppation_freelancer: freelancerData?.ocuppation_freelancer || '',
        link_portfolio_freelancer: freelancerData?.link_portfolio_freelancer || '',
        senha: '',
        confirmarSenha: '',
        skill_1: skillsData?.skill_1 || '',
        skill_2: skillsData?.skill_2 || '',
        skill_3: skillsData?.skill_3 || '',
        skill_4: skillsData?.skill_4 || '',
        skill_5: skillsData?.skill_5 || '',
        skill_6: skillsData?.skill_6 || ''
      });

      console.log("✅ Formulário preenchido com sucesso!");

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setError(error.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // ✅ ATUALIZAR DADOS DIRETO NO SUPABASE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validação
      if (formData.senha && formData.senha !== formData.confirmarSenha) {
        alert("⚠️ As senhas não coincidem!");
        setLoading(false);
        return;
      }

      console.log("📤 Atualizando dados no Supabase...", formData);

      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Usuário não está logado");
      }

      // Buscar ID do usuário
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("id_user")
        .eq("email_user", session.user.email)
        .single();

      if (userError) {
        throw new Error("Erro ao identificar usuário");
      }

      const userId = userData.id_user;

      // 1. Atualizar tabela USER
      const { error: userUpdateError } = await supabase
        .from("user")
        .update({
          name_user: formData.name_user,
          phone_user: formData.phone_user,
          city_user: formData.city_user,
          state_user: formData.state_user,
          linkedin_link_user: formData.linkedin_link_user,
          insta_link_user: formData.insta_link_user,
          bio_user: formData.bio_user
        })
        .eq("id_user", userId);

      if (userUpdateError) {
        throw new Error("Erro ao atualizar dados do usuário: " + userUpdateError.message);
      }

      // 2. Buscar ID do freelancer
      const { data: freelancerData, error: freelancerFetchError } = await supabase
        .from("freelancer")
        .select("id_freelancer")
        .eq("id_user", userId)
        .single();

      let freelancerId = freelancerData?.id_freelancer;

      // 3. Atualizar/Criar freelancer
      if (freelancerId) {
        // Atualizar freelancer existente
        const { error: freelancerUpdateError } = await supabase
          .from("freelancer")
          .update({
            cpf_freelancer: formData.cpf_freelancer,
            birthday_freelancer: formData.birthday_freelancer,
            ocuppation_freelancer: formData.ocuppation_freelancer,
            link_portfolio_freelancer: formData.link_portfolio_freelancer
          })
          .eq("id_freelancer", freelancerId);

        if (freelancerUpdateError) {
          throw new Error("Erro ao atualizar freelancer: " + freelancerUpdateError.message);
        }
      } else {
        // Criar novo freelancer
        const { data: newFreelancer, error: freelancerCreateError } = await supabase
          .from("freelancer")
          .insert([
            {
              id_user: userId,
              cpf_freelancer: formData.cpf_freelancer,
              birthday_freelancer: formData.birthday_freelancer,
              ocuppation_freelancer: formData.ocuppation_freelancer,
              link_portfolio_freelancer: formData.link_portfolio_freelancer
            }
          ])
          .select()
          .single();

        if (freelancerCreateError) {
          throw new Error("Erro ao criar freelancer: " + freelancerCreateError.message);
        }
        freelancerId = newFreelancer.id_freelancer;
      }

      // 4. Atualizar/Criar habilidades
      if (freelancerId) {
        const { data: existingSkills, error: skillsFetchError } = await supabase
          .from("skills")
          .select("id_skill")
          .eq("id_freelancer", freelancerId)
          .single();

        if (existingSkills) {
          // Atualizar habilidades existentes
          const { error: skillsUpdateError } = await supabase
            .from("skills")
            .update({
              skill_1: formData.skill_1,
              skill_2: formData.skill_2,
              skill_3: formData.skill_3,
              skill_4: formData.skill_4,
              skill_5: formData.skill_5,
              skill_6: formData.skill_6
            })
            .eq("id_freelancer", freelancerId);

          if (skillsUpdateError) {
            throw new Error("Erro ao atualizar habilidades: " + skillsUpdateError.message);
          }
        } else {
          // Criar novas habilidades
          const { error: skillsCreateError } = await supabase
            .from("skills")
            .insert([
              {
                id_freelancer: freelancerId,
                skill_1: formData.skill_1,
                skill_2: formData.skill_2,
                skill_3: formData.skill_3,
                skill_4: formData.skill_4,
                skill_5: formData.skill_5,
                skill_6: formData.skill_6
              }
            ]);

          if (skillsCreateError) {
            throw new Error("Erro ao criar habilidades: " + skillsCreateError.message);
          }
        }
      }

      // 5. Atualizar senha se fornecida
      if (formData.senha) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.senha
        });

        if (passwordError) {
          throw new Error("Erro ao atualizar senha: " + passwordError.message);
        }
      }

      alert("✅ Dados atualizados com sucesso!");
      navigate('/profile');

    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      alert('❌ Erro ao atualizar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatar CPF (mantido igual)
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return numbers.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    if (numbers.length <= 9) return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  };

  const handleCpfChange = (e) => {
    const formattedCpf = formatCPF(e.target.value);
    setFormData(prevState => ({
      ...prevState,
      cpf_freelancer: formattedCpf
    }));
  };

  // ✅ RESTANTE DO CÓDIGO (JSX MANTIDO IGUAL) - só ajustei os "name" dos inputs
  // Tela de carregamento (mantido igual)
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
            <small>Buscando informações no Supabase</small>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Tela de erro (mantido igual)
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
                  id="name_user"
                  name="name_user"
                  value={formData.name_user}
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
                  id="email_user"
                  name="email_user"
                  value={formData.email_user}
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
                    id="cpf_freelancer"
                    name="cpf_freelancer"
                    value={formData.cpf_freelancer}
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
                    id="birthday_freelancer"
                    name="birthday_freelancer"
                    value={formData.birthday_freelancer}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
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
                  id="phone_user"
                  name="phone_user"
                  value={formData.phone_user}
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
                    id="city_user"
                    name="city_user"
                    value={formData.city_user}
                    onChange={handleInputChange}
                    disabled={loading}
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
                  id="linkedin_link_user"
                  name="linkedin_link_user"
                  value={formData.linkedin_link_user}
                  onChange={handleInputChange}
                  disabled={loading}
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
                  disabled={loading}
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
                  id="bio_user"
                  name="bio_user"
                  rows="6"
                  value={formData.bio_user}
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
              <h3 className="section-title">✅ Finalizar Edição</h3>
              
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