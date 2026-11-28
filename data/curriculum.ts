export interface CourseUnit {
  id: number;
  numberLabel: string;
  shortTitle: string;
  title: string;
  description: string;
  chapterIds: number[];
}

export interface StageMeta {
  id: number;
  unitId: number;
  numberLabel: string;
  shortTitle: string;
  title: string;
  category: string;
  subtitle: string;
  keyTakeaway: string;
  datasetTag: string;
  socraticQuestion: string;
  followUpQuestion: string;
  instructorAnswer: string;
  proofLabel: string;
  proofDescription: string;
}

export const COURSE_UNITS: CourseUnit[] = [
  {
    id: 1,
    numberLabel: 'Unit 01',
    shortTitle: 'Foundations & Paradigms',
    title: 'Foundations & Learning Paradigms',
    description:
      'Compare rules vs. data-driven learning, contrast Supervised, Unsupervised, and Reinforcement Learning, and master gradient optimization and feature scaling.',
    chapterIds: [1, 2, 3, 4],
  },
  {
    id: 2,
    numberLabel: 'Unit 02',
    shortTitle: 'Regression & Generalization',
    title: 'Regression & Generalization',
    description:
      'Fit continuous targets with Ordinary Least Squares and Gradient Descent, then control overfitting with Bias–Variance analysis and L1/L2 Regularization.',
    chapterIds: [5, 6],
  },
  {
    id: 3,
    numberLabel: 'Unit 03',
    shortTitle: 'Classification & SVM',
    title: 'Classification & Margin Models',
    description:
      'Classify probabilities with Logistic Regression, maximize margin clearance with Support Vector Machines and Kernels, and explore KNN, Trees, and Naive Bayes.',
    chapterIds: [7, 8, 9, 10],
  },
  {
    id: 4,
    numberLabel: 'Unit 04',
    shortTitle: 'Ensembles & Unsupervised',
    title: 'Ensembles & Unsupervised Learning',
    description:
      'Combine trees into Random Forests and Boosted ensembles, discover hidden clusters via K-Means, and compress correlated features with PCA.',
    chapterIds: [11, 12, 13],
  },
  {
    id: 5,
    numberLabel: 'Unit 05',
    shortTitle: 'Deep Learning',
    title: 'Deep Learning & Modern Architectures',
    description:
      'Build from Perceptrons and Backpropagation up to Convolutional Neural Networks for images and Self-Attention Transformers for language.',
    chapterIds: [14, 15, 16, 17],
  },
];

