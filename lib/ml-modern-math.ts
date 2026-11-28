// Deterministic client-side engines for:
// - Chapter 02: 4x4 RL Gridworld Q-Learning
// - Chapter 16: 2D Convolution + ReLU + Max Pooling (CNNs)
// - Chapter 17: Scaled Dot-Product Self-Attention (Transformers)

/* ============================================================================
 * CHAPTER 02: 4x4 RL GRIDWORLD Q-LEARNING ENGINE
 * ========================================================================== */

export type RLAction = 0 | 1 | 2 | 3; // 0=Up, 1=Right, 2=Down, 3=Left

export interface GridworldConfig {
  id: string;
  name: string;
  start: number;
  goal: number;
  hazards: number[];
  walls: number[];
  stepPenalty: number;
}

export const GRIDWORLD_PRESETS: GridworldConfig[] = [
  {
    id: 'classic',
    name: 'Classic Maze',
    start: 0,
    goal: 15,
    hazards: [9, 13],
    walls: [5, 6],
    stepPenalty: -0.2,
  },
  {
    id: 'cliff',
    name: 'Cliff Shortcut',
    start: 12,
    goal: 15,
    hazards: [13, 14],
    walls: [5],
    stepPenalty: -0.2,
  },
  {
    id: 'corridor',
    name: 'Safe Detour',
    start: 0,
    goal: 15,
    hazards: [6, 10],
    walls: [2, 9],
    stepPenalty: -0.15,
  },
];

export interface RLState {
  agentCell: number;
  qTable: number[][]; // 16 x 4
  episodes: number;
  stepsInEpisode: number;
  lastReward: number;
  lastAction: RLAction | null;
  lastDeltaQ: number;
  totalWins: number;
  totalHazardHits: number;
  pathHistory: number[];
}

export function createInitialRLState(config: GridworldConfig): RLState {
  return {
    agentCell: config.start,
    qTable: Array.from({ length: 16 }, () => [0, 0, 0, 0]),
    episodes: 0,
    stepsInEpisode: 0,
    lastReward: 0,
    lastAction: null,
    lastDeltaQ: 0,
    totalWins: 0,
    totalHazardHits: 0,
    pathHistory: [config.start],
  };
}

// Deterministic pseudo-random helper so training feels lively yet reproducible
function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function stepGridworld(
  state: RLState,
  config: GridworldConfig,
  alpha: number,
  gamma: number,
  epsilon: number,
  seedTick: number
): RLState {
  const s = state.agentCell;
  const qTable = state.qTable.map((row) => [...row]);

  // Choose action via epsilon-greedy
  let action: RLAction;
  const rExplore = seededRand(seedTick * 17 + s * 31 + state.episodes * 13);
  if (rExplore < epsilon) {
    action = Math.floor(
      seededRand(seedTick * 29 + s * 7 + state.stepsInEpisode * 11) * 4
    ) as RLAction;
  } else {
    const qRow = qTable[s];
    let bestA: RLAction = 0;
    let bestVal = qRow[0];
    for (let a = 1; a < 4; a++) {
      if (qRow[a] > bestVal + 1e-9) {
        bestVal = qRow[a];
        bestA = a as RLAction;
      }
    }
    // Break exact ties smoothly
    const allZero = qRow.every((v) => Math.abs(v) < 1e-9);
    if (allZero) {
      action = Math.floor(
        seededRand(seedTick * 19 + s * 5 + state.stepsInEpisode) * 4
      ) as RLAction;
    } else {
      action = bestA;
    }
  }

  const row = Math.floor(s / 4);
  const col = s % 4;
  const deltas: [number, number][] = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];
  const [dr, dc] = deltas[action];
  const nr = Math.max(0, Math.min(3, row + dr));
  const nc = Math.max(0, Math.min(3, col + dc));
  const candidate = nr * 4 + nc;
  const nextCell = config.walls.includes(candidate) ? s : candidate;

  let reward = config.stepPenalty;
  let terminal = false;
  let totalWins = state.totalWins;
  let totalHazardHits = state.totalHazardHits;

  if (nextCell === config.goal) {
    reward = 10.0;
    terminal = true;
    totalWins += 1;
  } else if (config.hazards.includes(nextCell)) {
    reward = -10.0;
    terminal = true;
    totalHazardHits += 1;
  }

  const maxNextQ = terminal ? 0 : Math.max(...qTable[nextCell]);
  const oldQ = qTable[s][action];
  const target = reward + gamma * maxNextQ;
  const newQ = oldQ + alpha * (target - oldQ);
  qTable[s][action] = newQ;

  const timedOut = !terminal && state.stepsInEpisode >= 28;
  const episodeDone = terminal || timedOut;

  return {
    agentCell: episodeDone ? config.start : nextCell,
    qTable,
    episodes: episodeDone ? state.episodes + 1 : state.episodes,
    stepsInEpisode: episodeDone ? 0 : state.stepsInEpisode + 1,
    lastReward: reward,
    lastAction: action,
    lastDeltaQ: newQ - oldQ,
    totalWins,
    totalHazardHits,
    pathHistory: episodeDone
      ? [config.start]
      : [...state.pathHistory.slice(-14), nextCell],
  };
}

