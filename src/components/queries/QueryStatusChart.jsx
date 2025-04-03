import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import Themes, { getCurrentTheme } from "../../assets/Themes";

const QueryStatusChart = ({ stats }) => {
  // Transform stats object into array format for Recharts
  const data = [
    { name: "Pending", value: stats?.pending || 0 },
    { name: "In Progress", value: stats?.inProgress || 0 },
    { name: "Resolved", value: stats?.resolved || 0 },
    { name: "Rejected", value: stats?.rejected || 0 },
  ];

  return (
    <motion.div
      className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration:0.5 }}
    >
      <h2 className="text-xl font-semibold text-tBase mb-4">
        Query Status Distribution
      </h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                percent * 100 > 5
                  ? `${name} ${(percent * 100).toFixed(0)}%`
                  : ""
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    Themes[getCurrentTheme()]["COLORS"][
                      index % Themes[getCurrentTheme()]["COLORS"].length
                    ]
                  }
                />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default QueryStatusChart;
