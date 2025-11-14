import React, { useMemo, useRef } from 'react';
import { Doughnut, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS, ChartArea } from 'chart.js';
import { ProcessedIncident } from '../../types';
import { CHART_COLORS_SECONDARY } from '../../constants';
import './ChartWrapper';

interface ChartProps {
  data: ProcessedIncident[];
  onElementClick: (value: string) => void;
}

const IncidentsByCategoryChart: React.FC<ChartProps> = ({ data, onElementClick }) => {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  const chartData = useMemo(() => {
    const countsByCategory: { [key: string]: number } = {};
    data.forEach(item => {
      countsByCategory[item.incidentCategory] = (countsByCategory[item.incidentCategory] || 0) + 1;
    });

    const labels = Object.keys(countsByCategory);
    const chartValues = Object.values(countsByCategory);

    return {
      labels,
      datasets: [
        {
          label: '# of Incidents',
          data: chartValues,
          backgroundColor: CHART_COLORS_SECONDARY,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
            color: '#4b5563',
            boxWidth: 12,
            padding: 20,
        }
      },
    },
    cutout: '60%',
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

  return <div className="h-80"><Doughnut ref={chartRef} data={chartData} options={options} onClick={handleClick} /></div>;
};

export default IncidentsByCategoryChart;