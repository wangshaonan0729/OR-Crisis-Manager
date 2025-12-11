import React, { useState } from 'react';
import { InputPanel } from './components/InputPanel';
import { ResultPanel } from './components/ResultPanel';
import { CodeTimer } from './components/CodeTimer';
import { analyzeCrisis } from './services/geminiService';
import { CrisisState, PatientData } from './types';
import { HeartPulse } from 'lucide-react';

const App: React.FC = () => {
  const [crisisState, setCrisisState] = useState<CrisisState>({
    status: 'idle',
    result: null,
  });

  const handleAnalyze = async (patient: PatientData, scenario: string, image?: string | null, audio?: string | null) => {
    setCrisisState({ status: 'analyzing', result: null });
    try {
      const result = await analyzeCrisis(patient, scenario, image, audio);
      setCrisisState({ status: 'complete', result });
    } catch (error: any) {
      setCrisisState({ status: 'error', result: null, error: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-medical-bg text-slate-200 p-4 md:p-6 lg:p-8 flex flex-col font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-medical-critical/20 p-2 rounded-lg border border-medical-critical/30">
            <HeartPulse className="text-medical-critical" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">OR Crisis Manager</h1>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Gemini 3 Pro Assisted Cognitive Aid</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
            <CodeTimer />
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Column: Input (4 cols) */}
        <div className="lg:col-span-5 h-[600px] lg:h-auto flex flex-col">
          <InputPanel onAnalyze={handleAnalyze} isAnalyzing={crisisState.status === 'analyzing'} />
        </div>

        {/* Right Column: Output (8 cols) */}
        <div className="lg:col-span-7 h-[600px] lg:h-auto flex flex-col">
          <ResultPanel 
            result={crisisState.result} 
            status={crisisState.status} 
            error={crisisState.error} 
          />
        </div>
      </main>

      {/* Footer / Disclaimer */}
      <footer className="mt-8 text-center text-slate-600 text-xs">
        <p>&copy; {new Date().getFullYear()} Crisis Manager. Educational Use Only.</p>
        <p className="mt-1">
          <strong>WARNING:</strong> This tool utilizes AI (Gemini 3 Pro) for decision support. 
          Always follow institutional protocols and verify drug calculations independently.
        </p>
      </footer>
    </div>
  );
};

export default App;