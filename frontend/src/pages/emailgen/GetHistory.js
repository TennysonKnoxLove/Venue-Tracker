import { useEffect } from 'react';
import { emailService } from '../../api';

export function useOutreachHistory({ setOutreachHistory, setHistoryLoading }) {
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const history = await emailService.getOutreachHistory();
        setOutreachHistory(history);
      } catch (err) {
        console.error('Failed to load outreach history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [setOutreachHistory, setHistoryLoading]);
}
