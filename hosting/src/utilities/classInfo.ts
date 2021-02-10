import { CampusId } from "./campus";

export interface ShortClassInfo {
  campus: CampusId;
  year: number;
  term: string;
  crn: number;
}
