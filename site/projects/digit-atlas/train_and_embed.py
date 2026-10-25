import json
import os
import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.manifold import TSNE
from sklearn.metrics import accuracy_score, confusion_matrix

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

print("Loading bundled scikit-learn load_digits dataset...")
digits = load_digits()
X = digits.data # (1797, 64)
y = digits.target # (1797,)
images = digits.images # (1797, 8, 8)

print(f"Dataset shape: {X.shape}, labels: {np.unique(y)}")

# 1. Train/Test split for measured evaluation
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Training logistic regression classifier...")
clf = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc = float(accuracy_score(y_test, y_pred))
conf_mat = confusion_matrix(y_test, y_pred).tolist()
print(f"Measured test accuracy: {acc * 100:.2f}%")

# 2. Compute 2D t-SNE projection
print("Computing 2D t-SNE embedding for all 1,797 samples...")
tsne = TSNE(n_components=2, random_state=42, perplexity=30, max_iter=1000)
X_embedded = tsne.fit_transform(X)

# Normalize embedding to [-1, 1]
x_min, x_max = X_embedded[:, 0].min(), X_embedded[:, 0].max()
y_min, y_max = X_embedded[:, 1].min(), X_embedded[:, 1].max()
norm_x = ((X_embedded[:, 0] - x_min) / (x_max - x_min) * 2 - 1).tolist()
norm_y = ((X_embedded[:, 1] - y_min) / (y_max - y_min) * 2 - 1).tolist()

atlas_data = []
for i in range(len(X)):
    atlas_data.append({
        "id": i,
        "label": int(y[i]),
        "x": round(norm_x[i], 4),
        "y": round(norm_y[i], 4),
        "pixels": [int(p) for p in X[i]]
    })

# 3. Export model weights for pure browser inference
weights_data = {
    "numClasses": 10,
    "numFeatures": 64,
    "coef": clf.coef_.tolist(), # shape (10, 64)
    "intercept": clf.intercept_.tolist() # shape (10,)
}

metrics_data = {
    "totalSamples": len(X),
    "trainSamples": len(X_train),
    "testSamples": len(X_test),
    "testAccuracy": round(acc * 100, 2),
    "confusionMatrix": conf_mat,
    "featureDim": 64,
    "gridSize": "8x8"
}

with open(os.path.join(OUTPUT_DIR, "tsne_digits.json"), "w") as f:
    json.dump(atlas_data, f)

with open(os.path.join(OUTPUT_DIR, "model_weights.json"), "w") as f:
    json.dump(weights_data, f)

with open(os.path.join(OUTPUT_DIR, "metrics.json"), "w") as f:
    json.dump(metrics_data, f, indent=2)

print(f"SUCCESS: Exported tsne_digits.json ({len(atlas_data)} samples), model_weights.json, and metrics.json")
