import React from 'react';

interface Filters {
  level: string;
  service: string;
  action: string;
  startDate: string;
  endDate: string;
}

interface LogFiltersProps {
  filters: Filters;
  onChange: (newFilters: Partial<Filters>) => void;
}

const LEVELS = ['', 'ERROR', 'WARN', 'DEBUG', 'INFO', 'TRACE'];

const LogFilters: React.FC<LogFiltersProps> = ({ filters, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div style={styles.container}>
      <label>
        Level:
        <select name="level" value={filters.level} onChange={handleChange} style={styles.input}>
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl || 'All'}
            </option>
          ))}
        </select>
      </label>

      <label>
        Service:
        <input
          type="text"
          name="service"
          placeholder="Filter by service"
          value={filters.service}
          onChange={handleChange}
          style={styles.input}
        />
      </label>

      <label>
        Action:
        <input
          type="text"
          name="action"
          placeholder="Filter by action"
          value={filters.action}
          onChange={handleChange}
          style={styles.input}
        />
      </label>

      <label>
        Start Date:
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          style={styles.input}
        />
      </label>

      <label>
        End Date:
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          style={styles.input}
        />
      </label>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1.5rem',
    justifyContent: 'center',
  },
  input: {
    marginLeft: '0.5rem',
    padding: '0.3rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #ca8c10',
    backgroundColor: '#252741',
    color: '#fff',
    minWidth: '120px',
  },
};

export default LogFilters;
