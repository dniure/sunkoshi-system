import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import HomeScreen from './components/HomeScreen';
import OrderScreen from './components/OrderScreen';
import ManageOrderDetails from './components/OrderScreen/ManageOrderDetails';
import Menu from './components/OrderScreen/Menu';
import OrderSummaryScreen from './components/OrderSummaryScreen'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/OrderScreen" element={<OrderScreen />} />
        <Route path="/ManageOrderDetails" element={<ManageOrderDetails />} />
        <Route path="/Menu" element={<Menu />} />
        <Route path="/OrderSummaryScreen" element={<OrderSummaryScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
