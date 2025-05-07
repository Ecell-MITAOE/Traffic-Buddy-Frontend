import { useState, useEffect } from "react";
import { AlertTriangle, Check, FileSearch, Mail, MapPin, Search, Calendar, Download } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import * as XLSX from 'xlsx';
import Header from "../components/common/Header";

const backendUrl = import.meta.env.VITE_Backend_URL || "http://localhost:3000";

// Add divisions constant
const divisions = [
  { value: "MAHALUNGE", label: "Mahalunge", id: "67dac1a2a771ed87f82890b2" },
  { value: "CHAKAN", label: "Chakan", id: "67dc019a6532e1c784d60840" },
  { value: "DIGHI ALANDI", label: "Dighi-Alandi", id: "67db077dfa28812fe4f9573f" },
  { value: "BHOSARI", label: "Bhosari", id: "67dc19f0a9ae16de2619b735" },
  { value: "TALWADE", label: "Talwade", id: "67dac59365aca82fe28bb003" },
  { value: "PIMPRI", label: "Pimpri", id: "67dc18f0a9ae16de2619b72c" },
  { value: "CHINCHWAD", label: "Chinchwad", id: "67dc1a41a9ae16de2619b739" },
  { value: "NIGDI", label: "Nigdi", id: "67dc184da9ae16de2619b728" },
  { value: "SANGAVI", label: "Sangavi", id: "67dc198ea9ae16de2619b731" },
  { value: "HINJEWADI", label: "Hinjewadi", id: "67dc19b7a9ae16de2619b733" },
  { value: "WAKAD", label: "Wakad", id: "67dc189fa9ae16de2619b72a" },
  { value: "BAVDHAN", label: "Bavdhan", id: "67dc1969a9ae16de2619b72f" },
  { value: "DEHUROAD", label: "Dehuroad", id: "67dc1a22a9ae16de2619b737" },
  { value: "TALEGAON", label: "Talegaon", id: "67dac3e9bb20f51c531c1509" },
];

const EmailRecordsPage = () => {
  const [emailRecords, setEmailRecords] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDetailsId, setViewDetailsId] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());
  const [queryDetailsMap, setQueryDetailsMap] = useState({});
  // Add selected division state
  const [selectedDivision, setSelectedDivision] = useState("");
  
  // For Excel export
  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  useEffect(() => {
    fetchEmailRecords();
  }, [currentPage, selectedDivision]); // Add selectedDivision as dependency

  useEffect(() => {
    if (emailRecords.length > 0) {
      groupEmailRecords();
    }
  }, [emailRecords]);

  // First, update the fetchEmailRecords function
const fetchEmailRecords = async () => {
  setLoading(true);
  try {
    const response = await axios.get(`${backendUrl}/api/queries/email-records`, {
      params: {
        page: currentPage,
        limit: 50, // Get more records to allow for proper grouping
        division: selectedDivision || undefined, // Add division filter parameter
      },
    });
    
    if (response.data.success) {
      let records = response.data.data;
      
      // Filter records by division if selected, also excluding "Unknown" division
      if (selectedDivision) {
        records = records.filter(record => 
          record.division === selectedDivision
        );
      }
      
      setEmailRecords(records);
      setTotalPages(response.data.totalPages);
      
      // Fetch details for all unique query IDs
      const uniqueQueryIds = [...new Set(records.map(record => record.queryId))];
      fetchQueryDetailsForIds(uniqueQueryIds);
      
      setLoading(false);
    } else {
      setLoading(false);
      console.error("Error fetching email records:", response.data.message);
    }
  } catch (error) {
    setLoading(false);
    console.error("Error fetching email records:", error);
  }
};