export function trainGridworldEpisodes(
  state: RLState,
  config: GridworldConfig,
  numEpisodes: number,
  alpha: number,
  gamma: number,
  epsilon: number
): RLState {
  let curr = state;
  const targetEp = state.episodes + numEpisodes;
  let guard = 0;
  while (curr.episodes < targetEp && guard < numEpisodes * 35) {
    curr = stepGridworld(curr, config, alpha, gamma, epsilon, guard + curr.episodes * 97);
    guard++;
  }
  return curr;
}

export function getBestActionForCell(qRow: number[]): RLAction | null {
  const maxV = Math.max(...qRow);
  const minV = Math.min(...qRow);
  if (Math.abs(maxV - minV) < 1e-4) return null;
  return qRow.indexOf(maxV) as RLAction;
}

/* ============================================================================
 * CHAPTER 16: 2D CONVOLUTION + RELU + MAX POOLING (CNNs)
 * ========================================================================== */

export type CNNImagePresetId = 'vertical_bar' | 'cross' | 'digit_7';
export type CNNKernelPresetId =
  | 'vertical_edge'
  | 'horizontal_edge'
  | 'sharpen'
  | 'blur';

export const CNN_IMAGE_PRESETS: Record<
  CNNImagePresetId,
  { label: string; grid: number[][] }
> = {
  vertical_bar: {
    label: 'Vertical Stripe',
    grid: [
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
    ],
  },
  cross: {
    label: 'Plus Cross',
    grid: [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ],
  },
  digit_7: {
    label: 'Digit "7"',
    grid: [
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0],
    ],
  },
};

export const CNN_KERNEL_PRESETS: Record<
  CNNKernelPresetId,
  { label: string; description: string; kernel: number[][] }
> = {
  vertical_edge: {
    label: 'Vertical Edge',
    description: 'Fires strongly where dark left pixels meet bright right pixels.',
    kernel: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
  },
  horizontal_edge: {
    label: 'Horizontal Edge',
    description: 'Fires strongly where top pixels transition to bottom pixels.',
    kernel: [
      [-1, -1, -1],
      [0, 0, 0],
      [1, 1, 1],
    ],
  },
  sharpen: {
    label: 'Sharpen',
    description: 'Amplifies the center pixel while subtracting its immediate neighbors.',
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ],
  },
  blur: {
    label: 'Box Blur',
    description: 'Averages all 9 pixels in the receptive field to smooth sharp edges.',
    kernel: [
      [0.11, 0.11, 0.11],
      [0.11, 0.11, 0.11],
      [0.11, 0.11, 0.11],
    ],
  },
};

export interface ConvResult {
  rawMap: number[][]; // 5x5
  activatedMap: number[][]; // 5x5
  pooledMap: number[][]; // 2x2 (from top-left 4x4 region of 5x5)
  activeTerms: { pixel: number; weight: number; product: number }[];
  activeSum: number;
  activeOutput: number;
}

