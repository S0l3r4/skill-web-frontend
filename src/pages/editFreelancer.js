import '../styles/index.css';
import '../styles/profile.css';
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient.js";

export default function EditFreelancer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    bio: '',
    occupation: '',
    skills: ['', '', '', '', '', '']
  });

  // BUSCAR DADOS
  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      const response = await fetch('https://skill-web-backend.onrender.com/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();

      if (result.success) {
        const user = result.user;
        setForm({
          name: user.name_user || '',
          email: user.email_user || '',
          phone: user.phone_user || '',
          city: user.city_user || '',
          state: user.state_user || '',
          bio: user.bio_user || '',
          occupation: user.ocupation_freelancer || '',
          skills: user.skills ? [...user.skills, '', '', '', '', ''].slice(0, 6) : ['', '', '', '', '', '']
        });
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // SALVAR
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session.access_token;

      const dataToSend = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        state: form.state,
        bio: form.bio,
        occupation: form.occupation,
        skills: form.skills.filter(skill => skill.trim() !== '')
      };

      console.log('Enviando payload:', dataToSend);

      const response = await fetch('https://skill-web-backend.onrender.com/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();
      console.log('Resposta do backend:', result);

      if (result.success) {
        alert('Perfil salvo com sucesso!');
        navigate('/profile');
      } else {
        console.error('Erro retornado pelo backend:', result);
        alert('Erro ao salvar: ' + (result.error || 'Erro desconhecido'));
      }

    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSkill = (index, value) => {
    const newSkills = [...form.skills];
    newSkills[index] = value;
    setForm(prev => ({ ...prev, skills: newSkills }));
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="signUp">
      <header>
        <div className="menu">
          <img src="/imgLogo.png" alt="Logo" className="logo" />
          <Link to="/">SkillMatch</Link>
        </div>
      </header>

      <section className="signUp-section">
        <div className="edit-header">
          <h2>EDITAR PERFIL</h2>
          <Link to="/profile" className="back-link">
            <ArrowLeft size={20} />
            Voltar
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="signUp-form edit-form">

          {/* DADOS BÁSICOS */}
          <div className="form-section-edit">
            <h3>Dados Pessoais</h3>

            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Ocupação *</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => setForm(prev => ({ ...prev, occupation: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
          </div>

          {/* SKILLS - PARTE IMPORTANTE */}
          <div className="form-section-edit">
            <h3>Habilidades</h3>
            <p>Adicione suas principais habilidades</p>

            {form.skills.map((skill, index) => (
              <div key={index} className="form-group">
                <label>Habilidade {index + 1}</label>
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  placeholder={`Ex: ${['JavaScript', 'React', 'Node.js', 'Figma', 'Git', 'Inglês'][index]}`}
                  disabled={saving}
                />
              </div>
            ))}
          </div>

          {/* BOTÃO SALVAR */}
          <div className="form-actions-edit">
            <button type="submit" disabled={saving} className="btnsubmit btn-edit">
              {saving ? 'Salvando...' : '💾 SALVAR TUDO'}
            </button>
          </div>

        </form>
      </section>
    </div>
  );
}