import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import OrderScreen from './components/OrderScreen';
import ManageOrderDetails from './components/ManageOrderDetails';
import Menu from './components/Menu';
import OrderSummaryScreen from './components/OrderSummaryScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/OrderScreen" element={<OrderScreen />} />
        <Route path="/ManageOrderDetails" element={<ManageOrderDetails />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/OrderSummaryScreen" element={<OrderSummaryScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
