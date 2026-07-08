import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";
import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

import "./Energy_Graph.css";





ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function EnergyReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
// const chartRef = useRef(null);
const reportRef = useRef(null);
const [meterNames, setMeterNames] = useState([]);
const [meterName, setMeterName] = useState("");
const chartRef = useRef(null);
const currentChartRef = useRef(null);
const [searched, setSearched] = useState(false);
const [searchedMeter, setSearchedMeter] = useState("");
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

useEffect(() => {
  fetchMeterNames();
}, []);

const fetchMeterNames = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/mfm/meterNames`
    );

    setMeterNames(res.data.data);

    if (res.data.data.length > 0) {
      setMeterName(res.data.data[0]);
    }
  } catch (err) {
    console.log(err);
    alert("Failed to load meter names");
  }
};

  const handleSearch = async () => {
    setSearched(true);
    if (!from || !to) {
      alert("Select From and To date");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/mfm/energyData`,
        {
         params: {
    meterName,
    from,
    to,
}
        }
      );
setSearchedMeter(meterName);
      setChartData(res.data.data);
    } catch (err) {
      console.log(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (chartData.length === 0) return;

    const headers = Object.keys(chartData[0]).join(",");

    const rows = chartData.map((item) =>
      Object.values(item).join(",")
    );

    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "EnergyData.csv";
    a.click();
  };

const downloadPDF = () => {
  if (chartData.length === 0) {
    alert("No data available");
    return;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ===== Header =====
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("ENERGY REPORT", pageWidth / 2, 15, {
    align: "center",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.text(`Meter : ${(searchedMeter).toLocaleUpperCase()}`, 15, 25);
  pdf.text(`From : ${from}`, 15, 32);
  pdf.text(`To : ${to}`, 70, 32);

  pdf.text(
    `Generated : ${new Date().toLocaleString()}`,
    pageWidth - 15,
    25,
    { align: "right" }
  );

  pdf.line(10, 38, pageWidth - 10, 38);
  pdf.setTextColor(0, 0, 255);
  pdf.text(`${(meterName).toUpperCase()} - Total Consumption: ${totalConsumption.toFixed(2)} kWh`, 120, 44);
  pdf.setTextColor(0, 0, 0);

  // =========================
  // First Chart
  // =========================

const energyChart = chartRef.current;

const ctx = energyChart.ctx;

ctx.save();

ctx.globalCompositeOperation = "destination-over";
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, energyChart.width, energyChart.height);

const energyImg = energyChart.toBase64Image();

ctx.restore();
energyChart.update();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("Energy Consumption (kWh) vs Time", 15, 48);

  pdf.addImage(
    energyImg,
    "JPEG",
    10,
    52,
    190,
    70,
    undefined,
    "FAST"
  );

  // =========================
  // Second Chart
  // =========================

 const currentChart = currentChartRef.current;

const ctx2 = currentChart.ctx;

ctx2.save();

ctx2.globalCompositeOperation = "destination-over";
ctx2.fillStyle = "#ffffff";
ctx2.fillRect(0, 0, currentChart.width, currentChart.height);

const currentImg = currentChart.toBase64Image();

ctx2.restore();
currentChart.update();

  pdf.text("Current vs Time", 15, 135);

  pdf.addImage(
    currentImg,
    "JPEG",
    10,
    139,
    190,
    70,
    undefined,
    "FAST"
  );

  pdf.save(`Energy_Report_${from}_to_${to}.pdf`);
};
  const downloadChart = () => {
  if (!chartRef.current) return;

  const link = document.createElement("a");
  link.download = `EnergyChart_${from}_to_${to}.png`;
  link.href = chartRef.current.toBase64Image("image/png", 1);
  link.click();
};

  const data = {
    labels: chartData.map((d) => d.hour_time),

    datasets: [
      {
        label: "Consumption (kWh)",
        data: chartData.map((d) => d.consumption_kwh),
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const currentData = {
  labels: chartData.map((d) => d.hour_time),

  datasets: [
    {
      label: "Current I1",
      data: chartData.map((d) => d.current_i1),
      borderColor: "#ef4444",
      backgroundColor: "#ef4444",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 2,
    },
    {
      label: "Current I2",
      data: chartData.map((d) => d.current_i2),
      borderColor: "#22c55e",
      backgroundColor: "#22c55e",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 2,
    },
    {
      label: "Current I3",
      data: chartData.map((d) => d.current_i3),
      borderColor: "#3b82f6",
      backgroundColor: "#3b82f6",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 2,
    },
    {
  label: "Average Current",
  data: chartData.map((d) => d.current_avg),
  borderColor: "#000000",
  backgroundColor: "#000000",
  borderDash: [6, 6],
  borderWidth: 2,
  tension: 0.3,
  pointRadius: 2,
}
  ],
};

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
      },
    },

    scales: {
      x: {
        ticks: {
          maxRotation: 60,
          minRotation: 60,
        },
      },
    },
  };

  const currentOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    title: {
      display: true,
      text: "Current vs Time",
    },
    legend: {
      position: "top",
    },
  },

  scales: {
    x: {
      ticks: {
        maxRotation: 60,
        minRotation: 60,
      },
    },

    y: {
      title: {
        display: true,
        text: "Current (A)",
      },
    },
  },
};

const totalConsumption = chartData.reduce(
  (total, item) => total + (Number(item.consumption_kwh) || 0),
  0
);

  return (
    <div className="energy-page">
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  }}
>
  <h3>kWh Energy Graph</h3>

  {chartData.length > 0 && (
    <h2 className="kwh-total" style={{ color: "#fcfdff" }}>
     {(searchedMeter).toUpperCase()} -Total Consumption: {totalConsumption.toFixed(2)} kWh
    </h2>
  )}
</div>

    <div className="toolbar">

 <div className="input-group">
  <label>Meter Name</label>

  <select
    value={meterName}
    onChange={(e) => setMeterName(e.target.value)}
  >
    {meterNames.map((meter) => (
      <option key={meter} value={meter}>
        {meter}
      </option>
    ))}
  </select>
</div>
<div className="input-group">
    <label>From</label>

    <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
    />
</div>

  <div className="input-group">
    <label>To</label>
    <input
      type="date"
      value={to}
      onChange={(e) => setTo(e.target.value)}
    />
  </div>

  <button onClick={handleSearch}>
    Search
  </button>

  <button
    onClick={downloadPDF}
    disabled={chartData.length === 0}
  >
    Download PDF
  </button>

  <button
    onClick={exportCSV}
    disabled={chartData.length === 0}
  >
    Export CSV
  </button>

</div>
  <div ref={reportRef} className="chart-container">

  {loading ? (
    <div className="no-data">
      <h3>Loading...</h3>
    </div>
  ) : !searched ? (
    <div className="no-data">
      <h4>Please select Meter, From Date and To Date, then click Search.</h4>
    </div>
  ) : chartData.length === 0 ? (
    <div className="no-data">
      <h3>No Data Available</h3>
    </div>
  ) : (
    <>
      <div className="chart-box">
        <h3 className="chart-title-new">
          Energy Consumption (kWh) vs Time
        </h3>

        <Line
          ref={chartRef}
          data={data}
          options={options}
        />
      </div>

      <div className="chart-box">
        <h3 className="chart-title-new">
          Current vs Time
        </h3>

        <Line
          ref={currentChartRef}
          data={currentData}
          options={currentOptions}
        />
      </div>
    </>
  )}

</div>

    </div>
  );
}