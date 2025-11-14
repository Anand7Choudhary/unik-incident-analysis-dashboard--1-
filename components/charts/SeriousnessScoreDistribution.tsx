import React, { useMemo, useRef } from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { ProcessedIncident } from '../../types';
import './ChartWrapper';

interface ChartProps {
  data: ProcessedIncident[];
  onElementClick: (value: string) => void;
}

const SeriousnessScoreDistribution: React.FC<ChartProps> = ({ data, onElementClick }) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  const chartData = useMemo(() => {
    const scoreCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(item => {
      if (scoreCounts[item.seriousnessScore] !== undefined) {
        scoreCounts[item.seriousnessScore]++;
      }
    });

    return {
      labels: ['1', '2', '3', '4', '5'],
      datasets: [
        {
          label: 'Number of Incidents',
          data: Object.values(scoreCounts),
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(139, 92, 246, 0.7)',
          ],
          borderColor: [
            '#10B981',
            '#3B82F6',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
          ],
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x' as const,
          drag: {
            enabled: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          }
        }
      }
    },
     scales: {
        y: {
            beginAtZero: true,
            title: { display: false },
            grid: { color: '#e5e7eb' },
            ticks: { color: '#6b7280' }
        },
        x: {
             title: { display: false },
             grid: { display: false },
             ticks: { color: '#6b7280' }
        }
    }
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

  return <div className="h-80 w-full pt-4 overflow-x-auto"><Bar ref={chartRef} options={options} data={chartData} onClick={handleClick}/></div>;
};

export default SeriousnessScoreDistribution;