import { BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid, Legend } from "recharts";
import Themes, { getCurrentTheme } from "../../assets/Themes";

// Custom Horizontal Bar Chart Component for Infractions by Division
const InfractionsByDivisionChart = ({ data, name }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary">
        <h2 className="text-lg font-medium text-tBase mb-4">{name}</h2>
        <p className="text-tBase text-center">
          No data available for this chart.
        </p>
      </div>
    );
  }

  const truncateLabel = (label) => {
    return label.length > 7 ? `${label.substring(0, 7)}...` : label;
  };

  return (
    <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary">
      <h2 className="text-lg font-medium text-tBase mb-4">{name}</h2>
      <BarChart
        width={1200}
        height={data.length * 40 + 60} // Dynamic height based on number of divisions
        data={data}
        layout="horizontal"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis type="category" dataKey="name" stroke="#ccc" width={"100%"} tickFormatter={truncateLabel} />
        <YAxis type="number" stroke="#ccc" />
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
        <Legend />
        <Bar dataKey="pending" fill="#ff6b6b" name="Pending" />
        <Bar dataKey="inProgress" fill="#feca57" name="In Progress" />
        <Bar dataKey="resolved" fill="#54a0ff" name="Resolved" />
        <Bar dataKey="rejected" fill="#a55eea" name="Rejected" />
      </BarChart>
    </div>
  );
};

export default InfractionsByDivisionChart;
