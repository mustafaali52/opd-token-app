import { useEffect, useState } from "react";
import type { Doctor } from "../models/Doctor";
import type { Patient } from "../models/Patient";
import { fetchDoctor } from "../services/doctorService";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";

function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorTokens, setDoctorTokens] = useState<Record<number, number>>({});
  const [patientData, setPatientData] = useState({
    itsNo: "",
    name: "",
    age: "",
    gender: "",
    mohallah: ""
  });

  const genderOptions = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" }
  ];

  useEffect(() => {
    fetchDoctor()
      .then(setDoctors)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddPatient = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
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
  };

  const handleSaveAndPrint = () => {
    if (!selectedDoctor) return;

    // Generate token number for this doctor
    const currentToken = (doctorTokens[selectedDoctor.id] || 0) + 1;
    setDoctorTokens(prev => ({
      ...prev,
      [selectedDoctor.id]: currentToken
    }));

    // Print token
    printToken(selectedDoctor.name, patientData.name, currentToken);

    // Close modal and reset
    handleCloseModal();
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
            <label htmlFor="itsNo" style={{ display: "block", marginBottom: "0.5rem" }}>ITS Number</label>
            <InputText
              id="itsNo"
              value={patientData.itsNo}
              onChange={(e) => handleInputChange("itsNo", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem" }}>Name</label>
            <InputText
              id="name"
              value={patientData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label htmlFor="age" style={{ display: "block", marginBottom: "0.5rem" }}>Age</label>
            <InputText
              id="age"
              value={patientData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              keyfilter="pint"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label htmlFor="gender" style={{ display: "block", marginBottom: "0.5rem" }}>Gender</label>
            <Dropdown
              id="gender"
              value={patientData.gender}
              options={genderOptions}
              onChange={(e) => handleInputChange("gender", e.value)}
              placeholder="Select Gender"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label htmlFor="mohallah" style={{ display: "block", marginBottom: "0.5rem" }}>Mohallah</label>
            <InputText
              id="mohallah"
              value={patientData.mohallah}
              onChange={(e) => handleInputChange("mohallah", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default DoctorList;