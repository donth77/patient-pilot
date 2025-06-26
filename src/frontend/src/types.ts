import { FieldValue } from "firebase-admin/firestore";

export interface VerifyPasswordResponse {
  kind: string;
  localId: string;
  email: string;
  displayName: string;
  idToken: string;
  registered: boolean;
  refreshToken: string;
  expiresIn: string;
}

export interface Patient {
  id: string; // Firestore document ID
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  status: "INQUIRY" | "ONBOARDING" | "ACTIVE" | "CHURNED";
  address: GooglePlaceResult;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  profileImageUrl?: string | null;
}

export interface Provider {
  id: string; // Firestore document ID
  name: string;
  email: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  profileImageUrl?: string | null;
}

export enum Status {
  Inquiry = "Inquiry",
  Onboarding = "Onboarding",
  Active = "Active",
  Churned = "Churned",
}

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
