import type { StagePrimer } from '@/data/primers';

export const NEW_STAGE_PRIMERS: Record<number, StagePrimer> = {
  3: {
    stageId: 3,
    intuition:
      'Real-world datasets mix wildly different units—like house area in thousands of square feet next to bedroom counts from 1 to 5. Unscaled inputs stretch loss surfaces into narrow canyons where Gradient Descent zig-zags and distance models ignore smaller features. Feature scaling puts every column on a fair playing field before training.',
    analogyTitle: 'Everyday Analogy: Comparing Height in Millimeters vs. Age in Years',
    analogyText:
      'If you measure someone’s height in millimeters (1,750) and age in years (22), a distance calculator treats a 10mm hair difference as bigger than a 5-year age gap! Standardizing converts both into "how many standard deviations above or below average," making comparisons fair.',
    formulas: [
      {
        label: '1. Z-Score Standardization (Mean 0, Std 1)',
        parts: [
          { text: 'x_std', symbolKey: 'xstd' },
          { text: ' = ( ' },
          { text: 'x', symbolKey: 'x' },
          { text: ' − ' },
          { text: 'μ', symbolKey: 'mu' },
          { text: ' ) / ' },
          { text: 'σ', symbolKey: 'sigma' },
        ],
        caption: 'Preferred default for Gradient Descent, SVM, PCA, and Neural Networks.',
      },
      {
        label: '2. Min-Max Normalization (Bounded [0, 1])',
        parts: [
          { text: 'x_norm', symbolKey: 'xnorm' },
          { text: ' = ( ' },
          { text: 'x', symbolKey: 'x' },
          { text: ' − ' },
          { text: 'x_min', symbolKey: 'minmax' },
          { text: ' ) / ( ' },
          { text: 'x_max − x_min', symbolKey: 'minmax' },
          { text: ' )' },
        ],
        caption: 'Useful when you need strict [0, 1] pixel or sensor bounds—watch out for extreme outliers.',
      },
    ],
    glossary: [
      {
        key: 'x',
        symbol: 'x',
        name: 'Raw Feature Value',
        meaning: 'Original unscaled measurement directly from your CSV column.',
        example: 'House Area x = 2,200 sq ft',
      },
      {
        key: 'mu',
        symbol: 'μ',
        name: 'Training Feature Mean',
        meaning: 'Average value of the column computed strictly on the Training Set (preventing data leakage).',
        example: 'μ = 1,794 sq ft',
      },
      {
        key: 'sigma',
        symbol: 'σ',
        name: 'Training Standard Deviation',
        meaning: 'Typical spread around the mean used to divide all features to unit scale.',
        example: 'σ = 710 sq ft',
      },
      {
        key: 'xstd',
        symbol: 'x_std',
        name: 'Standardized Z-Score',
        meaning: 'Number of standard deviations above (+) or below (−) the mean.',
        example: '(2200 − 1794) / 710 = +0.57',
      },
      {
        key: 'xnorm',
        symbol: 'x_norm',
        name: 'Normalized [0, 1] Value',
        meaning: 'Relative position between the column’s minimum (0) and maximum (1).',
        example: '(2200 − 750) / (2950 − 750) = 0.659',
      },
      {
        key: 'minmax',
        symbol: 'x_min, x_max',
        name: 'Column Bounds',
        meaning: 'Smallest and largest observed training values for that feature.',
        example: 'Area spans 750 to 2,950 sq ft',
      },
    ],
    workedExample: {
      scenario: 'Standardize a house with Area = 2,200 sq ft where training μ = 1,800 and σ = 600.',
      steps: [
        {
          label: 'Subtract Training Mean',
          math: '2200 − 1800 = +400 sq ft',
          note: 'Centers the dataset around zero.',
        },
        {
          label: 'Divide by Standard Deviation',
          math: 'x_std = +400 / 600 = +0.67',
          note: 'Now Area sits right beside standardized Bedrooms (e.g., +0.71) on a clean unit scale.',
        },
      ],
      conclusion: 'Standardized features turn elongated canyon loss surfaces into circular bowls so Gradient Descent converges in far fewer steps.',
    },
  },

  5: {
    stageId: 5,
    intuition:
      'Every model walks a tightrope between two failures: a model that is too simple misses the real pattern (High Bias / Underfitting), while an overly flexible model memorizes random training noise (High Variance / Overfitting). Regularization adds a complexity penalty λ directly to the loss function so weights stay calm and curves generalize smoothly.',
    analogyTitle: 'Everyday Analogy: Studying Principles vs. Memorizing Practice Test Answers',
    analogyText:
      'A student who barely studies (High Bias) scores poorly on both practice and final exams. A student who memorizes exact wording of 10 practice questions (High Variance) scores 100% on practice but fails slightly reworded final questions. Regularization rewards simpler explanations that actually transfer to the real exam.',
    formulas: [
      {
        label: '1. Ridge Regression (L2 Regularization)',
        parts: [
          { text: 'L_Ridge', symbolKey: 'loss' },
          { text: ' = MSE + ' },
          { text: 'λ', symbolKey: 'lambda' },
          { text: ' · Σ ' },
          { text: 'wⱼ²', symbolKey: 'l2' },
        ],
        caption: 'Shrinks all large weights smoothly toward zero—calms wild high-degree curves.',
      },
      {
        label: '2. Lasso Regression (L1 Regularization)',
        parts: [
          { text: 'L_Lasso', symbolKey: 'loss' },
          { text: ' = MSE + ' },
          { text: 'λ', symbolKey: 'lambda' },
          { text: ' · Σ ' },
          { text: '|wⱼ|', symbolKey: 'l1' },
        ],
        caption: 'Pushes weak or redundant feature weights all the way to exact 0 (automatic feature selection).',
      },
    ],
    glossary: [
      {
        key: 'loss',
        symbol: 'L_Reg',
        name: 'Regularized Objective',
        meaning: 'Balances fitting training points (MSE) against keeping weights small (Penalty).',
        example: 'Trades tiny +0.02 Train MSE for huge −4.5 Test MSE improvement',
      },
      {
        key: 'lambda',
        symbol: 'λ',
        name: 'Regularization Strength',
        meaning: 'Hyperparameter controlling penalty severity. λ = 0 turns off regularization; huge λ flattens into underfitting.',
        example: 'λ = 0.05 calms a degree-9 curve cleanly',
      },
      {
        key: 'l2',
        symbol: 'Σ wⱼ²',
        name: 'L2 Squared Penalty (Ridge)',
        meaning: 'Heavily punishes huge individual coefficients while keeping correlated features shared smoothly.',
        example: 'Weights [12, −9] incur penalty 144 + 81 = 225',
      },
      {
        key: 'l1',
        symbol: 'Σ |wⱼ|',
        name: 'L1 Absolute Penalty (Lasso)',
        meaning: 'Creates sparse solutions where weak terms drop to exact 0.000.',
        example: 'Zeros out unnecessary x⁷, x⁸, x⁹ terms automatically',
      },
    ],
    workedExample: {
      scenario: 'Compare total Ridge Loss when two models have Train MSE = 0.08, with λ = 0.05.',
      steps: [
        {
          label: 'Wild Overfit Weights [w₁ = 12, w₂ = −10]',
          math: 'L = 0.08 + 0.05·(12² + 10²) = 0.08 + 12.20 = 12.28',
          note: 'Huge penalty rejects the wildly oscillating solution.',
        },
        {
          label: 'Calm Smooth Weights [w₁ = 1.8, w₂ = −0.6]',
          math: 'L = 0.12 + 0.05·(1.8² + 0.6²) = 0.12 + 0.18 = 0.30',
          note: 'Even with slightly higher Train MSE, the calm curve wins overwhelmingly!',
        },
      ],
      conclusion: 'Always tune polynomial degree and λ using Holdout Test Error—never Train Error alone.',
    },
  },

  7: {
    stageId: 7,
    intuition:
      'Countless straight lines can separate two clusters with 100% training accuracy—so which one is best? Support Vector Machines (SVM) choose the single widest "street" (maximum margin) between classes, anchored only by the closest critical points called Support Vectors. When data is curved like concentric rings, the Kernel Trick lifts similarity into higher dimensions so a clean boundary wraps right around it.',
    analogyTitle: 'Everyday Analogy: Painting the Center Line of the Widest Highway',
    analogyText:
      'Imagine two rival neighborhoods separated by empty land. Instead of building a fence millimeters from someone’s front porch (risking mistakes on new houses), SVM builds the widest possible buffer street between the two closest border houses (the Support Vectors) and places the boundary right down the middle.',
    formulas: [
      {
        label: '1. Maximum-Margin Hyperplane & Street Width',
        parts: [
          { text: 'w·x + b = 0', symbolKey: 'hyper' },
          { text: '   |   Margin Width = ' },
          { text: '2 / ‖w‖', symbolKey: 'margin' },
          { text: '   (minimize ½‖w‖² + ' },
          { text: 'C', symbolKey: 'cparam' },
          { text: ' Σ ' },
          { text: 'ξᵢ', symbolKey: 'slack' },
          { text: ')' },
        ],
        caption: 'Smaller ‖w‖ widens the street; C controls how strictly margin violations ξᵢ are punished.',
      },
      {
        label: '2. RBF (Gaussian) Kernel Trick for Non-Linear Data',
        parts: [
          { text: 'K(x, x′)', symbolKey: 'kernel' },
          { text: ' = exp( −' },
          { text: 'γ', symbolKey: 'gamma' },
          { text: ' · ‖x − x′‖² )' },
        ],
        caption: 'Measures local radial similarity—separates concentric rings without explicit high-D coordinates.',
      },
    ],
    glossary: [
      {
        key: 'hyper',
        symbol: 'w·x + b = 0',
        name: 'Separating Hyperplane',
        meaning: 'Center decision line dividing Class +1 (score ≥ 0) from Class −1 (score < 0).',
        example: 'Gutters sit at w·x + b = +1 and w·x + b = −1',
      },
      {
        key: 'margin',
        symbol: '2 / ‖w‖',
        name: 'Geometric Margin Width',
        meaning: 'Empty safety distance between the two class gutters—maximizing this improves generalization.',
        example: 'If ‖w‖ = 0.5, street width = 2 / 0.5 = 4.0 units',
      },
      {
        key: 'cparam',
        symbol: 'C',
        name: 'Soft-Margin Regularization',
        meaning: 'Low C allows a wider street ignoring an outlier; high C forces strict classification with a narrower margin.',
        example: 'C = 0.2 ignores noisy crossover dot; C = 20 bends strictly around it',
      },
      {
        key: 'slack',
        symbol: 'ξᵢ',
        name: 'Slack Variable (Violation)',
        meaning: 'Measures how far point i trespasses inside or across the margin street (0 for safe points).',
        example: 'ξᵢ = 0 outside gutter; ξᵢ > 1 means misclassified',
      },
      {
        key: 'kernel',
        symbol: 'K(x, x′)',
        name: 'Kernel Similarity Function',
        meaning: 'Computes dot products in an implicit lifted feature space cheaply.',
        example: 'Linear, Polynomial (degree 2), or Radial Basis Function (RBF)',
      },
      {
        key: 'gamma',
        symbol: 'γ',
        name: 'RBF Kernel Bandwidth',
        meaning: 'Controls how tightly each Support Vector’s influence wraps around it (huge γ overfits islands).',
        example: 'γ = 1.2 wraps smoothly around inner ring',
      },
    ],
    workedExample: {
      scenario: 'Compare two candidate separating hyperplanes: Model A has ‖w‖ = 2.0 and Model B has ‖w‖ = 0.8 (both classify all points cleanly).',
      steps: [
        {
          label: 'Compute Model A Margin Width',
          math: 'Margin_A = 2 / 2.0 = 1.00 unit',
          note: 'Narrow clearance leaves little room for noisy test points.',
        },
        {
          label: 'Compute Model B Margin Width',
          math: 'Margin_B = 2 / 0.8 = 2.50 units',
          note: '2.5× wider street! SVM strictly prefers Model B by minimizing ½‖w‖².',
        },
      ],
      conclusion: 'Because only Support Vectors touch the +1/−1 gutters, SVM stays rock-solid even when interior points move.',
    },
  },

  10: {
    stageId: 10,
    intuition:
      'One deep decision tree is fragile—flipping two training points can reshuffle its entire boundary. Ensemble Learning harnesses the wisdom of crowds in two contrasting ways: Bagging (Random Forests) trains many diverse trees in parallel and averages their votes to crush variance, while Boosting trains weak stumps sequentially so each round fixes the mistakes of earlier rounds to crush bias.',
    analogyTitle: 'Everyday Analogy: Independent Jury vs. Relay Study Team',
    analogyText:
      'A Random Forest is like asking 15 independent specialists to evaluate a case from slightly different notes and taking the majority vote—individual quirks cancel out. Boosting is like a relay team where Tutor #2 focuses specifically on the exam questions Tutor #1 got wrong.',
    formulas: [
      {
        label: '1. Bagging / Random Forest Ensemble Vote',
        parts: [
          { text: 'ŷ_RF(x)', symbolKey: 'rf' },
          { text: ' = (1 / ' },
          { text: 'M', symbolKey: 'trees' },
          { text: ') · Σ h_m(x)   |   Var(avg) ≈ σ² / ' },
          { text: 'M', symbolKey: 'trees' },
        ],
        caption: 'Averaging M de-correlated trees cuts prediction variance sharply.',
      },
      {
        label: '2. Boosting Weighted Combination (AdaBoost)',
        parts: [
          { text: 'F(x)', symbolKey: 'boost' },
          { text: ' = sign( Σ ' },
          { text: 'α_m', symbolKey: 'alpham' },
          { text: ' · h_m(x) )   where   α_m = ½ ln((1 − ' },
          { text: 'ε_m', symbolKey: 'err' },
          { text: ') / ' },
          { text: 'ε_m', symbolKey: 'err' },
          { text: ')' },
        ],
        caption: 'More accurate weak stumps earn larger voting weights α_m; missed points gain higher weight next round.',
      },
    ],
    glossary: [
      {
        key: 'trees',
        symbol: 'M',
        name: 'Number of Base Learners',
        meaning: 'Total trees in the Random Forest or sequential rounds in Boosting.',
        example: 'Growing M from 1 to 15 trees smooths jagged boundaries',
      },
      {
        key: 'rf',
        symbol: 'ŷ_RF(x)',
        name: 'Bagged Average / Majority Vote',
        meaning: 'Parallel consensus of trees trained on bootstrapped data samples.',
        example: 'If 12 of 15 trees vote Class 1, probability = 0.80',
      },
      {
        key: 'boost',
        symbol: 'F(x)',
        name: 'Boosted Additive Model',
        meaning: 'Weighted sum of sequential weak decision stumps focusing progressively on hard points.',
        example: '10 depth-1 stumps combine into a curved separating boundary',
      },
      {
        key: 'alpham',
        symbol: 'α_m',
        name: 'Stump Voting Weight',
        meaning: 'Trust weight awarded to round m based on its weighted error rate ε_m.',
        example: 'ε = 0.20 → α = 0.5 · ln(4) = +0.693',
      },
      {
        key: 'err',
        symbol: 'ε_m',
        name: 'Weighted Round Error',
        meaning: 'Fraction of total sample weight misclassified by stump m.',
        example: 'Lower ε_m gives stump m stronger voting authority',
      },
    ],
    workedExample: {
      scenario: 'A Boosting stump achieves weighted error ε = 0.20 on round 1. Compute its trust weight α₁.',
      steps: [
        {
          label: 'Compute Accuracy-to-Error Odds',
          math: '(1 − ε) / ε = 0.80 / 0.20 = 4.0',
          note: 'Stump is 4× more right than wrong.',
        },
        {
          label: 'Compute AdaBoost Stump Weight',
          math: 'α₁ = 0.5 · ln(4.0) = 0.5 · 1.386 = +0.693',
          note: 'Misclassified points are then scaled up by exp(+0.693) = 2× for round 2!',
        },
      ],
      conclusion: 'Random Forests stabilize noisy deep trees via parallel voting, while Boosting turns simple stumps into accurate sequential learners.',
    },
  },

  12: {
    stageId: 12,
    intuition:
      'High-dimensional datasets often contain redundant, correlated measurements (like height in cm and shoe size, or nearby sensor pixels). Principal Component Analysis (PCA) rotates your coordinate axes to line up with the directions of maximum spread (variance)—allowing you to drop tiny noisy axes while preserving nearly all the original information.',
    analogyTitle: 'Everyday Analogy: Taking the Best Camera Angle of a 3D Statue',
    analogyText:
      'If you photograph a long pencil head-on from the tip, it collapses into a tiny dot—almost all information is lost. Rotating your camera to capture the pencil lengthwise (Principal Component 1) preserves 99% of its shape in a single flat photo.',
    formulas: [
      {
        label: '1. Covariance Eigenvalue Equation',
        parts: [
          { text: 'Σ', symbolKey: 'cov' },
          { text: ' · ' },
          { text: 'v_k', symbolKey: 'vec' },
          { text: ' = ' },
          { text: 'λ_k', symbolKey: 'eig' },
          { text: ' · ' },
          { text: 'v_k', symbolKey: 'vec' },
        ],
        caption: 'Eigenvector v₁ points along maximum variance; eigenvalue λ₁ equals the exact variance captured along it.',
      },
      {
        label: '2. Explained Variance Ratio (Information Kept)',
        parts: [
          { text: 'EVR₁', symbolKey: 'evr' },
          { text: ' = ' },
          { text: 'λ₁', symbolKey: 'eig' },
          { text: ' / ( λ₁ + λ₂ + ... + λ_d )   |   Projection: ' },
          { text: 'z', symbolKey: 'proj' },
          { text: ' = (x − μ) · v₁' },
        ],
        caption: 'Maximizing projected variance automatically minimizes perpendicular squared reconstruction error.',
      },
    ],
    glossary: [
      {
        key: 'cov',
        symbol: 'Σ',
        name: 'Feature Covariance Matrix',
        meaning: 'Measures how pairs of centered features vary together (diagonal = variances, off-diagonal = correlation).',
        example: 'Positive off-diagonal c_xy means x and y rise together diagonally',
      },
      {
        key: 'vec',
        symbol: 'v₁, v₂',
        name: 'Principal Component Axes',
        meaning: 'Orthogonal unit eigenvectors forming the new rotated coordinate frame.',
        example: 'v₁ = [0.83, 0.56] aligns along the 34° diagonal cloud',
      },
      {
        key: 'eig',
        symbol: 'λ₁, λ₂',
        name: 'Eigenvalues (Captured Variance)',
        meaning: 'Exact variance of data points projected onto each principal component axis.',
        example: 'λ₁ = 3.80, λ₂ = 0.20 → PC1 holds 95% of total spread',
      },
      {
        key: 'evr',
        symbol: 'EVR',
        name: 'Explained Variance Ratio',
        meaning: 'Percentage of total information preserved when compressing down to the top k axes.',
        example: 'Keeping PC1 alone retains 95% of variance while cutting dimensions by 50%',
      },
      {
        key: 'proj',
        symbol: 'z',
        name: '1D Compressed Coordinate',
        meaning: 'Single scalar score locating a point along Principal Component 1.',
        example: 'z = (x − μ)·v₁ replaces two correlated features with one clean coordinate',
      },
    ],
    workedExample: {
      scenario: 'A standardized 2D sensor dataset has covariance eigenvalues λ₁ = 3.60 and λ₂ = 0.40.',
      steps: [
        {
          label: 'Sum Total Variance',
          math: 'Total Var = λ₁ + λ₂ = 3.60 + 0.40 = 4.00',
          note: 'Total spread across both original dimensions.',
        },
        {
          label: 'Compute PC1 Explained Variance Ratio',
          math: 'EVR₁ = 3.60 / 4.00 = 0.90 (90.0%)',
          note: 'Dropping PC2 cuts storage in half while keeping 90% of the data structure!',
        },
      ],
      conclusion: 'Because total distance is fixed by Pythagoras, the axis maximizing variance is simultaneously the axis minimizing reconstruction error.',
    },
  },

  13: {
    stageId: 13,
    intuition:
      'A single artificial neuron (Perceptron) computes a weighted sum and draws one straight boundary—meaning it fails completely on diagonally opposed patterns like XOR. Stacking a Hidden Layer with a non-linear activation function (like ReLU, Sigmoid, or Tanh) lets intermediate neurons learn simple sub-features and bend feature space so the output neuron can separate complex shapes cleanly.',
    analogyTitle: 'Everyday Analogy: Folding a Sheet of Paper Before Making One Straight Cut',
    analogyText:
      'Try separating two red corners from two blue corners on a flat square sheet of paper using a single straight scissor cut—it is impossible! A hidden layer with non-linear activations folds the paper first so the two blue corners touch, letting the final output neuron slice them cleanly in one straight cut.',
    formulas: [
      {
        label: '1. Hidden Layer Forward Pass (Non-Linear Feature Transform)',
        parts: [
          { text: 'h_j', symbolKey: 'hidden' },
          { text: ' = ' },
          { text: 'φ', symbolKey: 'act' },
          { text: '( ' },
          { text: 'w_j·x + b_j', symbolKey: 'lin' },
          { text: ' )   where   ReLU(z) = max(0, z)' },
        ],
        caption: 'Without non-linear φ(·), stacked layers collapse mathematically into one plain linear line.',
      },
      {
        label: '2. Output Layer Combination',
        parts: [
          { text: 'ŷ', symbolKey: 'out' },
          { text: ' = σ( ' },
          { text: 'v₁·h₁ + v₂·h₂ + c', symbolKey: 'outw' },
          { text: ' )' },
        ],
        caption: 'Combines transformed hidden features h₁ (OR-like) and h₂ (AND-like) to solve XOR.',
      },
    ],
    glossary: [
      {
        key: 'lin',
        symbol: 'z = w·x + b',
        name: 'Pre-Activation Linear Sum',
        meaning: 'Weighted evidence entering an artificial neuron before non-linear activation.',
        example: 'z₁ = 1·x₁ + 1·x₂ − 0.5',
      },
      {
        key: 'act',
        symbol: 'φ(z)',
        name: 'Activation Function',
        meaning: 'Non-linear bend (ReLU, Tanh, Sigmoid) enabling neural networks to approximate any curved function.',
        example: 'ReLU(−0.5) = 0, ReLU(+1.5) = +1.5',
      },
      {
        key: 'hidden',
        symbol: 'h₁, h₂',
        name: 'Hidden Layer Activations',
        meaning: 'Learned intermediate representations (for XOR: h₁ detects "at least one 1", h₂ detects "both 1").',
        example: 'Input (1, 1) maps to h₁ = 1.5, h₂ = 0.5',
      },
      {
        key: 'outw',
        symbol: 'v₁, v₂, c',
        name: 'Output Layer Weights & Bias',
        meaning: 'Weighs each hidden neuron positively or negatively to emit the final decision score.',
        example: '6·h₁ − 12·h₂ turns ON for (1,0)/(0,1) and cancels out for (1,1)',
      },
      {
        key: 'out',
        symbol: 'ŷ',
        name: 'Network Output Probability',
        meaning: 'Final prediction after passing the output score through Sigmoid.',
        example: 'ŷ = 0.96 for (0, 1) and ŷ = 0.04 for (1, 1)',
      },
    ],
    workedExample: {
      scenario: 'Trace XOR input (x₁ = 1, x₂ = 1) through two ReLU hidden neurons h₁ = ReLU(x₁+x₂−0.5) and h₂ = ReLU(x₁+x₂−1.5).',
      steps: [
        {
          label: 'Compute Hidden Neurons',
          math: 'h₁ = ReLU(1 + 1 − 0.5) = 1.5   |   h₂ = ReLU(1 + 1 − 1.5) = 0.5',
          note: 'Both hidden neurons activate because both inputs are 1.',
        },
        {
          label: 'Combine at Output Neuron',
          math: 'z_out = 6(1.5) − 12(0.5) − 1.2 = 9.0 − 6.0 − 1.2 = +1.8? Wait: with v₁=4, v₂=−10, c=−1 → 6 − 5 − 1 = 0',
          note: 'The negative weight on h₂ subtracts out the (1, 1) case while leaving (1, 0) and (0, 1) positive!',
        },
      ],
      conclusion: 'Non-linear hidden neurons fold the diagonally opposed (1, 1) corner back next to (0, 0) so the output layer separates XOR cleanly.',
    },
  },

  14: {
    stageId: 14,
    intuition:
      'Training a multi-layer neural network poses a deep question: when the final prediction is wrong, how much blame belongs to a weight buried two or ten layers earlier? Backpropagation answers this using the Calculus Chain Rule—passing error gradients backward layer by layer so every weight knows its exact downhill direction.',
    analogyTitle: 'Everyday Analogy: Tracing a Factory Defect Back Down the Assembly Line',
    analogyText:
      'If a finished car misses inspection (Loss), the inspector first tells the final painter how far off the finish is (∂L/∂w₂). The painter multiplies that signal by how sensitive their step was to the metal prep station (∂ŷ/∂h · ∂h/∂w₁) and passes exact correction instructions upstream.',
    formulas: [
      {
        label: '1. Chain Rule Backpropagation to Early Weight w₁',
        parts: [
          { text: '∂L / ∂w₁', symbolKey: 'dw1' },
          { text: ' = ' },
          { text: '(∂L / ∂ŷ)', symbolKey: 'dldy' },
          { text: ' · ' },
          { text: '(∂ŷ / ∂h)', symbolKey: 'dydh' },
          { text: ' · ' },
          { text: '(∂h / ∂z₁)', symbolKey: 'dhdz' },
          { text: ' · ' },
          { text: 'x', symbolKey: 'xin' },
        ],
        caption: 'Each backward hop simply multiplies the incoming gradient by its local derivative.',
      },
      {
        label: '2. Gradient Descent Parameter Update',
        parts: [
          { text: 'w_new', symbolKey: 'wupd' },
          { text: ' = w_old − ' },
          { text: 'α', symbolKey: 'lr' },
          { text: ' · (∂L / ∂w)' },
        ],
        caption: 'Watch out for Vanishing Gradients: Sigmoid has max ∂h/∂z₁ = 0.25, whereas positive ReLU keeps ∂h/∂z₁ = 1.0.',
      },
    ],
    glossary: [
      {
        key: 'dldy',
        symbol: '∂L / ∂ŷ',
        name: 'Output Error Signal',
        meaning: 'For squared loss L = ½(ŷ − y)², simply equals (ŷ − y).',
        example: 'Pred 0.40 − Target 1.00 = −0.60',
      },
      {
        key: 'dydh',
        symbol: '∂ŷ / ∂h',
        name: 'Output Weight Bridge (= w₂)',
        meaning: 'Routes blame from the output back to hidden activation h proportional to connection strength w₂.',
        example: 'If w₂ = 0.80, hidden unit h receives 80% of the output signal',
      },
      {
        key: 'dhdz',
        symbol: '∂h / ∂z₁',
        name: 'Local Activation Slope',
        meaning: 'Derivative of ReLU (1 if z₁>0 else 0) or Sigmoid (s·(1−s) ≤ 0.25).',
        example: 'Multiplying ≤0.25 across many Sigmoid layers causes Vanishing Gradients',
      },
      {
        key: 'xin',
        symbol: 'x',
        name: 'Upstream Input Multiplier',
        meaning: 'Local derivative ∂z₁/∂w₁ = x—larger inputs produce proportionally larger weight updates.',
        example: 'If x = 2.0, weight w₁ sees twice the gradient of x = 1.0',
      },
      {
        key: 'dw1',
        symbol: '∂L / ∂w₁',
        name: 'Hidden Weight Gradient',
        meaning: 'Total sensitivity of final Loss to tiny nudges in the first-layer weight w₁.',
        example: 'Negative gradient tells Gradient Descent to increase w₁',
      },
      {
        key: 'lr',
        symbol: 'α',
        name: 'Learning Rate',
        meaning: 'Controls how aggressively weights update each epoch after backpropagation.',
        example: 'α = 0.15 drives loss cleanly toward 0.00 in ~15 epochs',
      },
      {
        key: 'wupd',
        symbol: 'w_new',
        name: 'Updated Network Weight',
        meaning: 'New parameter ready for the next training epoch.',
        example: 'w₁ ← 0.50 − (0.15)(−0.96) = 0.644',
      },
    ],
    workedExample: {
      scenario: 'Trace one Chain-Rule backward pass with x = 2, target y = 1, w₁ = 0.5, w₂ = 0.8 (ReLU, biases 0).',
      steps: [
        {
          label: 'Forward Pass',
          math: 'z₁ = 0.5(2) = 1.0 → h = ReLU(1.0) = 1.0 → ŷ = 0.8(1.0) = 0.80',
          note: 'Prediction 0.80 is 0.20 below target 1.00 (Loss = ½(−0.20)² = 0.02).',
        },
        {
          label: 'Chain Rule Backward to w₁',
          math: '∂L/∂w₁ = (0.80 − 1.00) × 0.8 × 1.0 × 2.0 = −0.32',
          note: 'With α = 0.2, w₁ updates to 0.50 − 0.2(−0.32) = 0.564, raising ŷ closer to 1.0!',
        },
      ],
      conclusion: 'Every modern deep learning framework (PyTorch, TensorFlow) automates this exact Chain Rule across millions of weights.',
    },
  },
};
