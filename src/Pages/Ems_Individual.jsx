import { useEffect, useState } from "react";
import { getMeterData } from "../assets/api_integration/Individual_rawdata.js";
import "./MeterDashboard.css";


// import { ImPower } from "react-icons/im";

import StatGroup from "../Components/devlopment_components/StatGroup.jsx";
import MeterChart from "../Components/devlopment_components/MeterChart.jsx";
import BarChart from "../Components/devlopment_components/BarChart.jsx";


export default function MeterDashboard({ meterId, date }) {

  const [data, setData] = useState(null);
  const [selectedChart, setSelectedChart] = useState('Voltages');
  const [selectedMeter, setSelectedMeter] = useState('HT1METER5');
const [selectedDate, setSelectedDate] = useState('');  
const [meters, setMeters] = useState([]);
const [searchMeter, setSearchMeter] = useState('    ');
const [searchDate, setSearchDate] = useState('2026-03-12');


const handleSearch = async () => {

  if (!selectedMeter || !selectedDate) {
    alert("Please select meter and date");
    return;
  }

  try {

    const res = await getMeterData({
      meterId: selectedMeter,
      date: selectedDate
    });

    // check if valid data exists
    if (
      !res ||
      !res.latest_reading ||
      !res.continues_readings ||
      !res.avg_reading ||
      !res.continues_readings.date_time ||
      res.continues_readings.date_time.length === 0
    ) {
      alert("No data found for selected meter and date");
      return; // stop here → state will NOT change
    }

    // if data valid → update states
    setSearchMeter(selectedMeter);
    setSearchDate(selectedDate);
    setData(res);

  } catch (error) {
    console.error("API error:", error);
    alert("Failed to fetch data");
  }
};

useEffect(() => {

  async function loadMeters() {
    try {
      const res = await fetch("http://localhost:3000/api/ems/navigation/all/meters");
      const json = await res.json();

      setMeters(json.data);
    } catch (err) {
      console.error("Failed to load meters", err);
    }
  }

  loadMeters();

}, []);

useEffect(() => {

  if (!searchMeter || !searchDate) return;

  async function loadData() {

    const res = await getMeterData({
      meterId: searchMeter,
      date: searchDate
    });

    setData(res);
  }

  loadData();

}, [searchMeter, searchDate]);

  if (!data) return <div>Loading...</div>;

const latest = data?.latest_reading || {};
const cont = data?.continues_readings || {};
const avg = data?.avg_reading || {};

  const getChartData = (type) => {
    switch (type) {
      case 'Voltages':
        return {
          title: 'Voltage Trend',
          series: [
            { name: 'V1', data: cont.voltage_v1 },
            { name: 'V2', data: cont.voltage_v2 },
            { name: 'V3', data: cont.voltage_v3 }
          ],
          yTitle: 'Voltage (V)'
        };
      case 'Currents':
        return {
          title: 'Current Trend',
          series: [
            { name: 'C1', data: cont.current_i1 },
            { name: 'C2', data: cont.current_i2 },
            { name: 'C3', data: cont.current_i3 }
          ],
          yTitle: 'Current (Amp)'
        };
      case 'Frequency':
        return {
          title: 'Frequency Trend',
          series: [
            { name: 'Frequency', data: cont.frequency }
          ],
          yTitle: 'Frequency (Hz)'
        };
      case 'Power Factor':
        return {
          title: 'Power Factor Trend',
          series: [
            { name: 'Power Factor', data: cont.power_factor }
          ],
          yTitle: 'Power Factor'
        };
      case 'Power':
        return {
          title: 'Power Trend',
          series: [
            { name: 'Active Power', data: cont.active_power },
            { name: 'Apparent Power', data: cont.apparent_power },
            { name: 'Reactive Power', data: cont.reactive_power }
          ],
          yTitle: 'Power (kW/kVA/kVAR)'
        };
      case 'Demand':
        return {
          title: 'Demand Trend',
          series: [
            { name: 'kW Demand', data: cont.kw_demand }
          ],
          yTitle: 'Demand (kW)'
        };
      case 'Active Energy':
        return {
          title: 'Active Energy Trend',
          series: [
            { name: 'Active Energy', data: cont.active_energy }
          ],
          yTitle: 'Energy (kWh)'
        };
      case 'Harmonics':
        return {
          title: 'Harmonics Trend',
          series: [
            { name: 'THD V', data: cont.thd_v },
            { name: 'THD I', data: cont.thd_i }
          ],
          yTitle: 'THD (%)'
        };
      default:
        return {
          title: 'Voltage Trend',
          series: [
            { name: 'V1', data: cont.voltage_v1 },
            { name: 'V2', data: cont.voltage_v2 },
            { name: 'V3', data: cont.voltage_v3 }
          ],
          yTitle: 'Voltage (V)'
        };
    }
  };

  const chartData = getChartData(selectedChart);

  return (
    <div className="aa"><video autoPlay loop muted playsInline className="video-background">
      <source src="/backgroundvideo.mp4" type="video/mp4" />
    </video>
      <div className="headerbar">

        <div className="logo-vishakha"><img src="/vishakha.jpg" alt="" /></div>
       <div className="date-selection">

<select className="meter-selection-dropdown"
  value={selectedMeter}
  onChange={(e) => setSelectedMeter(e.target.value)}
>
  <option value="">Select Meter</option>

  {meters.map((meter) => (
    <option key={meter} value={meter}>
      {meter}
    </option>
  ))}

</select>

<input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
/>

<button onClick={handleSearch}>
  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#3148ac"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
</button>

</div>
        <div className="id_info"><h4>
Panel:{data.panel_id} | Meter: {data.meter_id} | Date: {data.date}
</h4>  </div>
        <div className="logo-mq"><img src="/multiquadrant.jpg" alt="" /></div>
      </div>

      <div className="card-parameter">
 
     <StatGroup
    title="Voltages" 
  items={[
    { label: "V1", value: latest.voltage_v1, unit: "V" },
    { label: <>V1 <span className="Avg-label">Avg</span></>, value: avg.voltage_v1, unit: "V" },

    { label: "V2", value: latest.voltage_v2, unit: "V" },
    { label: <>V2 <span className="Avg-label">Avg</span></>, value: avg.voltage_v2, unit: "V" },

    { label: "V3", value: latest.voltage_v3, unit: "V" },
    { label: <>V3 <span className="Avg-label">Avg</span></>, value: avg.voltage_v3, unit: "V" },
  ]}
/>


        <StatGroup
          title="Currents"
          items={[
            { label: "I1", value: latest.current_i1, unit: "Amp" },
            { label: <>I1 <span className="Avg-label">Avg</span></>, value: avg.current_i1, unit: "Amp" },
            { label: "I2", value: latest.current_i2, unit: "Amp" },
            { label: <>I2 <span className="Avg-label">Avg</span></>, value: avg.current_i2, unit: "Amp" },
            { label: "I3", value: latest.current_i3, unit: "Amp" },
            { label: <>I3 <span className="Avg-label">Avg</span></>, value: avg.current_i3, unit: "Amp" },
          ]}
        />
        <StatGroup
          title="Frequency"
          items={[
            { label: "Frequency", value: latest.frequency, unit: "Hz" },
            { label: <>Frequency <span className="Avg-label">Avg</span></>, value: avg.frequency, unit: "Hz" },

          ]}
        />
        <StatGroup
          title="Power Factor"
          items={[
            { label: "Power Factor", value: latest.power_factor, unit: "" },
            { label: <>Power Factor <span className="Avg-label">Avg</span></>, value: avg.power_factor, unit: "" },

          ]}
        />
        {/* ////////////////////// */}
        <StatGroup
          title="Power"
          items={[
            { label: "Active Power", value: latest.active_power, unit: "kW" },
              { label: <>Active Power <span className="Avg-label">Avg</span></>, value: avg.active_power, unit: "kW" },
            { label: "Apparent Power", value: latest.apparent_power, unit: "kVA" },
              { label: <>Apparent Power <span className="Avg-label">Avg</span></>, value: avg.apparent_power, unit: "kVA" },
            { label: "Reactive Power", value: latest.reactive_power, unit: "kVAR" },
              { label: <>Reactive Power <span className="Avg-label">Avg</span></>, value: avg.reactive_power, unit: "kVAR" },
          ]}
        />
        <StatGroup
          title="Demand"
          items={[
            { label: "kw demand", value: latest.kw_demand, unit: "kW" },
            { label: <>kw demand <span className="Avg-label">Avg</span></>, value: avg.kw_demand, unit: "kW" },

          ]}
        />
        <StatGroup
          title="Active Energy"
          items={[
            { label: "Active Energy", value: latest.active_energy, unit: "kWh" },
            { label: <>Active Energy <span className="Avg-label">Avg</span></>, value: avg.active_energy, unit: "kWh" },

          ]}
        />
        <StatGroup
          title="Harmonics"
          items={[
            { label: "THD V", value: latest.thd_v, unit: "%" },
            { label: <>THD V <span className="Avg-label">Avg</span></>, value: avg.thd_v, unit: "%" },
            { label: "THD I", value: latest.thd_i, unit: "%" },
            { label: <>THD I <span className="Avg-label">Avg</span></>, value: avg.thd_i, unit: "%" },
          ]}
        />

      </div>
<div className="chart-select"><div className="chart-selection-btn">
  <button 
    onClick={() => setSelectedChart('Voltages')}
    style={{ backgroundColor: selectedChart === 'Voltages' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Voltages' ? 'white' : 'black' }}
  >Voltages</button>
  <button 
    onClick={() => setSelectedChart('Currents')}
    style={{ backgroundColor: selectedChart === 'Currents' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Currents' ? 'white' : 'black' }}
  >Currents</button>
  <button 
    onClick={() => setSelectedChart('Frequency')}
    style={{ backgroundColor: selectedChart === 'Frequency' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Frequency' ? 'white' : 'black' }}
  >Frequency</button>
  <button 
    onClick={() => setSelectedChart('Power Factor')}
    style={{ backgroundColor: selectedChart === 'Power Factor' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Power Factor' ? 'white' : 'black' }}
  >Power Factor</button>
  <button 
    onClick={() => setSelectedChart('Power')}
    style={{ backgroundColor: selectedChart === 'Power' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Power' ? 'white' : 'black' }}
  >Power</button>
  <button 
    onClick={() => setSelectedChart('Demand')}
    style={{ backgroundColor: selectedChart === 'Demand' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Demand' ? 'white' : 'black' }}
  >Demand</button>
  <button 
    onClick={() => setSelectedChart('Active Energy')}
    style={{ backgroundColor: selectedChart === 'Active Energy' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Active Energy' ? 'white' : 'black' }}
  >Active Energy</button>
  <button 
    onClick={() => setSelectedChart('Harmonics')}
    style={{ backgroundColor: selectedChart === 'Harmonics' ? '#007bff' : '#f8f9fa', color: selectedChart === 'Harmonics' ? 'white' : 'black' }}
  >Harmonics</button>

</div></div>
      <MeterChart
        title={chartData.title}
        x={cont.date_time}
        series={chartData.series}
        yTitle={chartData.yTitle}
      />

<BarChart
  title={chartData.title}
  x={cont.date_time}
  series={chartData.series}
  yTitle={chartData.yTitle}
/>

    </div>
  );
}