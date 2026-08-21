import { useCallback, useState } from 'react';
import { soundService } from '../services/soundService';

// Thin React wrapper around soundService. The play* functions are safe to
// call from anywhere (they no-op when sound is off or audio is unavailable);
// `enabled`/`setEnabled` exist for UI controls that need to reflect and
// change the stored preference.
export function useSoundEffects() {
  const [enabled, setEnabledState] = useState(soundService.isEnabled);

  const setEnabled = useCallback(value => {
    soundService.setEnabled(value);
    setEnabledState(value);
  }, []);

  return {
    enabled,
    setEnabled,
    playHeartbeat: soundService.playHeartbeat,
    playSuccess: soundService.playSuccess,
    playAlert: soundService.playAlert,
    playReview: soundService.playReview
  };
}
