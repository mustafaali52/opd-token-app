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
import { Dropdown } from "primereact/dropdown";
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
    age: "",
    gender: "",
    mohallah: ""
  });
  const [patientErrors, setPatientErrors] = useState<Record<string, string>>({});

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" }
  ];

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
      age: "",
      gender: "",
      mohallah: ""
    });
    setPatientErrors({});
  };

  const validatePatientForm = () => {
    const errors: Record<string, string> = {};

    if (!patientData.itsNo.trim()) {
      errors.itsNo = "ITS Number is required";
    }

    if (!patientData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!patientData.age.trim()) {
      errors.age = "Age is required";
    } else if (parseInt(patientData.age) <= 0) {
      errors.age = "Age must be a positive number";
    }

    if (!patientData.gender) {
      errors.gender = "Gender is required";
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
        gender: patientData.gender,
        mohallah: patientData.mohallah,
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
      printToken(selectedDoctor.name, patientData.name, currentToken);

      // Close modal and reset
      handleCloseModal();
    } catch (error) {
      console.error("Error saving patient and token:", error);
      alert("Failed to save patient data. Please try again.");
    }
  };

  const printToken = (doctorName: string, patientName: string, tokenNumber: number) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OPD Token</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .token-container {
              border: 2px solid #333;
              padding: 30px;
              margin: 20px;
              border-radius: 10px;
            }
            .token-number {
              font-size: 48px;
              font-weight: bold;
              color: #2196F3;
              margin: 20px 0;
            }
            .label {
              font-size: 14px;
              color: #666;
              margin-top: 10px;
            }
            .value {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            .header {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="token-container">
            <div class="header">OPD Token</div>
            <div class="token-number">#${tokenNumber}</div>
            <div class="label">Doctor Name</div>
            <div class="value">${doctorName}</div>
            <div class="label">Patient Name</div>
            <div class="value">${patientName}</div>
          </div>
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Print Token</button>
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

          <div>
            <label htmlFor="gender" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Gender <span style={{ color: "#e53935" }}>*</span>
            </label>
            <Dropdown
              id="gender"
              value={patientData.gender}
              options={genderOptions}
              onChange={(e) => handleInputChange("gender", e.value)}
              placeholder="Select Gender"
              style={{ width: "100%" }}
              className={patientErrors.gender ? "p-invalid" : ""}
              required
            />
            {patientErrors.gender && (
              <small style={{ color: "#e53935", fontSize: "12px" }}>
                <i className="pi pi-times-circle" style={{ marginRight: "0.25rem" }}></i>
                {patientErrors.gender}
              </small>
            )}
          </div>

          <div>
            <label htmlFor="mohallah" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Mohallah
            </label>
            <InputText
              id="mohallah"
              value={patientData.mohallah}
              onChange={(e) => handleInputChange("mohallah", e.target.value)}
              style={{ width: "100%" }}
              placeholder="Optional"
            />
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