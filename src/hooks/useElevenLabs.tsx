
import { useContext } from 'react';
import { ElevenLabsContext } from '@/contexts/ElevenLabsContext';

export function useEleven() {
  const context = useContext(ElevenLabsContext);
  
  if (context === undefined) {
    throw new Error('useEleven must be used within an ElevenLabsProvider');
  }
  
  return context;
}
