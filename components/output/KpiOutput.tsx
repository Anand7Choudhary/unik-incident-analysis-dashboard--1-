import React from 'react';
import { KpiData } from '../../types';

interface KpiOutputProps {
    data: KpiData;
}

const KpiOutput: React.FC<KpiOutputProps> = ({ data }) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800">{data.label}</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{data.value}</p>
            {data.description && <p className="text-xs text-blue-600 mt-1">{data.description}</p>}
        </div>
    );
};

export default KpiOutput;