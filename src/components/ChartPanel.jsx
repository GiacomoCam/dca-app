
import React from 'react';
import Plot from 'react-plotly.js';
import { q_t } from '../utils/arps';

const DAYS_PER_MONTH = 30.4375;

const ChartPanel = ({ data, fitResults, forecastConfig, logScale, onToggleLogScale }) => {
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
            marker: { color: '#64748b', size: 5, symbol: 'circle' },
            name: 'History',
        }
    ];

    if (fitResults) {
        const { params } = fitResults;
        const { years, qLimit } = forecastConfig;

        const maxT = data[data.length - 1].t;
        const forecastT = maxT + (years * 365);
        const startDate = new Date(data[0].date);
        const endHistoryDate = new Date(data[data.length - 1].date);

        // Separate fit line (history portion) from forecast line
        const fitX = [], fitY = [];
        const fcastX = [], fcastY = [];
        const steps = 300;

        for (let i = 0; i <= steps; i++) {
            const t = (forecastT * i) / steps;
            const q = q_t(t / DAYS_PER_MONTH, params.qi, params.Di, params.b);

            const d = new Date(startDate);
            d.setDate(d.getDate() + t);
            const dateStr = d.toISOString().split('T')[0];

            if (d <= endHistoryDate) {
                fitX.push(dateStr);
                fitY.push(q);
            } else {
                fcastX.push(dateStr);
                fcastY.push(q);
            }
        }

        plotData.push({
            x: fitX,
            y: fitY,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#2563eb', width: 2 },
            name: 'Fitted Curve',
        });

        plotData.push({
            x: fcastX,
            y: fcastY,
            type: 'scatter',
            mode: 'lines',
            line: { color: '#f97316', width: 2, dash: 'dash' },
            name: 'Forecast',
        });

        // Economic limit horizontal line
        if (qLimit > 0) {
            const limitStartDate = data[0].date;
            const limitEndDate = new Date(startDate);
            limitEndDate.setDate(limitEndDate.getDate() + forecastT);

            plotData.push({
                x: [limitStartDate, limitEndDate.toISOString().split('T')[0]],
                y: [qLimit, qLimit],
                type: 'scatter',
                mode: 'lines',
                line: { color: '#dc2626', width: 1, dash: 'dot' },
                name: 'Econ. Limit',
            });
        }
    }

    const yAxisType = logScale ? 'log' : 'linear';

    return (
        <div className="flex-1 bg-white relative p-4 flex flex-col" style={{ minHeight: '400px' }}>
            {/* Log scale toggle */}
            <div className="flex justify-end mb-2">
                <button
                    onClick={onToggleLogScale}
                    className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${logScale ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                >
                    {logScale ? 'Log Scale' : 'Linear Scale'}
                </button>
            </div>

            <div className="flex-1 relative">
                <div className="absolute inset-0">
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
                                type: yAxisType,
                                ...(logScale ? {} : { range: [0, null], rangemode: 'tozero' }),
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
        </div>
    );
};

export default ChartPanel;
