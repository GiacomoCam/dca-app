
import React from 'react';
import { Download } from 'lucide-react';
import { Np_t, time_to_limit, eur, annual_effective_decline } from '../utils/arps';

const ResultsPanel = ({
    fitResults,
    forecastConfig,
    setForecastConfig,
    onExport
}) => {
    if (!fitResults) {
        return (
            <div className="h-full bg-slate-50 border-l border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400">
                <p className="text-center">Load data and fit model to see results</p>
            </div>
        );
    }

    const { params, metrics, modelType, selectionReason, qiDeviation } = fitResults;

    // Format numbers helper
    const fmt = (n, d = 4) => n?.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) ?? '-';
    const fmtPct = (n) => n != null ? (n * 100).toFixed(1) + '%' : '-';

    const annualDe = annual_effective_decline(params.Di, params.b);
    const eurValue = eur(forecastConfig.qLimit, params.qi, params.Di, params.b);
    const timeToLimitMonths = time_to_limit(forecastConfig.qLimit, params.qi, params.Di, params.b);

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-y-auto w-80">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-800">Results</h2>
            </div>

            <div className="p-4 space-y-6 flex-1">
                {/* Parameters Card */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">Fitted Parameters</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-medium">qi</span>
                            <span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{fmt(params.qi, 1)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-medium" title="Nominal decline rate per month">Di (nom./mo)</span>
                            <span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{fmt(params.Di, 5)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-medium" title="Annual effective decline rate">De (ann. eff.)</span>
                            <span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{fmtPct(annualDe)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 font-medium">b</span>
                            <span className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{fmt(params.b, 3)}</span>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 text-center">
                        Model: <span className="font-semibold text-blue-600 capitalize">{modelType}</span>
                    </div>
                </div>

                {/* Metrics Card */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">Goodness of Fit</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                            <span className="text-xs text-slate-500">RMSE</span>
                            <span className="text-sm font-semibold text-slate-800">{fmt(metrics.rmse, 2)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded">
                            <span className="text-xs text-slate-500">R²</span>
                            <span className="text-sm font-semibold text-slate-800">{fmt(metrics.r2, 4)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded" title="Corrected Akaike Information Criterion — preferred for small samples">
                            <span className="text-xs text-slate-500">AICc</span>
                            <span className="text-sm font-semibold text-slate-800">{fmt(metrics.aicc, 1)}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-slate-50 rounded" title="Bayesian Information Criterion — penalizes model complexity more than AIC">
                            <span className="text-xs text-slate-500">BIC</span>
                            <span className="text-sm font-semibold text-slate-800">{fmt(metrics.bic, 1)}</span>
                        </div>
                    </div>
                </div>

                {selectionReason && (
                    <div className="bg-blue-50 rounded-lg border border-blue-100 shadow-sm p-4">
                        <h3 className="text-xs font-bold text-blue-700 uppercase mb-2 text-center">Auto Model Selection</h3>
                        <p className="text-xs text-blue-900 leading-relaxed">{selectionReason}</p>
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

                {/* Forecast Configuration */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">Forecast</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Forecast Horizon (Years)</label>
                            <input
                                type="range"
                                min="1" max="50" step="1"
                                value={forecastConfig.years}
                                onChange={(e) => setForecastConfig(prev => ({ ...prev, years: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>1y</span>
                                <span className="font-semibold text-blue-600">{forecastConfig.years} years</span>
                                <span>50y</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">Economic Limit (rate)</label>
                            <input
                                type="number"
                                value={forecastConfig.qLimit}
                                onChange={(e) => setForecastConfig(prev => ({ ...prev, qLimit: parseFloat(e.target.value) }))}
                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="p-3 bg-green-50 rounded border border-green-100 flex flex-col gap-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-green-800">Time to Limit:</span>
                                <span className="font-bold text-green-900">
                                    {timeToLimitMonths === Infinity ? 'Never' : `${(timeToLimitMonths / 12).toFixed(1)} years`}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-green-800">EUR at Limit:</span>
                                <span className="font-bold text-green-900">
                                    {eurValue != null && isFinite(eurValue) ? eurValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                <button
                    onClick={onExport}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-300 shadow-sm text-slate-700 text-sm font-semibold rounded hover:bg-slate-50 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
        </div>
    );
};

export default ResultsPanel;
