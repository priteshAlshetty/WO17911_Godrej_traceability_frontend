import React, { useState, useRef } from "react";
import axios from "axios";
import "./CSS/BatteryTables.css";
import downloadPDF from "../utils/downloadPdf";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BatteryTable = () => {
  const [data, setData] = useState([]);
  const [batteryOCV, setBatteryOCV] = useState("");
  const [manufacturedTime, setManufacturedTime] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState("battery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [electrodeData, setElectrodeData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  // Fetch Battery or Cell suggestions
  const fetchSuggestions = async (searchText) => {
    if (!searchText) return;

    try {
      if (searchType === "battery") {
        const res = await fetch(`${API_BASE_URL}/batteryIds`);
        const result = await res.json();
        if (result?.result?.DBStatus) {
          setSuggestions(
            result.result.Data.filter((item) =>
              item.battery_id.toLowerCase().includes(searchText.toLowerCase())
            )
          );
        }
      } else if (searchType === "cell") {
        const res = await fetch(`${API_BASE_URL}/cellIds`);
        const result = await res.json();
        if (result?.result?.DBStatus) {
          setSuggestions(
            result.result.Data.filter((item) =>
              item.cell_id.toLowerCase().includes(searchText.toLowerCase())
            )
          );
        }
      }
    } catch (err) {
      console.error("Suggestion fetch error:", err);
      setSuggestions([]);
    }
  };

  const fetchData = async (id) => {
    setLoading(true);
    setError("");
    setData([]);
    setBatteryOCV("");
    setManufacturedTime(null);
    setElectrodeData([]);

    try {
      const endpoint =
        searchType === "battery"
          ? `${API_BASE_URL}/trace/battery-id`
          : searchType === "cell"
          ? `${API_BASE_URL}/trace/cell-id`
          : `${API_BASE_URL}/trace/electrode-id`;

      const postData =
        searchType === "battery"
          ? { battery_id: id }
          : searchType === "cell"
          ? { cell_id: id }
          : { electrode_id: id };

      const traceRes = await axios.post(endpoint, postData);
      const trace = traceRes.data.trace;

      if (!trace || !trace.cell_data || trace.cell_data.length === 0) {
        setError("No data found.");
        setLoading(false);
        return;
      }

      // Build battery/cell table
      const formattedData = trace.cell_data.map((cell, index) => {
        const cellData = cell.data || {};
        return {
          "Sr. Nos": index + 1,
          "Battery ID": trace.battery_id || "Null",
          "Battery OCV": trace.battery_ocv || "Null",
          "Manufactured Time": new Date(trace.manufactured_timestamp),
          "cell ID": cell.cell_id || "Null",
          "Testing time": cellData.testing_timestamp
            ? new Date(cellData.testing_timestamp).toLocaleString()
            : "",
          "OCV": cellData.cell_ocv || "Null",
          "IR": cellData.cell_ir || "Null",
          "HRD": cellData.cell_hrd || "Null",
          "filling date and time": cellData.filling_datetime
            ? new Date(cellData.filling_datetime).toLocaleString()
            : "Null",
          "Dry weight": cellData.dry_weight || "Null",
          "Filled qty": cellData.filled_weight || "Null",
          "Jelly roll weight": cellData.jelly_roll_wt || "Null",
          "Jelly roll dia": cellData.jelly_roll_dia || "Null",
        };
      });

      // Build electrode table (always from cell_data)
      const electrodeFormatted = trace.cell_data
        .flatMap((cell, cellIndex) => {
          const electrodeDataArray = cell.electrode_data || [];
          return electrodeDataArray.map((item, index) => {
            const isAnode = item.anode_data !== undefined;
            const ele = isAnode ? item.anode_data : item.cathode_data;
            if (!ele) return null;
            return {
              Sr: cellIndex * 2 + index + 1,
              Cell_ID: cell.cell_id || "Null",
              Type: isAnode ? "Anode" : "Cathode",
              electrode_id: ele.electrode_id || "Null",
              weight: ele.weight || "Null",
              moisture: ele.moisture || "Null",
              thickness: ele.thickness || "Null",
              density: ele.density || "Null",
              IR_temp_1: ele.IR_temp_1 || "Null",
              IR_Temp_2: ele.IR_Temp_2 || "Null",
              chain_speed: ele.chain_speed || "Null",
              zone_temp_1: ele.zone_temp_1 || "Null",
              zone_temp_2: ele.zone_temp_2 || "Null",
              humidity: ele.humidity || "Null",
            };
          });
        })
        .filter(Boolean);

      setBatteryOCV(trace.battery_ocv);
      setManufacturedTime(new Date(trace.manufactured_timestamp));
      setData(formattedData);
      setElectrodeData(electrodeFormatted);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const mergedIndices = (key) => {
    const map = {};
    data.forEach((row, idx) => {
      if (!map[row[key]]) map[row[key]] = { start: idx, count: 1 };
      else map[row[key]].count += 1;
    });
    return map;
  };

  const batteryIDMap = mergedIndices("Battery ID");
  const ocvMap = mergedIndices("Battery OCV");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      setError("Please enter an ID");
      return;
    }
    fetchData(searchInput.trim());
  };

  const handleDownloadPDF = () => {
    downloadPDF("#pdf-content", "battery_report");
  };

  return (
    <div className="table-container">
      <h2>Traceability by ID</h2>

      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "1rem", position: "relative" }}
      >
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        >
          <option value="battery">Battery ID</option>
          <option value="cell">Cell ID</option>
          <option value="electrode">Electrode ID</option>
        </select>

        <input
          type="text"
          placeholder={`Enter ${searchType.charAt(0).toUpperCase() + searchType.slice(1)} ID`}
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (value.length >= 2) debounceRef.current = setTimeout(() => fetchSuggestions(value), 400);
            else setSuggestions([]);
          }}
          style={{ padding: "0.5rem", fontSize: "1rem", width: "200px", border: "none" }}
        />

        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              border: "1px solid #ccc",
              position: "absolute",
              width: "200px",
              background: "white",
              maxHeight: "150px",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setSearchInput(searchType === "battery" ? item.battery_id : item.cell_id);
                  setSuggestions([]);
                }}
                style={{ padding: "8px", cursor: "pointer" }}
              >
                {searchType === "battery" ? item.battery_id : item.cell_id}
              </li>
            ))}
          </ul>
        )}

        <button className="search_btn" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {!loading && (data.length > 0 || electrodeData.length > 0) && (
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button className="downlaod-report" onClick={handleDownloadPDF} style={{ marginBottom: "1rem" }}>
            Download Report
          </button>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Report content wrapped for PDF download */}
      {!loading && (data.length > 0 || electrodeData.length > 0) && (
        <div id="pdf-content">
          <div className="pdf-header-only" style={{ display: "none", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <img src="/src/assets/goderej_and_multiquadrant_logo.jpeg" alt="Logo" style={{ height: "60px" }} />
              <div style={{ flex: 1 }}></div>
              <h2 style={{ margin: 0, fontSize: "14px", whiteSpace: "nowrap" }}>
                Report Generated at: {new Date().toLocaleString()}
              </h2>
            </div>
            <hr style={{ marginTop: "10px", border: "1px solid #000", width: "100%" }} />
            <h1 style={{ textAlign: "center", marginTop: "10px" }}>Traceability by ID Report</h1>
          </div>
          {/* Battery Table */}
          {data.length > 0 && (
            <>
              <p><strong>Battery OCV:</strong> {batteryOCV}</p>
              <p><strong>Manufactured Time:</strong> {manufacturedTime?.toLocaleString()}</p>
              <table className="battery-table">
                <thead>
                  <tr>
                    <th rowSpan={2}>Sr. Nos</th>
                    <th rowSpan={2}>Battery ID</th>
                    <th rowSpan={2}>Battery OCV</th>
                    <th rowSpan={2}>Cell ID</th>
                    <th colSpan={4}>Testing Parameters</th>
                    <th colSpan={3}>Filling Parameters</th>
                    <th colSpan={2}>Assembly Parameters</th>
                  </tr>
                  <tr>
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
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row["Sr. Nos"]}</td>
                      {batteryIDMap[row["Battery ID"]]?.start === idx && (
                        <td rowSpan={batteryIDMap[row["Battery ID"]].count}>{row["Battery ID"]}</td>
                      )}
                      {ocvMap[row["Battery OCV"]]?.start === idx && (
                        <td rowSpan={ocvMap[row["Battery OCV"]].count}>{row["Battery OCV"]}</td>
                      )}
                      <td>{row["cell ID"]}</td>
                      <td>{row["Testing time"]}</td>
                      <td>{row["OCV"]}</td>
                      <td>{row["IR"]}</td>
                      <td>{row["HRD"]}</td>
                      <td>{row["filling date and time"]}</td>
                      <td>{row["Dry weight"]}</td>
                      <td>{row["Filled qty"]}</td>
                      <td>{row["Jelly roll weight"]}</td>
                      <td>{row["Jelly roll dia"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Electrode Table */}
          {electrodeData.length > 0 && (
            <>
              <h3 style={{ marginTop: "2rem" }}>Electrode Data (Anode / Cathode)</h3>
              <table className="battery-table">
                <thead>
                  <tr>
                    <th>Sr</th>
                    <th>Cell Id</th>
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
                      <td>{row.electrode_id}</td>
                      <td>{row.weight}</td>
                      <td>{row.moisture}</td>
                      <td>{row.thickness}</td>
                      <td>{row.density}</td>
                      <td>{row.IR_temp_1}</td>
                      <td>{row.IR_Temp_2}</td>
                      <td>{row.chain_speed}</td>
                      <td>{row.zone_temp_1}</td>
                      <td>{row.zone_temp_2}</td>
                      <td>{row.humidity}</td>
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

export default BatteryTable;