import { Point2D, buildDecisionTree, predictDecisionTree, DecisionTreeNode } from '@/lib/ml-math';

function seededRand(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ============================================================
// Chapter 03: Feature Scaling & Optimization Contours
// ============================================================

export interface ScalingSample {
  id: string;
  areaSqFt: number; // ~600..3000
  bedrooms: number; // ~1..5
  priceK: number;
}

export const RAW_HOUSE_SAMPLES: ScalingSample[] = [
  { id: 'h1', areaSqFt: 750, bedrooms: 1, priceK: 185 },
  { id: 'h2', areaSqFt: 1100, bedrooms: 2, priceK: 245 },
  { id: 'h3', areaSqFt: 1350, bedrooms: 2, priceK: 280 },
  { id: 'h4', areaSqFt: 1600, bedrooms: 3, priceK: 335 },
  { id: 'h5', areaSqFt: 1850, bedrooms: 3, priceK: 370 },
  { id: 'h6', areaSqFt: 2200, bedrooms: 4, priceK: 440 },
  { id: 'h7', areaSqFt: 2550, bedrooms: 4, priceK: 495 },
  { id: 'h8', areaSqFt: 2950, bedrooms: 5, priceK: 560 },
];

export type ScalingMethod = 'none' | 'minmax' | 'zscore';

export interface ScaledPoint {
  id: string;
  x1: number;
  x2: number;
  raw1: number;
  raw2: number;
}

export function scaleHouseDataset(method: ScalingMethod): {
  points: ScaledPoint[];
  conditionRatio: number;
  x1Range: [number, number];
  x2Range: [number, number];
} {
  const aVals = RAW_HOUSE_SAMPLES.map((s) => s.areaSqFt);
  const bVals = RAW_HOUSE_SAMPLES.map((s) => s.bedrooms);

  const minA = Math.min(...aVals);
  const maxA = Math.max(...aVals);
  const minB = Math.min(...bVals);
  const maxB = Math.max(...bVals);

  const meanA = aVals.reduce((s, v) => s + v, 0) / aVals.length;
  const meanB = bVals.reduce((s, v) => s + v, 0) / bVals.length;
  const stdA =
    Math.sqrt(aVals.reduce((s, v) => s + (v - meanA) ** 2, 0) / aVals.length) || 1;
  const stdB =
    Math.sqrt(bVals.reduce((s, v) => s + (v - meanB) ** 2, 0) / bVals.length) || 1;

  if (method === 'minmax') {
    return {
      points: RAW_HOUSE_SAMPLES.map((s) => ({
        id: s.id,
        x1: (s.areaSqFt - minA) / (maxA - minA),
        x2: (s.bedrooms - minB) / (maxB - minB),
        raw1: s.areaSqFt,
        raw2: s.bedrooms,
      })),
      conditionRatio: 1.15,
      x1Range: [0, 1],
      x2Range: [0, 1],
    };
  }

  if (method === 'zscore') {
    return {
      points: RAW_HOUSE_SAMPLES.map((s) => ({
        id: s.id,
        x1: (s.areaSqFt - meanA) / stdA,
        x2: (s.bedrooms - meanB) / stdB,
        raw1: s.areaSqFt,
        raw2: s.bedrooms,
      })),
      conditionRatio: 1.0,
      x1Range: [-2, 2],
      x2Range: [-2, 2],
    };
  }

  // Unscaled raw values have enormous anisotropy ratio (~550:1)
  return {
    points: RAW_HOUSE_SAMPLES.map((s) => ({
      id: s.id,
      x1: s.areaSqFt,
      x2: s.bedrooms,
      raw1: s.areaSqFt,
      raw2: s.bedrooms,
    })),
    conditionRatio: Number(((maxA - minA) / (maxB - minB)).toFixed(0)),
    x1Range: [500, 3200],
    x2Range: [0, 6],
  };
}

// Simulate 2D quadratic loss L(w1, w2) = a * w1^2 + b * w2^2 to visualize elongated vs spherical GD paths
export function simulateContourGD(
  method: ScalingMethod,
  lr: number,
  steps = 28
): {
  path: { w1: number; w2: number; loss: number }[];
  curvatureX: number;
  curvatureY: number;
  convergedStep: number | null;
} {
  // Elongated canyon when unscaled vs circular bowl when scaled
  const curvatureX = method === 'none' ? 1.0 : 1.0;
  const curvatureY = method === 'none' ? 14.0 : method === 'minmax' ? 1.35 : 1.05;

  // Map lr slider cleanly to stable/oscillatory step size
  const effLr = method === 'none' ? lr * 0.068 : lr * 0.32;

  let w1 = -3.4;
  let w2 = 1.6;
  const path: { w1: number; w2: number; loss: number }[] = [
    { w1, w2, loss: curvatureX * w1 * w1 + curvatureY * w2 * w2 },
  ];
  let convergedStep: number | null = null;

  for (let i = 1; i <= steps; i++) {
    const g1 = 2 * curvatureX * w1;
    const g2 = 2 * curvatureY * w2;
    w1 = Math.max(-4.5, Math.min(4.5, w1 - effLr * g1));
    w2 = Math.max(-2.6, Math.min(2.6, w2 - effLr * g2));
    const loss = curvatureX * w1 * w1 + curvatureY * w2 * w2;
    path.push({ w1, w2, loss });
    if (convergedStep === null && loss < 0.08) {
      convergedStep = i;
    }
  }

  return { path, curvatureX, curvatureY, convergedStep };
}

// ============================================================
// Chapter 05: Bias–Variance Tradeoff & Regularization (L1 / L2)
// ============================================================

export function generateWaveSplit(): { train: Point2D[]; test: Point2D[] } {
  const rand = seededRand(105);
  const train: Point2D[] = [];
  const test: Point2D[] = [];

  for (let i = 0; i < 12; i++) {
    const x = -1 + (2 * i) / 11;
    const noise = (rand() - 0.5) * 0.62;
    const y = Math.sin(Math.PI * x) + noise;
    train.push({ id: `tr-${i}`, x, y, isTest: false });
  }

  for (let i = 0; i < 10; i++) {
    const x = -0.92 + (1.84 * i) / 9;
    const noise = (rand() - 0.5) * 0.45;
    const y = Math.sin(Math.PI * x) + noise;
    test.push({ id: `te-${i}`, x, y, isTest: true });
  }

  return { train, test };
}

// Gaussian elimination linear system solver A * w = b
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) {
        pivot = r;
      }
    }
    const tmp = M[col];
    M[col] = M[pivot];
    M[pivot] = tmp;

    const diag = M[col][col];
    if (Math.abs(diag) < 1e-12) continue;

    for (let j = col; j <= n; j++) {
      M[col][j] /= diag;
    }
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      for (let j = col; j <= n; j++) {
        M[r][j] -= factor * M[col][j];
      }
    }
  }

  return M.map((row) => (Number.isFinite(row[n]) ? row[n] : 0));
}

