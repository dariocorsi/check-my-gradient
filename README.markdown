# Check My Gradient

A tool to check if text color passes [WCAG 2.0 contrast requirements](https://www.w3.org/TR/WCAG21/#contrast-minimum) on a gradient background.

## The Logic

1. Render a 100-step gradient on a `<canvas>`.
2. Sample each rendered step of the gradient.
3. Use [TinyColor](https://github.com/bgrins/TinyColor) to get the contrast ratio of the text color on each step.
4. Create an accessibility report based on the **lowest contrast ratio**.