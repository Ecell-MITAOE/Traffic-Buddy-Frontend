import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Themes, { getCurrentTheme } from "../../assets/Themes";

const CategoryDistributionChart = ({
  categoryData,
  innerRadius = 60,
  outerRadius = 80,
  height = 320,
  name = "Pie Chart",
}) => {

  const getTotalValue = () => {
    return categoryData.reduce((total, item) => total + item.value, 0);
  };

  const getZeroElementPercentage = () => {
    const zeroElementValue = categoryData[0].value;
    const totalValue = getTotalValue();
    return ((zeroElementValue / totalValue) * 100).toFixed(2);
  };

  return (
    <motion.div
      className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-tBase">{name}</h2>
      </div>
      <div className="flex" style={{ height }}>
        <div className="w-2/5">
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <PieChart>
              <text
                x={"50%"}
                y={"50%"}
                textAnchor="middle"
                dominantBaseline="middle"
                fill= {Themes[getCurrentTheme()]["tBase"]}
                fontSize={14}
              >
                {Math.round(getZeroElementPercentage())}%
              </text>
              <Pie
                data={categoryData}
                cx={"50%"}
                cy={"50%"}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                fill="#2884d8"
                stroke={Themes[getCurrentTheme()]["bgPrimary"]}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
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
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-4/5 flex flex-col justify-center items-start pl-6">
          <div className="space-y-3">
              <div key={0} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor:
                      Themes[getCurrentTheme()]["COLORS"][0],
                  }}
                />
                <span className="text-tBase text-sm">{categoryData[0].name}</span>
              </div>
                <span className="text-tBase text-lg">{categoryData[0].value}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryDistributionChart;