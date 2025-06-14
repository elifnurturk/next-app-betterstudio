﻿import React, { useState, useRef, useEffect } from 'react';

interface Filters {
  level: string;
  service: string;
  action: string;
  startDate: string;
  endDate: string;
  userId: string;
  message: string;
}

interface LogFiltersProps {
  filters: Filters;
  onChange: (newFilters: Partial<Filters>) => void;
}

const LEVELS = ['', 'ERROR', 'WARN', 'DEBUG', 'INFO', 'TRACE'];

const sharedInputClasses =
  "px-2 py-1 rounded border border-yellow-600 bg-[#252741] text-white focus:outline-none focus:ring-2 focus:ring-yellow-500";

export default function LogFilters({ filters, onChange }: LogFiltersProps) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fields = [
    { type: 'select', label: 'Level', name: 'level', value: filters.level, options: LEVELS },
    { type: 'text', label: 'Service', name: 'service', placeholder: 'Filter by service', value: filters.service },
    { type: 'text', label: 'Action', name: 'action', placeholder: 'Filter by action', value: filters.action },
    { type: 'text', label: 'User ID', name: 'userId', placeholder: 'Filter by user ID', value: filters.userId },
    { type: 'text', label: 'Message', name: 'message', placeholder: 'Filter by message', value: filters.message },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: name === 'startDate' || name === 'endDate' ? value.slice(0, 10) : value });
    if (name === 'startDate' || name === 'endDate') setRangeOpen(false);
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

  const formatDate = (d: string) => d || '---- -- --';
  const formatRangeValue = () =>
    filters.startDate || filters.endDate
      ? `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`
      : 'Select date range';

  return (
    <div className="flex flex-wrap gap-4 mb-6 lg:justify-center justify-start text-white">
      {fields.map(({ type, label, name, placeholder, value, options }) => (
        <label
          key={name}
          className="flex w-full flex-row items-center gap-2
                     lg:w-1/4"
        >
          <span className="w-1/3 sm:w-1/3 text-left">{label}:</span>
          {type === 'select' ? (
            <select
              name={name}
              value={value}
              onChange={handleChange}
              className={`${sharedInputClasses} w-2/3 sm:w-2/3`}
            >
              {options!.map((opt) => (
                <option key={opt} value={opt}>
                  {opt || 'All'}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={handleChange}
              className={`${sharedInputClasses} w-2/3 sm:w-2/3`}
            />
          )}
        </label>
      ))}

      {/* Date Range */}
      <div
        ref={containerRef}
        className="relative flex w-full  items-center lg:w-1/4 gap-2"
      >
        <label
          className="flex items-center cursor-pointer w-1/3 lg:w-1/2 text-right"
          htmlFor="date-range-input"
        >
          Date Range:
        </label>
        <input
  id="date-range-input"
  type="text"
  readOnly
  value={formatRangeValue()}
  placeholder="Select date range"
  onClick={() => setRangeOpen((v) => !v)}
  className={`${sharedInputClasses} cursor-pointer lg:w-full w-2/3 text-gray-600 placeholder-gray-600`}
/>
        {rangeOpen && (
          <div className="absolute z-10 mt-2 p-3 bg-[#252741] border border-yellow-600 rounded shadow-lg flex flex-col gap-3">
            {['startDate', 'endDate'].map((dateField) => (
              <div key={dateField} className="flex flex-col">
                <label className="mb-1 text-sm capitalize">
                  {dateField === 'startDate' ? 'Start' : 'End'}
                </label>
                <input
                  type="date"
                  name={dateField}
                  value={filters[dateField as keyof Filters]}
                  onChange={handleChange}
                  className="px-2 py-1 rounded border border-yellow-600 bg-[#1e2233] text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setRangeOpen(false)}
              className="self-end mt-2 px-4 py-1 bg-yellow-600 rounded text-[#252741] font-semibold hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
