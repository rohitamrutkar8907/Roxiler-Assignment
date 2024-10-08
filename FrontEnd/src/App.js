import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Navbar from "./component/Navbar";
import TransactionStatistics from "./component/TransactionStatistics";
import TransactionsBarChart from "./component/TransactionsBarChart ";
import TransactionsTable from "./component/TransactionsTable";

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/transactions-table" element={<TransactionsTable />} />
          <Route
            path="/transactions-statistics"
            element={<TransactionStatistics />}
          />
          <Route path="/transactions-bar" element={<TransactionsBarChart />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
