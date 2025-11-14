import React, { useMemo, useRef } from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { ProcessedIncident } from '../../types';
import { CHART_COLORS, CHART_COLORS_SECONDARY } from '../../constants';
import './ChartWrapper';

interface ChartProps {
  data: ProcessedIncident[];
  onElementClick: (value: string) => void;
}

const IncidentsByProductChart: React.FC<ChartProps> = ({ data, onElementClick }) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  
  const chartData = useMemo(() => {
    const countsByProduct: { [key: string]: number } = {};
    data.forEach(item => {
      countsByProduct[item.notificationAbout] = (countsByProduct[item.notificationAbout] || 0) + 1;
    });

    const sortedProducts = Object.entries(countsByProduct).sort(([, a], [, b]) => b - a);
    const labels = sortedProducts.map(p => p[0]);
    const chartValues = sortedProducts.map(p => p[1]);

    return {
      labels,
      datasets: [
        {
          label: 'Incidents by Product',
          data: chartValues,
          backgroundColor: CHART_COLORS_SECONDARY[1],
          borderColor: CHART_COLORS[1],
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
       tooltip: {
        callbacks: {
          label: function(context: any) {
            return ` Incidents: ${context.raw}`;
          }
        }
      },
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
            backgroundColor: 'rgba(16, 185, 129, 0.2)'
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

export default IncidentsByProductChart;