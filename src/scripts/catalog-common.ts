export type Availability = "E" | "C" | "P" | "R" | "U";

export const AVAILABILITY_LABELS: Record<string, string> = {
  E: "Excellent",
  C: "Common",
  P: "Poor",
  R: "Rare",
  U: "Unique",
};
