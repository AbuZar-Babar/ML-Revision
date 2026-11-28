import { NEW_STAGE_PRIMERS } from '@/data/primersNew';
import { EXTRA_STAGE_PRIMERS } from '@/data/primersExtra';

export interface FormulaPart {
  text: string;
  symbolKey?: string;
}

export interface FormulaCardSpec {
  label: string;
  parts: FormulaPart[];
  caption?: string;
}

export interface SymbolGlossaryItem {
  key: string;
  symbol: string;
  name: string;
  meaning: string;
  example: string;
}

export interface WorkedStep {
  label: string;
  math: string;
  note: string;
}

export interface StagePrimer {
  stageId: number;
  intuition: string;
  analogyTitle: string;
  analogyText: string;
  formulas: FormulaCardSpec[];
  glossary: SymbolGlossaryItem[];
  workedExample: {
    scenario: string;
    steps: WorkedStep[];
    conclusion: string;
  };
}

export interface NotationBasicItem {
  symbol: string;
  name: string;
  meaning: string;
  example: string;
}

export interface StageFormulaSummary {
  stageId: number;
  stageLabel: string;
  topic: string;
  formula: string;
  objective: string;
}

const BASE_STAGE_PRIMERS: Record<number, StagePrimer> = {
  1: {
    stageId: 1,
    intuition:
      'Traditional programming requires a human to hand-code explicit if/else rules to turn inputs into answers. Machine Learning flips that script: you supply labeled input-output examples, and the computer discovers the mathematical decision boundary itself.',
    analogyTitle: 'Everyday Analogy: Sorting Fruit by Recipe vs. Experience',
    analogyText:
      'Writing if/else code is like handing a warehouse worker a rigid rulebook ("If red, put in Apple bin"). The moment a Yellow Golden Apple arrives, the rule fails. Machine Learning acts like an experienced grocer who notices weight, shape, and color together and adjusts naturally when a new variety shows up.',
    formulas: [
      {
        label: 'Linear Decision Score (2 Features)',
        parts: [
          { text: 'z', symbolKey: 'z' },
          { text: ' = ' },
          { text: 'w₁', symbolKey: 'w' },
          { text: '·' },
          { text: 'x₁', symbolKey: 'x' },
          { text: ' + ' },
          { text: 'w₂', symbolKey: 'w' },
          { text: '·' },
          { text: 'x₂', symbolKey: 'x' },
          { text: ' + ' },
          { text: 'b', symbolKey: 'b' },
        ],
        caption: 'Predict Apple if z ≥ 0, otherwise Citrus.',
      },
    ],
    glossary: [
      {
        key: 'x',
        symbol: 'x₁, x₂',
        name: 'Input Features',
        meaning: 'Measurable properties of each example (e.g., fruit weight and redness).',
        example: 'x₁ = 210g, x₂ = 24% redness',
      },
      {
        key: 'w',
        symbol: 'w₁, w₂',
        name: 'Learned Weights',
        meaning: 'Importance multipliers the algorithm learns from data—not hardcoded by hand.',
        example: 'Weight gets high importance when redness is unreliable',
      },
      {
        key: 'b',
        symbol: 'b',
        name: 'Bias (Offset)',
        meaning: 'Shifts the decision boundary left or right so it does not have to pass through (0, 0).',
        example: 'b = −145 centers the cutoff around 145g',
      },
      {
        key: 'z',
        symbol: 'z',
        name: 'Decision Score',
        meaning: 'Combined weighted evidence. Positive means one side of the boundary; negative means the other.',
        example: 'z = +4.2 → Apple',
      },
    ],
    workedExample: {
      scenario:
        'A Yellow Golden Apple arrives with Weight x₁ = 210g and Redness x₂ = 24%. Compare a hardcoded rule against a learned boundary.',
      steps: [
        {
          label: 'Hardcoded Rule Check',
          math: 'if redness >= 55 → 24 >= 55 is False',
          note: 'Rigid rule immediately misclassifies the yellow apple as Citrus.',
        },
        {
          label: 'Learned ML Weights',
          math: 'w₁ = +0.05 (weight),  w₂ = +0.01 (redness),  b = −7.5',
          note: 'The ML model learned from past fruits that weight is a stronger cue.',
        },
        {
          label: 'Evaluate ML Score',
          math: 'z = (0.05)(210) + (0.01)(24) − 7.5 = 10.5 + 0.24 − 7.5 = +3.24',
          note: 'Because z ≥ 0, the model classifies it accurately as an Apple.',
        },
      ],
      conclusion:
        'Instead of manually patching dozens of if/else exceptions, learning weights from data handles overlapping real-world features smoothly.',
    },
  },

  2: {
    stageId: 2,
    intuition:
      'Every supervised machine learning algorithm trains by repeating one universal feedback loop: make a guess, measure how wrong the guess is (Loss), compute which direction reduces the error (Gradient), and nudge the parameters slightly downhill.',
    analogyTitle: 'Everyday Analogy: Dialing In Shower Temperature',
    analogyText:
      'Turning the slope and intercept knobs is like adjusting a shower handle blindfolded. You feel the water (Guess), notice it is 10 degrees too cold (Loss), know you need to turn clockwise toward hot (Gradient), and make a measured turn (Update) until the error hits zero.',
    formulas: [
      {
        label: '1. Prediction Model',
        parts: [
          { text: 'ŷ', symbolKey: 'yhat' },
          { text: ' = ' },
          { text: 'w', symbolKey: 'w' },
          { text: '·' },
          { text: 'x', symbolKey: 'x' },
          { text: ' + ' },
          { text: 'b', symbolKey: 'b' },
        ],
      },
      {
        label: '2. Mean Squared Error (Loss)',
        parts: [
          { text: 'MSE', symbolKey: 'mse' },
          { text: ' = (1 / ' },
          { text: 'N', symbolKey: 'n' },
          { text: ') · Σ (' },
          { text: 'ŷᵢ − yᵢ', symbolKey: 'res' },
          { text: ')²' },
        ],
        caption: 'Squaring keeps every error positive and penalizes big misses heavily.',
      },
    ],
    glossary: [
      {
        key: 'yhat',
        symbol: 'ŷ',
        name: 'Predicted Value ("y-hat")',
        meaning: 'The height of our straight line at input x.',
        example: 'If w = 1, b = 1 and x = 2, then ŷ = 3.0',
      },
      {
        key: 'w',
        symbol: 'w',
        name: 'Slope (Weight)',
        meaning: 'Controls how steeply the line rises or falls per unit of x.',
        example: 'w = 0.95 means y rises 0.95 for every +1 in x',
      },
      {
        key: 'b',
        symbol: 'b',
        name: 'Intercept (Bias)',
        meaning: 'The starting height of the line where x = 0.',
        example: 'b = 1.4 crosses the vertical axis at 1.4',
      },
      {
        key: 'res',
        symbol: 'ŷᵢ − yᵢ',
        name: 'Residual (Error Bar)',
        meaning: 'Vertical distance between the model prediction and the true data dot.',
        example: 'Pred 5.0 − Actual 3.0 = +2.0 residual',
      },
      {
        key: 'n',
        symbol: 'N',
        name: 'Sample Count',
        meaning: 'Number of training points averaged together.',
        example: 'N = 5 calibration points in Stage 02',
      },
      {
        key: 'mse',
        symbol: 'MSE',
        name: 'Mean Squared Error',
        meaning: 'Single scoreboard number measuring overall badness of fit (0 = perfect).',
        example: 'MSE drops from 9.40 down to 0.08 after training',
      },
    ],
    workedExample: {
      scenario:
        'Suppose we have N = 2 points: (x=1, y=3) and (x=3, y=7). Test a rough guess line ŷ = 1·x + 1.',
      steps: [
        {
          label: 'Predict Both Points',
          math: 'ŷ₁ = 1(1) + 1 = 2   |   ŷ₂ = 1(3) + 1 = 4',
          note: 'Plug each x into our current line guess.',
        },
        {
          label: 'Measure Vertical Residuals',
          math: 'e₁ = 2 − 3 = −1   |   e₂ = 4 − 7 = −3',
          note: 'Our line sits 1 unit below point 1 and 3 units below point 2.',
        },
        {
          label: 'Square & Average for MSE',
          math: 'MSE = [(−1)² + (−3)²] / 2 = (1 + 9) / 2 = 5.0',
          note: 'Notice squaring makes both errors positive so they cannot cancel out.',
        },
      ],
      conclusion:
        'Because MSE = 5.0 is high, Gradient Descent nudges w upward toward 2.0 (where residuals shrink to 0 and MSE reaches 0.0).',
    },
  },

  3: {
    stageId: 3,
    intuition:
      'Beginners often think Regression, Classification, and Clustering require totally different datasets. In reality, the input feature table X can be identical—what changes is whether labels exist and what kind of output you ask the model to produce.',
    analogyTitle: 'Everyday Analogy: Three Questions About the Same Classroom',
    analogyText:
      'Imagine a table of students with Study Hours and Lab Scores. Asking "What exact exam mark will they get?" is Regression. Asking "Will they Pass or Fail?" is Classification. Hiding all grades and asking "Are there natural study habits groups here?" is Unsupervised Clustering.',
    formulas: [
      {
        label: 'Three Paradigms on the Same Input X',
        parts: [
          { text: 'Regression: ', symbolKey: 'reg' },
          { text: 'f(X) → ℝ   |   ' },
          { text: 'Classification: ', symbolKey: 'clf' },
          { text: 'f(X) → {0, 1}   |   ' },
          { text: 'K-Means: ', symbolKey: 'km' },
          { text: 'min Σ ‖xᵢ − μ_c‖²' },
        ],
      },
    ],
    glossary: [
      {
        key: 'reg',
        symbol: 'ℝ',
        name: 'Continuous Number (Regression)',
        meaning: 'Predicts an infinite-scale numeric value such as exam score, price, or temperature.',
        example: 'ŷ = 78.4 marks',
      },
      {
        key: 'clf',
        symbol: '{0, 1}',
        name: 'Discrete Class Label (Classification)',
        meaning: 'Assigns inputs to named categories separated by a decision boundary.',
        example: '0 = Fail, 1 = Pass',
      },
      {
        key: 'km',
        symbol: 'μ_c',
        name: 'Cluster Centroid (Unsupervised)',
        meaning: 'The geometric center (mean coordinates) of cluster c when no y labels exist.',
        example: 'K-Means repeatedly assigns points to nearest μ_c, then moves μ_c to their average',
      },
    ],
    workedExample: {
      scenario:
        'Two unlabeled points A(2, 20) and B(4, 40) are assigned to Centroid 1 currently sitting at (1, 50). Execute one K-Means centroid update.',
      steps: [
        {
          label: 'Check Assigned Cluster Members',
          math: 'Members of Cluster 1 = { (2, 20), (4, 40) }',
          note: 'No Pass/Fail labels are used—only distance to centroids.',
        },
        {
          label: 'Compute Mean X Coordinate',
          math: 'μ_x = (2 + 4) / 2 = 3.0',
          note: 'Average the horizontal study hours of all members.',
        },
        {
          label: 'Compute Mean Y Coordinate',
          math: 'μ_y = (20 + 40) / 2 = 30.0',
          note: 'Average the vertical lab scores of all members.',
        },
      ],
      conclusion:
        'Centroid 1 glides from (1, 50) straight to (3.0, 30.0)—the exact center of gravity of its cluster.',
    },
  },

  4: {
    stageId: 4,
    intuition:
      'Linear Regression fits a straight trend line by minimizing MSE, which forms a smooth U-shaped bowl (convex parabola) over the parameter w. Gradient Descent walks step-by-step down that bowl using a learning rate α, while a separate Test Set checks whether our line generalizes to unseen data.',
    analogyTitle: 'Everyday Analogy: Walking Down a Valley in Thick Fog',
    analogyText:
      'You cannot see the bottom of the MSE valley, only the slope under your boots (∂MSE/∂w). Taking tiny steps (tiny α) takes forever; taking giant leaps (huge α) launches you past the valley floor onto an even higher opposite cliff—causing divergence!',
    formulas: [
      {
        label: 'Gradient Descent Parameter Update Rule',
        parts: [
          { text: 'w_new', symbolKey: 'wnew' },
          { text: ' = ' },
          { text: 'w_old', symbolKey: 'wold' },
          { text: ' − ' },
          { text: 'α', symbolKey: 'alpha' },
          { text: ' · ' },
          { text: '(∂MSE / ∂w)', symbolKey: 'grad' },
        ],
      },
      {
        label: 'Partial Derivative of MSE with Respect to w',
        parts: [
          { text: '∂MSE / ∂w', symbolKey: 'grad' },
          { text: ' = (2 / N) · Σ (w·xᵢ + b − yᵢ) · ' },
          { text: 'xᵢ', symbolKey: 'xi' },
        ],
      },
    ],
    glossary: [
      {
        key: 'wold',
        symbol: 'w_old',
        name: 'Current Slope',
        meaning: 'Your current position along the horizontal axis of the MSE parabola.',
        example: 'Start at w_old = 2.0',
      },
      {
        key: 'alpha',
        symbol: 'α',
        name: 'Learning Rate',
        meaning: 'Step-size multiplier. Too small = slow crawl; too large = overshooting and exploding loss.',
        example: 'α = 0.015 converges smoothly; α = 0.036 diverges',
      },
      {
        key: 'grad',
        symbol: '∂MSE/∂w',
        name: 'Loss Gradient (Slope of Bowl)',
        meaning: 'Negative on the left wall of the bowl, positive on the right wall, and 0 at the bottom.',
        example: 'If ∂MSE/∂w = −40, subtracting a negative pushes w right (downhill)',
      },
      {
        key: 'wnew',
        symbol: 'w_new',
        name: 'Updated Slope',
        meaning: 'Next slope value after taking one downhill step.',
        example: 'w_new = 2.0 − (0.015)(−40) = 2.60',
      },
      {
        key: 'xi',
        symbol: 'xᵢ',
        name: 'Input Feature Value',
        meaning: 'Scales how strongly point i pulls on the slope—far-right outliers have huge leverage!',
        example: 'Dragging a point at x = 9 shifts the bowl much faster than x = 1',
      },
    ],
    workedExample: {
      scenario:
        'Suppose current slope w = 2.0, local bowl slope ∂MSE/∂w = −50, and optimal slope sits at w* = 8.0. Compare a safe α = 0.05 vs. a reckless α = 0.30.',
      steps: [
        {
          label: 'Safe Step (α = 0.05)',
          math: 'w_new = 2.0 − (0.05)(−50) = 2.0 + 2.5 = 4.5',
          note: 'Moves cleanly downhill halfway toward w* = 8.0.',
        },
        {
          label: 'Reckless Step (α = 0.30)',
          math: 'w_new = 2.0 − (0.30)(−50) = 2.0 + 15.0 = 17.0',
          note: 'Overshoots w* = 8.0 by +9 units—landing higher up the opposite wall!',
        },
        {
          label: 'Next Reckless Bounce',
          math: 'At w = 17.0, gradient is even steeper (+75) → jumps past −5.5!',
          note: 'Each bounce grows wider until MSE explodes (Divergence).',
        },
      ],
      conclusion:
        'Always verify both Train MSE and Test MSE, and tune α so every epoch reduces loss smoothly without oscillation.',
    },
  },

  5: {
    stageId: 5,
    intuition:
      'Using a straight line for binary classification (0 = Fail, 1 = Pass) breaks in two fatal ways: straight lines output nonsense probabilities below 0 or above 1, and a single extreme outlier tilts the line flat. Logistic Regression wraps the linear score inside the S-shaped Sigmoid function to lock every output cleanly inside (0, 1).',
    analogyTitle: 'Everyday Analogy: Soft Dimmer Switch vs. Infinite Ramp',
    analogyText:
      'A straight line is an infinite ramp that keeps climbing to +500% probability if someone studies 50 hours. Sigmoid acts like a smooth dimmer curve: once a student studies well past the threshold, confidence saturates gently near 99.9% without distorting the borderline cutoff.',
    formulas: [
      {
        label: '1. The Sigmoid Activation Function',
        parts: [
          { text: 'S(z)', symbolKey: 'sig' },
          { text: ' = 1 / (1 + e⁻' },
          { text: 'ᶻ', symbolKey: 'z' },
          { text: ')   where   ' },
          { text: 'z', symbolKey: 'z' },
          { text: ' = w·x + b' },
        ],
      },
      {
        label: '2. Binary Cross-Entropy (Log-Loss) & Decision Rule',
        parts: [
          { text: 'Predict Pass if ' },
          { text: 'S(z)', symbolKey: 'sig' },
          { text: ' ≥ ' },
          { text: 't', symbolKey: 'thresh' },
          { text: '   |   ' },
          { text: 'BCE', symbolKey: 'bce' },
          { text: ' = −[y·log(p) + (1−y)·log(1−p)]' },
        ],
      },
    ],
    glossary: [
      {
        key: 'z',
        symbol: 'z = wx + b',
        name: 'Log-Odds (Logit)',
        meaning: 'Unbounded linear score from −∞ to +∞ before squashing.',
        example: 'z = 0 maps to exactly 50% probability',
      },
      {
        key: 'sig',
        symbol: 'S(z)',
        name: 'Sigmoid Probability',
        meaning: 'Squashes any real number z smoothly into a valid probability strictly between 0 and 1.',
        example: 'S(0) = 0.50, S(+2) = 0.88, S(−2) = 0.12',
      },
      {
        key: 'thresh',
        symbol: 't',
        name: 'Classification Threshold',
        meaning: 'Cutoff probability (default 0.50) trading off False Positives vs. False Negatives.',
        example: 'Lowering t to 0.30 catches more passes (higher Recall) but raises False Alarms (FP)',
      },
      {
        key: 'bce',
        symbol: 'BCE',
        name: 'Binary Cross-Entropy Loss',
        meaning: 'Penalizes confident wrong predictions severely (log(0) → ∞) while staying convex.',
        example: 'If true y = 1 and p = 0.90, loss = −log(0.90) = 0.105 (tiny)',
      },
    ],
    workedExample: {
      scenario:
        'A learned Logistic Regression model has w = 1.0, b = −6.0. Compute the predicted Pass probability for a student who studied x = 8 hours.',
      steps: [
        {
          label: 'Compute Linear Score z',
          math: 'z = (1.0)(8) + (−6.0) = +2.0',
          note: 'Positive z means the student is above the 6-hour midpoint.',
        },
        {
          label: 'Evaluate Exponential e⁻ᶻ',
          math: 'e⁻² ≈ 0.1353',
          note: 'Positive z makes e⁻ᶻ small and close to zero.',
        },
        {
          label: 'Apply Sigmoid Squash',
          math: 'S(2.0) = 1 / (1 + 0.1353) = 1 / 1.1353 ≈ 0.881 (88.1%)',
          note: 'Even at x = 50 hours (z = +44), S(44) saturates cleanly at 0.9999—never exceeding 1.0.',
        },
      ],
      conclusion:
        'With threshold t = 0.50, 88.1% ≥ 50% predicts Pass, and outliers far to the right saturate safely near 1.0.',
    },
  },

  6: {
    stageId: 6,
    intuition:
      'When data forms curved or interlocking shapes (like two moons), no straight line can separate the classes. Non-linear models solve this locally: K-Nearest Neighbors (KNN) lets the k closest data points vote by Euclidean distance, while Decision Trees recursively slice the 2D plane into pure rectangular boxes using Entropy and Information Gain.',
    analogyTitle: 'Everyday Analogy: Asking Neighbors vs. Playing 20 Questions',
    analogyText:
      'KNN is like moving to a new street and guessing neighborhood character by asking your k nearest neighbors (asking only k=1 eccentric neighbor overfits!). A Decision Tree is like playing 20 Questions ("Is x ≤ 4.5? Is y > 3.2?")—each yes/no question draws a crisp horizontal or vertical cut.',
    formulas: [
      {
        label: '1. KNN Euclidean Distance',
        parts: [
          { text: 'd(q, xᵢ)', symbolKey: 'dist' },
          { text: ' = √[ (x_q − xᵢ)² + (y_q − yᵢ)² ]   →   Majority vote of ' },
          { text: 'k', symbolKey: 'k' },
          { text: ' closest' },
        ],
      },
      {
        label: '2. Decision Tree Shannon Entropy & Information Gain',
        parts: [
          { text: 'H(S)', symbolKey: 'ent' },
          { text: ' = −' },
          { text: 'p₀', symbolKey: 'prob' },
          { text: ' log₂(' },
          { text: 'p₀', symbolKey: 'prob' },
          { text: ') − ' },
          { text: 'p₁', symbolKey: 'prob' },
          { text: ' log₂(' },
          { text: 'p₁', symbolKey: 'prob' },
          { text: ')   |   ' },
          { text: 'IG', symbolKey: 'ig' },
          { text: ' = H(parent) − Σ (|S_j|/|S|)·H(S_j)' },
        ],
      },
    ],
    glossary: [
      {
        key: 'dist',
        symbol: 'd(q, xᵢ)',
        name: 'Euclidean Distance',
        meaning: 'Straight-line geometric distance from query dot q to training point xᵢ.',
        example: 'From (2, 1) to (5, 5): √(3² + 4²) = 5.0',
      },
      {
        key: 'k',
        symbol: 'k',
        name: 'Neighborhood Size (Hyperparameter)',
        meaning: 'Number of closest voters. k = 1 memorizes noise (overfits); larger k smooths the boundary.',
        example: 'k = 1 → 100% Train Acc but fragile Test Acc; k = 9 → smooth curve',
      },
      {
        key: 'prob',
        symbol: 'p₀, p₁',
        name: 'Class Proportions in Box',
        meaning: 'Fraction of Class A and Class B points inside a tree node rectangle.',
        example: 'A 50/50 mixed box has p₀ = 0.5, p₁ = 0.5',
      },
      {
        key: 'ent',
        symbol: 'H(S)',
        name: 'Shannon Entropy (Impurity)',
        meaning: 'Measures class disorder from 0.0 bits (100% pure single class) to 1.0 bits (50/50 split).',
        example: 'Pure node (10 A, 0 B) → H = 0.00 bits',
      },
      {
        key: 'ig',
        symbol: 'IG',
        name: 'Information Gain',
        meaning: 'How much entropy drops after making a split. Trees pick the cut with maximum IG.',
        example: 'Parent H = 1.0 → Children weighted H = 0.35 → IG = +0.65 bits',
      },
    ],
    workedExample: {
      scenario:
        'A Decision Tree node contains 4 points: 3 Class A and 1 Class B. Compute its Entropy H(S) before splitting.',
      steps: [
        {
          label: 'Compute Class Proportions',
          math: 'p₀ = 3 / 4 = 0.75   |   p₁ = 1 / 4 = 0.25',
          note: 'Find the fraction of each class inside the rectangle.',
        },
        {
          label: 'Evaluate Base-2 Logarithms',
          math: 'log₂(0.75) ≈ −0.415   |   log₂(0.25) = −2.000',
          note: 'Log base-2 measures uncertainty in bits.',
        },
        {
          label: 'Combine into Shannon Entropy',
          math: 'H(S) = −[0.75(−0.415) + 0.25(−2.0)] = 0.311 + 0.500 = 0.811 bits',
          note: 'A split that isolates the 1 Class B point drops child entropies to 0.0, giving IG = +0.811!',
        },
      ],
      conclusion:
        'Both KNN (small k) and Decision Trees (large max_depth) can chase single noisy points—always watch Holdout Test Accuracy in the Visual Lab.',
    },
  },

  7: {
    stageId: 7,
    intuition:
      'Naive Bayes classifies text by comparing how likely each class (Spam vs. Ham) is to generate the observed words. It starts from the class Prior and multiplies each word’s conditional likelihood—assuming words act independently ("Naive")—and uses Laplace (+1) Smoothing so one unseen word never multiplies the whole answer by zero.',
    analogyTitle: 'Everyday Analogy: Weighing Independent Clues on a Scale',
    analogyText:
      'Imagine a two-pan balance scale starting slightly tilted toward Ham (most emails are legitimate). Each word drops a weight multiplier onto both pans: "WINNER" piles weight onto Spam while "MEETING" piles onto Ham. Without Laplace smoothing, one unfamiliar word like "CRYPTO" drops a zero multiplier that erases every other clue!',
    formulas: [
      {
        label: '1. Naive Bayes Posterior Score',
        parts: [
          { text: 'P(C | W)', symbolKey: 'post' },
          { text: ' ∝ ' },
          { text: 'P(C)', symbolKey: 'prior' },
          { text: ' × ∏ ' },
          { text: 'P(wᵢ | C)', symbolKey: 'like' },
        ],
      },
      {
        label: '2. Laplace (+1) Smoothed Word Likelihood',
        parts: [
          { text: 'P(wᵢ | C)', symbolKey: 'like' },
          { text: ' = ( count(wᵢ, C) + ' },
          { text: 'α', symbolKey: 'laplace' },
          { text: ' ) / ( total_words(C) + ' },
          { text: 'α', symbolKey: 'laplace' },
          { text: '·' },
          { text: '|V|', symbolKey: 'vocab' },
          { text: ' )' },
        ],
        caption: 'Set α = 0 for raw counts (risks Zero-Frequency Collapse) or α = 1 for Laplace Smoothing.',
      },
    ],
    glossary: [
      {
        key: 'prior',
        symbol: 'P(C)',
        name: 'Class Prior Probability',
        meaning: 'Baseline chance of Spam or Ham before reading any words in the email.',
        example: 'P(Spam) = 0.40, P(Ham) = 0.60',
      },
      {
        key: 'like',
        symbol: 'P(wᵢ | C)',
        name: 'Word Likelihood',
        meaning: 'Probability that word wᵢ appears given that the email belongs to class C.',
        example: 'P("WINNER" | Spam) = 18 / 80 = 0.225',
      },
      {
        key: 'post',
        symbol: 'P(C | W)',
        name: 'Posterior Probability',
        meaning: 'Final updated belief that the email is Spam or Ham after multiplying all word clues.',
        example: 'Normalized Score(Spam) / [Score(Spam) + Score(Ham)]',
      },
      {
        key: 'laplace',
        symbol: 'α (+1)',
        name: 'Laplace Smoothing Constant',
        meaning: 'Adds +1 pseudo-count to every word numerator so unseen words never produce 0.',
        example: 'With α = 1, unseen word "CRYPTO" gets (0 + 1)/(80 + 10) = 0.0111 instead of 0',
      },
      {
        key: 'vocab',
        symbol: '|V|',
        name: 'Vocabulary Size',
        meaning: 'Total number of unique words tracked by the model, ensuring smoothed probabilities still sum to 1.',
        example: '|V| = 10 vocabulary words in Stage 07',
      },
    ],
    workedExample: {
      scenario:
        'An email contains "WINNER" (18 Spam counts) plus an unseen word "CRYPTO" (0 Spam counts). Corpus has 80 total Spam words, |V| = 10, and P(Spam) = 0.4.',
      steps: [
        {
          label: 'Without Laplace Smoothing (α = 0)',
          math: 'Score(Spam) = 0.4 × (18/80) × (0/80) = 0.0000',
          note: 'Zero-Frequency Collapse! The single zero wipes out strong "WINNER" evidence.',
        },
        {
          label: 'Apply Laplace (+1) to Both Words',
          math: 'P(WINNER|Spam) = (18+1)/(80+10) = 19/90 ≈ 0.211   |   P(CRYPTO|Spam) = (0+1)/(80+10) = 1/90 ≈ 0.011',
          note: 'Denominator grows by +|V| (+10) to keep probabilities properly calibrated.',
        },
        {
          label: 'Recompute Smoothed Spam Score',
          math: 'Score(Spam) = 0.4 × 0.211 × 0.0111 = 0.000938 (> 0!)',
          note: 'Comparing against Smoothed Ham Score cleanly restores a confident Spam prediction.',
        },
      ],
      conclusion:
        'Test this exact scenario on the live balance scale in the Visual Lab by clicking CRYPTO with Laplace OFF, then toggling Laplace ON.',
    },
  },
};