export function fitPolynomialRegularized(
  points: Point2D[],
  degree: number,
  lambda: number,
  penaltyType: 'l2' | 'l1'
): number[] {
  const d = Math.max(1, Math.min(9, degree));
  const m = d + 1;

  // Build Vandermonde matrix X
  const X: number[][] = points.map((p) => {
    const row: number[] = [];
    for (let j = 0; j < m; j++) {
      row.push(Math.pow(p.x, j));
    }
    return row;
  });

  // Closed-form Ridge initialization (X^T X + lambda * I) w = X^T y (do not penalize intercept j=0)
  const XtX: number[][] = Array.from({ length: m }, () => Array(m).fill(0));
  const Xty: number[] = Array(m).fill(0);

  for (let i = 0; i < points.length; i++) {
    for (let r = 0; r < m; r++) {
      Xty[r] += X[i][r] * points[i].y;
      for (let c = 0; c < m; c++) {
        XtX[r][c] += X[i][r] * X[i][c];
      }
    }
  }

  const baseReg = penaltyType === 'l2' ? lambda : Math.max(1e-5, lambda * 0.05);
  for (let j = 1; j < m; j++) {
    XtX[j][j] += baseReg + 1e-7;
  }

  const w = solveLinearSystem(XtX, Xty);

  if (penaltyType === 'l2' || lambda <= 0) {
    return w;
  }

  // Coordinate descent soft-thresholding for L1 Lasso sparsity
  const wL1 = [...w];
  const n = points.length;
  for (let iter = 0; iter < 60; iter++) {
    for (let j = 0; j < m; j++) {
      let rho = 0;
      let z = 0;
      for (let i = 0; i < n; i++) {
        let predWithoutJ = 0;
        for (let k = 0; k < m; k++) {
          if (k !== j) predWithoutJ += X[i][k] * wL1[k];
        }
        rho += X[i][j] * (points[i].y - predWithoutJ);
        z += X[i][j] * X[i][j];
      }
      if (z < 1e-9) continue;
      if (j === 0) {
        wL1[0] = rho / z;
      } else {
        const thresh = lambda * 0.85;
        if (rho < -thresh) wL1[j] = (rho + thresh) / z;
        else if (rho > thresh) wL1[j] = (rho - thresh) / z;
        else wL1[j] = 0;
      }
    }
  }

  return wL1;
}

