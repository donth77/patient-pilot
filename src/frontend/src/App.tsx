import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useAuth } from "./AuthContext";
import { autoLoginDefaultUser } from "./authService";
import PatientDialog from "./components/PatientDialog";
import PatientTable from "./components/PatientTable";

function App() {
  const [isLoading, setLoading] = useState(true);
  const { idToken, selectedProvider, setIdToken, setSelectedProvider } =
    useAuth();
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const patientTableRef = useRef<{ fetchPatients: () => void }>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await autoLoginDefaultUser(setIdToken, setSelectedProvider);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setIdToken, setSelectedProvider]);

  return (
    <div className="flex flex-col h-screen">
      {isLoading ? (
        <div className="flex items-center justify-center h-1/2">
          <ProgressSpinner />
        </div>
      ) : (
        <>
          <header className="w-full h-16 flex px-20 py-6 bg-white items-center shadow-md justify-between">
            <span className="flex items-center gap-2">
              <img src="/assets/heart-with-pulse.png" alt="PatientPilot Logo" />
              <h1 className="text-2xl font-bold text-black">PatientPilot</h1>
            </span>

            <span>{selectedProvider?.name}</span>
          </header>

          <main className="bg-ghostWhite w-full px-20 py-12 flex flex-col gap-8 h-full">
            <div className="flex justify-between">
              <h1 className="text-2xl font-bold text-black">
                Patient Management
              </h1>

              <Button
                label="Add New Patient"
                icon="pi pi-plus"
                className="p-button-primary"
                onClick={() => setShowAddPatientDialog(true)}
              />

              <PatientDialog
                visible={showAddPatientDialog}
                onHide={() => setShowAddPatientDialog(false)}
                onPatientUpdate={() => patientTableRef.current?.fetchPatients()}
                mode="Add"
              />
            </div>

            <PatientTable ref={patientTableRef} />
          </main>
        </>
      )}
    </div>
  );
}

export default App;
