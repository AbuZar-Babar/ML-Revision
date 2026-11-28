import type { StagePrimer } from '@/data/primers';

export const EXTRA_STAGE_PRIMERS: Record<number, StagePrimer> = {
  2: {
    stageId: 2,
    intuition:
      'Machine Learning divides into three core paradigms based on feedback: Supervised Learning learns from labeled answers (x → y), Unsupervised Learning discovers structure in unlabeled data (x), and Reinforcement Learning trains an agent through trial, action, and delayed reward.',
    analogyTitle: 'Everyday Analogy: Answer Key vs. Sorting Box vs. Video Game',
    analogyText:
      'Supervised is studying with flashcards that have answers on the back. Unsupervised is sorting unlabeled coins by size and color on a table. Reinforcement Learning is playing a new video game where you learn which moves earn points (+10) and which lose lives (−10) through trial and error.',
    formulas: [
      {
        label: 'Bellman Q-Learning Update (Reinforcement Learning)',
        parts: [
          { text: 'Q(s,a)', symbolKey: 'q' },
          { text: ' ← Q(s,a) + ' },
          { text: 'α', symbolKey: 'alpha' },
          { text: ' · [' },
          { text: 'r', symbolKey: 'r' },
          { text: ' + ' },
          { text: 'γ', symbolKey: 'gamma' },
          { text: '·max Q(s′,a′) − Q(s,a)]' },
        ],
        caption: 'Updates action quality using immediate reward r plus discounted future best value.',
      },
    ],
    glossary: [
      {
        key: 'q',
        symbol: 'Q(s, a)',
        name: 'State-Action Value',
        meaning: 'Expected total future reward for taking action a while standing in state s.',
        example: 'Q(cell 14, Right) = +9.8 near the Goal',
      },
      {
        key: 'r',
        symbol: 'r',
        name: 'Immediate Reward',
        meaning: 'Numeric feedback signal from the environment after an action (+10 goal, −10 hazard).',
        example: 'r = −0.2 step cost encourages shorter paths',
      },
      {
        key: 'gamma',
        symbol: 'γ',
        name: 'Discount Factor',
        meaning: 'Weighs future rewards (0 = short-sighted, 0.9 = plans ahead toward the goal).',
        example: 'γ = 0.90 values reaching the goal in 3 steps',
      },
      {
        key: 'alpha',
        symbol: 'α, ε',
        name: 'Learning Rate & Exploration',
        meaning: 'α controls update speed; ε is the probability of trying a random exploratory move.',
        example: 'ε = 0.20 explores 20% of steps, exploits 80%',
      },
    ],
    workedExample: {
      scenario: 'Built directly into the Visual Lab preset switcher.',
      steps: [],
      conclusion: 'Test all 3 paradigms and live Q-Learning presets in the Visual Lab.',
    },
  },
  16: {
    stageId: 16,
    intuition:
      'Instead of connecting every pixel to every neuron, a Convolutional Neural Network slides a small shared 3×3 filter (kernel) across an image to detect local patterns like edges, applies ReLU to keep positive matches, and shrinks the map with Max Pooling.',
    analogyTitle: 'Everyday Analogy: Sliding a Magnifying Stencil',
    analogyText:
      'Imagine sliding a small vertical-stripe stencil across a photo. Wherever the pixels match the stencil, the dot-product lights up brightly; wherever they do not, the score drops to zero. Because the same 9-weight stencil scans every patch, a CNN recognizes shapes anywhere in the frame.',
    formulas: [
      {
        label: '2D Discrete Convolution + ReLU',
        parts: [
          { text: 'F(i, j)', symbolKey: 'feat' },
          { text: ' = ReLU( ΣΣ ' },
          { text: 'I(i+m, j+n)', symbolKey: 'img' },
          { text: ' · ' },
          { text: 'K(m, n)', symbolKey: 'kernel' },
          { text: ' )' },
        ],
        caption: 'Multiply overlapping 3×3 image pixels by kernel weights and sum all 9 products.',
      },
    ],
    glossary: [
      {
        key: 'img',
        symbol: 'I(i, j)',
        name: 'Input Pixel Patch',
        meaning: 'The local 3×3 neighborhood of pixel intensities currently under the filter window.',
        example: '0 = dark background, 1 = bright stroke',
      },
      {
        key: 'kernel',
        symbol: 'K(m, n)',
        name: 'Convolution Kernel (Filter)',
        meaning: 'Shared 3×3 matrix of learned weights specialized for edges, corners, or textures.',
        example: '[[-1,0,1], [-1,0,1], [-1,0,1]] detects vertical edges',
      },
      {
        key: 'feat',
        symbol: 'F(i, j)',
        name: 'Feature Map & Max Pool',
        meaning: 'Grid of filter responses showing where the pattern matched; Max Pooling keeps the strongest local response.',
        example: '5×5 Feature Map downsamples to 2×2 Pooled Map',
      },
    ],
    workedExample: {
      scenario: 'Built directly into the CNN Visual Lab.',
      steps: [],
      conclusion: 'Slide the 3×3 kernel across preset images in the Visual Lab.',
    },
  },
  17: {
    stageId: 17,
    intuition:
      'Transformers process all words in parallel using Self-Attention. Each word sends out a Query vector to match against every other word’s Key vector; high dot-product similarity pulls in that word’s Value vector so ambiguous words like "it" or "bank" resolve cleanly from context.',
    analogyTitle: 'Everyday Analogy: Highlighting References While Reading',
    analogyText:
      'When you read "The animal didn’t cross the street because it was too wide", your eye instantly glances back at "street" to decode "it". Change "wide" to "tired" and your gaze jumps to "animal". Self-Attention computes those weighted glances mathematically for every word at once.',
    formulas: [
      {
        label: 'Scaled Dot-Product Self-Attention',
        parts: [
          { text: 'Attention(Q, K, V) = ' },
          { text: 'softmax', symbolKey: 'softmax' },
          { text: '( ' },
          { text: 'Q·Kᵀ', symbolKey: 'qk' },
          { text: ' / ' },
          { text: '√d_k', symbolKey: 'dk' },
          { text: ' ) · ' },
          { text: 'V', symbolKey: 'v' },
        ],
        caption: 'Dot products measure pairwise relevance; softmax converts them into weights summing to 1.',
      },
    ],
    glossary: [
      {
        key: 'qk',
        symbol: 'Q, K',
        name: 'Query & Key Vectors',
        meaning: 'Query asks "what context am I looking for?"; Key advertises "what information do I hold?".',
        example: 'High Q("it") · K("animal") links pronoun to subject',
      },
      {
        key: 'dk',
        symbol: '√d_k',
        name: 'Scaling Factor',
        meaning: 'Divides dot products by the square root of vector dimension so softmax does not saturate.',
        example: 'For d_k = 4, divide raw dot products by 2.0',
      },
      {
        key: 'softmax',
        symbol: 'softmax',
        name: 'Attention Weights',
        meaning: 'Normalizes scores into positive attention percentages summing to 100% across the sentence.',
        example: '48% animal · 22% tired · 6% street',
      },
      {
        key: 'v',
        symbol: 'V',
        name: 'Value Vectors',
        meaning: 'The content representations blended together according to the attention weights.',
        example: 'Weighted average creates context-aware token meaning',
      },
    ],
    workedExample: {
      scenario: 'Built directly into the Transformer Visual Lab.',
      steps: [],
      conclusion: 'Click words and toggle "tired" vs. "wide" in the Visual Lab.',
    },
  },
};
