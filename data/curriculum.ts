export interface StageMeta {
  id: number;
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

export const CURRICULUM_STAGES: StageMeta[] = [
  {
    id: 1,
    numberLabel: 'Stage 01',
    shortTitle: 'Rule-Based vs. ML',
    title: 'What is Machine Learning?',
    category: 'Intuition',
    subtitle: 'Compare brittle if/else fruit-sorting rules against a data-driven decision boundary that adapts to edge cases.',
    keyTakeaway: 'Traditional code requires explicit rules for every case; ML learns a separating boundary directly from labeled examples.',
    datasetTag: 'Fruit Sorting · 2D Features',
    socraticQuestion: 'Why is it impossible to write an explicit if/else rule for every possible image, voice command, or medical scan?',
    followUpQuestion: 'What happens to a hardcoded rule tree every time nature introduces a valid exception like a yellow apple?',
    instructorAnswer: 'Real-world features overlap continuously in high dimensions. Patching exceptions with nested if/else branches creates fragile spaghetti logic, whereas ML adjusts mathematical parameters directly from data.',
    proofLabel: 'Inject Edge Cases Live',
    proofDescription: 'Automatically injects three tricky edge-case fruits (a yellow apple, a heavy lime, and a small red plum) to break the if/else block while the ML boundary adapts.',
  },
  {
    id: 2,
    numberLabel: 'Stage 02',
    shortTitle: 'The Training Loop',
    title: 'You vs. The Algorithm',
    category: 'Optimization',
    subtitle: 'Turn manual parameter knobs to minimize vertical residual error, then watch gradient descent solve it automatically.',
    keyTakeaway: 'Every supervised training loop repeats four steps: Predict, Measure Loss, Compute Gradient, and Update Parameters.',
    datasetTag: '5-Point Calibration · MSE Loss',
    socraticQuestion: 'When the computer adjusts the slope knob w, how does it know whether to turn it clockwise or counter-clockwise?',
    followUpQuestion: 'Why do we square each vertical error bar instead of simply adding raw positive and negative errors together?',
    instructorAnswer: 'The derivative (gradient) of the loss tells the algorithm both the steepness and direction of the slope. Moving opposite to the gradient always steps downhill toward lower squared error, and squaring prevents opposite errors from canceling out.',
    proofLabel: 'Run Auto-Train Proof',
    proofDescription: 'Scrambles the slope and intercept knobs to a high-loss guess, then animates Gradient Descent visibly turning both dials into the global minimum.',
  },
  {
    id: 3,
    numberLabel: 'Stage 03',
    shortTitle: 'ML Taxonomy',
    title: 'The Big Picture Taxonomy',
    category: 'Paradigms',
    subtitle: 'Observe how the exact same 2D feature coordinates support Regression, Classification, and Unsupervised Clustering.',
    keyTakeaway: 'The input coordinates X stay consistent—the ML paradigm depends on whether you predict a continuous number, a discrete class, or discover hidden groups.',
    datasetTag: 'Study Hours & Scores · 3 Modes',
    socraticQuestion: 'If the raw feature coordinates (X) look identical, what fundamentally changes between Regression, Classification, and Unsupervised Learning?',
    followUpQuestion: 'In Unsupervised Mode, how can K-Means group students when no Pass/Fail labels exist?',
    instructorAnswer: 'The supervision signal and objective function change: Regression fits a continuous value with a confidence band, Classification draws a class-separating boundary, and Unsupervised K-Means minimizes distance to moving cluster centroids using geometry alone.',
    proofLabel: 'Cycle All 3 Paradigms',
    proofDescription: 'Walks sequentially from Regression to Classification, strips labels into Unsupervised mode, and executes K-Means centroid convergence steps.',
  },
  {
    id: 4,
    numberLabel: 'Stage 04',
    shortTitle: 'Linear Regression',
    title: 'Fitting & Loss Landscapes',
    category: 'Supervised · Regression',
    subtitle: 'Drag data points, explore the parabolic MSE loss bowl, test high learning rate divergence, and compare Train vs. Test error.',
    keyTakeaway: 'Gradient descent walks down the convex MSE bowl at step size α—too small crawls slowly, while too large overshoots and diverges.',
    datasetTag: 'Hours vs. Marks · Train/Test Split',
    socraticQuestion: 'If a larger learning rate α reaches the bottom faster, why can setting α too high actually make our error explode?',
    followUpQuestion: 'Why should we track Test MSE separately from Train MSE when dragging noisy points?',
    instructorAnswer: 'Overshooting the valley floor lands on an even steeper opposite wall of the parabola, creating a feedback loop of larger and larger jumps. Meanwhile, Test MSE evaluates how well our line generalizes to unseen students.',
    proofLabel: 'Demonstrate α Divergence',
    proofDescription: 'Sets learning rate α dangerously high to watch the marker bounce up and out of the loss bowl, then resets to a stable α to show smooth convergence.',
  },
  {
    id: 5,
    numberLabel: 'Stage 05',
    shortTitle: 'Logistic Regression',
    title: 'The Sigmoid Breakthrough',
    category: 'Supervised · Classification',
    subtitle: 'Break a linear classifier with an extreme outlier, squash outputs to [0, 1] with Sigmoid, and tune the threshold on a live Confusion Matrix.',
    keyTakeaway: 'A straight line produces invalid probabilities (<0 or >1) and collapses under extreme outliers; the Sigmoid function maps any score smoothly to [0, 1].',
    datasetTag: 'Exam Pass/Fail · Confusion Matrix',
    socraticQuestion: 'Why does adding a single super-studious student at X = 50 hours ruin a linear fit for Pass/Fail classification, yet barely move the Sigmoid curve?',
    followUpQuestion: 'In a medical screening test, would you lower or raise the classification threshold from 0.5, and which cell of the Confusion Matrix are you protecting?',
    instructorAnswer: 'OLS penalizes squared vertical distance from the line—forcing the straight line to tilt flat to chase X = 50. Sigmoid saturates smoothly at 1.0 so confident far-right points exert almost zero pull. Lowering threshold catches more positives (fewer False Negatives) at the cost of more False Positives.',
    proofLabel: 'Run Extreme Outlier Test',
    proofDescription: 'Switches to Linear Fit, drags the extreme outlier out to X = 50 to expose boundary tilt and invalid probabilities, then activates Sigmoid to restore stability.',
  },
  {
    id: 6,
    numberLabel: 'Stage 06',
    shortTitle: 'KNN & Decision Trees',
    title: 'Non-Linear Classifiers',
    category: 'Supervised · Non-Linear',
    subtitle: 'Fail with a linear cut on interlocking moons, then compare KNN neighborhood voting against synchronized orthogonal Decision Tree splits.',
    keyTakeaway: 'Non-linear boundaries require local geometry: KNN lets nearby neighbors vote (smooth vs. jagged via k), while Decision Trees recursively slice space with axis-aligned rectangles.',
    datasetTag: 'Two Moons · Train/Test Overfitting',
    socraticQuestion: 'When k = 1 in KNN or max_depth = 4 in a Decision Tree, training accuracy hits nearly 100%. Why does accuracy on the holdout Test Set actually drop?',
    followUpQuestion: 'How do the boundary shapes of KNN differ geometrically from those of a Decision Tree?',
    instructorAnswer: 'Low k and deep trees memorize isolated noise points in the training set (high variance / overfitting), hurting generalization on unseen test data. KNN forms organic distance-based contours, whereas standard Decision Trees can only make stair-stepped orthogonal cuts.',
    proofLabel: 'Prove Linear Failure & Overfit',
    proofDescription: 'First shows a straight line failing (~50% accuracy) on two moons, then reveals the Test Set and compares jagged k=1 overfitting against smooth k=9 generalization.',
  },
  {
    id: 7,
    numberLabel: 'Stage 07',
    shortTitle: 'Naive Bayes',
    title: 'Probabilistic Spam Scale',
    category: 'Supervised · Probabilistic',
    subtitle: 'Compose messages to tip a dynamic Spam vs. Ham balance scale, inspect conditional independence, and fix zero-frequency collapse with Laplace Smoothing.',
    keyTakeaway: 'Naive Bayes multiplies Prior × individual word likelihoods assuming conditional independence; Laplace (+1) smoothing prevents a single unseen word from wiping probabilities to zero.',
    datasetTag: 'SMS Spam · Laplace Smoothing (+1)',
    socraticQuestion: 'If a brand-new email contains "WINNER" and "FREE" plus one never-before-seen word like "CRYPTO", why does unsmoothed Naive Bayes collapse to 0%?',
    followUpQuestion: 'Why is the conditional independence assumption called "Naive" in human language, yet still remarkably effective for spam filtering?',
    instructorAnswer: 'Multiplying a product chain by 0/N destroys the entire posterior regardless of strong spam evidence. Adding +1 to every numerator (and +|V| to the denominator) via Laplace smoothing keeps all likelihoods positive. Independence ignores word order and phrases, avoiding combinatorial explosion while preserving accurate ranking.',
    proofLabel: 'Trigger Zero-Frequency & Fix',
    proofDescription: 'Composes a clear spam message ("WINNER", "FREE"), injects the unseen word "CRYPTO" to collapse the balance scale to 0%, then activates Laplace Smoothing (+1) to recover.',
  },
];
