import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown } from 'lucide-react';

const ExportToPdfButton = ({ getData, columns, filename, buttonText = "Export to PDF" }) => {

    const exportToPdf = () => {
        try {
            const data = getData();
            if (!data || data.length === 0) {
                alert("No data to export");
                return;
            }

            const doc = new jsPDF();

            const tableColumn = columns.map(col => col.header);
            const tableRows = data.map(item => columns.map(col => item[col.accessor] || ''));

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
            });

            doc.save(`${filename}.pdf`);

        } catch (error) {
            console.error("An error occurred during PDF export:", error);
            alert(`An error occurred during PDF export: ${error.message}`);
        }
    };

    return (
        <button
            onClick={exportToPdf}
            className="text-red-600 px-4 py-2 rounded-lg hover:bg-gray-100 border transition-colors flex items-center"
        >
            <FileDown className="w-4 h-4 mr-2" />
            {buttonText}
        </button>
    );
};

export default ExportToPdfButton;
