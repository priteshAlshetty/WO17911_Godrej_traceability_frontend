import React, { useState, useRef } from 'react';
import ExcelJS from 'exceljs';
import './CSS/upload.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ExcelUploader() {
  const [mode, setMode] = useState('file');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef();

  const [manualData, setManualData] = useState({
    batteryId: '',
    batteryOCV: '',
    manufactured: '',
    cells: Array.from({ length: 9 }, () => ({ id: '', ocv: '', ir: '', hrd: '' }))
  });

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
      setFile(selectedFile);
      setStatus('');
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target.result;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          const worksheet = workbook.worksheets[0];
          const rows = [];
          worksheet.eachRow({ includeEmpty: true }, (row) => {
            rows.push(row.values.slice(1));
          });
          setPreviewData(rows);
        } catch (err) {
          setStatus('Error reading file.');
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } else {
      setStatus('Only .xlsx files are allowed.');
      setPreviewData([]);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.XLSX'))) {
      setFile(droppedFile);
      setStatus('');
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target.result;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          const worksheet = workbook.worksheets[0];
          const rows = [];
          worksheet.eachRow({ includeEmpty: true }, (row) => {
            rows.push(row.values.slice(1));
          });
          setPreviewData(rows);
        } catch (err) {
          setStatus('Error reading file.');
          console.error(err);
        }
      };
      reader.readAsArrayBuffer(droppedFile);
    } else {
      setStatus('Only .xlsx files are allowed.');
      setPreviewData([]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = () => {
    if (!file) {
      setStatus('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('end_of_line', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        setStatus('Upload complete!');
        setUploadProgress(100);
      } else {
        setStatus('Upload failed.');
      }
    });

    xhr.addEventListener('error', () => {
      setStatus('Upload error.');
    });

    xhr.open('POST', `${API_BASE_URL}/upload/end-of-line`);
    xhr.send(formData);

    setStatus('Uploading...');
    setUploadProgress(0);
  };

  const handleManualChange = (e, index = null, field = null) => {
    const { name, value } = e.target;
    if (index !== null && field) {
      const updatedCells = [...manualData.cells];
      updatedCells[index][field] = value;
      setManualData({ ...manualData, cells: updatedCells });
    } else {
      setManualData({ ...manualData, [name]: value });
    }
  };

  const handleManualSubmit = async () => {
    try {console.log("API_BASE_URL:", API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}/api/upload/end-of-line/json-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(manualData)
      });

      if (response.ok) {
        setStatus('Manual data submitted successfully!');
      } else {
        const errorText = await response.text();
        setStatus(`Submission failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Manual submission error:", error);
      setStatus('Submission error occurred.');
    }

    console.log("Submitted JSON:", JSON.stringify(manualData, null, 2));
  };

  return (
    <div className="upload-container">
      <div className="content-wrapper">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'file' ? 'active' : ''}`}
            onClick={() => setMode('file')}
          >
            Upload File
          </button>
          <button
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            Enter Manually
          </button>
        </div>

        {mode === 'file' ? (
          <div className="upload-box">
            <h2>File Upload</h2>
            <div
              className="drop-zone"
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img src="/file-upload-1.png" alt="upload" className="upload-icon" />
              <p>Drag and drop or <span className="browse">browse</span> your files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                hidden
              />
            </div>

            {file && (
              <div className="upload-info">
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="upload-status">{status || `Uploading... ${uploadProgress}%`}</p>
              </div>
            )}

            <button className="upload-btn" onClick={handleUpload}>Upload</button>

            {previewData.length > 0 && (
              <div className="preview-table">
                <h3>File Preview</h3>
                <table>
                  <tbody>
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="manual-form">
            <h2>Enter Data Manually</h2>

            <div className="manual-section">
              <label>Battery ID:
                <input name="batteryId" value={manualData.batteryId} onChange={handleManualChange} />
              </label>
              <label>Battery OCV:
                <input name="batteryOCV" value={manualData.batteryOCV} onChange={handleManualChange} />
              </label>
              <label>Manufactured:
                <input name="manufactured" value={manualData.manufactured} onChange={handleManualChange} />
              </label>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Cell ID</th>
                  <th>Cell OCV</th>
                  <th>Cell IR</th>
                  <th>Cell HRD</th>
                </tr>
              </thead>
              <tbody>
                {manualData.cells.map((cell, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td><input value={cell.id} onChange={(e) => handleManualChange(e, index, 'id')} /></td>
                    <td><input value={cell.ocv} onChange={(e) => handleManualChange(e, index, 'ocv')} /></td>
                    <td><input value={cell.ir} onChange={(e) => handleManualChange(e, index, 'ir')} /></td>
                    <td><input value={cell.hrd} onChange={(e) => handleManualChange(e, index, 'hrd')} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="upload-btn" onClick={handleManualSubmit}>Submit</button>
            {status && <p className="upload-status">{status}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