export function computeConvolution2D(
  image: number[][],
  kernel: number[][],
  applyRelu: boolean,
  focusRow: number,
  focusCol: number
): ConvResult {
  const rawMap: number[][] = [];
  const activatedMap: number[][] = [];

  for (let r = 0; r < 5; r++) {
    const rawRow: number[] = [];
    const actRow: number[] = [];
    for (let c = 0; c < 5; c++) {
      let sum = 0;
      for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 3; kc++) {
          sum += image[r + kr][c + kc] * kernel[kr][kc];
        }
      }
      rawRow.push(sum);
      actRow.push(applyRelu ? Math.max(0, sum) : sum);
    }
    rawMap.push(rawRow);
    activatedMap.push(actRow);
  }

  // 2x2 stride-2 Max Pooling over top-left 4x4 of the 5x5 feature map
  const pooledMap: number[][] = [
    [
      Math.max(
        activatedMap[0][0],
        activatedMap[0][1],
        activatedMap[1][0],
        activatedMap[1][1]
      ),
      Math.max(
        activatedMap[0][2],
        activatedMap[0][3],
        activatedMap[1][2],
        activatedMap[1][3]
      ),
    ],
    [
      Math.max(
        activatedMap[2][0],
        activatedMap[2][1],
        activatedMap[3][0],
        activatedMap[3][1]
      ),
      Math.max(
        activatedMap[2][2],
        activatedMap[2][3],
        activatedMap[3][2],
        activatedMap[3][3]
      ),
    ],
  ];

  const activeTerms: { pixel: number; weight: number; product: number }[] = [];
  let activeSum = 0;
  for (let kr = 0; kr < 3; kr++) {
    for (let kc = 0; kc < 3; kc++) {
      const pixel = image[focusRow + kr][focusCol + kc];
      const weight = kernel[kr][kc];
      const product = pixel * weight;
      activeSum += product;
      activeTerms.push({ pixel, weight, product });
    }
  }

  return {
    rawMap,
    activatedMap,
    pooledMap,
    activeTerms,
    activeSum,
    activeOutput: applyRelu ? Math.max(0, activeSum) : activeSum,
  };
}

/* ============================================================================
 * CHAPTER 17: TRANSFORMER SCALED DOT-PRODUCT SELF-ATTENTION
 * ========================================================================== */

export type AttentionHeadMode = 'semantic' | 'syntax';

export interface TransformerSentencePreset {
  id: string;
  label: string;
  defaultQueryIndex: number;
  tokens: string[];
  // Pre-projected 4D Q and K vectors per head so dot products produce real,
  // clean, interpretable softmax weights for every clickable word.
  heads: Record<
    AttentionHeadMode,
    {
      name: string;
      hint: string;
      Q: number[][];
      K: number[][];
    }
  >;
}

