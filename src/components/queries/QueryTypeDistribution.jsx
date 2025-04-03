import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import Themes, { getCurrentTheme } from "../../assets/Themes";

const QueryTypeDistribution = ({ stats, division_admin=true}) => {
  // Transform stats object into array format for Recharts
  const data = [
    { name: "Traffic Violation", value: stats?.trafficViolation || 0 },
    { name: "Traffic Congestion", value: stats?.trafficCongestion || 0 },
    { name: "Accident", value: stats?.accident || 0 },
    // { name: "Road Damage", value: stats?.roadDamage || 0 },
    { name: "Illegal Parking", value: stats?.illegalParking || 0 },
    // { name: "Suggestion", value: stats?.suggestion || 0 },
    { name: "General Report", value: stats?.generalReport || 0 },
  ];

  if(!division_admin){
    data.push({ name: "Road Damage", value: stats?.roadDamage || 0 });
    data.push({ name: "Suggestion", value: stats?.suggestion || 0 });
  }

  return (
    <motion.div
      className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration:0.5 }}
    >
      <h2 className="text-xl font-semibold text-tBase mb-4">
        Query Type Distribution
      </h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={Themes[getCurrentTheme()]["cartGrid"]}
            />
            <XAxis
              type="number"
              stroke={Themes[getCurrentTheme()]["cartAxis"]}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke={Themes[getCurrentTheme()]["cartAxis"]}
              tick={{ fontSize: 12 }}
              width={95}
            />
            <Tooltip
                    cursor={{
                      fill:Themes[getCurrentTheme()]["hovPrimary"],
                    }}
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
            <Bar dataKey="value" fill="#8884d8">
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
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default QueryTypeDistribution;
