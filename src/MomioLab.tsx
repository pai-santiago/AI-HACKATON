import { useMemo, useState } from 'react'
import demoCsv from './data/demo_partidos_sinteticos.csv?raw'
import LiveMatches from './LiveMatches'
import {
  analyseMatches,
  fairOdds,
  matchProbabilities,
  monteCarlo,
  parseMatchesCsv,
  upcomingFeatures,
  type Analysis,
  type Match,
  type Outcome,
} from './lib/momioModels'
import './MomioLab.css'

type Props = { onBack: () => void }
type DataState = { matches: Match[]; error: string | null }

const outcomeOrder: Outcome[] = ['H', 'D', 'A']
const outcomeNames: Record<Outcome, string> = { H: 'Local', D: 'Empate', A: 'Visitante' }
const money = (value: number) => `${Math.round(value * 100)}%`

function Icon({ name }: { name: 'ball' | 'upload' | 'arrow' | 'spark' }) {
  if (name === 'ball') return <span aria-hidden="true">⚽</span>
  if (name === 'upload') return <span aria-hidden="true">↑</span>
  if (name === 'arrow') return <span aria-hidden="true">↗</span>
  return <span aria-hidden="true">✳</span>
}

function AnalysisPanel({ analysis }: { analysis: Analysis }) {
  const best = analysis.metrics[0]
  return (
    <section className="ml-panel ml-model-panel">
      <div className="ml-section-title">
        <div><span className="ml-kicker">MODELOS Y VALIDACIÓN</span><h2>¿Qué tan bien estima?</h2></div>
        <span className="ml-period">Prueba cronológica · desde {analysis.testStart}</span>
      </div>
      <div className="ml-model-grid">
        {analysis.metrics.map((row, index) => (
          <article className={'ml-model-card ' + (index === 0 ? 'is-best' : '')} key={row.name}>
            <div className="ml-model-heading"><span className="ml-model-rank">0{index + 1}</span><strong>{row.name}</strong>{index === 0 && <span className="ml-best-tag">MENOR LOG LOSS</span>}</div>
            <div className="ml-metric-line"><span>Exactitud</span><strong>{money(row.accuracy)}</strong></div>
            <div className="ml-meter"><i style={{ width: `${Math.max(3, row.accuracy * 100)}%` }} /></div>
            <div className="ml-small-metrics"><span>Log loss <b>{row.logLoss.toFixed(3)}</b></span><span>Brier <b>{row.brier.toFixed(3)}</b></span></div>
          </article>
        ))}
      </div>
      <div className="ml-model-note"><Icon name="spark" /> Mejor log loss: <b>{best?.name ?? '—'}</b>. La evaluación usa partidos posteriores al entrenamiento para reducir fuga de información.</div>
    </section>
  )
}

