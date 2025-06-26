import { getFirestore } from "firebase-admin/firestore";

export const db = getFirestore();

export const getProviderRef = (providerId: string) => {
  return db.collection("providers").doc(providerId);
};

export const getPatientsCollection = (providerId: string) => {
  return getProviderRef(providerId).collection("patients");
};

export const getPatientRef = (providerId: string, patientId: string) => {
  return getPatientsCollection(providerId).doc(patientId);
};
