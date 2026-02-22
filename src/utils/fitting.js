
import { levenbergMarquardt as LM } from 'ml-levenberg-marquardt';
import { q_t } from './arps';

/**
 * Fit Arps model to data
 * @param {Array<{t: number, q: number}>} data - Data points (t in days, q in rate)
 * @param {string} modelType - 'exponential' | 'hyperbolic' | 'harmonic'
 * @param {Object} options - { bounds, initialGuess }
 */
export const fitData = (data, modelType, options = {}) => {
    const {
        initialGuess = [data[0].q, 0.001, 0.5], // [qi, Di, b]
        bounds = { qi: [0, Infinity], Di: [0, Infinity], b: [0, 2] }
    } = options;

    // Prepare data for LM
    const x = data.map(d => d.t);
    const y = data.map(d => d.q);

    let pInit = [...initialGuess];

    // Define the function to optimize
    // p = [qi, Di, b]
    let arpsModel;

    if (modelType === 'exponential') {
        // Fixed b=0
        pInit = [initialGuess[0], initialGuess[1]]; // Only optimize qi, Di
        arpsModel = ([qi, Di]) => (t) => q_t(t, qi, Di, 0);
    } else if (modelType === 'harmonic') {
        // Fixed b=1
        pInit = [initialGuess[0], initialGuess[1]]; // Only optimize qi, Di
        arpsModel = ([qi, Di]) => (t) => q_t(t, qi, Di, 1);
    } else {
        // Hyperbolic b variable
        // We need to constrain b. LM library might not support hard bounds directly in the basic usage,
        // but we can dampen steps. simpler is to optimize and if result is out of bounds, clamp it or use parameter transformation.
        // For now, let's try direct fitting.
        // Parameter transformation for positivity: p = exp(param) or p^2
        // Let's use the library as is first.
        arpsModel = ([qi, Di, b]) => (t) => q_t(t, qi, Di, b);
    }

    const optionsLM = {
        damping: 1.5,
        initialValues: pInit,
        gradientDifference: 10e-2,
        maxIterations: 100,
        errorTolerance: 10e-3
    };

    const fittedModel = LM({ x, y }, arpsModel, optionsLM);

    let [qi_fit, Di_fit, b_fit] = fittedModel.parameterValues;

    // Map back to full params
    if (modelType === 'exponential') {
        b_fit = 0;
    } else if (modelType === 'harmonic') {
        b_fit = 1;
    }

    // Calculate metrics
    const yPred = x.map(t => q_t(t, qi_fit, Di_fit, b_fit));
    const residuals = y.map((yi, i) => yi - yPred[i]);
    const sse = residuals.reduce((sum, r) => sum + r * r, 0);
    const rmse = Math.sqrt(sse / y.length);
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;
    const sst = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0);
    const r2 = 1 - (sse / sst);

    // AIC = 2k + n * ln(SSE/n)
    const k = modelType === 'hyperbolic' ? 3 : 2; // num params
    const n = y.length;
    const aic = 2 * k + n * Math.log(sse / n);

    return {
        params: { qi: qi_fit, Di: Di_fit, b: b_fit },
        metrics: { sse, rmse, r2, aic },
        status: fittedModel.parameterError,
        iterations: fittedModel.iterations
    };
};

export const autoFit = (data) => {
    const models = ['exponential', 'harmonic', 'hyperbolic'];
    const results = models.map(m => ({ model: m, ...fitData(data, m) }));

    // Sort by AIC (lower is better) or RMSE
    // AIC is better for model selection penalizing complexity
    results.sort((a, b) => a.metrics.aic - b.metrics.aic);

    return results[0];
}
