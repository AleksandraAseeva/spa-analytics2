import { ref } from "vue";

export function useProductData() {
  const currentPeriodData = ref([]);
  const previousPeriodData = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Вспомогательная функция для получения дат недели
  const getWeekDates = (baseDate = new Date()) => {
    const date = new Date(baseDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);

    const monday = new Date(date.setDate(diff));
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    return { monday, nextMonday };
  };

  const fetchDayData = async (date, apiKey) => {
    try {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const params = new URLSearchParams({
        key: apiKey,
        limit: 100,
        page: 1,
        dateFrom: date.toISOString().split("T")[0],
        dateTo: nextDay.toISOString().split("T")[0],
      });

      const response = await fetch(
        `/api/orders?${params}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (err) {
      console.error(`Ошибка при загрузке данных за ${date}:`, err);
      error.value = err.message;
      return { data: [] };
    }
  };

  const fetchWeekData = async (period = "current", apiKey) => {
    loading.value = true;
    error.value = null;

    try {
      const now = new Date();
      const { monday, nextMonday } = getWeekDates(
        period === "previous" ? new Date(now.setDate(now.getDate() - 7)) : now
      );

      const dates = [];
      const currentDate = new Date(monday);
      while (currentDate < nextMonday) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

   const allData = [];
    for (const date of dates) {
      const response = await fetchDayData(date, apiKey);
      if (response.data) {
        allData.push(...response.data);
      }
    }
      return allData;
    } catch (err) {
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const getUniqueValues = (data, key) => {
    return [...new Set(data.map((item) => item[key]))].filter(Boolean);
  };

  return {
    currentPeriodData,
    previousPeriodData,
    loading,
    error,
    fetchWeekData,
    getUniqueValues,
  };
}
