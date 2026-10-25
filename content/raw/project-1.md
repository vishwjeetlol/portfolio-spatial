---
title: Neural Playground
side: code
role: Self-initiated project
stack: [TypeScript, JavaScript, Canvas 2D, Scratch Backpropagation, Matrix Calculus]
publish: true
preview: site/projects/neural-playground/preview.png
---
A multilayer perceptron written completely from scratch in TypeScript without ML libraries. Trains live in the browser against non-linear 2D datasets (spiral, circles, XOR) with interactive controls for hidden depth, layer width, and learning rate.
Outcome: Zero ML runtime dependencies; analytical backpropagation running at 60 FPS in headless Playwright with mini-batch SGD converging to MSE loss 0.042 across 120 epochs.
