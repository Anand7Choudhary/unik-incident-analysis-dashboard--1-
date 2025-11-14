import React, { useMemo, useRef } from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { ProcessedIncident } from '../../types';
import './ChartWrapper';
import { CHART_COLORS } from '../../constants';

interface ChartProps {
  data: ProcessedIncident[];
  onElementClick: (value: string) => void;
}

const IncidentsByTeamChart: React.FC<ChartProps> = ({ data, onElementClick }) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  
  const chartData = useMemo(() => {
    const countsByTeam: { [key: string]: number } = {};
    data.forEach(item => {
      countsByTeam[item.team] = (countsByTeam[item.team] || 0) + 1;
    });

    const sortedTeams = Object.entries(countsByTeam).sort(([, a], [, b]) => b - a);
    const labels = sortedTeams.map(p => p[0]);
    const chartValues = sortedTeams.map(p => p[1]);

    return {
      labels,
      datasets: [
        {
          label: 'Incidents by Team',
          data: chartValues,
          backgroundColor: CHART_COLORS[0] + 'B3', // blue with transparency
          borderColor: CHART_COLORS[0],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [data]);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: { beginAtZero: true, grid: { display: false }, ticks: { color: '#6b7280' } },
        y: { grid: { display: false }, ticks: { color: '#6b7280' } }
    },
    plugins: {
      legend: { display: false },
      zoom: {
        pan: {
          enabled: true,
          mode: 'y' as const,
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'y' as const,
          drag: {
            enabled: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)'
          }
        }
      }
    },
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (chartRef.current) {
        const element = getElementAtEvent(chartRef.current, event);
        if (element.length > 0) {
            const clickedLabel = chartData.labels[element[0].index];
            onElementClick(clickedLabel);
        }
    }
  };

  return <div className="h-80 w-full pt-4 overflow-y-auto"><Bar ref={chartRef} options={options} data={chartData} onClick={handleClick} /></div>;
};

export default IncidentsByTeamChart;