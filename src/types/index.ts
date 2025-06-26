import { FieldValue } from "firebase-admin/firestore";

export interface GooglePlaceAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GooglePlaceGeometry {
  location: {
    lat: () => number;
    lng: () => number;
  };
  viewport?: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface GooglePlaceResult {
  address_components?: GooglePlaceAddressComponent[];
  formatted_address: string;
  geometry?: GooglePlaceGeometry;
  place_id?: string;
}

export interface Patient {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  status: "INQUIRY" | "ONBOARDING" | "ACTIVE" | "CHURNED";
  address: GooglePlaceResult;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
  profileImageUrl?: string | null;
}

export interface Provider {
  name: string;
  email: string;
  createdAt: FirebaseFirestore.FieldValue;
  updatedAt: FirebaseFirestore.FieldValue;
  profileImageUrl?: string | null;
}
