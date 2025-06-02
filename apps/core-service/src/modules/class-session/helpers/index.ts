export function timeStringToDate(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

export function timeStringToNextDate(timeString) {
  console.log('timeString---->', timeString);
  const [dayStr, hourStr, minuteStr] = timeString.split(':');
  const targetDay = dayStr.trim();
  console.log('targetDay---->', targetDay);
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const targetDayIndex = daysOfWeek.indexOf(targetDay);

  if (targetDayIndex === -1) {
    throw new Error('Invalid day of the week: ' + dayStr);
  }

  const now = new Date();
  const result = new Date(now);
  result.setHours(hours, minutes, 0, 0);

  const currentDayIndex = now.getDay();
  let daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;

  // If it's the same day but time has already passed today, move to next week's same day
  if (daysUntilTarget === 0 && result <= now) {
    daysUntilTarget = 7;
  }

  result.setDate(now.getDate() + daysUntilTarget);
  return result;
}
