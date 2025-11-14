import React from 'react';
import { TableData } from '../../types';

interface TableOutputProps {
    data: TableData;
}

const TableOutput: React.FC<TableOutputProps> = ({ data }) => {
    return (
        <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        {data.headers.map((header, i) => (
                            <th key={i} scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableOutput;