
import React, { useState } from 'react';
import { Upload, FileText, Settings, RefreshCw, Play } from 'lucide-react';
import clsx from 'clsx';
import { generateSyntheticData, parseCSV } from '../utils/data';

const InputPanel = ({
    onDataLoaded,
    onFitRequest,
    fitConfig,
    setFitConfig,
    onReset
}) => {
    const [pasteContent, setPasteContent] = useState('');
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'params'

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            parseCSV(file, (result) => {
                if (result.error) {
                    alert(result.error);
                } else {
                    onDataLoaded(result.data);
                }
            });
        }
    };

    const handlePasteRead = () => {
        // Simple basic CSV parse for paste
        try {
            // Mock file object or use Papa.parse string
            // For now just use a simple proprietary parse
            const lines = pasteContent.trim().split('\n');
            const data = lines.slice(1).map(line => {
                const [d, r] = line.split(/[,\t]/);
                if (!d || !r) return null;
                return { date: d.trim(), rate: parseFloat(r) };
            }).filter(x => x && !isNaN(x.rate) && x.date).sort((a, b) => new Date(a.date) - new Date(b.date));

            if (data.length === 0) throw new Error("No valid data found");

            // Calculate t
            const startDate = new Date(data[0].date);
            const processed = data.map(pt => ({
                ...pt,
                originalDate: pt.date,
                t: Math.ceil((new Date(pt.date) - startDate) / (1000 * 60 * 60 * 24)),
                q: pt.rate
            }));

            onDataLoaded(processed);
        } catch (err) {
            alert("Error parsing pasted data: " + err.message);
        }
    };

    const generateExample = () => {
        const params = { qi: 2000, Di: 0.005, b: 0.4 }; // Daily nominal decline ~0.5%
        const data = generateSyntheticData(params, new Date().toISOString());
        onDataLoaded(data);
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-slate-200 overflow-y-auto">
            <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration
                </h2>
            </div>

            <div className="p-4 space-y-6">
                {/* Data Source Section */}
                <section>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Data Source</h3>

                    <div className="flex gap-2 mb-3">
                        <button
                            className={clsx("flex-1 px-3 py-2 text-sm rounded-md border", activeTab === 'upload' ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                            onClick={() => setActiveTab('upload')}
                        >
                            Upload
                        </button>
                        <button
                            className={clsx("flex-1 px-3 py-2 text-sm rounded-md border", activeTab === 'paste' ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
                            onClick={() => setActiveTab('paste')}
                        >
                            Paste
                        </button>
                    </div>

                    {activeTab === 'upload' && (
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-600">Click to upload CSV</span>
                                <span className="text-xs text-slate-400 mt-1">date, rate format</span>
                            </label>
                        </div>
                    )}

                    {activeTab === 'paste' && (
                        <div className="space-y-2">
                            <textarea
                                className="w-full h-32 p-2 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="date,rate&#10;2025-01-01,1000&#10;2025-02-01,950"
                                value={pasteContent}
                                onChange={(e) => setPasteContent(e.target.value)}
                            />
                            <button
                                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded transition-colors"
                                onClick={handlePasteRead}
                            >
                                Load Pasted Data
                            </button>
                        </div>
                    )}

                    <div className="mt-3">
                        <button
                            onClick={generateExample}
                            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-300 shadow-sm text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Generate Synthetic Data
                        </button>
                    </div>
                </section>

                {/* Model Selection */}
                <section>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Model</h3>
                    <div className="space-y-2">
                        {['exponential', 'hyperbolic', 'harmonic', 'auto'].map(m => (
                            <label key={m} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="model"
                                    value={m}
                                    checked={fitConfig.modelType === m}
                                    onChange={() => setFitConfig(prev => ({ ...prev, modelType: m }))}
                                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-700 capitalize group-hover:text-slate-900">{m}</span>
                            </label>
                        ))}
                    </div>
                </section>

                {/* Action */}
                <button
                    onClick={onFitRequest}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <Play className="w-4 h-4" />
                    Fit Curve
                </button>

            </div>
        </div>
    );
};

export default InputPanel;
