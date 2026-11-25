import { computeEntropy, sigmoid } from '@/lib/ml-math';

export interface ExampleInputField {
  key: string;
  label: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  isBoolean?: boolean;
  booleanLabels?: [string, string]; // [falseLabel, trueLabel]
}

export interface ExamplePreset {
  id: string;
  title: string;
  subtitle: string;
  values: Record<string, number>;
}

export interface EvaluatedStep {
  label: string;
  math: string;
  note: string;
  highlight?: 'primary' | 'success' | 'danger' | 'amber' | 'neutral';
}

export interface ExampleEvaluation {
  steps: EvaluatedStep[];
  resultBadge: string;
  resultMetric: string;
  resultTone: 'primary' | 'success' | 'danger' | 'amber';
  conclusion: string;
}

export interface StageInteractiveExample {
  stageId: number;
  title: string;
  prompt: string;
  inputs: ExampleInputField[];
  presets: ExamplePreset[];
  evaluate: (values: Record<string, number>) => ExampleEvaluation;
}

export const STAGE_INTERACTIVE_EXAMPLES: Record<number, StageInteractiveExample> =
  {
    1: {
      stageId: 1,
      title: 'Fruit Classifier: Hardcoded Rule vs. Learned Weights',
      prompt:
        'Adjust the incoming fruit’s Weight and Redness—or pick a real-world preset below—to watch how a brittle if/else threshold compares with a learned ML score.',
      inputs: [
        {
          key: 'weight',
          label: 'Fruit Weight',
          symbol: 'x₁',
          min: 60,
          max: 250,
          step: 5,
          unit: 'g',
        },
        {
          key: 'redness',
          label: 'Redness Index',
          symbol: 'x₂',
          min: 5,
          max: 95,
          step: 1,
          unit: '%',
        },
      ],
      presets: [
        {
          id: 'red-fuji',
          title: 'Red Fuji Apple',
          subtitle: 'Classic textbook red apple',
          values: { weight: 195, redness: 84 },
        },
        {
          id: 'yellow-golden',
          title: 'Yellow Golden Apple',
          subtitle: 'Edge case that breaks if/else',
          values: { weight: 210, redness: 24 },
        },
        {
          id: 'blood-orange',
          title: 'Blood Orange (Citrus)',
          subtitle: 'Red-fleshed light citrus fruit',
          values: { weight: 105, redness: 76 },
        },
      ],
      evaluate: (v) => {
        const w1 = 0.05;
        const w2 = 0.01;
        const b = -7.5;
        const weight = v.weight ?? 210;
        const redness = v.redness ?? 24;

        const rulePred = redness >= 55 ? 'Apple' : 'Citrus';
        const term1 = w1 * weight;
        const term2 = w2 * redness;
        const z = term1 + term2 + b;
        const mlPred = z >= 0 ? 'Apple' : 'Citrus';
        const disagree = rulePred !== mlPred;

        return {
          steps: [
            {
              label: 'Evaluate Hardcoded if/else Rule',
              math: `if redness (${redness}%) >= 55%  →  ${
                redness >= 55 ? 'True (Apple)' : 'False (Citrus)'
              }`,
              note: 'Traditional code only checks one rigid color cutoff and ignores weight completely.',
              highlight: disagree ? 'danger' : 'neutral',
            },
            {
              label: 'Multiply Features by Learned ML Weights',
              math: `w₁·x₁ = (0.05)(${weight}) = ${term1.toFixed(
                2
              )}   |   w₂·x₂ = (0.01)(${redness}) = ${term2.toFixed(2)}`,
              note: 'From labeled training data, ML learned weight (0.05) matters 5× more than redness (0.01).',
              highlight: 'primary',
            },
            {
              label: 'Add Bias & Compute Final Score z',
              math: `z = ${term1.toFixed(2)} + ${term2.toFixed(
                2
              )} − 7.50 = ${z >= 0 ? '+' : ''}${z.toFixed(2)}  →  ${mlPred}`,
              note:
                z >= 0
                  ? 'Because z ≥ 0, the learned boundary places this fruit on the Apple side.'
                  : 'Because z < 0, the learned boundary places this fruit on the Citrus side.',
              highlight: 'success',
            },
          ],
          resultBadge: disagree ? 'Rule Failed · ML Adapted' : 'Both Agree',
          resultMetric: `ML: ${mlPred} (z = ${z >= 0 ? '+' : ''}${z.toFixed(2)})`,
          resultTone: disagree ? 'amber' : 'success',
          conclusion: disagree
            ? `Hardcoded code predicted ${rulePred}, while the data-driven boundary weighed both features to predict ${mlPred}.`
            : `Both approaches predict ${mlPred} here—try selecting Yellow Golden Apple or Blood Orange to watch hardcoded logic crack.`,
        };
      },
    },

    2: {
      stageId: 2,
      title: 'Calculating Mean Squared Error (MSE) Step by Step',
      prompt:
        'Test different slope (w) and intercept (b) guesses against two true data points: (x=1, y=3) and (x=3, y=7). Watch how squaring residuals changes MSE.',
      inputs: [
        {
          key: 'w',
          label: 'Slope Guess',
          symbol: 'w',
          min: 0,
          max: 3.5,
          step: 0.25,
        },
        {
          key: 'b',
          label: 'Intercept Guess',
          symbol: 'b',
          min: -1,
          max: 4,
          step: 0.25,
        },
      ],
      presets: [
        {
          id: 'bad-guess',
          title: 'Rough Initial Guess',
          subtitle: 'Line too flat (w=1.0, b=1.0)',
          values: { w: 1.0, b: 1.0 },
        },
        {
          id: 'getting-close',
          title: 'Halfway Trained',
          subtitle: 'Error shrinking fast (w=1.75, b=1.0)',
          values: { w: 1.75, b: 1.0 },
        },
        {
          id: 'exact-fit',
          title: 'Optimal Global Minimum',
          subtitle: 'Zero residual error (w=2.0, b=1.0)',
          values: { w: 2.0, b: 1.0 },
        },
      ],
      evaluate: (v) => {
        const w = v.w ?? 1.0;
        const b = v.b ?? 1.0;
        const yHat1 = w * 1 + b;
        const yHat2 = w * 3 + b;
        const e1 = yHat1 - 3;
        const e2 = yHat2 - 7;
        const mse = (e1 * e1 + e2 * e2) / 2;
        const gradW = e1 * 1 + e2 * 3; // (2/2) * sum(e_i * x_i)

        return {
          steps: [
            {
              label: 'Predict ŷ at x = 1 and x = 3',
              math: `ŷ₁ = (${w.toFixed(2)})(1) + ${b.toFixed(
                2
              )} = ${yHat1.toFixed(2)}   |   ŷ₂ = (${w.toFixed(
                2
              )})(3) + ${b.toFixed(2)} = ${yHat2.toFixed(2)}`,
              note: 'Evaluate our current straight line at both training inputs.',
              highlight: 'primary',
            },
            {
              label: 'Measure Vertical Residuals (ŷᵢ − yᵢ)',
              math: `e₁ = ${yHat1.toFixed(2)} − 3 = ${
                e1 >= 0 ? '+' : ''
              }${e1.toFixed(2)}   |   e₂ = ${yHat2.toFixed(2)} − 7 = ${
                e2 >= 0 ? '+' : ''
              }${e2.toFixed(2)}`,
              note: 'Negative means the line sits below the dot; positive means above.',
              highlight: Math.abs(e1) + Math.abs(e2) < 0.05 ? 'success' : 'danger',
            },
            {
              label: 'Square & Average for MSE Loss',
              math: `MSE = [(${e1.toFixed(2)})² + (${e2.toFixed(
                2
              )})²] / 2 = (${(e1 * e1).toFixed(2)} + ${(e2 * e2).toFixed(
                2
              )}) / 2 = ${mse.toFixed(3)}`,
              note: 'Squaring turns every miss positive and penalizes large errors quadratically.',
              highlight: mse < 0.05 ? 'success' : 'amber',
            },
            {
              label: 'Check Gradient Direction for Slope w',
              math: `∂MSE/∂w = ${gradW.toFixed(2)}  →  ${
                Math.abs(gradW) < 0.05
                  ? 'Stop! At minimum.'
                  : gradW < 0
                  ? 'Nudge w UPWARD (+)'
                  : 'Nudge w DOWNWARD (−)'
              }`,
              note: 'Gradient Descent always moves in the opposite sign of the derivative.',
              highlight: 'primary',
            },
          ],
          resultBadge:
            mse < 0.05 ? 'Optimal Fit' : mse < 1.5 ? 'Near Optimal' : 'High Error',
          resultMetric: `MSE = ${mse.toFixed(3)}`,
          resultTone: mse < 0.05 ? 'success' : mse < 1.5 ? 'amber' : 'danger',
          conclusion:
            mse < 0.05
              ? 'Zero error achieved! Both vertical residual bars vanished and the gradient reached 0.'
              : `With MSE = ${mse.toFixed(3)}, the training loop sees ∂MSE/∂w = ${gradW.toFixed(
                  2
                )} and automatically turns w ${gradW < 0 ? 'upward' : 'downward'}.`,
        };
      },
    },

    3: {
      stageId: 3,
      title: 'K-Means Unsupervised Centroid Update on Student Points',
      prompt:
        'Without any Pass/Fail labels, move Student B’s coordinates and watch how K-Means assigns points by Euclidean distance and slides Centroid μ₁ to their exact center of gravity.',
      inputs: [
        {
          key: 'bx',
          label: 'Student B Study Hours',
          symbol: 'x_B',
          min: 1,
          max: 9,
          step: 0.5,
          unit: 'h',
        },
        {
          key: 'by',
          label: 'Student B Lab Score',
          symbol: 'y_B',
          min: 10,
          max: 90,
          step: 5,
          unit: '%',
        },
      ],
      presets: [
        {
          id: 'tight-cluster',
          title: 'Tight Study Group',
          subtitle: 'Student B close to Student A (2h, 25%)',
          values: { bx: 3.0, by: 35 },
        },
        {
          id: 'mid-spread',
          title: 'Moderate Spread',
          subtitle: 'Pulls centroid diagonally up-right',
          values: { bx: 5.0, by: 55 },
        },
        {
          id: 'high-achiever',
          title: 'Switches to Cluster 2!',
          subtitle: 'Closer to High-Study Centroid μ₂ (8h, 85%)',
          values: { bx: 7.5, by: 80 },
        },
      ],
      evaluate: (v) => {
        const ax = 2.0;
        const ay = 25;
        const bx = v.bx ?? 3.0;
        const by = v.by ?? 35;

        // Compare distance from Student B to initial Centroid 1 (2.5, 30) vs Centroid 2 (8.0, 85)
        const d1 = Math.hypot(bx - 2.5, (by - 30) / 10);
        const d2 = Math.hypot(bx - 8.0, (by - 85) / 10);
        const joinsC1 = d1 <= d2;

        const newMuX = joinsC1 ? (ax + bx) / 2 : ax;
        const newMuY = joinsC1 ? (ay + by) / 2 : ay;

        return {
          steps: [
            {
              label: 'Measure Scaled Distance from Student B to Both Centroids',
              math: `d(B, μ₁) = ${d1.toFixed(2)}   vs.   d(B, μ₂) = ${d2.toFixed(
                2
              )}`,
              note: 'K-Means compares pure geometric distance—zero class labels are inspected.',
              highlight: 'primary',
            },
            {
              label: 'Assign Student B to Nearest Centroid',
              math: joinsC1
                ? `d(B, μ₁) ≤ d(B, μ₂)  →  Student B joins Cluster 1`
                : `d(B, μ₂) < d(B, μ₁)  →  Student B switches to Cluster 2!`,
              note: joinsC1
                ? 'Cluster 1 now holds both Student A (2h, 25%) and Student B.'
                : 'Student B is closer to high-study group μ₂ (8h, 85%), leaving Student A alone in Cluster 1.',
              highlight: joinsC1 ? 'success' : 'amber',
            },
            {
              label: 'Recompute Cluster 1 Center of Gravity (Mean)',
              math: joinsC1
                ? `μ₁_new = ( (${ax}+${bx})/2 , (${ay}+${by})/2 ) = (${newMuX.toFixed(
                    1
                  )}h, ${newMuY.toFixed(0)}%)`
                : `μ₁_new = (${ax.toFixed(1)}h, ${ay}%)  [Mean of remaining Cluster 1 member]`,
              note: 'Each centroid slides directly to the average coordinates of its assigned dots.',
              highlight: 'primary',
            },
          ],
          resultBadge: joinsC1 ? 'Assigned to Cluster 1' : 'Switched to Cluster 2',
          resultMetric: `μ₁ → (${newMuX.toFixed(1)}h, ${newMuY.toFixed(0)}%)`,
          resultTone: joinsC1 ? 'primary' : 'amber',
          conclusion: joinsC1
            ? `Cluster 1’s centroid smoothly re-centered to (${newMuX.toFixed(
                1
              )}h, ${newMuY.toFixed(0)}%) by averaging its unlabeled group members.`
            : 'Because Student B moved near the top-right cluster, K-Means reassigned it automatically without needing a single label.',
        };
      },
    },

    4: {
      stageId: 4,
      title: 'One Gradient Descent Step: Smooth Convergence vs. Divergence',
      prompt:
        'Suppose the true optimal slope is w* = 8.0 and our bowl curvature is J(w) = 4·(w − 8)². Change starting slope w and learning rate α to see whether the next step moves closer or explodes.',
      inputs: [
        {
          key: 'w',
          label: 'Current Slope',
          symbol: 'w_old',
          min: 0,
          max: 14,
          step: 0.5,
        },
        {
          key: 'alpha',
          label: 'Learning Rate',
          symbol: 'α',
          min: 0.01,
          max: 0.35,
          step: 0.01,
        },
      ],
      presets: [
        {
          id: 'tiny-alpha',
          title: 'Too Slow (Tiny α)',
          subtitle: 'Safe but crawls barely 0.5 units',
          values: { w: 2.0, alpha: 0.01 },
        },
        {
          id: 'sweet-spot',
          title: 'Optimal Step (Safe α)',
          subtitle: 'Walks cleanly downhill toward w* = 8',
          values: { w: 2.0, alpha: 0.08 },
        },
        {
          id: 'diverging',
          title: 'Diverging Leap (Huge α)',
          subtitle: 'Overshoots w* = 8 and climbs higher!',
          values: { w: 2.0, alpha: 0.30 },
        },
      ],
      evaluate: (v) => {
        const wOld = v.w ?? 2.0;
        const alpha = v.alpha ?? 0.08;
        const wStar = 8.0;
        const lossOld = 4 * (wOld - wStar) ** 2;
        const grad = 8 * (wOld - wStar); // derivative of 4(w-8)^2
        const stepDelta = -alpha * grad;
        const wNew = wOld + stepDelta;
        const lossNew = 4 * (wNew - wStar) ** 2;
        const diverged = lossNew > lossOld + 0.01;
        const overshot = (wOld - wStar) * (wNew - wStar) < 0;

        return {
          steps: [
            {
              label: 'Compute Current Bowl Slope (Derivative)',
              math: `∂J/∂w = 8·(${wOld.toFixed(1)} − 8.0) = ${
                grad >= 0 ? '+' : ''
              }${grad.toFixed(1)}   (Current Loss = ${lossOld.toFixed(1)})`,
              note:
                grad < 0
                  ? 'Negative slope means we stand on the left wall of the parabola.'
                  : grad > 0
                  ? 'Positive slope means we stand on the right wall of the parabola.'
                  : 'Zero slope—already standing at the bottom of the valley!',
              highlight: 'neutral',
            },
            {
              label: 'Apply Learning Rate Step Update',
              math: `w_new = ${wOld.toFixed(1)} − (${alpha.toFixed(
                2
              )})(${grad.toFixed(1)}) = ${wOld.toFixed(1)} ${
                stepDelta >= 0 ? '+' : '−'
              } ${Math.abs(stepDelta).toFixed(2)} = ${wNew.toFixed(2)}`,
              note: 'Multiply the gradient by α and subtract it from w_old.',
              highlight: diverged ? 'danger' : 'primary',
            },
            {
              label: 'Compare New Loss vs. Old Loss',
              math: `New Loss = 4·(${wNew.toFixed(
                2
              )} − 8.0)² = ${lossNew.toFixed(1)}   (${
                diverged
                  ? `WORSE by +${(lossNew - lossOld).toFixed(1)}!`
                  : `REDUCED by −${(lossOld - lossNew).toFixed(1)}`
              })`,
              note: diverged
                ? 'DIVERGENCE! The leap overshot w*=8 and landed higher up the opposite wall.'
                : overshot
                ? 'Crossed slightly past w*=8, but still landed lower in the bowl.'
                : 'Clean downhill progress directly toward the global minimum.',
              highlight: diverged ? 'danger' : 'success',
            },
          ],
          resultBadge: diverged
            ? 'Diverging (Loss Explodes!)'
            : lossNew < 2
            ? 'Near Global Minimum'
            : 'Smooth Descent',
          resultMetric: `w: ${wOld.toFixed(1)} → ${wNew.toFixed(2)}`,
          resultTone: diverged ? 'danger' : lossNew < 2 ? 'success' : 'primary',
          conclusion: diverged
            ? `At α = ${alpha.toFixed(2)}, Loss jumped from ${lossOld.toFixed(
                1
              )} up to ${lossNew.toFixed(
                1
              )}. Keep α below 0.25 here to prevent gradient explosion.`
            : `Loss dropped from ${lossOld.toFixed(1)} down to ${lossNew.toFixed(
                1
              )} in a single clean epoch.`,
        };
      },
    },

    5: {
      stageId: 5,
      title: 'Sigmoid Squash & Threshold Trade-Off Calculator',
      prompt:
        'Test any student’s Study Hours (even an extreme X = 50 outlier!) and adjust the Pass Threshold t to see how Sigmoid locks probabilities cleanly inside (0, 1).',
      inputs: [
        {
          key: 'hours',
          label: 'Student Study Hours',
          symbol: 'x',
          min: 0,
          max: 50,
          step: 1,
          unit: 'h',
        },
        {
          key: 'threshold',
          label: 'Decision Threshold',
          symbol: 't',
          min: 0.1,
          max: 0.9,
          step: 0.05,
        },
      ],
      presets: [
        {
          id: 'borderline',
          title: 'Borderline Student (6h)',
          subtitle: 'Sits right at 50% decision boundary',
          values: { hours: 6, threshold: 0.5 },
        },
        {
          id: 'confident-pass',
          title: 'Well-Prepared (8h)',
          subtitle: 'High 88.1% Pass probability',
          values: { hours: 8, threshold: 0.5 },
        },
        {
          id: 'extreme-outlier',
          title: 'Extreme Outlier (50h)',
          subtitle: 'Linear blows past 400%; Sigmoid stays ≤ 1.0',
          values: { hours: 50, threshold: 0.5 },
        },
      ],
      evaluate: (v) => {
        const x = v.hours ?? 8;
        const t = v.threshold ?? 0.5;
        const w = 1.0;
        const b = -6.0;
        const z = w * x + b;
        const prob = sigmoid(z);
        const linearBogus = 0.1 * x - 0.1; // illustrative straight line
        const pass = prob >= t;

        return {
          steps: [
            {
              label: 'Compute Linear Log-Odds Score (z = w·x + b)',
              math: `z = (1.0)(${x}) − 6.0 = ${z >= 0 ? '+' : ''}${z.toFixed(1)}`,
              note:
                x >= 25
                  ? `Notice a naive straight line would output ${(
                      linearBogus * 100
                    ).toFixed(0)}% (invalid > 100% probability!).`
                  : 'z = 0 marks the exact 50/50 midpoint at 6 study hours.',
              highlight: x >= 25 ? 'amber' : 'neutral',
            },
            {
              label: 'Apply Sigmoid Squash S(z) = 1 / (1 + e⁻ᶻ)',
              math: `S(${z.toFixed(1)}) = 1 / (1 + e^(${(-z).toFixed(
                1
              )})) = ${prob.toFixed(4)}  (${(prob * 100).toFixed(1)}%)`,
              note: 'No matter how huge or negative z gets, S(z) stays strictly inside (0%, 100%).',
              highlight: 'primary',
            },
            {
              label: 'Compare Probability Against Threshold t',
              math: `${(prob * 100).toFixed(1)}% ${pass ? '≥' : '<'} ${(
                t * 100
              ).toFixed(0)}%  →  Predict: ${pass ? 'PASS (1)' : 'FAIL (0)'}`,
              note: 'Raising threshold t makes passing stricter (fewer False Positives); lowering t increases Recall.',
              highlight: pass ? 'success' : 'danger',
            },
          ],
          resultBadge: pass ? 'Predicted: PASS' : 'Predicted: FAIL',
          resultMetric: `P(Pass) = ${(prob * 100).toFixed(1)}%`,
          resultTone: pass ? 'success' : 'danger',
          conclusion:
            x >= 25
              ? `Even at an extreme X = ${x} hours, Sigmoid saturates cleanly at ${(
                  prob * 100
                ).toFixed(2)}% without breaking the classifier.`
              : `With P(Pass) = ${(prob * 100).toFixed(1)}% and threshold ${(
                  t * 100
                ).toFixed(0)}%, the model classifies this student as ${
                  pass ? 'PASS' : 'FAIL'
                }.`,
        };
      },
    },

    6: {
      stageId: 6,
      title: 'Decision Tree Node Impurity: Shannon Entropy Calculator',
      prompt:
        'Adjust how many Class A and Class B dots fall inside a rectangular tree box to see how Shannon Entropy measures purity (0.0 bits = pure leaf, 1.0 bits = maximum 50/50 disorder).',
      inputs: [
        {
          key: 'c0',
          label: 'Class A Dots in Box',
          symbol: 'n₀',
          min: 0,
          max: 12,
          step: 1,
        },
        {
          key: 'c1',
          label: 'Class B Dots in Box',
          symbol: 'n₁',
          min: 0,
          max: 12,
          step: 1,
        },
      ],
      presets: [
        {
          id: 'pure-leaf',
          title: 'Pure Leaf Box (8A / 0B)',
          subtitle: 'Zero uncertainty — stop splitting!',
          values: { c0: 8, c1: 0 },
        },
        {
          id: 'mostly-pure',
          title: 'Skewed Split (3A / 1B)',
          subtitle: 'Classic exam calculation (0.811 bits)',
          values: { c0: 3, c1: 1 },
        },
        {
          id: 'max-chaos',
          title: '50/50 Mixed Box (5A / 5B)',
          subtitle: 'Maximum 1.000-bit entropy — needs cut',
          values: { c0: 5, c1: 5 },
        },
      ],
      evaluate: (v) => {
        const c0 = Math.max(0, Math.round(v.c0 ?? 3));
        const c1 = Math.max(0, Math.round(v.c1 ?? 1));
        const total = c0 + c1;
        if (total === 0) {
          return {
            steps: [
              {
                label: 'Empty Box',
                math: 'Total = 0 points → Entropy H(S) = 0.000 bits',
                note: 'Add at least one Class A or Class B point to compute impurity.',
                highlight: 'neutral',
              },
            ],
            resultBadge: 'Empty Box',
            resultMetric: 'H = 0.000 bits',
            resultTone: 'amber',
            conclusion: 'Increase Class A or Class B counts above 0 to evaluate entropy.',
          };
        }

        const p0 = c0 / total;
        const p1 = c1 / total;
        const h = computeEntropy(c0, c1);
        const majority = c0 >= c1 ? 'Class A' : 'Class B';
        const term0 = p0 > 0 ? -p0 * Math.log2(p0) : 0;
        const term1 = p1 > 0 ? -p1 * Math.log2(p1) : 0;

        return {
          steps: [
            {
              label: 'Compute Class Proportions Inside Box',
              math: `p₀ = ${c0}/${total} = ${p0.toFixed(
                3
              )}   |   p₁ = ${c1}/${total} = ${p1.toFixed(3)}`,
              note: 'Proportions always sum to 1.000 across both classes.',
              highlight: 'primary',
            },
            {
              label: 'Compute Base-2 Log Terms (−p · log₂ p)',
              math: `−p₀·log₂(p₀) = ${term0.toFixed(
                3
              )}   |   −p₁·log₂(p₁) = ${term1.toFixed(3)}`,
              note: 'If a class count is 0, its contribution is defined as 0 bits.',
              highlight: 'neutral',
            },
            {
              label: 'Sum for Total Shannon Entropy H(S)',
              math: `H(S) = ${term0.toFixed(3)} + ${term1.toFixed(
                3
              )} = ${h.toFixed(3)} bits   (Majority: ${majority})`,
              note:
                h < 0.01
                  ? 'Perfectly pure leaf! No further splits are needed.'
                  : h > 0.95
                  ? 'Near maximum chaos (1.0 bit)—the tree strongly prioritizes splitting this box.'
                  : 'Moderate impurity—another orthogonal split can still gain information.',
              highlight: h < 0.01 ? 'success' : h > 0.9 ? 'danger' : 'amber',
            },
          ],
          resultBadge:
            h < 0.01
              ? 'Pure Leaf (Stop)'
              : h > 0.9
              ? 'High Disorder (Split!)'
              : 'Partially Pure',
          resultMetric: `H(S) = ${h.toFixed(3)} bits`,
          resultTone: h < 0.01 ? 'success' : h > 0.9 ? 'danger' : 'amber',
          conclusion:
            h < 0.01
              ? `Every point belongs to ${majority}, giving H(S) = 0.000 bits.`
              : `Entropy is ${h.toFixed(
                  3
                )} bits. A child split that separates Class A and Class B cleanly yields Information Gain up to +${h.toFixed(
                  3
                )} bits.`,
        };
      },
    },

    7: {
      stageId: 7,
      title: 'Naive Bayes Zero-Frequency Collapse & Laplace (+1) Recovery',
      prompt:
        'Set how many times an incoming test word appeared in past Spam emails (try 0 for an unseen word like "CRYPTO") and toggle Laplace Smoothing (+1) to watch the probability rescue.',
      inputs: [
        {
          key: 'seenCount',
          label: 'Count of 2nd Word in Spam Corpus',
          symbol: 'c(w₂)',
          min: 0,
          max: 20,
          step: 1,
        },
        {
          key: 'laplace',
          label: 'Laplace Smoothing',
          symbol: 'α',
          min: 0,
          max: 1,
          step: 1,
          isBoolean: true,
          booleanLabels: ['OFF (α = 0)', 'ON (α = +1)'],
        },
      ],
      presets: [
        {
          id: 'known-spam',
          title: 'Known Word ("FREE", 22x)',
          subtitle: 'Strong Spam multiplier works fine',
          values: { seenCount: 16, laplace: 0 },
        },
        {
          id: 'zero-collapse',
          title: 'Unseen Word ("CRYPTO", 0x) · α=0',
          subtitle: 'Fatal Zero-Frequency Collapse!',
          values: { seenCount: 0, laplace: 0 },
        },
        {
          id: 'laplace-fix',
          title: 'Unseen Word ("CRYPTO", 0x) · α=+1',
          subtitle: 'Laplace (+1) rescues Spam score',
          values: { seenCount: 0, laplace: 1 },
        },
      ],
      evaluate: (v) => {
        const c2 = Math.max(0, Math.round(v.seenCount ?? 0));
        const alpha = v.laplace ? 1 : 0;
        const priorSpam = 0.4;
        const totalSpam = 80;
        const vocab = 10;
        const cWinner = 18;

        const denom = totalSpam + alpha * vocab;
        const pWinner = (cWinner + alpha) / denom;
        const pWord2 = (c2 + alpha) / denom;
        const scoreSpam = priorSpam * pWinner * pWord2;
        const collapsed = scoreSpam === 0;

        return {
          steps: [
            {
              label: 'Likelihood of Strong Word "WINNER" (18 Spam counts)',
              math: `P("WINNER" | Spam) = (${cWinner} + ${alpha}) / (${totalSpam} + ${
                alpha * vocab
              }) = ${pWinner.toFixed(4)}`,
              note:
                alpha === 1
                  ? 'Laplace adds +1 to numerator and +|V| (+10) to denominator.'
                  : 'Raw count divided by total Spam words (80).',
              highlight: 'primary',
            },
            {
              label: `Likelihood of 2nd Word (${c2} Spam counts)`,
              math: `P(w₂ | Spam) = (${c2} + ${alpha}) / (${totalSpam} + ${
                alpha * vocab
              }) = ${pWord2.toFixed(4)}`,
              note:
                pWord2 === 0
                  ? 'ZERO LIKELIHOOD! This single 0 will annihilate the entire product chain.'
                  : alpha === 1 && c2 === 0
                  ? 'Laplace gives the unseen word a small non-zero floor (1/90 = 0.0111) instead of 0!'
                  : 'Positive likelihood keeps evidence alive in the product chain.',
              highlight: pWord2 === 0 ? 'danger' : 'success',
            },
            {
              label: 'Multiply Prior × Word 1 × Word 2',
              math: `Score(Spam) = 0.40 × ${pWinner.toFixed(
                4
              )} × ${pWord2.toFixed(4)} = ${scoreSpam.toExponential(2)}`,
              note: collapsed
                ? 'Entire Spam score collapsed to 0.00 despite "WINNER" being in the email!'
                : 'Positive posterior score preserved—ready to compare fairly on the Ham/Spam balance scale.',
              highlight: collapsed ? 'danger' : 'success',
            },
          ],
          resultBadge: collapsed
            ? 'Zero-Frequency Collapse!'
            : alpha === 1 && c2 === 0
            ? 'Rescued by Laplace (+1)'
            : 'Valid Posterior Score',
          resultMetric: `Score = ${scoreSpam.toExponential(2)}`,
          resultTone: collapsed ? 'danger' : 'success',
          conclusion: collapsed
            ? 'Because α = 0 and count(w₂) = 0, multiplying by zero wiped out all Spam evidence. Flip Laplace Smoothing ON (+1) to fix it immediately.'
            : alpha === 1 && c2 === 0
            ? 'Laplace (+1) kept Score(Spam) > 0 so strong Spam cues like "WINNER" still win the classification.'
            : 'All word likelihoods are strictly positive, allowing Naive Bayes to weigh every clue cleanly.',
        };
      },
    },
  };
