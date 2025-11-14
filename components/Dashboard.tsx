
import React, { useState, useMemo, useCallback } from 'react';
import { ProcessedIncident, Filters } from '../types';
import Sidebar from './Sidebar';
import FilterSidebar from './FilterSidebar';
import KpiCard from './KpiCard';
import InfoButton from './InfoButton';
import IncidentsOverTimeChart from './charts/IncidentsOverTimeChart';
import IncidentsByCategoryChart from './charts/IncidentsByCategoryChart';
import IncidentsByTeamChart from './charts/IncidentsByTeamChart';
import IncidentsByProductChart from './charts/IncidentsByProductChart';
import SeriousnessScoreDistribution from './charts/SeriousnessScoreDistribution';
import FundingSourceChart from './charts/FundingSourceChart';
import DataTable from './DataTable';
import { FilterIcon, ExclamationIcon, UserGroupIcon, RepeatIcon } from './Icons';
import DescriptionModal from './DescriptionModal';
import ActiveFilters from './ActiveFilters';
import AIInsights from './AIInsights';

interface DashboardProps {
  data: ProcessedIncident[];
  allData: ProcessedIncident[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const Dashboard: React.FC<DashboardProps> = ({ data, allData, filters, setFilters }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');
  const [isFilterSidebarOpen, setFilterSidebarOpen] = useState(true);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  const kpiData = useMemo(() => {
    const totalIncidents = data.length;
    if (totalIncidents === 0) {
        return {
            totalIncidents: 0,
            avgSeriousness: '0.0',
            repeatClients: 0,
            highSeriousnessPercent: '0.0',
        };
    }

    const avgSeriousness = data.reduce((acc, curr) => acc + curr.seriousnessScore, 0) / totalIncidents;

    const incidentsByClient = data.reduce((acc, curr) => {
        acc[curr.clientId] = (acc[curr.clientId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // FIX: Cast `count` to `number` as `Object.values` returns `unknown[]`, which cannot be directly compared.
    const repeatClients = Object.values(incidentsByClient).filter(count => (count as number) > 1).length;

    const highSeriousnessIncidents = data.filter(item => item.seriousnessScore >= 4).length;
    const highSeriousnessPercent = (highSeriousnessIncidents / totalIncidents) * 100;

    return {
        totalIncidents,
        avgSeriousness: avgSeriousness.toFixed(1),
        repeatClients,
        highSeriousnessPercent: highSeriousnessPercent.toFixed(1),
    };
  }, [data]);
  
  const handleChartClick = useCallback((filterType: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  }, [setFilters]);


  const resetFilters = () => {
    setFilters({
        team: 'all',
        product: 'all',
        fundingSource: 'all',
        seriousness: 'all',
        category: 'all',
        clientId: '',
        dateRange: { start: null, end: null },
    });
    const dateStart = document.getElementById('dateStart') as HTMLInputElement;
    const dateEnd = document.getElementById('dateEnd') as HTMLInputElement;
    if (dateStart) dateStart.value = '';
    if (dateEnd) dateEnd.value = '';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">UniK Incident Analysis Dashboard</h1>
              <p className="text-gray-500 mt-1">Strategic overview of all reported incidents.</p>
            </header>
            
            <ActiveFilters filters={filters} setFilters={setFilters} />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard title="Total Incidents" value={kpiData.totalIncidents.toLocaleString()} icon={<UserGroupIcon />} />
                <KpiCard title="Avg. Seriousness" value={kpiData.avgSeriousness} subtitle="on a 1-5 scale" icon={<ExclamationIcon />} />
                <KpiCard title="Clients with Repeat Incidents" value={kpiData.repeatClients.toLocaleString()} subtitle="clients with >1 incident" icon={<RepeatIcon />} />
                <KpiCard title="High-Seriousness Incidents" value={`${kpiData.highSeriousnessPercent}%`} subtitle="score of 4 or 5" icon={<ExclamationIcon color="text-red-500" />} />
            </div>
            
            <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg text-gray-800">Incidents Over Time</h3>
                      <InfoButton text="Shows incident counts over time. Click and drag to zoom, right-click to pan. Use dropdown to change date grouping." />
                    </div>
                    <select value={granularity} onChange={(e) => setGranularity(e.target.value as any)} className="mt-2 sm:mt-0 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option value="day">Daily</option>
                      <option value="week">Weekly</option>
                      <option value="month">Monthly</option>
                    </select>
                </div>
                <IncidentsOverTimeChart data={data} granularity={granularity} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg text-gray-800">Incidents by Team</h3>
                            <InfoButton text="Click a bar to filter by that team. Click and drag to zoom." />
                        </div>
                    </div>
                    <IncidentsByTeamChart data={data} onElementClick={(value) => handleChartClick('team', value)} />
                </div>
                <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg text-gray-800">Incidents by Product</h3>
                            <InfoButton text="Click a bar to filter by that product. Click and drag to zoom." />
                        </div>
                    </div>
                    <IncidentsByProductChart data={data} onElementClick={(value) => handleChartClick('product', value)} />
                </div>
                <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg text-gray-800">Seriousness Distribution</h3>
                            <InfoButton text="Click a bar to filter by that seriousness score. Click and drag to zoom." />
                        </div>
                    </div>
                    <SeriousnessScoreDistribution data={data} onElementClick={(value) => handleChartClick('seriousness', value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg text-gray-800">By Category</h3>
                            <InfoButton text="Click a segment to filter by that category." />
                        </div>
                    </div>
                    <IncidentsByCategoryChart data={data} onElementClick={(value) => handleChartClick('category', value)} />
                </div>
                 <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg text-gray-800">Funding Source</h3>
                            <InfoButton text="Click a segment to filter by that funding source." />
                        </div>
                    </div>
                    <FundingSourceChart data={data} onElementClick={(value) => handleChartClick('fundingSource', value)} />
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-lg">
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Incident Details</h3>
                <DataTable data={data} allData={allData} onDescriptionClick={setModalContent} />
            </div>
          </>
        );
      case 'analysis':
        return (
            <AIInsights 
                incidents={data}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
        <button 
          onClick={() => setFilterSidebarOpen(!isFilterSidebarOpen)} 
          className="fixed top-6 right-6 z-30 lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg"
          aria-label="Toggle filters"
        >
          <FilterIcon />
        </button>
        {renderContent()}
      </main>
      <FilterSidebar 
        isOpen={isFilterSidebarOpen}
        setIsOpen={setFilterSidebarOpen}
        filters={filters}
        setFilters={setFilters}
        allData={allData}
        resetFilters={resetFilters}
      />
      {modalContent && <DescriptionModal content={modalContent} onClose={() => setModalContent(null)} />}
    </div>
  );
};

export default Dashboard;