export const MATH_NOTATION_BASICS: NotationBasicItem[] = [
  {
    symbol: 'X, xᵢ',
    name: 'Input Features (Data Matrix & Row)',
    meaning:
      'X is the full table of input columns; xᵢ is a single example row (like one student or one fruit).',
    example: 'x₃ = [4.5 hours, 76% attendance]',
  },
  {
    symbol: 'y vs. ŷ',
    name: 'True Target vs. Model Prediction',
    meaning:
      'y is the real ground-truth label from the dataset; ŷ ("y-hat") is what our ML formula predicts.',
    example: 'True mark y = 74, Predicted mark ŷ = 71.5',
  },
  {
    symbol: 'w, b',
    name: 'Model Parameters (Learned)',
    meaning:
      'Internal numbers adjusted automatically during training (slope weight w and intercept bias b).',
    example: 'ŷ = w·x + b learns w = 9.4, b = 10.2',
  },
  {
    symbol: 'α, k, depth',
    name: 'Hyperparameters (Human-Chosen)',
    meaning:
      'Settings chosen before training starts—such as Learning Rate α, KNN neighbors k, or Tree max_depth.',
    example: 'Choose k = 5 or α = 0.01 before calling .fit()',
  },
  {
    symbol: 'Σ (Sigma)',
    name: 'Summation Operator',
    meaning:
      'Add up the expression across every training example from i = 1 to N.',
    example: 'Σ eᵢ² = e₁² + e₂² + ... + e_N²',
  },
  {
    symbol: 'Π (Pi)',
    name: 'Product Operator',
    meaning:
      'Multiply the terms together across every word or feature (used in Naive Bayes likelihood chains).',
    example: '∏ P(wᵢ | Spam) = P(w₁|Spam) × P(w₂|Spam) × ...',
  },
  {
    symbol: '∂L / ∂w',
    name: 'Partial Derivative (Gradient)',
    meaning:
      'Measures how steeply Loss L rises if you nudge weight w slightly upward. Always step in the opposite direction!',
    example: 'w_new = w_old − α · (∂L / ∂w)',
  },
  {
    symbol: 'P(A | B)',
    name: 'Conditional Probability ("A given B")',
    meaning:
      'Probability that event A occurs knowing that evidence B has already been observed.',
    example: 'P(Spam | "WINNER", "FREE") = 98.4%',
  },
];

