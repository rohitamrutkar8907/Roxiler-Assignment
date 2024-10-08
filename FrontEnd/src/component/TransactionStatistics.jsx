import axios from "axios";
import React, { useEffect, useState } from "react";

const TransactionStatistics = () => {
  const [month, setMonth] = useState("3");
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });
  const [error, setError] = useState("");

  const months = [
    { value: "1", name: "January" },
    { value: "2", name: "February" },
    { value: "3", name: "March" },
    { value: "4", name: "April" },
    { value: "5", name: "May" },
    { value: "6", name: "June" },
    { value: "7", name: "July" },
    { value: "8", name: "August" },
    { value: "9", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" },
  ];

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  useEffect(() => {
    if (month) {
      axios
        .get(
          `http://localhost:4001/product_transaction/statistics?month=${month}`
        )
        .then((response) => {
          setStatistics(response.data);
          setError("");
        })
        .catch((err) => {
          setError("Failed to fetch statistics for the selected month");
          setStatistics({
            totalSaleAmount: 0,
            totalSoldItems: 0,
            totalNotSoldItems: 0,
          });
        });
    }
  }, [month]);

  const selectedMonthName = month
    ? months.find((m) => m.value === month)?.name
    : "";

  return (
    <div>
      <h2>Transactions Statistics</h2>

      <select value={month} onChange={handleMonthChange}>
        <option value="">Select a month</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.name}
          </option>
        ))}
      </select>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {month && (
        <div
          style={{
            border: "1px solid black",
            padding: "20px",
            marginTop: "20px",
          }}
        >
          <h3>Transaction Statistics for {selectedMonthName}</h3>
          <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
      )}
    </div>
  );
};

export default TransactionStatistics;
