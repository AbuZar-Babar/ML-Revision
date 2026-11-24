export interface LabDataset {
  id: string;
  stageRef: string;
  title: string;
  algorithm: string;
  csvFilename: string;
  pyFilename: string;
  recordCountLabel: string;
  taskSummary: string;
  learningObjectives: string[];
  columns: string[];
  rows: (string | number)[][];
  colabUrl: string;
  starterCode: string;
}

// 50 realistic student records: Study_Hours vs Exam_Score (hours_marks.csv)
const HOURS_MARKS_ROWS: (string | number)[][] = [
  [1.1, 21], [1.3, 24], [1.5, 22], [1.8, 28], [2.0, 31],
  [2.2, 30], [2.5, 35], [2.7, 34], [2.9, 39], [3.0, 41],
  [3.2, 38], [3.4, 43], [3.5, 45], [3.7, 44], [3.8, 48],
  [4.0, 50], [4.2, 49], [4.4, 53], [4.5, 51], [4.7, 56],
  [4.8, 58], [5.0, 57], [5.1, 61], [5.3, 60], [5.5, 64],
  [5.6, 62], [5.8, 66], [6.0, 68], [6.1, 67], [6.3, 70],
  [6.5, 72], [6.7, 71], [6.9, 75], [7.0, 74], [7.2, 77],
  [7.4, 79], [7.5, 78], [7.7, 82], [7.9, 81], [8.0, 84],
  [8.2, 83], [8.4, 86], [8.5, 88], [8.7, 87], [8.9, 91],
  [9.0, 90], [9.2, 93], [9.4, 95], [9.6, 94], [9.8, 97],
];

const EXAM_PASS_ROWS: (string | number)[][] = [
  [0.5, 42, 0], [0.8, 48, 0], [1.2, 51, 0], [1.5, 45, 0], [1.8, 55, 0],
  [2.0, 60, 0], [2.3, 52, 0], [2.5, 58, 0], [2.8, 63, 0], [3.0, 61, 0],
  [3.2, 68, 0], [3.5, 65, 1], [3.8, 70, 0], [4.0, 74, 1], [4.2, 72, 1],
  [4.5, 76, 1], [4.8, 79, 1], [5.0, 81, 1], [5.4, 78, 1], [5.8, 84, 1],
  [6.2, 86, 1], [6.6, 89, 1], [7.0, 91, 1], [7.5, 94, 1], [8.2, 96, 1],
];

const IRIS_ROWS: (string | number)[][] = [
  [5.1, 3.5, 1.4, 0.2, 'Setosa'], [4.9, 3.0, 1.4, 0.2, 'Setosa'],
  [4.7, 3.2, 1.3, 0.2, 'Setosa'], [4.6, 3.1, 1.5, 0.2, 'Setosa'],
  [5.0, 3.6, 1.4, 0.2, 'Setosa'], [5.4, 3.9, 1.7, 0.4, 'Setosa'],
  [4.6, 3.4, 1.4, 0.3, 'Setosa'], [5.0, 3.4, 1.5, 0.2, 'Setosa'],
  [4.4, 2.9, 1.4, 0.2, 'Setosa'], [4.9, 3.1, 1.5, 0.1, 'Setosa'],
  [7.0, 3.2, 4.7, 1.4, 'Versicolor'], [6.4, 3.2, 4.5, 1.5, 'Versicolor'],
  [6.9, 3.1, 4.9, 1.5, 'Versicolor'], [5.5, 2.3, 4.0, 1.3, 'Versicolor'],
  [6.5, 2.8, 4.6, 1.5, 'Versicolor'], [5.7, 2.8, 4.5, 1.3, 'Versicolor'],
  [6.3, 3.3, 4.7, 1.6, 'Versicolor'], [4.9, 2.4, 3.3, 1.0, 'Versicolor'],
  [6.6, 2.9, 4.6, 1.3, 'Versicolor'], [5.2, 2.7, 3.9, 1.4, 'Versicolor'],
  [6.3, 3.3, 6.0, 2.5, 'Virginica'], [5.8, 2.7, 5.1, 1.9, 'Virginica'],
  [7.1, 3.0, 5.9, 2.1, 'Virginica'], [6.3, 2.9, 5.6, 1.8, 'Virginica'],
  [6.5, 3.0, 5.8, 2.2, 'Virginica'], [7.6, 3.0, 6.6, 2.1, 'Virginica'],
  [4.9, 2.5, 4.5, 1.7, 'Virginica'], [7.3, 2.9, 6.3, 1.8, 'Virginica'],
  [6.7, 2.5, 5.8, 1.8, 'Virginica'], [7.2, 3.6, 6.1, 2.5, 'Virginica'],
];

