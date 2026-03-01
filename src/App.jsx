import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import InputPanel from './components/InputPanel';
import ChartPanel from './components/ChartPanel';
import ResultsPanel from './components/ResultsPanel';
import { fitData, autoFit } from './utils/fitting';
import { q_t, Np_t } from './utils/arps';

const DAYS_PER_MONTH = 30.4375;

const App = () => {
  const [data, setData] = useState([]);
  const [fitConfig, setFitConfig] = useState({ modelType: 'auto' });
  const [fitResults, setFitResults] = useState(null);
  const [forecastConfig, setForecastConfig] = useState({ years: 5, qLimit: 50 });
  const [logScale, setLogScale] = useState(false);

  const handleDataLoaded = (newData) => {
    setData(newData);
    setFitResults(null);
  };

  const handleFitRequest = () => {
    if (!data || data.length === 0) {
      alert('Please load data first.');
      return;
    }

    try {
      let results;
      if (fitConfig.modelType === 'auto') {
        results = autoFit(data);
      } else {
        results = fitData(data, fitConfig.modelType);
      }

      if (!results.modelType) results.modelType = fitConfig.modelType;
      setFitResults(results);
    } catch (err) {
      console.error(err);
      alert(`Fitting failed: ${err.message}`);
    }
  };

  const handleExport = () => {
    if (!fitResults) return;

    const { params, metrics, modelType } = fitResults;
    const { years, qLimit } = forecastConfig;
    const forecastDays = data[data.length - 1].t + years * 365;
    const startDate = new Date(data[0].date);
    const rows = [['date', 'type', 't_days', 'q_rate', 'Np_cumulative']];

    data.forEach((d) => {
      const np = Np_t(d.t / DAYS_PER_MONTH, params.qi, params.Di, params.b);
      rows.push([d.date, 'history', d.t, d.q.toFixed(2), np.toFixed(2)]);
    });

    const lastHistT = data[data.length - 1].t;
    for (let t = lastHistT + 30; t <= forecastDays; t += 30) {
      const tMonths = t / DAYS_PER_MONTH;
      const q = q_t(tMonths, params.qi, params.Di, params.b);
      if (q < qLimit) break;
      const np = Np_t(tMonths, params.qi, params.Di, params.b);
      const d = new Date(startDate);
      d.setDate(d.getDate() + t);
      rows.push([d.toISOString().split('T')[0], 'forecast', t, q.toFixed(2), np.toFixed(2)]);
    }

    const summary = [
      `# DCA Export — Model: ${modelType}`,
      `# qi=${params.qi.toFixed(2)}, Di=${params.Di.toFixed(6)} /mo, b=${params.b.toFixed(4)}`,
      `# R2=${metrics.r2.toFixed(4)}, RMSE=${metrics.rmse.toFixed(2)}, AICc=${metrics.aicc.toFixed(2)}, BIC=${metrics.bic.toFixed(2)}`,
      `# Economic Limit=${qLimit}`,
      '',
    ];

    const csvContent = `${summary.join('\n')}${rows.map((r) => r.join(',')).join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dca_export_${modelType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="suite-shell">
      <header className="suite-header">
        <div className="suite-brand">
          <Activity className="h-6 w-6 text-[#8FB5DC]" />
          <h1 className="text-lg font-semibold tracking-tight text-white">
            DCA Pro <span className="text-slate-300 font-normal">| Decline Curve Analysis</span>
          </h1>
        </div>
        <nav className="suite-nav" aria-label="Portfolio navigation">
          <span className="suite-nav-current">Tool #1: DCA Pro</span>
          <a className="suite-nav-link" href="https://JaiOil-Dev.github.io/ooip-calculator/" target="_blank" rel="noreferrer">
            Tool #2: OOIP Calculator →
          </a>
        </nav>
      </header>

      <div className="suite-layout">
        <div className="w-80 flex-shrink-0">
          <InputPanel
            onDataLoaded={handleDataLoaded}
            onFitRequest={handleFitRequest}
            fitConfig={fitConfig}
            setFitConfig={setFitConfig}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <ChartPanel
            data={data}
            fitResults={fitResults}
            forecastConfig={forecastConfig}
            logScale={logScale}
            onToggleLogScale={() => setLogScale((s) => !s)}
          />
        </div>

        <div className="w-80 flex-shrink-0">
          <ResultsPanel
            fitResults={fitResults}
            forecastConfig={forecastConfig}
            setForecastConfig={setForecastConfig}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
