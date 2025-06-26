import { useState, useEffect } from "react";
import Autocomplete from "react-google-autocomplete";
import { toast } from "react-hot-toast";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { API_BASE_URL } from "../constants";
import { useAuth } from "../AuthContext";
import { GooglePlaceResult, Patient, Status } from "../types";
import { capitalizeStr } from "../utils";

interface AddNewPatientDialogProps {
  visible: boolean;
  onHide: () => void;
  onPatientUpdate?: () => void;
  mode: "Add" | "Edit";
  editPatient?: Patient | null; // Optional, only used in Edit mode
}

const AddNewPatientDialog: React.FC<AddNewPatientDialogProps> = ({
  visible,
  onHide,
  onPatientUpdate,
  mode,
  editPatient,
}) => {
  const [firstName, setFirstName] = useState(
    editPatient ? editPatient.firstName : ""
  );
  const [middleName, setMiddleName] = useState(
    editPatient ? editPatient.middleName || "" : ""
  );
  const [lastName, setLastName] = useState(
    editPatient ? editPatient.lastName : ""
  );
  const [birthDate, setBirthDate] = useState<Date | null>(
    editPatient ? new Date(editPatient.dateOfBirth) : null
  );
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(
    editPatient
      ? Object.values(Status).includes(
          capitalizeStr(editPatient.status) as Status
        )
        ? (capitalizeStr(editPatient.status) as Status)
        : null
      : null
  );
  const [address, setAddress] = useState<GooglePlaceResult | null>(
    editPatient ? editPatient.address : null
  );
  const [profileImageUrl, setProfileImageUrl] = useState(
    editPatient ? editPatient.profileImageUrl || "" : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageURLInvalid, setImageURLInvalid] = useState(false);

  const { idToken } = useAuth();

  useEffect(() => {
    if (editPatient != null) {
      setFirstName(editPatient.firstName);
      setMiddleName(editPatient.middleName || "");
      setLastName(editPatient.lastName);
      setBirthDate(new Date(editPatient.dateOfBirth));
      setSelectedStatus(
        Object.values(Status).includes(
          capitalizeStr(editPatient.status) as Status
        )
          ? (capitalizeStr(editPatient.status) as Status)
          : null
      );
      setAddress(editPatient.address);
      setProfileImageUrl(editPatient.profileImageUrl || "");
    }
  }, [editPatient]);

  const handleAddOrUpdatePatient = async () => {
    if (
      !firstName ||
      !lastName ||
      !birthDate ||
      !selectedStatus ||
      !address ||
      !idToken
    ) {
      console.error("Missing required fields or authentication token");
      return;
    }

    setIsSubmitting(true);

    try {
      const patientData = {
        firstName,
        middleName: middleName || null,
        lastName,
        dateOfBirth: birthDate.toISOString(),
        status: selectedStatus.toUpperCase(),
        address,
        ...(profileImageUrl ? { profileImageUrl } : {}),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/patients${mode === "Add" ? "" : `/${editPatient?.id}`}`,
        {
          method: mode === "Add" ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(patientData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${mode === "Add" ? "create" : "edit"} patient: ${response.status}`
        );
      }

      await response.json();
      toast.success(
        `Patient ${mode === "Add" ? "added" : "edited"} successfully!`
      );

      // Reset form
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setBirthDate(null);
      setSelectedStatus(null);
      setAddress(null);
      setProfileImageUrl("");

      // Trigger refresh of patient list
      if (onPatientUpdate) {
        onPatientUpdate();
      }
    } catch (error) {
      console.error(
        `Error ${mode === "Add" ? "creating" : "editing"}  patient:`,
        error
      );
      toast.error(`Failed to ${mode.toLowerCase()} patient.`);
    } finally {
      setIsSubmitting(false);
      onHide(); // Close dialog
    }
  };

  return (
    <Dialog
      className="size-fit"
      header={`${mode === "Add" ? "Add New" : "Edit"}  Patient`}
      visible={visible}
      onHide={onHide}
      draggable={false}
    >
      <span className="flex gap-2 w-full">
        <InputText
          type="text"
          className="p-inputtext-md"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <InputText
          type="text"
          className="p-inputtext-md"
          placeholder="Middle Name (optional)"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
        />
        <InputText
          type="text"
          className="p-inputtext-md"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </span>

      <FloatLabel className="mt-8">
        <Calendar
          inputId="birth_date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.value ?? null)}
        />
        <label htmlFor="birth_date">Birth Date</label>
      </FloatLabel>

      <Dropdown
        className="mt-8"
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.value)}
        options={Object.values(Status)}
        optionLabel="status"
        placeholder="Select a status"
      />

      <div className="mt-8">
        <Autocomplete
          className="outline-none border border-gray-300 rounded-md w-full px-2 h-10"
          apiKey={import.meta.env.VITE_GOOGLE_API_KEY}
          onPlaceSelected={(place) => setAddress(place as GooglePlaceResult)}
          options={{
            types: [],
          }}
          placeholder="Search for address"
          defaultValue={address?.formatted_address || ""}
        />
      </div>

      {/* Profile Image Upload */}
      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">
          Profile Image (Optional)
        </label>
        <section className="min-h-[125px]">
          <InputText
            type="url"
            className="w-full"
            placeholder="Enter image URL (https://...)"
            value={profileImageUrl}
            onChange={(e) => {
              setProfileImageUrl(e.target.value.trim());
              setImageURLInvalid(false);
            }}
          />
          {profileImageUrl && (
            <div className="mt-2 w-full flex justify-center">
              <img
                src={profileImageUrl}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-full"
                onError={() => setImageURLInvalid(true)}
              />
            </div>
          )}
        </section>
      </div>

      <Divider />

      <div className="flex w-full justify-end mt-6">
        <Button
          label={isSubmitting ? "Submitting…" : `${mode} Patient`}
          icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-plus"}
          onClick={handleAddOrUpdatePatient}
          disabled={
            !firstName ||
            !lastName ||
            !birthDate ||
            !selectedStatus ||
            !address ||
            isImageURLInvalid ||
            isSubmitting
          }
        />
      </div>
    </Dialog>
  );
};

export default AddNewPatientDialog;
