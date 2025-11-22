// src/LandingPage.jsx
import '../styles/index.css';
import { Mail, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* HERO */}
      <header>
        
        <div className="menu">
          <img src="/imgLogo.png" alt="SkillMatch Logo" className="logo" />
          <Link id="nomeheader" to="/">SkillMatch</Link>
        </div>
        <div className="menu" id="menuLinks">
          <Link to="/login">Entrar</Link>
          <Link to="/cadastro">Cadastro</Link>
        </div>
      </header>
      <section className="hero">
        <div className="hero-content">
          <div className="text">
            <p id="heroText">Conectando Talentos, <br /> Impulsionando Projetos</p>
            <p>O match certo entre quem contrata e quem faz!</p>
            <button className="btn">Baixe o App Agora</button>
          </div>

          <div className="image">
            <img src="/phone.png" alt="App Preview" id="imgphone" />
          </div>
        </div>
      </section>

      {/* SOBRE NÓS */}
      <section className="about">
        <h2>Sobre Nós</h2>
        <div className="about-content">
          <div>
            <img src="/aboutus_img.png" alt="Sobre Nós" />
          </div>
          <div>
            <p>Usando <strong>inteligência artificial</strong>, aproximamos pessoas e oportunidades,
              permitindo que qualquer usuário — seja empresa ou pessoa física — <strong>encontre profissionais qualificados
                para demandas corporativas ou pessoais</strong></p>
            <br></br>
            <p>Nossa missão é <strong>democratizar o acesso a talentos</strong>, promovendo <strong> contratações mais humanas, inteligentes e acessíveis.</strong></p>
          </div>
        </div>
      </section>

      {/* NOSSOS SERVIÇOS */}
      <section className="services">
        <h2>Nossos Serviços</h2>
        <div className="services-grid">
          {/* cards */}
          <div className="service-card">
            <div className="services-text">
              <h3>Match Inteligente de profissionais</h3>
              <p>Recomendação automática dos prestadores ideais para cada demanda, utilizando inteligência artificial.</p>
            </div>
          </div>
          <div className="service-card">
            <div className="services-text">
              <h3>Contratação Simplificada</h3>
              <p>Processo de contratação direto pelo app, com comunicação integrada e gestão de pagamentos.</p>
            </div>
          </div>
          <div className="service-card">
            <div className="services-text">
              <h3>Avaliações e Feedbacks</h3>
              <p>Sistema de avaliações para garantir a qualidade dos serviços prestados e ajudar na escolha dos profissionais.</p>
            </div>
          </div>
        </div>
      </section>
      {/* rodapé */}
       <footer className="footer">
        <div className="footer1">
          {/* LOGO */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <img src="/logoNome.png" alt="SkillMatch Logo" className="w-10 h-10" />
            </div>
          </div>

          {/* DESENVOLVIDO */}
          <div className="text-center md:text-left">
            <h2 className="font-bold text-red-700">Desenvolvido por:</h2>
            <div className="mails">
              <a href="mailto:viiallvesx@gmail.com">Ana Vitória Alves</a>
              <a href="mailto:gibarbutti@gmail.com">Giovanna Barbutti</a>
              <a href="mailto: thomasdamasena2@gmail.com">Thomas Solera</a>
            </div>
          </div>

          {/* CONTATO */}
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

        {/* COPYRIGHT */}
        <div className="text-center mt-6 text-xs" style={{color: '#93032e'}}>
          © 2025 SkillMatch. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
