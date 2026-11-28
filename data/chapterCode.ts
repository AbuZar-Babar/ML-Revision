export interface CodeAnnotation {
  id: string;
  label: string;
  lineHint: string;
  explanation: string;
}

export interface ChapterCodeSpec {
  chapterId: number;
  filename: string;
  framework: string;
  summary: string;
  labDatasetId?: string;
  code: string;
  annotations: CodeAnnotation[];
}

export const CHAPTER_CODE: Record<number, ChapterCodeSpec> = {
  1: {
    chapterId: 1,
    filename: 'ch01_rules_vs_ml.py',
    framework: 'NumPy + Scikit-Learn',
    summary: 'Compare a brittle if/else threshold against a learned linear classifier.',
    code: `import numpy as np
from sklearn.linear_model import LogisticRegression

# Features: [weight_grams, redness_percent]
X = np.array([[185, 82], [210, 24], [175, 76], [115, 18], [130, 22], [140, 12]])
y = np.array([1, 1, 1, 0, 0, 0])  # 1 = Apple, 0 = Citrus

# Brittle rule fails on Yellow Golden Apple [210, 24]
rule_preds = (X[:, 1] >= 55).astype(int)

# Learned ML boundary combines weight and redness automatically
model = LogisticRegression().fit(X, y)
ml_preds = model.predict(X)

print("Rule accuracy:", (rule_preds == y).mean())
print("ML accuracy:  ", (ml_preds == y).mean())
print("Learned weights w:", model.coef_[0].round(3), "bias b:", round(model.intercept_[0], 3))`,
    annotations: [
      {
        id: 'c1-1',
        label: 'Feature Matrix X',
        lineHint: 'Line 5',
        explanation: 'Each row is one fruit and each column is a measurable numeric property (weight, redness).',
      },
      {
        id: 'c1-2',
        label: 'model.fit(X, y)',
        lineHint: 'Line 12',
        explanation: 'Replaces hand-written if/else rules by optimizing numeric weights w and bias b directly from examples.',
      },
    ],
  },
  2: {
    chapterId: 2,
    filename: 'ch02_paradigms_and_qlearning.py',
    framework: 'NumPy (Q-Learning)',
    summary: 'Implement tabular Q-Learning for a 4x4 Gridworld alongside Supervised & Unsupervised patterns.',
    code: `import numpy as np

# 4x4 Gridworld: state 0..15, actions: 0=Up, 1=Right, 2=Down, 3=Left
Q = np.zeros((16, 4))
alpha, gamma, epsilon = 0.25, 0.90, 0.20
GOAL, HAZARD = 15, 9

def step(state, action):
    r, c = divmod(state, 4)
    dr, dc = [(-1, 0), (0, 1), (1, 0), (0, -1)][action]
    nr, nc = np.clip(r + dr, 0, 3), np.clip(c + dc, 0, 3)
    nxt = nr * 4 + nc
    if nxt == GOAL:   return nxt, +10.0, True
    if nxt == HAZARD: return nxt, -10.0, True
    return nxt, -0.2, False

for episode in range(80):
    s, done = 0, False
    while not done:
        a = np.random.randint(4) if np.random.rand() < epsilon else np.argmax(Q[s])
        ns, reward, done = step(s, a)
        # Bellman Q-Learning Update
        Q[s, a] += alpha * (reward + gamma * np.max(Q[ns]) - Q[s, a])
        s = ns

print("Learned best action per cell (0=U,1=R,2=D,3=L):")
print(np.argmax(Q, axis=1).reshape(4, 4))`,
    annotations: [
      {
        id: 'c2-1',
        label: 'ε-Greedy Policy',
        lineHint: 'Line 20',
        explanation: 'With probability ε the agent explores a random move; otherwise it exploits the highest learned Q-value.',
      },
      {
        id: 'c2-2',
        label: 'Bellman Update',
        lineHint: 'Line 23',
        explanation: 'Blends immediate reward + discounted best future value γ·max Q(s′,a′) into the current state-action value.',
      },
    ],
  },
  3: {
    chapterId: 3,
    filename: 'ch03_training_loop_gd.py',
    framework: 'Pure NumPy',
    summary: 'Write the 4-step supervised training loop (Predict → Loss → Gradient → Update) from scratch.',
    code: `import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0, 5.0])
y = np.array([2.5, 4.1, 6.2, 7.9, 10.1])

w, b, lr = 0.0, 0.0, 0.05

for epoch in range(200):
    y_hat = w * x + b                        # 1. Predict
    error = y_hat - y
    mse = np.mean(error ** 2)                # 2. Measure Loss
    dw = (2 / len(x)) * np.sum(error * x)    # 3. Compute Gradients
    db = (2 / len(x)) * np.sum(error)
    w -= lr * dw                             # 4. Update Parameters
    b -= lr * db

print(f"Fitted line: y = {w:.3f}x + {b:.3f}  |  Final MSE = {mse:.4f}")`,
    annotations: [
      {
        id: 'c3-1',
        label: 'Gradient dw, db',
        lineHint: 'Lines 12–13',
        explanation: 'Partial derivatives of MSE measure which direction raises loss so subtracting them walks downhill.',
      },
      {
        id: 'c3-2',
        label: 'Learning Rate lr',
        lineHint: 'Line 14',
        explanation: 'Scales each parameter step; small steps converge steadily while oversized steps overshoot.',
      },
    ],
  },
  4: {
    chapterId: 4,
    filename: 'ch04_feature_scaling.py',
    framework: 'Scikit-Learn',
    summary: 'Fit StandardScaler on Training data only to avoid leakage before optimization.',
    code: `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# Raw features on wildly different scales: [Area_sqft, Bedrooms]
X = np.array([[850, 1], [1200, 2], [1600, 3], [2100, 3], [2600, 4], [2950, 5]])
y = np.array([180, 235, 310, 390, 465, 520])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33, random_state=42)

# Fit ONLY on X_train to prevent test-set data leakage!
scaler = StandardScaler()
X_train_std = scaler.fit_transform(X_train)
X_test_std = scaler.transform(X_test)

minmax = MinMaxScaler().fit(X_train)
print("Z-Score Train means:", X_train_std.mean(axis=0).round(2))
print("Min-Max Test range:\n", minmax.transform(X_test).round(2))`,
    annotations: [
      {
        id: 'c4-1',
        label: 'fit_transform vs transform',
        lineHint: 'Lines 13–14',
        explanation: 'Compute μ and σ strictly on X_train, then apply those exact parameters to X_test to prevent data leakage.',
      },
    ],
  },
  5: {
    chapterId: 5,
    filename: 'ch05_linear_regression.py',
    framework: 'Scikit-Learn',
    summary: 'Train Ordinary Least Squares Linear Regression and evaluate Train vs. Test MSE.',
    labDatasetId: 'hours-marks',
    code: `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

hours = np.array([[1.2], [2.1], [2.9], [3.8], [4.5], [5.4], [6.2], [7.3], [8.5], [9.2]])
marks = np.array([22, 31, 39, 47, 52, 62, 68, 79, 88, 93])

X_tr, X_te, y_tr, y_te = train_test_split(hours, marks, test_size=0.25, random_state=42)
model = LinearRegression().fit(X_tr, y_tr)

print(f"Slope w = {model.coef_[0]:.2f}, Intercept b = {model.intercept_:.2f}")
print(f"Train MSE = {mean_squared_error(y_tr, model.predict(X_tr)):.2f}")
print(f"Test  MSE = {mean_squared_error(y_te, model.predict(X_te)):.2f}")
print(f"Test  R²  = {r2_score(y_te, model.predict(X_te)):.3f}")`,
    annotations: [
      {
        id: 'c5-1',
        label: 'Train/Test Split',
        lineHint: 'Line 9',
        explanation: 'Holds out unseen examples so Test MSE verifies real generalization rather than memorization.',
      },
    ],
  },
  6: {
    chapterId: 6,
    filename: 'ch06_ridge_lasso_regularization.py',
    framework: 'Scikit-Learn',
    summary: 'Fit a high-degree polynomial and compare unregularized OLS vs. Ridge (L2) and Lasso (L1).',
    code: `import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso

rng = np.random.default_rng(7)
X = np.linspace(-3, 3, 25).reshape(-1, 1)
y = np.sin(X).ravel() + rng.normal(0, 0.25, size=25)

ols   = make_pipeline(PolynomialFeatures(9), StandardScaler(), LinearRegression()).fit(X, y)
ridge = make_pipeline(PolynomialFeatures(9), StandardScaler(), Ridge(alpha=1.0)).fit(X, y)
lasso = make_pipeline(PolynomialFeatures(9), StandardScaler(), Lasso(alpha=0.05)).fit(X, y)

print("OLS   max |w|:", np.abs(ols[-1].coef_).max().round(2))
print("Ridge max |w|:", np.abs(ridge[-1].coef_).max().round(2))
print("Lasso zero weights:", int(np.sum(lasso[-1].coef_ == 0)), "/ 10")`,
    annotations: [
      {
        id: 'c6-1',
        label: 'Ridge(alpha=1.0)',
        lineHint: 'Line 11',
        explanation: 'Adds L2 penalty λ·Σw² to smoothly shrink oversized polynomial weights without dropping terms.',
      },
      {
        id: 'c6-2',
        label: 'Lasso(alpha=0.05)',
        lineHint: 'Line 12',
        explanation: 'Adds L1 penalty λ·Σ|w| which drives weak polynomial terms all the way to exact zero.',
      },
    ],
  },
  7: {
    chapterId: 7,
    filename: 'ch07_logistic_regression.py',
    framework: 'Scikit-Learn',
    summary: 'Compute Sigmoid probabilities, apply a custom decision threshold, and inspect the Confusion Matrix.',
    labDatasetId: 'exam-pass',
    code: `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_score, recall_score

X = np.array([[1.0], [1.8], [2.4], [3.1], [3.9], [4.6], [5.5], [6.8], [8.2], [50.0]])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1, 1, 1])  # Note extreme outlier X=50!

clf = LogisticRegression().fit(X, y)
probs = clf.predict_proba(X)[:, 1]

threshold = 0.40  # Lower threshold catches more positives (higher recall)
preds = (probs >= threshold).astype(int)

print("Confusion Matrix:\n", confusion_matrix(y, preds))
print(f"Precision = {precision_score(y, preds):.2f} | Recall = {recall_score(y, preds):.2f}")`,
    annotations: [
      {
        id: 'c7-1',
        label: 'predict_proba',
        lineHint: 'Line 9',
        explanation: 'Returns Sigmoid probabilities σ(z) ∈ (0, 1) so you can tune your own threshold.',
      },
    ],
  },
  8: {
    chapterId: 8,
    filename: 'ch08_svm_and_rbf_kernel.py',
    framework: 'Scikit-Learn',
    summary: 'Compare Linear Soft-Margin SVM and RBF Kernel SVM while inspecting Support Vectors.',
    labDatasetId: 'tumor-svm',
    code: `from sklearn.datasets import make_circles
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.svm import SVC

X, y = make_circles(n_samples=160, factor=0.45, noise=0.12, random_state=42)

linear_svm = make_pipeline(StandardScaler(), SVC(kernel="linear", C=1.0)).fit(X, y)
rbf_svm    = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=2.0, gamma=1.2)).fit(X, y)

print("Linear SVM accuracy on rings:", round(linear_svm.score(X, y), 3))
print("RBF    SVM accuracy on rings:", round(rbf_svm.score(X, y), 3))
print("Number of Support Vectors:   ", len(rbf_svm[-1].support_vectors_))`,
    annotations: [
      {
        id: 'c8-1',
        label: 'StandardScaler + SVC',
        lineHint: 'Line 9',
        explanation: 'SVM margins depend directly on Euclidean distances, so standardizing inputs is essential.',
      },
      {
        id: 'c8-2',
        label: 'C & gamma',
        lineHint: 'Line 9',
        explanation: 'C balances wide margin vs. violations; γ controls how tightly the RBF kernel wraps local clusters.',
      },
    ],
  },
  9: {
    chapterId: 9,
    filename: 'ch09_knn_and_decision_tree.py',
    framework: 'Scikit-Learn',
    summary: 'Train KNN and a depth-limited Decision Tree on non-linear Two Moons data.',
    labDatasetId: 'iris-classic',
    code: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

X, y = make_moons(n_samples=200, noise=0.22, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

knn  = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7)).fit(X_tr, y_tr)
tree = DecisionTreeClassifier(criterion="entropy", max_depth=4, random_state=42).fit(X_tr, y_tr)

print("KNN  Test Accuracy:", round(knn.score(X_te, y_te), 3))
print("Tree Test Accuracy:", round(tree.score(X_te, y_te), 3))`,
    annotations: [
      {
        id: 'c9-1',
        label: 'n_neighbors=7',
        lineHint: 'Line 11',
        explanation: 'Larger k averages more neighbors to smooth out jagged k=1 overfitting.',
      },
      {
        id: 'c9-2',
        label: 'max_depth=4',
        lineHint: 'Line 12',
        explanation: 'Caps orthogonal tree splits so the tree stops before memorizing individual noise points.',
      },
    ],
  },
  10: {
    chapterId: 10,
    filename: 'ch10_naive_bayes_laplace.py',
    framework: 'Scikit-Learn',
    summary: 'Classify SMS spam with Multinomial Naive Bayes and Laplace (+1) smoothing.',
    labDatasetId: 'sms-spam',
    code: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

texts = [
    "winner free cash prize now",
    "claim your free gift today",
    "meeting notes for friday lecture",
    "see you in the library at noon",
]
labels = [1, 1, 0, 0]  # 1 = Spam, 0 = Ham

vec = CountVectorizer()
X = vec.fit_transform(texts)

# alpha=1.0 enables Laplace (+1) smoothing for unseen words like "crypto"
nb = MultinomialNB(alpha=1.0).fit(X, labels)
p_spam = nb.predict_proba(vec.transform(["winner free crypto"]))[0, 1]
print(f"P(Spam | 'winner free crypto') = {p_spam:.3f}")`,
    annotations: [
      {
        id: 'c10-1',
        label: 'alpha=1.0 (Laplace)',
        lineHint: 'Line 16',
        explanation: 'Adds +1 pseudo-count so unseen vocabulary words never collapse the posterior probability to zero.',
      },
    ],
  },
  11: {
    chapterId: 11,
    filename: 'ch11_random_forest_and_boosting.py',
    framework: 'Scikit-Learn',
    summary: 'Compare a single Decision Tree against Bagged Random Forests and AdaBoost.',
    labDatasetId: 'play-tennis',
    code: `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier

X, y = make_moons(n_samples=260, noise=0.28, random_state=42)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)

single = DecisionTreeClassifier(random_state=42).fit(X_tr, y_tr)
forest = RandomForestClassifier(n_estimators=50, random_state=42).fit(X_tr, y_tr)
boost  = AdaBoostClassifier(n_estimators=50, random_state=42).fit(X_tr, y_tr)

print("Single Tree Test Acc:  ", round(single.score(X_te, y_te), 3))
print("Random Forest Test Acc:", round(forest.score(X_te, y_te), 3))
print("AdaBoost Test Acc:     ", round(boost.score(X_te, y_te), 3))`,
    annotations: [
      {
        id: 'c11-1',
        label: 'RandomForest (Bagging)',
        lineHint: 'Line 10',
        explanation: 'Trains 50 trees in parallel on bootstrapped samples and averages votes to slash variance.',
      },
      {
        id: 'c11-2',
        label: 'AdaBoost (Boosting)',
        lineHint: 'Line 11',
        explanation: 'Trains weak stumps sequentially, up-weighting mistakes from previous rounds to slash bias.',
      },
    ],
  },
  12: {
    chapterId: 12,
    filename: 'ch12_kmeans_clustering.py',
    framework: 'Scikit-Learn',
    summary: 'Cluster unlabeled 2D observations with K-Means and inspect learned centroids and inertia.',
    code: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

X = np.array([
    [1.2, 42], [1.8, 48], [2.1, 45],
    [4.8, 72], [5.2, 75], [5.6, 70],
    [8.2, 91], [8.8, 95], [9.1, 93],
])

X_scaled = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=3, n_init=10, random_state=42).fit(X_scaled)