// Next, update the exportToExcel function
const exportToExcel = async () => {
  setExportLoading(true);
  try {
    // Extract year and month from the selected value
    const [year, month] = selectedMonth.split('-');
    
    // Construct date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Format dates for API request
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Fetch email records for the selected month (all pages)
    const response = await axios.get(`${backendUrl}/api/queries/email-records`, {
      params: {
        startDate: startDateStr,
        endDate: endDateStr,
        limit: 1000, // Get a large batch
        division: selectedDivision || undefined, // Add division filter to export
      },
    });
    
    if (response.data.success) {
      // Filter records by division if selected
      let recordsToExport = response.data.data;
      
      // Apply division filter on the client side as well
      if (selectedDivision) {
        recordsToExport = recordsToExport.filter(record => 
          record.division === selectedDivision
        );
      }
      
      // Fetch all query details for the records to be exported
      const uniqueQueryIds = [...new Set(recordsToExport.map(record => record.queryId))];
      const exportDetailsMap = {};
      
      for (const id of uniqueQueryIds) {
        try {
          const response = await axios.get(`${backendUrl}/api/queries/${id}`);
          if (response.data.success) {
            exportDetailsMap[id] = response.data.data;
          }
        } catch (error) {
          console.error(`Error fetching details for query ${id}:`, error);
        }
      }
      
      // Group records by query ID and department
      const groupedRecords = {};
      recordsToExport.forEach(record => {
        const key = `${record.queryId}_${record.departmentName}`;
        if (!groupedRecords[key]) {
          groupedRecords[key] = {
            queryId: record.queryId,
            departmentName: record.departmentName,
            subject: record.subject,
            sentAt: formatDate(record.sentAt),
            division: record.division || "Unknown",
            emailList: [record.emails],
            status: record.status || "sent"
          };
        } else if (!groupedRecords[key].emailList.includes(record.emails)) {
          groupedRecords[key].emailList.push(record.emails);
        }
      });
      
      // Convert to array for Excel export
      const excelData = Object.values(groupedRecords).map((item, index) => {
        const queryDetails = exportDetailsMap[item.queryId] || {};
        let location = "";
        if (queryDetails.location && queryDetails.location.address) {
          location = queryDetails.location.address;
        }
        
        return {
          "Sr. No.": index + 1,
          "Department": item.departmentName,
          "Division": item.division,
          "Subject": item.subject,
          "Email List": item.emailList.join(", "),
          "Sent At": item.sentAt,
          "Status": item.status,
          "Query Type": queryDetails.query_type || "",
          "Description": queryDetails.description || "",
          "Location": location,
          "Reported By": queryDetails.user_name || "",
          "Contact": queryDetails.user_id ? queryDetails.user_id.replace("whatsapp:", "") : "",
          "Reported On": queryDetails.timestamp ? formatDate(queryDetails.timestamp) : "",
          "Current Status": queryDetails.status || ""
        };
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 6 },   // Sr. No.
        { wch: 15 },  // Department
        { wch: 12 },  // Division
        { wch: 30 },  // Subject
        { wch: 40 },  // Email List
        { wch: 20 },  // Sent At
        { wch: 8 },   // Status
        { wch: 15 },  // Query Type
        { wch: 40 },  // Description
        { wch: 40 },  // Location
        { wch: 15 },  // Reported By
        { wch: 15 },  // Contact
        { wch: 20 },  // Reported On
        { wch: 12 }   // Current Status
      ];
      
      worksheet['!cols'] = columnWidths;
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Email Records");
      
      // Generate Excel file
      const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
      const divisionText = selectedDivision ? `_${selectedDivision}` : '';
      const fileName = `TrafficBuddy_EmailRecords_${monthName}_${year}${divisionText}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      setExportLoading(false);
    }
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    setExportLoading(false);
  }
};

// Finally, we need to update the backend endpoint to properly filter by division
// This requires changes to the backend, but for now we'll handle it client-side

  // Handle division change
  const handleDivisionChange = (e) => {
    setSelectedDivision(e.target.value);
    setCurrentPage(1); // Reset to first page when changing division
  };

  const fetchQueryDetailsForIds = async (queryIds) => {
    const detailsMap = {};
    
    for (const id of queryIds) {
      try {
        const response = await axios.get(`${backendUrl}/api/queries/${id}`);
        if (response.data.success) {
          detailsMap[id] = response.data.data;
        }
      } catch (error) {
        console.error(`Error fetching details for query ${id}:`, error);
      }
    }
    
    setQueryDetailsMap(detailsMap);
  };

  const groupEmailRecords = () => {
    // Group records by query ID and department name
    const groupedByQueryAndDept = emailRecords.reduce((acc, record) => {
      const key = `${record.queryId}_${record.departmentName}`;
      
      if (!acc[key]) {
        acc[key] = {
          queryId: record.queryId,
          departmentName: record.departmentName,
          subject: record.subject,
          sentAt: record.sentAt,
          division: record.division || "Unknown",
          emailList: [record.emails],
          recordIds: [record._id]
        };
      } else {
        // Add this email to the list if it's not already there
        if (!acc[key].emailList.includes(record.emails)) {
          acc[key].emailList.push(record.emails);
          acc[key].recordIds.push(record._id);
        }
      }
      
      return acc;
    }, {});

    // Convert to array and sort by sent date (newest first)
    const groupedArray = Object.values(groupedByQueryAndDept).sort((a, b) => 
      new Date(b.sentAt) - new Date(a.sentAt)
    );
    
    setGroupedRecords(groupedArray);
  };

  const fetchQueryDetails = async (id) => {
    try {
      const response = await axios.get(`${backendUrl}/api/queries/${id}`);
      if (response.data.success) {
        setDetailsData(response.data.data);
        setViewDetailsId(id);
      }
    } catch (error) {
      console.error("Error fetching query details:", error);
    }
  };

  const openInGoogleMaps = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const closeDetails = () => {
    setViewDetailsId(null);
    setDetailsData(null);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Email Records" />

      <main className="max-w-full mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-tBase">Email Records</h2>
            
            <div className="flex space-x-4">
              {/* Add Division Filter Dropdown */}
              <div className="flex items-center">
                <label htmlFor="division-select" className="text-sm text-gray-400 mr-2">
                  Division:
                </label>
                <select
                  id="division-select"
                  value={selectedDivision}
                  onChange={handleDivisionChange}
                  className="bg-bgPrimary border border-borderPrimary rounded-md px-3 py-1 text-sm"
                >
                  <option value="">All Divisions</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.label}>
                      {division.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="month-select" className="text-sm text-gray-400 mr-2">
                  Month:
                </label>
                <input 
                  type="month" 
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-bgPrimary border border-borderPrimary rounded-md px-3 py-1 text-sm"
                />
              </div>
              
              <button
                onClick={exportToExcel}
                disabled={exportLoading}
                className="flex items-center px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md text-sm"
              >
                {exportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <Download size={16} className="mr-2" />
                )}
                Export to Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-700 table-fixed">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                        Sr. No.
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%]">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[18%]">
                        Emails
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[25%]">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%]">
                        Sent At
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[10%]">
                        Division
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[10%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {groupedRecords.map((record, index) => (
                      <motion.tr
                        key={`${record.queryId}_${record.departmentName}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {(currentPage - 1) * 10 + index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300" title={record.departmentName}>
                            {record.departmentName}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                              {record.emailList.length} recipient(s)
                            </span>
                            <div className="mt-1 text-xs text-gray-400 overflow-hidden text-ellipsis" title={record.emailList.join(", ")}>
                              {record.emailList[0]}{record.emailList.length > 1 ? `, +${record.emailList.length - 1} more` : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-300 overflow-hidden text-ellipsis" title={record.subject}>
                            {record.subject}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-300">
                          {formatDate(record.sentAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-800 text-purple-100">
                            {record.division}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => fetchQueryDetails(record.queryId)}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-400">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? "bg-bgSecondary text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-tBase hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((c) => (c < totalPages ? c + 1 : c))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === totalPages
                        ? "bg-bgSecondary text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-tBase hover:bg-blue-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {viewDetailsId && detailsData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-bgSecondary rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-tBase">
                  {detailsData.query_type} Report
                </h2>
                <button
                  className="text-gray-400 hover:text-tBase"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Email Recipients for this query */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Email Recipients:
                  </h3>
                  <div className="bg-bgPrimary p-3 rounded-lg">
                    {groupedRecords
                      .filter(record => record.queryId === viewDetailsId)
                      .map(record => (
                        <div key={record.departmentName} className="mb-2">
                          <div className="font-medium text-gray-300">{record.departmentName}:</div>
                          <ul className="list-disc list-inside ml-2">
                            {record.emailList.map(email => (
                              <li key={email} className="text-sm text-gray-400">
                                {email}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>

                {detailsData.photo_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Photo Evidence:
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={detailsData.photo_url}
                        alt="Report evidence"
                        className="rounded-lg object-contain max-w-full"
                        style={{ maxHeight: "400px" }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-400">
                    Description:
                  </h3>
                  <p className="text-gray-200">{detailsData.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Reported By:
                    </h3>
                    <p className="text-gray-200">{detailsData.user_name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Reporter Contact:
                    </h3>
                    <p className="text-gray-200">
                      {detailsData.user_id.replace("whatsapp:", "")}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Reported On:
                    </h3>
                    <p className="text-gray-200">
                      {formatDate(detailsData.timestamp)}
                    </p>
                  </div>
                </div>

                {detailsData.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Location Address:
                    </h3>
                    <p className="text-gray-200">
                      {detailsData.location.address}
                    </p>
                    <button
                      className="mt-2 flex items-center text-blue-400 hover:text-blue-300"
                      onClick={() =>
                        openInGoogleMaps(
                          detailsData.location.latitude,
                          detailsData.location.longitude
                        )
                      }
                    >
                      <MapPin size={16} className="mr-1" /> View on Google Maps
                    </button>
                  </div>
                )}

                {detailsData.resolution_note && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Resolution Notes:
                    </h3>
                    <p className="text-gray-200">
                      {detailsData.resolution_note}
                    </p>
                    {detailsData.resolved_at && (
                      <p className="text-sm text-gray-400 mt-1">
                        Resolved on: {formatDate(detailsData.resolved_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmailRecordsPage;