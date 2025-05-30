'use client';

import React, { useEffect, useState } from 'react';

const LogDataDisplay = () => {
  const [data, setData] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // <-- Loading state added

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // start loading
      setError(null);   // clear previous error
      try {
        const response = await fetch('/api/logs');

        if (!response.ok) {
          const json = await response.json();
          throw new Error(json.error || 'Failed to fetch data');
        }

        const logs: string[] = await response.json();

        // Only show logs where LEVEL is exactly "ERROR"
        const errorLogs = logs.filter((log) => {
          const parts = log.split('|=|');
          return parts[2]?.trim().toUpperCase() === 'ERROR';
        });

        setData(errorLogs);
      } catch (err: any) {
        setError(err.message);
        setData([]); // clear data on error
      } finally {
        setLoading(false); // done loading
      }
    };

    fetchData();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚨 Log Viewer 🚨</h1>

      {loading && <p style={styles.loading}>Loading... ⏳</p>}

      {!loading && error && <p style={styles.error}>😿 {error}</p>}

      {!loading && !error && data.length === 0 && <p style={styles.loading}>No error logs found... 💤</p>}

      {!loading && !error && data.length > 0 && (
        <ul style={styles.list}>
          {data.map((item, index) => (
            <li key={index} style={styles.item}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#17182d',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: 'Comic Sans MS, cursive, sans-serif',
  },
  title: {
    color: '#cf184a',
    fontSize: '2rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    display: 'grid',
    gap: '1rem',
  },
  item: {
    backgroundColor: '#8e306c',
    padding: '1rem',
    borderRadius: '10px',
    border: '2px solid #ca8c10',
    boxShadow: '0 0 10px #cf184a99',
    whiteSpace: 'pre-wrap',
    fontSize: '0.9rem',
  },
  label: {
    color: '#ca8c10',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    color: '#ca8c10',
  },
  error: {
    color: '#cf184a',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default LogDataDisplay;
