import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

interface ResultPanelProps {
  result: string | null;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  error?: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ result, status, error }) => {
  if (status === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50">
        <Activity size={48} className="mb-4 opacity-50" />
        <p className="text-lg font-medium text-center">Ready for Analysis</p>
        <p className="text-sm text-center max-w-xs mt-2">Enter patient data and clinical signs to receive a prioritized action plan.</p>
      </div>
    );
  }

  if (status === 'analyzing') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl">
        <div className="relative w-24 h-24 mb-6">
           <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
           <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Scenario...</h3>
        <p className="text-slate-400 animate-pulse">Consulting Gemini 3 Pro Reasoning Engine</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-900 rounded-xl text-red-200">
        <AlertCircle size={48} className="mb-4 text-red-500" />
        <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
        <p className="text-center">{error || "An unknown error occurred. Fallback to ACLS protocols."}</p>
      </div>
    );
  }

  return (
    <div className="bg-medical-surface rounded-xl shadow-xl border border-slate-700 overflow-hidden flex flex-col h-full animate-fadeIn">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-medical-success" />
          Action Plan
        </h2>
      </div>
      
      <div className="p-6 overflow-y-auto flex-1 custom-markdown text-slate-100">
        {/* Custom rendering of markdown for high-contrast, scannable output */}
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-red-500 mt-6 mb-4 border-b border-red-500/30 pb-2 uppercase tracking-widest" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-blue-400 mt-6 mb-3 uppercase tracking-wide flex items-center gap-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-200 mt-4 mb-2" {...props} />,
            strong: ({node, ...props}) => <span className="font-bold text-white bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm mx-1" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-3 my-2 text-slate-200" {...props} />,
            li: ({node, ...props}) => <li className="pl-1 leading-snug" {...props} />,
            p: ({node, ...props}) => <p className="mb-2 leading-relaxed text-slate-300" {...props} />,
          }}
        >
          {result || ''}
        </ReactMarkdown>
      </div>
      
      <div className="p-2 bg-slate-900 text-center border-t border-slate-800">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
          AI generated. Use clinical judgment. Not a substitute for training.
        </p>
      </div>
    </div>
  );
};