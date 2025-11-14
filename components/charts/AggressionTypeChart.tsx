
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ProcessedIncident } from '../../types';
import './ChartWrapper';

interface ChartProps {
  data: ProcessedIncident[];
}

const AggressionTypeChart: React.FC<ChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const aggressionIncidents = data.filter(d => d.isAggressionIncident);
    const countsByType: { [key: string]: number } = {};
    
    aggressionIncidents.forEach(item => {
        const type = item.aggressionType || 'Not Specified';
        countsByType[type] = (countsByType[type] || 0) + 1;
    });

    const labels = Object.keys(countsByType);
    const chartValues = Object.values(countsByType);

    return {
      labels,
      datasets: [
        {
          label: 'Aggression Type',
          data: chartValues,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Incidents'
            }
        }
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <div style={{height: '450px'}}><Bar options={options} data={chartData} /></div>;
};

export default AggressionTypeChart;
