import React from 'react';
import { Filters, ProcessedIncident } from '../types';

interface FilterSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  allData: ProcessedIncident[];
  resetFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, setIsOpen, filters, setFilters, allData, resetFilters }) => {
  const teams = [...new Set(allData.map(d => d.team))].sort();
  const products = [...new Set(allData.map(d => d.notificationAbout))].sort();
  const categories = [...new Set(allData.map(d => d.incidentCategory))].sort();


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'dateStart' || name === 'dateEnd') {
      const newDateRange = { ...filters.dateRange };
      if (name === 'dateStart') newDateRange.start = value;
      if (name === 'dateEnd') newDateRange.end = value;
      setFilters(prev => ({ ...prev, dateRange: newDateRange }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <aside className={`fixed top-0 right-0 h-full z-20 bg-white/70 backdrop-blur-2xl border-l border-white/30 shadow-2xl transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      w-80 lg:w-72 lg:relative lg:translate-x-0`}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
             <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-2">
          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input type="date" name="dateStart" id="dateStart" onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 mb-2"/>
            <input type="date" name="dateEnd" id="dateEnd" onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"/>
          </div>

           {/* Client ID Filter */}
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client ID</label>
            <input type="text" name="clientId" id="clientId" value={filters.clientId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" placeholder="Enter Client ID"/>
          </div>

          {/* Team Filter */}
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700">Team Reporter</label>
            <select name="team" id="team" value={filters.team} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
              <option value="all">All Teams</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          {/* Product Filter */}
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product/Form of Care</label>
            <select name="product" id="product" value={filters.product} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
              <option value="all">All Products</option>
              {products.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Incident Category</label>
            <select name="category" id="category" value={filters.category} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Funding Filter */}
          <div>
            <label htmlFor="fundingSource" className="block text-sm font-medium text-gray-700">Funding Source</label>
            <select name="fundingSource" id="fundingSource" value={filters.fundingSource} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
              <option value="all">All</option>
              <option value="WMO">WMO</option>
              <option value="Youth Law">Youth Law</option>
            </select>
          </div>
          
          {/* Seriousness Filter */}
          <div>
            <label htmlFor="seriousness" className="block text-sm font-medium text-gray-700">Seriousness Score</label>
            <select name="seriousness" id="seriousness" value={filters.seriousness} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
              <option value="all">All</option>
              {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        
        <div className="mt-6">
            <button onClick={resetFilters} className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold py-2 px-4 rounded-md transition-colors">Reset Filters</button>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;