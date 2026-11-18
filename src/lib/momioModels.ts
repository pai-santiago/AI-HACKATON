export type Outcome = 'H' | 'D' | 'A'

export type Match = {
  date: string
  home: string
  away: string
  homeGoals: number
  awayGoals: number
  target: Outcome
}

export type Example = {
  date: string
  home: string
  away: string
  features: number[]
  target: Outcome
}

export const OUTCOMES: Outcome[] = ['H', 'D', 'A']
export const OUTCOME_LABELS: Record<Outcome, string> = { H: 'Local', D: 'Empate', A: 'Visitante' }
export const FEATURE_LABELS = [
  'Puntos recientes local',
  'Puntos recientes visitante',
  'Goles a favor local',
  'Goles en contra local',
  'Goles a favor visitante',
  'Goles en contra visitante',
  'Diferencia de puntos',
  'Diferencia de goles',
  'Victorias recientes local',
  'Victorias recientes visitante',
]

type TeamGame = { gf: number; ga: number; points: number }
type TeamStats = { points: number; gf: number; ga: number; winRate: number }
type SoftmaxModel = { kind: 'softmax'; indexes: number[]; mean: number[]; scale: number[]; weights: number[][]; bias: number[] }
type NaiveBayesModel = { kind: 'naiveBayes'; mean: number[][]; variance: number[][]; prior: number[] }
type FeedForwardModel = {
  kind: 'feedForward'
  mean: number[]
  scale: number[]
  firstWeights: number[][]
  firstBias: number[]
  outputWeights: number[][]
  outputBias: number[]
}
export type FittedModel = SoftmaxModel | NaiveBayesModel | FeedForwardModel

export type MetricRow = { name: string; accuracy: number; logLoss: number; brier: number }
export type Rule = { condition: string; outcome: string; support: number; confidence: number; lift: number }
export type Analysis = {
  examples: Example[]
  models: Record<string, FittedModel>
  metrics: MetricRow[]
  selectedFeatures: string[]
  geneticValidationLoss: number
  testStart: string
  tensorShape: [number, number]
  rules: Rule[]
}

function normalise(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(field.trim())
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field.trim())
      if (row.some((cell) => cell.length > 0)) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  row.push(field.trim())
  if (row.some((cell) => cell.length > 0)) rows.push(row)
  return rows
}

function dateSortValue(value: string): number {
  const iso = Date.parse(value)
  if (!Number.isNaN(iso)) return iso
  const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (match) {
    const day = Number(match[1])
    const month = Number(match[2]) - 1
    const rawYear = Number(match[3])
    const year = rawYear < 100 ? 2000 + rawYear : rawYear
    return new Date(year, month, day).getTime()
  }
  return Number.NaN
}

export function parseMatchesCsv(text: string): Match[] {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ''))
  if (rows.length < 2) throw new Error('El CSV está vacío o solo contiene encabezados.')
  const headers = rows[0].map(normalise)
  const choices: Record<string, string[]> = {
    date: ['date', 'matchdate', 'fecha'],
    home: ['hometeam', 'hometeamname', 'home', 'equipolocal', 'local'],
    away: ['awayteam', 'awayteamname', 'away', 'equipovisitante', 'visitante'],
    homeGoals: ['homegoals', 'fthg', 'hg', 'homescore', 'goleslocal'],
    awayGoals: ['awaygoals', 'ftag', 'ag', 'awayscore', 'golesvisitante'],
  }
  const indexes: Record<string, number> = {}
  for (const [field, aliases] of Object.entries(choices)) {
    indexes[field] = headers.findIndex((header) => aliases.includes(header))
  }
  const missing = Object.entries(indexes).filter(([, index]) => index < 0).map(([field]) => field)
  if (missing.length) {
    throw new Error('Faltan columnas: fecha, equipo local, equipo visitante y goles de ambos equipos.')
  }

  const matches = rows.slice(1).flatMap((cells): Match[] => {
    const date = cells[indexes.date] ?? ''
    const home = cells[indexes.home]?.trim() ?? ''
    const away = cells[indexes.away]?.trim() ?? ''
    const homeGoals = Number(cells[indexes.homeGoals])
    const awayGoals = Number(cells[indexes.awayGoals])
    if (!date || !home || !away || !Number.isFinite(dateSortValue(date)) || !Number.isFinite(homeGoals) || !Number.isFinite(awayGoals)) return []
    const target: Outcome = homeGoals > awayGoals ? 'H' : homeGoals === awayGoals ? 'D' : 'A'
    return [{ date, home, away, homeGoals, awayGoals, target }]
  })
  if (matches.length < 60) throw new Error('Se requieren al menos 60 partidos válidos para esta demostración.')
  return matches.sort((left, right) => dateSortValue(left.date) - dateSortValue(right.date))
}

