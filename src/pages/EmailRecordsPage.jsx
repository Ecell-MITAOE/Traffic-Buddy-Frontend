import { useState, useEffect } from "react";
import CustomDropdown from "../components/common/CustomDropdown";
import {
  AlertTriangle,
  Check,
  Clock,
  FileSearch,
  Mail,
  MapPin,
  Search,
  Calendar,
  Download,
  Mic,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

import Header from "../components/common/Header";

const backendUrl = import.meta.env.VITE_Backend_URL || "http://localhost:3000";

const EmailRecordsPage = () => {
  const [departmentEmail, setDepartmentEmail] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [emailRecords, setEmailRecords] = useState([]);

  // Original query stats (all data)
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDetailsId, setViewDetailsId] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Resolve modal states
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedQueryForResolve, setSelectedQueryForResolve] = useState(null);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // For voice recognition

  useEffect(() => {
    fetchEmailRecords();
    fetchDepartments();
  }, [currentPage]);

  const fetchEmailRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/queries/email-records`,
        {
          params: {
            page: currentPage,
            limit: 10,
          },
        }
      );
      if (response.data.success) {
        setEmailRecords(response.data.data);
        setTotalPages(response.data.totalPages);
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

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/departments`);
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchQueryDetails = async (id) => {
    try {
      const response = await axios.get(`${backendUrl}/api/queries/${id}`);
      if (response.data.success) {
        setDetailsData(response.data.data);
        setViewDetailsId(id);
        setDetailsSelectedStatus(response.data.data.status); // Initialize with current status
      }
    } catch (error) {
      console.error("Error fetching query details:", error);
    }
  };

  const openInGoogleMaps = (latitude, longitude) => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDepartmentChange = (e) => {
    const selectedOption = e.target.value;
    const selectedDepartment = departments.find(
      (dept) => dept.name === selectedOption
    );
    if (selectedDepartment) {
      setDepartmentEmail(selectedDepartment.emails);
      setDepartmentName(selectedDepartment.name);
    } else {
      setDepartmentEmail("");
      setDepartmentName("");
    }
    setSelectedDepartment(selectedOption);
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-700 text-yellow-100";
      case "In Progress":
        return "bg-blue-700 text-blue-100";
      case "Resolved":
        return "bg-green-700 text-green-100";
      case "Rejected":
        return "bg-red-700 text-red-100";
      default:
        return "bg-bgSecondary text-tBase";
    }
  };

  const closeDetails = () => {
    setViewDetailsId(null);
    setDetailsData(null);
    setDetailsSelectedStatus(""); // Reset details popup status
    setSelectedAction(""); // Reset selected action when closing
  };

  // New Functions for Resolve Modal
  const openResolveModal = (query) => {
    setSelectedQueryForResolve(query);
    setResolveModalOpen(true);
    setMessage("");
    setImage(null);
    setError("");
    setSuccess("");
    setIsListening(false); // Reset listening state
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Email Records" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary mb-8 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-tBase mb-4">Emails</h2>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Department Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Division
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {emailRecords.map((record) => (
                    <motion.tr
                      key={record._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="text-sm text-gray-300 max-w-xs truncate">
                          {record.departmentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                          {record.emails}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs truncate">
                          {record.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                          {record.division}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
