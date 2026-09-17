import { openmrsFetch } from '@openmrs/esm-framework';
import { GroupSession } from '../types';
import { useEffect, useRef, useState } from 'react';

export interface UseGroupSessionsResult {
  groupSessions: Array<GroupSession>;
  setGroupSessions: (...args: any) => void;
  error: Error;
  isLoading: boolean;
  mutateGroupSessions;
  refetch: () => void;
}

type StartJobResponse = {
  jobId: string;
};

export function useGroupSessions(fromDate: Date, toDate: Date): UseGroupSessionsResult {
  const [groupSessions, setGroupSessions] = useState([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pollTimerRef = useRef<number | null>(null);
  const currentJobIdRef = useRef<string | null>(null);

  const handleRequestError = async (
    e: any,
    setError: (error: Error) => void,
    options?: {
      stopPolling?: () => void;
      setIsLoading?: (loading: boolean) => void;
    },
  ) => {
    options?.setIsLoading?.(false);
    options?.stopPolling?.();

    console.error('Request failed:', e);

    let parsedBody: any = null;

    if (e?.response) {
      try {
        const clone = typeof e.response.clone === 'function' ? e.response.clone() : e.response;
        parsedBody = await clone.json();
        console.error('Error response body:', parsedBody);
      } catch {
        console.warn('Failed to parse error response body');
      }
    }

    const message =
      parsedBody?.message?.trim() ||
      parsedBody?.errorMessage?.trim() ||
      parsedBody?.error?.trim() ||
      e?.message?.trim() ||
      'Unexpected error';

    setError(new Error(message));
  };

  const stopPolling = () => {
    if (pollTimerRef.current != null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const pollJob = (statusUrl: string, jobId: string) => {
    stopPolling();

    pollTimerRef.current = window.setInterval(async () => {
      if (currentJobIdRef.current !== jobId) {
        return;
      }

      try {
        const res = await openmrsFetch(statusUrl, { method: 'GET' });

        if (currentJobIdRef.current !== jobId) {
          return;
        }

        if (res.status === 202) {
          return;
        }

        if (res.status === 200) {
          const list = res.data?.data ?? res.data?.data?.data ?? [];
          setGroupSessions(list);
          setIsLoading(false);
          stopPolling();
          return;
        }

        setIsLoading(false);
        stopPolling();
        setError(new Error(`Unexpected status while polling: ${res.status}`));
      } catch (e: any) {
        if (currentJobIdRef.current !== jobId) return;
        await handleRequestError(e, setError, { stopPolling, setIsLoading });
      }
    }, 2000);
  };

  const startJobAndPoll = async () => {
    setIsLoading(true);
    setError(null);
    stopPolling();

    try {
      const startUrl =
        `/ws/icrc/sessions/query?fromDate=${encodeURIComponent(fromDate.toISOString())}` +
        `&toDate=${encodeURIComponent(toDate.toISOString())}`;

      const startRes = await openmrsFetch(startUrl, { method: 'POST' });

      if (startRes.status !== 202) {
        throw new Error(`Expected 202 from start job, got ${startRes.status}`);
      }

      const body = startRes.data as StartJobResponse;
      const jobId = body.jobId;
      currentJobIdRef.current = jobId;

      pollJob(`/ws/icrc/sessions/query/${jobId}`, jobId);
    } catch (e: any) {
      await handleRequestError(e, setError, { setIsLoading });
    }
  };

  useEffect(() => {
    if (!fromDate || !toDate) {
      return;
    }

    startJobAndPoll();

    return () => {
      stopPolling();
    };
  }, [fromDate?.toISOString(), toDate?.toISOString()]);

  const mutateGroupSessions = () => startJobAndPoll();

  return {
    groupSessions,
    setGroupSessions,
    error,
    isLoading,
    refetch: startJobAndPoll,
    mutateGroupSessions: mutateGroupSessions,
  };
}
