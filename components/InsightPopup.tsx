
import React, { useMemo } from 'react';
import { ProcessedIncident } from '../types';

interface InsightPopupProps {
  incident: ProcessedIncident;
  allData: ProcessedIncident[];
  top: number;
  left: number;
}

const InsightPopup: React.FC<InsightPopupProps> = ({ incident, allData, top, left }) => {
  const insights = useMemo(() => {
    const teamIncidents = allData.filter(d => d.team === incident.team);
    const categoryIncidents = allData.filter(d => d.incidentCategory === incident.incidentCategory);
    const clientIncidents = allData.filter(d => d.clientId === incident.clientId);

    const teamAvg = teamIncidents.length > 0
      ? (teamIncidents.reduce((acc, curr) => acc + curr.seriousnessScore, 0) / teamIncidents.length).toFixed(1)
      : 'N/A';

    const categoryAvg = categoryIncidents.length > 0
      ? (categoryIncidents.reduce((acc, curr) => acc + curr.seriousnessScore, 0) / categoryIncidents.length).toFixed(1)
      : 'N/A';
      
    return {
      teamAvg,
      categoryAvg,
      clientIncidentCount: clientIncidents.length,
    };
  }, [incident, allData]);

  const popupStyle: React.CSSProperties = {
    position: 'fixed',
    top: `${top + 15}px`,
    left: `${left + 15}px`,
    transform: 'none',
    pointerEvents: 'none',
  };
  
  return (
    <div 
        style={popupStyle}
        className="z-50 w-64 p-4 bg-gray-800/80 backdrop-blur-lg text-white rounded-lg shadow-2xl border border-white/20 text-sm animate-fade-in-fast"
    >
      <h4 className="font-bold border-b border-gray-600 pb-2 mb-2">
        Client ID: {incident.clientId}
      </h4>
      <ul className="space-y-2">
        <li>
            <strong>Seriousness: </strong>
            <span className="font-bold text-lg">{incident.seriousnessScore}</span>
        </li>
        <li>
            <strong>Team Avg. Seriousness: </strong>
            <span>{insights.teamAvg}</span>
        </li>
         <li>
            <strong>Category Avg. Seriousness: </strong>
            <span>{insights.categoryAvg}</span>
        </li>
        <li>
            <strong>Total Incidents for Client: </strong>
            <span>{insights.clientIncidentCount}</span>
        </li>
      </ul>
    </div>
  );
};

export default InsightPopup;