export function predictPolynomial(weights: number[], x: number): number {
  let y = 0;
  for (let j = 0; j < weights.length; j++) {
    y += weights[j] * Math.pow(x, j);
  }
  return y;
}

export function computePolyMSE(points: Point2D[], weights: number[]): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const err = predictPolynomial(weights, p.x) - p.y;
    sum += err * err;
  }
  return sum / points.length;
}

// ============================================================
// Chapter 07: Support Vector Machines (Linear Soft-Margin + Kernel Trick)
// ============================================================

export interface SVMPoint {
  id: string;
  x: number;
  y: number;
  label: -1 | 1;
  isOutlier?: boolean;
}

export const SVM_LINEAR_POINTS: SVMPoint[] = [
  // Class -1 (Cobalt lower-left)
  { id: 's1', x: 1.6, y: 2.2, label: -1 },
  { id: 's2', x: 2.1, y: 3.4, label: -1 },
  { id: 's3', x: 2.8, y: 1.8, label: -1 },
  { id: 's4', x: 3.3, y: 3.1, label: -1 },
  { id: 's5', x: 2.4, y: 4.5, label: -1 },
  { id: 's6', x: 3.7, y: 2.0, label: -1 },
  { id: 's7', x: 1.4, y: 3.8, label: -1 },
  // Class +1 (Crimson upper-right)
  { id: 's8', x: 6.4, y: 7.2, label: 1 },
  { id: 's9', x: 7.2, y: 6.1, label: 1 },
  { id: 's10', x: 6.8, y: 8.3, label: 1 },
  { id: 's11', x: 8.1, y: 7.5, label: 1 },
  { id: 's12', x: 7.6, y: 5.2, label: 1 },
  { id: 's13', x: 8.5, y: 6.4, label: 1 },
  { id: 's14', x: 6.1, y: 5.8, label: 1 },
];

export const SVM_OUTLIER_POINT: SVMPoint = {
  id: 's-outlier',
  x: 5.7,
  y: 4.7,
  label: -1,
  isOutlier: true,
};

export function generateConcentricSVMData(): SVMPoint[] {
  const pts: SVMPoint[] = [];
  // Inner circle (Class +1)
  for (let i = 0; i < 12; i++) {
    const a = (2 * Math.PI * i) / 12 + 0.15;
    const r = i % 2 === 0 ? 1.15 : 1.55;
    pts.push({
      id: `in-${i}`,
      x: 5 + r * Math.cos(a),
      y: 5 + r * Math.sin(a),
      label: 1,
    });
  }
  // Outer ring (Class -1)
  for (let i = 0; i < 18; i++) {
    const a = (2 * Math.PI * i) / 18;
    const r = i % 2 === 0 ? 3.25 : 3.65;
    pts.push({
      id: `out-${i}`,
      x: 5 + r * Math.cos(a),
      y: 5 + r * Math.sin(a),
      label: -1,
    });
  }
  return pts;
}

