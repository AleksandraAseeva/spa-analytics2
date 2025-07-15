export function useDateUtils() {
  const getWeekDates = (baseDate = new Date()) => {
    const date = new Date(baseDate);
    const day = date.getDay();
    
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return { 
      monday, 
      sunday,
      nextMonday: new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000)
    };
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