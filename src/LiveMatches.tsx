import { useEffect, useMemo, useState } from 'react'
import './LiveMatches.css'

const LIVE_FEED_URL = 'https://sportscore.com/api/widget/matches/?sport=football&limit=50'
const REFRESH_MS = 60_000

type SportScoreMatch = {
  home: string
  away: string
  home_logo?: string | null
  away_logo?: string | null
  home_score?: string | number | null
  away_score?: string | number | null
  status: string
  status_text?: string | null
  time?: string | null
  competition: string
  competition_logo?: string | null
  url?: string | null
}

type FeedResponse = { matches?: SportScoreMatch[]; updated?: string; count?: number }
type FeedState = 'loading' | 'ready' | 'error'
type MatchState = 'live' | 'upcoming' | 'finished' | 'delayed'

function stateFor(match: SportScoreMatch): MatchState {
  const status = `${match.status} ${match.status_text ?? ''}`.toLocaleLowerCase('en').replace(/[_-]/g, ' ')
  if (/\b(live|in progress|playing|1st half|2nd half|half time|halftime|extra time|penalties)\b/.test(status)) return 'live'
  if (/\b(finished|complete|completed|full time|ft|ended)\b/.test(status)) return 'finished'
  if (/\b(delayed|postponed|suspended|cancelled|canceled)\b/.test(status)) return 'delayed'
  return 'upcoming'
}

function statusLabel(match: SportScoreMatch, state: MatchState) {
  if (state === 'live') return match.status_text || 'EN VIVO'
  if (state === 'finished') return 'FINAL'
  if (state === 'delayed') {
    const text = `${match.status} ${match.status_text ?? ''}`.toLocaleLowerCase('en')
    if (text.includes('postpon')) return 'POSPUESTO'
    if (text.includes('suspend')) return 'SUSPENDIDO'
    if (text.includes('cancel')) return 'CANCELADO'
    return 'RETRASADO'
  }
  return match.status_text || 'PRÓXIMO'
}

function kickoffTime(value?: string | null) {
  if (!value) return 'Hora sin publicar'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Hora sin publicar'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function sortTime(match: SportScoreMatch) {
  const parsed = match.time ? new Date(match.time).getTime() : Number.NaN
  return Number.isNaN(parsed) ? 0 : parsed
}

function TeamLine({ name, logo, score, away = false }: { name: string; logo?: string | null; score?: string | number | null; away?: boolean }) {
  const hasScore = score !== null && score !== undefined && String(score).length > 0
  return <div className="ml-feed-team">
    {logo ? <img className="ml-feed-logo" src={logo} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <span className={'ml-feed-fallback ' + (away ? 'away' : '')}>{name.slice(0, 2).toUpperCase()}</span>}
    <b title={name}>{name}</b>
    <strong>{hasScore ? score : '—'}</strong>
  </div>
}

