export interface Point2D {
  x: number;
  y: number;
  label?: number; // 0 or 1
  id?: string;
  isTest?: boolean;
  isOutlier?: boolean;
}

// ---------- Linear Regression & Gradient Descent ----------

export function computeOLS(points: Point2D[]): { w: number; b: number } {
  const n = points.length;
  if (n === 0) return { w: 0, b: 0 };
  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of points) {
    num += (p.x - meanX) * (p.y - meanY);
    den += (p.x - meanX) ** 2;
  }
  const w = den < 1e-9 ? 0 : num / den;
  const b = meanY - w * meanX;
  return { w, b };
}

export function computeMSE(points: Point2D[], w: number, b: number): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const err = w * p.x + b - p.y;
    sum += err * err;
  }
  return sum / points.length;
}

export function computeLinearGradients(
  points: Point2D[],
  w: number,
  b: number
): { dw: number; db: number } {
  const n = points.length;
  if (n === 0) return { dw: 0, db: 0 };
  let dw = 0;
  let db = 0;
  for (const p of points) {
    const err = w * p.x + b - p.y;
    dw += (2 / n) * err * p.x;
    db += (2 / n) * err;
  }
  return { dw, db };
}

// ---------- Logistic Regression & Sigmoid ----------

export function sigmoid(z: number): number {
  if (z > 30) return 1 - 1e-13;
  if (z < -30) return 1e-13;
  return 1 / (1 + Math.exp(-z));
}

export function fitLogistic1D(
  points: { x: number; y: number }[],
  iterations = 600,
  lr = 0.08
): { w: number; b: number } {
  if (points.length === 0) return { w: 1, b: -5 };
  // Standardize x for numerical stability, then unscale back
  const meanX = points.reduce((s, p) => s + p.x, 0) / points.length;
  const stdX =
    Math.sqrt(
      points.reduce((s, p) => s + (p.x - meanX) ** 2, 0) / points.length
    ) || 1;

  let wS = 1.5;
  let bS = 0;
  const n = points.length;
  const reg = 0.015; // gentle L2 regularization keeps weights clean even when separable

  for (let i = 0; i < iterations; i++) {
    let dw = 0;
    let db = 0;
    for (const p of points) {
      const xs = (p.x - meanX) / stdX;
      const pred = sigmoid(wS * xs + bS);
      const diff = pred - p.y;
      dw += diff * xs;
      db += diff;
    }
    wS -= lr * (dw / n + reg * wS);
    bS -= lr * (db / n);
  }

  const w = wS / stdX;
  const b = bS - (wS * meanX) / stdX;
  return { w, b };
}

export function computeBinaryCrossEntropy(
  points: { x: number; y: number }[],
  w: number,
  b: number
): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const prob = Math.min(1 - 1e-7, Math.max(1e-7, sigmoid(w * p.x + b)));
    sum += -(p.y * Math.log(prob) + (1 - p.y) * Math.log(1 - prob));
  }
  return sum / points.length;
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  accuracy: number;
  precision: number;
  recall: number;
}

export function computeConfusionMatrix(
  points: { x: number; y: number }[],
  predictProb: (x: number) => number,
  threshold: number
): ConfusionMatrix {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (const p of points) {
    const pred = predictProb(p.x) >= threshold ? 1 : 0;
    if (p.y === 1 && pred === 1) tp++;
    else if (p.y === 0 && pred === 1) fp++;
    else if (p.y === 0 && pred === 0) tn++;
    else fn++;
  }
  const total = tp + fp + tn + fn || 1;
  const accuracy = (tp + tn) / total;
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  return { tp, fp, tn, fn, accuracy, precision, recall };
}

// ---------- K-Means Step Solver (Stage 3) ----------

export interface Centroid {
  x: number;
  y: number;
  cluster: number;
}

export function assignKMeansClusters(
  points: Point2D[],
  centroids: Centroid[]
): number[] {
  return points.map((p) => {
    let bestCluster = 0;
    let bestDist = Infinity;
    for (const c of centroids) {
      const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestCluster = c.cluster;
      }
    }
    return bestCluster;
  });
}

