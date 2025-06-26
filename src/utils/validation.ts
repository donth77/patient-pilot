export function isValidISODate(dateString: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/; // Check if matches ISO 8601 (YYYY-MM-DD)

  if (!isoDateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString); // check if valid date

  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    date.toISOString().split("T")[0] === dateString // Check if date is valid and matches the input str
  );
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateDateOfBirth = (dateOfBirth: string): ValidationResult => {
  if (!dateOfBirth) {
    return {
      isValid: false,
      message: "Date of birth is required",
    };
  }

  const date = new Date(dateOfBirth);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: "Invalid date format",
    };
  }

  // Check date is not in the future
  const today = new Date();
  if (date > today) {
    return {
      isValid: false,
      message: "Date of birth cannot be in the future",
    };
  }

  // Check date not too far in the past (more than 150 years ago)
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 150);
  if (date < maxAge) {
    return {
      isValid: false,
      message: "Date of birth cannot be more than 150 years ago",
    };
  }

  return {
    isValid: true,
  };
};

export function isValidFutureDate(dateString: string): boolean {
  if (!isValidISODate(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  const today = new Date();

  return date >= today;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
