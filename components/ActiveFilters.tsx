
import React from 'react';
import { Filters } from '../types';

interface ActiveFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, setFilters }) => {
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') {
      // FIX: Cast `value` to its expected type. Object.entries widens value types to `unknown`.
      // We know if the key is 'dateRange', the value will be the dateRange object.
      const dateRange = value as Filters['dateRange'];
      return dateRange.start || dateRange.end;
    }
    return value && value !== 'all' && value !== '';
  });

  if (activeFilters.length === 0) {
    return null;
  }
  
  const removeFilter = (key: keyof Filters) => {
    if (key === 'dateRange') {
      setFilters(prev => ({...prev, dateRange: {start: null, end: null}}));
      const dateStart = document.getElementById('dateStart') as HTMLInputElement;
      const dateEnd = document.getElementById('dateEnd') as HTMLInputElement;
      if (dateStart) dateStart.value = '';
      if (dateEnd) dateEnd.value = '';
    } else {
      const defaultValue = key === 'clientId' ? '' : 'all';
      setFilters(prev => ({ ...prev, [key]: defaultValue }));
    }
  };
  
  const getFilterLabel = (key: string, value: any): string => {
    switch(key) {
        case 'product': return `Product: ${value}`;
        case 'team': return `Team: ${value}`;
        case 'fundingSource': return `Funding: ${value}`;
        case 'seriousness': return `Score: ${value}`;
        case 'category': return `Category: ${value}`;
        case 'clientId': return `Client ID: ${value}`;
        case 'dateRange': return `Date: ${value.start || '...'} - ${value.end || '...'}`;
        default: return value.toString();
    }
  }

  return (
    <div className="flex items-center flex-wrap gap-2 mb-4">
      <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
      {activeFilters.map(([key, value]) => (
        <div key={key} className="flex items-center bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span>{getFilterLabel(key, value)}</span>
          <button 
            onClick={() => removeFilter(key as keyof Filters)}
            className="ml-2 text-blue-600 hover:text-blue-800"
            aria-label={`Remove ${key} filter`}
          >
            &#x2715;
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActiveFilters;
