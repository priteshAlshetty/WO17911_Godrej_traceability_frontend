import React, { useState } from "react";
import axios from "axios";
import "./CSS/BatteryTables.css";
import downloadPDF from "../utils/downloadPdf";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BatteryTraceByDate = () => {
  const [dateInput, setDateInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [batteryData, setBatteryData] = useState([]);
  const [electrodeData, setElectrodeData] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!dateInput) {
      setError("Please select a date.");
      return;
    }

    setLoading(true);
    setError("");
    setBatteryData([]);
    setElectrodeData([]);

    try {
      const res = await axios.post(`${API_BASE_URL}/trace/date`, { date: dateInput });
      const trace = res.data.trace;

      if (!trace || trace.length === 0) {
        setError("No data found for this date.");
        return;
      }

      const formattedBatteryData = [];
      const formattedElectrodeData = [];

      trace.forEach((item) => {
        const cells = item.cell_data || [];

        cells.forEach((cell) => {
          const data = cell.data || {};
          formattedBatteryData.push({
            "Sr. Nos": formattedBatteryData.length + 1,
            "Battery ID": item.battery_id || "Null",
            "Battery OCV": item.battery_ocv || "Null",
            "Manufactured Time": new Date(item.manufactured_timestamp).toLocaleString() || "Null",
            "Cell ID": cell.cell_id || "Null",
            "Testing Time": data.testing_timestamp ? new Date(data.testing_timestamp).toLocaleString() : "Null",
            "OCV": data.cell_ocv || "Null",
            "IR": data.cell_ir || "Null",
            "HRD": data.cell_hrd || "Null",
            "Filling Date & Time": data.filling_datetime ? new Date(data.filling_datetime).toLocaleString() : "Null",
            "Dry Weight": data.dry_weight || "Null",
            "Filled Qty": data.filled_weight || "Null",
            "Jelly Roll Weight": data.jelly_roll_wt || "Null",
            "Jelly Roll Dia": data.jelly_roll_dia || "Null",
          });

          (cell.electrode_data || []).forEach((ed) => {
            const ele = ed.anode_data || ed.cathode_data;
            if (!ele) return;

            formattedElectrodeData.push({
              Sr: formattedElectrodeData.length + 1,
              Cell_ID: cell.cell_id,
              Type: ed.anode_data ? "Anode" : "Cathode",
              Electrode_ID: ele.electrode_id || "Null",
              Weight: ele.weight || "Null",
              Moisture: ele.moisture || "Null",
              Thickness: ele.thickness || "Null",
              Density: ele.density || "Null",
              IR_Temp_1: ele.IR_temp_1 || "Null",
              IR_Temp_2: ele.IR_Temp_2 || "Null",
              Chain_Speed: ele.chain_speed || "Null",
              Zone_Temp_1: ele.zone_temp_1 || "Null",
              Zone_Temp_2: ele.zone_temp_2 || "Null",
              Humidity: ele.humidity || "Null",
            });
          });
        });
      });

      setBatteryData(formattedBatteryData);
      setElectrodeData(formattedElectrodeData);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleDownloadPDF = () => {
    downloadPDF("#pdf-content", "battery_trace_by_date");
  };

  return (
    <div className="table-container">
      <h2>Traceability by Date</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          style={{ padding: "0.5rem", fontSize: "1rem", marginRight: "0.5rem" }}
        />
        <button className="search_btn" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {!loading && (batteryData.length > 0 || electrodeData.length > 0) && (
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button className="downlaod-report" onClick={handleDownloadPDF} style={{ marginBottom: "1rem" }}>
            Download Report
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <img src="/src/assets/Animation_searching_pages.gif" alt="Loading..." width="300" style={{ mixBlendMode: "multiply" }} />
          <p>Loading data, please wait...</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && (
        <div id="pdf-content">
          {/* PDF Header - hidden in UI */}
          <div className="pdf-header-only" style={{ display: "none", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <img src="/src/assets/goderej_and_multiquadrant_logo.jpeg" alt="Logo" style={{ height: "60px" }} />
              <div style={{ flex: 1 }}></div>
              <h2 style={{ margin: 0, fontSize: "14px", whiteSpace: "nowrap" }}>
                Report Generated at: {new Date().toLocaleString()}
              </h2>
            </div>
            <hr style={{ marginTop: "10px", border: "1px solid #000", width: "100%" }} />
            <h1 style={{ textAlign: "center", marginTop: "10px" }}>Traceability Report by Date</h1>
          </div>

          {/* Battery & Cell Data Table */}
          {batteryData.length > 0 && (
            <>
              <h3>Battery & Cell Data</h3>
              <table className="battery-table">
                <thead>
                  <tr>
                    <th>Sr. Nos</th>
                    <th>Battery ID</th>
                    <th>Battery OCV</th>
                    <th>Cell ID</th>
                    <th>Testing Time</th>
                    <th>OCV</th>
                    <th>IR</th>
                    <th>HRD</th>
                    <th>Filling Date & Time</th>
                    <th>Dry Weight</th>
                    <th>Filled Qty</th>
                    <th>Jelly Roll Weight</th>
                    <th>Jelly Roll Dia</th>
                  </tr>
                </thead>
                <tbody>
                  {batteryData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row["Sr. Nos"]}</td>
                      <td>{row["Battery ID"]}</td>
                      <td>{row["Battery OCV"]}</td>
                      <td>{row["Cell ID"]}</td>
                      <td>{row["Testing Time"]}</td>
                      <td>{row["OCV"]}</td>
                      <td>{row["IR"]}</td>
                      <td>{row["HRD"]}</td>
                      <td>{row["Filling Date & Time"]}</td>
                      <td>{row["Dry Weight"]}</td>
                      <td>{row["Filled Qty"]}</td>
                      <td>{row["Jelly Roll Weight"]}</td>
                      <td>{row["Jelly Roll Dia"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Electrode Data Table */}
          {electrodeData.length > 0 && (
            <>
              <h3 style={{ marginTop: "2rem" }}>Electrode Data</h3>
              <table className="battery-table">
                <thead>
                  <tr>
                    <th>Sr</th>
                    <th>Cell ID</th>
                    <th>Type</th>
                    <th>Electrode ID</th>
                    <th>Weight</th>
                    <th>Moisture</th>
                    <th>Thickness</th>
                    <th>Density</th>
                    <th>IR Temp 1</th>
                    <th>IR Temp 2</th>
                    <th>Chain Speed</th>
                    <th>Zone Temp 1</th>
                    <th>Zone Temp 2</th>
                    <th>Humidity</th>
                  </tr>
                </thead>
                <tbody>
                  {electrodeData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.Sr}</td>
                      <td>{row.Cell_ID}</td>
                      <td>{row.Type}</td>
                      <td>{row.Electrode_ID}</td>
                      <td>{row.Weight}</td>
                      <td>{row.Moisture}</td>
                      <td>{row.Thickness}</td>
                      <td>{row.Density}</td>
                      <td>{row.IR_Temp_1}</td>
                      <td>{row.IR_Temp_2}</td>
                      <td>{row.Chain_Speed}</td>
                      <td>{row.Zone_Temp_1}</td>
                      <td>{row.Zone_Temp_2}</td>
                      <td>{row.Humidity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BatteryTraceByDate;
