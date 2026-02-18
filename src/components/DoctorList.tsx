import { useEffect, useState } from "react";
import type { Doctor } from "../models/Doctor";
import { fetchDoctor, addDoctor } from "../services/doctorService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { AddDoctorModal } from "./AddDoctorModal";
import { PatientList } from "./PatientList";

function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState<boolean>(false);
  const [showPatientList, setShowPatientList] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [patientData, setPatientData] = useState({
    itsNo: "",
    name: "",
    age: ""
  });
  const [patientErrors, setPatientErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = () => {
    setLoading(true);
    fetchDoctor()
      .then(setDoctors)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleAddPatient = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleSaveDoctor = async (doctorData: Omit<Doctor, "id">) => {
    try {
      await addDoctor(doctorData);
      // Reload doctors list
      await loadDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
    setPatientData({
      itsNo: "",
      name: "",
      age: ""
    });
    setPatientErrors({});
  };

  const validatePatientForm = () => {
    const errors: Record<string, string> = {};

    if (!patientData.itsNo.trim()) {
      errors.itsNo = "ITS Number is required";
    } else if (!/^\d{8}$/.test(patientData.itsNo)) {
      errors.itsNo = "ITS Number must be exactly 8 digits";
    }

    if (!patientData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!patientData.age.trim()) {
      errors.age = "Age is required";
    } else if (parseInt(patientData.age) <= 0) {
      errors.age = "Age must be a positive number";
    }

    setPatientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAndPrint = async () => {
    if (!selectedDoctor) return;

    // Validate form
    if (!validatePatientForm()) {
      return;
    }

    try {
      const { dbService } = await import("../services/dbService");
      
      // Get last token number for today for this doctor
      const today = new Date();
      const lastToken = await dbService.getLastTokenNumber(selectedDoctor.id, today);
      const currentToken = lastToken + 1;

      // Save patient to database
      const patient = {
        itsNo: patientData.itsNo,
        name: patientData.name,
        age: parseInt(patientData.age),
        tokenNumber: currentToken,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date: new Date().toISOString()
      };

      const patientId = await dbService.addPatient(patient);

      // Save token to database
      await dbService.addToken({
        doctorId: selectedDoctor.id,
        patientId: patientId,
        tokenNumber: currentToken,
        doctorName: selectedDoctor.name,
        patientName: patientData.name,
        patientData: patient,
        date: new Date()
      });

      // Print token
      printToken(selectedDoctor.name, patientData.name, currentToken, patientData.age, patientData.itsNo);

      // Close modal and reset
      handleCloseModal();
    } catch (error) {
      console.error("Error saving patient and token:", error);
      alert("Failed to save patient data. Please try again.");
    }
  };

  const printToken = (doctorName: string, patientName: string, tokenNumber: number, age: string, itsNo: string) => {
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) return;

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OPD Token</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
            }
            .prescription {
              width: 100%;
              max-width: 700px;
              margin: 0 auto;
              border: 2px solid #000;
              padding: 0;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding: 10px;
              background: #f5f5f5;
            }
            .header-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 3px;
            }
            .patient-info {
              border-bottom: 2px solid #000;
              display: grid;
              grid-template-columns: auto 120px;
            }
            .info-left {
              border-right: 2px solid #000;
              padding: 10px;
            }
            .info-right {
              padding: 10px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .info-row {
              display: flex;
              padding: 5px 0;
              align-items: center;
            }
            .info-label {
              font-weight: bold;
              min-width: 80px;
              font-size: 14px;
            }
            .info-value {
              flex: 1;
              border-bottom: 1px solid #333;
              padding: 2px 5px;
              font-size: 14px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-top: 5px;
            }
            .info-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .info-item-label {
              font-weight: bold;
              font-size: 13px;
            }
            .info-item-value {
              flex: 1;
              border-bottom: 1px solid #333;
              height: 20px;
            }
            .token-label {
              font-size: 14px;
              font-weight: normal;
              margin-bottom: 5px;
            }
            .token-number {
              font-size: 72px;
              font-weight: bold;
              line-height: 1;
            }
            .doctor-row {
              display: flex;
              padding: 5px 0;
            }
            .doctor-label {
              font-weight: bold;
              min-width: 80px;
              font-size: 14px;
            }
            .doctor-value {
              flex: 1;
              border-bottom: 1px solid #333;
              padding: 2px 5px;
              font-size: 14px;
            }
            .vitals-row {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              padding: 5px 0;
            }
            .vital-item {
              display: flex;
              align-items: center;
              gap: 5px;
            }
            .vital-label {
              font-weight: bold;
              font-size: 12px;
              white-space: nowrap;
            }
            .vital-value {
              flex: 1;
              border-bottom: 1px solid #333;
              height: 20px;
            }
            .rx-section {
              padding: 15px;
              min-height: 400px;
              position: relative;
            }
            .rx-symbol {
              font-size: 36px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .signature-section {
              border-top: 2px solid #000;
              padding: 15px;
              text-align: right;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              width: 200px;
              margin-left: auto;
              margin-bottom: 5px;
              height: 25px;
            }
            .signature-label {
              font-weight: bold;
              font-size: 14px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
              @page {
                margin: 0.5cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="prescription">
            <div class="header">
              <div class="header-title">MAHAL-US-SHIFA - 1447H</div>
            </div>
            
            <div class="patient-info">
              <div class="info-left">
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${patientName}</span>
                </div>
                
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-item-label">Date:</span>
                    <span class="info-item-value">${formattedDate}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-item-label">Age</span>
                    <span class="info-item-value">${age}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-item-label">ITS#</span>
                    <span class="info-item-value">${itsNo}</span>
                  </div>
                </div>
                
                <div class="doctor-row">
                  <span class="doctor-label">Doctor:</span>
                  <span class="doctor-value">${doctorName}</span>
                </div>
                
                <div class="vitals-row">
                  <div class="vital-item">
                    <span class="vital-label">BP/Pulse</span>
                    <span class="vital-value"></span>
                  </div>
                  <div class="vital-item">
                    <span class="vital-label">Weight</span>
                    <span class="vital-value"></span>
                  </div>
                  <div class="vital-item">
                    <span class="vital-label">Height</span>
                    <span class="vital-value"></span>
                  </div>
                  <div class="vital-item">
                    <span class="vital-label">Sugar:</span>
                    <span class="vital-value"></span>
                  </div>
                </div>
              </div>
              
              <div class="info-right">
                <div class="token-label">Token No</div>
                <div class="token-number">${tokenNumber}</div>
              </div>
            </div>
            
            <div class="rx-section">
              <div class="rx-symbol">℞</div>
            </div>
            
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-label">Signature</div>
            </div>
          </div>
          
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 12px 24px; cursor: pointer; background: #2d5f3f; color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: block; margin-left: auto; margin-right: auto;">Print Token</button>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleInputChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const actionBodyTemplate = (doctor: Doctor) => {
    return (
      <Button
        label="Add Patient"
        icon="pi pi-plus"
        className="p-button-sm"
        onClick={() => handleAddPatient(doctor)}
      />
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h2 style={{ margin: 0 }}>Doctors</h2>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Button
          label="View Patients"
          icon="pi pi-users"
          onClick={() => setShowPatientList(true)}
          className="p-button-info"
        />
        <Button
          label="Add Doctor"
          icon="pi pi-user-plus"
          onClick={() => setShowAddDoctorModal(true)}
          className="p-button-success"
        />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            type="search"
            placeholder="Search doctors..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </IconField>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "2rem" }}>
      <DataTable
        value={doctors}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        dataKey="id"
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No doctors found."
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="name" header="Name" sortable style={{ width: "25%" }} />
        <Column field="specialization" header="Specialization" sortable style={{ width: "25%" }} />
        <Column field="phone" header="Phone" sortable style={{ width: "25%" }} />
        <Column header="Actions" body={actionBodyTemplate} style={{ width: "25%" }} />
      </DataTable>

      <Dialog
        header={`Add Patient for ${selectedDoctor?.name || ""}`}
        visible={showModal}
        style={{ width: "450px" }}
        onHide={handleCloseModal}
        footer={
          <div>
            <Button label="Cancel" icon="pi pi-times" onClick={handleCloseModal} className="p-button-text" />
            <Button label="Save and Print" icon="pi pi-print" onClick={handleSaveAndPrint} />
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="itsNo" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              ITS Number <span style={{ color: "#e53935" }}>*</span>
            </label>
            <InputText
              id="itsNo"
              value={patientData.itsNo}
              onChange={(e) => handleInputChange("itsNo", e.target.value)}
              style={{ width: "100%" }}
              className={patientErrors.itsNo ? "p-invalid" : ""}
              required
              autoFocus
              keyfilter="pint"
              maxLength={8}
              placeholder="Enter 8-digit ITS number"
            />
            {patientErrors.itsNo && (
              <small style={{ color: "#e53935", fontSize: "12px" }}>
                <i className="pi pi-times-circle" style={{ marginRight: "0.25rem" }}></i>
                {patientErrors.itsNo}
              </small>
            )}
          </div>

          <div>
            <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Name <span style={{ color: "#e53935" }}>*</span>
            </label>
            <InputText
              id="name"
              value={patientData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              style={{ width: "100%" }}
              className={patientErrors.name ? "p-invalid" : ""}
              required
            />
            {patientErrors.name && (
              <small style={{ color: "#e53935", fontSize: "12px" }}>
                <i className="pi pi-times-circle" style={{ marginRight: "0.25rem" }}></i>
                {patientErrors.name}
              </small>
            )}
          </div>

          <div>
            <label htmlFor="age" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Age <span style={{ color: "#e53935" }}>*</span>
            </label>
            <InputText
              id="age"
              value={patientData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              keyfilter="pint"
              style={{ width: "100%" }}
              className={patientErrors.age ? "p-invalid" : ""}
              required
            />
            {patientErrors.age && (
              <small style={{ color: "#e53935", fontSize: "12px" }}>
                <i className="pi pi-times-circle" style={{ marginRight: "0.25rem" }}></i>
                {patientErrors.age}
              </small>
            )}
          </div>
        </div>
      </Dialog>

      <AddDoctorModal
        visible={showAddDoctorModal}
        onHide={() => setShowAddDoctorModal(false)}
        onSave={handleSaveDoctor}
      />

      <PatientList
        visible={showPatientList}
        onHide={() => setShowPatientList(false)}
      />
    </div>
  );
}

export default DoctorList;