export interface LinearSVMResult {
  w1: number;
  w2: number;
  b: number;
  normW: number;
  marginWidth: number;
  supportVectorIds: string[];
  violationIds: string[];
  accuracy: number;
}

export function fitLinearSVM(points: SVMPoint[], C: number): LinearSVMResult {
  // Optimize hinge objective: 0.5*||w||^2 + C * sum(max(0, 1 - y_i(w.x_i + b)))
  // Center coordinates for clean convergence, then transform back
  const cx = 5;
  const cy = 5;
  let w1 = 0.4;
  let w2 = 0.4;
  let bC = 0;

  const steps = 1600;
  for (let t = 1; t <= steps; t++) {
    const lr = 0.18 / Math.sqrt(t + 12);
    let g1 = w1;
    let g2 = w2;
    let gb = 0;
    for (const p of points) {
      const px = p.x - cx;
      const py = p.y - cy;
      const margin = p.label * (w1 * px + w2 * py + bC);
      if (margin < 1) {
        g1 -= C * p.label * px;
        g2 -= C * p.label * py;
        gb -= C * p.label;
      }
    }
    w1 -= lr * (g1 / Math.max(1, C * 0.6 + 1));
    w2 -= lr * (g2 / Math.max(1, C * 0.6 + 1));
    bC -= lr * (gb / Math.max(1, C * 0.6 + 1));
  }

  const b = bC - w1 * cx - w2 * cy;
  const normW = Math.hypot(w1, w2) || 1e-6;
  const marginWidth = 2 / normW;

  const supportVectorIds: string[] = [];
  const violationIds: string[] = [];
  let correct = 0;

  for (const p of points) {
    const functionalMargin = p.label * (w1 * p.x + w2 * p.y + b);
    if (functionalMargin >= 0) correct++;
    if (functionalMargin < 0.92) {
      violationIds.push(p.id);
      supportVectorIds.push(p.id);
    } else if (functionalMargin <= 1.28) {
      supportVectorIds.push(p.id);
    }
  }

  return {
    w1,
    w2,
    b,
    normW,
    marginWidth,
    supportVectorIds,
    violationIds,
    accuracy: points.length ? correct / points.length : 1,
  };
}

export type SVMKernelType = 'linear' | 'poly' | 'rbf';

export function fitKernelSVM(
  points: SVMPoint[],
  kernel: SVMKernelType,
  gamma: number,
  C: number
): {
  decisionValue: (x: number, y: number) => number;
  accuracy: number;
  supportVectorIds: string[];
} {
  const n = points.length;
  const kernelFn = (x1: number, y1: number, x2: number, y2: number): number => {
    const a1 = (x1 - 5) / 3.5;
    const b1 = (y1 - 5) / 3.5;
    const a2 = (x2 - 5) / 3.5;
    const b2 = (y2 - 5) / 3.5;
    if (kernel === 'linear') {
      return a1 * a2 + b1 * b2;
    }
    if (kernel === 'poly') {
      return Math.pow(a1 * a2 + b1 * b2 + 1, 2);
    }
    const distSq = (a1 - a2) ** 2 + (b1 - b2) ** 2;
    return Math.exp(-gamma * distSq);
  };

  // Precompute Gram matrix
  const K: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      kernelFn(points[i].x, points[i].y, points[j].x, points[j].y)
    )
  );

  // Dual projected coordinate ascent (compact SMO-style update)
  const alpha = new Array<number>(n).fill(0);
  let bias = 0;

  for (let pass = 0; pass < 45; pass++) {
    for (let i = 0; i < n; i++) {
      let fi = bias;
      for (let j = 0; j < n; j++) {
        fi += alpha[j] * points[j].label * K[j][i];
      }
      const err = points[i].label * fi;
      if (err < 1) {
        const step = (1 - err) / (K[i][i] + 0.15);
        const nextAlpha = Math.max(0, Math.min(C, alpha[i] + 0.35 * step));
        const delta = nextAlpha - alpha[i];
        alpha[i] = nextAlpha;
        bias += 0.12 * delta * points[i].label;
      }
    }
  }

  const decisionValue = (x: number, y: number): number => {
    let val = bias;
    for (let i = 0; i < n; i++) {
      if (alpha[i] > 1e-4) {
        val += alpha[i] * points[i].label * kernelFn(points[i].x, points[i].y, x, y);
      }
    }
    return val;
  };

  let correct = 0;
  const supportVectorIds: string[] = [];
  for (let i = 0; i < n; i++) {
    const score = decisionValue(points[i].x, points[i].y);
    if (score * points[i].label >= 0) correct++;
    if (alpha[i] > C * 0.08) supportVectorIds.push(points[i].id);
  }

  return {
    decisionValue,
    accuracy: n ? correct / n : 1,
    supportVectorIds,
  };
}

