import type { StageInteractiveExample } from '@/data/interactiveExamples';

export const NEW_STAGE_INTERACTIVE_EXAMPLES: Record<number, StageInteractiveExample> = {
  3: {
    stageId: 3,
    title: 'Standardizing Mixed House Features (Area vs. Bedrooms)',
    prompt:
      'Change a house’s raw Square Footage and Bedroom Count to see how Z-Score Standardization and Min-Max Normalization place drastically different units onto the same scale.',
    inputs: [
      { key: 'area', label: 'House Area', symbol: 'x₁', min: 750, max: 2950, step: 50, unit: ' ft²' },
      { key: 'beds', label: 'Bedrooms', symbol: 'x₂', min: 1, max: 5, step: 1, unit: ' bd' },
    ],
    presets: [
      { id: 'starter-apt', title: 'Compact Studio', subtitle: 'Small area, 1 bedroom', values: { area: 850, beds: 1 } },
      { id: 'family-home', title: 'Typical Family Home', subtitle: 'Near training average', values: { area: 1850, beds: 3 } },
      { id: 'luxury-villa', title: 'Large Residence', subtitle: 'Upper scale outlier test', values: { area: 2900, beds: 5 } },
    ],
    evaluate: (v) => {
      const area = v.area ?? 1850;
      const beds = v.beds ?? 3;
      const muA = 1794, sdA = 710, minA = 750, maxA = 2950;
      const muB = 3.0, sdB = 1.22, minB = 1, maxB = 5;

      const zA = (area - muA) / sdA;
      const zB = (beds - muB) / sdB;
      const mmA = (area - minA) / (maxA - minA);
      const mmB = (beds - minB) / (maxB - minB);
      const rawRatio = area / Math.max(1, beds);

      return {
        steps: [
          {
            label: 'Inspect Raw Unscaled Ratio',
            math: `Area = ${area} ft²  vs.  Bedrooms = ${beds}  (Scale gap ≈ ${rawRatio.toFixed(0)}×)`,
            note: 'Raw Area is hundreds of times larger numerically, stretching Gradient Descent contours into a steep canyon.',
            highlight: 'danger',
          },
          {
            label: 'Compute Z-Score Standardization (x − μ) / σ',
            math: `z_area = (${area} − ${muA}) / ${sdA} = ${zA >= 0 ? '+' : ''}${zA.toFixed(2)}   |   z_beds = (${beds} − ${muB}) / ${sdB} = ${zB >= 0 ? '+' : ''}${zB.toFixed(2)}`,
            note: 'Both columns now center at 0 with standard deviation 1—no single unit dominates optimization.',
            highlight: 'primary',
          },
          {
            label: 'Compare Min-Max Normalization [0, 1]',
            math: `mm_area = ${(mmA * 100).toFixed(1)}% (${mmA.toFixed(2)})   |   mm_beds = ${(mmB * 100).toFixed(1)}% (${mmB.toFixed(2)})`,
            note: 'Bounded neatly between 0.00 and 1.00—great for image pixels or neural inputs without extreme outliers.',
            highlight: 'success',
          },
        ],
        resultBadge: 'Scale Balanced (≈ 1:1)',
        resultMetric: `z = [${zA >= 0 ? '+' : ''}${zA.toFixed(2)}, ${zB >= 0 ? '+' : ''}${zB.toFixed(2)}]`,
        resultTone: 'success',
        conclusion:
          'Standardizing both features eliminates the ~600× unit imbalance so Gradient Descent, KNN, SVM, and PCA weigh Area and Bedrooms fairly.',
      };
    },
  },

  5: {
    stageId: 5,
    title: 'Regularization Penalty Calculator: Ridge (L2) vs. Lasso (L1)',
    prompt:
      'Tune the Regularization Penalty λ and inspect how L2 (Ridge) and L1 (Lasso) penalize oversized weights from an overfitted model.',
    inputs: [
      { key: 'w1', label: 'Primary Weight', symbol: 'w₁', min: 0.5, max: 12, step: 0.5 },
      { key: 'w2', label: 'Noisy Weight', symbol: 'w₂', min: 0, max: 10, step: 0.5 },
      { key: 'lambda', label: 'Penalty Strength', symbol: 'λ', min: 0, max: 1.0, step: 0.05 },
    ],
    presets: [
      { id: 'unreg', title: 'Unregularized Overfit', subtitle: 'λ = 0 allows huge wild weights', values: { w1: 10, w2: 8.5, lambda: 0 } },
      { id: 'balanced', title: 'Balanced Regularization', subtitle: 'Moderate λ punishes giant weights', values: { w1: 2.0, w2: 0.5, lambda: 0.15 } },
      { id: 'heavy', title: 'Heavy Penalty (High Bias)', subtitle: 'Huge λ forces weights near zero', values: { w1: 1.0, w2: 0.0, lambda: 0.85 } },
    ],
    evaluate: (v) => {
      const w1 = v.w1 ?? 2.0;
      const w2 = v.w2 ?? 0.5;
      const lam = v.lambda ?? 0.15;
      const baseMse = 0.14;
      const l2Term = w1 * w1 + w2 * w2;
      const l1Term = Math.abs(w1) + Math.abs(w2);
      const ridgeLoss = baseMse + lam * l2Term;
      const lassoLoss = baseMse + lam * l1Term;

      return {
        steps: [
          {
            label: 'Measure Raw Weight Complexity',
            math: `L2 Norm² = ${w1.toFixed(1)}² + ${w2.toFixed(1)}² = ${l2Term.toFixed(2)}   |   L1 Norm = |${w1.toFixed(1)}| + |${w2.toFixed(1)}| = ${l1Term.toFixed(2)}`,
            note: 'Notice how squaring explodes when weights are large (10² = 100), flagging wiggly overfit curves immediately.',
            highlight: l2Term > 50 ? 'danger' : 'neutral',
          },
          {
            label: 'Compute Ridge (L2) Regularized Loss',
            math: `L_Ridge = ${baseMse.toFixed(2)} + ${lam.toFixed(2)} × ${l2Term.toFixed(2)} = ${ridgeLoss.toFixed(2)}`,
            note: lam === 0 ? 'With λ = 0, regularization is OFF—large weights pay zero penalty!' : 'Ridge shrinks both weights smoothly without hard-deleting features.',
            highlight: lam === 0 && l2Term > 40 ? 'danger' : 'primary',
          },
          {
            label: 'Compute Lasso (L1) Regularized Loss',
            math: `L_Lasso = ${baseMse.toFixed(2)} + ${lam.toFixed(2)} × ${l1Term.toFixed(2)} = ${lassoLoss.toFixed(2)}`,
            note: 'Because L1 has a sharp corner at 0, optimizing it drives noisy weight w₂ all the way to exact 0.0.',
            highlight: 'success',
          },
        ],
        resultBadge: lam === 0 ? 'Unregularized' : lam > 0.6 ? 'Strong Shrinkage' : 'Balanced Penalty',
        resultMetric: `Ridge = ${ridgeLoss.toFixed(2)} · Lasso = ${lassoLoss.toFixed(2)}`,
        resultTone: lam === 0 && l2Term > 40 ? 'danger' : lam > 0.6 ? 'amber' : 'success',
        conclusion:
          lam === 0
            ? 'At λ = 0, the optimizer chases training noise with huge weights. Raise λ slightly to penalize complexity.'
            : 'Regularization adds a smooth complexity tax so the model prefers calm, generalizable weights over wild oscillations.',
      };
    },
  },

  7: {
    stageId: 7,
    title: 'SVM Geometric Margin Width & Soft-Margin Tradeoff',
    prompt:
      'Adjust weight vector magnitude ‖w‖, violation slack ξ, and penalty C to see how SVM balances maximizing street width 2/‖w‖ against tolerating noisy margin violations.',
    inputs: [
      { key: 'normW', label: 'Weight Norm', symbol: '‖w‖', min: 0.4, max: 3.0, step: 0.1 },
      { key: 'slack', label: 'Margin Violation Slack', symbol: 'ξ', min: 0, max: 2.0, step: 0.1 },
      { key: 'cVal', label: 'Soft-Margin Penalty', symbol: 'C', min: 0.2, max: 10.0, step: 0.2 },
    ],
    presets: [
      { id: 'wide-clean', title: 'Wide Clean Street', subtitle: 'Small ‖w‖, zero violations', values: { normW: 0.6, slack: 0.0, cVal: 1.0 } },
      { id: 'soft-tolerate', title: 'Soft Margin (Low C)', subtitle: 'Tolerates 1 outlier to keep margin wide', values: { normW: 0.7, slack: 0.8, cVal: 0.4 } },
      { id: 'strict-narrow', title: 'Strict Margin (High C)', subtitle: 'Chases outlier, narrows street', values: { normW: 2.4, slack: 0.1, cVal: 8.0 } },
    ],
    evaluate: (v) => {
      const normW = v.normW ?? 0.7;
      const slack = v.slack ?? 0.8;
      const cVal = v.cVal ?? 0.4;
      const margin = 2 / normW;
      const regCost = 0.5 * normW * normW;
      const violationCost = cVal * slack;
      const totalObj = regCost + violationCost;

      return {
        steps: [
          {
            label: 'Calculate Geometric Margin Width (2 / ‖w‖)',
            math: `Margin Width = 2 / ${normW.toFixed(1)} = ${margin.toFixed(2)} units`,
            note: 'Smaller ‖w‖ creates a wider empty safety street between opposite-class Support Vectors.',
            highlight: margin >= 2.0 ? 'success' : 'amber',
          },
          {
            label: 'Evaluate Margin Complexity Cost (½‖w‖²)',
            math: `½ · (${normW.toFixed(1)})² = ${regCost.toFixed(2)}`,
            note: 'SVM minimizes ½‖w‖² directly to push the two gutter lines as far apart as possible.',
            highlight: 'primary',
          },
          {
            label: 'Add Soft-Margin Violation Tax (C · ξ)',
            math: `Total Objective = ${regCost.toFixed(2)} + (${cVal.toFixed(1)})(${slack.toFixed(1)}) = ${totalObj.toFixed(2)}`,
            note:
              cVal >= 5 && slack > 0.5
                ? 'High C heavily punishes the violation, forcing the boundary to bend toward the outlier!'
                : 'Low C keeps the violation affordable so the wide street stays intact.',
            highlight: totalObj > 5 ? 'danger' : 'success',
          },
        ],
        resultBadge: margin >= 2.0 ? 'Wide Safe Margin' : 'Narrow Margin',
        resultMetric: `Margin = ${margin.toFixed(2)} · Obj = ${totalObj.toFixed(2)}`,
        resultTone: margin >= 2.0 ? 'success' : 'amber',
        conclusion:
          'Tune C to navigate the classic SVM bias–variance trade-off: smaller C widens the street for noisy data, while larger C enforces tighter training accuracy.',
      };
    },
  },

  10: {
    stageId: 10,
    title: 'Ensemble Variance Reduction & AdaBoost Stump Weighting',
    prompt:
      'Compare how growing a Random Forest shrinks variance (~σ²/M) and how AdaBoost assigns voting trust α to a weak learner based on its error rate ε.',
    inputs: [
      { key: 'trees', label: 'Forest Size (Trees)', symbol: 'M', min: 1, max: 25, step: 1 },
      { key: 'err', label: 'Weak Stump Error Rate', symbol: 'ε', min: 0.05, max: 0.48, step: 0.01 },
    ],
    presets: [
      { id: 'single-tree', title: 'Single Unstable Tree', subtitle: 'M = 1, high prediction variance', values: { trees: 1, err: 0.35 } },
      { id: 'forest-15', title: '15-Tree Random Forest', subtitle: 'Dramatic variance collapse', values: { trees: 15, err: 0.20 } },
      { id: 'strong-stump', title: 'Accurate Boosting Round', subtitle: 'Low ε earns high trust weight α', values: { trees: 20, err: 0.10 } },
    ],
    evaluate: (v) => {
      const m = Math.max(1, Math.round(v.trees ?? 15));
      const eps = Math.min(0.49, Math.max(0.05, v.err ?? 0.2));
      const singleVar = 1.0;
      const rho = 0.15; // realistic tree correlation
      const ensVar = singleVar * (rho + (1 - rho) / m);
      const varDropPct = (1 - ensVar / singleVar) * 100;
      const alpha = 0.5 * Math.log((1 - eps) / eps);
      const boostFactor = Math.exp(alpha);

      return {
        steps: [
          {
            label: 'Bagging Variance Reduction (M Bootstrapped Trees)',
            math: `Var(Forest) = ρσ² + (1−ρ)σ² / ${m} = ${ensVar.toFixed(3)}  (−${varDropPct.toFixed(1)}% variance)`,
            note: 'Averaging independent bootstrapped trees dramatically cuts unstable tree-to-tree swings.',
            highlight: m >= 10 ? 'success' : 'amber',
          },
          {
            label: 'AdaBoost Stump Voting Weight α = ½ ln((1−ε)/ε)',
            math: `α = 0.5 × ln(${(1 - eps).toFixed(2)} / ${eps.toFixed(2)}) = +${alpha.toFixed(3)}`,
            note: 'A stump near 50% random guessing gets α ≈ 0; an accurate stump earns strong voting power.',
            highlight: 'primary',
          },
          {
            label: 'Hard-Sample Upweighting for Next Round',
            math: `Misclassified point weight multiplier = exp(+${alpha.toFixed(2)}) = ${boostFactor.toFixed(2)}×`,
            note: 'Next round’s stump focuses sharply on the points missed in this round.',
            highlight: 'success',
          },
        ],
        resultBadge: m === 1 ? 'Single Tree (High Variance)' : `${m}-Tree Ensemble`,
        resultMetric: `−${varDropPct.toFixed(0)}% Var · α = ${alpha.toFixed(2)}`,
        resultTone: m >= 10 ? 'success' : 'amber',
        conclusion:
          'Bagging averages parallel diverse trees to eliminate variance, while Boosting upweights hard examples sequentially to eliminate bias.',
      };
    },
  },

  12: {
    stageId: 12,
    title: 'PCA Explained Variance & Compression Trade-Off',
    prompt:
      'Adjust the top two covariance eigenvalues (λ₁ along PC1 and λ₂ along PC2) to see how much information is preserved when projecting 2D data down to 1D.',
    inputs: [
      { key: 'l1', label: 'PC1 Variance (Eigenvalue)', symbol: 'λ₁', min: 1.0, max: 6.0, step: 0.2 },
      { key: 'l2', label: 'PC2 Variance (Eigenvalue)', symbol: 'λ₂', min: 0.1, max: 3.0, step: 0.1 },
    ],
    presets: [
      { id: 'tight-corr', title: 'Highly Correlated Sensors', subtitle: 'Tight diagonal cloud (ideal for PCA)', values: { l1: 4.8, l2: 0.2 } },
      { id: 'moderate-corr', title: 'Moderate Correlation', subtitle: 'Noticeable spread along PC2', values: { l1: 3.6, l2: 0.9 } },
      { id: 'round-cloud', title: 'Uncorrelated Round Cloud', subtitle: 'Equal variance in both axes', values: { l1: 2.2, l2: 2.0 } },
    ],
    evaluate: (v) => {
      const l1 = Math.max(v.l1 ?? 3.6, v.l2 ?? 0.9);
      const l2 = Math.min(v.l1 ?? 3.6, v.l2 ?? 0.9);
      const total = l1 + l2;
      const evr1 = (l1 / total) * 100;
      const lossPct = (l2 / total) * 100;

      return {
        steps: [
          {
            label: 'Sum Total Dataset Variance',
            math: `Total Variance = λ₁ + λ₂ = ${l1.toFixed(2)} + ${l2.toFixed(2)} = ${total.toFixed(2)}`,
            note: 'The sum of eigenvalues always equals the total variance across the original coordinates.',
            highlight: 'neutral',
          },
          {
            label: 'Calculate Explained Variance Ratio (Keep PC1 Only)',
            math: `EVR₁ = ${l1.toFixed(2)} / ${total.toFixed(2)} = ${evr1.toFixed(1)}% retained`,
            note: 'Compressing 2D → 1D cuts storage by 50% while retaining this percentage of total variance.',
            highlight: evr1 >= 85 ? 'success' : 'amber',
          },
          {
            label: 'Measure Mean Squared Reconstruction Error',
            math: `Dropped PC2 Variance = λ₂ = ${l2.toFixed(2)} (${lossPct.toFixed(1)}% lost)`,
            note:
              lossPct <= 15
                ? 'Minimal information loss—dropping PC2 removes mostly measurement noise.'
                : 'High information loss—both dimensions carry essential structure.',
            highlight: lossPct <= 15 ? 'primary' : 'danger',
          },
        ],
        resultBadge: evr1 >= 85 ? 'Clean 2D → 1D Compression' : 'Keep Both Axes',
        resultMetric: `EVR₁ = ${evr1.toFixed(1)}%`,
        resultTone: evr1 >= 85 ? 'success' : 'amber',
        conclusion:
          evr1 >= 85
            ? 'PC1 captures nearly all geometric signal, making 1D compression accurate and lightweight.'
            : 'When λ₁ and λ₂ are close, the cloud is circular and compressing to 1D discards substantial information.',
      };
    },
  },

  13: {
    stageId: 13,
    title: 'Solving XOR: Single Neuron vs. 2-Neuron ReLU Hidden Layer',
    prompt:
      'Pick any of the four XOR input corners (x₁, x₂) to trace how two ReLU hidden neurons warp the input into a linearly separable representation.',
    inputs: [
      { key: 'x1', label: 'Input Bit 1', symbol: 'x₁', min: 0, max: 1, step: 1, isBoolean: true, booleanLabels: ['0 (Off)', '1 (On)'] },
      { key: 'x2', label: 'Input Bit 2', symbol: 'x₂', min: 0, max: 1, step: 1, isBoolean: true, booleanLabels: ['0 (Off)', '1 (On)'] },
    ],
    presets: [
      { id: 'xor-00', title: 'Corner (0, 0) → 0', subtitle: 'Both inputs off', values: { x1: 0, x2: 0 } },
      { id: 'xor-10', title: 'Corner (1, 0) → 1', subtitle: 'Exactly one input on', values: { x1: 1, x2: 0 } },
      { id: 'xor-11', title: 'Corner (1, 1) → 0', subtitle: 'Tricky corner that breaks Perceptrons', values: { x1: 1, x2: 1 } },
    ],
    evaluate: (v) => {
      const x1 = v.x1 >= 1 ? 1 : 0;
      const x2 = v.x2 >= 1 ? 1 : 0;
      const trueXor = x1 ^ x2;
      const z1 = x1 + x2 - 0.5;
      const z2 = x1 + x2 - 1.5;
      const h1 = Math.max(0, z1);
      const h2 = Math.max(0, z2);
      const zOut = 6 * h1 - 12 * h2 - 1.2;
      const prob = 1 / (1 + Math.exp(-zOut));
      const pred = prob >= 0.5 ? 1 : 0;

      return {
        steps: [
          {
            label: 'Hidden Neuron 1 (OR-Detector with ReLU)',
            math: `h₁ = ReLU(${x1} + ${x2} − 0.5) = ReLU(${z1.toFixed(1)}) = ${h1.toFixed(1)}`,
            note: 'Fires whenever at least one input is 1.',
            highlight: h1 > 0 ? 'primary' : 'neutral',
          },
          {
            label: 'Hidden Neuron 2 (AND-Detector with ReLU)',
            math: `h₂ = ReLU(${x1} + ${x2} − 1.5) = ReLU(${z2.toFixed(1)}) = ${h2.toFixed(1)}`,
            note: 'Fires ONLY when both x₁ = 1 and x₂ = 1 so it can cancel out the (1, 1) corner!',
            highlight: h2 > 0 ? 'amber' : 'neutral',
          },
          {
            label: 'Output Neuron Combines Hidden Features',
            math: `z_out = 6(${h1.toFixed(1)}) − 12(${h2.toFixed(1)}) − 1.2 = ${zOut.toFixed(1)}  →  ŷ = σ(z_out) = ${(prob * 100).toFixed(1)}%`,
            note: `Predicted class ${pred} matches true XOR(${x1}, ${x2}) = ${trueXor} cleanly!`,
            highlight: 'success',
          },
        ],
        resultBadge: `Matches XOR = ${trueXor}`,
        resultMetric: `ŷ = ${(prob * 100).toFixed(1)}% → Class ${pred}`,
        resultTone: 'success',
        conclusion:
          'By combining an excitatory OR neuron (+6·h₁) with an inhibitory AND neuron (−12·h₂), the hidden layer bends space and solves XOR at 100% accuracy.',
      };
    },
  },

  14: {
    stageId: 14,
    title: 'Chain-Rule Backpropagation Step Calculator',
    prompt:
      'Edit the input x, hidden weight w₁, output weight w₂, and activation choice to compute exact Forward Pass values and Chain-Rule gradients ∂L/∂w₁.',
    inputs: [
      { key: 'w1', label: 'Layer 1 Weight', symbol: 'w₁', min: -1.5, max: 2.0, step: 0.1 },
      { key: 'w2', label: 'Layer 2 Weight', symbol: 'w₂', min: 0.2, max: 2.0, step: 0.1 },
      { key: 'useRelu', label: 'Hidden Activation', symbol: 'φ', min: 0, max: 1, step: 1, isBoolean: true, booleanLabels: ['Sigmoid', 'ReLU'] },
    ],
    presets: [
      { id: 'healthy-relu', title: 'Healthy ReLU Flow', subtitle: 'Clean derivative ∂h/∂z₁ = 1.0', values: { w1: 0.5, w2: 0.8, useRelu: 1 } },
      { id: 'vanishing-sig', title: 'Saturated Sigmoid', subtitle: 'Tiny ∂h/∂z₁ shrinks gradient', values: { w1: 1.8, w2: 0.8, useRelu: 0 } },
      { id: 'dead-relu', title: 'Negative ("Dead") ReLU', subtitle: 'z₁ ≤ 0 blocks gradient flow', values: { w1: -0.6, w2: 0.8, useRelu: 1 } },
    ],
    evaluate: (v) => {
      const x = 2.0;
      const target = 1.0;
      const w1 = v.w1 ?? 0.5;
      const w2 = v.w2 ?? 0.8;
      const useRelu = (v.useRelu ?? 1) >= 1;
      const z1 = w1 * x;
      const h = useRelu ? Math.max(0, z1) : 1 / (1 + Math.exp(-z1));
      const yHat = w2 * h;
      const err = yHat - target;
      const loss = 0.5 * err * err;
      const dhDz = useRelu ? (z1 > 0 ? 1 : 0) : h * (1 - h);
      const dLdw2 = err * h;
      const dLdw1 = err * w2 * dhDz * x;
      const lr = 0.15;
      const nextW1 = w1 - lr * dLdw1;

      return {
        steps: [
          {
            label: 'Forward Pass & Squared Error Loss',
            math: `z₁ = ${z1.toFixed(2)} → h = ${h.toFixed(3)} → ŷ = ${yHat.toFixed(3)}   |   L = ½(ŷ − 1)² = ${loss.toFixed(4)}`,
            note: 'Compute activations left-to-right and measure distance to target y = 1.0.',
            highlight: 'primary',
          },
          {
            label: 'Backward Chain Rule to Layer 1 Weight w₁',
            math: `∂L/∂w₁ = (${err.toFixed(3)}) × w₂(${w2.toFixed(1)}) × φ′(${dhDz.toFixed(3)}) × x(2.0) = ${dLdw1.toFixed(4)}`,
            note:
              Math.abs(dhDz) < 0.08
                ? 'Warning: activation derivative φ′ is tiny/zero, choking the gradient reaching w₁!'
                : `Healthy local derivative φ′ = ${dhDz.toFixed(2)} carries strong error signal back to w₁ (∂L/∂w₂ = ${dLdw2.toFixed(3)}).`,
            highlight: Math.abs(dhDz) < 0.08 ? 'danger' : 'success',
          },
          {
            label: 'Apply Gradient Descent Update (α = 0.15)',
            math: `w₁_new = ${w1.toFixed(2)} − 0.15 × (${dLdw1.toFixed(4)}) = ${nextW1.toFixed(3)}`,
            note: 'Every epoch repeats Forward → Backward → Update until Loss approaches zero.',
            highlight: 'neutral',
          },
        ],
        resultBadge: Math.abs(dhDz) < 0.08 ? 'Blocked / Vanishing Gradient' : 'Strong Learning Signal',
        resultMetric: `∂L/∂w₁ = ${dLdw1.toFixed(3)}`,
        resultTone: Math.abs(dhDz) < 0.08 ? 'danger' : 'success',
        conclusion:
          Math.abs(dhDz) < 0.08
            ? 'When φ′(z₁) collapses near 0 (saturated Sigmoid or negative ReLU), weight w₁ barely updates even when Loss is high.'
            : 'The Chain Rule routes exact error credit backward so both w₁ and w₂ descend the loss surface together.',
      };
    },
  },
};
