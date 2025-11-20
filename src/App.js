// src/App.js
import React, { useState } from "react";
import generatePdf from "./generatePdf";

const OBS_LABELS = [
  "Refrigeration Unit (Out Side)",
  "Outside Doors",
  "Status of Lock / Latch",
  "Right Side of Container (Exterior)",
  "Left Side of Container (Exterior)",
  "Any Rusting outside the container",
  "Right Side of Container (Interior)",
  "Left Side of Container (Interior)",
  "Water Dripping: Present/Absent",
  "Any Rusting Inside the container",
  "Ceiling/Roof (Exterior)",
  "Ceiling/Roof (Inside)",
  "Floor (Inside)",
  "Smell (Container Inside)",
  "Ventilation Unit",
  "Temperature & Humidity",
  "Internal Door"
];

export default function App() {
  const [step, setStep] = useState(1);

  const [service, setService] = useState({
    container_no: "",
    set_temp: "",
    bkg_no: "",
    mfg_date: "",
    survey_date: ""
  });

  const [client, setClient] = useState({
    shipper: "",
    ac: "",
    issued_for: "M/S OMKAR Marine Services"
  });

  const [observations, setObservations] = useState(OBS_LABELS.map(() => ""));
  const [remarks, setRemarks] = useState("");

  // image files (File objects from input)
  const [imageFiles, setImageFiles] = useState([]);

  function onServiceChange(e) {
    setService({ ...service, [e.target.name]: e.target.value });
  }
  function onClientChange(e) {
    setClient({ ...client, [e.target.name]: e.target.value });
  }
  function onObsChange(i, v) {
    const c = [...observations];
    c[i] = v;
    setObservations(c);
  }

  function onFilesChange(e) {
    const files = Array.from(e.target.files).slice(0, 6); // limit to 6
    setImageFiles(files);
  }

  async function handleGenerate() {
    const data = {
      ...service,
      ...client,
      remarks,
      observations: OBS_LABELS.map((label, i) => ({ label, status: observations[i] || "" }))
    };

    // pass File objects to generator; generatePdf handles Files
    await generatePdf(data, imageFiles);
  }

  return (
    <div className="container">
      <h1>Empty Container Survey Report</h1>

      {step === 1 && (
        <div>
          <h2>Step 1 — Service Details</h2>
          <div className="grid">
            <label>Container No:
              <input name="container_no" value={service.container_no} onChange={onServiceChange} />
            </label>
            <label>CON PAYLOAD / TARE WT:
              <input name="survey_date" value={service.survey_date} onChange={onServiceChange} />
            </label>
            <label>SET TEMP / HUMIDITY:
              <input name="set_temp" value={service.set_temp} onChange={onServiceChange} />
            </label>
            <label>BKG NO, M/LINE:
              <input name="bkg_no" value={service.bkg_no} onChange={onServiceChange} />
            </label>
            <label>MFG DATE:
              <input name="mfg_date" value={service.mfg_date} onChange={onServiceChange} />
            </label>
            
          </div>
          <div className="actions"><button onClick={() => setStep(2)}>Next</button></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2 — Client / Shipper Details</h2>
          <div className="grid">
            <label>Shipper:
              <input name="shipper" value={client.shipper} onChange={onClientChange} />
            </label>
            <label>Issued By (For):
              <input name="issued_for" value={client.issued_for} onChange={onClientChange} />
            </label>
          </div>
          <div className="actions">
            <button onClick={() => setStep(1)}>Back</button>
            <button onClick={() => setStep(3)}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3 — Observations & Other</h2>
          <p className="note">Fill the status for each observation (IN GOOD ORDER / ABSENT / NOT FOUND)</p>
          {OBS_LABELS.map((label, i) => (
            <div className="obs-row" key={i}>
              <div className="obs-label">{i + 1}. {label}</div>
              <input value={observations[i]} onChange={(e) => onObsChange(i, e.target.value)} />
            </div>
          ))}

          <label>Remarks:
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </label>

         
          <label style={{ marginTop: 20, display: "block", fontWeight: 700 }}>
            Add Images for PDF:
            <input type="file" multiple accept="image/*" onChange={onFilesChange} />
          </label>

          <div className="file-list">
            {imageFiles.map((file, i) => (
              <div key={i}>{file.name}</div>
            ))}
          </div>

          <div className="actions">
            <button onClick={() => setStep(2)}>Back</button>
            <button onClick={handleGenerate}>Generate PDF</button>
          </div>
        </div>
      )}

      <p className="note small">Letterhead & signature default to the uploaded session images. If you prefer, place your images in public/images and change constants in generatePdf.js.</p>
    </div>
  );
}
