import React, { useState } from "react";
import generatePdf from "../generatePdf";

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

export default function PdfForm() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState({
    container_no: "",
    set_temp: "",
    bkg_no: "",
    mfg_date: "",
    survey_date: "",
  });

  const [client, setClient] = useState({
    shipper: "",
    ac: "",
    issued_for: "M/S OMKAR Marine Services",
  });

  const [observations, setObservations] = useState(OBS_LABELS.map(() => ""));
  const [remarks, setRemarks] = useState("");
  const [imageFiles, setImages] = useState([]);

  const updateService = (e) =>
    setService({ ...service, [e.target.name]: e.target.value });

  const updateClient = (e) =>
    setClient({ ...client, [e.target.name]: e.target.value });

  const updateObs = (i, v) => {
    const c = [...observations];
    c[i] = v;
    setObservations(c);
  };

  async function handleGenerate() {
    const data = {
      ...service,
      ...client,
      remarks,
      observations: OBS_LABELS.map((label, i) => ({
        label,
        status: observations[i],
      })),
    };

    await generatePdf(data, imageFiles);
  }

  return (
    <div className="pdf-container">
      <h1 className="page-title">Empty Container Survey Report</h1>

      {/* Step Indicators */}
      <div className="step-progress">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`step-circle ${step === s ? "active" : step > s ? "done" : ""}`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* CARD */}
      <div className="card">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="fade">
            <h2 className="section-title">Service Details</h2>
            <div className="form-grid">
              <label>
                Container No
                <input name="container_no" value={service.container_no} onChange={updateService} />
              </label>

              <label>
                CON PAYLOAD / TARE WT
                <input name="survey_date" value={service.survey_date} onChange={updateService} />
              </label>

              <label>
                SET TEMP / HUMIDITY
                <input name="set_temp" value={service.set_temp} onChange={updateService} />
              </label>

              <label>
                BKG NO, M/LINE
                <input name="bkg_no" value={service.bkg_no} onChange={updateService} />
              </label>

              <label>
                MFG DATE
                <input name="mfg_date" value={service.mfg_date} onChange={updateService} />
              </label>
            </div>

            <div className="actions">
              <button className="btn next" onClick={() => setStep(2)}>Next →</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="fade">
            <h2 className="section-title">Client / Shipper Details</h2>
            <div className="form-grid">
              <label>
                Shipper
                <input name="shipper" value={client.shipper} onChange={updateClient} />
              </label>

              <label>
                Issued By (For)
                <input name="issued_for" value={client.issued_for} onChange={updateClient} />
              </label>
            </div>

            <div className="actions">
              <button className="btn back" onClick={() => setStep(1)}>← Back</button>
              <button className="btn next" onClick={() => setStep(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="fade">
            <h2 className="section-title">Observations & Other Details</h2>
            <p className="note">Fill the status for each observation</p>

            <div className="obs-list">
              {OBS_LABELS.map((label, i) => (
                <div className="obs-row" key={i}>
                  <span className="obs-label">{i + 1}. {label}</span>
                  <input
                    value={observations[i]}
                    onChange={(e) => updateObs(i, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <label className="full">
              Remarks
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </label>

            {/* IMAGE UPLOAD */}
            <div className="image-section">
              <h3>Upload Images</h3>

              <button
                className="add-img-btn"
                onClick={() => document.getElementById("imgInput").click()}
              >
                + Add Image
              </button>

              <input
                id="imgInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setImages([...imageFiles, ...files]);
                }}
              />

              <div className="img-grid">
                {imageFiles.map((file, i) => (
                  <div className="img-box" key={i}>
                    <img src={URL.createObjectURL(file)} alt="" />
                    <button className="remove-img" onClick={() =>
                      setImages(imageFiles.filter((_, idx) => idx !== i))
                    }>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="actions">
              <button className="btn back" onClick={() => setStep(2)}>← Back</button>
              <button className="btn generate" onClick={handleGenerate}>Generate PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
