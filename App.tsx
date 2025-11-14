import React, { useState, useMemo, useCallback } from 'react';
import { ProcessedIncident, Filters } from './types';
import { processUniKData } from './services/dataProcessor';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [processedData, setProcessedData] = useState<ProcessedIncident[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    team: 'all',
    product: 'all',
    fundingSource: 'all',
    seriousness: 'all',
    category: 'all',
    clientId: '',
    dateRange: { start: null, end: null },
  });

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("File reading failed.");
        const workbook = (window as any).XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = (window as any).XLSX.utils.sheet_to_json(worksheet);
        
        const processed = processUniKData(jsonData);
        setProcessedData(processed);
        setIsDataLoaded(true);
      } catch (err) {
        console.error("Error processing file:", err);
        setError("Failed to parse the Excel file. Please ensure it's a valid 'uniK.xlsx' file and try again.");
        setIsDataLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Error reading the file.");
        setIsLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const filteredData = useMemo(() => {
    return processedData.filter(item => {
      const itemDate = item.incidentDate.getTime();
      const startDate = filters.dateRange.start ? new Date(filters.dateRange.start).getTime() : -Infinity;
      const endDate = filters.dateRange.end ? new Date(filters.dateRange.end).setHours(23, 59, 59, 999) : Infinity;

      return (
        (filters.team === 'all' || item.team === filters.team) &&
        (filters.product === 'all' || item.notificationAbout === filters.product) &&
        (filters.fundingSource === 'all' || item.fundingSource === filters.fundingSource) &&
        (filters.seriousness === 'all' || item.seriousnessScore === parseInt(filters.seriousness.toString())) &&
        (filters.category === 'all' || item.incidentCategory === filters.category) &&
        (filters.clientId === '' || item.clientId.toString().includes(filters.clientId)) &&
        (itemDate >= startDate && itemDate <= endDate)
      );
    });
  }, [processedData, filters]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {!isDataLoaded ? (
        <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
      ) : (
        <Dashboard
          data={filteredData}
          allData={processedData}
          filters={filters}
          setFilters={setFilters}
        />
      )}
    </div>
  );
};

export default App;