export function updateKMeansCentroids(
  points: Point2D[],
  assignments: number[],
  centroids: Centroid[]
): Centroid[] {
  return centroids.map((c) => {
    const members = points.filter((_, idx) => assignments[idx] === c.cluster);
    if (members.length === 0) return c;
    const avgX = members.reduce((s, p) => s + p.x, 0) / members.length;
    const avgY = members.reduce((s, p) => s + p.y, 0) / members.length;
    return { ...c, x: avgX, y: avgY };
  });
}

// ---------- Stage 6: Deterministic Two-Moons Dataset, KNN & Decision Tree ----------

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateTwoMoonsData(): {
  train: Point2D[];
  test: Point2D[];
} {
  const rand = seededRandom(42);
  const all: Point2D[] = [];

  // Upper moon (Class 0 - Azure)
  for (let i = 0; i < 40; i++) {
    const angle = (Math.PI * i) / 39;
    const noiseX = (rand() - 0.5) * 0.24;
    const noiseY = (rand() - 0.5) * 0.24;
    // Map to [0.5, 9.5] coordinate box
    const rawX = Math.cos(angle) + noiseX; // [-1, 1]
    const rawY = Math.sin(angle) + noiseY; // [0, 1]
    const x = 3.8 + rawX * 2.5;
    const y = 4.6 + rawY * 3.1;
    all.push({
      id: `m0-${i}`,
      x: Math.max(0.4, Math.min(9.6, x)),
      y: Math.max(0.4, Math.min(9.6, y)),
      label: 0,
      isTest: i % 4 === 3,
    });
  }

  // Lower moon (Class 1 - Crimson)
  for (let i = 0; i < 40; i++) {
    const angle = (Math.PI * i) / 39;
    const noiseX = (rand() - 0.5) * 0.24;
    const noiseY = (rand() - 0.5) * 0.24;
    const rawX = 1 - Math.cos(angle) + noiseX; // [0, 2]
    const rawY = 0.5 - Math.sin(angle) + noiseY; // [-0.5, 0.5]
    const x = 3.8 + rawX * 2.5;
    const y = 3.9 + rawY * 3.1;
    all.push({
      id: `m1-${i}`,
      x: Math.max(0.4, Math.min(9.6, x)),
      y: Math.max(0.4, Math.min(9.6, y)),
      label: 1,
      isTest: i % 4 === 3,
    });
  }

  // Inject 2 subtle noisy training points to make k=1 / depth=4 overfitting crystal clear
  all.push({ id: 'noise-1', x: 3.5, y: 7.4, label: 1, isTest: false });
  all.push({ id: 'noise-2', x: 6.4, y: 2.6, label: 0, isTest: false });

  return {
    train: all.filter((p) => !p.isTest),
    test: all.filter((p) => p.isTest),
  };
}

export function knnPredict(
  train: Point2D[],
  qx: number,
  qy: number,
  k: number
): {
  prediction: number;
  votes0: number;
  votes1: number;
  radius: number;
  neighbors: (Point2D & { dist: number })[];
} {
  const withDist = train
    .map((p) => ({
      ...p,
      dist: Math.hypot(p.x - qx, p.y - qy),
    }))
    .sort((a, b) => a.dist - b.dist);

  const clampedK = Math.max(1, Math.min(k, withDist.length));
  const neighbors = withDist.slice(0, clampedK);
  let votes0 = 0;
  let votes1 = 0;
  for (const n of neighbors) {
    if (n.label === 1) votes1++;
    else votes0++;
  }
  return {
    prediction: votes1 > votes0 ? 1 : 0,
    votes0,
    votes1,
    radius: neighbors[neighbors.length - 1]?.dist ?? 0,
    neighbors,
  };
}

export function evaluateKNNAccuracy(
  train: Point2D[],
  evalSet: Point2D[],
  k: number,
  leaveOneOut = false
): number {
  if (evalSet.length === 0) return 0;
  let correct = 0;
  for (const p of evalSet) {
    const pool = leaveOneOut ? train.filter((t) => t.id !== p.id) : train;
    const { prediction } = knnPredict(pool.length ? pool : train, p.x, p.y, k);
    if (prediction === p.label) correct++;
  }
  return correct / evalSet.length;
}

// ---------- Orthogonal Decision Tree (Entropy + Information Gain) ----------

export interface RectBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface DecisionTreeNode {
  id: string;
  depth: number;
  bounds: RectBounds;
  count0: number;
  count1: number;
  entropy: number;
  prediction: number;
  isLeaf: boolean;
  splitAxis?: 'x' | 'y';
  splitValue?: number;
  infoGain?: number;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
}

