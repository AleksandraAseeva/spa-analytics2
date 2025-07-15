<template>
  <div class="metric-page">
    <div class="filters">
      <select v-model="filters.nm_id" class="filter-select">
        <option value="">Все артикулы</option>
        <option v-for="nm_id in availableNmIds" :key="nm_id" :value="nm_id">
          {{ nm_id }}
        </option>
      </select>

      <select v-model="filters.date" class="filter-select">
        <option value="">Все даты</option>
        <option v-for="date in availableDates" :key="date" :value="date">
          {{ formatDate(date) }}
        </option>
      </select>

      <select v-model="filters.oblast" class="filter-select">
        <option value="">Все регионы</option>
        <option
          v-for="oblast in availableOblasts"
          :key="oblast"
          :value="oblast"
        >
          {{ oblast }}
        </option>
      </select>

      <select v-model="filters.category" class="filter-select">
        <option value="">Все категории</option>
        <option
          v-for="category in availableCategories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>

      <select v-model="filters.brand" class="filter-select">
        <option value="">Все бренды</option>
        <option v-for="brand in availableBrands" :key="brand" :value="brand">
          {{ brand }}
        </option>
      </select>

    </div>

    <div class="dashboard">
      <div class="metric-card">
        <h3>{{ metricTitle }}</h3>
        <ChartComponent
          :data="getChartData(metric)"
          chartType="bar"
          class="clickable-chart"
        />
        <TopProductsTable
          :items="getAllProducts(metric)"
          @row-click="goToProductPage"
          show-all
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ChartComponent from "@/components/ChartComponent.vue";
import TopProductsTable from "@/components/TopProductsTable.vue";

const route = useRoute();
const router = useRouter();

const metric = route.params.metric;

const filters = ref({
  nm_id: "",
  date: "",
  oblast: "",
  category: "",
  brand: "",
});

const currentPeriodData = ref([]);
const previousPeriodData = ref([]);

const metrics = [
  { key: "sales_count", title: "Количество продаж" },
  { key: "avg_price", title: "Средняя цена продажи" },
  { key: "cancel_count", title: "Количество отмен" },
  { key: "avg_discount", title: "Средний размер скидки" },
];

const metricTitle = computed(() => {
  const metricObj = metrics.find((m) => m.key === metric);
  return metricObj ? metricObj.title : "Неизвестный показатель";
});

const availableNmIds = computed(() => {
  const ids = [
    ...new Set(currentPeriodData.value.map((item) => item.nm_id?.toString())),
  ];
  return ids.filter(Boolean).sort();
});

const availableDates = computed(() => {
  const dates = [
    ...new Set(currentPeriodData.value.map((item) => item.date?.split(" ")[0])),
  ];
  return dates.filter(Boolean).sort().reverse();
});

const availableOblasts = computed(() => {
  return [...new Set(currentPeriodData.value.map((item) => item.oblast))]
    .filter(Boolean)
    .sort();
});

const availableCategories = computed(() => {
  return [...new Set(currentPeriodData.value.map((item) => item.category))]
    .filter(Boolean)
    .sort();
});