print("Cluster assignments:", km.labels_)
print("Total Inertia (SSE):", round(km.inertia_, 3))`,
    annotations: [
      {
        id: 'c12-1',
        label: 'km.inertia_',
        lineHint: 'Line 15',
        explanation: 'Sum of squared distances from each point to its assigned centroid; lower means tighter clusters.',
      },
    ],
  },
  13: {
    chapterId: 13,
    filename: 'ch13_pca_compression.py',
    framework: 'Scikit-Learn',
    summary: 'Standardize correlated features, project onto PC1, and measure Explained Variance Ratio.',
    labDatasetId: 'tumor-svm',
    code: `import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

rng = np.random.default_rng(42)
x1 = rng.normal(0, 2.0, 120)
x2 = 0.85 * x1 + rng.normal(0, 0.45, 120)
X = np.column_stack([x1, x2])

X_std = StandardScaler().fit_transform(X)
pca = PCA(n_components=1).fit(X_std)
Z_1d = pca.transform(X_std)

print("PC1 eigenvector:", pca.components_[0].round(3))
print("Variance retained in 1D:", f"{pca.explained_variance_ratio_[0]*100:.1f}%")`,
    annotations: [
      {
        id: 'c13-1',
        label: 'explained_variance_ratio_',
        lineHint: 'Line 15',
        explanation: 'Shows λ₁ / (λ₁ + λ₂), the exact fraction of dataset variance preserved after dropping PC2.',
      },
    ],
  },
  14: {
    chapterId: 14,
    filename: 'ch14_mlp_xor.py',
    framework: 'Scikit-Learn / NumPy',
    summary: 'Prove a linear Perceptron fails on XOR while a 2-neuron ReLU MLP solves it cleanly.',
    labDatasetId: 'xor-nn',
    code: `import numpy as np
