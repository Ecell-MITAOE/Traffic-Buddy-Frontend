import { useState, useEffect } from "react";
import { AlertTriangle, Check, FileSearch, Mail, MapPin, Search, Calendar, Download } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import * as XLSX from 'xlsx';
import Header from "../components/common/Header";

const backendUrl = import.meta.env.VITE_Backend_URL || "http://localhost:3000";

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
  const [selectedDivision, setSelectedDivision] = useState(""); // Stores division label e.g. "Sangavi"

  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  useEffect(() => {
    fetchEmailRecords(currentPage); // Pass currentPage to ensure it fetches for the intended page
  }, [currentPage, selectedDivision, selectedMonth]);

  useEffect(() => {
    if (emailRecords.length > 0) {
      groupEmailRecords();
    } else {
      setGroupedRecords([]); // Clear grouped records if emailRecords is empty
    }
  }, [emailRecords]);

  useEffect(() => {
    console.log("Division filter changed to:", selectedDivision);
  }, [selectedDivision]);

  const fetchEmailRecords = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const [year, monthVal] = selectedMonth.split('-');
      const startDate = new Date(year, parseInt(monthVal) - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, parseInt(monthVal), 0).toISOString().split('T')[0];
      
      // Use authToken instead of token
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }
  
      const response = await axios.get(`${backendUrl}/api/queries/email-records`, {
        params: {
          page: pageToFetch,
          limit: 10,
          division: selectedDivision || undefined,
          startDate: startDate,
          endDate: endDate,
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setEmailRecords(response.data.data);
        setTotalPages(response.data.totalPages);
        
        const uniqueQueryIds = [...new Set(response.data.data.map(record => record.queryId).filter(id => id))];
        if (uniqueQueryIds.length > 0) {
          fetchQueryDetailsForIds(uniqueQueryIds);
        } else {
          setQueryDetailsMap({});
        }
      } else {
        console.error("Error fetching email records:", response.data.message);
        setEmailRecords([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching email records:", error);
      setEmailRecords([]);
      setTotalPages(1);
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionChange = (e) => {
    const newDivision = e.target.value;
    console.log("Selected division changed to:", newDivision);
    setSelectedDivision(newDivision);
    setCurrentPage(1);
  };

  const fetchQueryDetailsForIds = async (queryIds) => {
    const detailsMap = { ...queryDetailsMap };
    // Use authToken instead of token
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      return; // Skip if no token
    }
    
    for (const id of queryIds) {
      if (!detailsMap[id]) {
        try {
          const response = await axios.get(`${backendUrl}/api/queries/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.data.success) {
            detailsMap[id] = response.data.data;
          }
        } catch (error) {
          console.error(`Error fetching details for query ${id}:`, error);
        }
      }
    }
    setQueryDetailsMap(detailsMap);
  };

  const groupEmailRecords = () => {
    const groupedByQueryAndDept = emailRecords.reduce((acc, record) => {
      const key = `${record.queryId}_${record.departmentName}`;
      if (!acc[key]) {
        acc[key] = {
          queryId: record.queryId,
          departmentName: record.departmentName,
          subject: record.subject,
          sentAt: record.sentAt,
          division: record.division || "Unknown",
          emailList: [record.emails], // Ensure emails is treated as a string here if model stores it as string
          recordIds: [record._id]
        };
      } else {
        // Assuming EmailRecord.emails is a single string per record.
        // If EmailRecord.emails can be an array, this logic needs adjustment.
        // For now, if it's a string, we just list unique records.
        // If multiple records for same queryId+dept exist, they'll be separate entries if their email string differs.
        // This grouping might need to be smarter if `record.emails` is a list of emails in a single string.
        // For simplicity, if `record.emails` is just one email string:
        if (!acc[key].emailList.includes(record.emails)) {
             acc[key].emailList.push(record.emails); // This would make emailList an array of strings
             acc[key].recordIds.push(record._id);
        }
      }
      return acc;
    }, {});
    const groupedArray = Object.values(groupedByQueryAndDept).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    setGroupedRecords(groupedArray);
  };


  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const [year, monthVal] = selectedMonth.split('-');
      const startDateStr = new Date(year, parseInt(monthVal) - 1, 1).toISOString().split('T')[0];
      const endDateStr = new Date(year, parseInt(monthVal), 0).toISOString().split('T')[0];
      
      // Use authToken instead of token
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        setExportLoading(false);
        return;
      }
      
      const response = await axios.get(`${backendUrl}/api/queries/email-records`, {
        params: {
          limit: 0, // Fetch all records for export
          startDate: startDateStr,
          endDate: endDateStr,
          division: selectedDivision || undefined,
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.data.length > 0) {
        const recordsToExport = response.data.data; // Already filtered by backend
        
        const uniqueQueryIdsForExport = [...new Set(recordsToExport.map(record => record.queryId).filter(id => id))];
        const exportDetailsMap = {}; // Fetch all details fresh for export consistency

        for (const id of uniqueQueryIdsForExport) {
            try {
                const queryDetailResponse = await axios.get(`${backendUrl}/api/queries/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (queryDetailResponse.data.success) {
                    exportDetailsMap[id] = queryDetailResponse.data.data;
                }
            } catch (error) {
                console.error(`Error fetching details for query ${id} during export:`, error);
            }
        }
        
        // Group records for Excel (similar to UI grouping but on the full dataset)
        const groupedForExcel = {};
        recordsToExport.forEach(record => {
          const key = `${record.queryId}_${record.departmentName}`;
          if (!groupedForExcel[key]) {
            groupedForExcel[key] = {
              queryId: record.queryId,
              departmentName: record.departmentName,
              subject: record.subject,
              sentAt: formatDate(record.sentAt),
              division: record.division || "Unknown",
              emailList: [record.emails], // Assuming record.emails is a string
              status: record.status || "sent"
            };
          } else {
            if (!groupedForExcel[key].emailList.includes(record.emails)) {
                 groupedForExcel[key].emailList.push(record.emails);
            }
          }
        });
        
        const excelData = Object.values(groupedForExcel).map((item, index) => {
          const queryDetails = exportDetailsMap[item.queryId] || {};
          return {
            "Sr. No.": index + 1,
            "Department": item.departmentName,
            "Division": item.division,
            "Subject": item.subject,
            "Email List": item.emailList.join("; "), // Join multiple email strings if they were grouped
            "Sent At": item.sentAt,
            "Status": item.status,
            "Query Type": queryDetails.query_type || "",
            "Description": queryDetails.description || "",
            "Location": queryDetails.location?.address || "",
            "Reported By": queryDetails.user_name || "",
            "Contact": queryDetails.user_id ? queryDetails.user_id.replace("whatsapp:", "") : "",
            "Reported On": queryDetails.timestamp ? formatDate(queryDetails.timestamp) : "",
            "Current Status": queryDetails.status || ""
          };
        });
        
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const columnWidths = [
          { wch: 6 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 40 },
          { wch: 20 }, { wch: 8 }, { wch: 15 }, { wch: 40 }, { wch: 40 },
          { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 }
        ];
        worksheet['!cols'] = columnWidths;
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Email Records");
        const monthName = new Date(year, parseInt(monthVal) - 1, 1).toLocaleString('default', { month: 'long' });
        const divisionText = selectedDivision ? `_${selectedDivision.replace(/\s+/g, '_')}` : '_All_Divisions';
        const fileName = `TrafficBuddy_EmailRecords_${monthName}_${year}${divisionText}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      } else {
        alert("No data available for the selected filters to export.");
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting to Excel. Please check console for details.");
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
      }
    } finally {
      setExportLoading(false);
    }
  };

  const fetchQueryDetails = async (id) => {
    setViewDetailsId(id);
    if (queryDetailsMap[id]) {
      setDetailsData(queryDetailsMap[id]);
      return;
    }
    
    try {
      // Use authToken instead of token
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
      }
      
      const response = await axios.get(`${backendUrl}/api/queries/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDetailsData(response.data.data);
        setQueryDetailsMap(prevMap => ({ ...prevMap, [id]: response.data.data }));
      } else {
        setDetailsData(null);
      }
    } catch (error) {
      console.error("Error fetching query details:", error);
      setDetailsData(null);
      if (error.response && error.response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
      }
    }
  };

  const openInGoogleMaps = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold text-tBase">Email Records</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-center">
              <div className="flex items-center">
                <label htmlFor="division-select" className="text-sm text-gray-400 mr-2">
                  Division:
                </label>
                <select
                  id="division-select"
                  value={selectedDivision} // This is the string label, e.g., "Sangavi"
                  onChange={handleDivisionChange}
                  className="bg-bgPrimary border border-borderPrimary rounded-md px-3 py-1 text-sm text-tBase"
                >
                  <option value="">All Divisions</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.label}> {/* value is division.label */}
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
                  className="bg-bgPrimary border border-borderPrimary rounded-md px-3 py-1 text-sm text-tBase"
                />
              </div>
              <button
                onClick={exportToExcel}
                disabled={exportLoading}
                className="flex items-center px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md text-sm w-full sm:w-auto justify-center"
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
              {groupedRecords.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No email records found for the selected criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-700 table-fixed">
                    {/* ... Table Head ... */}
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">Sr. No.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%]">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[18%]">Emails</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[25%]">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[15%]">Sent At</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[10%]">Division</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[10%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {groupedRecords.map((record, index) => (
                        <motion.tr
                          key={`${record.queryId}_${record.departmentName}_${index}`} // Ensure unique key
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
                              <div className="mt-1 text-xs text-gray-400 overflow-hidden text-ellipsis" title={record.emailList.join("; ")}>
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
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.division === "Unknown" ? "bg-gray-700 text-gray-200" : "bg-purple-800 text-purple-100"}`}>
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
              )}

              {totalPages > 1 && groupedRecords.length > 0 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-400">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md ${ currentPage === 1 ? "bg-bgSecondary text-gray-500 cursor-not-allowed" : "bg-blue-600 text-tBase hover:bg-blue-700"}`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((c) => (c < totalPages ? c + 1 : c))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md ${ currentPage === totalPages ? "bg-bgSecondary text-gray-500 cursor-not-allowed" : "bg-blue-600 text-tBase hover:bg-blue-700"}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Details Modal */}
        {viewDetailsId && detailsData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-bgSecondary rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" // Increased max-h
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-tBase">
                  {detailsData.query_type} Report (Ref: {detailsData._id})
                </h2>
                <button
                  className="text-gray-400 hover:text-tBase"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    Email Recipients for this Query:
                  </h3>
                  <div className="bg-bgPrimary p-3 rounded-lg text-sm">
                    {groupedRecords
                      .filter(record => record.queryId === viewDetailsId)
                      .map((recordGroup, idx) => (
                        <div key={`${recordGroup.departmentName}_${idx}`} className="mb-1">
                          <span className="font-medium text-gray-300">{recordGroup.departmentName}: </span>
                          <span className="text-gray-400">{recordGroup.emailList.join("; ")}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {detailsData.photo_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Photo Evidence:</h3>
                    <div className="flex justify-center p-2 bg-bgPrimary rounded">
                      <img src={detailsData.photo_url} alt="Report evidence" className="rounded-lg object-contain max-w-full max-h-[300px]" />
                    </div>
                  </div>
                )}
                
                {detailsData.resolution_image_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Resolution Proof:</h3>
                    <div className="flex justify-center p-2 bg-bgPrimary rounded">
                      <img src={detailsData.resolution_image_url} alt="Resolution proof" className="rounded-lg object-contain max-w-full max-h-[300px]" />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-400">Description:</h3>
                  <p className="text-gray-200 bg-bgPrimary p-2 rounded">{detailsData.description || "N/A"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong className="text-gray-400">Reported By:</strong> <span className="text-gray-200">{detailsData.user_name || "N/A"}</span></div>
                  <div><strong className="text-gray-400">Contact:</strong> <span className="text-gray-200">{detailsData.user_id ? detailsData.user_id.replace("whatsapp:", "") : "N/A"}</span></div>
                  <div><strong className="text-gray-400">Reported On:</strong> <span className="text-gray-200">{formatDate(detailsData.timestamp)}</span></div>
                  <div><strong className="text-gray-400">Current Status:</strong> <span className="text-gray-200">{detailsData.status || "N/A"}</span></div>
                  {detailsData.divisionName && <div><strong className="text-gray-400">Assigned Division:</strong> <span className="text-gray-200">{detailsData.divisionName}</span></div>}
                </div>

                {detailsData.location && (detailsData.location.latitude || detailsData.location.longitude || detailsData.location.address) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Location:</h3>
                    <p className="text-gray-200 bg-bgPrimary p-2 rounded">{detailsData.location.address || "Address not available"}</p>
                    {(detailsData.location.latitude && detailsData.location.longitude) && (
                      <button
                        className="mt-2 flex items-center text-blue-400 hover:text-blue-300 text-sm"
                        onClick={() => openInGoogleMaps(detailsData.location.latitude, detailsData.location.longitude)}
                      >
                        <MapPin size={14} className="mr-1" /> View on Google Maps
                      </button>
                    )}
                  </div>
                )}

                {detailsData.resolution_note && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Resolution Notes:</h3>
                    <p className="text-gray-200 bg-bgPrimary p-2 rounded">{detailsData.resolution_note}</p>
                    {detailsData.resolved_by?.name && <p className="text-xs text-gray-500 mt-1">Resolved by: {detailsData.resolved_by.name}</p>}
                    {detailsData.resolved_at && <p className="text-xs text-gray-500">Resolved on: {formatDate(detailsData.resolved_at)}</p>}
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