import { useState } from "react";
import "./DownloadCSV.css";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DownloadCSV() {
  const [tableName, setTableName] = useState("anode_mixer");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  const tables = [
  {
    label: "Anode Mixer",
    value: "anode_mixer",
  },
  {
    label: "Anode Oven",
    value: "anode_oven",
  },
  {
    label: "Anode Thickness",
    value: "anode_thickness",
  },
  {
    label: "Cathode Oven",
    value: "cathode_oven",
  },
  {
    label: "Cathode Thickness",
    value: "cathod_thickness",
  },
  {
    label: "Laponite",
    value: "laponite",
  },
  {
    label: "Liquid Handling",
    value: "liquid_handling",
  },
  {
    label: "PHS Anode",
    value: "phs_anode",
  },
  {
    label: "PHS Cathode",
    value: "phs_cathode",
  },
  {
    label: "PLC 1",
    value: "plc_1",
  },
  {
    label: "PLC 2",
    value: "plc_2",
  },
  {
    label: "PLC 3",
    value: "plc_3",
  },
  {
    label: "Powder Handling",
    value: "powder_handling",
  },
  {
    label: "PVA Lamination",
    value: "pva_lamination",
  },
  {
    label: "Winding PLC",
    value: "winding_plc",
  },
];

  const handleDownload = async () => {
  if (!fromDate || !toDate) {
    alert("Please select both dates.");
    return;
  }

  try {
    setLoading(true);

    const url = `${API_BASE_URL}/download/csv?tableName=${tableName}&from=${fromDate}&to=${toDate}`;

    const response = await fetch(url);

    if (response.status === 404) {
      alert("No machine data found for the selected date range.");
      return;
    }

    if (!response.ok) {
      throw new Error("Download failed");
    }

    const blob = await response.blob();

    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${tableName}_${fromDate}_to_${toDate}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);

    // Optional success message
    // alert("CSV downloaded successfully.");

  } catch (err) {
    console.error(err);
    alert("Something went wrong while downloading the CSV.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="csvDownloader-wrapper">
      <div className="csvDownloader-card">

        <h2 className="csvDownloader-title">
          Download CSV Report
        </h2>

        <div className="csvDownloader-field">
          <label>Table Name</label>

          <select
            className="csvDownloader-input"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          >
            {tables.map((table) => (
              <option key={table.value} value={table.value}>
                {table.label}
              </option>
            ))}
          </select>
        </div>

        <div className="csvDownloader-field">
          <label>From Date</label>

          <input
            className="csvDownloader-input"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="csvDownloader-field">
          <label>To Date</label>

          <input
            className="csvDownloader-input"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          className="csvDownloader-btn"
          onClick={handleDownload}
          disabled={loading}
        >
          {loading ? "Downloading..." : "Download CSV"}
        </button>

      </div>
    </div>
  );
}