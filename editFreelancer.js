[file name]: editFreelancer corrigido.js
[file content begin]
import '../styles/index.css';
import '../styles/profile.css';
import { ArrowLeft, Instagram, Mail, AlertCircle, Save } from "lucide-react";
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

    // Dados específicos do freelancer
    cpf_freelancer: '',
    birthday_freelancer: '',
    ocupation_freelancer: '',
    link_portfolio_freelancer: '',

    // Skills - corrigido para array
    skill_1: '',
    skill_2: '',
    skill_3: '',
    skill_4: '',
    skill_5: '',
    skill_6: '',

    // Senha
    new_password: '',
    confirmarSenha: ''
  });

  // BUSCAR DADOS DO USUÁRIO - CORRIGIDO
  const fetchUserData = async () => {
    try {
      setLoadingData(true);
      setError('');
      console.log("🔄 Buscando dados do freelancer...");

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
      console.log("🎯 Dados COMPLETOS recebidos do backend:", result);

      if (result.success) {
        const user = result.user;

        // ✅ CARREGAR SKILLS EXISTENTES - AGORA FUNCIONANDO
        const existingSkills = user.skills || [];
        console.log("🔍 Skills existentes encontradas:", existingSkills);
        console.log("🔍 Número de skills:", existingSkills.length);

        // Preencher formulário
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
          ocupation_freelancer: user.ocupation_freelancer || '',
          link_portfolio_freelancer: user.link_portfolio_freelancer || '',
          // ✅ PREENCHER SKILLS EXISTENTES CORRETAMENTE
          skill_1: existingSkills[0] || '',
          skill_2: existingSkills[1] || '',
          skill_3: existingSkills[2] || '',
          skill_4: existingSkills[3] || '',
          skill_5: existingSkills[4] || '',
          skill_6: existingSkills[5] || '',
          new_password: '',
          confirmarSenha: ''
        });

        console.log("✅ Dados carregados com sucesso!");
        console.log("📊 Skills no form:", {
          skill_1: existingSkills[0] || '',
          skill_2: existingSkills[1] || '',
          skill_3: existingSkills[2] || '',
          skill_4: existingSkills[3] || '',
          skill_5: existingSkills[4] || '',
          skill_6: existingSkills[5] || ''
        });
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

  // VALIDAR FORMULÁRIO
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

    if (!formData.ocupation_freelancer || !formData.ocupation_freelancer.toString().trim()) {
      errors.push("Ocupação é obrigatória");
    }

    if (formData.new_password || formData.confirmarSenha) {
      if (formData.new_password !== formData.confirmarSenha) {
        errors.push("As senhas não coincidem");
      }
      if (formData.new_password && formData.new_password.length < 6) {
        errors.push("A senha deve ter no mínimo 6 caracteres");
      }
    }

    return errors;
  };

  // ENVIAR DADOS PARA ATUALIZAÇÃO - CORRIGIDO
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      console.log("🚀 Iniciando atualização...");
      console.log("📋 Dados do formulário:", formData);

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

      // PREPARAR DADOS CORRETAMENTE
      const updateData = {
        // Dados da tabela USER
        name_user: formData.name_user.trim(),
        email_user: formData.email_user.trim(),
        phone_user: formData.phone_user ? formData.phone_user.trim() : '',
        city_user: formData.city_user ? formData.city_user.trim() : '',
        state_user: formData.state_user ? formData.state_user.trim() : '',
        linkedin_link_user: formData.linkedin_link_user ? formData.linkedin_link_user.trim() : '',
        insta_link_user: formData.insta_link_user ? formData.insta_link_user.trim() : '',
        bio_user: formData.bio_user ? formData.bio_user.trim() : '',

        // Dados da tabela FREELANCER
        cpf_freelancer: formData.cpf_freelancer ? String(formData.cpf_freelancer).replace(/\D/g, '') : '',
        birthday_freelancer: formData.birthday_freelancer || '',
        ocupation_freelancer: formData.ocupation_freelancer ? String(formData.ocupation_freelancer).trim() : '',
        link_portfolio_freelancer: formData.link_portfolio_freelancer ? formData.link_portfolio_freelancer.trim() : '',

        // ✅ SKILLS - AGORA ENVIADAS CORRETAMENTE
        skill_1: formData.skill_1 ? formData.skill_1.trim() : '',
        skill_2: formData.skill_2 ? formData.skill_2.trim() : '',
        skill_3: formData.skill_3 ? formData.skill_3.trim() : '',
        skill_4: formData.skill_4 ? formData.skill_4.trim() : '',
        skill_5: formData.skill_5 ? formData.skill_5.trim() : '',
        skill_6: formData.skill_6 ? formData.skill_6.trim() : '',
      };

      // Adicionar senha apenas se fornecida e confirmada
      if (formData.new_password && formData.new_password.trim() !== '' && 
          formData.new_password === formData.confirmarSenha) {
        updateData.new_password = formData.new_password.trim();
      }

      console.log("📤 Dados preparados para envio:", updateData);
      console.log("🔍 Skills que serão enviadas:", {
        skill_1: updateData.skill_1,
        skill_2: updateData.skill_2,
        skill_3: updateData.skill_3,
        skill_4: updateData.skill_4,
        skill_5: updateData.skill_5,
        skill_6: updateData.skill_6
      });

      // Chamar backend correto para freelancer
      const response = await fetch('https://skill-web-backend.onrender.com/api/profile/freelancer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      console.log("📡 Status da resposta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta:", errorText);
        throw new Error(`Erro ao atualizar perfil: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Resposta completa:", result);

      if (result.success) {
        alert("✅ Perfil atualizado com sucesso!");
        navigate('/profile');
      } else {
        throw new Error(result.error || 'Erro desconhecido ao atualizar perfil');
      }

    } catch (error) {
      console.error('❌ Erro completo:', error);
      alert('❌ Erro ao atualizar: ' + error.message);
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
            {/* ... (resto do formulário permanece igual) ... */}
            
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
                    <>
                      <Save size={18} style={{ marginRight: '8px' }} />
                      Salvar Todas as Alterações
                    </>
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
                  <strong>💡 Dica:</strong> As skills que você adicionar aqui aparecerão 
                  no seu perfil público!
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

// Componente Footer (permanece igual)
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
[file content end]
