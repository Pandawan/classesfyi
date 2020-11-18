export const availableCampuses = {
  fh: "Foothill College",
  da: "De Anza College",
  // wv: "West Valley College",
  // mc: "Mission College",
};

export type CampusId = keyof typeof availableCampuses;

export function isAvailableCampus(value: string): value is CampusId {
  return availableCampuses[value] !== undefined;
}
