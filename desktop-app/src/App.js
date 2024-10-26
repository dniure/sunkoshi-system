import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';

// Lazy load components
const HomeScreen = React.lazy(() => import('./components/HomeScreen'));
const OrderScreen = React.lazy(() => import('./components/OrderScreen'));
const ManageOrderDetails = React.lazy(() => import('./components/OrderScreen/ManageOrderDetails'));
const Menu = React.lazy(() => import('./components/OrderScreen/Menu'));
const OrderSummaryScreen = React.lazy(() => import('./components/OrderSummaryScreen'));

function App() {
  return (
    <Router>
      <Suspense fallback= {<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/OrderScreen" element={<OrderScreen />} />
          <Route path="/ManageOrderDetails" element={<ManageOrderDetails />} />
          <Route path="/Menu" element={<Menu />} />
          <Route path="/OrderSummaryScreen" element={<OrderSummaryScreen />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