const availableBrands = computed(() => {
  return [...new Set(currentPeriodData.value.map((item) => item.brand))]
    .filter(Boolean)
    .sort();
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU");
};

const filteredCurrentData = computed(() => {
  return currentPeriodData.value.filter((item) => {
    const itemDate = item.date?.split(" ")[0];
    const itemNmId = item.nm_id?.toString();

    return (
      (!filters.value.nm_id || itemNmId === filters.value.nm_id) &&
      (!filters.value.date || itemDate === filters.value.date) &&
      (!filters.value.oblast || item.oblast === filters.value.oblast) &&
      (!filters.value.category || item.category === filters.value.category) &&
      (!filters.value.brand || item.brand === filters.value.brand)
    );
  });
});

const filteredPreviousData = computed(() => {
  return previousPeriodData.value.filter((item) => {
    const itemNmId = item.nm_id?.toString();
    return (
      (!filters.value.nm_id || itemNmId === filters.value.nm_id) &&
      (!filters.value.oblast || item.oblast === filters.value.oblast) &&
      (!filters.value.category || item.category === filters.value.category) &&
      (!filters.value.brand || item.brand === filters.value.brand)
    );
  });
});

// Подготовка данных для графиков
const getChartData = (metricKey) => {
  const { monday, nextMonday } = getWeekDates();
  const weekDates = [];
  const currentDate = new Date(monday);

  while (currentDate < nextMonday) {
    weekDates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const metricData = filteredCurrentData.value.reduce((acc, item) => {
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

  const chartData = weekDates.map((date) => {
    const d = metricData[date] || { count: 0, sum: 0 };
    return metricKey.includes("avg") ? (d.count ? d.sum / d.count : 0) : d.sum;
  });

  return {
    labels: weekDates.map((date) => {
      const d = new Date(date);
      return `${d.toLocaleDateString("ru-RU", {
        weekday: "short",
      })} ${d.getDate()}`;
    }),
    datasets: [
      {
        label: metrics.find((m) => m.key === metricKey).title,
        data: chartData,
        backgroundColor: "#36A2EB",
      },
    ],
  };
};

// Получение ВСЕХ товаров для таблицы
const getAllProducts = (metricKey) => {
  if (filteredCurrentData.value.length === 0) {
    return [];
  }

  const currentData = filteredCurrentData.value;
  const previousData = filteredPreviousData.value;

  const products = {};


  currentData.forEach((item) => {
    const nm_id = item.nm_id?.toString();
    if (!nm_id) return;

    if (!products[nm_id]) products[nm_id] = { current: 0, previous: 0 };

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

  previousData.forEach((item) => {
    const nm_id = item.nm_id?.toString();
    if (!nm_id) return;

    if (!products[nm_id]) products[nm_id] = { current: 0, previous: 0 };

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

  return Object.entries(products)
    .map(([nm_id, values]) => {
      const change = values.previous
        ? ((values.current - values.previous) / Math.abs(values.previous)) * 100
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
};

const getWeekDates = (baseDate = new Date()) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(date.setDate(diff));
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  return { monday, nextMonday };
};

const fetchDayData = async (date) => {
  try {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const url = new URL("/api/orders", window.location.origin);
    const params = {
      key: "E6kUTYrYwZq2tN4QEtyzsbEBk3ie",
      limit: 100,
      dateFrom: date.toISOString().split("T")[0],
      dateTo: nextDay.toISOString().split("T")[0],
    };

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return (await response.json()).data;
  } catch (err) {
    console.error(`Ошибка при загрузке данных за ${date}:`, err);
    return [];
  }
};

const fetchWeekData = async (period = "current") => {
  const now = new Date();
  const { monday, nextMonday } = getWeekDates(
    period === "previous" ? new Date(now.setDate(now.getDate() - 7)) : now
  );

  const weekDates = [];
  const currentDate = new Date(monday);
  while (currentDate < nextMonday) {
    weekDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const allData = [];
  for (const date of weekDates) {
    const dayData = await fetchDayData(date);
    allData.push(...dayData);
  }

  return allData;
};

const goToProductPage = (nm_id) => {
  router.push({
    name: "product",
    params: { nm_id },
    query: { ...filters.value },
  });
};

watch(
  filters,
  (newFilters) => {
    localStorage.setItem("dashboardFilters", JSON.stringify(newFilters));

    router.replace({
      query: { ...newFilters },
    });
  },
  { deep: true }
);

// Загрузка данных при монтировании
onMounted(async () => {
  // Восстановление фильтров из localStorage
  const savedFilters = localStorage.getItem("dashboardFilters");
  if (savedFilters) {
    filters.value = JSON.parse(savedFilters);
  }

  if (route.query.nm_id) filters.value.nm_id = route.query.nm_id;
  if (route.query.date) filters.value.date = route.query.date;
  if (route.query.oblast) filters.value.oblast = route.query.oblast;
  if (route.query.category) filters.value.category = route.query.category;
  if (route.query.brand) filters.value.brand = route.query.brand;

  currentPeriodData.value = await fetchWeekData("current");
  previousPeriodData.value = await fetchWeekData("previous");
});
</script>

<style scoped>
.metric-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-select {
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #e1e5eb;
  background: #ffffff;
  color: #333;
  font-size: 14px;
  min-width: 180px;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.filter-select:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.15);
}

.filter-select:hover {
  border-color: #c2c9d6;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.dashboard {
  display: flex;
  flex-direction: column;
}

.metric-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  padding: 25px;
  margin-bottom: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2c3e50;
  font-size: 1.4rem;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .filters {
    gap: 10px;
  }

  .filter-select {
    min-width: 160px;
  }

  .metric-page {
  padding: 0px;
}
}

@media (max-width: 992px) {
  .filters {
    gap: 8px;
  }

  .filter-select {
    min-width: 140px;
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    gap: 10px;
  }

  .filter-select {
    width: 100%;
    min-width: auto;
  }

  .metric-card {
    padding: 20px 15px;
  }
}
</style>