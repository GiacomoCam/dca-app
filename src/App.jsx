
import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import InputPanel from './components/InputPanel';
import ChartPanel from './components/ChartPanel';
import ResultsPanel from './components/ResultsPanel';
import { fitData, autoFit } from './utils/fitting';

const App = () => {
  const [data, setData] = useState([]);
  const [fitConfig, setFitConfig] = useState({ modelType: 'auto' });
  const [fitResults, setFitResults] = useState(null);
  const [forecastConfig, setForecastConfig] = useState({ years: 5, qLimit: 50 });

  const handleDataLoaded = (newData) => {
    setData(newData);
    setFitResults(null); // Reset results when new data loaded
  };

  const handleFitRequest = () => {
    if (!data || data.length === 0) {
      alert("Please load data first.");
      return;
    }

    try {
      let results;
      if (fitConfig.modelType === 'auto') {
        results = autoFit(data);
      } else {
        results = fitData(data, fitConfig.modelType);
      }

      // If we got results, augment with modelType if it wasn't there (for single fit)
      if (!results.modelType) results.modelType = fitConfig.modelType;

      setFitResults(results);
    } catch (err) {
      console.error(err);
      alert("Fitting failed: " + err.message);
    }
  };

  const handleExport = () => {
    if (!fitResults) return;
    // simple CSV export logic
    // ...
    alert("Export feature coming soon! (Check console for params)");
    console.log(fitResults);
  };

  // Auto-fit optional effect? No, let user click fit.

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900">
      {/* Header */}
      <header className="flex items-center px-6 py-3 bg-slate-900 text-white shadow-md z-10">
        <Activity className="w-6 h-6 text-blue-400 mr-3" />
        <h1 className="text-lg font-bold tracking-tight">DCA Pro <span className="text-slate-500 font-normal">| Decline Curve Analysis</span></h1>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Inputs */}
        <div className="w-80 flex-shrink-0 shadow-xl z-0">
          <InputPanel
            onDataLoaded={handleDataLoaded}
            onFitRequest={handleFitRequest}
            fitConfig={fitConfig}
            setFitConfig={setFitConfig}
          />
        </div>

        {/* Center - Chart */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          <ChartPanel
            data={data}
            fitResults={fitResults}
            forecastConfig={forecastConfig}
          />
        </div>

        {/* Right Sidebar - Results */}
        <div className="w-80 flex-shrink-0 shadow-xl z-0">
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