// ============================================================
// Chapter 10: Ensemble Learning (Random Forest Bagging vs. Boosting)
// ============================================================

export function generateEnsembleData(): { train: Point2D[]; test: Point2D[] } {
  const rand = seededRand(210);
  const all: Point2D[] = [];

  for (let i = 0; i < 64; i++) {
    const x = 0.8 + rand() * 8.4;
    const y = 0.8 + rand() * 8.4;
    const boundary = 5.0 + 1.8 * Math.sin((x - 1.5) * 0.65);
    const trueLabel = y > boundary ? 1 : 0;
    // Flip 10% of training labels to demonstrate single-tree overfitting vs forest stability
    const isTest = i % 4 === 3;
    const flip = !isTest && rand() < 0.11;
    all.push({
      id: `ens-${i}`,
      x,
      y,
      label: flip ? (trueLabel === 1 ? 0 : 1) : trueLabel,
      isTest,
    });
  }

  return {
    train: all.filter((p) => !p.isTest),
    test: all.filter((p) => p.isTest),
  };
}

export function fitBaggedForest(
  train: Point2D[],
  numTrees: number,
  maxDepth: number
): {
  trees: DecisionTreeNode[];
  predictProb: (x: number, y: number) => number;
  trainAcc: number;
  testAcc: (test: Point2D[]) => number;
} {
  const trees: DecisionTreeNode[] = [];
  for (let t = 0; t < numTrees; t++) {
    const rand = seededRand(900 + t * 37);
    const sample: Point2D[] = [];
    for (let i = 0; i < train.length; i++) {
      const idx = Math.floor(rand() * train.length);
      sample.push(train[idx]);
    }
    trees.push(buildDecisionTree(sample, maxDepth));
  }

  const predictProb = (x: number, y: number) => {
    let votes = 0;
    for (const tree of trees) {
      votes += predictDecisionTree(tree, x, y);
    }
    return votes / Math.max(1, trees.length);
  };

  const evalSet = (pts: Point2D[]) => {
    if (pts.length === 0) return 0;
    let ok = 0;
    for (const p of pts) {
      const pred = predictProb(p.x, p.y) >= 0.5 ? 1 : 0;
      if (pred === p.label) ok++;
    }
    return ok / pts.length;
  };

  return {
    trees,
    predictProb,
    trainAcc: evalSet(train),
    testAcc: evalSet,
  };
}

export interface BoostStump {
  axis: 'x' | 'y';
  threshold: number;
  polarity: 1 | -1;
  alpha: number;
}

