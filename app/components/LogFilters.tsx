import React, { useState, useRef, useEffect } from 'react';

interface Filters {
  level: string;
  service: string;
  action: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
}

interface LogFiltersProps {
  filters: Filters;
  onChange: (newFilters: Partial<Filters>) => void;
}

const LEVELS = ['', 'ERROR', 'WARN', 'DEBUG', 'INFO', 'TRACE'];

// Normalize date to 'YYYY-MM-DD'
function normalizeDate(value: string) {
  if (!value) return '';
  return value.slice(0, 10);
}

const LogFilters: React.FC<LogFiltersProps> = ({ filters, onChange }) => {
  const [rangeOpen, setRangeOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate' || name === 'endDate') {
      const normalized = normalizeDate(value);
      onChange({ [name]: normalized });
      setRangeOpen(false); // Close dropdown immediately on date select
    } else {
      onChange({ [name]: value });
    }
  };

  const handleDone = () => {
    setRangeOpen(false); // Close dropdown on Done click
  };

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setRangeOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Format date display (YYYY-MM-DD or placeholder)
  const formatDate = (date: string) => date || '---- -- --';

  // Format range string
  const formatRangeValue = () => {
    if (filters.startDate || filters.endDate) {
      const start = formatDate(filters.startDate);
      const end = formatDate(filters.endDate);
      return `${start} - ${end}`;
    }
    return 'Select date range';
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6 justify-center sm:justify-start">
      {/* Level */}
      <label className="flex items-center space-x-2 text-white">
        <span>Level:</span>
        <select
          name="level"
          value={filters.level}
          onChange={handleChange}
          className="ml-2 px-2 py-1 rounded border border-yellow-600 bg-[#252741] text-white min-w-[120px] focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl || 'All'}
            </option>
          ))}
        </select>
      </label>

      {/* Service */}
      <label className="flex items-center space-x-2 text-white">
        <span>Service:</span>
        <input
          type="text"
          name="service"
          placeholder="Filter by service"
          value={filters.service}
          onChange={handleChange}
          className="ml-2 px-2 py-1 rounded border border-yellow-600 bg-[#252741] text-white min-w-[120px] focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </label>

      {/* Action */}
      <label className="flex items-center space-x-2 text-white">
        <span>Action:</span>
        <input
          type="text"
          name="action"
          placeholder="Filter by action"
          value={filters.action}
          onChange={handleChange}
          className="ml-2 px-2 py-1 rounded border border-yellow-600 bg-[#252741] text-white min-w-[120px] focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </label>

      {/* Date Range */}
      <div
        ref={containerRef}
        className="relative flex flex-col text-white min-w-[360px]"
      >
        <label className="flex items-center space-x-2 cursor-pointer">
          <span>Date Range:</span>
          <input
            type="text"
            readOnly
            value={formatRangeValue()}
            onClick={() => setRangeOpen((v) => !v)}
            className="ml-2 px-3 py-1 rounded border border-yellow-600 bg-[#252741] text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </label>

        {rangeOpen && (
          <div className="absolute z-10 mt-2 p-3 bg-[#252741] border border-yellow-600 rounded shadow-lg flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col">
                <label className="mb-1 text-sm">Start</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleChange}
                  className="px-2 py-1 rounded border border-yellow-600 bg-[#1e2233] text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm">End</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleChange}
                  className="px-2 py-1 rounded border border-yellow-600 bg-[#1e2233] text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleDone}
              className="self-end mt-2 px-4 py-1 bg-yellow-600 rounded text-[#252741] font-semibold hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogFilters;
