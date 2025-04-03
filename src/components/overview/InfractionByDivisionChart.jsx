import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Themes, { getCurrentTheme } from "../../assets/Themes";

const generateRandomValue = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const data = [
  { name: 'Pimpri', pending: 4000, inprogress: 2400, resolved: 2400, rejected: 2400 },
  { name: 'Chinchwad', pending: 3000, inprogress: 1398, resolved: 2210, rejected: 2290 },
  { name: 'Nigdi', pending: 2000, inprogress: 9800, resolved: 2290, rejected: 2000 },
  { name: 'Bhosari', pending: 2780, inprogress: 3908, resolved: 2000, rejected: 2181 },
  { name: 'Hinjewadi', pending: 1890, inprogress: 4800, resolved: 2181, rejected: 2500 },
  { name: 'Pimple Saudagar', pending: 2390, inprogress: 3800, resolved: 2500, rejected: 2100 },
  { name: 'Ravet', pending: 3490, inprogress: 4300, resolved: 2100, rejected: 2400 },
  { name: 'Talegaon', pending: 4000, inprogress: 2400, resolved: 2400, rejected: 2400 },
  { name: 'Wakad', pending: 3000, inprogress: 1398, resolved: 2210, rejected: 2290 },
  { name: 'Rahatani', pending: 2000, inprogress: 9800, resolved: 2290, rejected: 2000 },
  { name: 'Dehu', pending: 2780, inprogress: 3908, resolved: 2000, rejected: 2181 },
  { name: 'Sinhagad', pending: 1890, inprogress: 4800, resolved: 2181, rejected: 2500 },
  { name: 'Balewadi', pending: 2390, inprogress: 3800, resolved: 2500, rejected: 2100 },
  { name: 'Undri', pending: 3490, inprogress: 4300, resolved: 2100, rejected: 2400 },
];



const normalizeData = (data) => {
  return data.map((entry) => {
    const total = entry.pending + entry.inprogress + entry.resolved + entry.rejected;
    return {
      name: entry.name,
      pending: (entry.pending / total) * 100,
      inprogress: (entry.inprogress / total) * 100,
      resolved: (entry.resolved / total) * 100,
      rejected: (entry.rejected / total) * 100,
    };
  });
};
const labelLengthV = 4;
const labelLengthH = 4;
const InfractionByDivisionChart = ({ showPercentage = false }) => {
  const chartData = showPercentage ? normalizeData(data) : data;
  const layout = showPercentage ? "horizontal" : "vertical";
  const xAxisType = showPercentage ? "category" : "number";
  const yAxisType = showPercentage ? "number" : "category";

  const truncateLabel = (label) => {
    return label.length > (showPercentage?labelLengthH:labelLengthV) ? `${label.substring(0, (showPercentage?labelLengthH:labelLengthV))}...` : label;
  };

  return (
    <motion.div
      className='bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 lg:col-span-2 border border-borderPrimary'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className='text-lg font-medium mb-4 text-tBase'>Infractions by division</h2>

      <div className='h-[800px]'>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout={layout} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type={xAxisType} dataKey={showPercentage ? "name" : undefined} tickFormatter={truncateLabel} />
            <YAxis type={yAxisType} dataKey={showPercentage ? undefined : "name"} tickFormatter={truncateLabel} />
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
            <Bar dataKey="pending" stackId="a" fill={Themes[getCurrentTheme()]["COLORS"][0]} />
            <Bar dataKey="inprogress" stackId="a" fill={Themes[getCurrentTheme()]["COLORS"][1]} />
            <Bar dataKey="resolved" stackId="a" fill={Themes[getCurrentTheme()]["COLORS"][2]} />
            <Bar dataKey="rejected" stackId="a" fill={Themes[getCurrentTheme()]["COLORS"][3]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default InfractionByDivisionChart;