export function computeEntropy(c0: number, c1: number): number {
  const total = c0 + c1;
  if (total === 0) return 0;
  const p0 = c0 / total;
  const p1 = c1 / total;
  let h = 0;
  if (p0 > 0) h -= p0 * Math.log2(p0);
  if (p1 > 0) h -= p1 * Math.log2(p1);
  return h;
}

export function buildDecisionTree(
  points: Point2D[],
  maxDepth: number,
  bounds: RectBounds = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 },
  depth = 0,
  id = 'root'
): DecisionTreeNode {
  const c0 = points.filter((p) => p.label === 0).length;
  const c1 = points.filter((p) => p.label === 1).length;
  const entropy = computeEntropy(c0, c1);
  const prediction = c1 > c0 ? 1 : 0;

  if (depth >= maxDepth || entropy < 1e-6 || points.length < 3) {
    return {
      id,
      depth,
      bounds,
      count0: c0,
      count1: c1,
      entropy,
      prediction,
      isLeaf: true,
    };
  }

  let bestGain = -1;
  let bestAxis: 'x' | 'y' = 'x';
  let bestVal = 5;

  for (const axis of ['x', 'y'] as const) {
    const sorted = [...points].sort((a, b) => a[axis] - b[axis]);
    for (let i = 0; i < sorted.length - 1; i++) {
      const aVal = sorted[i][axis];
      const bVal = sorted[i + 1][axis];
      if (Math.abs(bVal - aVal) < 1e-4) continue;
      const threshold = (aVal + bVal) / 2;
      const leftPts = sorted.slice(0, i + 1);
      const rightPts = sorted.slice(i + 1);
      const l0 = leftPts.filter((p) => p.label === 0).length;
      const l1 = leftPts.length - l0;
      const r0 = rightPts.filter((p) => p.label === 0).length;
      const r1 = rightPts.length - r0;
      const weightedH =
        (leftPts.length / points.length) * computeEntropy(l0, l1) +
        (rightPts.length / points.length) * computeEntropy(r0, r1);
      const gain = entropy - weightedH;
      if (gain > bestGain) {
        bestGain = gain;
        bestAxis = axis;
        bestVal = threshold;
      }
    }
  }

  if (bestGain <= 0.01) {
    return {
      id,
      depth,
      bounds,
      count0: c0,
      count1: c1,
      entropy,
      prediction,
      isLeaf: true,
    };
  }

  const leftPts = points.filter((p) => p[bestAxis] <= bestVal);
  const rightPts = points.filter((p) => p[bestAxis] > bestVal);

  const leftBounds: RectBounds =
    bestAxis === 'x'
      ? { ...bounds, xMax: bestVal }
      : { ...bounds, yMax: bestVal };
  const rightBounds: RectBounds =
    bestAxis === 'x'
      ? { ...bounds, xMin: bestVal }
      : { ...bounds, yMin: bestVal };

  return {
    id,
    depth,
    bounds,
    count0: c0,
    count1: c1,
    entropy,
    prediction,
    isLeaf: false,
    splitAxis: bestAxis,
    splitValue: bestVal,
    infoGain: bestGain,
    left: buildDecisionTree(leftPts, maxDepth, leftBounds, depth + 1, `${id}-L`),
    right: buildDecisionTree(
      rightPts,
      maxDepth,
      rightBounds,
      depth + 1,
      `${id}-R`
    ),
  };
}

export function predictDecisionTree(
  node: DecisionTreeNode,
  x: number,
  y: number
): number {
  if (node.isLeaf || !node.splitAxis || node.splitValue === undefined) {
    return node.prediction;
  }
  const val = node.splitAxis === 'x' ? x : y;
  if (val <= node.splitValue && node.left) {
    return predictDecisionTree(node.left, x, y);
  }
  if (node.right) {
    return predictDecisionTree(node.right, x, y);
  }
  return node.prediction;
}

export function evaluateTreeAccuracy(
  root: DecisionTreeNode,
  points: Point2D[]
): number {
  if (points.length === 0) return 0;
  let correct = 0;
  for (const p of points) {
    if (predictDecisionTree(root, p.x, p.y) === p.label) correct++;
  }
  return correct / points.length;
}

