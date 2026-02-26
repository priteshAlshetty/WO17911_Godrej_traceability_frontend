import React, { useEffect, useState } from "react";
import "./CSS/homepage.css";
import plcIcon_1200 from "../assets/s7_1200.png";
import plcIcon_1500 from "../assets/s7_1500.png";
import plcData from "../data/plcdata";
import DBStatusIndicator from "../Components/DBConnection_Status/Db_Status";



const PlcDashboard = () => {
  const [plcs, setPlcs] = useState([]);
  const [loadingCards, setLoadingCards] = useState(new Set());

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setPlcs(plcData);
      // Initialize loading state for all cards
      setLoadingCards(new Set(plcData.map((_, index) => index)));
    }, 500);
  }, []);

  // Set loader timeout for each card (1-2 seconds)
  useEffect(() => {
    if (loadingCards.size > 0) {
      const timer = setTimeout(() => {
        setLoadingCards(new Set());
      }, 3000); // 1.5 seconds loader display

      return () => clearTimeout(timer);
    }
  }, [loadingCards]);

  return (
    <>
      <div className="header">
        <h2>Connectivity Status</h2>
        <DBStatusIndicator />
      </div>
      <div className="plc-container">

        {plcs.map((plc, index) => (
          <div key={plc.srNo} className="plc-card">
            {loadingCards.has(index) ? (
              <div className="card-skeleton">
                <div className="skeleton skeleton-header"></div>
                <div className="skeleton skeleton-name"></div>
                <div className="skeleton skeleton-icon"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
              </div>
            ) : (
              <>
                <div className="plc-card-header">
                  <span>#{plc.srNo}</span>
                  <span className={`status-dot ${plc.status ? "online" : "offline"}`}></span>
                </div>
                <div className="plc-name">{plc.name}</div>
                <div className="plc-icon">
                  <img src={plc.name.includes("S7-1200") ? plcIcon_1200 : plcIcon_1500} alt="PLC Icon" width={40} />
                </div>
                <div className="plc-ip">IP: {plc.ip}</div>
                <div className="plc-port">Port: {plc.port}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PlcDashboard;