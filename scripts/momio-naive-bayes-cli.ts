import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline/promises'
import process from 'node:process'
import {
  buildExamples,
  FEATURE_LABELS,
  fitNaiveBayesModel,
  OUTCOMES,
  OUTCOME_LABELS,
  parseMatchesCsv,
  predictModel,
  upcomingFeatures,
} from '../src/lib/momioModels.ts'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(scriptDir, '..')
const requestedCsv = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
const csvPath = requestedCsv
  ? path.resolve(process.cwd(), requestedCsv)
  : path.join(projectDir, 'src', 'data', 'demo_partidos_sinteticos.csv')
const useDemo = process.argv.includes('--demo')
const pct = (value: number) => `${(value * 100).toFixed(1)}%`
const decimalOdds = (value: number) => (1 / Math.max(value, 0.000001)).toFixed(2)

function softmaxMetrics(actual: string[], predictions: number[][]) {
  let correct = 0
  let logLoss = 0
  let brier = 0
  for (let index = 0; index < actual.length; index += 1) {
    const actualIndex = OUTCOMES.indexOf(actual[index] as (typeof OUTCOMES)[number])
    const row = predictions[index]
    if (row.indexOf(Math.max(...row)) === actualIndex) correct += 1
    logLoss -= Math.log(Math.max(row[actualIndex], 1e-9))
    for (let outcome = 0; outcome < OUTCOMES.length; outcome += 1) {
      brier += (row[outcome] - (outcome === actualIndex ? 1 : 0)) ** 2
    }
  }
  const count = Math.max(actual.length, 1)
  return { accuracy: correct / count, logLoss: logLoss / count, brier: brier / count }
}

function prepare(csvText: string) {
  const matches = parseMatchesCsv(csvText)
  const examples = buildExamples(matches)
  if (examples.length < 20) {
    throw new Error('El historial necesita más partidos con forma previa para entrenar y validar.')
  }
  const split = Math.floor(examples.length * 0.8)
  const training = examples.slice(0, split)
  const testing = examples.slice(split)
  const model = fitNaiveBayesModel(training.map((row) => row.features), training.map((row) => row.target))
  const metrics = softmaxMetrics(
    testing.map((row) => row.target),
    testing.map((row) => predictModel(model, row.features)),
  )
  const finalModel = fitNaiveBayesModel(examples.map((row) => row.features), examples.map((row) => row.target))
  return { matches, examples, training, testing, metrics, finalModel }
}

function printHeader(data: ReturnType<typeof prepare>) {
  console.log('\nMOMIOLAB · PRIMER BOCETO')
  console.log('Algoritmo activo: Naive Bayes gaussiano')
  console.log(`Fuente: ${path.relative(process.cwd(), csvPath)} · datos sintéticos de demostración`)
  console.log(`Partidos analizados: ${data.matches.length} · ejemplos con forma previa: ${data.examples.length}`)
  console.log(`Validación cronológica 80/20: ${data.training.length} entrenamiento · ${data.testing.length} prueba`)
  console.log(`Accuracy ${pct(data.metrics.accuracy)} · Log loss ${data.metrics.logLoss.toFixed(3)} · Brier ${data.metrics.brier.toFixed(3)}`)
  console.log('Nota: estas métricas describen el CSV de demostración, no partidos reales.\n')
}

function listTeams(teams: string[]) {
  console.log('\nEquipos disponibles:')
  teams.forEach((team, index) => console.log(`  ${String(index + 1).padStart(2, ' ')}. ${team}`))
  console.log('')
}

function resolveTeam(answer: string, teams: string[], excluded?: string) {
  const input = answer.trim()
  if (!input && !excluded) return teams[0]
  if (!input && excluded) return teams.find((team) => team !== excluded)
  const index = Number(input)
  const byNumber = Number.isInteger(index) && index >= 1 ? teams[index - 1] : undefined
  const byName = teams.find((team) => team.toLocaleLowerCase('es-MX') === input.toLocaleLowerCase('es-MX'))
  const team = byNumber ?? byName
  if (!team) return undefined
  if (team === excluded) return undefined
  return team
}

