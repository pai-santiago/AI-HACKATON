import './App.css'

const team = [
  { initials: 'SG', name: 'Santiago García', index: '01' },
  { initials: 'DV', name: 'Diego Villa', index: '02' },
  { initials: 'FH', name: 'Fabio Herrera', index: '03' },
  { initials: 'JP', name: 'Jorge Polanco', index: '04' },
]

const setupItems = [
  { number: '01', title: 'Definir el reto', detail: 'Aterrizar problema, usuarios y alcance.', status: 'Pendiente', tone: 'pending' },
  { number: '02', title: 'Conectar Supabase', detail: 'Crear el proyecto y agregar las variables.', status: 'Por configurar', tone: 'neutral' },
  { number: '03', title: 'Activar producción', detail: 'Importar el repo en Vercel y vincular main.', status: 'Por conectar', tone: 'neutral' },
]

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4.5 10h11m0 0-4.5-4.5M15.5 10 11 14.5" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" fill="none">
      <path d="M20 3.5 23.8 16.2 36.5 20l-12.7 3.8L20 36.5l-3.8-12.7L3.5 20l12.7-3.8L20 3.5Z" />
      <path d="m32.2 3.5 1.1 3.7L37 8.3l-3.7 1.1-1.1 3.7-1.1-3.7-3.7-1.1 3.7-1.1 1.1-3.7Z" />
    </svg>
  )
}

function App() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="AI Hackaton, inicio">
          <span className="brand-mark"><SparkIcon /></span>
          <span className="brand-wordmark">AI <span>HACKATON</span></span>
        </a>

        <nav className="top-nav" aria-label="Navegación principal">
          <a href="#equipo">El equipo</a>
          <a href="#plan">Plan de arranque</a>
          <a className="nav-link" href="https://react.dev/learn" target="_blank" rel="noreferrer">
            Guía React <ArrowIcon />
          </a>
        </nav>
      </header>

      <main id="inicio">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> KIT DE ARRANQUE <span className="eyebrow-separator">/</span> 4 PERSONAS</p>
            <h1 id="hero-title">El reto todavía no llega.<br /><span>El equipo, sí.</span></h1>
            <p className="hero-description">
              Un espacio listo para convertir la primera idea en un sitio web. La base técnica ya está; el problema por resolver lo definimos juntos cuando llegue el reto.
            </p>
            <a className="button button-dark" href="#plan">Ver plan de arranque <ArrowIcon /></a>
            <div className="hero-note"><span className="note-check">✓</span> React + TypeScript <span className="note-divider">·</span> Vite <span className="note-divider">·</span> Supabase listo para conectar</div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-star"><SparkIcon /></div>
            <div className="launch-card">
              <div className="launch-card-top"><span className="window-dots"><i /><i /><i /></span><span className="launch-label">SPRINT / 001</span></div>
              <div className="launch-card-content">
                <span className="card-overline">ESTADO DEL PROYECTO</span>
                <div className="launch-ready"><span className="ready-dot" /> Base lista</div>
                <p>Esperando el reto<br />para empezar a construir.</p>
                <div className="launch-card-foot"><span>REACT</span><span>TYPESCRIPT</span><span>VITE</span></div>
              </div>
            </div>
            <div className="floating-chip chip-team"><span className="chip-avatars"><b>SG</b><b>DV</b><b>FH</b><b>JP</b></span> equipo de 4</div>
            <div className="floating-chip chip-main"><span className="branch-icon">⌘</span> main <span className="chip-arrow">→</span> producción</div>
            <span className="art-caption">IDEA ENTRANTE · SITIO EN CONSTRUCCIÓN</span>
          </div>
        </section>

        <section className="status-strip" aria-label="Estado de la configuración">
          <div className="status-intro"><span className="status-icon">✳</span><div><strong>Listos para arrancar</strong><span>La infraestructura se conecta en el siguiente paso.</span></div></div>
          <div className="status-item"><span className="status-number">01</span><div><span className="status-label">FRONTEND</span><strong>Configurado</strong></div><span className="status-check">✓</span></div>
          <div className="status-item"><span className="status-number">02</span><div><span className="status-label">BASE DE DATOS</span><strong>Supabase pendiente</strong></div><span className="status-ring" /></div>
          <div className="status-item"><span className="status-number">03</span><div><span className="status-label">DESPLIEGUE</span><strong>Vercel pendiente</strong></div><span className="status-ring" /></div>
        </section>

        <section className="team-section" id="equipo" aria-labelledby="team-title">
          <div className="section-heading">
            <div><p className="eyebrow">LA GENTE DETRÁS DEL BUILD</p><h2 id="team-title">Cuatro cabezas.<br /><span>Una idea por definir.</span></h2></div>
            <span className="section-index">01 — EQUIPO</span>
          </div>
          <div className="team-grid">
            {team.map((person) => (
              <article className="team-card" key={person.initials}>
                <span className={'avatar avatar-' + person.index}>{person.initials}</span>
                <div><span className="team-index">INTEGRANTE {person.index}</span><h3>{person.name}</h3></div>
                <span className="team-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="plan-section" id="plan" aria-labelledby="plan-title">
          <div className="section-heading plan-heading">
            <div><p className="eyebrow">EL SIGUIENTE MOVIMIENTO</p><h2 id="plan-title">De repo vacío<br /><span>a producto en vivo.</span></h2></div>
            <p className="plan-intro">El camino está preparado. Conectamos cada pieza cuando el equipo tenga acceso y el reto esté claro.</p>
          </div>
          <div className="setup-list">
            {setupItems.map((item) => (
              <article className="setup-row" key={item.number}>
                <span className="setup-number">{item.number}</span>
                <div className="setup-copy"><h3>{item.title}</h3><p>{item.detail}</p></div>
                <span className={'setup-status ' + item.tone}>{item.status}</span>
                <span className="setup-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
          <div className="resource-links">
            <a href="https://react.dev/learn" target="_blank" rel="noreferrer"><span className="resource-mark react-mark">R</span><span><strong>Aprende React</strong><small>Componentes, props y estado</small></span><ArrowIcon /></a>
            <a href="https://vite.dev/guide/" target="_blank" rel="noreferrer"><span className="resource-mark vite-mark">V</span><span><strong>Explora Vite</strong><small>Servidor local y compilación</small></span><ArrowIcon /></a>
            <a href="https://supabase.com/docs/guides/getting-started/tutorials/with-react" target="_blank" rel="noreferrer"><span className="resource-mark supabase-mark">S</span><span><strong>Conecta Supabase</strong><small>Guía oficial para React</small></span><ArrowIcon /></a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#inicio"><span className="brand-mark"><SparkIcon /></span><span className="brand-wordmark">AI <span>HACKATON</span></span></a>
        <span>Una buena idea empieza con un buen equipo.</span>
        <a className="footer-top" href="#inicio">Volver arriba ↑</a>
      </footer>
    </div>
  )
}

export default App