export const CURRICULUM_STAGES: StageMeta[] = [
  {
    id: 1,
    unitId: 1,
    numberLabel: 'Chapter 01',
    shortTitle: 'What Is Machine Learning?',
    title: 'What Is Machine Learning?',
    category: 'Foundations · Intuition',
    subtitle:
      'Compare rigid if/else rules against a learned boundary that adapts to edge cases.',
    keyTakeaway:
      'Traditional code requires explicit rules; ML learns mathematical parameters directly from labeled examples.',
    datasetTag: 'Fruit Sorting · 2D Features',
    socraticQuestion:
      'Why is it impossible to write explicit if/else rules for every possible image, voice command, or medical scan?',
    followUpQuestion:
      'What happens to a hardcoded rule tree every time nature introduces a valid exception like a yellow apple?',
    instructorAnswer:
      'Real-world features overlap continuously in high dimensions. Patching exceptions with nested if/else branches creates fragile logic, whereas ML learns parameters directly from data.',
    proofLabel: 'Inject Edge Cases',
    proofDescription:
      'Injects three tricky fruits (yellow apple, heavy lime, small red plum) to break if/else while the ML boundary adapts.',
  },
  {
    id: 2,
    unitId: 1,
    numberLabel: 'Chapter 02',
    shortTitle: 'Supervised, Unsupervised & RL',
    title: 'Supervised, Unsupervised & Reinforcement Learning',
    category: 'Foundations · 3 Paradigms',
    subtitle:
      'Contrast labeled learning, pattern discovery, and reward-driven agents in a live Q-Learning Gridworld.',
    keyTakeaway:
      'Supervised learns from labels (x→y), Unsupervised groups unlabeled structure (x), and Reinforcement Learning maximizes cumulative rewards via trial and error.',
    datasetTag: '3-Paradigm Switcher · 4×4 RL Gridworld',
    socraticQuestion:
      'How does a Reinforcement Learning agent learn to reach a goal without anyone ever labeling the "correct move" at each square?',
    followUpQuestion:
      'Why must an RL agent occasionally take random exploratory moves (ε > 0) instead of always picking the highest current Q-value?',
    instructorAnswer:
      'Delayed rewards propagate backward through the Bellman Q-update whenever the agent hits the goal or a hazard. Exploration (ε) prevents the agent from getting permanently stuck on a mediocre path before discovering the optimal route.',
    proofLabel: 'Train RL Agent 20 Episodes',
    proofDescription:
      'Switches to Reinforcement Learning and trains the Gridworld Q-Learning agent across 20 live episodes until optimal policy arrows emerge.',
  },
  {
    id: 3,
    unitId: 1,
    numberLabel: 'Chapter 03',
    shortTitle: 'The Training Loop',
    title: 'The Training Loop & Gradient Descent',
    category: 'Foundations · Optimization',
    subtitle:
      'Turn slope and intercept knobs to shrink residual errors, then watch Gradient Descent optimize automatically.',
    keyTakeaway:
      'Every supervised loop repeats four steps: Predict, Measure Loss, Compute Gradient, and Update Parameters.',
    datasetTag: '5-Point Calibration · MSE Loss',
    socraticQuestion:
      'When the computer adjusts slope w, how does it know whether to increase or decrease it?',
    followUpQuestion:
      'Why do we square each vertical error bar instead of adding positive and negative errors directly?',
    instructorAnswer:
      'The gradient points uphill; moving opposite to it walks downhill toward minimum loss. Squaring prevents opposite-signed errors from canceling out and penalizes large misses heavily.',
    proofLabel: 'Run Auto-Train',
    proofDescription:
      'Scrambles slope and intercept to high error, then animates Gradient Descent turning both dials into the global minimum.',
  },
  {
    id: 4,
    unitId: 1,
    numberLabel: 'Chapter 04',
    shortTitle: 'Preprocessing & Scaling',
    title: 'Data Preprocessing & Feature Scaling',
    category: 'Foundations · Data Pipeline',
    subtitle:
      'Watch mismatched feature units distort loss contours and fix them with Min-Max and Z-Score Scaling.',
    keyTakeaway:
      'Unscaled features stretch loss bowls into narrow canyons, making gradient descent zig-zag and distance models ignore small-scale columns.',
    datasetTag: 'House Area vs. Rooms · Scaling',
    socraticQuestion:
      'If Area ranges from 500 to 3,000 sq ft while Bedrooms range from 1 to 5, why does unscaled Gradient Descent bounce wildly?',
    followUpQuestion:
      'Why must scaler mean and standard deviation be fit on the Training Set only?',
    instructorAnswer:
      'Mismatched scales elongate contours into steep valleys. Fitting scalers on the full dataset leaks test distribution statistics into training.',
    proofLabel: 'Compare Unscaled vs. Standardized',
    proofDescription:
      'Runs Gradient Descent on unscaled features to show zig-zagging, then applies Z-Score Standardization for direct convergence.',
  },
  {
    id: 5,
    unitId: 2,
    numberLabel: 'Chapter 05',
    shortTitle: 'Linear Regression',
    title: 'Linear Regression & Ordinary Least Squares',
    category: 'Regression · Supervised',
    subtitle:
      'Drag points, inspect the convex MSE bowl, test learning-rate divergence, and compare Train vs. Test error.',
    keyTakeaway:
      'Gradient descent walks down the convex MSE parabola at step size α—too small crawls, too large overshoots and diverges.',
    datasetTag: 'Hours vs. Marks · Train/Test Split',
    socraticQuestion:
      'If a larger learning rate α takes bigger steps, why can setting α too high make MSE explode?',
    followUpQuestion:
      'Why should we monitor Test MSE separately from Train MSE?',
    instructorAnswer:
      'Overshooting lands higher up the opposite wall of the parabola, triggering runaway jumps. Test MSE measures generalization to unseen inputs.',
    proofLabel: 'Demonstrate α Divergence',
    proofDescription:
      'Sets learning rate α dangerously high to show bowl divergence, then resets to a stable α for smooth convergence.',
  },
  {
    id: 6,
    unitId: 2,
    numberLabel: 'Chapter 06',
    shortTitle: 'Bias–Variance & Regularization',
    title: 'Bias–Variance Tradeoff & Regularization',
    category: 'Regression · Generalization',
    subtitle:
      'Fit degree 1–9 polynomials to noisy data and tame wildly overfitting weights with Ridge (L2) and Lasso (L1).',
    keyTakeaway:
      'Too simple underfits (high bias), too complex memorizes noise (high variance), and penalty λ shrinks oversized weights.',
    datasetTag: 'Noisy Wave · Ridge (L2) & Lasso (L1)',
    socraticQuestion:
      'A degree-9 polynomial achieves nearly 0.00 Training Error. Why does it fail badly on new test points?',
    followUpQuestion:
      'How does λ·Σw² calm an oscillating curve without lowering the polynomial degree?',
    instructorAnswer:
      'Wiggling through every noisy point requires huge opposing weights. Penalizing squared weights forces smaller coefficients and smoother predictions.',
    proofLabel: 'Overfit & Tame with Ridge',
    proofDescription:
      'Sets degree to 9 with λ = 0 to expose Test MSE explosion, then raises Ridge λ to restore generalization.',
  },
  {
    id: 7,
    unitId: 3,
    numberLabel: 'Chapter 07',
    shortTitle: 'Logistic Regression',
    title: 'Logistic Regression & Decision Thresholds',
    category: 'Classification · Linear',
    subtitle:
      'Break a linear fit with an extreme outlier, squash scores with Sigmoid, and tune the Confusion Matrix threshold.',
    keyTakeaway:
      'Sigmoid maps any score cleanly to [0, 1] probabilities while resisting extreme outliers that tilt straight lines.',
    datasetTag: 'Exam Pass/Fail · Confusion Matrix',
    socraticQuestion:
      'Why does one student at X = 50 hours ruin a straight line fit yet barely move the Sigmoid curve?',
    followUpQuestion:
      'In medical screening, would you lower or raise the threshold from 0.5?',
    instructorAnswer:
      'OLS squares vertical error so X = 50 tilts the line flat; Sigmoid saturates safely near 1.0. Lowering threshold catches more positives (fewer False Negatives).',
    proofLabel: 'Extreme Outlier Test',
    proofDescription:
      'Switches to Linear Fit, drags an outlier to X = 50 to tilt the boundary, then activates Sigmoid to restore stability.',
  },
  {
    id: 8,
    unitId: 3,
    numberLabel: 'Chapter 08',
    shortTitle: 'Support Vector Machines (SVM)',
    title: 'Support Vector Machines (SVM) & Kernels',
    category: 'Classification · Maximum Margin',
    subtitle:
      'Maximize the separating street width via Support Vectors, tune Soft-Margin C, and separate rings with RBF Kernels.',
    keyTakeaway:
      'SVM picks the hyperplane with maximum margin 2/‖w‖ anchored by Support Vectors and uses Kernels for curved data.',
    datasetTag: 'Margin Street & Rings · SVM',
    socraticQuestion:
      'Why does SVM choose the single line with the widest empty margin instead of any line that achieves 100% training accuracy?',
    followUpQuestion:
      'What happens if you delete a point far from the margin versus deleting a Support Vector?',
    instructorAnswer:
      'Widest margin provides maximum safety against unseen test noise. Non-support points do not affect the boundary; moving a Support Vector shifts it immediately.',
    proofLabel: 'Soft Margin C & RBF Proof',
    proofDescription:
      'Lowers C to widen the street past an outlier, then switches to Concentric Rings where RBF Kernel separates both classes.',
  },
  {
    id: 9,
    unitId: 3,
    numberLabel: 'Chapter 09',
    shortTitle: 'KNN & Decision Trees',
    title: 'k-Nearest Neighbors & Decision Trees',
    category: 'Classification · Non-Linear',
    subtitle:
      'Compare local KNN neighborhood voting against axis-aligned Decision Tree splits on interlocking moons.',
    keyTakeaway:
      'KNN forms organic local boundaries controlled by k, while Decision Trees carve orthogonal rectangles using Information Gain.',
    datasetTag: 'Two Moons · Non-Linear Split',
    socraticQuestion:
      'At k = 1 or max_depth = 4, training accuracy hits ~100%—why does Test Accuracy drop?',
    followUpQuestion:
      'How do KNN and Decision Tree boundary shapes differ geometrically?',
    instructorAnswer:
      'Low k and deep trees memorize training noise (high variance). KNN builds smooth/organic distance regions whereas standard trees make stair-stepped axis cuts.',
    proofLabel: 'Linear Failure & Overfit',
    proofDescription:
      'Shows linear separation failing on Two Moons, then contrasts jagged k=1 overfitting with smooth k=9 generalization.',
  },
  {
    id: 10,
    unitId: 3,
    numberLabel: 'Chapter 10',
    shortTitle: 'Naive Bayes',
    title: 'Naive Bayes & Probabilistic Classifiers',
    category: 'Classification · Probabilistic',
    subtitle:
      'Tip a live Spam vs. Ham scale with word probabilities and prevent zero-frequency collapse via Laplace Smoothing.',
    keyTakeaway:
      'Naive Bayes multiplies Prior × independent word likelihoods; Laplace (+1) smoothing keeps unseen words from zeroing out predictions.',
    datasetTag: 'SMS Spam · Laplace (+1)',
    socraticQuestion:
      'Why does adding one unseen word like "CRYPTO" to a clear spam email collapse unsmoothed Naive Bayes to 0%?',
    followUpQuestion:
      'Why is conditional independence called "Naive" yet still effective for text?',
    instructorAnswer:
      'Multiplying any product chain by 0/N erases all other evidence; Laplace +1 keeps likelihoods strictly positive while preserving fast probabilistic ranking.',
    proofLabel: 'Zero-Frequency & Fix',
    proofDescription:
      'Adds unseen word "CRYPTO" to collapse Spam probability to 0%, then enables Laplace (+1) smoothing to recover.',
  },
  {
    id: 11,
    unitId: 4,
    numberLabel: 'Chapter 11',
    shortTitle: 'Ensemble Learning',
    title: 'Ensemble Learning (Random Forests & Boosting)',
    category: 'Ensembles · Variance & Bias',
    subtitle:
      'Scale from 1 noisy tree to a 15-tree Random Forest and compare against sequential AdaBoost weighting.',
    keyTakeaway:
      'Bagging (Random Forests) averages parallel trees to cut variance; Boosting chains weak stumps on hard mistakes to cut bias.',
    datasetTag: 'Noisy Clusters · Forest vs. Boost',
    socraticQuestion:
      'Why is the majority vote of 15 bootstrapped trees smoother and more accurate than a single deep tree?',
    followUpQuestion:
      'How does Boosting treat misclassified points differently from Bagging?',
    instructorAnswer:
      'Averaging diverse trees cancels random variance errors, while Boosting increases sample weights on mistakes so later stumps fix them.',
    proofLabel: '1 → 15 Trees & Boost',
    proofDescription:
      'Scales from 1 overfit tree to 15 averaged trees, then switches to Boosting rounds to show hard-point weighting.',
  },
  {
    id: 12,
    unitId: 4,
    numberLabel: 'Chapter 12',
    shortTitle: 'Unsupervised & K-Means',
    title: 'Unsupervised Learning & K-Means Clustering',
    category: 'Unsupervised · Clustering',
    subtitle:
      'Step through K-Means cluster assignment and centroid recentering to minimize unlabeled inertia.',
    keyTakeaway:
      'Without labels y, K-Means discovers natural groups by alternating nearest-centroid assignment and centroid averaging.',
    datasetTag: 'Study Habits · K-Means Inertia',
    socraticQuestion:
      'How can K-Means group records cleanly when no target labels exist?',
    followUpQuestion:
      'Why can poor random starting centroids lead K-Means to a suboptimal clustering?',
    instructorAnswer:
      'K-Means relies purely on geometric Euclidean proximity to iteratively reduce inertia; different starting centroids can settle in different local minima.',
    proofLabel: 'Run K-Means Convergence',
    proofDescription:
      'Strips labels into Unsupervised mode and steps K-Means centroids smoothly to convergence.',
  },
  {
    id: 13,
    unitId: 4,
    numberLabel: 'Chapter 13',
    shortTitle: 'Dimensionality Reduction & PCA',
    title: 'Dimensionality Reduction & PCA',
    category: 'Unsupervised · Compression',
    subtitle:
      'Rotate a 1D projection axis through 2D data to align with PC1, maximizing variance and minimizing error.',
    keyTakeaway:
      'PCA rotates axes to orthogonal covariance eigenvectors so keeping top components preserves maximum variance with minimal loss.',
    datasetTag: 'Correlated Sensors · 2D → 1D',
    socraticQuestion:
      'Why does maximizing projected variance simultaneously minimize perpendicular reconstruction error?',
    followUpQuestion:
      'What do you trade off when compressing 2 features down to PC1 alone?',
    instructorAnswer:
      'By Pythagoras, total squared norm equals projected variance plus squared orthogonal error—so maximizing one minimizes the other.',
    proofLabel: 'Snap to Optimal PC1',
    proofDescription:
      'Starts at a poor projection angle, then smoothly rotates to the exact eigenvector PC1.',
  },
  {
    id: 14,
    unitId: 5,
    numberLabel: 'Chapter 14',
    shortTitle: 'Perceptrons & Neural Nets',
    title: 'Perceptrons & Multi-Layer Neural Networks',
    category: 'Deep Learning · MLP',
    subtitle:
      'Watch a single Perceptron fail on XOR, then add a non-linear hidden layer to warp space and solve it.',
    keyTakeaway:
      'One neuron draws one straight line; hidden layers with non-linear activations (ReLU, Tanh, Sigmoid) bend feature space to solve XOR.',
    datasetTag: 'Classic XOR · 2-2-1 MLP',
    socraticQuestion:
      'Why can no single straight line ever separate the four corners of XOR?',
    followUpQuestion:
      'Can 10 stacked linear hidden layers (no ReLU/Sigmoid) solve XOR?',
    instructorAnswer:
      'XOR has diagonal matching classes. Stacking linear matrices algebraically collapses into a single linear cut—non-linear activations are essential.',
    proofLabel: 'Fail Perceptron → Solve MLP',
    proofDescription:
      'Shows single Perceptron failure on XOR, then activates the ReLU hidden layer to achieve 100% separation.',
  },
  {
    id: 15,
    unitId: 5,
    numberLabel: 'Chapter 15',
    shortTitle: 'Backpropagation & Training',
    title: 'Backpropagation & Training Deep Networks',
    category: 'Deep Learning · Chain Rule',
    subtitle:
      'Trace forward activations and backward Chain-Rule gradients live, comparing ReLU against vanishing Sigmoid gradients.',
    keyTakeaway:
      'Backpropagation applies the Chain Rule backward from loss to every earlier weight; ReLU prevents deep vanishing gradients.',
    datasetTag: 'Micro Graph · Chain Rule',
    socraticQuestion:
      'How does a weight in layer 1 know how much it caused an error at the final output?',
    followUpQuestion:
      'Why do deep Sigmoid networks suffer from vanishing gradients compared to ReLU?',
    instructorAnswer:
      'Local partial derivatives multiply backward along the graph. Sigmoid derivatives max at 0.25 and shrink exponentially across layers, whereas ReLU passes gradient 1.',
    proofLabel: 'Animate Forward & Backprop',
    proofDescription:
      'Fires Forward and Backward gradient waves and trains 14 live epochs with ReLU.',
  },
  {
    id: 16,
    unitId: 5,
    numberLabel: 'Chapter 16',
    shortTitle: 'Convolutional Neural Nets (CNNs)',
    title: 'Convolutional Neural Networks (CNNs) & Filters',
    category: 'Deep Learning · Vision',
    subtitle:
      'Slide a 3×3 filter over a live pixel grid to inspect dot-product feature maps, ReLU, and 2×2 Max Pooling.',
    keyTakeaway:
      'CNNs share small spatial kernels across an image to detect local edges and shapes efficiently, then pool features for translation invariance.',
    datasetTag: '7×7 Pixel Grid · 3×3 Kernels',
    socraticQuestion:
      'Why is sliding one shared 3×3 kernel across an image far better than connecting every pixel to every dense neuron?',
    followUpQuestion:
      'What does 2×2 Max Pooling accomplish after convolution and ReLU?',
    instructorAnswer:
      'Weight sharing cuts parameters by orders of magnitude and detects the same edge anywhere in the image. Max Pooling keeps the strongest local signal while halving spatial size.',
    proofLabel: 'Slide Vertical Edge Filter',
    proofDescription:
      'Loads a clean vertical bar image, activates the Vertical Edge kernel, and animates the 3×3 receptive field sweeping across the grid.',
  },
  {
    id: 17,
    unitId: 5,
    numberLabel: 'Chapter 17',
    shortTitle: 'Attention & Transformers',
    title: 'Attention & Intro to Transformers',
    category: 'Deep Learning · Sequence AI',
    subtitle:
      'Click any word in a sentence to see Q·K Self-Attention weights connect pronouns to context across heads.',
    keyTakeaway:
      'Self-Attention lets every token weigh every other token in parallel via softmax(QKᵀ / √d_k)V, capturing long-range context instantly.',
    datasetTag: 'Pronoun Disambiguation · Self-Attention',
    socraticQuestion:
      'In "The animal didn\'t cross the street because it was too tired" vs. "too wide", how does Self-Attention decide what "it" refers to?',
    followUpQuestion:
      'Why do Transformers run multiple parallel Attention Heads instead of just one?',
    instructorAnswer:
      'The Query vector of "it" scores high dot-product similarity with the Key vector of "animal" when paired with "tired", and shifts to "street" when paired with "wide". Multi-head attention tracks syntax and semantics simultaneously.',
    proofLabel: 'Compare "Tired" vs. "Wide"',
    proofDescription:
      'Selects "it" on the "tired" sentence highlighting "animal", then flips to "wide" so students watch the attention arc jump live to "street".',
  },
];

export function getUnitById(unitId: number): CourseUnit {
  return COURSE_UNITS.find((u) => u.id === unitId) ?? COURSE_UNITS[0];
}

export function getStageById(stageId: number): StageMeta {
  return CURRICULUM_STAGES.find((s) => s.id === stageId) ?? CURRICULUM_STAGES[0];
}
