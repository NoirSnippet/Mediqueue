/**
 * Helper to parse "HH:MM:SS" or "HH:MM" into minutes from midnight
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 60 + parts[1];
}

/**
 * Helper to convert minutes from midnight to "HH:MM:SS"
 */
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/**
 * Helper to format minutes to 12-hour display string (e.g. "09:30 AM")
 */
function minutesTo12Hr(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Generate available and booked slots for a doctor on a specific date
 *
 * @param {Object} schedule - { start_time, end_time, slot_duration_minutes }
 * @param {Array<string>} bookedTimes - Array of times already booked (e.g., ['09:00:00', '09:30:00'])
 * @param {string} targetDate - Date string in 'YYYY-MM-DD'
 * @returns {Array<Object>} List of slots with availability flag
 */
function generateTimeSlots(schedule, bookedTimes = [], targetDate = null) {
  if (!schedule || !schedule.start_time || !schedule.end_time) {
    return [];
  }

  const startMinutes = timeToMinutes(schedule.start_time);
  const endMinutes = timeToMinutes(schedule.end_time);
  const duration = schedule.slot_duration_minutes || 20;

  // Standardize booked times to 'HH:MM:SS'
  const bookedSet = new Set(
    bookedTimes.map(t => {
      if (typeof t === 'string') {
        const parts = t.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
      }
      return t;
    })
  );

  // Check if targetDate is today to detect past slots
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isToday = targetDate === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];

  for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
    const time24 = minutesToTime(current);
    const timeDisplay = minutesTo12Hr(current);
    const isBooked = bookedSet.has(time24);
    const isPast = isToday && current <= currentMinutes;
    const isAvailable = !isBooked && !isPast;

    slots.push({
      time: time24,
      displayTime: timeDisplay,
      isBooked,
      isPast,
      isAvailable,
      reason: isBooked ? 'Already booked' : isPast ? 'Time slot has passed' : 'Available',
    });
  }

  return slots;
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  minutesTo12Hr,
  generateTimeSlots,
};
