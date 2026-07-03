// The `@filters` slot has no equivalent for nested routes (e.g. /estoque/[vehicleId]).
// Returning `null` here keeps those routes from 404-ing on the unmatched slot.
export default function FiltersDefault() {
  return null;
}
