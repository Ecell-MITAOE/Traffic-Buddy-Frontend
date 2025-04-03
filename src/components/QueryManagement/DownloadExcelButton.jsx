import axios from "axios";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

const DownloadExcelButton = (downloadAsExcel, exportLoading) => {
  return (
    <button
      onClick={downloadAsExcel}
      disabled={exportLoading}
      className="bg-green-600 hover:bg-green-700 text-tBase px-3 py-2 rounded-lg flex items-center"
    >
      {exportLoading ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></div>
          Exporting...
        </>
      ) : (
        <>
          <Download size={18} className="mr-2" />
          Download Excel
        </>
      )}
    </button>
  );
};

export default DownloadExcelButton;
