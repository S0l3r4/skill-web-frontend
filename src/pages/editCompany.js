import '../styles/index.css';
import { Mail, Instagram, ArrowLeft, AlertCircle, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function EditCompany() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name_user: '',
    email_user: '',
    cnpj_company: '',
    phone_user: '',
    city_user: '',
    state_user: '',
    linkedin_link_user: '',
    insta_link_user: '',
    bio_user: '',
    senha: '',
    confirmarSenha: ''
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
      console.log("🔄 Buscando dados da empresa no Supabase...");

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
        throw new Error("Erro ao carregar dados da empresa");
      }

      console.log("📦 Dados do usuário:", userData);

      // Buscar dados da empresa
      const { data: companyData, error: companyError } = await supabase
        .from("company")
        .select("*")
        .eq("id_user", userData.id_user)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error("❌ Erro ao buscar empresa:", companyError);
      }

      // Combinar todos os dados
      setUser({
        ...session.user,
        ...userData,
        ...companyData
      });

      // Preencher formulário
      setFormData({
        name_user: userData.name_user || '',
        email_user: session.user.email || '',
        cnpj_company: companyData?.cnpj_company || '',
        phone_user: userData.phone_user || '',
        city_user: userData.city_user || '',
        state_user: userData.state_user || '',
        linkedin_link_user: userData.linkedin_link_user || '',
        insta_link_user: userData.insta_link_user || '',
        bio_user: userData.bio_user || '',
        senha: '',
        confirmarSenha: ''
      });

      console.log("✅ Formulário da empresa preenchido com sucesso!");

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

      console.log("📤 Atualizando dados da empresa no Supabase...", formData);

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

      // 2. Buscar ID da empresa
      const { data: companyData, error: companyFetchError } = await supabase
        .from("company")
        .select("id_company")
        .eq("id_user", userId)
        .single();

      let companyId = companyData?.id_company;

      // 3. Atualizar/Criar empresa
      if (companyId) {
        // Atualizar empresa existente
        const { error: companyUpdateError } = await supabase
          .from("company")
          .update({
            cnpj_company: formData.cnpj_company
          })
          .eq("id_company", companyId);

        if (companyUpdateError) {
          throw new Error("Erro ao atualizar empresa: " + companyUpdateError.message);
        }
      } else {
        // Criar nova empresa
        const { data: newCompany, error: companyCreateError } = await supabase
          .from("company")
          .insert([
            {
              id_user: userId,
              cnpj_company: formData.cnpj_company
            }
          ])
          .select()
          .single();

        if (companyCreateError) {
          throw new Error("Erro ao criar empresa: " + companyCreateError.message);
        }
        companyId = newCompany.id_company;
      }

      // 4. Atualizar senha se fornecida
      if (formData.senha) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.senha
        });

        if (passwordError) {
          throw new Error("Erro ao atualizar senha: " + passwordError.message);
        }
      }

      alert("✅ Dados da empresa atualizados com sucesso!");
      navigate('/profile');

    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      alert('❌ Erro ao atualizar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formatar CNPJ (mantido igual)
  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return numbers.replace(/(\d{2})(\d{0,3})/, '$1.$2');
    if (numbers.length <= 8) return numbers.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
    if (numbers.length <= 12) return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  };

  const handleCnpjChange = (e) => {
    const formattedCnpj = formatCNPJ(e.target.value);
    setFormData(prevState => ({
      ...prevState,
      cnpj_company: formattedCnpj
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
            <h2>EDITAR PERFIL - EMPRESA</h2>
          </div>
          
          <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p>Carregando dados da empresa...</p>
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
            <h2>EDITAR PERFIL - EMPRESA</h2>
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
          <h2>
            <Building size={24} style={{ marginRight: '10px' }} />
            EDITAR PERFIL - EMPRESA
          </h2>
          <Link to="/profile" className="back-link">
            <ArrowLeft size={20} />
            Voltar ao Perfil
          </Link>
        </div>
        
        <div className="signUp-form edit-form">
          <form onSubmit={handleSubmit}>
            
            {/* DADOS DA EMPRESA - BLOCO 1 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">
                <Building size={20} style={{ marginRight: '8px' }} />
                Dados da Empresa
              </h3>
              
              <div className="form-group">
                <label htmlFor="name_user" className="form-label-edit">Razão Social *</label>
                <input 
                  placeholder="Nome completo da sua empresa ou organização" 
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
                <label htmlFor="email_user" className="form-label-edit">Email Corporativo *</label>
                <input 
                  placeholder="contato@empresa.com ou comercial@empresa.com" 
                  type="email" 
                  id="email_user" 
                  name="email_user" 
                  value={formData.email_user}
                  onChange={handleInputChange}
                  required 
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cnpj_company" className="form-label-edit">CNPJ *</label>
                <input 
                  placeholder="00.000.000/0000-00" 
                  type="text" 
                  id="cnpj_company" 
                  name="cnpj_company" 
                  value={formData.cnpj_company}
                  onChange={handleCnpjChange}
                  maxLength="18"
                  required 
                  disabled={loading}
                />
              </div>
            </div>

            {/* CONTATO E LOCALIZAÇÃO - BLOCO 2 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">📞 Contato e Localização</h3>
              
              <div className="form-group">
                <label htmlFor="phone_user" className="form-label-edit">Telefone Comercial</label>
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

            {/* REDES SOCIAIS - BLOCO 3 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">🌐 Redes Sociais Corporativas</h3>
              
              <div className="form-group">
                <label htmlFor="linkedin_link_user" className="form-label-edit">LinkedIn da Empresa</label>
                <input 
                  placeholder="https://linkedin.com/company/sua-empresa" 
                  type="url" 
                  id="linkedin_link_user" 
                  name="linkedin_link_user" 
                  value={formData.linkedin_link_user}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="insta_link_user" className="form-label-edit">Instagram da Empresa</label>
                <input 
                  placeholder="https://instagram.com/suaempresa" 
                  type="url" 
                  id="insta_link_user" 
                  name="insta_link_user" 
                  value={formData.insta_link_user}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* SOBRE A EMPRESA - BLOCO 4 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">📖 Sobre a Empresa</h3>
              
              <div className="form-info-edit">
                Compartilhe informações sobre sua empresa, missão, valores, área de atuação e cultura organizacional.
              </div>

              <div className="form-group">
                <label htmlFor="bio_user" className="form-label-edit">Descrição da Empresa</label>
                <textarea 
                  placeholder="Ex: Somos uma empresa especializada em desenvolvimento de software, fundada em 2020. Nossa missão é transformar ideias em soluções digitais inovadoras. Atuamos no mercado de tecnologia com foco em aplicações web e mobile, valorizando a qualidade, inovação e satisfação dos nossos clientes..." 
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

            {/* ALTERAÇÃO DE SENHA - BLOCO 5 */}
            <div className="form-section-edit" style={{ marginBottom: '40px' }}>
              <h3 className="section-title">🔒 Alteração de Senha</h3>
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

            {/* BOTÕES DE AÇÃO - BLOCO 6 */}
            <div className="form-section-edit" style={{ marginBottom: '20px' }}>
              <h3 className="section-title">✅ Finalizar Edição</h3>
              
              <div className="form-info-edit">
                Revise todas as informações antes de salvar. Após a confirmação, 
                suas alterações serão atualizadas imediatamente no perfil da empresa.
              </div>

              <div className="form-actions-edit">
                <button type="submit" className="btnsubmit btn-edit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Atualizando Empresa...
                    </>
                  ) : (
                    "💼 Salvar Todas as Alterações"
                  )}
                </button>
                
                <Link to="/profile" className="btn-cancel-edit">
                  ↩️ Cancelar e Voltar
                </Link>
              </div>

              <div style={{ 
                marginTop: '25px', 
                padding: '18px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '10px', 
                borderLeft: '4px solid #007bff',
                border: '1px solid #e9ecef'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9em', 
                  color: '#004085',
                  lineHeight: '1.5'
                }}>
                  <strong>💼 Dica Corporativa:</strong> Um perfil completo ajuda a atrair os melhores talentos freelancers para sua empresa!
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