function LiveMatches() {
  const [matches, setMatches] = useState<SportScoreMatch[]>([])
  const [feedState, setFeedState] = useState<FeedState>('loading')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const [competitionFilter, setCompetitionFilter] = useState('Mexico Liga MX')

  useEffect(() => {
    const controller = new AbortController()
    let mounted = true

    const loadMatches = async () => {
      setRefreshing(true)
      try {
        const response = await fetch(LIVE_FEED_URL, { headers: { Accept: 'application/json' }, signal: controller.signal })
        if (!response.ok) {
          if (response.status === 429) throw new Error('Se alcanzó el límite gratuito temporal. Espera un momento y vuelve a intentar.')
          throw new Error(`SportScore respondió HTTP ${response.status}.`)
        }
        const body = await response.json() as FeedResponse
        if (!Array.isArray(body.matches)) throw new Error('SportScore devolvió una respuesta con formato inesperado.')
        if (!mounted) return
        setMatches(body.matches.filter((match) => match.home && match.away && match.competition && match.status))
        setUpdatedAt(new Date())
        setError('')
        setFeedState('ready')
      } catch (cause) {
        if (!mounted || controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : 'No se pudieron consultar los partidos.')
        setFeedState((current) => current === 'ready' ? 'ready' : 'error')
      } finally {
        if (mounted && !controller.signal.aborted) setRefreshing(false)
      }
    }

    void loadMatches()
    const timer = window.setInterval(() => void loadMatches(), REFRESH_MS)
    return () => {
      mounted = false
      window.clearInterval(timer)
      controller.abort()
    }
  }, [refreshToken])

  const competitions = useMemo(() => [...new Set(matches.map((match) => match.competition))].sort((a, b) => a.localeCompare(b, 'es')), [matches])
  const activeCompetition = competitionFilter === 'all' || competitions.includes(competitionFilter) ? competitionFilter : 'all'
  const visibleMatches = useMemo(() => {
    const rank = { live: 0, upcoming: 1, finished: 2, delayed: 3 }
    return matches
      .filter((match) => activeCompetition === 'all' || match.competition === activeCompetition)
      .sort((left, right) => rank[stateFor(left)] - rank[stateFor(right)] || (stateFor(left) === 'finished' ? sortTime(right) - sortTime(left) : sortTime(left) - sortTime(right)))
  }, [matches, activeCompetition])
  const liveCount = matches.filter((match) => stateFor(match) === 'live').length
  const pageMatches = visibleMatches.slice(0, 12)

  return (
    <section className="ml-live-view" aria-labelledby="ml-live-title">
      <div className="ml-live-heading">
        <div><span className="ml-kicker">MARCADOR GLOBAL · FÚTBOL</span><h2 id="ml-live-title">Partidos en vivo y resultados</h2><p>Marcadores recientes y encuentros activos de ligas de distintos países.</p></div>
        <div className="ml-live-controls">
          <label className="ml-live-select-wrap"><span>FILTRAR COMPETICIÓN</span><select value={activeCompetition} onChange={(event) => setCompetitionFilter(event.target.value)} disabled={!competitions.length}><option value="all">Todas las competiciones</option>{competitions.map((competition) => <option key={competition} value={competition}>{competition}</option>)}</select></label>
          <button className="ml-refresh" onClick={() => setRefreshToken((value) => value + 1)} disabled={refreshing}><span className={refreshing ? 'is-spinning' : ''}>↻</span> Actualizar</button>
        </div>
      </div>

      <div className="ml-live-statusbar"><span className="ml-live-source"><i /> SportScore · sin clave</span><span>{updatedAt ? `Consultado ${new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(updatedAt)}` : 'Conectando…'} · se actualiza cada minuto</span><span className="ml-live-total">{liveCount} en vivo</span></div>

      {error && <div className="ml-live-error"><b>{feedState === 'error' ? 'No se pudo conectar' : 'Aviso del proveedor'}</b><span>{error}</span>{matches.length > 0 && <small>Se conservan los últimos partidos recibidos.</small>}</div>}
      {feedState === 'loading' && <div className="ml-live-loading"><span className="ml-spinner" /> Consultando marcadores globales…</div>}
      {feedState === 'error' && !matches.length && <div className="ml-live-empty"><b>La conexión no está disponible ahora.</b><span>Prueba de nuevo en un momento. El análisis de modelos sigue funcionando con el histórico cargado.</span></div>}
      {feedState !== 'error' && !pageMatches.length && <div className="ml-live-empty"><b>No hay partidos disponibles en este momento.</b><span>La API publicará aquí los encuentros activos y resultados recientes cuando estén disponibles.</span></div>}

      {!!pageMatches.length && <>
        <div className="ml-live-match-list">{pageMatches.map((match, index) => {
          const state = stateFor(match)
          const label = statusLabel(match, state)
          const content = <>
            <div className="ml-live-match-meta"><span>{match.competition}</span><span className={`ml-match-status ${state}`}>{state === 'live' && <i />}{label}</span></div>
            <TeamLine name={match.home} logo={match.home_logo} score={match.home_score} />
            <TeamLine name={match.away} logo={match.away_logo} score={match.away_score} away />
            <div className="ml-live-time">{kickoffTime(match.time)}</div>
          </>
          return match.url
            ? <a className="ml-live-match" href={`https://sportscore.com${match.url}`} target="_blank" rel="noreferrer" key={`${match.competition}-${match.time}-${index}`}>{content}</a>
            : <article className="ml-live-match" key={`${match.competition}-${match.time}-${index}`}>{content}</article>
        })}</div>
        {visibleMatches.length > 12 && <p className="ml-feed-more">Mostrando 12 de {visibleMatches.length} partidos del feed.</p>}
      </>}

      <div className="ml-live-credit">La fuente proporciona marcadores y estados de partido, no cuotas de casas. <a href="https://sportscore.com/" rel="dofollow" title="Sports data by SportScore">Powered by SportScore</a></div>
    </section>
  )
}

export default LiveMatches
