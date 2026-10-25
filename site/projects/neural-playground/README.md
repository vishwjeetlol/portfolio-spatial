# Neural Playground

A live neural network training sandbox written completely from scratch in TypeScript/JavaScript without any third-party ML or linear algebra libraries.

## What It Is
An interactive 2D binary classification simulator that visualizes how multilayer perceptrons partition continuous feature spaces. Users select datasets (interlocking spirals, concentric circles, XOR), customize layer depth and width, and observe the decision boundary warp in real time as backpropagation executes.

## How It Works
- **Architecture:** Configurable feedforward neural network with Xavier weight initialization.
- **Activations:** Hyperbolic tangent (`tanh`) for hidden layers, logistic sigmoid for final binary probability output.
- **Optimization:** Analytical gradient backpropagation updating weights and biases via stochastic mini-batch gradient descent.
- **Rendering:** Direct 2D HTML5 canvas pixel buffer manipulation for high-speed decision field rendering.

## How To Run
Open `index.html` directly in any modern web browser or serve statically using `npx serve`.