export function collectTreeLeaves(node: DecisionTreeNode): DecisionTreeNode[] {
  if (node.isLeaf) return [node];
  return [
    ...(node.left ? collectTreeLeaves(node.left) : []),
    ...(node.right ? collectTreeLeaves(node.right) : []),
  ];
}

export function collectTreeNodes(node: DecisionTreeNode): DecisionTreeNode[] {
  const list: DecisionTreeNode[] = [node];
  if (node.left) list.push(...collectTreeNodes(node.left));
  if (node.right) list.push(...collectTreeNodes(node.right));
  return list;
}

// ---------- Stage 7: Multinomial Naive Bayes with Laplace Smoothing ----------

export interface NBWordStats {
  word: string;
  spamCount: number;
  hamCount: number;
  category: 'spam-leaning' | 'ham-leaning' | 'unseen';
}

export const NB_CORPUS_VOCAB: NBWordStats[] = [
  { word: 'WINNER', spamCount: 18, hamCount: 1, category: 'spam-leaning' },
  { word: 'URGENT', spamCount: 14, hamCount: 3, category: 'spam-leaning' },
  { word: 'FREE', spamCount: 22, hamCount: 4, category: 'spam-leaning' },
  { word: 'PRIZE', spamCount: 15, hamCount: 0, category: 'spam-leaning' },
  { word: 'MEETING', spamCount: 1, hamCount: 21, category: 'ham-leaning' },
  { word: 'PROJECT', spamCount: 2, hamCount: 19, category: 'ham-leaning' },
  { word: 'SCHEDULE', spamCount: 1, hamCount: 16, category: 'ham-leaning' },
  { word: 'LAB', spamCount: 0, hamCount: 14, category: 'ham-leaning' },
  { word: 'CRYPTO', spamCount: 0, hamCount: 0, category: 'unseen' },
  { word: 'INVOICE', spamCount: 0, hamCount: 0, category: 'unseen' },
];

export const NB_PRIOR_SPAM = 0.4;
export const NB_PRIOR_HAM = 0.6;
export const NB_TOTAL_SPAM_WORDS = 80;
export const NB_TOTAL_HAM_WORDS = 100;
export const NB_VOCAB_SIZE = 10;

export interface NBResult {
  spamScore: number;
  hamScore: number;
  probSpam: number;
  probHam: number;
  zeroCollapse: boolean;
  breakdown: {
    word: string;
    pGivenSpam: number;
    pGivenHam: number;
    spamCount: number;
    hamCount: number;
    isZeroSpam: boolean;
    isZeroHam: boolean;
  }[];
}

export function computeNaiveBayes(
  selectedWords: string[],
  laplaceSmoothing: boolean
): NBResult {
  const alpha = laplaceSmoothing ? 1 : 0;
  const denomSpam = NB_TOTAL_SPAM_WORDS + alpha * NB_VOCAB_SIZE;
  const denomHam = NB_TOTAL_HAM_WORDS + alpha * NB_VOCAB_SIZE;

  let spamScore = NB_PRIOR_SPAM;
  let hamScore = NB_PRIOR_HAM;

  const breakdown = selectedWords.map((w) => {
    const stat = NB_CORPUS_VOCAB.find((item) => item.word === w) ?? {
      word: w,
      spamCount: 0,
      hamCount: 0,
      category: 'unseen' as const,
    };
    const pGivenSpam = (stat.spamCount + alpha) / denomSpam;
    const pGivenHam = (stat.hamCount + alpha) / denomHam;
    spamScore *= pGivenSpam;
    hamScore *= pGivenHam;
    return {
      word: w,
      pGivenSpam,
      pGivenHam,
      spamCount: stat.spamCount,
      hamCount: stat.hamCount,
      isZeroSpam: pGivenSpam === 0,
      isZeroHam: pGivenHam === 0,
    };
  });

  const sum = spamScore + hamScore;
  const zeroCollapse = selectedWords.length > 0 && (spamScore === 0 || hamScore === 0);

  let probSpam = 0.4;
  let probHam = 0.6;
  if (selectedWords.length > 0) {
    if (sum === 0) {
      probSpam = 0;
      probHam = 0;
    } else {
      probSpam = spamScore / sum;
      probHam = hamScore / sum;
    }
  }

  return {
    spamScore,
    hamScore,
    probSpam,
    probHam,
    zeroCollapse,
    breakdown,
  };
}
