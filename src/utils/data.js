
import Papa from 'papaparse';
import { q_t } from './arps';

// Box-Muller transform for Gaussian noise (mean=0, std=1)
const gaussianRandom = () => {
    let u, v;
    do { u = Math.random(); } while (u === 0);
    do { v = Math.random(); } while (v === 0);
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

/**
 * Generate synthetic production data
 */
export const generateSyntheticData = (params, startRequest, durationDays = 365 * 5, noisePercent = 0.05) => {
    const { qi, Di, b } = params;
    const data = [];

    const start = new Date(startRequest);

    for (let t = 0; t < durationDays; t += 30) { // Monthly data points
        const date = new Date(start);
        date.setDate(date.getDate() + t);

        // Exact rate
        const q_model = q_t(t, qi, Di, b);

        // Gaussian noise with std = noisePercent * q_model (realistic production variability)
        const noise = gaussianRandom() * noisePercent * q_model;
        let q = q_model + noise;
        if (q < 0) q = 0; // physical constraint

        data.push({
            date: date.toISOString().split('T')[0],
            t, // days since start
            q,
            q_model // true model rate (for reference)
        });
    }

    return data;
};

/**
 * Parse CSV Data
 * Expects: date, rate columns
 */
export const parseCSV = (file, callback) => {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
            const data = results.data;
            if (!data || data.length === 0) {
                callback({ error: "No data found" });
                return;
            }

            // Map to standard format
            // Look for date/time and rate/volume columns
            const headers = results.meta.fields.map(h => h.toLowerCase());
            const dateCol = headers.find(h => h.includes('date') || h.includes('time'));
            const rateCol = headers.find(h => h.includes('rate') || h.includes('vol') || h.includes('prod') || h.includes('q'));

            if (!dateCol || !rateCol) {
                callback({ error: "Could not identify Date or Rate columns. Please use 'date' and 'rate' headers." });
                return;
            }

            const cleanData = data.map(row => {
                // Robust date parsing? forcing string for now
                // If dynamicTyping made it a date object, great.
                // Otherwise parse string.
                return {
                    originalDate: row[results.meta.fields.find(f => f.toLowerCase() === dateCol)],
                    rate: row[results.meta.fields.find(f => f.toLowerCase() === rateCol)]
                };
            })
                .filter(d => d.originalDate && d.rate !== null && !isNaN(d.rate))
                .sort((a, b) => new Date(a.originalDate) - new Date(b.originalDate)); // Sort by date

            // Calculate 't' (days) from start
            if (cleanData.length === 0) {
                callback({ error: "No valid rows after cleaning." });
                return;
            }

            const startDate = new Date(cleanData[0].originalDate);

            const processed = cleanData.map(d => {
                const current = new Date(d.originalDate);
                const diffTime = current - startDate;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                return {
                    date: d.originalDate, // keep original string or obj
                    t: diffDays,
                    q: d.rate
                };
            });

            callback({ data: processed });
        },
        error: (err) => {
            callback({ error: err.message });
        }
    });
};
