import React, { useState, useRef } from 'react';
import { PatientData, SymptomTag } from '../types';
import { COMMON_SYMPTOMS } from '../constants';
import { AlertTriangle, Send, Loader2, Camera, Mic, X, StopCircle } from 'lucide-react';

interface InputPanelProps {
  onAnalyze: (data: PatientData, scenario: string, image?: string | null, audio?: string | null) => void;
  isAnalyzing: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isAnalyzing }) => {
  const [patient, setPatient] = useState<PatientData>({
    weight: '',
    age: '',
    gender: 'Male',
    history: ''
  });
  const [scenario, setScenario] = useState('');
  
  // Media State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSymptomClick = (label: string) => {
    setScenario((prev) => {
      const trimmed = prev.trim();
      if (trimmed.length > 0 && !trimmed.endsWith(',')) {
        return `${trimmed}, ${label}`;
      }
      return `${trimmed} ${label}`;
    });
  };

  // --- Image Handling ---
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Audio Handling ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    audioChunksRef.current = [];
  };

  // --- Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim() && !imageFile && !audioBlob) return;

    // Convert Image to Base64
    let imageBase64: string | null = null;
    if (imageFile) {
      imageBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(imageFile);
      });
    }

    // Convert Audio to Base64
    let audioBase64: string | null = null;
    if (audioBlob) {
      audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(audioBlob);
      });
    }

    onAnalyze(patient, scenario, imageBase64, audioBase64);
  };

  return (
    <div className="bg-medical-surface rounded-xl shadow-xl border border-slate-700 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="text-medical-warning" />
          Clinical Input
        </h2>
        <span className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded">Gemini 3 Pro</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {/* Patient Data Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-1">
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Weight (kg)</label>
            <input
              type="number"
              value={patient.weight}
              onChange={(e) => setPatient({ ...patient, weight: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-lg font-bold"
              placeholder="70"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Age</label>
            <input
              type="number"
              value={patient.age}
              onChange={(e) => setPatient({ ...patient, age: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. 45"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Gender</label>
            <select
              value={patient.gender}
              onChange={(e) => setPatient({ ...patient, gender: e.target.value as any })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-[52px]"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Media Inputs (New) */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Camera Input */}
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-2">
               <label className="text-xs text-slate-400 uppercase font-bold">Monitor Waveforms</label>
               {imagePreview && <button onClick={clearImage} className="text-slate-500 hover:text-white"><X size={14}/></button>}
            </div>
            {!imagePreview ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-16 border border-dashed border-slate-600 rounded flex flex-col items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                >
                  <Camera size={20} />
                  <span className="text-[10px] mt-1">Capture Monitor</span>
                </button>
            ) : (
                <div className="relative h-16 w-full overflow-hidden rounded border border-slate-600">
                  <img src={imagePreview} alt="Monitor" className="w-full h-full object-cover" />
                </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageSelect}
              capture="environment"
            />
          </div>

          {/* Audio Input */}
          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-2">
               <label className="text-xs text-slate-400 uppercase font-bold">Monitor Audio</label>
               {audioBlob && <button onClick={clearAudio} className="text-slate-500 hover:text-white"><X size={14}/></button>}
            </div>
            {!audioBlob ? (
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full h-16 border rounded flex flex-col items-center justify-center transition-colors ${
                    isRecording 
                    ? 'bg-red-900/30 border-red-500 text-red-500 animate-pulse' 
                    : 'border-dashed border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-blue-400'
                  }`}
                >
                  {isRecording ? <StopCircle size={24} /> : <Mic size={20} />}
                  <span className="text-[10px] mt-1">{isRecording ? "Recording..." : "Record Alarms"}</span>
                </button>
            ) : (
               <div className="w-full h-16 border border-slate-600 rounded bg-slate-800 flex items-center justify-center text-green-400 gap-2">
                  <Mic size={16} />
                  <span className="text-xs font-mono">Audio Captured</span>
               </div>
            )}
          </div>
        </div>

        {/* Quick Tags */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Quick Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => handleSymptomClick(sym.label)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
                  sym.category === 'airway' ? 'bg-blue-900/30 border-blue-800 text-blue-200 hover:bg-blue-900/50' :
                  sym.category === 'circ' ? 'bg-red-900/30 border-red-800 text-red-200 hover:bg-red-900/50' :
                  sym.category === 'neuro' ? 'bg-purple-900/30 border-purple-800 text-purple-200 hover:bg-purple-900/50' :
                  'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Text Area */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 uppercase font-bold mb-2">Scenario / Vitals</label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono text-sm"
            placeholder="e.g., Sudden drop in ETCO2, hypotension 60/40, tachycardia 130..."
          />
        </div>
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing || (!scenario.trim() && !imageFile && !audioBlob)}
          className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
            isAnalyzing 
              ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
              : 'bg-medical-critical hover:bg-red-600 text-white hover:shadow-red-500/20'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" />
              Processing (Gemini 3 Pro)...
            </>
          ) : (
            <>
              <Send size={20} />
              ANALYZE CRISIS
            </>
          )}
        </button>
      </div>
    </div>
  );
};