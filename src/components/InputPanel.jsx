import React, { useState } from 'react';
import { Upload, Settings, RefreshCw, Play } from 'lucide-react';
import clsx from 'clsx';
import { generateSyntheticData, parseCSV } from '../utils/data';

const InputPanel = ({
  onDataLoaded,
  onFitRequest,
  fitConfig,
  setFitConfig,
}) => {
  const [pasteContent, setPasteContent] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    parseCSV(file, (result) => {
      if (result.error) {
        alert(result.error);
      } else {
        onDataLoaded(result.data);
      }
    });
  };

  const handlePasteRead = () => {
    try {
      const lines = pasteContent.trim().split('\n');
      const data = lines
        .slice(1)
        .map((line) => {
          const [d, r] = line.split(/[,\t]/);
          if (!d || !r) return null;
          return { date: d.trim(), rate: Number.parseFloat(r) };
        })
        .filter((x) => x && !Number.isNaN(x.rate) && x.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (data.length === 0) throw new Error('No valid data found');

      const startDate = new Date(data[0].date);
      const processed = data.map((pt) => ({
        ...pt,
        originalDate: pt.date,
        t: Math.ceil((new Date(pt.date) - startDate) / (1000 * 60 * 60 * 24)),
        q: pt.rate,
      }));

      onDataLoaded(processed);
    } catch (err) {
      alert(`Error parsing pasted data: ${err.message}`);
    }
  };

  const generateExample = () => {
    const params = { qi: 2000, Di: 0.005, b: 0.4 };
    const data = generateSyntheticData(params, new Date().toISOString());
    onDataLoaded(data);
  };

  return (
    <div className="suite-panel flex flex-col h-full overflow-y-auto border-r-0">
      <div className="suite-panel-header p-4">
        <h2 className="text-lg font-semibold text-[#1B3A5C] flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuration
        </h2>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <h3 className="text-xs font-semibold text-[#1B3A5C] uppercase tracking-wider mb-3">Data Source</h3>

          <div className="flex gap-2 mb-3">
            <button
              className={clsx(
                'flex-1 px-3 py-2 text-sm rounded-md border',
                activeTab === 'upload'
                  ? 'bg-[#E7F0FA] border-[#2E75B6] text-[#1B3A5C]'
                  : 'border-[#C7D4E3] text-slate-600 hover:bg-[#F4F8FC]'
              )}
              onClick={() => setActiveTab('upload')}
            >
              Upload
            </button>
            <button
              className={clsx(
                'flex-1 px-3 py-2 text-sm rounded-md border',
                activeTab === 'paste'
                  ? 'bg-[#E7F0FA] border-[#2E75B6] text-[#1B3A5C]'
                  : 'border-[#C7D4E3] text-slate-600 hover:bg-[#F4F8FC]'
              )}
              onClick={() => setActiveTab('paste')}
            >
              Paste
            </button>
          </div>

          {activeTab === 'upload' && (
            <div className="border-2 border-dashed border-[#B8C9DC] rounded-lg p-6 text-center hover:bg-[#F4F8FC] transition-colors">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-[#2E75B6] mb-2" />
                <span className="text-sm text-slate-700">Click to upload CSV</span>
                <span className="text-xs text-slate-500 mt-1">date, rate format</span>
              </label>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <textarea
                className="suite-textarea h-32 p-2 text-xs font-mono resize-none"
                placeholder="date,rate&#10;2025-01-01,1000&#10;2025-02-01,950"
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
              />
              <button className="suite-button-secondary w-full py-1.5 px-3 text-xs font-medium rounded" onClick={handlePasteRead}>
                Load Pasted Data
              </button>
            </div>
          )}

          <div className="mt-3">
            <button onClick={generateExample} className="suite-button-secondary w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded shadow-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              Generate Synthetic Data
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-[#1B3A5C] uppercase tracking-wider mb-3">Model</h3>
          <div className="space-y-2">
            {['exponential', 'hyperbolic', 'harmonic', 'auto'].map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="model"
                  value={m}
                  checked={fitConfig.modelType === m}
                  onChange={() => setFitConfig((prev) => ({ ...prev, modelType: m }))}
                  className="w-4 h-4 accent-[#2E75B6]"
                />
                <span className="text-sm text-slate-700 capitalize group-hover:text-[#1B3A5C]">{m}</span>
              </label>
            ))}
          </div>
        </section>

        <button
          onClick={onFitRequest}
          className="suite-button-primary w-full py-3 font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Fit Curve
        </button>
      </div>
    </div>
  );
};

export default InputPanel;
