import { useState, useEffect } from "react";
import {
  Mail, MapPin, Search, Calendar, Download, Users, X, // Added Users, X
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import fileDownload from 'js-file-download'; 

import Header from "../components/common/Header";

const backendUrl = import.meta.env.VITE_Backend_URL || "http://localhost:3000";

const EmailRecordsPage = () => {
  // State for grouped email records
  const [emailRecords, setEmailRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGroupedRecords, setTotalGroupedRecords] = useState(0);

  // State for viewing details
  const [viewDetailsId, setViewDetailsId] = useState(null); // Stores { queryId, departmentName }
  const [detailsData, setDetailsData] = useState(null); // Stores fetched query details
  const [groupedEmails, setGroupedEmails] = useState([]); // Stores the list of emails for the detail view

  // State for export functionality
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(''); // Format: YYYY-MM
  const [exportError, setExportError] = useState('');

  // Fetch grouped records when page changes
  useEffect(() => {
    fetchEmailRecords(currentPage);
  }, [currentPage]);

  // Set default month for export to the current month on initial load
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // JS months are 0-indexed
    setSelectedMonth(`${year}-${month}`);
  }, []);

  // Fetches grouped email records from the backend
  const fetchEmailRecords = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/queries/email-records`,
        {
          params: { page: page, limit: 10 }, // Use consistent limit
          withCredentials: true, // Send cookies if needed for auth
        }
      );
      if (response.data.success) {
        setEmailRecords(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalGroupedRecords(response.data.total); // Store total grouped records count
        setCurrentPage(response.data.currentPage);
      } else {
        console.error("Error fetching email records:", response.data.message);
        setEmailRecords([]); // Clear data on error
        setTotalPages(1);
        setTotalGroupedRecords(0);
      }
    } catch (error) {
      console.error("Error fetching email records:", error.response?.data?.message || error.message);
      setEmailRecords([]);
      setTotalPages(1);
      setTotalGroupedRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetches the details of the original query when a row's 'Details' button is clicked
  const handleViewDetails = async (queryId, departmentName, emailsList) => {
    setViewDetailsId({ queryId, departmentName }); // Identify the group being viewed
    setGroupedEmails(emailsList); // Store the emails for this specific group
    setDetailsData(null); // Clear previous details while loading
    try {
      const response = await axios.get(`${backendUrl}/api/queries/${queryId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setDetailsData(response.data.data); // Set the fetched query details
      } else {
         console.error("Error fetching query details:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching query details:", error.response?.data?.message || error.message);
    }
  };

  // Opens Google Maps for the given coordinates
  const openInGoogleMaps = (latitude, longitude) => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  // Formats date string or returns 'N/A'
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        // Check if date is valid before formatting
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
    } catch (e) {
        return "Invalid Date";
    }
  };

  // Returns badge color based on email status (using the first status in the group)
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "bg-green-700 text-green-100";
      case "failed":
        return "bg-red-700 text-red-100";
      default:
        return "bg-gray-600 text-gray-100"; // For unknown or other statuses
    }
  };

  // Closes the details modal
  const closeDetails = () => {
    setViewDetailsId(null);
    setDetailsData(null);
    setGroupedEmails([]);
  };

  // Handles the download request
  const handleDownload = async () => {
      if (!selectedMonth) {
          setExportError("Please select a month to download.");
          return;
      }
      setExportLoading(true);
      setExportError(''); // Clear previous errors

      const [year, month] = selectedMonth.split('-');

      try {
          const response = await axios.get(`${backendUrl}/api/queries/email-records/export`, {
              params: { year, month },
              responseType: 'blob', // Crucial for handling file data
              withCredentials: true,
          });

          // Use js-file-download to trigger the browser download
          fileDownload(response.data, `email_records_${year}_${month}.xlsx`);

      } catch (err) {
          console.error("Error downloading file:", err);
          // Try to get error message from blob response if possible, otherwise use generic message
          let errorMsg = "Failed to download records. Server error or no records found.";
          if (err.response && err.response.data instanceof Blob && err.response.data.type === "text/plain") {
              // If the server sent back plain text error in the blob
              try {
                  errorMsg = await err.response.data.text();
              } catch (readError) {
                  console.error("Could not read error blob:", readError);
              }
          } else if (err.response?.data?.message) {
              errorMsg = err.response.data.message;
          }
          setExportError(errorMsg);
      } finally {
          setExportLoading(false);
      }
  };

  // Calculate starting Sr. No. for the current page
  const startSrNo = (currentPage - 1) * 10; // Assuming limit is 10

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Email Records" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Download Section */}
        <motion.div
          className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-4 border border-borderPrimary mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-tBase mb-3">Download Monthly Records</h3>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow w-full sm:w-auto">
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-300 mb-1">
                Select Month
              </label>
              <input
                type="month"
                id="month-select"
                value={selectedMonth}
                onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setExportError(''); // Clear error when month changes
                }}
                className="w-full px-3 py-2 bg-bgPrimary border border-borderPrimary rounded-md text-tBase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleDownload}
              disabled={exportLoading || !selectedMonth}
              className={`px-4 py-2 rounded-md flex items-center justify-center text-sm ${
                exportLoading || !selectedMonth
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              } transition duration-150 ease-in-out`}
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <Download size={18} className="mr-2" />
              )}
              {exportLoading ? "Generating..." : "Download Excel"}
            </button>
          </div>
           {exportError && <p className="text-red-500 text-sm mt-2">{exportError}</p>}
        </motion.div>

        {/* Email Records Table */}
        <motion.div
          className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary mb-8 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-tBase mb-4">Sent Email Log (Grouped by Query & Department)</h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : emailRecords.length === 0 ? (
             <p className="text-center text-gray-400 py-10">No email records found.</p>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Department Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Emails Sent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Query Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      First Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {emailRecords.map((record, index) => (
                    <motion.tr
                      // Use a combination of queryId and departmentName for a unique key
                      key={`${record.queryId}-${record.departmentName}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-800 transition-colors duration-150"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {startSrNo + index + 1} {/* Calculate Sr. No. */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">
                        {record.departmentName}
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         {/* Show count of emails sent in this group */}
                        <span className={`px-2.5 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                          <Users size={14} className="mr-1.5" /> {record.emails?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs truncate" title={record.subject}>
                          {record.subject}
                        </div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {record.queryType || 'N/A'} {/* Display query type from populated data */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(record.sentAt)} {/* Show timestamp of the first email sent */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         {/* Show status of the first email sent */}
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                          {record.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          onClick={() => handleViewDetails(record.queryId, record.departmentName, record.emails)}
                          aria-label={`View details for query sent to ${record.departmentName}`}
                        >
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400 mb-2 sm:mb-0">
                  Showing {startSrNo + 1} - {Math.min(startSrNo + 10, totalGroupedRecords)} of {totalGroupedRecords} Records
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className={`px-4 py-1.5 rounded-md text-sm ${
                      currentPage === 1 || loading
                        ? "bg-bgSecondary text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition duration-150`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400 px-2 py-1.5">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((c) => (c < totalPages ? c + 1 : c))
                    }
                    disabled={currentPage === totalPages || loading}
                    className={`px-4 py-1.5 rounded-md text-sm ${
                      currentPage === totalPages || loading
                        ? "bg-bgSecondary text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition duration-150`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Details Modal */}
        {viewDetailsId && ( // Render modal shell even while detailsData is loading
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <motion.div
              className="bg-bgSecondary rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-borderPrimary shadow-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-tBase">
                  Query Details {detailsData ? `- ${detailsData.query_type} Report` : ''}
                </h2>
                <button
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                  onClick={closeDetails}
                  aria-label="Close details"
                >
                  <X size={22} />
                </button>
              </div>

              {!detailsData ? (
                 <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Left Column: Query Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Department Notified:
                      </h3>
                      <p className="text-gray-100 font-medium">{viewDetailsId.departmentName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Emails Sent To ({groupedEmails.length}):
                      </h3>
                      <div className="max-h-32 overflow-y-auto bg-bgPrimary p-2 rounded border border-gray-700">
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {groupedEmails.map((email, index) => (
                            <li key={index}>{email}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Description:
                      </h3>
                      <p className="text-gray-200 bg-bgPrimary p-2 rounded text-sm border border-gray-700">
                        {detailsData.description || "No description provided."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Reported By:
                      </h3>
                      <p className="text-gray-200">{detailsData.user_name || "Anonymous"}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Reporter Contact:
                      </h3>
                      <p className="text-gray-200">
                        {detailsData.user_id?.replace("whatsapp:", "") || "N/A"}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Reported On:
                      </h3>
                      <p className="text-gray-200">
                        {formatDate(detailsData.timestamp)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">
                        Location Address:
                      </h3>
                      <p className="text-gray-200">
                        {detailsData.location?.address || "Not specified"}
                      </p>
                      {detailsData.location?.latitude && detailsData.location?.longitude && (
                        <button
                          className="mt-2 flex items-center text-blue-400 hover:text-blue-300 text-sm"
                          onClick={() =>
                            openInGoogleMaps(
                              detailsData.location.latitude,
                              detailsData.location.longitude
                            )
                          }
                        >
                          <MapPin size={14} className="mr-1" /> View on Google Maps
                        </button>
                      )}
                    </div>

                    {detailsData.resolution_note && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-1">
                          Resolution Notes:
                        </h3>
                        <p className="text-gray-200 bg-bgPrimary p-2 rounded text-sm border border-gray-700">
                          {detailsData.resolution_note}
                        </p>
                        {detailsData.resolved_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            Resolved on: {formatDate(detailsData.resolved_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Photo */}
                  <div className="space-y-4">
                    {detailsData.photo_url ? (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                          Photo Evidence:
                        </h3>
                        <a href={detailsData.photo_url} target="_blank" rel="noopener noreferrer" className="block">
                          <img
                            src={detailsData.photo_url}
                            alt="Report evidence"
                            className="rounded-lg object-contain max-w-full max-h-[50vh] border border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </a>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                          Photo Evidence:
                        </h3>
                        <div className="text-gray-400 text-center py-16 bg-bgPrimary rounded border border-dashed border-gray-600">
                          No photo provided.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                <button
                  className="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm transition-colors"
                  onClick={closeDetails}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmailRecordsPage;