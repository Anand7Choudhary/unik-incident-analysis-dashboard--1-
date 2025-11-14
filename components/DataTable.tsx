import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ProcessedIncident } from '../types';
import { SortAscIcon, SortDescIcon } from './Icons';
import InsightPopup from './InsightPopup';

type SortKey = keyof ProcessedIncident;
type SortOrder = 'asc' | 'desc';

interface DataTableProps {
    data: ProcessedIncident[];
    allData: ProcessedIncident[];
    onDescriptionClick: (description: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, allData, onDescriptionClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder } | null>({ key: 'incidentDate', order: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [popover, setPopover] = useState<{ visible: boolean; data: ProcessedIncident | null; top: number; left: number; target: EventTarget | null }>({ visible: false, data: null, top: 0, left: 0, target: null });
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleHidePopover = () => {
    setPopover({ visible: false, data: null, top: 0, left: 0, target: null });
  };
  
  const handleClientClick = (event: React.MouseEvent, incident: ProcessedIncident) => {
    event.stopPropagation();
    const currentTarget = event.currentTarget;
    if (popover.visible && popover.target === currentTarget) {
      handleHidePopover();
    } else {
      setPopover({ 
          visible: true, 
          data: incident, 
          top: event.clientY, 
          left: event.clientX,
          target: currentTarget
      });
    }
  };

  useEffect(() => {
    if (!popover.visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        handleHidePopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popover.visible]);


  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.order === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        item.description.toLowerCase().includes(lowerSearchTerm) ||
        item.team.toLowerCase().includes(lowerSearchTerm) ||
        item.clientId.toString().includes(searchTerm) ||
        item.notificationAbout.toLowerCase().includes(lowerSearchTerm) ||
        item.incidentCategory.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [sortedData, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
    setCurrentPage(1);
  };
  
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.order === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };
  
  const columnHeaders: { key: SortKey; label: string }[] = [
      { key: 'incidentDate', label: 'Date' },
      { key: 'clientId', label: 'Client ID' },
      { key: 'team', label: 'Team' },
      { key: 'notificationAbout', label: 'Product' },
      { key: 'incidentCategory', label: 'Category' },
      { key: 'seriousnessScore', label: 'Score' },
      { key: 'fundingSource', label: 'Funding' },
      { key: 'description', label: 'Description' },
  ];

  return (
    <div>
       {popover.visible && popover.data && (
        <div ref={popoverRef}>
          <InsightPopup 
              incident={popover.data}
              allData={allData}
              top={popover.top}
              left={popover.left}
          />
        </div>
       )}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search table..."
          className="w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              {columnHeaders.map(({ key, label }) => (
                <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(key as SortKey)}>
                  <div className="flex items-center">
                    {label}
                    <span className="ml-2">{getSortIcon(key as SortKey)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white/80 divide-y divide-gray-200">
            {paginatedData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.incidentDate.toLocaleDateString()}</td>
                <td 
                    className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium underline underline-offset-2 decoration-dotted cursor-pointer"
                    onClick={(e) => handleClientClick(e, item)}
                >
                    {item.clientId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.team}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.notificationAbout}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.incidentCategory}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold text-center">{item.seriousnessScore}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fundingSource}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-sm">
                    <p className="truncate cursor-pointer hover:text-blue-600" title="Click to see full description" onClick={() => onDescriptionClick(item.description)}>{item.description}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {paginatedData.length === 0 && <p className="text-center py-4 text-gray-500">No data available for the current selection.</p>}
      </div>
       {totalPages > 1 && (
        <div className="py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                  <span className="sr-only">Next</span>
                   <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;