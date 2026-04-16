/**
 * Convert Python scheduler output to DB allocations
 */
export const mapMlResultToAlloc = ({
  result,
  organizationId,
  departmentId,
  shiftMap, // { "Morning": shiftId }
  userMap, // { "userId": userId }
  weekStart, // "YYYY-MM-DD" — Monday of the scheduled week
}) => {
  const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const records = [];

  for (const day of result.schedule) {
    // Convert day name ("Mon"…"Sun") to actual Date
    const dayIndex = DAY_ORDER.indexOf(day.day);
    const date = new Date(weekStart);
    date.setUTCDate(date.getUTCDate() + (dayIndex >= 0 ? dayIndex : 0));

    for (const [shiftName, staff] of Object.entries(day.shifts)) {
      const shiftId = shiftMap[shiftName];
      if (!shiftId) continue; // skip unknown shifts

      for (const staffCode of staff) {
        const userId = userMap[staffCode];
        if (!userId) continue; // skip unknown users

        records.push({
          organizationId,
          departmentId,
          shiftId,
          userId,
          date,
          source: "ML",
          objectiveScore: result.objective,
        });
      }
    }
  }

  return records;
};