export const STAGE_PRIMERS: Record<number, StagePrimer> = {
  1: BASE_STAGE_PRIMERS[1],
  2: EXTRA_STAGE_PRIMERS[2],
  3: { ...BASE_STAGE_PRIMERS[2], stageId: 3 },
  4: { ...NEW_STAGE_PRIMERS[3], stageId: 4 },
  5: { ...BASE_STAGE_PRIMERS[4], stageId: 5 },
  6: { ...NEW_STAGE_PRIMERS[5], stageId: 6 },
  7: { ...BASE_STAGE_PRIMERS[5], stageId: 7 },
  8: { ...NEW_STAGE_PRIMERS[7], stageId: 8 },
  9: { ...BASE_STAGE_PRIMERS[6], stageId: 9 },
  10: { ...BASE_STAGE_PRIMERS[7], stageId: 10 },
  11: { ...NEW_STAGE_PRIMERS[10], stageId: 11 },
  12: { ...BASE_STAGE_PRIMERS[3], stageId: 12 },
  13: { ...NEW_STAGE_PRIMERS[12], stageId: 13 },
  14: { ...NEW_STAGE_PRIMERS[13], stageId: 14 },
  15: { ...NEW_STAGE_PRIMERS[14], stageId: 15 },
  16: EXTRA_STAGE_PRIMERS[16],
  17: EXTRA_STAGE_PRIMERS[17],
};

