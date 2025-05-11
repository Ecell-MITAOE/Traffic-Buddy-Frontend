import { useState, useEffect } from "react";
import { AlertTriangle, Check, FileSearch, Mail, MapPin, Search, Calendar, Download, Filter } from "lucide-react"; // Added Filter icon
import { motion } from "framer-motion";
import axios from "axios";
import * as XLSX from 'xlsx';
import Header from "../components/common/Header";

const backendUrl = import.meta.env.VITE_Backend_URL || "http://localhost:3000";

// Re-use the divisions array (ensure it matches AdminQueryManagementPage if needed)
const divisions = [
  { value: "", label: "All Divisions" }, // Added All Divisions option
  { value: "Mahalunge", label: "Mahalunge" },
  { value: "Chakan", label: "Chakan" },
  { value: "Dighi-Alandi", label: "Dighi-Alandi" },
  { value: "Bhosari", label: "Bhosari" },
  { value: "Talwade", label: "Talwade" },
  { value: "Pimpri", label: "Pimpri" },
  { value: "Chinchwad", label: "Chinchwad" },
  { value: "Nigdi", label: "Nigdi" },
  { value: "Sangavi", label: "Sangavi" },
  { value: "Hinjewadi", label: "Hinjewadi" },
  { value: "Wakad", label: "Wakad" },
  { value: "Bavdhan", label: "Bavdhan" },
  { value: "Dehuroad", label: "Dehuroad" },
  { value: "Talegaon", label: "Talegaon" },
  { value: "Unknown", label: "Unknown" }, // Added Unknown option if needed
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
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState(""); // State for division filter

  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Fetch records when page or division filter changes
  useEffect(() => {
    // Reset to page 1 when filter changes
    if (currentPage !== 1) {
        setCurrentPage(1);
    } else {
        fetchEmailRecords();
    }
  }, [selectedDivisionFilter]); // Add division filter as dependency

  // Fetch records when page changes (if filter hasn't changed)
  useEffect(() => {
    fetchEmailRecords();
  }, [currentPage]);


  useEffect(() => {
    if (emailRecords.length > 0) {
      groupEmailRecords();
    } else {
        setGroupedRecords([]); // Clear grouped records if emailRecords is empty
    }
  }, [emailRecords]);

  const fetchEmailRecords = async () => {
    setLoading(true);
    setEmailRecords([]); // Clear records before fetching
    setGroupedRecords([]); // Clear grouped records
    try {
      const params = {
        page: currentPage,
        limit: 50, // Keep fetching enough for grouping
      };
      // Add division filter to params if selected
      if (selectedDivisionFilter) {
        params.division = selectedDivisionFilter;
      }

      console.log("Fetching email records with params:", params); // Debug log

      const response = await axios.get(`${backendUrl}/api/queries/email-records`, { params });

      if (response.data.success) {
        console.log(`Fetched ${response.data.count} email records`); // Debug log
        setEmailRecords(response.data.data);
        setTotalPages(response.data.totalPages);

        // Fetch details for all unique query IDs
        const uniqueQueryIds = [...new Set(response.data.data.map(record => record.queryId))];
        if (uniqueQueryIds.length > 0) {
             fetchQueryDetailsForIds(uniqueQueryIds);
        }

      } else {
        console.error("Error fetching email records:", response.data.message);
        setEmailRecords([]); // Ensure records are cleared on error
        setGroupedRecords([]);
      }
    } catch (error) {
      console.error("Error fetching email records:", error);
      setEmailRecords([]); // Ensure records are cleared on error
      setGroupedRecords([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchQueryDetailsForIds = async (queryIds) => {
    const detailsMap = {};
    const idsToFetch = queryIds.filter(id => id && !queryDetailsMap[id]); // Only fetch if not already cached

    if (idsToFetch.length === 0) return;

    console.log("Fetching details for query IDs:", idsToFetch);

    // Use Promise.all for potentially faster fetching
    const promises = idsToFetch.map(id =>
        axios.get(`${backendUrl}/api/queries/${id}`)
            .then(response => {
                if (response.data.success) {
                    detailsMap[id] = response.data.data;
                }
            })
            .catch(error => {
                console.error(`Error fetching details for query ${id}:`, error);
                // Store null or an error marker if needed
                detailsMap[id] = null;
            })
    );

    await Promise.all(promises);

    // Merge new details with existing ones
    setQueryDetailsMap(prevMap => ({ ...prevMap, ...detailsMap }));
};


  const groupEmailRecords = () => {
    // Group records by query ID and department name
    const groupedByQueryAndDept = emailRecords.reduce((acc, record) => {
      // Ensure record has necessary fields
      if (!record || !record.queryId || !record.departmentName || !record.emails || !record._id) {
        console.warn("Skipping incomplete record:", record);
        return acc;
      }
      const key = `${record.queryId}_${record.departmentName}`;

      if (!acc[key]) {
        acc[key] = {
          queryId: record.queryId,
          departmentName: record.departmentName,
          subject: record.subject || "No Subject",
          sentAt: record.sentAt || new Date().toISOString(),
          division: record.division || "Unknown",
          emailList: [record.emails],
          recordIds: [record._id],
          status: record.status || "sent" // Include status
        };
      } else {
        // Add this email to the list if it's not already there
        if (!acc[key].emailList.includes(record.emails)) {
          acc[key].emailList.push(record.emails);
          acc[key].recordIds.push(record._id);
        }
        // Update status if the current record has a more informative one (e.g., failed)
        if (record.status && record.status !== 'sent' && acc[key].status === 'sent') {
           acc[key].status = record.status;
        }
         // Keep the latest sentAt time for the group
        if (new Date(record.sentAt) > new Date(acc[key].sentAt)) {
             acc[key].sentAt = record.sentAt;
        }

      }

      return acc;
    }, {});

    // Convert to array and sort by sent date (newest first)
    const groupedArray = Object.values(groupedByQueryAndDept).sort((a, b) =>
      new Date(b.sentAt) - new Date(a.sentAt)
    );

    console.log("Grouped records:", groupedArray); // Debug log
    setGroupedRecords(groupedArray);
  };


  // No changes needed for fetchQueryDetails, openInGoogleMaps, formatDate, closeDetails

  const fetchQueryDetails = async (id) => {
    // Check cache first
    if (queryDetailsMap[id]) {
        setDetailsData(queryDetailsMap[id]);
        setViewDetailsId(id);
        return;
    }
    // Fetch if not in cache
    try {
      const response = await axios.get(`${backendUrl}/api/queries/${id}`);
      if (response.data.success) {
        setDetailsData(response.data.data);
        setViewDetailsId(id);
        // Update cache
        setQueryDetailsMap(prevMap => ({...prevMap, [id]: response.data.data}));
      }
    } catch (error) {
      console.error("Error fetching query details:", error);
      // Optionally handle error display
    }
  };

  const openInGoogleMaps = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        return date.toLocaleString();
    } catch (e) {
        return "Invalid Date";
    }
  };

  const closeDetails = () => {
    setViewDetailsId(null);
    setDetailsData(null);
  };


  const exportToExcel = async () => {
    setExportLoading(true);
    try {
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // *** CORE CHANGE: Ensure params for export respect the filter ***
        const params = {
            startDate: startDateStr,
            endDate: endDateStr,
            limit: 10000, // Fetch all matching records for the month/division
        };
        // *** ADD DIVISION FILTER TO EXPORT API CALL ***
        if (selectedDivisionFilter) {
            params.division = selectedDivisionFilter;
        }

        console.log("Exporting Email Records with params:", params); // Log the parameters used for the export fetch

        // Fetch specifically filtered records for export
        const response = await axios.get(`${backendUrl}/api/queries/email-records`, { params });

        if (response.data.success && response.data.data.length > 0) {
            const recordsToExport = response.data.data;
            console.log(`Fetched ${recordsToExport.length} records for export.`);

            // Fetch details ONLY for the queries in the filtered export data
            const uniqueQueryIds = [...new Set(recordsToExport.map(record => record.queryId).filter(id => id))];
            const exportDetailsMap = { ...queryDetailsMap }; // Use existing cache
            const idsToFetch = uniqueQueryIds.filter(id => !exportDetailsMap[id]);

            if (idsToFetch.length > 0) {
                console.log(`Fetching details for ${idsToFetch.length} new queries for export...`);
                const detailPromises = idsToFetch.map(id =>
                    axios.get(`${backendUrl}/api/queries/${id}`)
                    .then(res => {
                        if (res.data.success) {
                             // Update local map directly for immediate use
                             exportDetailsMap[id] = res.data.data;
                        }
                    })
                    .catch(err => console.error(`Export detail fetch error for ${id}:`, err))
                );
                await Promise.all(detailPromises);
                // Optionally update state cache if desired, but not strictly needed for export itself
                // setQueryDetailsMap(prevMap => ({...prevMap, ...exportDetailsMap}));
            }

            // Group the **filtered** records fetched for export
            const groupedDataForExport = {};
            recordsToExport.forEach(record => {
                if (!record || !record.queryId || !record.departmentName || !record.emails || !record._id) return;
                const key = `${record.queryId}_${record.departmentName}`;
                if (!groupedDataForExport[key]) {
                    groupedDataForExport[key] = {
                        queryId: record.queryId,
                        departmentName: record.departmentName,
                        subject: record.subject || "No Subject",
                        sentAt: record.sentAt || new Date().toISOString(),
                        division: record.division || "Unknown",
                        emailList: new Set([record.emails]),
                        status: record.status || "sent"
                    };
                } else {
                    groupedDataForExport[key].emailList.add(record.emails);
                    if (new Date(record.sentAt) > new Date(groupedDataForExport[key].sentAt)) {
                        groupedDataForExport[key].sentAt = record.sentAt;
                    }
                    if (record.status === 'failed') groupedDataForExport[key].status = 'failed';
                }
            });

            // Prepare data for SheetJS
            const excelData = Object.values(groupedDataForExport).map((item, index) => {
                const queryDetails = exportDetailsMap[item.queryId] || {}; // Use details fetched/cached for export
                let location = queryDetails.location?.address || "N/A";

                return {
                    "Sr. No.": index + 1,
                    "Department": item.departmentName,
                    "Division": item.division,
                    "Subject": item.subject,
                    "Email List": Array.from(item.emailList).join(", "),
                    "Sent At": formatDate(item.sentAt),
                    "Status": item.status,
                    "Query Type": queryDetails.query_type || "N/A",
                    "Description": queryDetails.description || "N/A",
                    "Location": location,
                    "Reported By": queryDetails.user_name || "N/A",
                    "Contact": queryDetails.user_id ? queryDetails.user_id.replace(/whatsapp:\+?/i, "") : "N/A",
                    "Reported On": queryDetails.timestamp ? formatDate(queryDetails.timestamp) : "N/A",
                    "Current Status": queryDetails.status || "N/A"
                };
            });

            // Generate and download Excel
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const columnWidths = [ /* ... (keep your column widths) ... */
                { wch: 6 }, { wch: 20 }, { wch: 15 }, { wch: 35 }, { wch: 45 },
                { wch: 22 }, { wch: 10 }, { wch: 20 }, { wch: 45 }, { wch: 45 },
                { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 15 }
             ];
            worksheet['!cols'] = columnWidths;
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Email Records");
            const monthName = startDate.toLocaleString('default', { month: 'long' });
            let fileName = `TrafficBuddy_EmailRecords_${monthName}_${year}`;
            if (selectedDivisionFilter) {
                fileName += `_${selectedDivisionFilter}`;
            }
            fileName += `.xlsx`;
            XLSX.writeFile(workbook, fileName);

        } else if (!response.data.success) {
             console.error("API error fetching records for export:", response.data.message);
             alert(`Failed to fetch records for export: ${response.data.message}`);
        } else {
            console.log("No records found for the selected criteria for export.");
            alert(`No email records found for ${selectedMonth}${selectedDivisionFilter ? ' in ' + selectedDivisionFilter + ' division' : ''} to export.`);
        }
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("An error occurred during export. Please check console for details.");
    } finally {
        setExportLoading(false);
    }
};

  // Handler for division filter change
  const handleDivisionFilterChange = (e) => {
    setSelectedDivisionFilter(e.target.value);
    // Reset to page 1 when filter changes - handled by useEffect
    // setCurrentPage(1);
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
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4"> {/* Added flex-wrap and gap */}
            <h2 className="text-xl font-semibold text-tBase">Email Records</h2>

            <div className="flex flex-wrap items-center space-x-4 gap-y-2"> {/* Added flex-wrap and gap-y */}
              {/* Division Filter Dropdown */}
              <div className="flex items-center">
                 <Filter size={16} className="text-gray-400 mr-2" />
                <label htmlFor="division-filter" className="text-sm text-gray-400 mr-2 whitespace-nowrap">
                  Filter Division:
                </label>
                <select
                  id="division-filter"
                  value={selectedDivisionFilter}
                  onChange={handleDivisionFilterChange}
                  className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-secondary text-sm" // Adjusted padding and text size
                >
                  {divisions.map(div => (
                    <option key={div.value} value={div.value} className="bg-primary hover:bg-hovPrimary">
                      {div.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="flex items-center">
                <label htmlFor="month-select" className="text-sm text-gray-400 mr-2 whitespace-nowrap">
                  Select Month:
                </label>
                <input
                  type="month"
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-secondary text-sm" // Adjusted padding and text size
                />
              </div>

              {/* Export Button */}
              <button
                onClick={exportToExcel}
                disabled={exportLoading}
                className="flex items-center px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md text-sm whitespace-nowrap" // Added whitespace-nowrap
              >
                {exportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <Download size={16} className="mr-2" />
                )}
                Export Excel
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
                {groupedRecords.length > 0 ? (
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
                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[7%]"> {/* Adjusted width */}
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[8%]"> {/* Adjusted width */}
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {groupedRecords.map((record, index) => (
                        <motion.tr
                          key={`${record.queryId}_${record.departmentName}_${index}`} // More unique key
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-hovPrimary/50" // Added hover effect
                        >
                          <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">
                            {(currentPage - 1) * 50 + index + 1} {/* Correct Sr No with limit */}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-300 truncate" title={record.departmentName}>
                              {record.departmentName}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-300">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                                {record.emailList.length} recipient(s)
                              </span>
                              <div className="mt-1 text-xs text-gray-400 truncate" title={record.emailList.join(", ")}>
                                {record.emailList[0]}{record.emailList.length > 1 ? `, +${record.emailList.length - 1}` : ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-300 truncate" title={record.subject}>
                              {record.subject}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300 whitespace-nowrap">
                            {formatDate(record.sentAt)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-800 text-purple-100">
                              {record.division || "N/A"}
                            </span>
                          </td>
                           <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'failed' ? 'bg-red-800 text-red-100' : 'bg-green-800 text-green-100'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-400 hover:text-blue-300 text-xs"
                                onClick={() => fetchQueryDetails(record.queryId)}
                                title="View Query Details"
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                 ) : (
                    <div className="text-center py-10 text-gray-400">
                      No email records found{selectedDivisionFilter ? ` for ${selectedDivisionFilter} division` : ''}.
                    </div>
                )}
              </div>

              {groupedRecords.length > 0 && (
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
              )}
            </>
          )}
        </motion.div>

        {/* Details Modal - No changes needed here */}
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
                  Query Details: {detailsData.query_type}
                </h2>
                <button
                  className="text-gray-400 hover:text-tBase"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Display email recipients within the modal */}
                 <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">
                    Email Forwarded To:
                  </h3>
                  <div className="bg-primary p-3 rounded-lg">
                    {groupedRecords
                      .filter(record => record.queryId === viewDetailsId)
                      .map(record => (
                        <div key={record.departmentName} className="mb-2 last:mb-0">
                          <div className="font-semibold text-gray-200 text-base">{record.departmentName}</div>
                          <ul className="list-disc list-inside ml-3 mt-1">
                            {record.emailList.map(email => (
                              <li key={email} className="text-sm text-gray-300">
                                {email}
                              </li>
                            ))}
                          </ul>
                           <p className="text-xs text-gray-500 mt-1">Sent: {formatDate(record.sentAt)}</p>
                        </div>
                      ))}
                     {groupedRecords.filter(record => record.queryId === viewDetailsId).length === 0 && (
                        <p className="text-sm text-gray-400">No email forwarding records found for this query.</p>
                    )}
                  </div>
                </div>


                {detailsData.photo_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Photo Evidence:
                    </h3>
                     <a
                        href={detailsData.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Click to view full size"
                        className="block"
                     >
                        <img
                            src={detailsData.photo_url}
                            alt="Report evidence"
                            className="rounded-lg object-contain max-w-full mx-auto border border-borderPrimary cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: "400px" }}
                        />
                         <p className="text-xs text-center text-blue-400 mt-1">
                            Click to view full size image
                        </p>
                     </a>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-400">
                    Description:
                  </h3>
                  <p className="text-gray-200">{detailsData.description || "N/A"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Reported By:
                    </h3>
                    <p className="text-gray-200">{detailsData.user_name || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Reporter Contact:
                    </h3>
                    <p className="text-gray-200">
                      {detailsData.user_id ? detailsData.user_id.replace(/whatsapp:\+?/i, "") : "N/A"}
                    </p>
                  </div>

                   <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Division:
                    </h3>
                    <p className="text-gray-200">{detailsData.divisionName || "Unknown"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Reported On:
                    </h3>
                    <p className="text-gray-200">
                      {formatDate(detailsData.timestamp)}
                    </p>
                  </div>
                   <div>
                    <h3 className="text-sm font-medium text-gray-400">
                     Current Query Status:
                    </h3>
                    <p className="text-gray-200 font-semibold">{detailsData.status || "N/A"}</p>
                  </div>
                </div>

                {detailsData.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Location Address:
                    </h3>
                    <p className="text-gray-200">
                      {detailsData.location.address || "N/A"}
                    </p>
                     {detailsData.location.latitude && detailsData.location.longitude && (
                        <button
                            className="mt-2 flex items-center text-blue-400 hover:text-blue-300 text-sm"
                            onClick={() =>
                                openInGoogleMaps(
                                    detailsData.location.latitude,
                                    detailsData.location.longitude
                                )
                            }
                            >
                            <MapPin size={16} className="mr-1" /> View on Google Maps
                        </button>
                     )}
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
                    {detailsData.resolved_by?.name && (
                      <p className="text-sm text-gray-400 mt-1">
                        Resolved by: {detailsData.resolved_by.name}
                      </p>
                    )}
                  </div>
                )}
                 {detailsData.resolution_image_url && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                            Resolution Image:
                        </h3>
                         <a
                            href={detailsData.resolution_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Click to view full size resolution image"
                            className="block"
                        >
                            <img
                                src={detailsData.resolution_image_url}
                                alt="Resolution evidence"
                                className="rounded-lg object-contain max-w-full mx-auto border border-borderPrimary cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ maxHeight: "300px" }}
                            />
                             <p className="text-xs text-center text-blue-400 mt-1">
                                Click to view full size image
                            </p>
                        </a>
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