function MomioLab({ onBack }: Props) {
  const [csv, setCsv] = useState(demoCsv)
  const [fileName, setFileName] = useState('demo_partidos_sinteticos.csv')
  const [homeChoice, setHomeChoice] = useState('Atlético Coral')
  const [awayChoice, setAwayChoice] = useState('Deportivo Cenote')
  const [modelChoice, setModelChoice] = useState('Máxima Entropía')
  const [activeTab, setActiveTab] = useState<'en-vivo' | 'partido' | 'modelos' | 'reglas' | 'datos'>('en-vivo')

  const data = useMemo<DataState>(() => {
    try {
      return { matches: parseMatchesCsv(csv), error: null }
    } catch (error) {
      return { matches: [], error: error instanceof Error ? error.message : 'No se pudo leer el archivo.' }
    }
  }, [csv])
  const teams = useMemo(() => [...new Set(data.matches.flatMap((match) => [match.home, match.away]))].sort((a, b) => a.localeCompare(b, 'es')), [data.matches])
  const homeTeam = teams.includes(homeChoice) ? homeChoice : teams[0] ?? ''
  const awayTeam = teams.includes(awayChoice) && awayChoice !== homeTeam ? awayChoice : teams.find((team) => team !== homeTeam) ?? ''

  const analysis = useMemo(() => {
    if (!data.matches.length) return null
    try { return analyseMatches(data.matches) } catch { return null }
  }, [data.matches])
  const predictions = useMemo(() => {
    if (!analysis || !homeTeam || !awayTeam) return []
    try { return matchProbabilities(analysis, upcomingFeatures(data.matches, homeTeam, awayTeam)) } catch { return [] }
  }, [analysis, data.matches, homeTeam, awayTeam])
  const selectedPrediction = predictions.find((row) => row.name === modelChoice) ?? predictions[0]
  const simulation = useMemo(() => {
    if (!homeTeam || !awayTeam || !data.matches.length) return null
    try { return monteCarlo(data.matches, homeTeam, awayTeam) } catch { return null }
  }, [data.matches, homeTeam, awayTeam])

  async function loadCsv(file?: File) {
    if (!file) return
    try {
      const contents = await file.text()
      parseMatchesCsv(contents)
      setCsv(contents)
      setFileName(file.name)
    } catch {
      setCsv('')
      setFileName(file.name)
    }
  }

  return (
    <div className="momiolab">
      <header className="ml-topbar">
        <button className="ml-brand" onClick={onBack} aria-label="Volver al inicio"><span className="ml-brand-icon"><Icon name="ball" /></span><span>MOMIO<span>LAB</span></span></button>
        <div className="ml-top-right"><span className="ml-live"><i /> PROYECTO DE IA · FÚTBOL</span><button className="ml-back" onClick={onBack}>← Inicio</button></div>
      </header>

      <main className="ml-main">
        <section className="ml-hero">
          <div className="ml-hero-copy">
            <span className="ml-eyebrow">LABORATORIO DE PROBABILIDADES <b>01 / 04</b></span>
            <h1>Los datos juegan.<br /><span>¿Qué dicen del partido?</span></h1>
            <p>Compara modelos de IA para estimar el resultado 1X2 y calcular momios justos a partir de partidos históricos.</p>
            <div className="ml-hero-meta"><span><i /> 1X2 · Local / Empate / Visitante</span><span>Sin cuotas de casas</span></div>
          </div>
          <div className="ml-score-card">
            <div className="ml-score-card-top"><span>PARTIDO A EXPLORAR</span><span className="ml-live-pill">● EN ANÁLISIS</span></div>
            <div className="ml-matchup"><div className="ml-team-badge home-badge">{homeTeam.slice(0, 2).toUpperCase()}</div><div className="ml-vs">VS<span>1X2</span></div><div className="ml-team-badge away-badge">{awayTeam.slice(0, 2).toUpperCase()}</div></div>
            <div className="ml-team-names"><label>{homeTeam || 'Equipo local'}</label><label>{awayTeam || 'Equipo visitante'}</label></div>
            <div className="ml-match-selects">
              <select aria-label="Equipo local" value={homeTeam} onChange={(event) => setHomeChoice(event.target.value)}>{teams.map((team) => <option key={team}>{team}</option>)}</select>
              <select aria-label="Equipo visitante" value={awayTeam} onChange={(event) => setAwayChoice(event.target.value)}>{teams.filter((team) => team !== homeTeam).map((team) => <option key={team}>{team}</option>)}</select>
            </div>
          </div>
        </section>

        <section className="ml-disclaimer"><span>{activeTab === 'en-vivo' ? 'MARCADOR EN VIVO' : 'DEMO CON DATOS SINTÉTICOS'}</span><p>{activeTab === 'en-vivo' ? 'Consulta marcadores de fútbol de cientos de ligas con SportScore. Esta fuente ofrece resultados y estados, no cuotas de casas.' : 'Los equipos y marcadores incluidos son ficticios. Carga un CSV histórico para analizar tus propios datos; las estimaciones no son recomendaciones de apuesta.'}</p>{activeTab !== 'en-vivo' && <label className="ml-upload"><Icon name="upload" /> Cargar CSV<input type="file" accept=".csv,text/csv" onChange={(event) => void loadCsv(event.target.files?.[0])} /></label>}</section>

        {data.error ? <div className="ml-error"><b>No se pudo analizar el archivo.</b> {data.error}<span>Formato esperado: date, home_team, away_team, home_goals, away_goals.</span></div> : null}
        {!data.error && !analysis ? <div className="ml-error"><b>Faltan datos para entrenar.</b> El archivo debe contener al menos 60 partidos analizables.</div> : null}

        <nav className="ml-tabs" aria-label="Secciones de análisis">
          {([['en-vivo', 'En vivo'], ['partido', 'Partido & momios'], ['modelos', 'Modelos'], ['reglas', 'Reglas Apriori'], ['datos', 'Datos']] as const).map(([key, label]) => <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>{label}</button>)}
          {activeTab !== 'en-vivo' && <span className="ml-file-badge">{fileName}</span>}
        </nav>

        {activeTab === 'en-vivo' && <LiveMatches />}
        {activeTab === 'partido' && analysis && selectedPrediction && (
          <div className="ml-content-grid">
            <section className="ml-panel ml-prob-panel">
              <div className="ml-section-title"><div><span className="ml-kicker">PRONÓSTICO DEL MODELO</span><h2>Probabilidades 1X2</h2></div><select className="ml-model-select" value={selectedPrediction.name} onChange={(event) => setModelChoice(event.target.value)}>{predictions.map((row) => <option key={row.name}>{row.name}</option>)}</select></div>
              <div className="ml-prob-list">{outcomeOrder.map((key) => {
                const probability = selectedPrediction.probabilities[key]
                return <div className="ml-prob-row" key={key}><div className="ml-outcome"><span className={'ml-outcome-token token-' + key}>{key}</span><b>{outcomeNames[key]}</b></div><div className="ml-prob-track"><i className={'bar-' + key} style={{ width: `${probability * 100}%` }} /></div><strong className="ml-prob-value">{money(probability)}</strong><div className="ml-odds"><small>MOMIO JUSTO</small><b>{fairOdds(probability)}</b></div></div>
              })}</div>
              <div className="ml-prob-foot"><span>Cuota decimal sin margen</span><span>Probabilidad estimada por <b>{selectedPrediction.name}</b></span></div>
            </section>

            <section className="ml-panel ml-sim-panel">
              <div className="ml-section-title"><div><span className="ml-kicker">MÉTODO MONTE CARLO</span><h2>Marcadores simulados</h2></div><span className="ml-sim-count">{simulation?.simulations.toLocaleString('es-MX')} corridas</span></div>
              <div className="ml-score-list">{simulation?.topScores.map((score, index) => <div className="ml-score-row" key={score.score}><span className="ml-score-rank">0{index + 1}</span><b>{score.score}</b><div className="ml-score-track"><i style={{ width: `${score.frequency * 100 / (simulation.topScores[0]?.frequency || 1)}%` }} /></div><span>{money(score.frequency)}</span></div>)}</div>
              <div className="ml-sim-summary"><span>λ local <b>{simulation?.lambdaHome.toFixed(2)}</b></span><span>λ visitante <b>{simulation?.lambdaAway.toFixed(2)}</b></span></div>
              <p className="ml-panel-caption">λ representa el promedio de goles esperado usado en la simulación de Poisson.</p>
            </section>

            <section className="ml-panel ml-insight-panel">
              <span className="ml-kicker">DEL ALGORITMO A LA IDEA</span><h2>De historial a decisión</h2>
              <div className="ml-flow"><span>Últimos 5 partidos</span><b>→</b><span>Variables de forma</span><b>→</b><span>Probabilidades</span><b>→</b><span>Momio justo</span></div>
              <p>El cálculo transforma puntos y goles recientes en probabilidades. Un momio justo es el inverso de la probabilidad: <code>1 ÷ p</code>.</p>
            </section>
          </div>
        )}

        {activeTab === 'modelos' && analysis && <div className="ml-stack"><AnalysisPanel analysis={analysis} /><section className="ml-panel"><div className="ml-section-title"><div><span className="ml-kicker">ALGORITMOS DEL PROYECTO</span><h2>¿Qué aporta cada uno?</h2></div></div><div className="ml-algorithm-grid"><article><span>01</span><b>Feed-forward</b><p>Red neuronal que aprende relaciones no lineales entre forma reciente y resultado.</p></article><article><span>02</span><b>Naive Bayes</b><p>Estima clases con probabilidades condicionales suponiendo variables independientes.</p></article><article><span>03</span><b>Máxima entropía</b><p>Clasificador softmax que combina señales sin añadir supuestos innecesarios.</p></article><article><span>04</span><b>Algoritmo genético</b><p>Busca un subconjunto de variables con menor pérdida de validación.</p></article><article><span>05</span><b>Tensores</b><p>Los datos se organizan como matriz: <code>{analysis.tensorShape[0]} × {analysis.tensorShape[1]}</code> (partidos × variables).</p></article><article><span>06</span><b>Monte Carlo</b><p>Repite marcadores Poisson para aproximar frecuencias y resultados probables.</p></article><article><span>07</span><b>Apriori</b><p>Encuentra asociaciones entre forma alta/baja y el resultado observado.</p></article></div><div className="ml-selected-features"><b>Variables elegidas por el algoritmo genético</b><div>{analysis.selectedFeatures.map((feature) => <span key={feature}>{feature}</span>)}</div><small>Pérdida de validación: {analysis.geneticValidationLoss.toFixed(3)}</small></div></section></div>}

        {activeTab === 'reglas' && analysis && <section className="ml-panel ml-rules-panel"><div className="ml-section-title"><div><span className="ml-kicker">ASOCIACIONES EN EL HISTORIAL</span><h2>Reglas descubiertas con Apriori</h2></div><span className="ml-period">Soporte ≥ 6% · confianza ≥ 46%</span></div><p className="ml-rules-intro">Cada regla muestra una combinación de características y el resultado que más aparece junto a ella. Asociación no significa causalidad.</p>{analysis.rules.length ? <div className="ml-rules-list">{analysis.rules.map((rule, index) => <article key={`${rule.condition}-${rule.outcome}`}><span className="ml-rule-index">0{index + 1}</span><div className="ml-rule-copy"><b>{rule.condition}</b><span>se asocia con <strong>{rule.outcome}</strong></span></div><div className="ml-rule-metrics"><span>Soporte <b>{money(rule.support)}</b></span><span>Confianza <b>{money(rule.confidence)}</b></span><span>Lift <b>{rule.lift.toFixed(2)}×</b></span></div></article>)}</div> : <div className="ml-empty">Con este historial no aparecieron reglas que cumplan los umbrales.</div>}</section>}

        {activeTab === 'datos' && <div className="ml-content-grid ml-data-grid"><section className="ml-panel"><div className="ml-section-title"><div><span className="ml-kicker">FUENTE DEL ANÁLISIS</span><h2>Partidos cargados</h2></div><span className="ml-period">{data.matches.length} filas válidas</span></div><div className="ml-data-stats"><div><b>{teams.length}</b><span>equipos</span></div><div><b>{analysis?.examples.length ?? 0}</b><span>partidos con forma previa</span></div><div><b>{data.matches[0]?.date ?? '—'}</b><span>primer registro</span></div><div><b>{data.matches.at(-1)?.date ?? '—'}</b><span>último registro</span></div></div><div className="ml-table-wrap"><table><thead><tr><th>Fecha</th><th>Local</th><th>Marcador</th><th>Visitante</th><th>1X2</th></tr></thead><tbody>{data.matches.slice(-8).reverse().map((match, index) => <tr key={`${match.date}-${match.home}-${index}`}><td>{match.date}</td><td>{match.home}</td><td><b>{match.homeGoals} – {match.awayGoals}</b></td><td>{match.away}</td><td><span className="ml-result-pill">{match.target}</span></td></tr>)}</tbody></table></div></section><section className="ml-panel ml-schema-panel"><span className="ml-kicker">FORMATO DEL CSV</span><h2>Columnas requeridas</h2><p>Sube partidos finalizados, una fila por encuentro. Los encabezados reconocen variantes comunes en inglés y español.</p><div className="ml-schema-tags"><code>date</code><code>home_team</code><code>away_team</code><code>home_goals</code><code>away_goals</code></div><div className="ml-data-warning">Se recomienda usar temporadas completas y ordenar por fecha. El modelo solo usa la forma anterior al partido que predice.</div></section></div>}

        <footer className="ml-footer"><span><Icon name="ball" /> MOMIOLAB <i>·</i> IA APLICADA AL FÚTBOL</span><span>Prototipo académico · resultados demostrativos</span></footer>
      </main>
    </div>
  )
}

export default MomioLab