function statsFromHistory(history: TeamGame[], window = 5): TeamStats {
  const recent = history.slice(-window)
  if (!recent.length) return { points: 1, gf: 1.25, ga: 1.25, winRate: 1 / 3 }
  return {
    points: recent.reduce((sum, game) => sum + game.points, 0) / recent.length,
    gf: recent.reduce((sum, game) => sum + game.gf, 0) / recent.length,
    ga: recent.reduce((sum, game) => sum + game.ga, 0) / recent.length,
    winRate: recent.filter((game) => game.points === 3).length / recent.length,
  }
}

function featureVector(home: TeamStats, away: TeamStats): number[] {
  return [
    home.points,
    away.points,
    home.gf,
    home.ga,
    away.gf,
    away.ga,
    home.points - away.points,
    (home.gf - home.ga) - (away.gf - away.ga),
    home.winRate,
    away.winRate,
  ]
}

export function buildExamples(matches: Match[]): Example[] {
  const history = new Map<string, TeamGame[]>()
  const examples: Example[] = []
  for (const match of matches) {
    const homeHistory = history.get(match.home) ?? []
    const awayHistory = history.get(match.away) ?? []
    if (homeHistory.length >= 3 && awayHistory.length >= 3) {
      examples.push({
        date: match.date,
        home: match.home,
        away: match.away,
        features: featureVector(statsFromHistory(homeHistory), statsFromHistory(awayHistory)),
        target: match.target,
      })
    }
    const homePoints = match.target === 'H' ? 3 : match.target === 'D' ? 1 : 0
    const awayPoints = match.target === 'A' ? 3 : match.target === 'D' ? 1 : 0
    history.set(match.home, [...homeHistory, { gf: match.homeGoals, ga: match.awayGoals, points: homePoints }])
    history.set(match.away, [...awayHistory, { gf: match.awayGoals, ga: match.homeGoals, points: awayPoints }])
  }
  return examples
}

function recentStats(matches: Match[], team: string): TeamStats | null {
  const history: TeamGame[] = []
  for (const match of matches) {
    if (match.home === team) {
      history.push({ gf: match.homeGoals, ga: match.awayGoals, points: match.target === 'H' ? 3 : match.target === 'D' ? 1 : 0 })
    } else if (match.away === team) {
      history.push({ gf: match.awayGoals, ga: match.homeGoals, points: match.target === 'A' ? 3 : match.target === 'D' ? 1 : 0 })
    }
  }
  return history.length ? statsFromHistory(history) : null
}

function meanAndScale(rows: number[][], indexes: number[]): { mean: number[]; scale: number[] } {
  const mean = indexes.map((index) => rows.reduce((sum, row) => sum + row[index], 0) / Math.max(1, rows.length))
  const scale = indexes.map((index, column) => {
    const variance = rows.reduce((sum, row) => sum + (row[index] - mean[column]) ** 2, 0) / Math.max(1, rows.length)
    return Math.sqrt(variance) || 1
  })
  return { mean, scale }
}

function transformed(row: number[], indexes: number[], mean: number[], scale: number[]): number[] {
  return indexes.map((index, column) => (row[index] - mean[column]) / scale[column])
}

function softmax(scores: number[]): number[] {
  const max = Math.max(...scores)
  const exponentials = scores.map((score) => Math.exp(score - max))
  const total = exponentials.reduce((sum, value) => sum + value, 0) || 1
  return exponentials.map((value) => value / total)
}

