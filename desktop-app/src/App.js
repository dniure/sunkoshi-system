import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import OrderScreen from './components/OrderScreen';
import ManageOrderDetails from './components/ManageOrderDetails';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/OrderScreen" element={<OrderScreen />} />
        <Route path="/ManageOrderDetails" element={<ManageOrderDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
