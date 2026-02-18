export interface TextConfig {
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface EmployeeCard {
  id: string;
  name: string;
  imageDataUrl: string | null;
  status: 'pending' | 'generating' | 'done';
}