function indexOfOutcome(target: Outcome): number {
  return OUTCOMES.indexOf(target)
}

function fitSoftmax(rows: number[][], targets: Outcome[], indexes: number[], iterations = 220): SoftmaxModel {
  const { mean, scale } = meanAndScale(rows, indexes)
  const input = rows.map((row) => transformed(row, indexes, mean, scale))
  const weights = Array.from({ length: 3 }, () => Array(indexes.length).fill(0)) as number[][]
  const bias = [0, 0, 0]
  const rate = 0.08
  for (let epoch = 0; epoch < iterations; epoch += 1) {
    const weightGradient = weights.map((row) => row.map(() => 0))
    const biasGradient = [0, 0, 0]
    for (let sample = 0; sample < input.length; sample += 1) {
      const scores = weights.map((row, klass) => row.reduce((sum, weight, column) => sum + weight * input[sample][column], bias[klass]))
      const probabilities = softmax(scores)
      for (let klass = 0; klass < 3; klass += 1) {
        const error = probabilities[klass] - (indexOfOutcome(targets[sample]) === klass ? 1 : 0)
        biasGradient[klass] += error
        for (let column = 0; column < indexes.length; column += 1) weightGradient[klass][column] += error * input[sample][column]
      }
    }
    const step = rate / input.length / (1 + epoch * 0.005)
    for (let klass = 0; klass < 3; klass += 1) {
      bias[klass] -= step * biasGradient[klass]
      for (let column = 0; column < indexes.length; column += 1) {
        weights[klass][column] -= step * (weightGradient[klass][column] + 0.015 * weights[klass][column])
      }
    }
  }
  return { kind: 'softmax', indexes, mean, scale, weights, bias }
}

function predictSoftmax(model: SoftmaxModel, row: number[]): number[] {
  const input = transformed(row, model.indexes, model.mean, model.scale)
  return softmax(model.weights.map((weights, klass) => weights.reduce((sum, weight, column) => sum + weight * input[column], model.bias[klass])))
}

function fitNaiveBayes(rows: number[][], targets: Outcome[]): NaiveBayesModel {
  const mean: number[][] = []
  const variance: number[][] = []
  const prior: number[] = []
  for (const outcome of OUTCOMES) {
    const classRows = rows.filter((_, index) => targets[index] === outcome)
    const classMean = FEATURE_LABELS.map((_, column) => classRows.reduce((sum, row) => sum + row[column], 0) / Math.max(classRows.length, 1))
    const classVariance = FEATURE_LABELS.map((_, column) => {
      const v = classRows.reduce((sum, row) => sum + (row[column] - classMean[column]) ** 2, 0) / Math.max(classRows.length, 1)
      return Math.max(v, 1e-4)
    })
    mean.push(classMean)
    variance.push(classVariance)
    prior.push(classRows.length / Math.max(rows.length, 1))
  }
  return { kind: 'naiveBayes', mean, variance, prior }
}

function predictNaiveBayes(model: NaiveBayesModel, row: number[]): number[] {
  const logScores = OUTCOMES.map((_, klass) => {
    let score = Math.log(Math.max(model.prior[klass], 1e-12))
    for (let column = 0; column < row.length; column += 1) {
      const variance = model.variance[klass][column]
      score += -0.5 * Math.log(2 * Math.PI * variance) - (row[column] - model.mean[klass][column]) ** 2 / (2 * variance)
    }
    return score
  })
  return softmax(logScores)
}

export function fitNaiveBayesModel(rows: number[][], targets: Outcome[]): FittedModel {
  return fitNaiveBayes(rows, targets)
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 4294967296
  }
}

