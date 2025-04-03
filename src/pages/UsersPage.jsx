import { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import * as XLSX from "xlsx";

import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import QueryStatusChart from "../components/queries/QueryStatusChart";
import QueryTypeDistribution from "../components/queries/QueryTypeDistribution";
import QueryTrends from "../components/queries/QueryTrends";
import { capitalize } from "@mui/material";

const backendUrl = import.meta.env.VITE_Backend_URL || "http://localhost:3000";

const divisions = [
  { value: "MAHALUNGE", label: "Mahalunge", id:"67dac1a2a771ed87f82890b2"},
  { value: "CHAKAN", label: "Chakan", id:"67dc019a6532e1c784d60840"},
  { value: "DIGHI ALANDI", label: "Dighi-Alandi", id:"67db077dfa28812fe4f9573f"},
  { value: "BHOSARI", label: "Bhosari", id:"67dc19f0a9ae16de2619b735"},
  { value: "TALWADE", label: "Talwade", id:"67dac59365aca82fe28bb003"},
  { value: "PIMPRI", label: "Pimpri", id:"67dc18f0a9ae16de2619b72c" },
  { value: "CHINCHWAD", label: "Chinchwad", id:"67dc1a41a9ae16de2619b739"},
  { value: "NIGDI", label: "Nigdi", id:"67dc184da9ae16de2619b728"},
  { value: "SANGAVI", label: "Sangavi", id:"67dc198ea9ae16de2619b731"},
  { value: "HINJEWADI", label: "Hinjewadi", id:"67dc19b7a9ae16de2619b733"},
  { value: "WAKAD", label: "Wakad", id:"67dc189fa9ae16de2619b72a"},
  { value: "BAVDHAN", label: "Bavdhan", id:"67dc1969a9ae16de2619b72f"},
  { value: "DEHUROAD", label: "Dehuroad", id:"67dc1a22a9ae16de2619b737"},
  { value: "TALEGAON", label: "Talegaon", id:"67dac3e9bb20f51c531c1509"},
];

// const divisionName = localStorage.getItem("divisionName");
// const _division = divisions.find(division => division.value === divisionName);
// const divisionId = _division ? _division.id : "NOT_SPECIFIED";
const userData = JSON.parse(localStorage.getItem("userData"));
let divisionId = "NOT_SPECIFIED";
let divisionName = "NOT_SPECIFIED";
if(userData && userData.role == "division_admin"){
  divisionId = userData.divisionId;
  divisionName = userData.divisionName;
}

console.log("User Data: ", userData);
console.log("Division Name: ", divisionName);
console.log("Division ID: ", divisionId);

const QueryManagementPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timelineActive, setTimelineActive] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedQueryForEmail, setSelectedQueryForEmail] = useState(null);
  const [departmentEmail, setDepartmentEmail] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // Original query stats (all data)
  const [queryStats, setQueryStats] = useState({
    byStatus: {
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    },
    byType: {
      trafficViolation: 0,
      trafficCongestion: 0,
      accident: 0,
      roadDamage: 0,
      illegalParking: 0,
      suggestion: 0,
      generalReport: 0,
    },
    total: 0,
  });
  // New state for filtered query stats
  const [filteredStats, setFilteredStats] = useState({
    byStatus: {
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    },
    byType: {
      trafficViolation: 0,
      trafficCongestion: 0,
      accident: 0,
      roadDamage: 0,
      illegalParking: 0,
      suggestion: 0,
      generalReport: 0,
    },
    total: 0,
  });
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDivision, setSelectedDivison] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewDetailsId, setViewDetailsId] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchQueryStats();
    if (!timelineActive) {
      fetchQueries();
    }
  }, [currentPage, searchTerm, selectedType, selectedStatus, timelineActive]);

  // Update filtered stats whenever queries change
  useEffect(() => {
    calculateFilteredStats();
  }, [queries]);

  const fetchQueryStats = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/queries/division/${divisionId}/stats`
      );
      if (response.data.success) {
        setQueryStats(response.data.stats);
        // Initially set filtered stats to be the same as all stats
        if (
          !searchTerm &&
          !selectedType &&
          !selectedStatus &&
          !timelineActive
        ) {
          setFilteredStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching query statistics:", error);
    }
  };

  const calculateFilteredStats = () => {
    // Calculate statistics based on the current filtered queries
    if (!queries.length) return;

    const byStatus = {
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
    };

    const byType = {
      trafficViolation: 0,
      trafficCongestion: 0,
      accident: 0,
      roadDamage: 0,
      illegalParking: 0,
      suggestion: 0,
      generalReport: 0,
    };

    // Count occurrences of each status and type
    queries.forEach((query) => {
      // Count by status
      if (query.status === "Pending") byStatus.pending++;
      else if (query.status === "In Progress") byStatus.inProgress++;
      else if (query.status === "Resolved") byStatus.resolved++;
      else if (query.status === "Rejected") byStatus.rejected++;

      // Count by type
      const typeKey =
        query.query_type.replace(/\s+/g, "").charAt(0).toLowerCase() +
        query.query_type.replace(/\s+/g, "").slice(1);
      if (byType.hasOwnProperty(typeKey)) {
        byType[typeKey]++;
      } else {
        // Handle query types that don't match our predefined keys
        if (query.query_type === "Traffic Violation") byType.trafficViolation++;
        else if (query.query_type === "Traffic Congestion")
          byType.trafficCongestion++;
        else if (query.query_type === "Accident") byType.accident++;
        else if (query.query_type === "Road Damage") byType.roadDamage++;
        else if (query.query_type === "Illegal Parking")
          byType.illegalParking++;
        else if (query.query_type === "Suggestion") byType.suggestion++;
        else if (query.query_type === "General Report") byType.generalReport++;
      }
    });

    const total = queries.length;

    setFilteredStats({
      byStatus,
      byType,
      total,
    });
  };

  const fetchQueries = async () => {
    setLoading(true);
    try {
      let url = `${backendUrl}/api/queries?page=${currentPage}&limit=20&division=${divisionId}`;

      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }

      if (selectedType && selectedType !== "all") {
        url += `&query_type=${selectedType}`;
      }

      if (selectedStatus && selectedStatus !== "all") {
        url += `&status=${selectedStatus}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setQueries(response.data.data);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryDetails = async (id) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/queries/${id}`
      );
      if (response.data.success) {
        setDetailsData(response.data.data);
        setViewDetailsId(id);
      }
    } catch (error) {
      console.error("Error fetching query details:", error);
    }
  };

  const updateQueryStatus = async (id, newStatus) => {
    try {
      await axios.put(`${backendUrl}/api/queries/${id}/status`, {
        status: newStatus,
      });

      // Refresh queries and stats
      fetchQueries();
      fetchQueryStats();

      // If the details modal is open for this query, refresh details too
      if (viewDetailsId === id) {
        fetchQueryDetails(id);
      }
    } catch (error) {
      console.error("Error updating query status:", error);
    }
  };

  const handleSendEmail = async () => {
    if (!departmentEmail || !departmentName) {
      alert("Please enter both department email and name");
      return;
    }

    console.log("Sending email for query:", selectedQueryForEmail);
    setEmailSending(true);

    try {
      // Make sure we have the correct ID format
      const queryId = selectedQueryForEmail._id || selectedQueryForEmail.id;

      console.log(
        `Making request to: ${backendUrl}/api/queries/${queryId}/notify-department`
      );

      const response = await axios.post(
        `${backendUrl}/api/queries/${queryId}/notify-department`,
        {
          email: departmentEmail,
          departmentName: departmentName,
        }
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        alert(`Email successfully sent to ${departmentName}`);
        setEmailModalOpen(false);
        setDepartmentEmail("");
        setDepartmentName("");
        setSelectedQueryForEmail(null);
      }
    } catch (error) {
      console.error("Error sending email:", error);

      let errorMessage = "Failed to send email. Please try again.";

      if (error.response) {
        // Server responded with error
        errorMessage = `Error: ${
          error.response.data.message || error.response.statusText
        }`;
        console.log("Server error details:", error.response.data);
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Server did not respond. Check your connection.";
      }

      alert(errorMessage);
    } finally {
      setEmailSending(false);
    }
  };

  const openInGoogleMaps = (latitude, longitude) => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  // Update only the applyTimelineFilter function:

  const applyTimelineFilter = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setTimelineActive(true);

    try {
      console.log("Date strings from inputs:", startDate, endDate);

      // Format dates with timezone consideration
      const formattedStartDate = startDate; // Use as is from date input
      const formattedEndDate = endDate; // Use as is from date input

      console.log(
        `Sending timeline request with dates: ${formattedStartDate}, ${formattedEndDate}, division ID: ${divisionId}`
      );

      const response = await axios.get(
        `${backendUrl}/api/queries/time-filter?start=${formattedStartDate}&end=${formattedEndDate}&division=${divisionId}`
      );

      if (response.data.success) {
        console.log(`Received ${response.data.count} queries for time range`);
        setQueries(response.data.data);
        setTotalPages(Math.ceil(response.data.count / 20)); // Assuming 20 per page
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching timeline queries:", error);
      if (error.response) {
        console.error("Server response data:", error.response.data);
      }
      alert("Error fetching data. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const clearTimelineFilter = () => {
    setStartDate("");
    setEndDate("");
    setTimelineActive(false);
    fetchQueries(); // Go back to regular query fetching
  };

  const sendEmail = (query) => {
    console.log("Query being sent:", query); // Add this line
    setSelectedQueryForEmail(query);
    setEmailModalOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  const handleDivisionFilter = (e) => {
    setSelectedDivison(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
  };

  // Function to download current data as Excel
  const downloadAsExcel = async () => {
    setExportLoading(true);
    try {
      // Determine what data to download (current page only vs all filtered data)
      // For better UX, we'll download all data that matches the current filters
      let dataToDownload = [];

      // If there are filters active or we're in timeline mode, download what we have
      if (searchTerm || selectedType || selectedStatus || timelineActive) {
        // For small datasets, we can just use what's already loaded
        if (queries.length < 100) {
          dataToDownload = queries;
        } else {
          // For larger datasets, make a dedicated API call to get all matching data (not just current page)
          // We'll construct a URL similar to fetchQueries but without pagination limits
          let url = `${backendUrl}/api/queries?limit=1000&division=${divisionId}`;

          if (searchTerm) {
            url += `&search=${searchTerm}`;
          }

          if (selectedType && selectedType !== "all") {
            url += `&query_type=${selectedType}`;
          }

          if (selectedStatus && selectedStatus !== "all") {
            url += `&status=${selectedStatus}`;
          }

          if (timelineActive && startDate && endDate) {
            // Use timeline endpoint instead
            url = `${backendUrl}/api/queries/timeline?start=${startDate}T00:00:00.000Z&end=${endDate}T23:59:59.999Z&limit=1000&division=${divisionId}`;
          }

          const response = await axios.get(url);
          if (response.data.success) {
            dataToDownload = response.data.data;
          }
        }
      } else {
        // If no filters, we might want all data, but that could be a lot
        // Let's limit to 1000 most recent entries to avoid browser issues
        const response = await axios.get(
          `${backendUrl}/api/queries?limit=1000&division=${divisionId}`
        );
        if (response.data.success) {
          dataToDownload = response.data.data;
        }
      }

      // Transform the data for Excel format
      const excelData = dataToDownload.map((q) => ({
        ID: q._id,
        Type: q.query_type,
        Description: q.description,
        Status: q.status,
        User: q.user_name,
        Contact: q.user_id,
        Date: formatDate(q.timestamp),
        Location: q.location?.address || "N/A",
        Latitude: q.location?.latitude || "N/A",
        Longitude: q.location?.longitude || "N/A",
        "Resolution Note": q.resolution_note || "",
        "Resolved At": q.resolved_at ? formatDate(q.resolved_at) : "",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Queries");

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      let fileName = `traffic-buddy-queries-${dateStr}.xlsx`;

      // Add filter info to filename
      if (selectedType) fileName = `${selectedType.toLowerCase()}-${fileName}`;
      if (selectedStatus)
        fileName = `${selectedStatus.toLowerCase()}-${fileName}`;
      if (timelineActive) fileName = `timeline-${fileName}`;

      // Write and download
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("There was an error exporting your data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      {/* YASHRAJ: Make sure this works properly when the component mounts > DONE */}
      <Header title={ (divisionName) + " Division Query Management" }/>

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                {/* QUERY CHARTS - Now using filteredStats instead of queryStats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <QueryStatusChart stats={filteredStats.byStatus} />
          <QueryTypeDistribution stats={filteredStats.byType} />
          <QueryTrends
            className="lg:col-span-2"
            timelineActive={timelineActive}
            startDate={startDate}
            endDate={endDate}
          />
        {/* STATS */}
        <motion.div
          className="flex flex-col gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard
            name="Total Queries"
            icon={FileSearch}
            value={filteredStats.total.toLocaleString()}
            color="#6366F1"
          />
          <StatCard
            name="Pending Queries"
            icon={Clock}
            value={filteredStats.byStatus?.pending || 0}
            color="#F59E0B"
          />
          <StatCard
            name="In Progress"
            icon={AlertTriangle}
            value={filteredStats.byStatus?.inProgress || 0}
            color="#3B82F6"
          />
          <StatCard
            name="Resolved"
            icon={Check}
            value={filteredStats.byStatus?.resolved || 0}
            color="#10B981"
          />
        </motion.div>

        </div>
        {/* FILTERS */}
        <motion.div
          className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-row md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search queries..."
                  className="bg-primary text-tBase placeholder-tDisabled rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search
                  className="absolute left-3 top-2.5 text-tSecondary"
                  size={18}
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select
                  value={selectedType}
                  onChange={handleTypeFilter}
                  className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option className="bg-primary hover:bg-hovPrimary" value="">
                    All Types
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Traffic Violation"
                  >
                    Traffic Violation
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Traffic Congestion"
                  >
                    Traffic Congestion
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Accident"
                  >
                    Accident
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Road Damage"
                  >
                    Road Damage
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Illegal Parking"
                  >
                    Illegal Parking
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Suggestion"
                  >
                    Suggestion
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="General Report"
                  >
                    General Report
                  </option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={handleStatusFilter}
                  className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option className="bg-primary hover:bg-hovPrimary" value="">
                    All Statuses
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Pending"
                  >
                    Pending
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="In Progress"
                  >
                    In Progress
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Resolved"
                  >
                    Resolved
                  </option>
                  <option
                    className="bg-primary hover:bg-hovPrimary"
                    value="Rejected"
                  >
                    Rejected
                  </option>
                </select>

                {/* Download Button */}
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
              </div>
            </div>

            {/* Add this inside the filter section div */}
            <div className="flex text-tBase items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
              <div className="flex items-center">
                <Calendar size={18} className="text-tBase mr-2" />
                <span className="text-tBase mr-2">From:</span>
                <input
                  type="date"
                  className="bg-primary text-tBase rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                  onChange={(e) => setStartDate(e.target.value)}
                  value={startDate}
                />
              </div>
              <div className="flex items-center">
                <span className="text-tBase mr-2">To:</span>
                <input
                  type="date"
                  className="bg-primary text-tBase rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
                  onChange={(e) => setEndDate(e.target.value)}
                  value={endDate}
                />
              </div>
              <button
                className="bg-secondary hover:bg-hovSecondary text-tBase px-3 py-2 rounded-lg"
                onClick={applyTimelineFilter}
              >
                Apply
              </button>
              {timelineActive && (
                <button
                  className="bg-gray-600 hover:bg-bgSecondary text-tBase px-3 py-2 rounded-lg"
                  onClick={clearTimelineFilter}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* QUERY TABLE */}
        <motion.div
          className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary mb-8 overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-tBase mb-4">Queries</h2>

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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Division
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {queries.map((query) => (
                    <motion.tr
                      key={query._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                          {query.query_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs truncate">
                          {query.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-tBase font-semibold">
                              {query.user_name?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-tBase">
                              {query.user_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(
                            query.status
                          )}`}
                        >
                          {query.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(query.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => fetchQueryDetails(query._id)}
                          >
                            Details
                          </button>

                          <button
                            className="text-green-400 hover:text-green-300"
                            onClick={() =>
                              openInGoogleMaps(
                                query.location.latitude,
                                query.location.longitude
                              )
                            }
                          >
                            <MapPin size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                          {query.divisionName}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
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

        {/* Query Details Modal */}
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

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Current Status:
                    </h3>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getBadgeColor(
                        detailsData.status
                      )}`}
                    >
                      {detailsData.status}
                    </span>
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-tBase px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      updateQueryStatus(detailsData._id, "Resolved")
                    }
                    disabled={detailsData.status === "Resolved"}
                  >
                    Mark as Resolved
                  </button>

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-tBase px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      updateQueryStatus(detailsData._id, "In Progress")
                    }
                    disabled={detailsData.status === "In Progress"}
                  >
                    Mark as In Progress
                  </button>

                  <button
                    className="bg-yellow-600 hover:bg-yellow-700 text-tBase px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      updateQueryStatus(detailsData._id, "Pending")
                    }
                    disabled={detailsData.status === "Pending"}
                  >
                    Mark as Pending
                  </button>

                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-tBase px-4 py-2 rounded"
                    onClick={() => sendEmail(detailsData)}
                  >
                    Forward to Department
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* Email Department Modal */}
        {emailModalOpen && selectedQueryForEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-bgSecondary rounded-xl p-6 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-tBase">
                  Forward to Department
                </h2>
                <button
                  className="text-gray-400 hover:text-tBase"
                  onClick={() => setEmailModalOpen(false)}
                ></button>
              </div>

              <div className="mt-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-1">
                    Query Type:
                  </h3>
                  <p className="text-gray-200">
                    {selectedQueryForEmail.query_type}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Department Name:
                  </label>
                  <input
                    type="text"
                    className="bg-bgSecondary text-tBase placeholder-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="e.g. Traffic Police Department"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Department Email:
                  </label>
                  <input
                    type="email"
                    className="bg-bgSecondary text-tBase placeholder-gray-400 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="department@example.com"
                    value={departmentEmail}
                    onChange={(e) => setDepartmentEmail(e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-600 text-tBase rounded-lg hover:bg-bgSecondary"
                    onClick={() => setEmailModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-tBase rounded-lg hover:bg-blue-700 flex items-center"
                    onClick={handleSendEmail}
                    disabled={emailSending}
                  >
                    {emailSending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={16} className="mr-2" /> Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QueryManagementPage;
