

import React, { useState, useEffect } from "react";
import axios from 'axios';
import './CSS/traceability.css';
import downloadPDF from '../utils/downloadPdf'; 
import Select from "react-select";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BatchSearch = () => {
  const [batchId, setBatchId] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [batchOptions, setBatchOptions] = useState([]);
  

  useEffect(() => {
  fetchBatchIds();
}, []);

const fetchBatchIds = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/batchIds`);

    if (res.data?.result?.DBStatus) {
      const options = res.data.result.Data
        .filter(
          (item) =>
            item.batch_id &&
            item.batch_id !== "null" &&
            item.batch_id !== "undefined"
        )
        .map((item) => ({
          value: item.batch_id,
          label: item.batch_id,
        }));

      setBatchOptions(options);
    }
  } catch (err) {
    console.log(err);
  }
};

  const handleSearch = async () => {
     if (!batchId) {
    alert("Please select Batch ID");
    return;
  }
    setError('');
    setBatchData(null);
    setLoading(true);

    const minLoading = new Promise((resolve) => setTimeout(resolve, 2000)); // minimum 2s loading

    try {
      const responsePromise = axios.post(`${API_BASE_URL}/trace/batch-id`, {
        batch_id: batchId,
      });

      const [response] = await Promise.all([responsePromise, minLoading]);

      console.log('Full API Response:', response.data);

      if (response.data?.result?.SUCCESS) {
        setBatchData(response.data.result.batch_data);
      } else {
        setError('No data found or batch ID is incorrect.');
      }
    } catch (err) {
      setError('No data found or batch ID is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (title, dataObj) => (
    <div className="card">
      <h3>{title}</h3>
      <table>
        <tbody>
          {Object.entries(dataObj).map(([key, value]) => (
            <tr key={key}>
              <td style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleDownloadPDF = () => {
    downloadPDF('.card-container', 'batch_trace_report');
  };

  return (
    <div style={{ padding: '20px', margin: '0 auto', backgroundColor: '#ecefffc2' }}>
      <h2>Traceability by Batch</h2>

      <div style={{ marginBottom: '1rem' }}>
        
       <Select
  options={batchOptions}
  value={batchOptions.find((item) => item.value === batchId)}
  onChange={(selected) => setBatchId(selected?.value || "")}
  placeholder="Search Batch ID..."
  isClearable
  isSearchable
  styles={{
    container: (base) => ({
      ...base,
      width: 350,
      display: "inline-block",
      marginRight: "10px",
    }),
  }}
/>
        <button
  onClick={handleSearch}
  disabled={!batchId || loading}
  style={{
    backgroundColor: "#3182ce",
    color: "#fff",
    padding: "0.5rem 1rem",
    cursor: batchId ? "pointer" : "not-allowed",
    opacity: batchId ? 1 : 0.5,
    border: "none",
  }}
>
  Search
</button>
      </div>

      {loading && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <img
            src="/Animation_searching_pages.gif"
            alt="Loading..."
            width="300"
            style={{ mixBlendMode: 'multiply' }}
          />
          <p>Loading data, please wait...</p>
        </div>
      )}

      {error && !loading && <p style={{ color: 'red' }}>{error}</p>}

      {batchData && !loading && (
        <>
          {/* Download Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="downlaod-report"
              onClick={handleDownloadPDF}
              style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Download Report
            </button>
          </div>
  <h3 style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              Batch ID:{' '}
              <span style={{ color: '#fefeff' }}>{batchData.batch_id}</span>
            </h3>
          <div className="card-container">
            {/* Hidden PDF Header */}
           
<div className="header" style={{ width: '100%',display: 'flex',justifyContent: 'center',alignItems: 'center' }}> <div
              className="pdf-header-only"
              style={{display:'none' , marginBottom: '20px' }}
            >
              <div
                style={{
                  display: 'flex',width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {/* <img
                  src="/src/assets/goderej_and_multiquadrant_logo.jpeg"
                  alt="Logo"
                  style={{ height: '60px' }}
                /> */}
                <div style={{ flex: 1 }}><h1 style={{ textAlign: 'center', marginTop: '10px' }}>
                Batch Traceability Report
              </h1></div>
                 
               
              </div>
              {/* <hr
                style={{
                  marginTop: '10px',
                  border: '1px solid #000',
                  width: '100%',
                }}
              /> */}
              <h2
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Report Generated at: {new Date().toLocaleString()}
                </h2>
              <h4 style={{ textAlign: 'center' }}>
                Batch ID: {batchData.batch_id}
              </h4>
            </div></div>
          <div className="content"> {renderCard('Batch Parameters', {
              mixing_time: batchData.mixing_time ?? 'Null',
              ambient_temp: batchData.ambient_temp ?? 'Null',
              humidity: batchData.humidity ?? 'Null',
              final_paste_temp: batchData.final_paste_temp ?? 'Null',
              max_current: batchData.max_current ?? 'Null',
              max_torque: batchData.max_torque ?? 'Null',
              recipe_id: batchData.recipe_id ?? 'Null',
              Penetration: batchData.Penetration ?? 'Null',
              paste_moisture: batchData.paste_moisture ?? 'Null',
              paste_density: batchData.paste_density ?? 'Null',
            })}

            {renderCard('Batch Production Time', {
              batch_start: batchData.start_timestamp ?? 'Null',
              batch_completed: batchData.stop_timestamp ?? 'Null',
              total_time:
                batchData.total_time ??
                (batchData.stop_timestamp && batchData.start_timestamp
                  ? new Date(batchData.stop_timestamp) -
                    new Date(batchData.start_timestamp)
                  : 'Null'),
              batch_size: batchData.batch_size ?? 'Null',
              total_electrodes_produce:
                batchData.total_electrodes_produce ?? 'Null',
              electrode_type: batchData.electrode_type ?? 'Null',
            })}

            {renderCard('Batch Material Used', {
              water: batchData.water ?? 'Null',
              teflon: batchData.teflon ?? 'Null',
              zinc_emd: batchData.zinc_emd ?? 'Null',
              graphite_indium: batchData.graphite_indium ?? 'Null',
              bismuth: batchData.bismuth ?? 'Null',
              laponite: batchData.laponite ?? 'Null',
              Bnb90: batchData.Bnb90 ?? 'Null',
              MX25: batchData.MX25 ?? 'Null',
            })}</div>

           
          </div>
        </>
      )}
    </div>
  );
};

export default BatchSearch;
