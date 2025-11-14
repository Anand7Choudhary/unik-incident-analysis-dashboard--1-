import React, { useMemo, useRef } from 'react';
import { Doughnut, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import { ProcessedIncident } from '../../types';
import { CHART_COLORS_SECONDARY } from '../../constants';
import './ChartWrapper';

interface ChartProps {
  data: ProcessedIncident[];
  onElementClick: (value: string) => void;
}

const FundingSourceChart: React.FC<ChartProps> = ({ data, onElementClick }) => {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  const chartData = useMemo(() => {
    const countsBySource: { [key: string]: number } = { 'WMO': 0, 'Youth Law': 0 };
    data.forEach(item => {
      countsBySource[item.fundingSource] = (countsBySource[item.fundingSource] || 0) + 1;
    });

    return {
      labels: ['WMO', 'Youth Law'],
      datasets: [
        {
          label: 'Funding Source',
          data: [countsBySource['WMO'], countsBySource['Youth Law']],
          backgroundColor: [
            CHART_COLORS_SECONDARY[4],
            CHART_COLORS_SECONDARY[5],
          ],
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

export default FundingSourceChart;