function fitFeedForward(rows: number[][], targets: Outcome[], epochs = 130): FeedForwardModel {
  const indexes = FEATURE_LABELS.map((_, index) => index)
  const { mean, scale } = meanAndScale(rows, indexes)
  const input = rows.map((row) => transformed(row, indexes, mean, scale))
  const hiddenCount = 10
  const random = seededRandom(73)
  const firstWeights = Array.from({ length: hiddenCount }, () => Array.from({ length: indexes.length }, () => (random() - 0.5) * 0.16))
  const firstBias = Array(hiddenCount).fill(0)
  const outputWeights = Array.from({ length: 3 }, () => Array.from({ length: hiddenCount }, () => (random() - 0.5) * 0.16))
  const outputBias = [0, 0, 0]
  const rate = 0.012

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    for (let sample = 0; sample < input.length; sample += 1) {
      const vector = input[sample]
      const hidden = firstWeights.map((weights, node) => Math.tanh(weights.reduce((sum, weight, column) => sum + weight * vector[column], firstBias[node])))
      const probabilities = softmax(outputWeights.map((weights, klass) => weights.reduce((sum, weight, node) => sum + weight * hidden[node], outputBias[klass])))
      const outputError = probabilities.map((probability, klass) => probability - (indexOfOutcome(targets[sample]) === klass ? 1 : 0))
      const hiddenError = hidden.map((value, node) => {
        const downstream = outputError.reduce((sum, error, klass) => sum + error * outputWeights[klass][node], 0)
        return downstream * (1 - value * value)
      })

      for (let klass = 0; klass < 3; klass += 1) {
        outputBias[klass] -= rate * outputError[klass]
        for (let node = 0; node < hiddenCount; node += 1) outputWeights[klass][node] -= rate * outputError[klass] * hidden[node]
      }
      for (let node = 0; node < hiddenCount; node += 1) {
        firstBias[node] -= rate * hiddenError[node]
        for (let column = 0; column < indexes.length; column += 1) firstWeights[node][column] -= rate * hiddenError[node] * vector[column]
      }
    }
  }
  return { kind: 'feedForward', mean, scale, firstWeights, firstBias, outputWeights, outputBias }
}

function predictFeedForward(model: FeedForwardModel, row: number[]): number[] {
  const input = transformed(row, FEATURE_LABELS.map((_, index) => index), model.mean, model.scale)
  const hidden = model.firstWeights.map((weights, node) => Math.tanh(weights.reduce((sum, weight, column) => sum + weight * input[column], model.firstBias[node])))
  return softmax(model.outputWeights.map((weights, klass) => weights.reduce((sum, weight, node) => sum + weight * hidden[node], model.outputBias[klass])))
}

export function predictModel(model: FittedModel, row: number[]): number[] {
  if (model.kind === 'softmax') return predictSoftmax(model, row)
  if (model.kind === 'naiveBayes') return predictNaiveBayes(model, row)
  return predictFeedForward(model, row)
}

function crossEntropy(rows: number[][], targets: Outcome[], model: FittedModel): number {
  const total = rows.reduce((sum, row, index) => sum - Math.log(Math.max(predictModel(model, row)[indexOfOutcome(targets[index])], 1e-9)), 0)
  return total / Math.max(rows.length, 1)
}

function geneticSelection(trainRows: number[][], trainTargets: Outcome[], validRows: number[][], validTargets: Outcome[]) {
  const featureCount = FEATURE_LABELS.length
  const random = seededRandom(101)
  const populationSize = 8
  let population = Array.from({ length: populationSize }, () => FEATURE_LABELS.map((_, index) => index < 2 || random() > 0.48))
  const score = (mask: boolean[]) => {
    const indexes = mask.flatMap((keep, index) => keep ? [index] : [])
    const model = fitSoftmax(trainRows, trainTargets, indexes, 90)
    return crossEntropy(validRows, validTargets, model)
  }
  let bestMask = population[0]
  let bestScore = Number.POSITIVE_INFINITY
  for (let generation = 0; generation < 4; generation += 1) {
    const ranked = population.map((mask) => ({ mask, score: score(mask) })).sort((a, b) => a.score - b.score)
    if (ranked[0].score < bestScore) {
      bestScore = ranked[0].score
      bestMask = ranked[0].mask
    }
    const next = [ranked[0].mask, ranked[1].mask]
    while (next.length < populationSize) {
      const first = ranked[Math.floor(random() * Math.max(3, populationSize / 2))].mask
      const second = ranked[Math.floor(random() * Math.max(3, populationSize / 2))].mask
      const cut = 1 + Math.floor(random() * (featureCount - 1))
      const child = FEATURE_LABELS.map((_, index) => (index < cut ? first[index] : second[index]))
      for (let index = 2; index < featureCount; index += 1) if (random() < 0.08) child[index] = !child[index]
      child[0] = true
      child[1] = true
      next.push(child)
    }
    population = next
  }
  return { indexes: bestMask.flatMap((keep, index) => keep ? [index] : []), validationLoss: bestScore }
}

