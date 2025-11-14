
import React from 'react';
import { AIChatIcon, DocumentIcon, HomeIcon, SettingsIcon } from './Icons';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'analysis') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', icon: <HomeIcon />, label: 'Overview' },
    { id: 'analysis', icon: <AIChatIcon />, label: 'Analysis' },
  ];

  return (
    <nav className="hidden md:flex flex-col w-20 bg-white/50 backdrop-blur-2xl border-r border-white/30 p-4 items-center justify-between shadow-md">
      <div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-10 shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <ul className="space-y-4">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id as 'overview' | 'analysis')}
                className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                  activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100/80'
                }`}
                aria-label={item.label}
              >
                {item.icon}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
