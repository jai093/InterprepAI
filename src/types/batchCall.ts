
export interface BatchCallSession {
  id: string;
  candidate_id: string;
  phone_number: string;
  voice_id: string;
  prompts: string[];
  audio_urls: string[];
  status: 'ready' | 'calling' | 'completed' | 'failed';
  callback_url?: string;
  webhook_data?: any;
  created_at: string;
  completed_at?: string;
}

export interface BatchCallFormData {
  candidateId: string;
  phoneNumber: string;
  interviewPrompts: string[];
}
