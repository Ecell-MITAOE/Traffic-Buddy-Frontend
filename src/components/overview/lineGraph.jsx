import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import Themes, { getCurrentTheme } from "../../assets/Themes";

const LineGraph = ({ data = [], name = "Reports" }) => {

  const divisions = data.length > 0 ? Object.keys(data[0]).filter(key => key !== "name") : [];

  return (
    <motion.div
      className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-lg font-medium mb-4 text-tBase">{name}</h2>

      <div className="h-80">
      {divisions.length === 0 ? (
          <p className="text-tBase">No data available to display.</p>
        ) : (
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={Themes[getCurrentTheme()]["cartGrid"]} />
              <XAxis dataKey="name" stroke={Themes[getCurrentTheme()]["cartAxis"]} />
              <YAxis
                stroke={Themes[getCurrentTheme()]["cartAxis"]}
                domain={[0, 100]} // Since we're dealing with percentages
                label={{ value: "Percentage (%)", angle: -90, position: "insideLeft", fill: Themes[getCurrentTheme()]["tBase"] }}
              />
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
                formatter={(value) => `${value.toFixed(2)}%`} // Format tooltip values as percentages
              />
              <Legend />
              {divisions.map((division, index) => (
                <Line
                  key={division}
                  type="monotone"
                  dataKey={division}
                  name={division}
                  stroke={`hsl(${index * 25}, 70%, 50%)`} // Different color for each division
                  strokeWidth={3}
                  dot={{ fill: `hsl(${index * 25}, 70%, 50%)`, strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};
export default LineGraph;