export const TRANSFORMER_PRESETS: TransformerSentencePreset[] = [
  {
    id: 'tired',
    label: 'Pronoun: "...too tired"',
    defaultQueryIndex: 6, // "it"
    tokens: ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'tired'],
    heads: {
      semantic: {
        name: 'Head 1 · Meaning & Reference',
        hint: 'Connects pronouns and adjectives back to the living entity ("animal").',
        Q: [
          [0.2, 0.1, 0.9, 0.0], // The
          [2.1, 0.2, 0.3, 1.4], // animal
          [0.4, 0.8, 0.2, 0.3], // didn't
          [1.2, 1.4, 0.1, 0.2], // cross
          [0.1, 0.4, 0.8, 0.0], // the
          [0.2, 2.0, 0.3, 0.1], // street
          [0.6, 0.4, 0.3, 0.9], // because
          [2.4, 0.3, 0.1, 1.9], // it -> strongly matches animal + tired
          [0.9, 0.2, 0.2, 1.2], // was
          [2.2, 0.1, 0.1, 1.8], // tired
        ],
        K: [
          [0.1, 0.1, 0.8, 0.1],
          [2.4, 0.2, 0.2, 1.6], // animal (high key!)
          [0.3, 0.7, 0.2, 0.3],
          [0.9, 1.2, 0.2, 0.3],
          [0.1, 0.3, 0.7, 0.1],
          [0.3, 2.1, 0.2, 0.1], // street
          [0.4, 0.3, 0.3, 0.6],
          [1.1, 0.2, 0.2, 1.1], // it
          [0.4, 0.2, 0.2, 0.8],
          [1.7, 0.1, 0.1, 2.0], // tired
        ],
      },
      syntax: {
        name: 'Head 2 · Local Grammar',
        hint: 'Focuses on nearby determiners, verbs, and adjacent clause structure.',
        Q: [
          [1.8, 0.2, 0.1, 0.0],
          [1.5, 1.2, 0.1, 0.0],
          [0.3, 2.0, 0.4, 0.0],
          [0.2, 1.8, 1.3, 0.0],
          [0.1, 0.2, 2.0, 0.1],
          [0.1, 0.5, 1.9, 0.3],
          [0.1, 0.2, 0.7, 1.9],
          [0.1, 0.2, 0.4, 2.1],
          [0.1, 0.2, 0.3, 2.2],
          [0.1, 0.1, 0.2, 2.0],
        ],
        K: [
          [1.9, 0.2, 0.1, 0.0],
          [1.8, 1.1, 0.1, 0.0],
          [0.3, 2.0, 0.5, 0.0],
          [0.2, 2.1, 1.2, 0.0],
          [0.1, 0.3, 2.0, 0.2],
          [0.1, 0.4, 2.1, 0.3],
          [0.1, 0.2, 0.8, 1.9],
          [0.1, 0.1, 0.3, 1.8],
          [0.1, 0.1, 0.2, 2.2],
          [0.1, 0.1, 0.2, 2.1],
        ],
      },
    },
  },
  {
    id: 'wide',
    label: 'Pronoun: "...too wide"',
    defaultQueryIndex: 7, // "it"
    tokens: ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'wide'],
    heads: {
      semantic: {
        name: 'Head 1 · Meaning & Reference',
        hint: 'Swapping "tired" to "wide" shifts the attention arc of "it" from "animal" to "street"!',
        Q: [
          [0.2, 0.1, 0.9, 0.0],
          [2.0, 0.2, 0.3, 0.4],
          [0.4, 0.8, 0.2, 0.3],
          [0.9, 1.5, 0.1, 0.5],
          [0.1, 0.4, 0.8, 0.0],
          [0.2, 2.3, 0.2, 1.5],
          [0.4, 0.7, 0.3, 0.9],
          [0.2, 2.5, 0.1, 2.0], // it -> strongly matches street + wide
          [0.2, 1.0, 0.2, 1.3],
          [0.1, 2.3, 0.1, 2.0], // wide
        ],
        K: [
          [0.1, 0.1, 0.8, 0.1],
          [2.1, 0.2, 0.2, 0.3], // animal
          [0.3, 0.7, 0.2, 0.3],
          [0.8, 1.1, 0.2, 0.4],
          [0.1, 0.3, 0.7, 0.1],
          [0.2, 2.5, 0.2, 1.7], // street (high key!)
          [0.4, 0.4, 0.3, 0.6],
          [0.2, 1.1, 0.2, 1.0],
          [0.2, 0.4, 0.2, 0.8],
          [0.1, 1.9, 0.1, 2.0], // wide
        ],
      },
      syntax: {
        name: 'Head 2 · Local Grammar',
        hint: 'Tracks adjacent grammar regardless of semantic shift.',
        Q: [
          [1.8, 0.2, 0.1, 0.0],
          [1.5, 1.2, 0.1, 0.0],
          [0.3, 2.0, 0.4, 0.0],
          [0.2, 1.8, 1.3, 0.0],
          [0.1, 0.2, 2.0, 0.1],
          [0.1, 0.5, 1.9, 0.3],
          [0.1, 0.2, 0.7, 1.9],
          [0.1, 0.2, 0.4, 2.1],
          [0.1, 0.2, 0.3, 2.2],
          [0.1, 0.1, 0.2, 2.0],
        ],
        K: [
          [1.9, 0.2, 0.1, 0.0],
          [1.8, 1.1, 0.1, 0.0],
          [0.3, 2.0, 0.5, 0.0],
          [0.2, 2.1, 1.2, 0.0],
          [0.1, 0.3, 2.0, 0.2],
          [0.1, 0.4, 2.1, 0.3],
          [0.1, 0.2, 0.8, 1.9],
          [0.1, 0.1, 0.3, 1.8],
          [0.1, 0.1, 0.2, 2.2],
          [0.1, 0.1, 0.2, 2.1],
        ],
      },
    },
  },
  {
    id: 'bank',
    label: 'Word Sense: "river bank"',
    defaultQueryIndex: 5, // "bank"
    tokens: ['She', 'sat', 'on', 'the', 'mossy', 'bank', 'beside', 'the', 'flowing', 'river'],
    heads: {
      semantic: {
        name: 'Head 1 · Word Disambiguation',
        hint: 'Resolves ambiguous "bank" using water/nature context ("mossy", "flowing", "river").',
        Q: [
          [1.5, 0.1, 0.1, 0.1],
          [1.2, 0.5, 0.2, 0.1],
          [0.3, 0.5, 0.5, 0.2],
          [0.1, 0.3, 0.6, 0.2],
          [0.1, 1.8, 1.4, 1.0],
          [0.1, 2.3, 1.6, 2.2], // bank
          [0.1, 0.8, 0.8, 0.9],
          [0.1, 0.3, 0.6, 0.4],
          [0.1, 1.7, 1.1, 2.1],
          [0.1, 2.1, 1.2, 2.4], // river
        ],
        K: [
          [1.4, 0.1, 0.1, 0.1],
          [1.1, 0.4, 0.2, 0.1],
          [0.2, 0.3, 0.4, 0.2],
          [0.1, 0.2, 0.5, 0.2],
          [0.1, 1.9, 1.3, 1.2], // mossy
          [0.1, 1.3, 0.9, 1.1], // bank
          [0.1, 0.6, 0.7, 0.7],
          [0.1, 0.2, 0.4, 0.3],
          [0.1, 1.8, 1.0, 1.8], // flowing
          [0.1, 2.2, 1.2, 2.5], // river
        ],
      },
      syntax: {
        name: 'Head 2 · Phrase Grouping',
        hint: 'Links prepositions and nouns inside local phrases.',
        Q: [
          [2.0, 0.2, 0.1, 0.0],
          [1.9, 0.9, 0.1, 0.0],
          [0.4, 1.9, 0.4, 0.0],
          [0.2, 1.8, 1.1, 0.0],
          [0.1, 1.2, 2.0, 0.2],
          [0.1, 1.0, 2.1, 0.5],
          [0.1, 0.2, 1.2, 1.7],
          [0.1, 0.1, 0.6, 2.0],
          [0.1, 0.1, 0.4, 2.1],
          [0.1, 0.1, 0.3, 2.2],
        ],
        K: [
          [2.0, 0.2, 0.1, 0.0],
          [2.0, 0.8, 0.1, 0.0],
          [0.4, 1.8, 0.5, 0.0],
          [0.2, 1.9, 1.0, 0.0],
          [0.1, 1.2, 2.0, 0.2],
          [0.1, 1.1, 2.1, 0.5],
          [0.1, 0.2, 1.3, 1.8],
          [0.1, 0.1, 0.6, 2.0],
          [0.1, 0.1, 0.4, 2.1],
          [0.1, 0.1, 0.3, 2.2],
        ],
      },
    },
  },
];

