'use client';

import React, { useEffect, useState } from 'react';
import LogFilters from './LogFilters';

interface Filters {
  level: string;
  service: string;
  action: string;
  startDate: string;
  endDate: string;
  userId: string;
}

const levelColors: Record<string, string> = {
  ERROR: 'border-red-700',
  WARN: 'border-yellow-600',
  INFO: 'border-blue-700',
  DEBUG: 'border-gray-600',
  TRACE: 'border-green-700',
  DEFAULT: 'border-gray-500',
};

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
    userId: '',
  });

  const formatDateWithDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

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
      const { date, level, serviceAction, id } = parseLog(log);
      const [service, action] = serviceAction.split(':');

      if (filters.level && level !== filters.level.toUpperCase()) return false;
      if (filters.service && !service.toLowerCase().includes(filters.service.toLowerCase())) return false;
      if (filters.action && !action.toLowerCase().includes(filters.action.toLowerCase())) return false;
      if (filters.startDate && new Date(date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(date) > new Date(filters.endDate + 'T23:59:59')) return false;
      if (filters.userId && id !== filters.userId) return false;

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
    <div className="bg-[#17182d] min-h-screen p-8 font-comic-sans text-white">
      <h1 className="text-[#cf184a] text-3xl mb-6 text-center">🚨 Log Viewer 🚨</h1>

      <LogFilters filters={filters} onChange={handleFilterChange} />

      {loading && <p className="text-center text-yellow-500">Loading... ⏳</p>}

      {!loading && error && (
        <p className="text-center text-[#cf184a] font-bold">😿 {error}</p>
      )}

      {!loading && !error && filteredData.length === 0 && (
        <p className="text-center text-yellow-600">No logs found with current filters... 💤</p>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 list-none p-0">
          {filteredData.map((item, index) => {
            const { level, message, date, serviceAction, id } = parseLog(item);
            const borderColorClass = levelColors[level] || levelColors.DEFAULT;
            const [service, action] = serviceAction.split(':');

            return (
              <li
                key={id || index}
                className={`p-4 rounded-xl border-l-8 ${borderColorClass} bg-gradient-to-br from-[#e6e0f8] to-[#f8e0e6] text-[#222222] shadow-lg transition-transform transform hover:scale-[1.02]`}
              >
                <div className="mb-2 font-bold flex items-center justify-between text-sm text-purple-900">
                  <span>#{index + 1}</span>
                  <span>{formatDateWithDay(date)}</span>
                </div>

                <div className="mb-2 text-xs text-gray-600 space-y-1">
                  <div><strong>Level:</strong> {level}</div>
                  <div><strong>Service:</strong> {service}</div>
                  <div><strong>Action:</strong> {action}</div>
                  <div><strong>User ID:</strong> {id || '—'}</div>
                </div>

                <p
                  className="text-gray-800 text-sm overflow-hidden text-ellipsis line-clamp-6 mt-2"
                  style={{ WebkitBoxOrient: 'vertical' as any, display: '-webkit-box' }}
                >
                  {message}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LogViewer;
