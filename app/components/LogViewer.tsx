'use client';

import React, { useEffect, useState } from 'react';
import LogFilters from './LogFilters';

interface Filters {
  level: string;
  service: string;
  action: string;
  startDate: string;
  endDate: string;
}

const levelColors: Record<string, { border: string }> = {
  ERROR: { border: '#d32f2f' },   // strong red
  WARN: { border: '#f57c00' },    // strong orange
  INFO: { border: '#1976d2' },    // strong blue
  DEBUG: { border: '#616161' },   // dark gray
  TRACE: { border: '#388e3c' },   // strong green
  DEFAULT: { border: '#9e9e9e' }, // fallback gray
};

const cardBackground = '#e6e0f8'; // soft lilac

const LogViewer = () => {
  const [data, setData] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState<Filters>({
    level: '',
    service: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) {
          const json = await response.json();
          throw new Error(json.error || 'Failed to fetch data');
        }
        const logs: string[] = await response.json();
        setData(logs);
        setFilteredData(logs);
      } catch (err: any) {
        setError(err.message);
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = data;

    const parseLog = (log: string) => {
      const parts = log.split('|=|').map((p) => p.trim());
      return {
        date: parts[0],
        message: parts[1],
        level: parts[2].toUpperCase(),
        serviceAction: parts[3],
        id: parts[4],
      };
    };

    filtered = filtered.filter((log) => {
      const { date, level, serviceAction } = parseLog(log);
      const [service, action] = serviceAction.split(':');

      if (filters.level && level !== filters.level.toUpperCase()) return false;
      if (filters.service && !service.toLowerCase().includes(filters.service.toLowerCase()))
        return false;
      if (filters.action && !action.toLowerCase().includes(filters.action.toLowerCase()))
        return false;
      if (filters.startDate && new Date(date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(date) > new Date(filters.endDate + 'T23:59:59')) return false;

      return true;
    });

    setFilteredData(filtered);
  }, [data, filters]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const parseLog = (log: string) => {
    const parts = log.split('|=|').map((p) => p.trim());
    return {
      date: parts[0],
      message: parts[1],
      level: parts[2].toUpperCase(),
      serviceAction: parts[3],
      id: parts[4],
    };
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚨 Log Viewer 🚨</h1>

      <LogFilters filters={filters} onChange={handleFilterChange} />

      {loading && <p style={styles.loading}>Loading... ⏳</p>}

      {!loading && error && <p style={styles.error}>😿 {error}</p>}

      {!loading && !error && filteredData.length === 0 && (
        <p style={styles.loading}>No logs found with current filters... 💤</p>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <ul style={styles.list}>
          {filteredData.map((item, index) => {
            const { level, message, date, serviceAction, id } = parseLog(item);
            const colors = levelColors[level] || levelColors.DEFAULT;

            return (
              <li
                key={id || index}
                style={{
                  ...styles.item,
                  borderColor: colors.border,
                  backgroundColor: cardBackground,
                  color: '#222222',
                }}
              >
                <div>
                  <strong style={styles.index}>{index + 1}.</strong>{' '}
                  <span style={styles.date}>{date}</span> | <em>{level}</em> | <span>{serviceAction}</span>
                </div>
                <span style={styles.message}>{message}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
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
    gridTemplateColumns: 'repeat(4, 1fr)', // default 4 columns
  },
  item: {
    padding: '1rem',
    borderRadius: 10,
    borderWidth: 4,
    borderStyle: 'solid',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    fontSize: '0.9rem',
    height: 180,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    whiteSpace: 'normal',
  },
  index: {
    color: '#5a2e91',
    fontWeight: 'bold',
    marginRight: 8,
  },
  date: {
    fontWeight: 'bold',
  },
  message: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 5,
    WebkitBoxOrient: 'vertical' as any,
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

// Add responsive CSS with a style tag or external stylesheet:

// To inject responsive styles in React inline, you can add a <style> tag in the component:

const ResponsiveStyles = () => (
  <style>{`
    @media (max-width: 767px) {
      ul {
        grid-template-columns: repeat(2, 1fr) !important;
      }
    }
  `}</style>
);

export default function LogViewerWrapper() {
  return (
    <>
      <ResponsiveStyles />
      <LogViewer />
    </>
  );
}
