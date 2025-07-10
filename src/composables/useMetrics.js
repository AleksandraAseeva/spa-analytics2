import { useDateUtils } from "./useDateUtils";

export function useMetrics() {
  const { getWeekDates, formatDateLabel } = useDateUtils();

  const processMetricData = (data, metricKey) => {
    if (!data || !Array.isArray(data)) return {};

    const { monday, nextMonday } = getWeekDates();
    const weekDates = [];
    const currentDate = new Date(monday);

    while (currentDate < nextMonday) {
      weekDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data.reduce((acc, item) => {
      const date = item.date?.split(" ")[0];
      if (!date || !weekDates.includes(date)) return acc;

      if (!acc[date]) acc[date] = { count: 0, sum: 0 };

      switch (metricKey) {
        case "sales_count":
          acc[date].sum += 1;
          break;
        case "avg_price":
          acc[date].sum += parseFloat(item.total_price) || 0;
          acc[date].count += 1;
          break;
        case "cancel_count":
          if (item.is_cancel) acc[date].sum += 1;
          break;
        case "avg_discount":
          acc[date].sum += parseFloat(item.discount_percent) || 0;
          acc[date].count += 1;
          break;
      }

      return acc;
    }, {});
  };

  const getChartData = (metricKey, metrics, data) => {
    const metricData = processMetricData(data, metricKey);
    const { monday, nextMonday } = getWeekDates();
    const weekDates = [];
    const currentDate = new Date(monday);

    while (currentDate < nextMonday) {
      weekDates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const chartData = weekDates.map((date) => {
      const d = metricData[date] || { count: 0, sum: 0 };
      return metricKey.includes("avg")
        ? d.count
          ? d.sum / d.count
          : 0
        : d.sum;
    });

    return {
      labels: weekDates.map(formatDateLabel),
      datasets: [
        {
          label: metrics.find((m) => m.key === metricKey)?.title || metricKey,
          data: chartData,
          backgroundColor: "#36A2EB",
        },
      ],
    };
  };

  const getTopProducts = (metricKey, currentData, previousData, limit = 5) => {
    if (!currentData || !previousData) return [];
    if (!currentData || !Array.isArray(currentData)) return [];
    if (!previousData) previousData = [];

    const products = {};

    previousData.forEach((item) => {
      if (!item?.nm_id) return;

      const nm_id = item.nm_id.toString();
      if (!products[nm_id]) {
        products[nm_id] = { current: 0, previous: 0 };
      }

      switch (metricKey) {
        case "sales_count":
          products[nm_id].previous += 1;
          break;
        case "avg_price":
          products[nm_id].previous += parseFloat(item.total_price) || 0;
          break;
        case "cancel_count":
          if (item.is_cancel) products[nm_id].previous += 1;
          break;
        case "avg_discount":
          products[nm_id].previous += parseFloat(item.discount_percent) || 0;
          break;
      }
    });

    currentData.forEach((item) => {
      if (!item?.nm_id) return;

      const nm_id = item.nm_id.toString();
      if (!products[nm_id]) {
        products[nm_id] = { current: 0, previous: 0 };
      }

      switch (metricKey) {
        case "sales_count":
          products[nm_id].current += 1;
          break;
        case "avg_price":
          products[nm_id].current += parseFloat(item.total_price) || 0;
          break;
        case "cancel_count":
          if (item.is_cancel) products[nm_id].current += 1;
          break;
        case "avg_discount":
          products[nm_id].current += parseFloat(item.discount_percent) || 0;
          break;
      }
    });

    const result = Object.entries(products)
      .map(([nm_id, values]) => {
        const change = values.previous
          ? ((values.current - values.previous) / values.previous) * 100
          : values.current > 0
          ? 100
          : 0;

        return {
          nm_id,
          current: values.current,
          previous: values.previous,
          change: parseFloat(change.toFixed(2)),
          isIncrease: change > 0,
        };
      })
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    return typeof limit === "number" && limit > 0
      ? result.slice(0, limit)
      : result;
  };

  return {
    getChartData,
    getTopProducts,
  };
}