const WEATHER_ROWS: (string | number)[][] = [
  ['Sunny', 'Hot', 'High', 'Weak', 'No'],
  ['Sunny', 'Hot', 'High', 'Strong', 'No'],
  ['Overcast', 'Hot', 'High', 'Weak', 'Yes'],
  ['Rain', 'Mild', 'High', 'Weak', 'Yes'],
  ['Rain', 'Cool', 'Normal', 'Weak', 'Yes'],
  ['Rain', 'Cool', 'Normal', 'Strong', 'No'],
  ['Overcast', 'Cool', 'Normal', 'Strong', 'Yes'],
  ['Sunny', 'Mild', 'High', 'Weak', 'No'],
  ['Sunny', 'Cool', 'Normal', 'Weak', 'Yes'],
  ['Rain', 'Mild', 'Normal', 'Weak', 'Yes'],
  ['Sunny', 'Mild', 'Normal', 'Strong', 'Yes'],
  ['Overcast', 'Mild', 'High', 'Strong', 'Yes'],
  ['Overcast', 'Hot', 'Normal', 'Weak', 'Yes'],
  ['Rain', 'Mild', 'High', 'Strong', 'No'],
];

const SMS_SPAM_ROWS: (string | number)[][] = [
  ['spam', 'WINNER! Claim your FREE cash prize now urgent call'],
  ['spam', 'URGENT free vacation voucher winner selected today'],
  ['spam', 'Congratulations FREE prize money click urgent link'],
  ['spam', 'You are our lucky WINNER claim free gift card'],
  ['spam', 'URGENT account alert claim free bonus prize today'],
  ['spam', 'FREE entry to weekly prize draw text WINNER now'],
  ['spam', 'Exclusive FREE offer urgent reward waiting for you'],
  ['spam', 'WINNER notification claim your urgent cash prize'],
  ['ham', 'Can we reschedule the project meeting to 3pm tomorrow?'],
  ['ham', 'Please submit the lab assignment before Friday schedule'],
  ['ham', 'Team project notes from today meeting are uploaded'],
  ['ham', 'Are you coming to the study group meeting after lab?'],
  ['ham', 'Updated lecture schedule and project guidelines attached'],
  ['ham', 'Thanks for sending the lab report before the deadline'],
  ['ham', 'Quick check on our project timeline for next week meeting'],
  ['ham', 'Professor moved the office hours schedule to Thursday'],
  ['ham', 'Let us review the dataset during tomorrow lab session'],
  ['ham', 'See you at the library for project discussion at noon'],
  ['ham', 'Reminder: midterm review meeting starts in ten minutes'],
  ['ham', 'I pushed the starter code to our shared project folder'],
];

