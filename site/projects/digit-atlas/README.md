# Digit Atlas: 2D t-SNE & Browser Inference

An interactive machine learning visualizer that maps high-dimensional digit manifolds into 2D space, paired with zero-dependency client-side classification.

## What It Is
An exploratory machine learning atlas projecting 1,797 handwritten 8&times;8 digit images (scikit-learn's bundled digits benchmark) into a 2D t-SNE coordinate manifold. Users can hover over any cluster point to inspect its underlying pixel grid or draw digits by hand on an input pad for real-time in-browser classification.

## How It Works
1. **Model Training & Dimensionality Reduction (`train_and_embed.py`):**
   - Runs in a local Python virtual environment (`.venv`) using scikit-learn.
   - Evaluates on a stratified 20% holdout test set (360 samples).
   - Measured Test Accuracy: **95.83%**.
   - Generates a 2D non-linear t-SNE embedding ($perplexity=30$, $iter=1000$).
2. **Exported Static Artifacts:**
   - `tsne_digits.json`: 1,797 normalized 2D coordinate pairs and 8&times;8 pixel values.
   - `model_weights.json`: Linear model weight matrices ($10 \times 64$) and bias vectors.
   - `metrics.json`: Test metrics and 10&times;10 confusion matrix.
3. **Pure JavaScript Inference:**
   - Downsamples user canvas strokes into an $8 \times 8$ grayscale feature vector.
   - Computes dot product logits against exported weight coefficients:
     $$\hat{y} = \arg\max_{c \in [0..9]} \left( \sum_{j=0}^{63} W_{c, j} \cdot x_j + b_c \right)$$
   - Zero runtime backend or network calls required.

## How To Run
1. Run `python train_and_embed.py` in `.venv` to retrain and regenerate embeddings.
2. Open `index.html` in any modern web browser or serve statically.
