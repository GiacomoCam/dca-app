import { levenbergMarquardt as LM } from 'ml-levenberg-marquardt';
import { q_t } from './arps';

const DAYS_PER_MONTH = 30.4375;
const toMonths = (days) => days / DAYS_PER_MONTH;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const DEFAULT_QI_SPAN = 1;

const ensureValidRange = (min, max, fallbackSpan = DEFAULT_QI_SPAN) => {
    const finiteMin = Number.isFinite(min) ? min : 0;
    const finiteMax = Number.isFinite(max) ? max : finiteMin + fallbackSpan;

    if (finiteMax <= finiteMin) {
        return [finiteMin, finiteMin + Math.max(fallbackSpan, 1e-6)];
    }

    return [finiteMin, finiteMax];
};

const toUnbounded = (value, min, max) => {
    const safeValue = clamp(value, min + 1e-9, max - 1e-9);
    return Math.log((safeValue - min) / (max - safeValue));
};

const fromUnbounded = (value, min, max) => {
    const sigmoid = 1 / (1 + Math.exp(-value));
    return min + (max - min) * sigmoid;
};

const evaluateMetrics = (x, y, modelType, params) => {
    const yPred = x.map((t) => q_t(t, params.qi, params.Di, params.b));
    const residuals = y.map((yi, i) => yi - yPred[i]);
    const sse = residuals.reduce((sum, r) => sum + r * r, 0);
    const rmse = Math.sqrt(sse / y.length);
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;
    const sst = y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0);
    const r2 = sst === 0 ? 1 : 1 - (sse / sst);
    const k = modelType === 'hyperbolic' ? 3 : 2;
    const n = y.length;
    const safeSse = Math.max(sse, 1e-12);
    const aic = 2 * k + n * Math.log(safeSse / n);

    return { sse, rmse, r2, aic, yPred };
};

const buildCandidateGuesses = (firstRate, modelType) => {
    const diGuesses = [0.08, 0.15, 0.3];
    const qiGuesses = [firstRate, firstRate * 0.95, firstRate * 1.05];
    const bGuesses = modelType === 'hyperbolic' ? [0.3, 0.5, 0.8, 1.0] : [modelType === 'harmonic' ? 1 : 0];

    const candidates = [];
    qiGuesses.forEach((qi) => {
        diGuesses.forEach((Di) => {
            bGuesses.forEach((b) => {
                candidates.push([qi, Di, b]);
            });
        });
    });

    return candidates;
};

/**
 * Fit Arps model to data
 * @param {Array<{t: number, q: number}>} data - Data points (t in days, q in rate)
 * @param {string} modelType - 'exponential' | 'hyperbolic' | 'harmonic'
 * @param {Object} options - { bounds, initialGuess }
 */
export const fitData = (data, modelType, options = {}) => {
    const firstRate = data[0].q;
    const maxRate = data.reduce((max, { q }) => Math.max(max, q), 0);
    const qiLowerDefault = Math.max(1e-6, firstRate * 0.5);
    const qiUpperTarget = Math.max(firstRate * 1.5, maxRate * 1.05, firstRate + 1e-6);
    const [qiLower, qiUpper] = ensureValidRange(qiLowerDefault, qiUpperTarget, Math.max(maxRate, DEFAULT_QI_SPAN));
    const {
        initialGuess = [firstRate, 0.15, 0.5], // [qi, Di/month, b]
        bounds = {
            qi: [qiLower, qiUpper],
            Di: [0.001, 2.0],
            b: [0, 2.0]
        }
    } = options;

    const normalizedBounds = {
        qi: ensureValidRange(bounds.qi[0], bounds.qi[1], Math.max(maxRate, DEFAULT_QI_SPAN)),
        Di: ensureValidRange(bounds.Di[0], bounds.Di[1], 0.1),
        b: ensureValidRange(bounds.b[0], bounds.b[1], 0.1)
    };

    // Convert days to months so Di remains in 1/month
    const x = data.map((d) => toMonths(d.t));
    const y = data.map((d) => d.q);

    const candidateGuesses = [initialGuess, ...buildCandidateGuesses(firstRate, modelType)];
    let bestResult = null;

    candidateGuesses.forEach((candidate) => {
        const clamped = {
            qi: clamp(candidate[0], normalizedBounds.qi[0], normalizedBounds.qi[1]),
            Di: clamp(candidate[1], normalizedBounds.Di[0], normalizedBounds.Di[1]),
            b: clamp(candidate[2], normalizedBounds.b[0], normalizedBounds.b[1])
        };

        const initialValues =
            modelType === 'hyperbolic'
                ? [
                    toUnbounded(clamped.qi, normalizedBounds.qi[0], normalizedBounds.qi[1]),
                    toUnbounded(clamped.Di, normalizedBounds.Di[0], normalizedBounds.Di[1]),
                    toUnbounded(clamped.b, normalizedBounds.b[0], normalizedBounds.b[1])
                ]
                : [
                    toUnbounded(clamped.qi, normalizedBounds.qi[0], normalizedBounds.qi[1]),
                    toUnbounded(clamped.Di, normalizedBounds.Di[0], normalizedBounds.Di[1])
                ];

        const arpsModel = (u) => {
            const qi = fromUnbounded(u[0], normalizedBounds.qi[0], normalizedBounds.qi[1]);
            const Di = fromUnbounded(u[1], normalizedBounds.Di[0], normalizedBounds.Di[1]);
            const b =
                modelType === 'hyperbolic'
                    ? fromUnbounded(u[2], normalizedBounds.b[0], normalizedBounds.b[1])
                    : modelType === 'harmonic'
                        ? 1
                        : 0;
            return (t) => q_t(t, qi, Di, b);
        };

        const optionsLM = {
            damping: 1.5,
            initialValues,
            gradientDifference: 1e-2,
            maxIterations: 200,
            errorTolerance: 1e-8
        };

        try {
            const fittedModel = LM({ x, y }, arpsModel, optionsLM);
            const [uQi, uDi, uB] = fittedModel.parameterValues;
            const params = {
                qi: fromUnbounded(uQi, normalizedBounds.qi[0], normalizedBounds.qi[1]),
                Di: fromUnbounded(uDi, normalizedBounds.Di[0], normalizedBounds.Di[1]),
                b: modelType === 'hyperbolic' ? fromUnbounded(uB, normalizedBounds.b[0], normalizedBounds.b[1]) : modelType === 'harmonic' ? 1 : 0
            };

            const metrics = evaluateMetrics(x, y, modelType, params);
            const qiDeviation = Math.abs(params.qi - firstRate) / Math.max(firstRate, 1e-9);

            const result = {
                params,
                metrics,
                status: fittedModel.parameterError,
                iterations: fittedModel.iterations,
                qiDeviation
            };

            if (!bestResult || result.metrics.aic < bestResult.metrics.aic) {
                bestResult = result;
            }
        } catch {
            // Try next candidate
        }
    });

    if (!bestResult) {
        throw new Error(`Unable to fit ${modelType} model.`);
    }

    return bestResult;
};

export const autoFit = (data) => {
    const models = ['exponential', 'harmonic', 'hyperbolic'];
    const results = models.map((m) => ({ modelType: m, ...fitData(data, m) }));
    results.sort((a, b) => a.metrics.aic - b.metrics.aic);

    const winner = results[0];
    const runnerUp = results[1];

    return {
        ...winner,
        selectionReason: `Selected ${winner.modelType} model because it has the lowest AIC (${winner.metrics.aic.toFixed(2)} vs ${runnerUp.modelType} ${runnerUp.metrics.aic.toFixed(2)}).`,
        candidateResults: results
    };
};
