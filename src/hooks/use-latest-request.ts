import { useCallback, useEffect, useState } from "react";

type RequestState<K, T> = {
  key: K;
  attempt: number;
  data: T | null;
  error: string | null;
  loading: boolean;
};

// The key must describe the inputs and keep its identity until they change.
export function useLatestRequest<K, T>(
  key: K,
  load: (key: K, signal: AbortSignal) => Promise<T>,
  delay = 0
) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<RequestState<K, T>>();
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState({ key, attempt, data: null, error: null, loading: true });
    const timer = setTimeout(() => {
      Promise.resolve()
        .then(() => load(key, controller.signal))
        .then((data) => {
          if (active) setState({ key, attempt, data, error: null, loading: false });
        })
        .catch((error: unknown) => {
          if (active) setState({
            key, attempt, data: null, loading: false,
            error: error instanceof Error ? error.message : "Не удалось загрузить данные",
          });
        });
    }, delay);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, load, delay, attempt]);

  const current = state?.key === key && state.attempt === attempt ? state : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: current?.loading ?? true,
    retry,
  };
}
