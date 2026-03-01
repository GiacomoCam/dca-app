import React from 'react';
import Plot from 'react-plotly.js';
import { q_t } from '../utils/arps';

const DAYS_PER_MONTH = 30.4375;

const ChartPanel = ({ data, fitResults, forecastConfig, logScale, onToggleLogScale }) => {
  if (!data || data.length === 0) {
    return (
      <div className="suite-panel flex-1 flex flex-col items-center justify-center text-slate-500 border-x-0">
        <p className="text-xl font-light text-[#1B3A5C]">No Data Loaded</p>
        <p className="text-sm">Use the panel on the left to upload or paste production data.</p>
      </div>
    );
  }

  const plotData = [
    {
      x: data.map((d) => d.date),
      y: data.map((d) => d.q),
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#365f86', size: 5, symbol: 'circle' },
      name: 'History',
    },
  ];

  if (fitResults) {
    const { params } = fitResults;
    const { years, qLimit } = forecastConfig;
    const maxT = data[data.length - 1].t;
    const forecastT = maxT + years * 365;
    const startDate = new Date(data[0].date);
    const endHistoryDate = new Date(data[data.length - 1].date);

    const fitX = [];
    const fitY = [];
    const fcastX = [];
    const fcastY = [];
    const steps = 300;

    for (let i = 0; i <= steps; i += 1) {
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
      line: { color: '#2E75B6', width: 2.5 },
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

  return (
    <div className="suite-panel flex-1 relative p-4 flex flex-col border-x-0" style={{ minHeight: '400px' }}>
      <div className="flex justify-end mb-2">
        <button
          onClick={onToggleLogScale}
          className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
            logScale
              ? 'bg-[#2E75B6] text-white border-[#2E75B6]'
              : 'bg-white text-[#1B3A5C] border-[#B8C9DC] hover:bg-[#F2F7FD]'
          }`}
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
              xaxis: { title: 'Date', gridcolor: '#d6e0eb' },
              yaxis: {
                title: 'Rate',
                type: logScale ? 'log' : 'linear',
                ...(logScale ? {} : { range: [0, null], rangemode: 'tozero' }),
                gridcolor: '#d6e0eb',
              },
              margin: { t: 40, r: 20, b: 40, l: 60 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
            }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;
