import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { ProcessedIncident } from '../../types';
import { CHART_COLORS } from '../../constants';
import './ChartWrapper';

interface ChartProps {
  data: ProcessedIncident[];
  granularity: 'day' | 'week' | 'month';
}

const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const IncidentsOverTimeChart: React.FC<ChartProps> = ({ data, granularity }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) {
      return { labels: [], datasets: [] };
    }

    const countsByDateCategory: { [date: string]: { [category: string]: number } } = {};
    const categories = new Set<string>();

    data.forEach(item => {
      let dateKey: string;
      const d = item.incidentDate;

      switch (granularity) {
        case 'week':
          dateKey = getStartOfWeek(d).toISOString().split('T')[0];
          break;
        case 'month':
          dateKey = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
          break;
        case 'day':
        default:
          dateKey = d.toISOString().split('T')[0];
      }

      if (!countsByDateCategory[dateKey]) {
        countsByDateCategory[dateKey] = {};
      }
      countsByDateCategory[dateKey][item.incidentCategory] = (countsByDateCategory[dateKey][item.incidentCategory] || 0) + 1;
      categories.add(item.incidentCategory);
    });

    const sortedDates = Object.keys(countsByDateCategory).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    const sortedCategories = Array.from(categories).sort();

    const datasets = sortedCategories.map((category, index) => ({
      label: category,
      data: sortedDates.map(date => countsByDateCategory[date][category] || 0),
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length] + 'B3',
      tension: 0.1,
      pointRadius: 2,
      borderWidth: 2,
    }));

    return {
      labels: sortedDates,
      datasets,
    };
  }, [data, granularity]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: granularity as 'day' | 'week' | 'month',
          tooltipFormat: 'MMM dd, yyyy'
        },
        grid: { display: false },
        ticks: { color: '#6b7280' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e5e7eb' },
        ticks: { color: '#6b7280' }
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, pointStyle: 'circle', padding: 20 }
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
            backgroundColor: 'rgba(0,123,255,0.25)'
          }
        }
      }
    },
    interaction: {
        intersect: false,
        mode: 'index' as const,
    },
  };

  return <div className="h-96 w-full overflow-x-auto"><Line options={options} data={chartData} /></div>;
};

export default IncidentsOverTimeChart;