import { useState, useEffect } from "react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { motion } from "framer-motion";
import axios from "axios";
import { Search, Send, Users, MapPin, Mail, Check, X, Download, ChevronLeft, ChevronRight, RotateCw, ChevronDown, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Select from "react-select";
import * as XLSX from 'xlsx'; // Import xlsx library

const divisions = [
    { value: "", label: "All Divisions" },
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
    { value: "TALEGAON", label: "Talegaon" },
    { value: "UNKNOWN", label: "Unknown" },
];
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
        // zIndex is usually not needed on control, but keep if intended
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        zIndex: 9999 // Ensure the menu appears above other elements
    }),
    menuPortal: base => ({ ...base, zIndex: 9999 }), // Ensure the portal itself has high z-index
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
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    useEffect(() => {
        const delay = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // const [broadcastArea, setBroadcastArea] = useState(""); // Removed as it wasn't used in the broadcast function shown
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [activeTab, setActiveTab] = useState("pending"); // Default to pending
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

    // New states for rejection note modal
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectNote, setRejectNote] = useState("");
    const [rejectorName, setRejectorName] = useState("");

    // Image rotation state
    const [imageRotation, setImageRotation] = useState(0);

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
        { value: "SANGAVI", label: "Sangavi" }, // Corrected value
        { value: "HINJEWADI", label: "Hinjewadi" },
        { value: "WAKAD", label: "Wakad" },
        { value: "BAVDHAN", label: "Bavdhan" },
        { value: "DEHUROAD", label: "Dehuroad" },
        { value: "TALEGAON", label: "Talegaon" }
    ];
    const [allUsers, setAllUsers] = useState(true);
    const [volunteerUsers, setVolunteerUsers] = useState(false);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 15;

    // --- Excel Download State ---
    const [selectedMonth, setSelectedMonth] = useState(""); // Format YYYY-MM
    const [isDownloading, setIsDownloading] = useState(false);
    
    // --- Month Filter State ---
    const [filterMonth, setFilterMonth] = useState("");

    // --- Division Filter State ---
    const [selectedDivisionFilter, setSelectedDivisionFilter] = useState("");

    const handleDivisionFilterChange = (e) => {
        setSelectedDivisionFilter(e.target.value);
    };

    const handleSelectAll = () => {
        setSelectedOptions(divisionOptions);
    };

    const handleDeselectAll = () => {
        setSelectedOptions([]);
    };

    // API base URL - can be moved to environment variable
    const API_BASE_URL = `${backendUrl}/api`;

    // In useEffect, only fetch on relevant changes
    useEffect(() => {
        fetchJoinRequests(currentPage, activeTab === 'all' ? '' : activeTab, filterMonth, debouncedSearch);
        fetchRequestStats();
        // eslint-disable-next-line
    }, [currentPage, activeTab, filterMonth, selectedDivisionFilter, searchTerm]);

    const fetchQueryDetails = async (id) => {
        try {
            const response = await axios.get(`${backendUrl}/api/applications/${id}`);
            if (response.data.success) {
                setDetailsData(response.data.data);
                setViewDetailsId(response.data.data._id);
                setDetailsSelectedStatus(response.data.data.status); // Set initial status for details popup
                setImageRotation(0); // Reset image rotation
            }
        } catch (error) {
            console.error("Error fetching query details:", error);
            toast.error("Failed to load request details");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (e) {
            return "Invalid Date";
        }
    };

    const closeDetails = () => {
        setViewDetailsId(null);
        setDetailsData(null);
        setDetailsSelectedStatus(""); // Reset details popup status when closing
        setImageRotation(0); // Reset image rotation
    };

    const fetchJoinRequests = async (page = 1, status = '', month = '', search = '') => {
        try {
            setLoading(true);
            const params = {
                page: page,
                limit: itemsPerPage,
                status: status === 'all' ? '' : status
            };
            if (month) {
                const [year, monthNum] = month.split('-');
                params.month = parseInt(monthNum);
                params.year = parseInt(year);
            }
            if (selectedDivisionFilter) {
                params.division = selectedDivisionFilter;
            }
            if (searchTerm && searchTerm.trim() !== '') {
                params.search = searchTerm.trim();
            }
            const response = await axios.get(`${API_BASE_URL}/applications`, { params });
            setJoinRequests(response.data.data || []);
            setTotalPages(response.data.totalPages || 1);
            // Do NOT setCurrentPage from backend response here; rely on state only
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

    const updateRequestStatus = async (id, status, verifierName, note) => {
        try {
            await axios.put(`${API_BASE_URL}/applications/${id}/status`, {
                status,
                verification_notes: note,
                verified_by: verifierName
            });

            toast.success(`Request ${status.toLowerCase()} successfully`);
            fetchJoinRequests(currentPage, activeTab, filterMonth); // Keep month filter
            fetchRequestStats(); // Update stats
            closeDetails(); // Close modal if open
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
        setCurrentRequestId(id);
        setShowRejectModal(true);
    };

    const confirmReject = () => {
        if (!rejectorName.trim()) {
            toast.error("Please enter your name");
            return;
        }
        
        if (!rejectNote.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        
        const note = `${rejectNote}`;
        updateRequestStatus(currentRequestId, "Rejected", rejectorName, note);
        
        // Reset state
        setShowRejectModal(false);
        setRejectNote("");
        setRejectorName("");
        setCurrentRequestId(null);
    };

    const handleBroadcastToAll = async () => {
        console.log("Broadcasting message:", broadcastMessage);
        console.log("Options:", { allUsers, volunteerUsers, divisions: selectedOptions.map(o => o.value) });
        if (!broadcastMessage.trim()) {
            toast.error("Please enter a message to broadcast");
            return;
        }
        if (!allUsers && !volunteerUsers && selectedOptions.length === 0) {
            toast.error("Please select at least one broadcast target (Users, Volunteers, or Divisions)");
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

            toast.success("Message broadcast successfully");
            setBroadcastMessage("");
            // Reset options if needed, or keep them for next broadcast
            // setSelectedOptions([]);
            // setAllUsers(true);
            // setVolunteerUsers(false);
        } catch (error) {
            console.error("Error broadcasting message:", error);
            toast.error(error.response?.data?.message || "Failed to broadcast message");
        } finally {
            setIsBroadcasting(false);
        }
    };

    // Rotate image function
    const rotateImage = () => {
        setImageRotation((prev) => (prev + 90) % 360);
    };

    // --- Excel Download Function ---
    const handleDownloadExcel = async () => {
        if (!selectedMonth) {
            toast.error("Please select a month to download data.");
            return;
        }
        setIsDownloading(true);
        try {
            const [year, month] = selectedMonth.split('-');
            // Fetch ALL applications for the selected month (limit=-1 or a very high number)
            const response = await axios.get(`${API_BASE_URL}/applications`, {
                params: {
                    limit: -1, // Indicate fetching all matching records
                    month: parseInt(month),
                    year: parseInt(year),
                    // Optionally add status filter if needed for download
                    // status: activeTab === 'all' ? '' : activeTab
                }
            });

            if (response.data.success && response.data.data.length > 0) {
                const dataToExport = response.data.data.map((req, index) => ({
                    "Sr.No.": index + 1,
                    "Applied At": formatDate(req.applied_at),
                    "Full Name": req.full_name,
                    "WhatsApp Name": req.user_name,
                    "WhatsApp ID": req.user_id,
                    "Division": req.division,
                    "Motivation": req.motivation,
                    "Address": req.address,
                    "Phone": req.phone,
                    "Email": req.email,
                    "Aadhar Number": req.aadhar_number,
                    "Status": req.status,
                    "Processed At": formatDate(req.processed_at),
                    "Verified By": req.verified_by,
                    "Verification Notes": req.verification_notes,
                    // Exclude aadhar_document_url
                }));

                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, `Applications_${selectedMonth}`);

                // Generate filename
                const fileName = `TrafficBuddy_VolunteerApplications_${selectedMonth}.xlsx`;
                XLSX.writeFile(workbook, fileName);
                toast.success(`Downloaded applications for ${selectedMonth}`);

            } else if (response.data.data.length === 0) {
                toast.error(`No applications found for ${selectedMonth}`);
            } else {
                toast.error("Failed to fetch data for download.");
            }

        } catch (error) {
            console.error("Error downloading Excel:", error);
            toast.error("Failed to download Excel file.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Generate month options for the last 12 months
    const getMonthOptions = () => {
        const options = [];
        const date = new Date();
        for (let i = 0; i < 12; i++) {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const value = `${year}-${month}`;
            const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            options.push({ value, label });
            date.setMonth(date.getMonth() - 1);
        }
        return options;
    };
    const monthOptions = getMonthOptions();

    // --- Pagination Controls ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

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
                        {/* Broadcast Message Input */}
                        <div className="space-y-3 flex flex-col">
                            <h3 className="text-lg text-tBase">Broadcast Message</h3>
                            <textarea
                                className="w-full h-full bg-primary text-tBase rounded-md p-3 h-[156px] focus:outline-none focus:ring-2 focus:ring-secondary border border-borderPrimary"
                                placeholder="Enter message to broadcast..."
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                            ></textarea>
                            <button
                                className="flex items-center justify-center w-full bg-secondary hover:bg-hovSecondary text-tBase py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleBroadcastToAll}
                                disabled={isBroadcasting || !broadcastMessage.trim()}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                {isBroadcasting ? "Sending..." : "Send Broadcast"}
                            </button>
                        </div>
                        {/* Broadcast Options */}
                        <div className="space-y-3">
                            <h3 className="text-lg text-tBase">Broadcast Options</h3>
                            <div className="flex items-center">
                                <input
                                    id="allUsersCheckbox"
                                    type="checkbox"
                                    className="bg-primary scale-[1.6] text-secondary rounded focus:ring-secondary border-borderPrimary"
                                    checked={allUsers}
                                    onChange={(e) => setAllUsers(e.target.checked)}
                                />
                                <label htmlFor="allUsersCheckbox" className="text-tBase ml-3 cursor-pointer">All Users</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    id="volunteerUsersCheckbox"
                                    type="checkbox"
                                    className="bg-primary scale-[1.6] text-secondary rounded focus:ring-secondary border-borderPrimary"
                                    checked={volunteerUsers}
                                    onChange={(e) => setVolunteerUsers(e.target.checked)}
                                />
                                <label htmlFor="volunteerUsersCheckbox" className="text-tBase ml-3 cursor-pointer">Approved Volunteers Only</label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-tBase block text-sm font-medium">Filter by Divisions (Optional):</label>
                                <Select
                                    isMulti
                                    options={divisionOptions}
                                    value={selectedOptions}
                                    onChange={setSelectedOptions}
                                    styles={customStyles}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Select Divisions..."
                                    menuPortalTarget={document.body} // Render menu in body to avoid z-index issues
                                    menuPosition={'fixed'} // Use fixed position for the menu portal
                                />
                                <div className="flex space-x-2 pt-1">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded-md"
                                        onClick={handleSelectAll}
                                    >
                                        Select All
                                    </button>
                                    <button
                                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs py-1 px-3 rounded-md"
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-semibold text-tBase mb-4 md:mb-0">
                            Join Requests
                        </h2>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-wrap">
                            {/* Search Input */}
                            <div className="relative flex-grow sm:flex-grow-0">
                                <input
                                    type="text"
                                    placeholder="Search this page..."
                                    className="pl-10 pr-4 py-2 bg-primary rounded-md border border-borderPrimary text-tBase focus:outline-none focus:ring-2 focus:ring-secondary w-full sm:w-56"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-tSecondary" />
                            </div>

                            {/* Month Filter */}
                            <div className="relative flex-grow sm:flex-grow-0">
                                <select
                                    value={filterMonth}
                                    onChange={(e) => {
                                        setFilterMonth(e.target.value);
                                        setCurrentPage(1); // Reset to page 1 when filter changes
                                    }}
                                    className="pl-4 pr-8 py-2 bg-primary rounded-md border border-borderPrimary text-tBase focus:outline-none focus:ring-2 focus:ring-secondary w-full sm:w-auto appearance-none"
                                >
                                    <option value="">All Months</option>
                                    {monthOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-tSecondary" />
                                </div>
                            </div>
                            
                            {/* Division Filter */}
                            <div className="relative flex-grow sm:flex-grow-0">
                                <select
                                    id="division-filter"
                                    value={selectedDivisionFilter}
                                    onChange={handleDivisionFilterChange}
                                    className="pl-4 pr-8 py-2 bg-primary rounded-md border border-borderPrimary text-tBase focus:outline-none focus:ring-2 focus:ring-secondary w-full sm:w-auto appearance-none"
                                >
                                    {divisions.map(div => (
                                        <option key={div.value} value={div.value} className="bg-primary hover:bg-hovPrimary">
                                            {div.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-tSecondary" />
                                </div>
                            </div>

                            {/* Status Tabs */}
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                {["all", "pending", "approved", "rejected"].map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => { setActiveTab(tab); setCurrentPage(1); }} // Reset to page 1 on tab change
                                        className={`px-3 py-2 text-sm font-medium transition-colors duration-150 ${activeTab === tab
                                                ? "bg-secondary text-white"
                                                : "bg-primary text-tBase hover:bg-hovPrimary"
                                            } ${tab === "all" ? "rounded-l-lg" : ""} ${tab === "rejected" ? "rounded-r-lg" : ""
                                            } border border-borderPrimary focus:z-10 focus:ring-2 focus:ring-secondary focus:outline-none`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Download Section */}
                    <div className="flex flex-col sm:flex-row items-center justify-end mb-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="monthSelect" className="text-tBase text-sm">Download Month:</label>
                            <select
                                id="monthSelect"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="bg-primary text-tBase rounded-md p-2 border border-borderPrimary focus:outline-none focus:ring-1 focus:ring-secondary"
                            >
                                <option value="">Select Month</option>
                                {monthOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleDownloadExcel}
                            disabled={isDownloading || !selectedMonth}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloading ? "Downloading..." : "Download Excel"}
                        </button>
                    </div>


                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-borderSecondary"></div>
                        </div>
                    ) : joinRequests.length === 0 ? (
                        <div className="bg-bgSecondary bg-opacity-50 rounded-lg p-8 text-center">
                            <p className="text-tBase">
                                {searchTerm ? "No requests match your search." : 
                                 filterMonth ? `No ${activeTab !== 'all' ? activeTab : ''} join requests found for ${filterMonth}.` :
                                 `No ${activeTab !== 'all' ? activeTab : ''} join requests found.`}
                            </p>
                        </div>
                    ) : (
                        <>
                            
                            {/* --- Top Pagination Controls --- */}
                            <div className="flex justify-between items-center mt-4 mb-2 px-4 py-3 border-t border-borderPrimary">
                                <span className="text-sm text-tSecondary">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm bg-primary hover:bg-hovPrimary text-tBase rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm bg-primary hover:bg-hovPrimary text-tBase rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-seperationPrimary">
                                    <thead className="bg-primary sticky top-0">
                                        <tr>
                                            <th className="px-2 py-3 text-left text-xs font-medium text-tBase uppercase tracking-wider w-12">
                                                Sr.
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-tBase uppercase tracking-wider">
                                                Applicant
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-tBase uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-tBase uppercase tracking-wider">
                                                Div
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-tBase uppercase tracking-wider">
                                                Applied
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-tBase uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-tBase uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-bgSecondary bg-opacity-50 divide-y divide-seperationSecondary">
                                        {joinRequests.map((request, index) => (
                                            <tr key={request._id} className="hover:bg-hovPrimary transition-colors duration-150">
                                                <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                                                            <span className="text-tBase font-medium text-xs">
                                                                {request.full_name?.charAt(0).toUpperCase() || request.user_name?.charAt(0).toUpperCase() || '?'}
                                                            </span>
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-tBase">
                                                                {request.full_name || request.user_name || "Unknown"}
                                                            </div>
                                                            <div className="text-xs text-tSecondary truncate max-w-[140px]">
                                                                {request.user_id?.replace("whatsapp:", "")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-tBase truncate max-w-[120px]">{request.email || "N/A"}</div>
                                                    <div className="text-sm text-tSecondary">{request.phone || "N/A"}</div>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100 capitalize ">
                                                        {request.division || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-tSecondary">
                                                    {new Date(request.applied_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${request.status === "Pending" ? "bg-red-500 text-white-100" // Changed Pending color
                                                                : request.status === "Approved" ? "bg-green-800 text-green-100"
                                                                    : "bg-purple-500 text-white-100" // Changed Rejected color
                                                            }`}
                                                    >
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        className="text-indigo-400 hover:text-indigo-300"
                                                        onClick={() => fetchQueryDetails(request._id)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* --- Pagination Controls --- */}
                            <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-borderPrimary">
                                <span className="text-sm text-tSecondary">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 text-sm bg-primary hover:bg-hovPrimary text-tBase rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm bg-primary hover:bg-hovPrimary text-tBase rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                    >
                                        Next <ChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Details Modal */}
                {viewDetailsId && detailsData && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <motion.div
                            className="bg-bgSecondary rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-borderPrimary shadow-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="flex justify-between items-start mb-4 pb-2 border-b border-borderPrimary">
                                <h2 className="text-xl font-semibold text-tBase">
                                    Volunteer Joining Request Details
                                </h2>
                                <button
                                    className="text-gray-400 hover:text-tBase"
                                    onClick={closeDetails}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Aadhar Image with Rotation Control */}
                                {detailsData.aadhar_document_url && (
                                    <div className="flex-shrink-0 md:w-1/3">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-sm font-medium text-gray-400">
                                                Aadhar Card:
                                            </h3>
                                            {detailsData.aadhar_document_url.toLowerCase().endsWith('.pdf') ? (
                                                <a 
                                                    href={detailsData.aadhar_document_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-sm bg-blue-700 hover:bg-blue-600 text-gray-200 px-2 py-1 rounded-md"
                                                >
                                                    <Download className="w-4 h-4 mr-1" /> Open PDF
                                                </a>
                                            ) : (
                                                <button 
                                                    onClick={rotateImage}
                                                    className="flex items-center text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded-md"
                                                    title="Rotate Image"
                                                >
                                                    <RotateCw className="w-4 h-4 mr-1" /> Rotate
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative">
                                            {detailsData.aadhar_document_url.toLowerCase().endsWith('.pdf') ? (
                                                <div className="border border-borderPrimary rounded-lg bg-primary p-2 flex flex-col items-center">
                                                    <iframe
                                                        src={`${detailsData.aadhar_document_url}#toolbar=0&navpanes=0`}
                                                        className="w-full rounded"
                                                        style={{ height: "350px" }}
                                                        title="Aadhar Document"
                                                    />
                                                    <a 
                                                        href={detailsData.aadhar_document_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                                                    >
                                                        View full PDF in new tab
                                                    </a>
                                                </div>
                                            ) : (
                                                <a href={detailsData.aadhar_document_url} target="_blank" rel="noopener noreferrer" title="Click to view full size">
                                                    <img
                                                        src={detailsData.aadhar_document_url}
                                                        alt="Aadhar Card"
                                                        className="rounded-lg object-contain w-full border border-borderPrimary cursor-pointer hover:opacity-90 transition-opacity"
                                                        style={{ 
                                                            maxHeight: "400px",
                                                            transform: `rotate(${imageRotation}deg)`,
                                                            transition: "transform 0.3s ease"
                                                        }}
                                                    />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Details Text */}
                                <div className="flex-grow space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name:</h3>
                                            <p className="text-gray-200">{detailsData.full_name}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Division:</h3>
                                            <p className="text-gray-200">{detailsData.division}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Aadhar Number:</h3>
                                            <p className="text-gray-200">{detailsData.aadhar_number}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number:</h3>
                                            <p className="text-gray-200">{detailsData.phone}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email:</h3>
                                            <p className="text-gray-200">{detailsData.email}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Applied At:</h3>
                                            <p className="text-gray-200">{formatDate(detailsData.applied_at)}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Address:</h3>
                                            <p className="text-gray-200 whitespace-pre-wrap">{detailsData.address}</p>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Motivation:</h3>
                                            <p className="text-gray-200 whitespace-pre-wrap">{detailsData.motivation}</p>
                                        </div>
                                        {detailsData.status !== 'Pending' && (
                                            <>
                                                <div>
                                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Processed At:</h3>
                                                    <p className="text-gray-200">{formatDate(detailsData.processed_at)}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Verified By:</h3>
                                                    <p className="text-gray-200">{detailsData.verified_by || 'N/A'}</p>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Verification Notes:</h3>
                                                    <p className="text-gray-200 whitespace-pre-wrap">{detailsData.verification_notes || 'N/A'}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 pt-4 border-t border-borderPrimary flex justify-end space-x-4">
                                {detailsData.status === "Pending" ? (
                                    <>
                                        <button
                                            onClick={() => handleApprove(detailsData._id)}
                                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition text-sm font-medium"
                                            title="Approve"
                                        >
                                            <Check className="w-5 h-5 mr-1" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(detailsData._id)}
                                            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition text-sm font-medium"
                                            title="Reject"
                                        >
                                            <X className="w-5 h-5 mr-1" />
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className={`px-3 py-1 rounded-md text-sm font-medium ${detailsData.status === "Approved" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"}`}>
                                            {detailsData.status}
                                        </span>
                                        {/* Allow reject action even if status is Approved */}
                                        {detailsData.status === "Approved" && (
                                            <button
                                                onClick={() => handleReject(detailsData._id)}
                                                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition text-sm font-medium"
                                                title="Reject"
                                            >
                                                <X className="w-5 h-5 mr-1" />
                                                Reject
                                            </button>
                                        )}
                                    </>
                                )}
                                <button
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition text-sm font-medium"
                                    onClick={closeDetails}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Approver Name Input Modal */}
                {showApproverInput && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                        <div className="bg-bgSecondary rounded-xl p-6 max-w-md w-full border border-borderPrimary shadow-xl">
                            <h3 className="text-xl font-semibold text-tBase mb-4">
                                Confirm Approval
                            </h3>
                            <input
                                type="text"
                                className="w-full bg-primary text-tBase rounded-md p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-secondary border border-borderPrimary"
                                placeholder="Enter your name (Approver)"
                                value={approverName}
                                onChange={(e) => setApproverName(e.target.value)}
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-gray-600 hover:bg-gray-700 text-tBase py-2 px-4 rounded-md transition"
                                    onClick={() => { setShowApproverInput(false); setApproverName(""); setCurrentRequestId(null); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-tBase py-2 px-4 rounded-md transition disabled:opacity-50"
                                    onClick={confirmApprove}
                                    disabled={!approverName.trim()}
                                >
                                    Confirm Approve
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rejection Note Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                        <div className="bg-bgSecondary rounded-xl p-6 max-w-md w-full border border-borderPrimary shadow-xl">
                            <h3 className="text-xl font-semibold text-tBase mb-4">
                                Confirm Rejection
                            </h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Your Name:</label>
                                <input
                                    type="text"
                                    className="w-full bg-primary text-tBase rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-secondary border border-borderPrimary"
                                    placeholder="Enter your name"
                                    value={rejectorName}
                                    onChange={(e) => setRejectorName(e.target.value)}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Reason for Rejection:</label>
                                <textarea
                                    className="w-full bg-primary text-tBase rounded-md p-3 h-24 focus:outline-none focus:ring-2 focus:ring-secondary border border-borderPrimary"
                                    placeholder="Please explain why this request is being rejected"
                                    value={rejectNote}
                                    onChange={(e) => setRejectNote(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-gray-600 hover:bg-gray-700 text-tBase py-2 px-4 rounded-md transition"
                                    onClick={() => { setShowRejectModal(false); setRejectNote(""); setRejectorName(""); setCurrentRequestId(null); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-tBase py-2 px-4 rounded-md transition disabled:opacity-50"
                                    onClick={confirmReject}
                                    disabled={!rejectNote.trim() || !rejectorName.trim()}
                                >
                                    Confirm Reject
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
