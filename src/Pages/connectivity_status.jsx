
import React, { useEffect, useState } from "react";
import "./CSS/homepage.css";
import plcIcon_1200 from "../assets/s7_1200.png";
import plcIcon_1500 from "../assets/s7_1500.png";
import mitsubishiIcon from "../assets/mitsubishi.png";
import plcUnknown from "../assets/unknown.png";
import DBStatusIndicator from "../Components/DBConnection_Status/Db_Status";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PlcDashboard = () => {
  const [plcs, setPlcs] = useState([]);
  const [loadingCards, setLoadingCards] = useState(new Set());

  useEffect(() => {
  const fetchPlcData = async () => {
    try {
     const response = await fetch(
  `${API_BASE_URL}/plcstatus`
);

      const data = await response.json();

      if (data.plcData) {
        setPlcs(data.plcData);
      }
    } catch (error) {
      console.error("Error fetching PLC data:", error);
    }
  };

  fetchPlcData(); // Initial load

  const interval = setInterval(fetchPlcData, 5000);

  return () => clearInterval(interval);
}, []);

  // Hide skeleton loader after 2 seconds
  useEffect(() => {
    if (loadingCards.size > 0) {
      const timer = setTimeout(() => {
        setLoadingCards(new Set());
      }, 2000);

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
                  <span
                    className={`status-dot ${
                      plc.status ? "online" : "offline"
                    }`}
                  ></span>
                </div>

                <div className="plc-name">{plc.name}</div>

              <div className="plc-icon">
  <img
    src={
      plc.name.includes("S7-1200")
        ? plcIcon_1200
        : plc.name.includes("S7-1500")
        ? plcIcon_1500
        : plc.name.includes("Mitsubishi")
        ? mitsubishiIcon
        : plcUnknown
    }
    alt="PLC Icon"
    width={40}
  />
</div>

                <div className="plc-ip">IP: {plc.ip}</div>
                <div className="plc-port">Port: {plc.port}</div>

                {/* Optional Timestamp */}
                <div className="plc-time">
                  {plc.timestamp}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default PlcDashboard;