export function fitAdaBoostStumps(
  train: Point2D[],
  rounds: number
): {
  stumps: BoostStump[];
  sampleWeights: number[];
  predictScore: (x: number, y: number) => number;
  trainAcc: number;
  testAcc: (test: Point2D[]) => number;
} {
  const n = train.length;
  const weights = new Array<number>(n).fill(1 / Math.max(1, n));
  const stumps: BoostStump[] = [];

  for (let r = 0; r < rounds; r++) {
    let bestErr = Infinity;
    let bestStump: BoostStump = { axis: 'y', threshold: 5, polarity: 1, alpha: 0.5 };

    for (const axis of ['x', 'y'] as const) {
      for (let t = 1.2; t <= 8.8; t += 0.45) {
        for (const polarity of [1, -1] as const) {
          let err = 0;
          for (let i = 0; i < n; i++) {
            const pred =
              polarity === 1
                ? train[i][axis] > t
                  ? 1
                  : 0
                : train[i][axis] <= t
                  ? 1
                  : 0;
            if (pred !== train[i].label) err += weights[i];
          }
          if (err < bestErr) {
            bestErr = err;
            bestStump = { axis, threshold: t, polarity, alpha: 0 };
          }
        }
      }
    }

    const clampedErr = Math.max(0.02, Math.min(0.49, bestErr));
    const alpha = 0.5 * Math.log((1 - clampedErr) / clampedErr);
    bestStump.alpha = alpha;
    stumps.push(bestStump);

    let sumW = 0;
    for (let i = 0; i < n; i++) {
      const pred =
        bestStump.polarity === 1
          ? train[i][bestStump.axis] > bestStump.threshold
            ? 1
            : 0
          : train[i][bestStump.axis] <= bestStump.threshold
            ? 1
            : 0;
      const ySigned = train[i].label === 1 ? 1 : -1;
      const pSigned = pred === 1 ? 1 : -1;
      weights[i] *= Math.exp(-alpha * ySigned * pSigned);
      sumW += weights[i];
    }
    for (let i = 0; i < n; i++) {
      weights[i] /= sumW || 1;
    }
  }

  const predictScore = (x: number, y: number) => {
    let score = 0;
    for (const s of stumps) {
      const val = s.axis === 'x' ? x : y;
      const pSigned =
        s.polarity === 1
          ? val > s.threshold
            ? 1
            : -1
          : val <= s.threshold
            ? 1
            : -1;
      score += s.alpha * pSigned;
    }
    return score;
  };

  const evalSet = (pts: Point2D[]) => {
    if (pts.length === 0) return 0;
    let ok = 0;
    for (const p of pts) {
      const pred = predictScore(p.x, p.y) >= 0 ? 1 : 0;
      if (pred === p.label) ok++;
    }
    return ok / pts.length;
  };

  return {
    stumps,
    sampleWeights: weights,
    predictScore,
    trainAcc: evalSet(train),
    testAcc: evalSet,
  };
}

// ============================================================
// Chapter 12: Dimensionality Reduction & Exact 2D PCA
// ============================================================

export function generateCorrelatedPCA(spread: number): Point2D[] {
  const rand = seededRand(312);
  const pts: Point2D[] = [];
  const angle = (34 * Math.PI) / 180;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  for (let i = 0; i < 34; i++) {
    // Box-Muller approximate centered Gaussian
    const u1 = Math.max(1e-4, rand());
    const u2 = rand();
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    const major = z1 * 1.95;
    const minor = z2 * spread;
    const x = Math.max(-4.2, Math.min(4.2, major * cosA - minor * sinA));
    const y = Math.max(-4.2, Math.min(4.2, major * sinA + minor * cosA));
    pts.push({ id: `pca-${i}`, x, y });
  }

  return pts;
}

export interface PCAResult2D {
  meanX: number;
  meanY: number;
  pc1AngleDeg: number;
  pc1Var: number;
  pc2Var: number;
  totalVar: number;
  explainedRatio1: number;
}

