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
    
    printToken(patient.doctorName, patient.name, patient.tokenNumber);
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
