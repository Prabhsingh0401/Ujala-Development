import React from 'react';
import * as XLSX from 'xlsx';
import { FileDown } from 'lucide-react';

const ExportToExcelButton = ({ getData, filename, buttonText = "Export to Excel" }) => {

    const exportToExcel = () => {
        const data = getData();
        
        if (!data || data.length === 0) {
            alert("No data to export");
            return;
        }

        // Create a new workbook and a new worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Write the workbook and trigger the download
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    return (
        <button
            onClick={exportToExcel}
            className="text-green-400 px-4 py-2 rounded-lg hover:bg-gray-100 border transition-colors flex items-center"
        >
            <FileDown className="w-4 h-4 mr-2" />
            {buttonText}
        </button>
    );
};

export default ExportToExcelButton;