export const ALL_STAGE_FORMULAS: StageFormulaSummary[] = [
  {
    stageId: 1,
    stageLabel: 'Chapter 01',
    topic: 'What Is Machine Learning?',
    formula: 'z = w₁·x₁ + w₂·x₂ + b  (Predict Class 1 if z ≥ 0)',
    objective: 'Learn boundary weights from examples instead of rigid if/else rules',
  },
  {
    stageId: 2,
    stageLabel: 'Chapter 02',
    topic: 'Supervised, Unsupervised & RL',
    formula: 'Q(s,a) ← Q(s,a) + α [ r + γ max Q(s′,a′) − Q(s,a) ]',
    objective: 'Compare labels (x→y), structure (x), and reward-driven Q-Learning policies',
  },
  {
    stageId: 3,
    stageLabel: 'Chapter 03',
    topic: 'The Training Loop & Gradient Descent',
    formula: 'ŷ = w·x + b   |   MSE = (1/N) Σ (ŷᵢ − yᵢ)²',
    objective: 'Minimize average squared vertical residuals iteratively',
  },
  {
    stageId: 4,
    stageLabel: 'Chapter 04',
    topic: 'Data Preprocessing & Feature Scaling',
    formula: 'x_std = (x − μ) / σ   |   x_norm = (x − x_min) / (x_max − x_min)',
    objective: 'Align mixed feature units before optimization, SVM, KNN, or PCA',
  },
  {
    stageId: 5,
    stageLabel: 'Chapter 05',
    topic: 'Linear Regression & OLS',
    formula: 'w_new = w_old − α · (2/N) Σ (w·xᵢ + b − yᵢ)·xᵢ',
    objective: 'Walk down the convex MSE bowl safely; monitor Train vs. Test MSE',
  },
  {
    stageId: 6,
    stageLabel: 'Chapter 06',
    topic: 'Bias–Variance & Regularization',
    formula: 'L_Ridge = MSE + λ Σ wⱼ²   |   L_Lasso = MSE + λ Σ |wⱼ|',
    objective: 'Shrink oversized weights to prevent high-variance overfitting',
  },
  {
    stageId: 7,
    stageLabel: 'Chapter 07',
    topic: 'Logistic Regression & Thresholds',
    formula: 'σ(z) = 1 / (1 + e⁻ᶻ)   |   BCE = −[y log p + (1−y) log(1−p)]',
    objective: 'Map linear scores into [0, 1] probabilities resistant to outliers',
  },
  {
    stageId: 8,
    stageLabel: 'Chapter 08',
    topic: 'Support Vector Machines (SVM) & Kernels',
    formula: 'min ½‖w‖² + C Σ ξᵢ   |   K_RBF(x,x′) = exp(−γ‖x − x′‖²)',
    objective: 'Maximize separating margin 2/‖w‖ via Support Vectors and Kernel Trick',
  },
  {
    stageId: 9,
    stageLabel: 'Chapter 09',
    topic: 'KNN & Decision Trees',
    formula: 'd = √((x_q−xᵢ)²+(y_q−yᵢ)²)   |   H(S) = −Σ p_c log₂ p_c',
    objective: 'Learn local non-linear boundaries while preventing k=1 / deep-tree overfitting',
  },
  {
    stageId: 10,
    stageLabel: 'Chapter 10',
    topic: 'Naive Bayes & Laplace Smoothing',
    formula: 'P(C|W) ∝ P(C) ∏ [(count(wᵢ,C) + α) / (N_C + α|V|)]',
    objective: 'Multiply independent word likelihoods; α = +1 prevents zero collapse',
  },
  {
    stageId: 11,
    stageLabel: 'Chapter 11',
    topic: 'Ensemble Learning (Forests & Boosting)',
    formula: 'ŷ_RF = (1/M) Σ h_m(x)   |   F_Boost(x) = sign(Σ α_m h_m(x))',
    objective: 'Average parallel trees to slash variance; boost sequential stumps to slash bias',
  },
  {
    stageId: 12,
    stageLabel: 'Chapter 12',
    topic: 'Unsupervised Learning & K-Means',
    formula: 'μ_c = (1/|C|) Σ_{x∈C} x   |   min Σ ‖xᵢ − μ_c‖²',
    objective: 'Discover hidden clusters without labels by minimizing centroid inertia',
  },
  {
    stageId: 13,
    stageLabel: 'Chapter 13',
    topic: 'Dimensionality Reduction & PCA',
    formula: 'Σ v_k = λ_k v_k   |   EVR₁ = λ₁ / (λ₁ + λ₂ + ... + λ_d)',
    objective: 'Project correlated features onto top eigenvectors maximizing retained variance',
  },
  {
    stageId: 14,
    stageLabel: 'Chapter 14',
    topic: 'Perceptrons & Multi-Layer Neural Nets',
    formula: 'h = ReLU(W₁x + b₁) = max(0, W₁x + b₁)   |   ŷ = σ(W₂h + b₂)',
    objective: 'Stack non-linear hidden activations to bend space and solve XOR',
  },
  {
    stageId: 15,
    stageLabel: 'Chapter 15',
    topic: 'Backpropagation & Chain Rule',
    formula: '∂L/∂w₁ = (∂L/∂ŷ) · (∂ŷ/∂h) · (∂h/∂z₁) · x',
    objective: 'Propagate exact error gradients backward to train deep multi-layer weights',
  },
  {
    stageId: 16,
    stageLabel: 'Chapter 16',
    topic: 'Convolutional Neural Networks (CNNs)',
    formula: 'F(i,j) = ReLU( ΣΣ I(i+m, j+n) · K(m,n) )',
    objective: 'Share 3×3 spatial filters across images and downsample with Max Pooling',
  },
  {
    stageId: 17,
    stageLabel: 'Chapter 17',
    topic: 'Attention & Intro to Transformers',
    formula: 'Attention(Q,K,V) = softmax( Q·Kᵀ / √d_k ) · V',
    objective: 'Weigh every token against every other token in parallel to resolve context',
  },
];
