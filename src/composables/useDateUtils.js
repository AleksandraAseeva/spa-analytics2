export function useDateUtils() {
  const getWeekDates = (baseDate = new Date()) => {
    const date = new Date(baseDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    
    const monday = new Date(date.setDate(diff));
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    return { monday, nextMonday };
  };

  const formatDateLabel = (dateString) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('ru-RU', { weekday: 'short' })} ${d.getDate()}`;
  };

  return {
    getWeekDates,
    formatDateLabel
  };
}