from sklearn.linear_model import Perceptron
from sklearn.neural_network import MLPClassifier

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([0, 1, 1, 0])  # Classic non-linear XOR truth table

perc = Perceptron(max_iter=1000, random_state=42).fit(X, y)
mlp  = MLPClassifier(hidden_layer_sizes=(4,), activation="relu",
                     max_iter=3000, random_state=1).fit(X, y)

print("Single Perceptron accuracy:", perc.score(X, y))
print("MLP Hidden Layer accuracy: ", mlp.score(X, y))
print("MLP predictions:           ", mlp.predict(X))`,
    annotations: [
      {
        id: 'c14-1',
        label: 'hidden_layer_sizes + relu',
        lineHint: 'Line 9',
        explanation: 'Non-linear ReLU hidden neurons warp the 2D input space so diagonal XOR corners become separable.',
      },
    ],
  },
  15: {
    chapterId: 15,
    filename: 'ch15_backprop_chain_rule.py',
    framework: 'Pure NumPy',
    summary: 'Compute explicit Forward activations and Backward Chain-Rule gradients on a 2-layer graph.',
    labDatasetId: 'xor-nn',
    code: `import numpy as np

x, y_true = 2.0, 1.0
w1, b1 = 0.6, 0.1
w2, b2 = -0.4, 0.2
lr = 0.12

