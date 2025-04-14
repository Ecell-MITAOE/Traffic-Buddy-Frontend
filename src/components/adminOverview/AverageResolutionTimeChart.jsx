import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import Themes, { getCurrentTheme } from "../../assets/Themes";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/api') 
     ? import.meta.env.VITE_API_URL 
     : `${import.meta.env.VITE_API_URL}/api`)
  : "http://localhost:3000/api";

const CONGESTION_QUERY_TYPE = "Traffic Congestion"; // The fixed query type we're focusing on

const AverageResolutionTimeChart = ({ name = "Traffic Congestion Resolution Time by Division" }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters - filter by Traffic/Road Congestion
        const params = new URLSearchParams();
        params.append('queryType', CONGESTION_QUERY_TYPE);
        
        const url = `${API_BASE_URL}/dashboard/average-resolution-time?${params.toString()}`;
        console.log("Fetching from URL:", url);
        
        const response = await axios.get(url);
        console.log("API Response:", response.data);
        
        // Store debug information
        setDebugInfo({
          url,
          responseStatus: response.status,
          responseSuccess: response.data.success,
          responseDataLength: Array.isArray(response.data.data) ? response.data.data.length : 'Not an array',
          rawData: response.data.data
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          if (response.data.data.length === 0) {
            // Data is empty but request was successful
            console.log("No data returned from API for Road Congestion");
            setChartData([]);
            return;
          }
          
          // Group by division name
          const byDivision = {};
          
          response.data.data.forEach(item => {
            const divisionName = item.division.name || "Unknown";
            
            if (!byDivision[divisionName]) {
              byDivision[divisionName] = {
                totalTimeWeighted: 0,
                totalCount: 0
              };
            }
            
            byDivision[divisionName].totalTimeWeighted += 
              (item.averageResolutionTimeHours * item.resolvedQueryCount);
            byDivision[divisionName].totalCount += item.resolvedQueryCount;
          });
          
          // Create mock data if no real data is available (for development/testing)
          if (Object.keys(byDivision).length === 0) {
            console.log("No division data found, using mock data");
            // You can remove this in production
            const mockData = [
              { name: "Pimpri", value: 4.35, count: 12 },
              { name: "Chinchwad", value: 3.27, count: 8 },
              { name: "Akurdi", value: 5.63, count: 15 },
              { name: "Nigdi", value: 2.85, count: 7 },
              { name: "Bhosari", value: 3.92, count: 10 }
            ];
            setChartData(mockData);
            return;
          }
          
          const transformedData = Object.keys(byDivision)
            .filter(key => byDivision[key].totalCount > 0)
            .map(division => ({
              name: division,
              value: parseFloat((byDivision[division].totalTimeWeighted / 
                               byDivision[division].totalCount).toFixed(2)),
              count: byDivision[division].totalCount
            }))
            .sort((a, b) => b.value - a.value); // Sort by resolution time (descending)
          
          setChartData(transformedData);
        } else {
          setError("Failed to fetch or parse resolution time data.");
          toast.error("Could not load traffic congestion resolution data.");
          setChartData([]);
        }
      } catch (err) {
        console.error("Error fetching average resolution time:", err);
        setError(`An error occurred while fetching data: ${err.message}`);
        toast.error("Error fetching traffic congestion resolution times.");
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only fetch on component mount

  const themeColors = Themes[getCurrentTheme()];

  if (loading) {
    return (
      <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary min-h-[200px] flex items-center justify-center">
        <p className="text-tBase">Loading Chart Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">{error}</p>
        <details className="text-left text-tSecondary text-sm w-full">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 p-2 bg-bgPrimary rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary">
        <h2 className="text-lg font-medium text-tBase mb-4">{name}</h2>
        <p className="text-tBase text-center">No traffic congestion resolution data available.</p>
        <p className="text-tSecondary text-center text-sm mt-2">
          This could be because no Traffic Congestion reports have been resolved yet.
        </p>
        <details className="text-left text-tSecondary text-sm mt-4">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 p-2 bg-bgPrimary rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-tBase">{name}</h2>
      </div>
      
      <ResponsiveContainer width="100%" height={chartData.length * 50 + 80}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 40, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={themeColors.borderSecondary || "#444"} />
          <XAxis
            type="number"
            stroke={themeColors.tSecondary || "#ccc"}
            label={{ value: "Average Hours", position: "insideBottom", dy: 10, fill: themeColors.tSecondary || "#ccc" }}
            domain={[0, Math.max(...chartData.map(item => item.value)) + 2]} // Dynamic domain based on data
            allowDecimals={true}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke={themeColors.tSecondary || "#ccc"}
            width={150}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: themeColors.hovPrimary || '#555' }}
            contentStyle={{
              backgroundColor: themeColors.bgPrimary || '#222',
              opacity: "0.9",
              border: `1px solid ${themeColors.borderPrimary || '#444'}`,
              borderRadius: '5px',
              color: themeColors.tBase || '#eee',
            }}
            formatter={(value, name, props) => {
              return [
                `${value} hours (${props.payload.count} queries)`,
                "Avg. Resolution Time"
              ];
            }}
          />
          <Legend wrapperStyle={{ color: themeColors.tBase || '#eee', paddingTop: '10px' }} />
          <Bar 
            dataKey="value" 
            name="Avg. Resolution Time (Hours)" 
            fill={themeColors.accent || "#8884d8"} 
            barSize={20} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AverageResolutionTimeChart;