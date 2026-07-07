


import React, { useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const parameterNames = {
  cell_ocv: 'OCV (V)',
  cell_ir: 'IR (µΩ)',
  cell_hrd: 'HRD',
  cell_dry_wt: 'Dry Weight (g)',
  cell_filled_wt: 'Filled Weight (g)',
  cell_jelly_roll_wt: 'Jelly Roll Weight (g)',
  cell_jelly_roll_dia: 'Jelly Roll Diameter (mm)'
};

const GraphsPage = () => {
  const [mode, setMode] = useState('battery'); // battery | timestamp | fillingTimestamp
  const [batteryId, setBatteryId] = useState('BAT1234');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [timestampData, setTimestampData] = useState(null);
  const [fillingTimestampData, setFillingTimestampData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBatteryData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/graph/cell-params/by-battery-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battery_id: batteryId })
      });
      const result = await res.json();
      if (result.success) {
        setGraphData(result.graphData);
      } else {
        alert('Battery ID fetch failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching battery data');
    }
    setLoading(false);
  };

  const fetchTimestampData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/graph/cell-params/by-testing-timestamp`, {
        From: from,
        To: to
      });
      setTimestampData(res.data.graphData);
    } catch (err) {
      console.error(err);
      alert('Error fetching timestamp data');
    }
    setLoading(false);
  };

  const fetchFillingTimestampData = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/graph/cell-params/by-filling-timestamp`, {
        From: from,
        To: to
      });
      setFillingTimestampData(res.data.graphData);
    } catch (err) {
      console.error(err);
      alert('Error fetching filling timestamp data');
    }
    setLoading(false);
  };

  const renderChart = (paramKey, dataSource) => {
    if (!dataSource) return null;

    const colorMap = {
      cell_ocv: '#5470C6',
      cell_ir: '#91CC75',
      cell_hrd: '#FAC858',
      cell_dry_wt: '#EE6666',
      cell_filled_wt: '#73C0DE',
      cell_jelly_roll_wt: '#3BA272',
      cell_jelly_roll_dia: '#FC8452'
    };

    const timestamps = dataSource.horizontal_axis.cell_timestamp;
    // const timestamps = dataSource.horizontal_axis.cell_timestamp || [];


    return (
      <div className="upload-box" key={paramKey} style={{ marginBottom: '20px' }}>
        <ReactECharts
          option={{
            title: { text: parameterNames[paramKey], left: 'center' },
            tooltip: {
              trigger: 'axis',
              // formatter: function (params) {
              //   const idx = params[0].dataIndex;
              //   const value = params[0].value;
              //   const timestamp = timestamps[idx];
              //   return `
              //     <b>${parameterNames[paramKey]}</b><br/>
              //     Value: ${value}<br/>
              //     Timestamp: ${timestamp}
              //   `;
              // }

              formatter: function (params) {
  const idx = params[0].dataIndex;
  const value = params[0].value;
  const timestamp = timestamps[idx] || 'N/A';
  return `
    <b>${parameterNames[paramKey]}</b><br/>
    Value: ${value}<br/>
    Timestamp: ${timestamp}
  `;
}

            },
            xAxis: {
              type: 'category',
              data: dataSource.horizontal_axis.cell_id_list,
              axisLabel: { rotate: 45 }
            },
            yAxis: {
              type: 'value',
              name: parameterNames[paramKey]
            },
            series: [
              {
                name: parameterNames[paramKey],
                type: 'line',
                data: dataSource.vertial_axis_dataPoints[paramKey],
                smooth: true,
                lineStyle: {
                  color: colorMap[paramKey]
                },
                itemStyle: {
                  color: colorMap[paramKey]
                }
              }
            ]
          }}
          style={{ height: '300px', width: '100%' }}
        />
      </div>
    );
  };

  return (
    <div className="upload-container">
      <div className="content-wrapper">
        <h2> Graph Viewer</h2>

        {/* Toggle Mode */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'battery' ? 'active' : ''}`}
            onClick={() => setMode('battery')}
          >
            Graph by Battery ID
          </button>
          <button
            className={`mode-btn ${mode === 'timestamp' ? 'active' : ''}`}
            onClick={() => setMode('timestamp')}
          >
            Graph by Testing Timestamp
          </button>
          <button
            className={`mode-btn ${mode === 'fillingTimestamp' ? 'active' : ''}`}
            onClick={() => setMode('fillingTimestamp')}
          >
            Graph by Filling Timestamp
          </button>
          {/* <button
            className={`mode-btn ${mode === 'histogram' ? 'active' : ''}`}
            onClick={() => setMode('histogram')}
          >
            Histogram
          </button> */}
        </div>

        {/* Battery ID Input Mode */}
        {mode === 'battery' && (
          <div className="upload-box">
            <div className="manual-section">
              <label>
                Battery ID
                <input
                  type="text"
                  value={batteryId}
                  onChange={(e) => setBatteryId(e.target.value)}
                  placeholder="e.g., BAT1234"
                />
              </label>
              <button className="upload-btn" onClick={fetchBatteryData} disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>

            {graphData && (
              <>
                <h3 style={{ textAlign: 'center', marginTop: '20px' }}>
                  Battery ID: {graphData.battery_id}
                </h3>
                {Object.keys(parameterNames).map((key) => renderChart(key, graphData))}
              </>
            )}
          </div>
        )}

        {/* Timestamp Input Mode */}
        {mode === 'timestamp' && (
          <div className="upload-box">
            <div className="manual-section">
              <label>
                From
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              <button className="upload-btn" onClick={fetchTimestampData} disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>

            {timestampData && (
              <>
                {Object.keys(parameterNames).map((key) => renderChart(key, timestampData))}
              </>
            )}
          </div>
        )}

        {/* Filling Timestamp Input Mode */}
        {mode === 'fillingTimestamp' && (
          <div className="upload-box">
            <div className="manual-section">
              <label>
                From
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
              <button className="upload-btn" onClick={fetchFillingTimestampData} disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>

            {fillingTimestampData && (
              <>
                {Object.keys(parameterNames).map((key) => renderChart(key, fillingTimestampData))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
  {mode === 'histogram' && (
          <div className="upload-box">
            <h2>histogram Data</h2>
          </div>)}
};




export default GraphsPage;
