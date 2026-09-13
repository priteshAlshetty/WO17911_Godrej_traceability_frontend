import React, { useState, useEffect } from "react";
import axios from 'axios';
import './CSS/traceability.css';
import downloadPDF from '../utils/downloadPdf'; 
import Select from "react-select";
import { FiDownload } from "react-icons/fi";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Returns today's date as a 'yyyy-MM-dd' string, the format <input type="date"> requires
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Shared visual styling so every card on this page looks identical
const CARD_STYLE = {
  margin: '20px auto',
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  // no overflow:hidden here — it would clip dropdowns (e.g. react-select's menu)
  // that need to render outside the card's own bounds
};

const CARD_HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  padding: '18px 24px',
  backgroundColor: '#eef2ff',
  cursor: 'pointer',
  userSelect: 'none',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
};

const CARD_TITLE_STYLE = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 700,
  color: '#1e293b',
};

const CARD_BODY_STYLE = {
  padding: '24px',
  borderBottomLeftRadius: '12px',
  borderBottomRightRadius: '12px',
};

// A collapse/expand toggle: a circular button with a chevron that rotates based on open state
const CollapseToggle = ({ isOpen }) => (
  <span
    aria-hidden="true"
    style={{
      flexShrink: 0,
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      background: '#ffffff',
      border: '1px solid #cbd5e1',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      transition: 'transform 0.2s ease',
      transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </span>
);

// A card with a clickable header (title + chevron) that shows/hides its body content
const CollapsibleCard = ({ id, title, isOpen, onToggle, minBodyHeight, children }) => (
  <div id={id} style={CARD_STYLE}>
    <div
      style={CARD_HEADER_STYLE}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <h2 style={CARD_TITLE_STYLE}>{title}</h2>
      <CollapseToggle isOpen={isOpen} />
    </div>
    {isOpen && (
      <div style={{ ...CARD_BODY_STYLE, minHeight: minBodyHeight || 'auto' }}>{children}</div>
    )}
  </div>
);


const BatchSearch = () => {
  const [batchId, setBatchId] = useState('');
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [batchOptions, setBatchOptions] = useState([]);
  const [isDatewiseCardOpen, setIsDatewiseCardOpen] = useState(true);
  const [isTraceabilityCardOpen, setIsTraceabilityCardOpen] = useState(true);
  //for datewise batch data
  const [fromDate, setFromDate] = useState(getTodayString()); // yyyy-MM-dd string, defaults to today
  const [toDate, setToDate] = useState(getTodayString()); // yyyy-MM-dd string, defaults to today
  const [dateRangeData, setDateRangeData] = useState([]);
  const [dateRangeError, setDateRangeError] = useState('');
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [csvDownloading, setCsvDownloading] = useState(false);

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

  const handleFetchDatewiseData = async () => {
    if (!fromDate || !toDate) {
      alert('Please select From Date and To Date');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      alert('From Date must be earlier than or equal to To Date');
      return;
    }

    setDateRangeError('');
    setDateRangeLoading(true);
    setDateRangeData([]);

    try {
      const response = await axios.get(`${API_BASE_URL}/trace/date-range`, {
        params: {
          from_date: fromDate,
          to_date: toDate,
        },
      });

      const rows = response?.data?.result?.Data || response?.data?.result?.batch_data || [];
      setDateRangeData(Array.isArray(rows) ? rows : [rows]);

      if (!rows || rows.length === 0) {
        setDateRangeError('No datewise batch data available for the selected range.');
      }
    } catch (err) {
      console.log(err);
      setDateRangeError('Unable to fetch datewise batch data.');
    } finally {
      setDateRangeLoading(false);
    }
  };

  const handleDownloadDatewiseCsv = async () => {
    if (!fromDate || !toDate) {
      alert('Please select From Date and To Date');
      return;
    }

    setCsvDownloading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/getDatewiseBatchCSV`, {
        params: {
          from: fromDate,
          to: toDate,
        },
        responseType: 'blob', // CSV comes back as raw file data, not JSON
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `batch_datewise_report_${fromDate}_to_${toDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to download CSV.');
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);

      // With responseType: 'blob', even a JSON error body arrives as a Blob,
      // so it needs to be read back out as text before it can be parsed.
      let backendMessage;
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          backendMessage = JSON.parse(text)?.message;
        } catch (parseErr) {
          // response wasn't JSON; fall back to the generic message below
        }
      } else {
        backendMessage = error.response?.data?.message;
      }

      alert(backendMessage || 'Error downloading CSV.');
    } finally {
      setCsvDownloading(false);
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

  const handleDatewiseBatchdata = async () => {
    if (!fromDate || !toDate) {
      alert('Please select From Date and To Date');
      return;
    }

    setDateRangeError('');
    setDateRangeLoading(true);
    setDateRangeData([]);

    try {
      // query the API for datewise batch data using from and to dates
      const response = await axios.get(`${API_BASE_URL}/getDatewiseBatchData`, {
        params: {
          from: fromDate,
          to: toDate,
        },
      });

      if (response.status === 200) {
        console.log('Datewise Batch Data:', response.data);
        const rows = response.data?.data || [];
        setDateRangeData(Array.isArray(rows) ? rows : [rows]);

        if (!rows || rows.length === 0) {
          setDateRangeError('No datewise batch data available for the selected range.');
        }
      } else {
        alert('Failed to fetch datewise batch data.');
      }
    } catch (error) {
      console.error('Error fetching datewise batch data:', error);
      const backendMessage = error.response?.data?.message;
      alert(backendMessage || 'Error fetching datewise batch data.');
    } finally {
      setDateRangeLoading(false);
    }
  };

  // Opens the Traceability card and pre-fills its batch ID dropdown with the given value
  const handleUseBatchIdInTraceability = (id) => {
    if (!id) return;
    setBatchId(id);
    setIsTraceabilityCardOpen(true);

    // wait a tick for the card to expand/render, then scroll it into view
    setTimeout(() => {
      document
        .getElementById('traceability-batch-card')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
    <CollapsibleCard
      title="Datewise Batch Data"
      isOpen={isDatewiseCardOpen}
      onToggle={() => setIsDatewiseCardOpen((prev) => !prev)}
    >
      <div style={{ display: 'flex', gap: '22px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: '22px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '22px', flexWrap: 'wrap', width: '100%', marginTop: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '18px', fontWeight: '700', color: '#1f2937', textAlign: 'left' }}>
            <span style={{ fontSize: '18px' }}>From Date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ marginLeft: '0', padding: '12px 14px', height: '48px', minWidth: '170px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '18px', fontWeight: '700', color: '#1f2937', textAlign: 'left' }}>
            <span style={{ fontSize: '18px' }}>To Date</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ marginLeft: '0', padding: '12px 14px', height: '48px', minWidth: '170px', fontSize: '16px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
            <button
              type="button"
              onClick={handleDatewiseBatchdata}
              disabled={dateRangeLoading}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '16px', fontWeight: '700', minWidth: '120px', boxShadow: '0 2px 8px rgba(37,99,235,0.2)', height: '48px' }}
            >
              {dateRangeLoading ? 'Sending...' : 'Send'}
            </button>

            <button
              type="button"
              onClick={handleDownloadDatewiseCsv}
              disabled={csvDownloading}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '16px', fontWeight: '700', minWidth: '150px', boxShadow: '0 2px 8px rgba(37,99,235,0.2)', height: '48px' }}
            >
              {csvDownloading ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        </div>
      </div>

      {dateRangeError && <p style={{ color: 'red' }}>{dateRangeError}</p>}

      {dateRangeData.length > 0 && (() => {
        const columns = Object.keys(dateRangeData[0]);
        const ACTION_COL_WIDTH = '70px';
        const getColumnStyle = (colIdx, isHeader, rowIdx) => {
          const isFrozen = colIdx === 0; // freeze first data column (e.g. batch_id)
          const isStriped = !isHeader && rowIdx % 2 === 1;
          return {
            border: '1px solid #e2e8f0',
            padding: '12px 16px',
            textAlign: 'left',
            fontSize: '15px',
            lineHeight: '1.5',
            width: isFrozen ? '200px' : '150px',
            minWidth: isFrozen ? '200px' : '150px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...(isHeader
              ? {
                  position: 'sticky',
                  top: 0,
                  zIndex: isFrozen ? 3 : 1,
                  fontWeight: 800,
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#475569',
                  background: '#f1f5f9',
                  borderBottom: '2px solid #cbd5e1',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  lineHeight: '1.3',
                  verticalAlign: 'bottom',
                }
              : {
                  color: '#1e293b',
                  background: isFrozen ? '#ffffff' : isStriped ? '#f8fafc' : '#ffffff',
                }),
            ...(isFrozen
              ? {
                  position: 'sticky',
                  left: ACTION_COL_WIDTH, // sits right after the frozen action column
                  zIndex: isHeader ? 3 : 2,
                  fontWeight: isHeader ? 700 : 600,
                  boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)',
                }
              : {}),
          };
        };

        return (
          <div
            style={{
              marginTop: '20px',
              maxHeight: '420px',
              overflow: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: '#fff',
                tableLayout: 'fixed',
                fontFamily: "Consolas, Menlo, Monaco, 'Courier New', monospace",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      border: '1px solid #e2e8f0',
                      padding: '12px 16px',
                      textAlign: 'center',
                      width: ACTION_COL_WIDTH,
                      minWidth: ACTION_COL_WIDTH,
                      position: 'sticky',
                      top: 0,
                      left: 0,
                      zIndex: 4,
                      fontWeight: 800,
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#475569',
                      background: '#f1f5f9',
                      borderBottom: '2px solid #cbd5e1',
                    }}
                  >
                    Trace
                  </th>
                  {columns.map((key, colIdx) => (
                    <th key={key} style={getColumnStyle(colIdx, true)}>
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dateRangeData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td
                      style={{
                        border: '1px solid #e2e8f0',
                        padding: '8px',
                        textAlign: 'center',
                        width: ACTION_COL_WIDTH,
                        minWidth: ACTION_COL_WIDTH,
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        background: rowIdx % 2 === 1 ? '#f8fafc' : '#ffffff',
                        boxShadow: '2px 0 4px -2px rgba(0,0,0,0.15)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleUseBatchIdInTraceability(row.batch_id)}
                        title={`Trace batch ${row.batch_id ?? ''}`}
                        aria-label={`Trace batch ${row.batch_id ?? ''}`}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: '#eef2ff',
                          cursor: 'pointer',
                        }}
                      >
                        <FiDownload size={16} color="#2563eb" />
                      </button>
                    </td>
                    {columns.map((key, colIdx) => (
                      <td key={key} style={getColumnStyle(colIdx, false, rowIdx)} title={String(row[key] ?? 'Null')}>
                        {row[key] ?? 'Null'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}
    </CollapsibleCard>

    <CollapsibleCard
      id="traceability-batch-card"
      title="Traceability by Batch"
      isOpen={isTraceabilityCardOpen}
      onToggle={() => setIsTraceabilityCardOpen((prev) => !prev)}
      minBodyHeight="480px"
    >
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
    </CollapsibleCard>

    </>
  );
};

export default BatchSearch;