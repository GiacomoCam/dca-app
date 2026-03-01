import React from 'react';
import { Download } from 'lucide-react';
import { time_to_limit, eur, annual_effective_decline } from '../utils/arps';
import HelpTooltip from './HelpTooltip';

const tooltipText = {
  qi: 'The production rate at the start of decline. Usually the peak rate after the well stabilizes. In bbl/day.',
  Di: 'How fast production is falling per month. 0.10 means 10% decline per month. Higher Di = faster decline.',
  b: 'Controls the shape of the decline curve. b=0 is exponential (constant decline), b=1 is harmonic (slowest decline). Most real wells are between 0 and 1.',
  economicLimit: 'The minimum production rate where the well is still profitable. Below this rate, operating costs exceed revenue. Typically 10-50 bbl/day for conventional wells.',
  forecastHorizon: 'How many years forward to project production.',
  r2: 'Goodness of fit. 1.0 is perfect fit. Above 0.95 is good. Below 0.90 means the model may not represent this well accurately.',
  aicc: 'Model selection score. Lower is better. Used to choose between exponential, hyperbolic, and harmonic models automatically.',
  eur: 'Estimated Ultimate Recovery — total oil this well will produce before reaching economic limit. The most important number for investors.',
  annualEffectiveDecline: 'The yearly version of decline rate. Easier to compare wells. 50% annual decline means production halves every year.',
  nominalDi: 'Monthly decline rate used in the Arps equations. Technical parameter — use Annual Effective Decline for business conversations.',
};

const LabeledText = ({ label, text }) => (
  <span className="text-sm text-slate-700 font-medium inline-flex items-center">
    {label}
    <HelpTooltip text={text} />
  </span>
);

