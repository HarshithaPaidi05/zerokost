export interface SystemCheckStatus {
  microphone: 'idle' | 'checking' | 'success' | 'error';
  speaker: 'idle' | 'checking' | 'success' | 'error';
  volume: 'idle' | 'checking' | 'success' | 'error';
}

export type SystemCheckType = keyof SystemCheckStatus;