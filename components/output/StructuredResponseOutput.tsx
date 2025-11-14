import React from 'react';
import { StructuredResponse } from '../../types';
import KpiOutput from './KpiOutput';
import TableOutput from './TableOutput';
import ChartOutput from './ChartOutput';

interface StructuredResponseOutputProps {
    response: StructuredResponse;
}

const StructuredResponseOutput: React.FC<StructuredResponseOutputProps> = ({ response }) => {
    // Safely destructure with defaults and checks
    const { responseType, title, summary, data } = response || {};

    // If the core 'data' object is missing, the response is malformed.
    if (!data) {
        return (
            <div className="space-y-3 text-red-700">
                <h3 className="font-bold text-red-800 text-lg">{title || 'Malformed Response'}</h3>
                <p>The AI returned a response in an unexpected format.</p>
                <p className="text-sm italic">{summary || 'No summary available.'}</p>
            </div>
        );
    }

    const renderData = () => {
        switch(responseType) {
            case 'kpi':
                return data.kpi ? <KpiOutput data={data.kpi} /> : null;
            case 'table':
                return data.table ? <TableOutput data={data.table} /> : null;
            case 'chart':
                return data.chart ? <ChartOutput data={data.chart} /> : null;
            case 'text':
            default:
                return <p className="text-gray-700 whitespace-pre-wrap">{data.text || 'No details provided.'}</p>;
        }
    };

    return (
        <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-lg">{title || 'Response'}</h3>
            <div className="my-2">{renderData()}</div>
            <p className="text-sm text-gray-500 italic">{summary || '...'}</p>
        </div>
    );
};

export default StructuredResponseOutput;