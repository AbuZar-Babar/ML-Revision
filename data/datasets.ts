export interface LabDataset {
  id: string;
  stageRef: string;
  chapterId: number;
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

const TUMOR_SVM_ROWS: (string | number)[][] = [
  [11.2, 14.1, 0.06, 0], [12.0, 15.6, 0.08, 0], [12.4, 13.8, 0.05, 0],
  [11.8, 16.2, 0.09, 0], [13.0, 15.1, 0.10, 0], [12.7, 17.0, 0.07, 0],
  [13.4, 16.4, 0.11, 0], [11.5, 14.9, 0.06, 0], [12.9, 14.5, 0.09, 0],
  [13.8, 17.5, 0.12, 0], [17.9, 21.4, 0.24, 1], [18.6, 23.0, 0.27, 1],
  [19.2, 22.1, 0.29, 1], [17.2, 20.8, 0.21, 1], [20.1, 24.3, 0.31, 1],
  [18.1, 22.7, 0.25, 1], [16.9, 20.1, 0.19, 1], [19.8, 23.6, 0.28, 1],
  [21.0, 25.1, 0.34, 1], [17.5, 21.9, 0.22, 1],
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

const XOR_NN_ROWS: (string | number)[][] = [
  [0.04, 0.06, 0], [0.11, 0.08, 0], [0.02, 0.14, 0], [0.15, 0.05, 0],
  [0.06, 0.94, 1], [0.12, 0.89, 1], [0.03, 0.97, 1], [0.16, 0.91, 1],
  [0.95, 0.07, 1], [0.88, 0.11, 1], [0.97, 0.04, 1], [0.90, 0.15, 1],
  [0.93, 0.95, 0], [0.89, 0.88, 0], [0.96, 0.91, 0], [0.85, 0.94, 0],
];

export const LAB_DATASETS: LabDataset[] = [
  {
    id: 'linear-regression',
    stageRef: 'Chapter 05',
    chapterId: 5,
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

df = pd.read_csv("hours_marks.csv")
X = df["Study_Hours"].values
y = df["Exam_Score"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

def compute_mse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    # TODO: Return Mean Squared Error = mean((y_pred - y_true) ** 2)
    raise NotImplementedError("Implement MSE calculation")

def gradient_descent(x: np.ndarray, y: np.ndarray, lr: float = 0.01, epochs: int = 500):
    w, b = 0.0, 0.0
    n = len(x)
    for epoch in range(epochs):
        y_pred = w * x + b
        # TODO: Compute gradients dw and db
        dw = (2 / n) * np.sum((y_pred - y) * x)
        db = (2 / n) * np.sum(y_pred - y)
        w = w - lr * dw
        b = b - lr * db
    return w, b

w_gd, b_gd = gradient_descent(X_train, y_train, lr=0.01, epochs=1000)
print(f"[NumPy GD] w = {w_gd:.4f}, b = {b_gd:.4f}, Test MSE = {compute_mse(y_test, w_gd * X_test + b_gd):.4f}")

sk_model = LinearRegression().fit(X_train.reshape(-1, 1), y_train)
sk_preds = sk_model.predict(X_test.reshape(-1, 1))
print(f"[Sklearn ] w = {sk_model.coef_[0]:.4f}, b = {sk_model.intercept_:.4f}, Test MSE = {mean_squared_error(y_test, sk_preds):.4f}")
`,
  },
  {
    id: 'logistic-regression',
    stageRef: 'Chapter 07',
    chapterId: 7,
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

clf = LogisticRegression().fit(X, y)
probs = clf.predict_proba(X)[:, 1]
print(f"BCE Loss: {binary_cross_entropy(y, probs):.4f}")

for threshold in [0.3, 0.5, 0.7]:
    preds = (probs >= threshold).astype(int)
    print(f"\\nThreshold = {threshold}\\n", confusion_matrix(y, preds))
    print(classification_report(y, preds, zero_division=0))
`,
  },
  {
    id: 'svm-pca',
    stageRef: 'Chapters 08 & 13',
    chapterId: 8,
    title: 'Lab 03: Support Vector Machines (SVM), Scaling & PCA',
    algorithm: 'SVM + PCA',
    csvFilename: 'cell_biopsy_svm.csv',
    pyFilename: 'lab03_svm_and_pca.py',
    recordCountLabel: '20 records · 3 numeric features · Binary class',
    taskSummary:
      'Standardize biopsy measurements with StandardScaler, compare Linear vs. RBF Kernel SVMs across C values, inspect Support Vectors, and compress features to 2D via PCA.',
    learningObjectives: [
      'Fit StandardScaler strictly on X_train before transforming X_test (avoid data leakage).',
      'Train Linear and RBF SVC models and count support vectors via clf.n_support_.',
      'Project the standardized features with PCA(n_components=2) and inspect explained_variance_ratio_.',
    ],
    columns: ['Mean_Radius', 'Mean_Texture', 'Concavity', 'Malignant'],
    rows: TUMOR_SVM_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 03: Support Vector Machines (SVM), Standardization & PCA
Dataset: cell_biopsy_svm.csv
"""
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.decomposition import PCA

df = pd.read_csv("cell_biopsy_svm.csv")
X = df[["Mean_Radius", "Mean_Texture", "Concavity"]].values
y = df["Malignant"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# 1. Fit StandardScaler strictly on X_train
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# 2. Compare Linear vs. RBF Kernel SVM across soft-margin C values
for kernel in ["linear", "rbf"]:
    for c_val in [0.2, 1.0, 10.0]:
        # TODO: Initialize and fit SVC(kernel=kernel, C=c_val)
        clf = SVC(kernel=kernel, C=c_val)
        clf.fit(X_train_s, y_train)
        print(
            f"kernel={kernel:6s} C={c_val:4.1f} | "
            f"Support Vectors={sum(clf.n_support_):2d} | "
            f"Test Acc={clf.score(X_test_s, y_test):.2%}"
        )

# 3. Dimensionality Reduction via PCA
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_train_s)
print("\\nPCA Explained Variance Ratio:", pca.explained_variance_ratio_.round(4))
`,
  },
  {
    id: 'knn',
    stageRef: 'Chapter 09',
    chapterId: 9,
    title: 'Lab 04: K-Nearest Neighbors & Overfitting Curve',
    algorithm: 'K-Nearest Neighbors',
    csvFilename: 'iris.csv',
    pyFilename: 'lab04_knn_iris.py',
    recordCountLabel: '30 records · 4 features · 3 flower species',
    taskSummary:
      'Code Euclidean distance and majority voting from scratch on iris.csv, then compare Train vs. Test accuracy across k = 1, 3, 5, 9 to observe the bias-variance trade-off.',
    learningObjectives: [
      'Compute vectorized Euclidean distances between a query flower and all training samples.',
      'Implement majority-vote prediction among the k nearest neighbors.',
      'Compare Train vs. Test accuracy for k = 1, 3, 5, and 9.',
    ],
    columns: ['Sepal_Length', 'Sepal_Width', 'Petal_Length', 'Petal_Width', 'Species'],
    rows: IRIS_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 04: K-Nearest Neighbors — Euclidean Distance & Majority Voting
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
    distances = [euclidean_distance(x_query, row) for row in X_tr]
    nearest_idx = np.argsort(distances)[:k]
    return Counter(y_tr[nearest_idx]).most_common(1)[0][0]

for k in [1, 3, 5, 9]:
    preds = [knn_predict_one(X_train, y_train, xq, k) for xq in X_test]
    test_acc = np.mean(np.array(preds) == y_test)
    sk = KNeighborsClassifier(n_neighbors=k).fit(X_train, y_train)
    print(f"k = {k:2d} | Custom Test Acc = {test_acc:.2%} | Sklearn Train Acc = {sk.score(X_train, y_train):.2%}")
`,
  },
  {
    id: 'decision-trees',
    stageRef: 'Chapters 09 & 11',
    chapterId: 11,
    title: 'Lab 05: Decision Trees, Entropy & Random Forests',
    algorithm: 'Trees & Ensembles',
    csvFilename: 'weather_nominal.csv',
    pyFilename: 'lab05_trees_and_forest.py',
    recordCountLabel: '14 records · Classic Play Tennis dataset',
    taskSummary:
      'Compute Shannon Entropy and Information Gain by hand on weather_nominal.csv, then compare a single DecisionTreeClassifier against a RandomForestClassifier ensemble.',
    learningObjectives: [
      'Write a clean entropy(labels) function using base-2 logarithms.',
      'Calculate Information Gain for Outlook, Temperature, Humidity, and Wind.',
      'Compare single-tree variance against RandomForestClassifier ensemble stability.',
    ],
    columns: ['Outlook', 'Temperature', 'Humidity', 'Wind', 'Play_Tennis'],
    rows: WEATHER_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 05: Decision Trees & Random Forests (Play Tennis)
Dataset: weather_nominal.csv
"""
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv("weather_nominal.csv")
target_col = "Play_Tennis"

def entropy(series: pd.Series) -> float:
    probs = series.value_counts(normalize=True).values
    # TODO: Return -np.sum(probs * np.log2(probs))
    raise NotImplementedError("Implement Shannon entropy")

def information_gain(data: pd.DataFrame, feature: str, target: str) -> float:
    base_h = entropy(data[target])
    weighted_h = sum((len(sub) / len(data)) * entropy(sub[target]) for _, sub in data.groupby(feature))
    return base_h - weighted_h

for feat in ["Outlook", "Temperature", "Humidity", "Wind"]:
    print(f"Information Gain ({feat:11s}): {information_gain(df, feat, target_col):.4f}")

X_enc = pd.get_dummies(df.drop(columns=[target_col]))
y_bin = (df[target_col] == "Yes").astype(int)
tree = DecisionTreeClassifier(criterion="entropy", max_depth=3, random_state=42).fit(X_enc, y_bin)
forest = RandomForestClassifier(n_estimators=25, random_state=42).fit(X_enc, y_bin)
print("\\nSingle Tree Acc:", tree.score(X_enc, y_bin), "| Random Forest Acc:", forest.score(X_enc, y_bin))
print(export_text(tree, feature_names=list(X_enc.columns)))
`,
  },
  {
    id: 'naive-bayes',
    stageRef: 'Chapter 10',
    chapterId: 10,
    title: 'Lab 06: Naive Bayes Spam Filter & Laplace Smoothing',
    algorithm: 'Naive Bayes',
    csvFilename: 'sms_spam_sample.csv',
    pyFilename: 'lab06_naive_bayes_spam.py',
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
Lab 06: Multinomial Naive Bayes — Spam Filter & Laplace Smoothing
Dataset: sms_spam_sample.csv
"""
from collections import Counter
import pandas as pd

df = pd.read_csv("sms_spam_sample.csv")

def tokenize(text: str):
    cleaned = "".join(ch.lower() if ch.isalpha() or ch.isspace() else " " for ch in text)
    return [w for w in cleaned.split() if len(w) > 1]

spam_words, ham_words = Counter(), Counter()
for _, row in df.iterrows():
    (spam_words if row["Label"] == "spam" else ham_words).update(tokenize(row["Message"]))

vocab = set(spam_words.keys()) | set(ham_words.keys())
p_spam = (df["Label"] == "spam").mean()
p_ham = (df["Label"] == "ham").mean()

def predict_message(text: str, alpha: float = 1.0):
    total_spam, total_ham, V = sum(spam_words.values()), sum(ham_words.values()), len(vocab)
    score_spam, score_ham = p_spam, p_ham
    for word in tokenize(text):
        # TODO: Apply Laplace smoothing (count + alpha) / (total + alpha * V)
        score_spam *= (spam_words[word] + alpha) / (total_spam + alpha * V)
        score_ham *= (ham_words[word] + alpha) / (total_ham + alpha * V)
    total = score_spam + score_ham
    if total == 0:
        return {"P(Spam)": 0.0, "P(Ham)": 0.0, "note": "ZERO-FREQUENCY COLLAPSE!"}
    return {"P(Spam)": round(score_spam / total, 4), "P(Ham)": round(score_ham / total, 4)}

test_sms = "WINNER claim your FREE crypto prize"
print("Without Smoothing (alpha=0):", predict_message(test_sms, alpha=0.0))
print("With Laplace (+1) (alpha=1):", predict_message(test_sms, alpha=1.0))
`,
  },
  {
    id: 'neural-network-xor',
    stageRef: 'Chapters 14 & 15',
    chapterId: 14,
    title: 'Lab 07: Multi-Layer Neural Network & Backpropagation (XOR)',
    algorithm: 'Neural Network (MLP)',
    csvFilename: 'xor_corners_nn.csv',
    pyFilename: 'lab07_mlp_backprop.py',
    recordCountLabel: '16 records · Non-Linear XOR Quadrants',
    taskSummary:
      'Implement forward propagation and chain-rule backpropagation for a 2-layer neural network in pure NumPy to solve the classic non-linear XOR problem.',
    learningObjectives: [
      'Implement ReLU and Sigmoid activation functions along with their exact derivatives.',
      'Code one full Forward Pass and Chain-Rule Backward Pass updating W1, b1, W2, b2.',
      'Verify why a single linear layer stalls near 50% while a 2-layer MLP reaches 100%.',
    ],
    columns: ['X1', 'X2', 'XOR_Label'],
    rows: XOR_NN_ROWS,
    colabUrl: 'https://colab.research.google.com/#create=true',
    starterCode: `"""
Lab 07: Multi-Layer Perceptron & Backpropagation from Scratch (NumPy)
Dataset: xor_corners_nn.csv
"""
import numpy as np
import pandas as pd

df = pd.read_csv("xor_corners_nn.csv")
X = df[["X1", "X2"]].values
y = df["XOR_Label"].values.reshape(-1, 1)

rng = np.random.default_rng(42)
W1 = rng.normal(0, 1, (2, 4))
b1 = np.zeros((1, 4))
W2 = rng.normal(0, 1, (4, 1))
b2 = np.zeros((1, 1))

def relu(z): return np.maximum(0, z)
def relu_grad(z): return (z > 0).astype(float)
def sigmoid(z): return 1 / (1 + np.exp(-z))

lr = 0.25
for epoch in range(1, 1001):
    # Forward Pass
    Z1 = X @ W1 + b1
    H1 = relu(Z1)
    Z2 = H1 @ W2 + b2
    y_hat = sigmoid(Z2)

    # TODO: Compute Binary Cross-Entropy gradients via Chain Rule
    m = len(X)
    dZ2 = (y_hat - y) / m
    dW2 = H1.T @ dZ2
    db2 = np.sum(dZ2, axis=0, keepdims=True)

    dH1 = dZ2 @ W2.T
    dZ1 = dH1 * relu_grad(Z1)
    dW1 = X.T @ dZ1
    db1 = np.sum(dZ1, axis=0, keepdims=True)

    # Update Weights
    W1 -= lr * dW1; b1 -= lr * db1
    W2 -= lr * dW2; b2 -= lr * db2

    if epoch % 250 == 0:
        acc = np.mean((y_hat >= 0.5) == y)
        print(f"Epoch {epoch:4d} | Accuracy = {acc:.2%}")
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
