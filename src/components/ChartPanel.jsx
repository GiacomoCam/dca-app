
import React from 'react';
import Plot from 'react-plotly.js';
import { q_t } from '../utils/arps';

const DAYS_PER_MONTH = 30.4375;

const ChartPanel = ({ data, fitResults, forecastConfig }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                <p className="text-xl font-light">No Data Loaded</p>
                <p className="text-sm">Use the panel on the left to upload or paste production data.</p>
            </div>
        );
    }

    // Prepare plot data
    const plotData = [
        {
            x: data.map(d => d.date),
            y: data.map(d => d.q),
            type: 'scatter',
            mode: 'markers',
            marker: { color: '#94a3b8', size: 4 }, // slate-400
            name: 'History',
        }
    ];

    if (fitResults) {
        const { params } = fitResults;
        const { years } = forecastConfig;

        // Generate fit line (History portion)
        // We used t (days from start) for fitting.
        // Let's generate a smooth line
        const maxT = data[data.length - 1].t;
        const forecastT = maxT + (years * 365);

        const smoothX = [];
        const smoothY = [];
        const startDate = new Date(data[0].date);

        // Create more granular points for smooth curve
        const steps = 200;
        for (let i = 0; i <= steps; i++) {
            const t = (forecastT * i) / steps;
            const q = q_t(t / DAYS_PER_MONTH, params.qi, params.Di, params.b);

            const d = new Date(startDate);
            d.setDate(d.getDate() + t); // add days

            smoothX.push(d.toISOString().split('T')[0]);
            smoothY.push(q);
        }

        plotData.push({
            x: smoothX,
            y: smoothY,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#2563eb', width: 2 }, // blue-600
            name: 'Fit & Forecast'
        });
    }

    return (
        <div className="flex-1 bg-white relative p-4" style={{ minHeight: '400px' }}>
            <div className="absolute inset-0 p-4">
                <Plot
                    data={plotData}
                    layout={{
                        autosize: true,
                        title: 'Production Rate vs Time',
                        font: { family: 'Inter, sans-serif' },
                        showlegend: true,
                        legend: { x: 1, xanchor: 'right', y: 1 },
                        xaxis: {
                            title: 'Date',
                            gridcolor: '#e2e8f0',
                        },
                        yaxis: {
                            title: 'Rate',
                            type: 'linear', // Can toggle logic in parent if needed
                            range: [0, null],
                            rangemode: 'tozero',
                            gridcolor: '#e2e8f0',
                        },
                        margin: { t: 40, r: 20, b: 40, l: 60 },
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: true }}
                />
            </div>
        </div>
    );
};

export default ChartPanel;
