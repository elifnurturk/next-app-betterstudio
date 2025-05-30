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

  // Apply filters whenever data or filters change
  useEffect(() => {
    let filtered = data;

    // Helper to parse each log into parts
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

      // Filter level
      if (filters.level && level !== filters.level.toUpperCase()) return false;

      // Filter service
      if (filters.service && !service.toLowerCase().includes(filters.service.toLowerCase()))
        return false;

      // Filter action
      if (filters.action && !action.toLowerCase().includes(filters.action.toLowerCase()))
        return false;

      // Filter date range
      if (filters.startDate && new Date(date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(date) > new Date(filters.endDate + 'T23:59:59')) return false;

      return true;
    });

    setFilteredData(filtered);
  }, [data, filters]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
          {filteredData.map((item, index) => (
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
    textAlign: 'center' as const,
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
    whiteSpace: 'pre-wrap' as const,
    fontSize: '0.9rem',
  },
  loading: {
    textAlign: 'center' as const,
    color: '#ca8c10',
  },
  error: {
    color: '#cf184a',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
  },
};

export default LogViewer;