function metricRow(name: string, actual: Outcome[], probabilities: number[][]): MetricRow {
  let correct = 0
  let logLoss = 0
  let brier = 0
  for (let index = 0; index < actual.length; index += 1) {
    const expected = indexOfOutcome(actual[index])
    const predicted = probabilities[index]
    if (predicted.indexOf(Math.max(...predicted)) === expected) correct += 1
    logLoss -= Math.log(Math.max(predicted[expected], 1e-9))
    for (let klass = 0; klass < 3; klass += 1) brier += (predicted[klass] - (klass === expected ? 1 : 0)) ** 2
  }
  return {
    name,
    accuracy: correct / Math.max(actual.length, 1),
    logLoss: logLoss / Math.max(actual.length, 1),
    brier: brier / Math.max(actual.length, 1),
  }
}

function makeRules(examples: Example[], maxExamples: number): Rule[] {
  const data = examples.slice(0, maxExamples)
  if (data.length < 10) return []
  const featureIndexes = [0, 1, 2, 4]
  const medians = featureIndexes.map((feature) => [...data].map((row) => row.features[feature]).sort((a, b) => a - b)[Math.floor(data.length / 2)])
  const items = data.map((example) => featureIndexes.map((feature, position) => `${FEATURE_LABELS[feature]} ${example.features[feature] >= medians[position] ? 'alta' : 'baja'}`))
  const outcomeCounts = OUTCOMES.map((outcome) => data.filter((row) => row.target === outcome).length)
  const result: Rule[] = []
  const featureItems = featureIndexes.map((_, position) => [...new Set(items.map((row) => row[position]))])
  const conditions = featureItems.flat()

  const candidateConditions: string[][] = conditions.map((condition) => [condition])
  for (let left = 0; left < conditions.length; left += 1) {
    for (let right = left + 1; right < conditions.length; right += 1) {
      if (conditions[left].split(' ')[0] !== conditions[right].split(' ')[0]) candidateConditions.push([conditions[left], conditions[right]])
    }
  }

  for (const conditionSet of candidateConditions) {
    const matching = data.filter((_, index) => conditionSet.every((condition) => items[index].includes(condition)))
    if (!matching.length) continue
    for (let outcomeIndex = 0; outcomeIndex < OUTCOMES.length; outcomeIndex += 1) {
      const outcome = OUTCOMES[outcomeIndex]
      const count = matching.filter((row) => row.target === outcome).length
      const support = count / data.length
      const confidence = count / matching.length
      const baseRate = outcomeCounts[outcomeIndex] / data.length
      const lift = baseRate ? confidence / baseRate : 0
      if (support >= 0.06 && confidence >= 0.46) {
        result.push({ condition: conditionSet.join(' + '), outcome: OUTCOME_LABELS[outcome], support, confidence, lift })
      }
    }
  }
  return result.sort((a, b) => b.lift - a.lift || b.support - a.support).slice(0, 8)
}

