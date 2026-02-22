/**
 * Arps Decline Curve Analysis Utility Functions
 *
 * Variable Definitions:
 * qi: Initial rate (volume/time)
 * Di: Nominal decline rate (1/time)
 * b:  Hyperbolic exponent (dimensionless)
 * t:  Time (consistent with Di units)
 */

/**
 * Calculate rate at time t
 */
export const q_t = (t, qi, Di, b) => {
    if (t < 0) return qi; // Should not happen but safety check

    // Exponential (b=0)
    if (Math.abs(b) < 1e-6) {
        return qi * Math.exp(-Di * t);
    }

    // Harmonic (b=1)
    if (Math.abs(b - 1) < 1e-6) {
        return qi / (1 + Di * t);
    }

    // Hyperbolic (0 < b < 1 or b > 1)
    return qi / Math.pow(1 + b * Di * t, 1 / b);
};

/**
 * Calculate Cumulative Production (Np) at time t
 * standard closed form integration of q(t) dt from 0 to t
 */
export const Np_t = (t, qi, Di, b) => {
    const qt = q_t(t, qi, Di, b);

    // Exponential (b=0)
    if (Math.abs(b) < 1e-6) {
        return (qi - qt) / Di;
    }

    // Harmonic (b=1)
    if (Math.abs(b - 1) < 1e-6) {
        return (qi / Di) * Math.log(qi / qt);
    }

    // Hyperbolic
    return (Math.pow(qi, b) / ((1 - b) * Di)) * (Math.pow(qi, 1 - b) - Math.pow(qt, 1 - b));
};

/**
 * Calculate time to reach economic limit rate (q_limit)
 */
export const time_to_limit = (q_limit, qi, Di, b) => {
    if (q_limit >= qi) return 0;
    if (q_limit <= 0) return Infinity;

    // Exponential (b=0)
    if (Math.abs(b) < 1e-6) {
        // q = qi * exp(-Di*t) => ln(q/qi) = -Di*t => t = -ln(q/qi)/Di = ln(qi/q)/Di
        return Math.log(qi / q_limit) / Di;
    }

    // Harmonic (b=1)
    if (Math.abs(b - 1) < 1e-6) {
        // q = qi / (1 + Di*t) => 1 + Di*t = qi/q => t = (qi/q - 1)/Di
        return (qi / q_limit - 1) / Di;
    }

    // Hyperbolic
    // q = qi / (1 + b*Di*t)^(1/b)
    // (qi/q)^b = 1 + b*Di*t
    // t = ((qi/q)^b - 1) / (b*Di)
    return (Math.pow(qi / q_limit, b) - 1) / (b * Di);
};

/**
 * Convert Nominal Decline (Di) to Effective Decline (De)
 * De = 1 - q(1)/qi
 * Usually calculated over 1 period (e.g. 1 year)
 */
export const nominal_to_effective = (Di, b = 0) => {
    // Calculate q at t=1
    const q1 = q_t(1, 1, Di, b);
    return 1 - q1; // percentage drop in first unit of time
};

export const effective_to_nominal = (De, b = 0) => {
    // Inverse of above.. strictly strictly specific to period.
    // For exponential: De = 1 - exp(-Di) => Di = -ln(1-De)
    if (Math.abs(b) < 1e-6) {
        return -Math.log(1 - De);
    }
    // For others it's algebra on q(1) = 1 - De
    // q(1) = 1/(1+b*Di)^(1/b) = 1 - De
    // (1 - De)^(-b) = 1 + b*Di
    // Di = ((1 - De)^(-b) - 1) / b
    return (Math.pow(1 - De, -b) - 1) / b;
};
