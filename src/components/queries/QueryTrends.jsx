import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import Themes, { getCurrentTheme } from "../../assets/Themes";
import axios from "axios";

const userData = JSON.parse(localStorage.getItem("userData"));
let divisionId = "NOT_SPECIFIED";
let divisionName = "NOT_SPECIFIED";

const backendUrl = import.meta.env.VITE_Backend_URL || "http://localhost:3000";

if(userData && userData.role == "division_admin"){
  divisionId = userData.divisionId;
  divisionName = userData.divisionName;
}

const QueryTrends = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/queries/division/${divisionId}/stats`
        );
        if (response.data.success && response.data.stats.recent.statusCounts) {
          // Format data for the chart with status breakdowns
          const dailyCounts = response.data.stats.recent.dailyCounts || [];
          const statusCounts = response.data.stats.recent.statusCounts || [];
          
          // Create a map of date -> status counts
          const statusMap = {};
          statusCounts.forEach(item => {
            if (!statusMap[item._id.date]) {
              statusMap[item._id.date] = {
                pending: 0,
                inProgress: 0,
                resolved: 0,
                rejected: 0
              };
            }
            
            // Map the status to our standardized keys
            const status = item._id.status;
            const count = item.count;
            
            if (status === "Pending") statusMap[item._id.date].pending = count;
            else if (status === "In Progress") statusMap[item._id.date].inProgress = count;
            else if (status === "Resolved") statusMap[item._id.date].resolved = count;
            else if (status === "Rejected") statusMap[item._id.date].rejected = count;
          });
          
          // Create the final formatted data
          const formattedData = dailyCounts.map(item => {
            const date = item._id;
            return {
              date,
              queries: item.count, // Total queries
              // Include status breakdowns (default to 0 if not found)
              pending: statusMap[date]?.pending || 0,
              inProgress: statusMap[date]?.inProgress || 0,
              resolved: statusMap[date]?.resolved || 0,
              rejected: statusMap[date]?.rejected || 0
            };
          });
          
          setTrendData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching trend data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration:0.5 }}
    >
      <h2 className="text-xl font-semibold text-tBase mb-4">
        Query Trends (Last 30 Days)
      </h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={Themes[getCurrentTheme()]["cartGrid"]}
              />
              <XAxis
                dataKey="date"
                stroke={Themes[getCurrentTheme()]["cartAxis"]}
              />
              <YAxis stroke={Themes[getCurrentTheme()]["cartAxis"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: Themes[getCurrentTheme()]["bgPrimary"],
                  opacity: "80%",
                  borderColor: Themes[getCurrentTheme()]["borderPrimary"],
                }}
                itemStyle={{
                  color: Themes[getCurrentTheme()]["tBase"],
                  opacity: "100%",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="queries"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
                name="Total Queries"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={{ fill: "#F59E0B", strokeWidth: 1.5, r: 3 }}
                activeDot={{ r: 6 }}
                name="Pending"
              />
              <Line
                type="monotone"
                dataKey="inProgress"
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={{ fill: "#3B82F6", strokeWidth: 1.5, r: 3 }}
                activeDot={{ r: 6 }}
                name="In Progress"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#10B981"
                strokeWidth={1.5}
                dot={{ fill: "#10B981", strokeWidth: 1.5, r: 3 }}
                activeDot={{ r: 6 }}
                name="Resolved"
              />
              <Line
                type="monotone"
                dataKey="rejected"
                stroke="#EF4444"
                strokeWidth={1.5}
                dot={{ fill: "#EF4444", strokeWidth: 1.5, r: 3 }}
                activeDot={{ r: 6 }}
                name="Rejected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Status legend grid */}
      <div className="mt-4 grid grid-cols-5 gap-2 text-sm">
        <div className="flex items-center justify-center">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
          <span className="text-tBase">Total</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
          <span className="text-tBase">Pending</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
          <span className="text-tBase">In Progress</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
          <span className="text-tBase">Resolved</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
          <span className="text-tBase">Rejected</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QueryTrends;