function showPrediction(data: ReturnType<typeof prepare>, home: string, away: string) {
  const features = upcomingFeatures(data.matches, home, away)
  const probabilities = predictModel(data.finalModel, features)
  const rows = OUTCOMES.map((outcome, index) => ({ outcome, probability: probabilities[index] }))
  console.log(`\n${home}  vs  ${away}`)
  console.log('Resultado              Probabilidad     Momio justo')
  console.log('----------------------------------------------------')
  rows.forEach(({ outcome, probability }) => {
    console.log(`${OUTCOME_LABELS[outcome].padEnd(22)} ${pct(probability).padStart(8)}          ${decimalOdds(probability)}`)
  })
  console.log('\nGráfica de probabilidades 1X2 (escala 0–100%)')
  const barWidth = 24
  rows.forEach(({ outcome, probability }) => {
    const filled = Math.round(probability * barWidth)
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled)
    console.log(`${OUTCOME_LABELS[outcome].padEnd(11)} ${pct(probability).padStart(6)}  |${bar}|`)
  })
  console.log('\nVariables observadas (últimos 5 partidos por equipo):')
  FEATURE_LABELS.forEach((label, index) => {
    console.log(`  ${label.padEnd(31)} ${features[index].toFixed(2)}`)
  })
  console.log('\nCómo leerlo: Naive Bayes combina la frecuencia previa de cada resultado con la probabilidad de observar estas variables dado ese resultado.')
  console.log('Supuesto del modelo: las variables se tratan como condicionalmente independientes. El momio es 1 / probabilidad, sin margen de casa.')
  console.log('Estimación académica; no es una recomendación de apuesta.\n')
}

async function main() {
  let csvText: string
  try {
    csvText = await fs.readFile(csvPath, 'utf8')
  } catch {
    console.error(`No se pudo abrir el CSV: ${csvPath}`)
    process.exitCode = 1
    return
  }

  let data: ReturnType<typeof prepare>
  try {
    data = prepare(csvText)
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'No se pudo preparar el historial.')
    process.exitCode = 1
    return
  }

  printHeader(data)
  const teams = [...new Set(data.matches.flatMap((match) => [match.home, match.away]))].sort((a, b) => a.localeCompare(b, 'es-MX'))
  if (teams.length < 2) {
    console.error('El CSV necesita por lo menos dos equipos distintos.')
    process.exitCode = 1
    return
  }

  if (useDemo) {
    showPrediction(data, teams[0], teams[1])
    return
  }

  const terminal = createInterface({ input: process.stdin, output: process.stdout })
  try {
    while (true) {
      console.log('Acciones: 1) Predecir partido  2) Listar equipos  3) Explicar algoritmo  0) Salir')
      const action = (await terminal.question('Selecciona una acción: ')).trim()
      if (action === '0') break
      if (action === '2') {
        listTeams(teams)
        continue
      }
      if (action === '3') {
        console.log('\nNaive Bayes gaussiano: estima Local, Empate y Visitante a partir de 10 variables de forma reciente.')
        console.log('Aprende una distribución por resultado y combina esas probabilidades con la frecuencia de cada clase.')
        console.log('Su supuesto central es independencia condicional entre variables; aquí es una primera línea base, no el sistema final.\n')
        continue
      }
      if (action !== '1') {
        console.log('Acción no reconocida. Elige 1, 2, 3 o 0.\n')
        continue
      }

      listTeams(teams)
      const homeAnswer = await terminal.question('Número o nombre del equipo LOCAL: ')
      const home = resolveTeam(homeAnswer, teams)
      if (!home) {
        console.log('No reconocí ese equipo. Intenta de nuevo.\n')
        continue
      }
      const awayAnswer = await terminal.question('Número o nombre del equipo VISITANTE: ')
      const away = resolveTeam(awayAnswer, teams, home)
      if (!away) {
        console.log('Elige un equipo válido distinto al local.\n')
        continue
      }
      showPrediction(data, home, away)
    }
  } finally {
    terminal.close()
  }
  console.log('Boceto cerrado. El dashboard React y sus otros algoritmos siguen disponibles.')
}

await main()