for epoch in range(15):
    # Forward pass (ReLU hidden neuron)
    z1 = w1 * x + b1
    h = max(0.0, z1)
    y_hat = w2 * h + b2
    loss = 0.5 * (y_hat - y_true) ** 2

    # Backward pass via Chain Rule
    dL_dy = y_hat - y_true
    dL_dw2 = dL_dy * h
    dL_dh  = dL_dy * w2
    dh_dz1 = 1.0 if z1 > 0 else 0.0
    dL_dw1 = dL_dh * dh_dz1 * x

    w2 -= lr * dL_dw2
    w1 -= lr * dL_dw1

print(f"After 15 epochs: y_hat={y_hat:.3f}, loss={loss:.5f}")`,
    annotations: [
      {
        id: 'c15-1',
        label: 'Chain Rule Product',
        lineHint: 'Lines 16–20',
        explanation: 'Multiplies local derivatives backward (∂L/∂ŷ · ∂ŷ/∂h · ∂h/∂z₁ · x) to blame w₁ accurately.',
      },
    ],
  },
  16: {
    chapterId: 16,
    filename: 'ch16_cnn_convolution_pooling.py',
    framework: 'Pure NumPy (2D Conv + MaxPool)',
    summary: 'Slide a 3×3 vertical edge kernel over a 7×7 image, apply ReLU, and downsample with 2×2 Max Pooling.',
    code: `import numpy as np