export const LAB_DATASETS: LabDataset[] = [
  {
    id: 'linear-regression',
    stageRef: 'Stage 04',
    title: 'Lab 01: Linear Regression & Gradient Descent',
    algorithm: 'Linear Regression',
    csvFilename: 'hours_marks.csv',
    pyFilename: 'lab01_linear_regression.py',
    recordCountLabel: '50 records · 2 numeric columns',
    taskSummary:
      'Implement batch Gradient Descent from scratch in NumPy, track Mean Squared Error over epochs, and verify your learned slope/intercept against scikit-learn LinearRegression().',
    learningObjectives: [
      'Split hours_marks.csv into 80% training and 20% holdout test sets.',
      'Compute partial derivatives dL/dw and dL/db for MSE loss.',
      'Compare convergence speed across learning rates α = 0.001, 0.01, and 0.05.',
    ],
    columns: ['Study_Hours', 'Exam_Score'],
    rows: HOURS_MARKS_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 01: Linear Regression — Gradient Descent from Scratch vs. Scikit-Learn
Dataset: hours_marks.csv (50 student records)
"""
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# 1. Load dataset
df = pd.read_csv("hours_marks.csv")
X = df["Study_Hours"].values
y = df["Exam_Score"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

def compute_mse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    # TODO: Return Mean Squared Error = mean((y_pred - y_true) ** 2)
    raise NotImplementedError("Implement MSE calculation")

def gradient_descent(
    x: np.ndarray, y: np.ndarray, lr: float = 0.01, epochs: int = 500
):
    w, b = 0.0, 0.0
    n = len(x)
    history = []

    for epoch in range(epochs):
        y_pred = w * x + b
        # TODO: Compute gradients dw and db
        dw = 0.0  # Replace with (2 / n) * np.sum((y_pred - y) * x)
        db = 0.0  # Replace with (2 / n) * np.sum(y_pred - y)

        # TODO: Update parameters w and b using learning rate lr
        w = w - lr * dw
        b = b - lr * db

        if epoch % 50 == 0:
            history.append((epoch, compute_mse(y, y_pred)))

    return w, b, history

# 2. Run custom Gradient Descent
w_gd, b_gd, loss_log = gradient_descent(X_train, y_train, lr=0.01, epochs=1000)
test_mse_gd = compute_mse(y_test, w_gd * X_test + b_gd)
print(f"[NumPy GD] w = {w_gd:.4f}, b = {b_gd:.4f}, Test MSE = {test_mse_gd:.4f}")

# 3. Benchmark against Scikit-Learn LinearRegression
sk_model = LinearRegression()
sk_model.fit(X_train.reshape(-1, 1), y_train)
sk_preds = sk_model.predict(X_test.reshape(-1, 1))
print(
    f"[Sklearn ] w = {sk_model.coef_[0]:.4f}, b = {sk_model.intercept_:.4f}, "
    f"Test MSE = {mean_squared_error(y_test, sk_preds):.4f}"
)
`,
  },
  {
    id: 'logistic-regression',
    stageRef: 'Stage 05',
    title: 'Lab 02: Logistic Regression & Sigmoid Boundary',
    algorithm: 'Logistic Regression',
    csvFilename: 'exam_pass.csv',
    pyFilename: 'lab02_logistic_regression.py',
    recordCountLabel: '25 records · Binary target (Pass = 0/1)',
    taskSummary:
      'Implement the Sigmoid activation and Binary Cross-Entropy loss function, fit a classifier on exam_pass.csv, and evaluate precision/recall across classification thresholds.',
    learningObjectives: [
      'Implement sigmoid(z) = 1 / (1 + exp(-z)) safely in NumPy.',
      'Compute Binary Cross-Entropy (Log-Loss) on predicted probabilities.',
      'Construct a 2x2 Confusion Matrix at thresholds 0.3, 0.5, and 0.7.',
    ],
    columns: ['Study_Hours', 'Attendance_Pct', 'Passed'],
    rows: EXAM_PASS_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 02: Logistic Regression — Sigmoid, Binary Cross-Entropy & Confusion Matrix
Dataset: exam_pass.csv
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, classification_report

df = pd.read_csv("exam_pass.csv")
X = df[["Study_Hours", "Attendance_Pct"]].values
y = df["Passed"].values

def sigmoid(z: np.ndarray) -> np.ndarray:
    # TODO: Implement 1 / (1 + np.exp(-z))
    raise NotImplementedError("Implement sigmoid function")

def binary_cross_entropy(y_true: np.ndarray, probs: np.ndarray) -> float:
    eps = 1e-9
    p = np.clip(probs, eps, 1 - eps)
    # TODO: Return -np.mean(y_true * np.log(p) + (1 - y_true) * np.log(1 - p))
    raise NotImplementedError("Implement Binary Cross-Entropy loss")

# Fit baseline Logistic Regression
clf = LogisticRegression()
clf.fit(X, y)
probs = clf.predict_proba(X)[:, 1]

print(f"Learned Weights: {clf.coef_[0]}, Intercept: {clf.intercept_[0]:.4f}")
print(f"BCE Loss: {binary_cross_entropy(y, probs):.4f}")

# TODO: Experiment with thresholds 0.3, 0.5, and 0.7
for threshold in [0.3, 0.5, 0.7]:
    preds = (probs >= threshold).astype(int)
    cm = confusion_matrix(y, preds)
    print(f"\\nThreshold = {threshold} -> Confusion Matrix:\\n{cm}")
    print(classification_report(y, preds, zero_division=0))
`,
  },
  {
    id: 'knn',
    stageRef: 'Stage 06',
    title: 'Lab 03: K-Nearest Neighbors & Overfitting Curve',
    algorithm: 'K-Nearest Neighbors',
    csvFilename: 'iris.csv',
    pyFilename: 'lab03_knn_iris.py',
    recordCountLabel: '30 records · 4 features · 3 flower species',
    taskSummary:
      'Code Euclidean distance and majority voting from scratch on iris.csv, then compare Train vs. Test accuracy across k = 1, 3, 5, 9 to observe the bias-variance trade-off.',
    learningObjectives: [
      'Compute vectorized Euclidean distances between a query flower and all training samples.',
      'Implement majority-vote prediction among the k nearest neighbors.',
      'Compare Train vs. Test accuracy for k = 1, 3, 5, and 9.',
    ],
    columns: [
      'Sepal_Length',
      'Sepal_Width',
      'Petal_Length',
      'Petal_Width',
      'Species',
    ],
    rows: IRIS_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 03: K-Nearest Neighbors — Euclidean Distance & Majority Voting
Dataset: iris.csv
"""
from collections import Counter
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

df = pd.read_csv("iris.csv")
X = df.iloc[:, :4].values
y = df["Species"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)

def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    # TODO: Return sqrt(sum((a - b) ** 2))
    raise NotImplementedError("Implement Euclidean distance")

def knn_predict_one(X_tr, y_tr, x_query, k: int):
    # TODO: Compute distances from x_query to every row in X_tr
    distances = [euclidean_distance(x_query, row) for row in X_tr]
    # TODO: Select indices of the k smallest distances and return majority class
    nearest_idx = np.argsort(distances)[:k]
    votes = Counter(y_tr[nearest_idx])
    return votes.most_common(1)[0][0]

for k in [1, 3, 5, 9]:
    preds = [knn_predict_one(X_train, y_train, xq, k) for xq in X_test]
    test_acc = np.mean(np.array(preds) == y_test)
    sk = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)
    print(
        f"k = {k:2d} | Custom Test Acc = {test_acc:.2%} "
        f"| Sklearn Train Acc = {sk.score(X_train, y_train):.2%}"
    )
`,
  },
  {
    id: 'decision-trees',
    stageRef: 'Stage 06',
    title: 'Lab 04: Decision Trees, Entropy & Information Gain',
    algorithm: 'Decision Trees',
    csvFilename: 'weather_nominal.csv',
    pyFilename: 'lab04_decision_tree_entropy.py',
    recordCountLabel: '14 records · Classic Play Tennis dataset',
    taskSummary:
      'Compute Shannon Entropy and Information Gain for Outlook, Temperature, Humidity, and Wind to select the optimal root split by hand and verify with Scikit-learn.',
    learningObjectives: [
      'Write a clean entropy(labels) function using base-2 logarithms.',
      'Calculate Information Gain for each categorical feature in weather_nominal.csv.',
      'Confirm which feature wins the root split and inspect max_depth pruning.',
    ],
    columns: ['Outlook', 'Temperature', 'Humidity', 'Wind', 'Play_Tennis'],
    rows: WEATHER_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 04: Decision Trees — Entropy & Information Gain (Play Tennis)
Dataset: weather_nominal.csv (14 classic records)
"""
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text

df = pd.read_csv("weather_nominal.csv")
target_col = "Play_Tennis"

def entropy(series: pd.Series) -> float:
    probs = series.value_counts(normalize=True).values
    # TODO: Return -np.sum(probs * np.log2(probs))
    raise NotImplementedError("Implement Shannon entropy")

def information_gain(data: pd.DataFrame, feature: str, target: str) -> float:
    base_h = entropy(data[target])
    weighted_h = 0.0
    for val, subset in data.groupby(feature):
        # TODO: Accumulate (len(subset) / len(data)) * entropy(subset[target])
        weighted_h += (len(subset) / len(data)) * entropy(subset[target])
    return base_h - weighted_h

print(f"Root Entropy H(Play_Tennis): {entropy(df[target_col]):.4f}\\n")
for feat in ["Outlook", "Temperature", "Humidity", "Wind"]:
    ig = information_gain(df, feat, target_col)
    print(f"Information Gain ({feat:11s}): {ig:.4f}")

# Verify with Scikit-Learn DecisionTreeClassifier (one-hot encoded)
X_enc = pd.get_dummies(df.drop(columns=[target_col]))
y_bin = (df[target_col] == "Yes").astype(int)
tree = DecisionTreeClassifier(criterion="entropy", max_depth=3, random_state=42)
tree.fit(X_enc, y_bin)
print("\\nLearned Sklearn Tree Rules:")
print(export_text(tree, feature_names=list(X_enc.columns)))
`,
  },
  {
    id: 'naive-bayes',
    stageRef: 'Stage 07',
    title: 'Lab 05: Naive Bayes Spam Filter & Laplace Smoothing',
    algorithm: 'Naive Bayes',
    csvFilename: 'sms_spam_sample.csv',
    pyFilename: 'lab05_naive_bayes_spam.py',
    recordCountLabel: '20 records · Labeled SMS Spam/Ham corpus',
    taskSummary:
      'Build a word-frequency dictionary from sms_spam_sample.csv, calculate priors and likelihoods, observe zero-frequency failure on an unseen word, and apply Laplace (+1) smoothing.',
    learningObjectives: [
      'Tokenize SMS messages and build per-class word frequency tables.',
      'Calculate P(Spam) and P(Ham) class priors.',
      'Compare raw likelihoods (alpha = 0) vs. Laplace Smoothing (alpha = 1) on unseen words.',
    ],
    columns: ['Label', 'Message'],
    rows: SMS_SPAM_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 05: Multinomial Naive Bayes — Spam Filter & Laplace Smoothing
Dataset: sms_spam_sample.csv
"""
from collections import Counter
import pandas as pd

df = pd.read_csv("sms_spam_sample.csv")

def tokenize(text: str):
    cleaned = "".join(ch.lower() if ch.isalpha() or ch.isspace() else " " for ch in text)
    return [w for w in cleaned.split() if len(w) > 1]

# 1. Build class word frequency dictionaries
spam_words = Counter()
ham_words = Counter()
for _, row in df.iterrows():
    tokens = tokenize(row["Message"])
    if row["Label"] == "spam":
        spam_words.update(tokens)
    else:
        ham_words.update(tokens)

vocab = set(spam_words.keys()) | set(ham_words.keys())
p_spam = (df["Label"] == "spam").mean()
p_ham = (df["Label"] == "ham").mean()

def predict_message(text: str, alpha: float = 1.0):
    tokens = tokenize(text)
    total_spam = sum(spam_words.values())
    total_ham = sum(ham_words.values())
    V = len(vocab)

    score_spam = p_spam
    score_ham = p_ham

    for word in tokens:
        # TODO: Apply Laplace smoothing (count + alpha) / (total + alpha * V)
        pw_spam = (spam_words[word] + alpha) / (total_spam + alpha * V)
        pw_ham = (ham_words[word] + alpha) / (total_ham + alpha * V)
        score_spam *= pw_spam
        score_ham *= pw_ham

    total = score_spam + score_ham
    if total == 0:
        return {"P(Spam)": 0.0, "P(Ham)": 0.0, "note": "ZERO-FREQUENCY COLLAPSE!"}
    return {"P(Spam)": round(score_spam / total, 4), "P(Ham)": round(score_ham / total, 4)}

test_sms = "WINNER claim your FREE crypto prize"
print("Without Smoothing (alpha=0):", predict_message(test_sms, alpha=0.0))
print("With Laplace (+1) (alpha=1):", predict_message(test_sms, alpha=1.0))
`,
  },
];

export function serializeDatasetToCSV(dataset: LabDataset): string {
  const escapeCell = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const header = dataset.columns.map(escapeCell).join(',');
  const lines = dataset.rows.map((r) => r.map(escapeCell).join(','));
  return [header, ...lines].join('\n');
}
