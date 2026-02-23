import React, { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import "../Pages/CSS/Machinewise_Data.css";

import machineNames from "../data/machinenames";
import MACHINE_MAP from "../data/machinemap";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const MachineDataPage = () => {
  const [machineName, setMachineName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tableData, setTableData] = useState([]);

  const handleGetData = async () => {
  // 🔹 Validation
  if (!machineName) {
    alert("Please select a machine.");
    return;
  }

  if (!startDate) {
    alert("Please select a start date.");
    return;
  }

  if (!endDate) {
    alert("Please select an end date.");
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    alert("Start date cannot be greater than End date.");
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/machinewisedata`,
      { machineName, startDate, endDate }
    );

    const result = response.data?.result?.Data;

    if (!result) {
      alert("No data found for selected filters.");
      setTableData([]);
      return;
    }

    const config = MACHINE_MAP[machineName];

    let bodyData = [];
    if (config?.electrode.length) {
      bodyData = result.electrode_data || [];
    } else if (config?.batch_main.length) {
      bodyData = result.batch_main_data || [];
    } else if (config?.cell_main.length) {
      bodyData = result.cell_main_data || [];
    } else if (config?.battery_main.length) {
      bodyData = result.battery_main_data || [];
    }

    if (bodyData.length === 0) {
      alert("No records available for selected date range.");
    }

    setTableData(bodyData);
  } catch (err) {
    console.error(err);
    alert("Something went wrong while fetching data.");
  }
};


const downloadPDF = () => {
    if (!machineName) {
    alert("Please select a machine before downloading.");
    return;
  }

  if (!startDate || !endDate) {
    alert("Please select date range before downloading.");
    return;
  }

  if (tableData.length === 0) {
    alert("Click Get Data or there is No data available to download.");
    return;
  }
  if (!machineName || tableData.length === 0) return;

  const config = MACHINE_MAP[machineName] || {};
  const doc = new jsPDF({ orientation: "landscape" });

  // get page width
  const pageWidth = doc.internal.pageSize.getWidth();

  // small header at top right
  // doc.setFontSize(8);
  // doc.text(
  //   "Developed by Multiquadrant Industrial Controls (I) Pvt. Ltd",
  //   pageWidth - 10,
  //   10,
  //   { align: "right" }
  // );

  // Generate a human‑readable timestamp string
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const formattedTimestamp = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

  // report header
  doc.setFontSize(12);
  doc.text(`Report Generated At: ${formattedTimestamp}`, 14, 20);
  doc.text(`Machine Name: ${machineName}`, 14, 27);
  doc.text(`Date From: ${startDate}`, 14, 34);
  doc.text(`Date To: ${endDate}`, 14, 41);

  const columns = [
    ...(config.batch_main || []),
    ...(config.cell_main || []),
    ...(config.battery_main || []),
    ...(config.electrode || []),
  ];

  const rows = tableData.map((item) =>
    columns.map((col) => item[col] ?? "-")
  );

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 50, // leave space for header text
  });

  const filename = `Report Generated at : ${formattedTimestamp}.pdf`;
  doc.save(filename);
};


  const columnsToRender = machineName
    ? [
        ...MACHINE_MAP[machineName].batch_main,
        ...MACHINE_MAP[machineName].cell_main,
        ...MACHINE_MAP[machineName].battery_main,
        ...MACHINE_MAP[machineName].electrode,
      ]
    : [];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{textAlign:"center"}}>Machine wise Data</h2>
      {/* Top Form Area */}
      <div className="form-container">
        <select
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
        >
          <option value="">Select Machine</option>
          {machineNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button className="button" onClick={handleGetData}>
          Get Data
        </button>

        {/* Download Button Pushed Right */}
        <div className="download-container">
          <button className="button" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>
      </div>

      {tableData.length > 0 && (
        <div className="table-scroll-container">
          <table className="table">
            <thead>
              <tr>
                {columnsToRender.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, idx) => (
                <tr key={idx}>
                  {columnsToRender.map((col) => (
                    <td key={col}>{item[col] ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MachineDataPage;
