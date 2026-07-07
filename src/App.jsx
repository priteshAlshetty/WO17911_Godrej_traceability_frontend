import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import '../src/App.css'

import Home from './Pages/Traceability-id';
import ConnectivityStatus from './Pages/connectivity_status';
import Traceability from './Pages/Traceability-batch';
import Graphs from './Pages/Graphs';
import Upload from './Pages/upload';
import Download from './Pages/download';
import About from './Pages/About';
import Login from './Pages/login';
import Date from './Pages/Traceability-date';
import Machinewise from './Pages/Machinewise_Data';
import EmsIndividual from './Pages/Ems_Individual';
import Dashboard_homepage from './Pages/Dashboard_homepage';
import EnergyGraph from './Pages/Energy_Graph';
import Allmachinesdata from './Pages/AllMachinesEnergyReport';
import Footer from './Components/Footer/Footer';

// Wrapper to use hooks outside of <Router>
const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

const App = () => { 
  const location = useLocation();

  // Hide navbar on login page
  const hideNavbar = location.pathname === '/';

  return ( 
    <div className='pageContaint'>
      {!hideNavbar && <Navbar />}

      <div className="content">
         <Routes >
           <Route path="/" element={<Login />} />
        {/* <Route path="/api" element={<Home />} /> */}
        <Route path="/api/traceability/batch" element={<Traceability />} />
        <Route path="/api/traceability/id" element={<Home />} />
        <Route path="/api/traceability/date" element={<Date />} />
        <Route path="/api/graphs" element={<Graphs />} />
        <Route path="/api/upload" element={<Upload />} />
        <Route path="/api/download" element={<Download />} />
        <Route path="/api/about" element={<About />} />
        <Route path="/api/machine-wise" element={<Machinewise />} />
        <Route path="/api/ems-individual" element={<EmsIndividual />} />
         <Route path="/api/energy-graph" element={<EnergyGraph />} />
         <Route path="/api/all-machines-data" element={<Allmachinesdata />} />
        <Route path="/api/connectivity-status" element={<ConnectivityStatus />} />
        <Route path="/api" element={<Dashboard_homepage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </div>
     <Footer/>
    </div>
  );
};

export default AppWrapper;
