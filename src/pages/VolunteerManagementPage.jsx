import { useState, useEffect } from "react";
import { Search, Send, Users, MapPin, Mail, Check, X } from "lucide-react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { motion } from "framer-motion";
import axios, { all } from "axios";
import toast from "react-hot-toast";
import Select from "react-select";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";


  // Reason I hate multi dropdowns
  // TODO: Add themes support
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#1e1e1e",
      borderColor: "#3c3c3c",
      color: "#d4d4d4",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#5a5a5a",
      },
      zIndex: 9999,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#333333" : "#1e1e1e",
      color: state.isSelected ? "#ffffff" : "#d4d4d4",
      "&:hover": {
        backgroundColor: "#333333",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#333333",
      color: "#d4d4d4",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#d4d4d4",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#d4d4d4",
      "&:hover": {
        backgroundColor: "#444444",
        color: "#ffffff",
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#a1a1a1",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#d4d4d4",
    }),
  };


const VolunteerManagementPage = () => {
    const [joinRequests, setJoinRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [broadcastArea, setBroadcastArea] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [stats, setStats] = useState({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0
    });
    
    const [viewDetailsId, setViewDetailsId] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [detailsSelectedStatus, setDetailsSelectedStatus] = useState(""); // For details popup
    
    const [approverName, setApproverName] = useState("");
    const [showApproverInput, setShowApproverInput] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);
    
    const [selectedOptions, setSelectedOptions] = useState([]);
    const divisionOptions = [
        { value: "MAHALUNGE", label: "Mahalunge" },
        { value: "CHAKAN", label: "Chakan" },
        { value: "DIGHI ALANDI", label: "Dighi-Alandi" },
        { value: "BHOSARI", label: "Bhosari" },
        { value: "TALWADE", label: "Talwade" },
        { value: "PIMPRI", label: "Pimpri" },
        { value: "CHINCHWAD", label: "Chinchwad" },
        { value: "NIGDI", label: "Nigdi" },
        { value: "SANGAVI", label: "Sangavi" },
        { value: "HINJEWADI", label: "Hinjewadi" },
        { value: "WAKAD", label: "Wakad" },
        { value: "BAVDHAN", label: "Bavdhan" },
        { value: "DEHUROAD", label: "Dehuroad" },
        { value: "TALEGAON", label: "Talegaon" }
    ];
    const [allUsers, setAllUsers] = useState(true);
    const [volunteerUsers, setVolunteerUsers] = useState(false);

    
    const handleSelectAll = () => {
        setSelectedOptions(divisionOptions);
    };

    const handleDeselectAll = () => {
        setSelectedOptions([]);
    };

    // API base URL - can be moved to environment variable
    const API_BASE_URL = `${backendUrl}/api`;

    useEffect(() => {
        fetchJoinRequests();
        fetchRequestStats();
    }, []);

    const fetchQueryDetails = async (id) => {
        try {
            const response = await axios.get(`${backendUrl}/api/applications/${id}`);
            if (response.data.success) {
                setDetailsData(response.data.data);
                setViewDetailsId(response.data.data._id);
                setDetailsSelectedStatus(response.data.data.status); // Set initial status for details popup
            }
        } catch (error) {
            console.error("Error fetching query details:", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const closeDetails = () => {
        setViewDetailsId(null);
        setDetailsData(null);
        setDetailsSelectedStatus(""); // Reset details popup status when closing
    };

    const fetchJoinRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/applications`);
            setJoinRequests(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching join requests:", error);
            toast.error("Failed to load join requests");
            setLoading(false);
        }
    };

    const fetchRequestStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/applications/statistics`);
            if (response.data.success) {
                setStats({
                    totalRequests: response.data.total || 0,
                    pendingRequests: response.data.pending || 0,
                    approvedRequests: response.data.approved || 0,
                    rejectedRequests: response.data.rejected || 0
                });
            } else {
                toast.error("Failed to load statistics");
            }
        } catch (error) {
            console.error("Error fetching statistics:", error);
            setStats({
                totalRequests: 0,
                pendingRequests: 0,
                approvedRequests: 0,
                rejectedRequests: 0
            });
            toast.error("Failed to load statistics");
        }
    };

    const updateRequestStatus = async (id, status, approverName, note) => {
        try {
            await axios.put(`${API_BASE_URL}/applications/${id}/status`, {
                status,
                verification_notes: note,
                verified_by: approverName
            });

            toast.success(`Request ${status.toLowerCase()} successfully`);
            fetchJoinRequests();
            fetchRequestStats();
            closeDetails();
        } catch (error) {
            console.error(`Error updating request status:`, error);
            toast.error("Failed to update request status");
        }
    };

    const handleApprove = (id) => {
        setCurrentRequestId(id);
        setShowApproverInput(true);
    };

    const confirmApprove = () => {
        if (!approverName.trim()) {
            toast.error("Please enter your name to approve the request");
            return;
        }
        updateRequestStatus(currentRequestId, "Approved", approverName, `Join request approved by ${approverName}. Welcome to Traffic Buddy team!`);
        setShowApproverInput(false);
        setApproverName("");
        setCurrentRequestId(null);
    };

    const handleReject = (id) => {
        updateRequestStatus(id, "Rejected", "Thank you for your interest. Unfortunately, we cannot accept your request at this time.");
    };

    const handleBroadcastToAll = async () => {
        console.log("Broadcasting message to all users:", broadcastMessage);
        console.log(allUsers, volunteerUsers, selectedOptions);
        if (!broadcastMessage.trim()) {
            toast.error("Please enter a message to broadcast");
            return;
        }

        try {
            setIsBroadcasting(true);
            await axios.post(`${API_BASE_URL}/queries/broadcastMessageByOptions`, {
                message: broadcastMessage,
                users: allUsers,
                volunteers: volunteerUsers,
                divisions: selectedOptions.map(option => option.value)
            });

            toast.success("Message broadcast successfully to all users");
            setBroadcastMessage("");
        } catch (error) {
            console.error("Error broadcasting message:", error);
            toast.error("Failed to broadcast message");
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleBroadcastToArea = async () => {
        if (!broadcastMessage.trim() || !broadcastArea.trim()) {
            toast.error("Please enter both a message and an area");
            return;
        }

        try {
            setIsBroadcasting(true);
            await axios.post(`${API_BASE_URL}/queries/broadcasttoVolunteers`, {
                message: broadcastMessage,
                area: broadcastArea
            });

            toast.success(`Message broadcast successfully to volunteers in ${broadcastArea}`);
            setBroadcastMessage("");
            setBroadcastArea("");
        } catch (error) {
            console.error("Error broadcasting message to area:", error);
            toast.error("Failed to broadcast message to volunteers");
        } finally {
            setIsBroadcasting(false);
        }
    };

    const filteredRequests = joinRequests.filter(request => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (request.user_name && request.user_name.toLowerCase().includes(searchLower)) ||
            (request.description && request.description.toLowerCase().includes(searchLower)) ||
            (request.email && request.email?.toLowerCase().includes(searchLower)) ||
            (request.phone && request.phone?.includes(searchTerm));

        if (activeTab === "pending") return matchesSearch && request.status === "Pending";
        if (activeTab === "approved") return matchesSearch && request.status === "Approved";
        if (activeTab === "rejected") return matchesSearch && request.status === "Rejected";
        return matchesSearch;
    });

    return (
      <div className="flex-1 overflow-auto relative z-10">
        <Header title="Volunteer Management" />

        <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StatCard
              name="Total Join Requests"
              icon={Users}
              value={stats.totalRequests.toString()}
              color="#6366F1"
            />
            <StatCard
              name="Pending Approval"
              icon={Mail}
              value={stats.pendingRequests.toString()}
              color="#F59E0B"
            />
            <StatCard
              name="Approved Volunteers"
              icon={Check}
              value={stats.approvedRequests.toString()}
              color="#10B981"
            />
            <StatCard
              name="Rejected Requests"
              icon={X}
              value={stats.rejectedRequests.toString()}
              color="#EF4444"
            />
          </motion.div>

          {/* Broadcast Message Section */}
          <motion.div
            className="mb-8 bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-tBase mb-4">
              Broadcast Messages
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Broadcast to all users */}
              <div className="space-y-3 flex flex-col">
                <h3 className="text-lg text-tBase">Broadcast to All Users</h3>
                <textarea
                  className="w-full h-full bg-primary text-tBase rounded-md p-3 h-[156px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Enter message to broadcast..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                ></textarea>
                <button
                  className="flex items-center justify-center w-full bg-secondary hover:bg-hovSecondary text-tBase py-2 px-4 rounded-md transition duration-200"
                  onClick={handleBroadcastToAll}
                  disabled={isBroadcasting || !broadcastMessage.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isBroadcasting ? "Sending..." : "Send to All Users"}
                </button>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg text-tBase">Broadcast Options</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="bg-primary scale-[1.6] text-tBase rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary"
                    checked={allUsers}
                    onChange={(e) => setAllUsers(e.target.checked)}
                  />
                  <span className="text-tBase ml-2">Users</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="bg-primary scale-[1.6] text-tBase rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-secondary"
                    checked={volunteerUsers}
                    onChange={(e) => setVolunteerUsers(e.target.checked)}
                  />
                  <span className="text-tBase ml-2">Volunteers</span>
                </div>
                <div className="space-y-4">
                  <Select
                    isMulti
                    options={divisionOptions}
                    value={selectedOptions}
                    onChange={setSelectedOptions}
                    styles={customStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select Divisions..."
                  />
                  <div className="flex space-x-4">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
                      onClick={handleDeselectAll}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Join Requests Management */}
          <motion.div
            className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ zIndex: 1 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-tBase mb-4 md:mb-0">
                Join Requests
              </h2>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2 bg-primary rounded-md border border-borderPrimary text-tBase focus:outline-none focus:ring-2 focus:ring-secondary w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3 text-tSecondary" />
                </div>

                <div className="inline-flex rounded-md shadow-sm" role="group">
                  {["all", "pending", "approved", "rejected"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium ${
                        activeTab === tab
                          ? "bg-secondary text-tBase"
                          : "bg-primary text-tBase hover:bg-hovPrimary"
                      } ${tab === "all" ? "rounded-l-lg" : ""} ${
                        tab === "rejected" ? "rounded-r-lg" : ""
                      } focus:z-10 focus:ring-2 focus:outline-none`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-borderSecondary"></div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-bgSecondary bg-opacity-50 rounded-lg p-8 text-center">
                <p className="text-tBase">No join requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-seperationPrimary">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-primary text-left text-xs font-medium text-tBase uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 bg-primary text-left text-xs font-medium text-tBase uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 bg-primary text-left text-xs font-medium text-tBase uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-primary text-left text-xs font-medium text-tBase uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-3 bg-primary text-left text-xs font-medium text-tBase uppercase tracking-wider">
                        Division
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-bgSecondary bg-opacity-50 divide-y divide-seperationSecondary">
                    {filteredRequests.map((request) => {
                      const descLines = request.description
                        ? request.description.split("\n")
                        : [];
                      const extractInfo = (prefix) => {
                        const line = descLines.find((l) =>
                          l.toLowerCase().includes(prefix.toLowerCase())
                        );
                        return line ? line.split(":")[1]?.trim() : "";
                      };

                      const name =
                        request.name ||
                        extractInfo("name") ||
                        request.user_name ||
                        "Unknown";
                      const email =
                        request.email || extractInfo("email") || "N/A";
                      const phone =
                        request.phone ||
                        extractInfo("phone") ||
                        (request.user_id
                          ? request.user_id.replace("whatsapp:", "")
                          : "N/A");

                      return (
                        <tr key={request._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-tBase font-medium">
                                  {name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-tBase">
                                  {name}
                                </div>
                                <div className="text-sm text-tSecondary">
                                  {phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-tBase">{email}</div>
                            <div className="text-sm text-tSecondary max-w-xs truncate">
                              {request.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${
                                                          request.status ===
                                                          "Pending"
                                                            ? "bg-yellow-800 text-yellow-100"
                                                            : request.status ===
                                                              "Approved"
                                                            ? "bg-green-800 text-green-100"
                                                            : "bg-red-800 text-red-100"
                                                        }`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-400 hover:text-blue-300"
                                onClick={() => fetchQueryDetails(request._id)}
                              >
                                Details
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100 capitalize ">
                              {request.division}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {viewDetailsId && detailsData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                className="bg-bgSecondary rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-tBase">
                    Volunteer Joining Request
                  </h2>
                  <button
                    className="text-gray-400 hover:text-tBase"
                    onClick={closeDetails}
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 flex">
                  {detailsData.aadhar_document_url && (
                    <div className="flex-shrink-0 mr-6">
                      <h3 className="text-sm font-medium text-gray-400 mb-2">
                        Aadhar Card:
                      </h3>
                      <img
                        src={detailsData.aadhar_document_url}
                        alt="Aadhar Card"
                        className="rounded-lg object-contain max-w-full"
                        style={{ maxHeight: "400px" }}
                      />
                    </div>
                  )}

                  <div className="flex-grow space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-400">
                          Name:
                        </h3>
                        <p className="text-gray-200">{detailsData.full_name}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-400">
                          Division:
                        </h3>
                        <p className="text-gray-200">{detailsData.division}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-400">
                          Aadhar Number:
                        </h3>
                        <p className="text-gray-200">
                          {detailsData.aadhar_number}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-400">
                          Phone Number:
                        </h3>
                        <p className="text-gray-200">{detailsData.phone}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-400">
                          Email:
                        </h3>
                        <p className="text-gray-200">{detailsData.email}</p>
                      </div>

                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-400">
                          Address:
                        </h3>
                        <p className="text-gray-200">{detailsData.address}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Applied At:
                      </h3>
                      <p className="text-gray-200">
                        {formatDate(detailsData.applied_at)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400">
                        Motivation:
                      </h3>
                      <p className="text-gray-200">{detailsData.motivation}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  {detailsData.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => handleApprove(detailsData._id)}
                        className="text-green-500 hover:text-green-400 bg-primary rounded-md p-4 transition text-lg"
                        title="Approve"
                      >
                        <Check className="w-6 h-6" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(detailsData._id)}
                        className="text-red-500 hover:text-red-400 bg-primary rounded-md p-4 transition text-lg"
                        title="Reject"
                      >
                        <X className="w-6 h-6" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-500 italic">
                      {detailsData.status === "Approved"
                        ? "Approved"
                        : "Rejected"}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {showApproverInput && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-bgSecondary rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-tBase mb-4">
                  Approve Request
                </h3>
                <input
                  type="text"
                  className="w-full bg-primary text-tBase rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-secondary"
                  placeholder="Enter your name"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-tBase py-2 px-4 rounded-md transition"
                    onClick={() => setShowApproverInput(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-tBase py-2 px-4 rounded-md transition"
                    onClick={confirmApprove}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
};

export default VolunteerManagementPage;