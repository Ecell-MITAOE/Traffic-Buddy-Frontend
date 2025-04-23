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
        if (response.data.success && response.data.stats.recent.dailyCounts) {
          // Format data for the chart
          const formattedData = response.data.stats.recent.dailyCounts.map(
            (item) => ({
              date: item._id,
              queries: item.count,
            })
          );
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
                name="Number of Queries"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default QueryTrends;