export function computePCA2D(points: Point2D[]): PCAResult2D {
  const n = points.length || 1;
  const meanX = points.reduce((s, p) => s + p.x, 0) / n;
  const meanY = points.reduce((s, p) => s + p.y, 0) / n;

  let cxx = 0;
  let cyy = 0;
  let cxy = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    cxx += dx * dx;
    cyy += dy * dy;
    cxy += dx * dy;
  }
  cxx /= n;
  cyy /= n;
  cxy /= n;

  const trace = cxx + cyy;
  const det = cxx * cyy - cxy * cxy;
  const disc = Math.sqrt(Math.max(0, (trace * trace) / 4 - det));
  const lambda1 = trace / 2 + disc;
  const lambda2 = Math.max(0, trace / 2 - disc);

  // Eigenvector for lambda1
  let vx = 1;
  let vy = 0;
  if (Math.abs(cxy) > 1e-8) {
    vx = lambda1 - cyy;
    vy = cxy;
  } else if (cyy > cxx) {
    vx = 0;
    vy = 1;
  }
  let deg = (Math.atan2(vy, vx) * 180) / Math.PI;
  if (deg < 0) deg += 180;

  const totalVar = lambda1 + lambda2 || 1e-6;
  return {
    meanX,
    meanY,
    pc1AngleDeg: deg,
    pc1Var: lambda1,
    pc2Var: lambda2,
    totalVar,
    explainedRatio1: lambda1 / totalVar,
  };
}

export function evaluateProjectionAxis(
  points: Point2D[],
  angleDeg: number,
  meanX: number,
  meanY: number
): {
  projectedVariance: number;
  reconstructionError: number;
  retainedPct: number;
  projections: { x: number; y: number; px: number; py: number; err: number }[];
} {
  const rad = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(rad);
  const uy = Math.sin(rad);

  let varSum = 0;
  let errSum = 0;
  const projections = points.map((p) => {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    const projLen = dx * ux + dy * uy;
    const px = meanX + projLen * ux;
    const py = meanY + projLen * uy;
    const errSq = (p.x - px) ** 2 + (p.y - py) ** 2;
    varSum += projLen * projLen;
    errSum += errSq;
    return { x: p.x, y: p.y, px, py, err: Math.sqrt(errSq) };
  });

  const n = points.length || 1;
  const projectedVariance = varSum / n;
  const reconstructionError = errSum / n;
  const total = projectedVariance + reconstructionError || 1e-6;
  return {
    projectedVariance,
    reconstructionError,
    retainedPct: (projectedVariance / total) * 100,
    projections,
  };
}

// ============================================================
// Chapter 13: Perceptrons & Multi-Layer Neural Networks (XOR)
// ============================================================

export type ActivationKind = 'relu' | 'sigmoid' | 'tanh' | 'linear';