// Fix index for tired preset ("it" is index 7)
TRANSFORMER_PRESETS[0].defaultQueryIndex = 7;

export interface AttentionRowResult {
  rawScores: number[];
  scaledScores: number[];
  weights: number[];
  topTargetIndex: number;
}

export function computeSelfAttentionForQuery(
  preset: TransformerSentencePreset,
  headMode: AttentionHeadMode,
  queryIndex: number,
  temperature: number = 1.0
): AttentionRowResult {
  const head = preset.heads[headMode];
  const qVec = head.Q[queryIndex] ?? head.Q[0];
  const dk = qVec.length;
  const scale = Math.sqrt(dk) * Math.max(0.25, temperature);

  const rawScores = head.K.map((kVec) =>
    qVec.reduce((acc, qVal, i) => acc + qVal * kVec[i], 0)
  );
  const scaledScores = rawScores.map((s) => s / scale);

  const maxS = Math.max(...scaledScores);
  const exps = scaledScores.map((s) => Math.exp(s - maxS));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const weights = exps.map((e) => e / sumExp);

  // Best non-self target for clean highlighting
  let topTargetIndex = 0;
  let bestW = -1;
  weights.forEach((w, idx) => {
    if (idx !== queryIndex && w > bestW) {
      bestW = w;
      topTargetIndex = idx;
    }
  });

  return { rawScores, scaledScores, weights, topTargetIndex };
}
