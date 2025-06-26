import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { toast } from "react-hot-toast";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import PatientDialog from "../components/PatientDialog";
import { API_BASE_URL } from "../constants";
import { useAuth } from "../AuthContext";
import { GooglePlaceAddressComponent, Patient } from "../types";
import { formatAddressComponents } from "../utils";

interface PatientTableRef {
  fetchPatients: () => void;
}

const PatientTable = forwardRef<PatientTableRef>((_, ref) => {
  const [isLoading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { idToken } = useAuth();

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch patients");
      }

      setPatients(data.patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!selectedPatient) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/patients/${selectedPatient.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete patient");
      }

      // Remove the deleted patient from the local state
      setPatients(
        patients.filter((patient) => patient.id !== selectedPatient.id)
      );
      setSelectedPatient(null);
      toast.success("Patient deleted successfully");
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete patient");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useImperativeHandle(ref, () => ({
    fetchPatients,
  }));

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setGlobalFilterValue(value);
  };

  const dataTableHeader = (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-white">
      <span className="text-xl text-900 font-bold">Patient Records</span>

      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search patients…"
        />
      </IconField>
    </div>
  );

  const patientBodyTemplate = (patient: Patient) => {
    return (
      <div className="flex">
        {patient.profileImageUrl && (
          <img
            className="w-16 h-16 object-cover rounded-full mr-4"
            src={patient.profileImageUrl}
            alt={`${patient.firstName} ${patient.middleName ?? ""} ${patient.lastName}`}
          />
        )}
        <span className="text-black flex flex-col justify-center font-medium">{`${patient.firstName} ${patient.middleName ?? ""} ${patient.lastName}`}</span>
      </div>
    );
  };

  const dobBodyTemplate = (patient: Patient) => {
    return (
      <div className="flex font-medium text-black">
        {new Intl.DateTimeFormat(navigator.language, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(patient.dateOfBirth))}
      </div>
    );
  };

  const statusBodyTemplate = (patient: Patient) => {
    const severityMap: Record<
      string,
      "info" | "success" | "warning" | "danger"
    > = {
      INQUIRY: "info",
      ACTIVE: "success",
      ONBOARDING: "warning",
      CHURNED: "danger",
    };
    const severity = severityMap[patient.status] ?? "info";
    return (
      <div className="flex">
        <Tag severity={severity} value={patient.status} />
      </div>
    );
  };

  const addressBodyTemplate = (patient: Patient) => {
    const [line1, line2] = formatAddressComponents(
      patient.address.address_components as GooglePlaceAddressComponent[]
    );
    return (
      <div className="flex flex-col font-medium">
        <span className="text-black">{line1}</span>
        <span>{line2}</span>
      </div>
    );
  };

  const actionsBodyTemplate = (patient: Patient) => {
    return (
      <div className="flex gap-6">
        <span
          role="button"
          title="Edit"
          tabIndex={0}
          className="pi pi-pen-to-square cursor-pointer text-dodgerBlue hover:opacity-50 outline-none"
          onClick={() => {
            setSelectedPatient(patient);
            setShowEditDialog(true);
          }}
        />
        <span
          role="button"
          title="Delete"
          tabIndex={0}
          className="pi pi-trash cursor-pointer text-tomato hover:opacity-50 outline-none"
          onClick={() => {
            setSelectedPatient(patient);
            setShowDeleteDialog(true);
          }}
        />
      </div>
    );
  };

  return isLoading ? (
    <div className="flex items-center justify-center bg-white border-1 border-[#eee]"></div>
  ) : (
    <>
      <DataTable
        value={patients}
        header={dataTableHeader}
        style={{
          borderTop: "1px solid #eee",
          borderLeft: "1px solid #eee",
          borderRight: "1px solid #eee",
          borderRadius: 4,
        }}
        sortField="lastName"
        sortOrder={1}
        paginator
        rows={10}
        globalFilter={globalFilterValue}
      >
        <Column
          field="lastName"
          header="Patient"
          sortable
          body={patientBodyTemplate}
        ></Column>
        <Column
          field="dateOfBirth"
          header="Date of Birth"
          body={dobBodyTemplate}
          sortable
        ></Column>
        <Column
          field="status"
          header="Status"
          sortable
          body={statusBodyTemplate}
        ></Column>
        <Column
          field="address.formatted_address"
          header="Address"
          sortable
          body={addressBodyTemplate}
        ></Column>
        <Column
          field="Actions"
          header="Actions"
          body={actionsBodyTemplate}
        ></Column>
      </DataTable>

      {
        /* Edit Dialog */
        <PatientDialog
          visible={showEditDialog}
          onHide={() => setShowEditDialog(false)}
          mode="Edit"
          editPatient={selectedPatient ?? null}
          onPatientUpdate={fetchPatients}
        />
      }

      {/* Delete Dialog */}
      <Dialog
        className=""
        header="Delete Patient"
        visible={showDeleteDialog}
        onHide={() => {
          setShowDeleteDialog(false);
        }}
      >
        <div className="flex flex-col">
          <p>
            Are you sure you want to delete
            {` ${selectedPatient ? [selectedPatient.firstName, selectedPatient.middleName ?? "", selectedPatient.lastName].join(" ") : "this patient"}`}
            ?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => {
                setShowDeleteDialog(false);
              }}
            />
            <Button
              label="Confirm"
              className="p-button-primary"
              onClick={() => {
                handleDeletePatient();
                setShowDeleteDialog(false);
              }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
});

PatientTable.displayName = "PatientTable";

export default PatientTable;