# 7x7 grayscale image containing a bright vertical bar
img = np.zeros((7, 7))
img[:, 3:5] = 1.0

# 3x3 Vertical Edge detection kernel
kernel = np.array([[-1, 0, 1],
                   [-1, 0, 1],
                   [-1, 0, 1]], dtype=float)

# 1. Valid 2D Convolution -> 5x5 Feature Map
H, W = img.shape
feat = np.zeros((H - 2, W - 2))
for r in range(H - 2):
    for c in range(W - 2):
        patch = img[r:r+3, c:c+3]
        feat[r, c] = np.sum(patch * kernel)

# 2. ReLU activation + 2x2 Max Pooling (stride 2)
relu_map = np.maximum(0, feat)
pooled = np.array([
    [relu_map[r:r+2, c:c+2].max() for c in range(0, 4, 2)]
    for r in range(0, 4, 2)
])

print("Feature Map (after ReLU):\n", relu_map)
print("2x2 Max Pooled Output:\n", pooled)`,
    annotations: [
      {
        id: 'c16-1',
        label: 'patch * kernel dot product',
        lineHint: 'Line 18',
        explanation: 'Slides the exact same 9 weights over every 3×3 pixel window so one edge detector works everywhere.',
      },
      {
        id: 'c16-2',
        label: '2x2 Max Pooling',
        lineHint: 'Lines 22–25',
        explanation: 'Retains only the strongest activation in each 2×2 block, shrinking spatial size and adding shift robustness.',
      },
    ],
  },
  17: {
    chapterId: 17,
    filename: 'ch17_scaled_dot_product_attention.py',
    framework: 'Pure NumPy (Transformer Attention)',
    summary: 'Compute Scaled Dot-Product Self-Attention weights softmax(QKᵀ / √d_k)V from scratch.',
    code: `import numpy as np

