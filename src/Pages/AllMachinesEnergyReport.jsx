
import { useState, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./AllMachinesEnergyReport.css";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AllMachinesEnergyReport() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  const handleSearch = async () => {
    if (!from || !to) return alert("Select From and To date");
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/mfm/energyData/AllMachines`,
        { params: { from, to } }
      );
      setChartData(res.data.data || {});
    } catch (e) {
      console.error(e);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!Object.keys(chartData).length) return;
    let csv = "Machine,Consumption (kWh)\n";
    Object.entries(chartData).forEach(([k,v]) => csv += `${k},${v}\n`);
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`AllMachines_${from}_to_${to}.csv`;
    a.click();
  };

  const downloadChart=()=>{
    if(!chartRef.current) return;
    const a=document.createElement("a");
    a.download=`AllMachines_${from}_to_${to}.png`;
    a.href=chartRef.current.toBase64Image();
    a.click();
  };

  const downloadPDF = async()=>{
    if(!Object.keys(chartData).length) return;
    const canvas=await html2canvas(chartRef.current.canvas,{backgroundColor:"#fff",scale:2});
    const img=canvas.toDataURL("image/png");
    const pdf=new jsPDF("landscape","mm","a4");
    pdf.setFontSize(18);
    pdf.text("ALL MACHINES ENERGY REPORT",148,15,{align:"center"});
    pdf.setFontSize(11);
    pdf.text(`Date Range : ${from} To ${to}`,10,25);
    pdf.text(`Generated : ${new Date().toLocaleString()}`,287,25,{align:"right"});
    pdf.addImage(img,"PNG",10,35,270,140);
    pdf.save(`AllMachines_${from}_to_${to}.pdf`);
  };

  const data={
    labels:Object.keys(chartData).map(v=>v.replaceAll("_"," ")),
    datasets:[{
      label:"Consumption (kWh)",
      data:Object.values(chartData),
      backgroundColor:[
        "#2563eb"
        
      ],
      borderWidth:1
    }]
  };

  const options={
    responsive:true,
    maintainAspectRatio:false,
    plugins:{
      legend:{display:false},
      title:{display:true,text:"Machine-wise Energy Consumption"}
    },
    scales:{
     y: {
  type: "logarithmic",

  ticks: {
    callback(value) {
      return value.toLocaleString();
    }
  }
},
      x:{ticks:{maxRotation:45,minRotation:45}}
    }
  };

  return (
    <div className="energy-page">
      <h3>All Machines Energy Report</h3>
      <div className="toolbar">
        <div className="input-group">
          <label>From</label>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
        </div>

        <div className="input-group">
          <label>To</label>
          <input type="date" value={to} onChange={e=>setTo(e.target.value)}/>
        </div>

        <button onClick={handleSearch}>Search</button>
        <button disabled={!Object.keys(chartData).length} onClick={downloadPDF}>Download PDF</button>
        <button disabled={!Object.keys(chartData).length} onClick={exportCSV}>Export CSV</button>
        <button disabled={!Object.keys(chartData).length} onClick={downloadChart}>Download PNG</button>
      </div>

      <div className="chart-container chart_container_all_machines">
        {loading ? <h3>Loading...</h3> :
          Object.keys(chartData).length ?
          <Bar ref={chartRef} data={data} options={options}/> :
          <h2>No Data Available</h2>}
      </div>
    </div>
  );
}
