import { useState, useEffect } from 'react';

/**
 * Generic data-fetching hook.
 * @param {Function} fetchFn - async function that returns a response
 * @param {Array} deps - dependency array (triggers re-fetch)
 */
const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFn()
      .then((res) => {
        if (!cancelled) setData(res.data?.data ?? res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Something went wrong');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
};

export default useFetch;
