import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import type { Patient } from "../models/Patient";
import { dbService } from "../services/dbService";

interface PatientListProps {
  visible: boolean;
  onHide: () => void;
}

export function PatientList({ visible, onHide }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchITS, setSearchITS] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (visible) {
      loadPatients();
    }
  }, [visible]);

  useEffect(() => {
    let filtered = patients;

    // Filter by ITS number
    if (searchITS.trim()) {
      filtered = filtered.filter(p => 
        p.itsNo.toLowerCase().includes(searchITS.toLowerCase())
      );
    }

    // Filter by date
    if (selectedDate) {
      const filterDate = new Date(selectedDate);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filtered = filtered.filter(p => {
        if (!p.date) return false;
        const patientDate = new Date(p.date);
        patientDate.setHours(0, 0, 0, 0);
        return patientDate.getTime() === filterDate.getTime();
      });
    }

    setFilteredPatients(filtered);
  }, [searchITS, selectedDate, patients]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await dbService.getPatients();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = (patient: Patient) => {
    if (!patient.tokenNumber || !patient.doctorName) return;
    
    printToken(patient, patient.doctorName, patient.name, patient.tokenNumber);
  };

  const printToken = (patient: Patient, doctorName: string, patientName: string, tokenNumber: number) => {
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) return;

    const currentDate = patient.date ? new Date(patient.date) : new Date();
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
                    <span class="info-item-value">${patient.age}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-item-label">ITS#</span>
                    <span class="info-item-value">${patient.itsNo}</span>
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
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const dateBodyTemplate = (rowData: Patient) => {
    if (!rowData.date) return "-";
    const date = new Date(rowData.date);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const tokenBodyTemplate = (rowData: Patient) => {
    return rowData.tokenNumber ? `#${rowData.tokenNumber}` : "-";
  };

  const actionBodyTemplate = (rowData: Patient) => {
    return (
      <Button
        label="Reprint"
        icon="pi pi-print"
        className="p-button-sm p-button-secondary"
        onClick={() => handleReprint(rowData)}
        disabled={!rowData.tokenNumber}
      />
    );
  };

  const handleClearFilters = () => {
    setSearchITS("");
    setSelectedDate(null);
  };

  const header = (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Patient List</h2>
        {(searchITS || selectedDate) && (
          <Button
            label="Clear Filters"
            icon="pi pi-filter-slash"
            onClick={handleClearFilters}
            className="p-button-text p-button-secondary"
            size="small"
          />
        )}
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "250px" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "14px" }}>
            Search by ITS#
          </label>
          <IconField iconPosition="left" style={{ width: "100%" }}>
            <InputIcon className="pi pi-search" />
            <InputText
              type="search"
              placeholder="Enter ITS number..."
              value={searchITS}
              onChange={(e) => setSearchITS(e.target.value)}
              style={{ width: "100%" }}
            />
          </IconField>
        </div>
        <div style={{ flex: "0 0 auto", minWidth: "200px" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "14px" }}>
            Filter by Date
          </label>
          <Calendar
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.value as Date | null)}
            placeholder="Select date"
            dateFormat="yy-mm-dd"
            showIcon
            showButtonBar
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      header="Patient Records"
      visible={visible}
      style={{ width: "90vw", maxWidth: "1200px" }}
      onHide={onHide}
      modal
      maximizable
    >
      <DataTable
        value={filteredPatients}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        loading={loading}
        header={header}
        emptyMessage="No patients found."
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="tokenNumber" header="Token #" body={tokenBodyTemplate} sortable style={{ width: "10%" }} />
        <Column field="itsNo" header="ITS#" sortable style={{ width: "12%" }} />
        <Column field="name" header="Name" sortable style={{ width: "18%" }} />
        <Column field="age" header="Age" sortable style={{ width: "8%" }} />
        <Column field="gender" header="Gender" sortable style={{ width: "10%" }} />
        <Column field="mohallah" header="Mohallah" sortable style={{ width: "15%" }} />
        <Column field="doctorName" header="Doctor" sortable style={{ width: "15%" }} />
        <Column field="date" header="Date/Time" body={dateBodyTemplate} sortable style={{ width: "12%" }} />
        <Column header="Actions" body={actionBodyTemplate} style={{ width: "10%" }} />
      </DataTable>
    </Dialog>
  );
}
