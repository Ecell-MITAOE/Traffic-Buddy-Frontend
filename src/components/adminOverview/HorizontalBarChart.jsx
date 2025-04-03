import { BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid } from "recharts";
import Themes, { getCurrentTheme } from "../../assets/Themes";

// Custom Horizontal Bar Chart Component for Average Resolution Time
const HorizontalBarChart = ({ data, name }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary">
        <h2 className="text-lg font-medium text-tBase mb-4">{name}</h2>
        <p className="text-tBase text-center">No data available for this chart.</p>
      </div>
    );
  }

  return (
    <div className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-borderPrimary">
      <h2 className="text-lg font-medium text-tBase mb-4">{name}</h2>
      <BarChart
        width={1200}
        height={data.length * 40 + 60}
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis type="number" stroke="#ccc" label={{ value: "Hours", position: "insideBottomRight", offset: -5, fill: "#ccc" }} />
        <YAxis type="category" dataKey="name" stroke="#ccc" width={150} />
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
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default HorizontalBarChart;