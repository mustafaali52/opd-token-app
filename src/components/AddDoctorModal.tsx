import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import type { Doctor } from "../models/Doctor";

interface AddDoctorModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (doctor: Omit<Doctor, "id">) => Promise<void>;
}

export function AddDoctorModal({ visible, onHide, onSave }: AddDoctorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: ""
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Doctor name is required";
    }

    // Phone is optional, but validate format if provided
    if (formData.phone.trim() && !/^[+]?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = "Specialization is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      // Reset form
      setFormData({
        name: "",
        phone: "",
        specialization: ""
      });
      setErrors({});
      onHide();
    } catch (error) {
      console.error("Error saving doctor:", error);
      setErrors({ submit: "Failed to save doctor. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      phone: "",
      specialization: ""
    });
    setErrors({});
    onHide();
  };

  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "1rem" }}>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={handleCancel}
        className="p-button-text p-button-secondary"
        disabled={saving}
        style={{ minWidth: "100px" }}
      />
      <Button
        label="Save Doctor"
        icon="pi pi-check"
        onClick={handleSave}
        disabled={saving}
        loading={saving}
        className="p-button-success"
        style={{ minWidth: "120px" }}
      />
    </div>
  );

  return (
    <Dialog
      header="Add New Doctor"
      visible={visible}
      style={{ width: "500px" }}
      onHide={handleCancel}
      footer={footer}
      modal
      draggable={false}
      resizable={false}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1rem 0" }}>
        {errors.submit && (
          <div 
            style={{ 
              padding: "0.75rem", 
              backgroundColor: "#ffebee", 
              color: "#c62828",
              borderRadius: "4px",
              border: "1px solid #ef5350"
            }}
          >
            <i className="pi pi-exclamation-triangle" style={{ marginRight: "0.5rem" }}></i>
            {errors.submit}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="name" style={{ fontWeight: "600", fontSize: "14px" }}>
            Doctor Name <span style={{ color: "#e53935" }}>*</span>
          </label>
          <InputText
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter doctor's full name"
            className={errors.name ? "p-invalid" : ""}
            disabled={saving}
            style={{ width: "100%" }}
            required
            autoFocus
          />
          {errors.name && (
            <small style={{ color: "#e53935", fontSize: "12px" }}>
              <i className="pi pi-times-circle" style={{ marginRight: "0.25rem" }}></i>
              {errors.name}
            </small>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="phone" style={{ fontWeight: "600", fontSize: "14px" }}>
            Phone Number
          </label>
          <InputText
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1-555-0100 (optional)"
            className={errors.phone ? "p-invalid" : ""}
            disabled={saving}
            style={{ width: "100%" }}
          />
          {errors.phone && (
            <small style={{ color: "#e53935", fontSize: "12px" }}>
              <i className="pi pi-times-circle" style={{ marginRight: "0.25rem" }}></i>
              {errors.phone}
            </small>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label htmlFor="specialization" style={{ fontWeight: "600", fontSize: "14px" }}>
            Specialization <span style={{ color: "#e53935" }}>*</span>
          </label>
          <InputText
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="e.g., Cardiology, Pediatrics"
            className={errors.specialization ? "p-invalid" : ""}
            disabled={saving}
            style={{ width: "100%" }}
            required
          />
          {errors.specialization && (
            <small style={{ color: "#e53935", fontSize: "12px" }}>
              <i className="pi pi-times-circle" style={{ marginRight: "0.25rem" }}></i>
              {errors.specialization}
            </small>
          )}
        </div>
      </div>
    </Dialog>
  );
}
