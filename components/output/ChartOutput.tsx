import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { ChartData } from '../../types';
import '../charts/ChartWrapper';
import { CHART_COLORS, CHART_COLORS_SECONDARY } from '../../constants';

interface ChartOutputProps {
    data: ChartData;
}

const ChartOutput: React.FC<ChartOutputProps> = ({ data }) => {
    if (!data || !data.chartType) {
        return <div className="h-64 flex items-center justify-center text-gray-500">Invalid chart data provided.</div>;
    }

    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: data.chartType === 'pie',
                position: 'bottom' as const,
                labels: { color: '#4b5563', boxWidth: 12, padding: 20 }
            },
        },
    };

    const axisChartOptions = {
        ...baseOptions,
        plugins: {
            ...baseOptions.plugins,
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { color: '#6b7280' } },
            x: { grid: { display: false }, ticks: { color: '#6b7280' } }
        }
    };

    let chartComponent;
    
    switch (data.chartType) {
        case 'line': {
            const lineChartData = {
                labels: data.labels,
                datasets: [{
                    label: 'Trend',
                    data: data.values,
                    borderColor: CHART_COLORS[0],
                    backgroundColor: CHART_COLORS_SECONDARY[0],
                    fill: true,
                    tension: 0.2,
                }]
            };
            chartComponent = <Line options={axisChartOptions as any} data={lineChartData} />;
            break;
        }
        case 'pie': {
            const pieChartData = {
                labels: data.labels,
                datasets: [{
                    label: 'Distribution',
                    data: data.values,
                    backgroundColor: CHART_COLORS_SECONDARY,
                    borderColor: '#fff',
                    borderWidth: 2,
                }]
            };
            chartComponent = <Doughnut options={{...baseOptions, cutout: '50%'} as any} data={pieChartData} />;
            break;
        }
        case 'bar':
        default: {
            const barChartData = {
                labels: data.labels,
                datasets: [{
                    label: 'Count',
                    data: data.values,
                    backgroundColor: CHART_COLORS_SECONDARY,
                    borderColor: CHART_COLORS,
                    borderWidth: 1,
                    borderRadius: 4,
                }]
            };
            chartComponent = <Bar options={axisChartOptions as any} data={barChartData} />;
            break;
        }
    }

    return (
        <div className="h-64">
            {chartComponent}
        </div>
    );
};

export default ChartOutput;