export interface PatientData {
  weight: number | string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | '';
  history: string;
}

export interface CrisisState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  result: string | null;
  error?: string;
}

export type SymptomTag = {
  id: string;
  label: string;
  category: 'airway' | 'circ' | 'drugs' | 'neuro';
};
