import { GooglePlaceAddressComponent } from "./types";

export function formatAddressComponents(
  components: GooglePlaceAddressComponent[]
) {
  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let postalCode = "";

  components.forEach((component) => {
    const types = component.types;

    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    } else if (types.includes("route")) {
      route = component.long_name;
    } else if (types.includes("locality")) {
      city = component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      state = component.short_name;
    } else if (types.includes("postal_code")) {
      postalCode = component.long_name;
    }
  });

  const line1 = `${streetNumber} ${route}`.trim();
  const line2 = `${city}, ${state} ${postalCode}`.trim();

  return [line1, line2];
}

export const capitalizeStr = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