export function analyseMatches(matches: Match[]): Analysis {
  const examples = buildExamples(matches)
  if (examples.length < 60) throw new Error('El historial dejó menos de 60 partidos con forma previa. Sube más temporadas.')
  const trainEnd = Math.floor(examples.length * 0.70)
  const validationEnd = Math.floor(examples.length * 0.85)
  const train = examples.slice(0, trainEnd)
  const validation = examples.slice(trainEnd, validationEnd)
  const trainValidation = examples.slice(0, validationEnd)
  const test = examples.slice(validationEnd)
  const rows = (set: Example[]) => set.map((example) => example.features)
  const targets = (set: Example[]) => set.map((example) => example.target)
  const allFeatures = FEATURE_LABELS.map((_, index) => index)
  const genetic = geneticSelection(rows(train), targets(train), rows(validation), targets(validation))

  const models: Record<string, FittedModel> = {
    'Naive Bayes': fitNaiveBayes(rows(trainValidation), targets(trainValidation)),
    'Máxima Entropía': fitSoftmax(rows(trainValidation), targets(trainValidation), allFeatures, 240),
    'Feed-forward': fitFeedForward(rows(trainValidation), targets(trainValidation)),
    'Genético + MaxEnt': fitSoftmax(rows(trainValidation), targets(trainValidation), genetic.indexes, 240),
  }
  const metrics = Object.entries(models).map(([name, model]) => metricRow(name, targets(test), rows(test).map((row) => predictModel(model, row))))
    .sort((left, right) => left.logLoss - right.logLoss)

  return {
    examples,
    models,
    metrics,
    selectedFeatures: genetic.indexes.map((index) => FEATURE_LABELS[index]),
    geneticValidationLoss: genetic.validationLoss,
    testStart: test[0]?.date ?? '',
    tensorShape: [trainValidation.length, FEATURE_LABELS.length],
    rules: makeRules(examples, validationEnd),
  }
}

export function upcomingFeatures(matches: Match[], homeTeam: string, awayTeam: string): number[] {
  const home = recentStats(matches, homeTeam)
  const away = recentStats(matches, awayTeam)
  if (!home || !away) throw new Error('Cada equipo debe tener al menos un partido en el historial.')
  return featureVector(home, away)
}

export function matchProbabilities(analysis: Analysis, features: number[]) {
  return Object.entries(analysis.models).map(([name, model]) => {
    const probabilities = predictModel(model, features)
    return { name, probabilities: { H: probabilities[0], D: probabilities[1], A: probabilities[2] } }
  })
}

function randomGenerator(seed: number) {
  let value = seed >>> 0
  return () => {
    value = (1664525 * value + 1013904223) >>> 0
    return value / 4294967296
  }
}

function poisson(lambda: number, random: () => number): number {
  const threshold = Math.exp(-lambda)
  let product = 1
  let count = 0
  while (product > threshold) {
    count += 1
    product *= random()
  }
  return count - 1
}

export function monteCarlo(matches: Match[], homeTeam: string, awayTeam: string, simulations = 12_000) {
  const home = recentStats(matches, homeTeam)
  const away = recentStats(matches, awayTeam)
  if (!home || !away) throw new Error('Faltan partidos previos para simular.')
  const homeBase = matches.reduce((sum, match) => sum + match.homeGoals, 0) / matches.length
  const awayBase = matches.reduce((sum, match) => sum + match.awayGoals, 0) / matches.length
  const lambdaHome = Math.max(0.12, 0.55 * home.gf + 0.45 * away.ga + Math.max(0, homeBase - awayBase))
  const lambdaAway = Math.max(0.12, 0.55 * away.gf + 0.45 * home.ga)
  const random = randomGenerator(42)
  const count = { H: 0, D: 0, A: 0 }
  const scores = new Map<string, number>()
  for (let index = 0; index < simulations; index += 1) {
    const h = poisson(lambdaHome, random)
    const a = poisson(lambdaAway, random)
    count[h > a ? 'H' : h === a ? 'D' : 'A'] += 1
    const score = `${h}-${a}`
    scores.set(score, (scores.get(score) ?? 0) + 1)
  }
  const probabilities = { H: count.H / simulations, D: count.D / simulations, A: count.A / simulations }
  const topScores = [...scores.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5).map(([score, value]) => ({ score, frequency: value / simulations }))
  return { probabilities, lambdaHome, lambdaAway, topScores, simulations }
}

export function fairOdds(probability: number): string {
  return probability > 0 ? (1 / probability).toFixed(2) : '—'
}
