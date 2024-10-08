import axios from "axios";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "../component/css/Bar.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const TransactionsBarChart = () => {
  const [month, setMonth] = useState("3 ");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (month) {
      axios
        .get(
          `http://localhost:4001/product_transaction/bar-chart?month=${month}`
        )
        .then((response) => {
          const data = response.data;
          const labels = data.map((item) => item.price_range);
          const values = data.map((item) => item.item_count);

          setChartData({
            labels,
            datasets: [
              {
                label: "Number of Items",
                data: values,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
              },
            ],
          });
        })
        .catch((error) => {
          console.error("Error fetching chart data:", error);
        });
    }
  }, [month]);

  return (
    <div>
      <h2>Transactions Bar Chart</h2>
      <div>
        <label>Select Month:</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Select a month</option>
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          height: "50%",
          width: "60%",
          margin: "0 auto",
          border: "1px solid #ccc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {chartData && (
          <Bar
            data={chartData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Number of Items" },
                },
                x: {
                  title: { display: true, text: "Price Range" },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionsBarChart;
