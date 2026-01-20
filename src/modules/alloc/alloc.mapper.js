/**
 * Convert Python scheduler output to DB allocations
 */
export const mapMlResultToAlloc = ({
  result,
  organizationId,
  departmentId,
  shiftMap, // { "Morning": shiftId }
  userMap, // { "D1": userId }
}) => {
  const records = [];

  for (const day of result.schedule) {
    const date = day.day; // we will convert later to real date

    for (const [shiftName, staff] of Object.entries(day.shifts)) {
      const shiftId = shiftMap[shiftName];

      for (const staffCode of staff) {
        records.push({
          organizationId,
          departmentId,
          shiftId,
          userId: userMap[staffCode],
          date,
          source: "ML",
          objectiveScore: result.objective,
        });
      }
    }
  }

  return records;
};
