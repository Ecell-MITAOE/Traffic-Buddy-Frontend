import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";
import Themes, { getCurrentTheme } from "../../assets/Themes";

const CategoryDistributionChart = ({
  categoryData,
  innerRadius = 60,
  outerRadius = 80,
  height = 320,
  name = "Pie Chart",
}) => {
  const [showAllLabels, setShowAllLabels] = useState(true);

  const renderLabel = ({ name, percent }) => {
    if (showAllLabels) {
      return `${(percent * 100).toFixed(0)}%`;
    }
    return null;
  };

  return (
    <motion.div
      className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg
shadow-bgPrimary rounded-xl p-6 border border-borderPrimary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-tBase">{name}</h2>
        <button
          onClick={() => setShowAllLabels(!showAllLabels)}
          className="px-3 py-1 text-sm bg-primary hover:bg-hovPrimary rounded-md text-tBase"
        >
          {showAllLabels ? "Hide Labels" : "Show Labels"}
        </button>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <PieChart >
            <Pie
              data={categoryData}
              cx={"50%"}
              cy={"50%"}
              labelLine={showAllLabels}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill="#2884d8"
              stroke={Themes[getCurrentTheme()]["bgPrimary"]}
              dataKey="value"
              label={renderLabel}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Themes[getCurrentTheme()]["COLORS"][index % Themes[getCurrentTheme()]["COLORS"].length]}
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
            <Legend
              align="right"
              verticalAlign="middle"
              layout="vertical"
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default CategoryDistributionChart;