const ResultsPanel = ({ fitResults, forecastConfig, setForecastConfig, onExport }) => {
  if (!fitResults) {
    return (
      <div className="suite-panel h-full p-8 flex flex-col items-center justify-center text-slate-500 border-l-0">
        <p className="text-center">Load data and fit model to see results</p>
      </div>
    );
  }

  const { params, metrics, modelType, selectionReason, qiDeviation } = fitResults;
  const fmt = (n, d = 4) => n?.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) ?? '-';
  const fmtPct = (n) => (n != null ? `${(n * 100).toFixed(1)}%` : '-');

  const annualDe = annual_effective_decline(params.Di, params.b);
  const eurValue = eur(forecastConfig.qLimit, params.qi, params.Di, params.b);
  const timeToLimitMonths = time_to_limit(forecastConfig.qLimit, params.qi, params.Di, params.b);

  return (
    <div className="suite-panel flex flex-col h-full overflow-y-auto w-80 border-l-0">
      <div className="suite-panel-header p-4">
        <h2 className="text-lg font-semibold text-[#1B3A5C]">Results</h2>
      </div>

      <div className="p-4 space-y-6 flex-1">
        <div className="bg-white rounded-lg border border-[#C7D4E3] shadow-sm p-4">
          <h3 className="text-xs font-bold text-[#1B3A5C] uppercase mb-3 text-center">Fitted Parameters</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <LabeledText label="qi" text={tooltipText.qi} />
              <span className="text-sm font-mono text-slate-900 bg-[#EEF4FB] px-2 py-0.5 rounded">{fmt(params.qi, 1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <LabeledText label="Nominal Di (/mo)" text={tooltipText.nominalDi} />
              <span className="text-sm font-mono text-slate-900 bg-[#EEF4FB] px-2 py-0.5 rounded">{fmt(params.Di, 5)}</span>
            </div>
            <div className="flex justify-between items-center">
              <LabeledText label="Annual Effective Decline" text={tooltipText.annualEffectiveDecline} />
              <span className="text-sm font-mono text-slate-900 bg-[#EEF4FB] px-2 py-0.5 rounded">{fmtPct(annualDe)}</span>
            </div>
            <div className="flex justify-between items-center">
              <LabeledText label="b factor" text={tooltipText.b} />
              <span className="text-sm font-mono text-slate-900 bg-[#EEF4FB] px-2 py-0.5 rounded">{fmt(params.b, 3)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
            Model: <span className="font-semibold text-[#2E75B6] capitalize">{modelType}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#C7D4E3] shadow-sm p-4">
          <h3 className="text-xs font-bold text-[#1B3A5C] uppercase mb-3 text-center">Goodness of Fit</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-2 bg-[#F3F7FC] rounded">
              <span className="text-xs text-slate-500">RMSE</span>
              <span className="text-sm font-semibold text-slate-800">{fmt(metrics.rmse, 2)}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[#F3F7FC] rounded">
              <span className="text-xs text-slate-500 inline-flex items-center">R²<HelpTooltip text={tooltipText.r2} /></span>
              <span className="text-sm font-semibold text-slate-800">{fmt(metrics.r2, 4)}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[#F3F7FC] rounded">
              <span className="text-xs text-slate-500 inline-flex items-center">AICc<HelpTooltip text={tooltipText.aicc} /></span>
              <span className="text-sm font-semibold text-slate-800">{fmt(metrics.aicc, 1)}</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-[#F3F7FC] rounded">
              <span className="text-xs text-slate-500">BIC</span>
              <span className="text-sm font-semibold text-slate-800">{fmt(metrics.bic, 1)}</span>
            </div>
          </div>
        </div>

        {selectionReason && (
          <div className="bg-[#E8F2FC] rounded-lg border border-[#BFD6EF] shadow-sm p-4">
            <h3 className="text-xs font-bold text-[#1B3A5C] uppercase mb-2 text-center">Auto Model Selection</h3>
            <p className="text-xs text-[#173754] leading-relaxed">{selectionReason}</p>
          </div>
        )}

        {typeof qiDeviation === 'number' && qiDeviation > 0.15 && (
          <div className="bg-amber-50 rounded-lg border border-amber-100 shadow-sm p-4">
            <h3 className="text-xs font-bold text-amber-700 uppercase mb-2 text-center">Fit Quality Warning</h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              Fitted qi differs from the first data point by {(qiDeviation * 100).toFixed(1)}%. This can indicate an issue with fitting window or data quality.
            </p>
          </div>
        )}

        {params.b > 1.0 && (
          <div className="bg-orange-50 rounded-lg border border-orange-100 shadow-sm p-4">
            <h3 className="text-xs font-bold text-orange-700 uppercase mb-2 text-center">Unconventional Well Warning</h3>
            <p className="text-xs text-orange-900 leading-relaxed">
              b = {params.b.toFixed(3)} &gt; 1.0 is typical of transient flow in tight/unconventional wells. A terminal decline rate (Modified Hyperbolic) should be applied for reserves estimation to avoid overestimating EUR.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-[#C7D4E3] shadow-sm p-4">
          <h3 className="text-xs font-bold text-[#1B3A5C] uppercase mb-3 text-center">Forecast</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 inline-flex items-center">
                Forecast Horizon (Years)
                <HelpTooltip text={tooltipText.forecastHorizon} />
              </label>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={forecastConfig.years}
                onChange={(e) => setForecastConfig((prev) => ({ ...prev, years: Number.parseInt(e.target.value, 10) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2E75B6]"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1y</span>
                <span className="font-semibold text-[#2E75B6]">{forecastConfig.years} years</span>
                <span>50y</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 inline-flex items-center">
                Economic Limit (rate)
                <HelpTooltip text={tooltipText.economicLimit} />
              </label>
              <input
                type="number"
                value={forecastConfig.qLimit}
                onChange={(e) => setForecastConfig((prev) => ({ ...prev, qLimit: Number.parseFloat(e.target.value) }))}
                className="suite-input px-2 py-1.5 text-sm"
              />
            </div>

            <div className="p-3 bg-[#ECF7F0] rounded border border-[#BFE5CC] flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-800">Time to Limit:</span>
                <span className="font-bold text-green-900">{timeToLimitMonths === Infinity ? 'Never' : `${(timeToLimitMonths / 12).toFixed(1)} years`}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-800 inline-flex items-center">EUR at Limit<HelpTooltip text={tooltipText.eur} /></span>
                <span className="font-bold text-green-900">
                  {eurValue != null && Number.isFinite(eurValue) ? eurValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#F4F8FC] border-t border-[#C7D4E3] space-y-2">
        <button onClick={onExport} className="suite-button-secondary w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded shadow-sm">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
    </div>
  );
};

export default ResultsPanel;
