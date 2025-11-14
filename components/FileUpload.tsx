
import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 text-center">
        <div className="flex justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-blue-500" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">UniK Incident Analysis</h1>
        <p className="text-gray-600">Upload your <code className="px-2 py-1 text-sm bg-gray-200 rounded">uniK.xlsx</code> file to get started.</p>
        <label
          htmlFor="excel-uploader"
          className={`relative block w-full px-12 py-16 mt-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <input
            id="excel-uploader"
            type="file"
            className="sr-only"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M12 11v6" /><path d="M9.5 13.5l2.5 -2.5l2.5 2.5" /></svg>
            <p className="text-gray-500">
              <span className="font-semibold text-blue-500">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">XLSX or XLS file</p>
          </div>
        </label>
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Processing file...</span>
          </div>
        )}
        {error && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-1">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