def softmax(x):
    e = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return e / np.sum(e, axis=-1, keepdims=True)

tokens = ["The", "animal", "crossed", "street", "it", "tired"]
d_k = 4

# Toy Query, Key, Value vectors (shape: seq_len x d_k)
rng = np.random.default_rng(7)
Q = rng.normal(size=(len(tokens), d_k))
K = rng.normal(size=(len(tokens), d_k))
V = rng.normal(size=(len(tokens), d_k))

# Align "it" (idx 4) Query closer to "animal" (idx 1) Key
Q[4] = K[1] * 1.4

# Scaled Dot-Product Self-Attention
scores = (Q @ K.T) / np.sqrt(d_k)
weights = softmax(scores)
context = weights @ V

for tok, w in zip(tokens, weights[4]):
    print(f"Attention('it' -> {tok:8s}) = {w:.3f}")`,
    annotations: [
      {
        id: 'c17-1',
        label: 'Q @ K.T / sqrt(d_k)',
        lineHint: 'Line 20',
        explanation: 'Computes pairwise token similarity and divides by √d_k so softmax gradients stay well-behaved.',
      },
      {
        id: 'c17-2',
        label: 'weights @ V',
        lineHint: 'Line 22',
        explanation: 'Blends all token Value vectors weighted by their attention scores into a context-aware embedding.',
      },
    ],
  },
};