export function applyActivation(z: number, kind: ActivationKind): number {
  if (kind === 'relu') return Math.max(0, z);
  if (kind === 'tanh') return Math.tanh(z);
  if (kind === 'linear') return z;
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

export function activationDerivative(z: number, kind: ActivationKind): number {
  if (kind === 'relu') return z > 0 ? 1 : 0;
  if (kind === 'tanh') {
    const t = Math.tanh(z);
    return 1 - t * t;
  }
  if (kind === 'linear') return 1;
  const s = 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  return s * (1 - s);
}

export const XOR_POINTS: { x1: number; x2: number; y: number; label: string }[] = [
  { x1: 0, x2: 0, y: 0, label: '(0, 0) → 0' },
  { x1: 0, x2: 1, y: 1, label: '(0, 1) → 1' },
  { x1: 1, x2: 0, y: 1, label: '(1, 0) → 1' },
  { x1: 1, x2: 1, y: 0, label: '(1, 1) → 0' },
];

export function evaluateXORNetwork(
  x1: number,
  x2: number,
  useHiddenLayer: boolean,
  activation: ActivationKind,
  hiddenStrength: number
): { h1: number; h2: number; prob: number } {
  if (!useHiddenLayer) {
    // Best possible single linear perceptron gets at most 75% on XOR
    const z = 2.0 * x1 + 2.0 * x2 - 1.0;
    const prob = 1 / (1 + Math.exp(-z));
    return { h1: x1, h2: x2, prob };
  }

  // Exact interpretable 2-2-1 XOR solution parameterized by activation & hiddenStrength
  const s = hiddenStrength; // 0..1 morphs from unlearned to solved
  if (activation === 'linear') {
    // Stacking linear layers collapses to a single linear plane — still cannot solve XOR!
    const h1 = x1 + x2 - 0.5;
    const h2 = x1 + x2 - 1.5;
    const zOut = 1.5 * h1 - 1.2 * h2;
    return { h1, h2, prob: 1 / (1 + Math.exp(-zOut)) };
  }

  if (activation === 'relu') {
    const h1 = applyActivation(x1 + x2 - 0.5, 'relu'); // OR-like
    const h2 = applyActivation(x1 + x2 - 1.5, 'relu'); // AND-like
    const zOut = (6.0 * h1 - 12.0 * h2 - 1.2) * s + (1 - s) * (x1 + x2 - 0.8);
    return { h1, h2, prob: 1 / (1 + Math.exp(-zOut)) };
  }

  if (activation === 'tanh') {
    const h1 = applyActivation(3.2 * (x1 + x2 - 0.5), 'tanh');
    const h2 = applyActivation(3.2 * (x1 + x2 - 1.5), 'tanh');
    const zOut = (3.6 * h1 - 3.6 * h2 - 2.6) * s + (1 - s) * (x1 + x2 - 0.8);
    return { h1, h2, prob: 1 / (1 + Math.exp(-zOut)) };
  }

  // Sigmoid hidden layer
  const h1 = applyActivation(6.5 * (x1 + x2 - 0.5), 'sigmoid');
  const h2 = applyActivation(6.5 * (x1 + x2 - 1.5), 'sigmoid');
  const zOut = (6.8 * h1 - 7.4 * h2 - 3.1) * s + (1 - s) * (x1 + x2 - 0.8);
  return { h1, h2, prob: 1 / (1 + Math.exp(-zOut)) };
}

// ============================================================
// Chapter 14: Backpropagation & Chain-Rule Computational Graph
// ============================================================

export interface BackpropState {
  w1: number;
  b1: number;
  w2: number;
  b2: number;
  epoch: number;
}

export interface BackpropSnapshot {
  x: number;
  target: number;
  z1: number;
  h: number;
  yHat: number;
  loss: number;
  dL_dyHat: number;
  dL_dw2: number;
  dL_db2: number;
  dL_dh: number;
  dh_dz1: number;
  dL_dw1: number;
  dL_db1: number;
}

export function evaluateBackpropGraph(
  state: BackpropState,
  x: number,
  target: number,
  activation: 'relu' | 'sigmoid'
): BackpropSnapshot {
  const z1 = state.w1 * x + state.b1;
  const h = applyActivation(z1, activation);
  const yHat = state.w2 * h + state.b2;
  const err = yHat - target;
  const loss = 0.5 * err * err;

  // Chain rule backward pass
  const dL_dyHat = err;
  const dL_dw2 = dL_dyHat * h;
  const dL_db2 = dL_dyHat;
  const dL_dh = dL_dyHat * state.w2;
  const dh_dz1 = activationDerivative(z1, activation);
  const dL_dw1 = dL_dh * dh_dz1 * x;
  const dL_db1 = dL_dh * dh_dz1;

  return {
    x,
    target,
    z1,
    h,
    yHat,
    loss,
    dL_dyHat,
    dL_dw2,
    dL_db2,
    dL_dh,
    dh_dz1,
    dL_dw1,
    dL_db1,
  };
}

export function stepBackpropGraph(
  state: BackpropState,
  x: number,
  target: number,
  lr: number,
  activation: 'relu' | 'sigmoid'
): BackpropState {
  const snap = evaluateBackpropGraph(state, x, target, activation);
  return {
    w1: state.w1 - lr * snap.dL_dw1,
    b1: state.b1 - lr * snap.dL_db1,
    w2: state.w2 - lr * snap.dL_dw2,
    b2: state.b2 - lr * snap.dL_db2,
    epoch: state.epoch + 1,
  };
}
