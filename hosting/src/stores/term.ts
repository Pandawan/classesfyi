import { CampusId } from "../utilities/campus";
import { getCurrentTermData } from "../utilities/openCourseApi";
import queryString from "query-string";

// TODO: See if I can implement this using a store instead?
// TODO: Remember/keep the query params when navigating across pages?
/*
If you navigate from /lookup/da/whatever
  - Render the current term's data
If you navigate from /lookup/da/whatever?year=2020&term=winter
  - Render the data for 2020 winter
*/

interface Term {
  year: number | null;
  term: string | null;
}

type CurrentTermCache = Partial<
  Record<
    CampusId,
    Term | undefined
  >
>;

// NOTE: Not a reactive store because don't want a page to suddenly change if the term changes in the middle of page viewing
// Instead, this acts as a cache
const currentTermCache: CurrentTermCache = {};

/**
   * Update the term store's term for the given campus to whichever is the latest available in OpenCourseAPI.
   * @param campusId The campus to update.
   */
export async function refreshCurrentTermData(campusId: CampusId) {
  const [apiError, currentTermData] = await getCurrentTermData(campusId);

  if (apiError !== null) {
    console.error("Could not update term store", apiError.toString());
    return;
  }

  currentTermCache[campusId] = {
    year: currentTermData.year,
    term: currentTermData.term,
  };
}

/**
 * Get or fetch the term data for the given campus.
 * @param campusId 
 */
export async function getOrFetchTerm(campusId: CampusId): Promise<Term> {
  // If there are query parameters, attempt to parse them for term & year
  if (location.search) {
    const queryParams = queryString.parse(
      location.search,
      { parseNumbers: true },
    );
    // Try to get term & year from query parameters if found
    const term = queryParams.term;
    const year = queryParams.year;
    if (
      term && year &&
      typeof term === "string" && typeof year === "number"
    ) {
      return {
        year: +year,
        term,
      };
    }
  }

  if (!currentTermCache[campusId]) {
    await refreshCurrentTermData(campusId);
  }
  return currentTermCache[campusId];
}
