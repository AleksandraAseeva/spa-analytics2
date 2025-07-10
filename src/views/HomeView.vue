<template>
  <div class="products-page">
    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filters.oblast" class="filter-select">
        <option value="">Все регионы</option>
        <option v-for="oblast in oblasts" :key="oblast" :value="oblast">
          {{ oblast }}
        </option>
      </select>

      <select v-model="filters.nm_id" class="filter-select">
        <option value="">Все артикулы</option>
        <option v-for="nm_id in nm_ids" :key="nm_id" :value="nm_id">
          {{ nm_id }}
        </option>
      </select>

      <select v-model="filters.last_change_date" class="filter-select">
        <option value="">Все даты</option>
        <option
          v-for="last_change_date in last_change_dates"
          :key="last_change_date"
          :value="last_change_date"
        >
          {{ last_change_date }}
        </option>
      </select>

      <select v-model="filters.category" class="filter-select">
        <option value="">Все категории</option>
        <option
          v-for="category in categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>

      <select v-model="filters.brand" class="filter-select">
        <option value="">Все бренды</option>
        <option v-for="brand in brands" :key="brand" :value="brand">
          {{ brand }}
        </option>
      </select>

      <button @click="applyFilters" class="filter-button">Применить</button>
    </div>

    <div class="dashboard">
      <div v-for="(metric, index) in metrics" :key="index" class="metric-card">
        <h3>{{ metric.title }}</h3>
        <ChartComponent
          :data="getChartData(metric.key, metrics, filteredData)"
          chartType="bar"
          @click="goToMetricPage(metric.key)"
          class="clickable-chart"
        />
        <TopProductsTable
          :items="topProductsData(metric.key)"
          @row-click="goToProductPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import ChartComponent from "@/components/ChartComponent.vue";
import TopProductsTable from "@/components/TopProductsTable.vue";
import { useFilterManagement } from "@/composables/useFilterManagement";
import { useProductData } from "@/composables/useProductData";
import { useMetrics } from "@/composables/useMetrics";
import { useDateUtils } from "@/composables/useDateUtils";

const router = useRouter();
const { getWeekDates } = useDateUtils();
const { getChartData, getTopProducts } = useMetrics();

const API_KEY = "E6kUTYrYwZq2tN4QEtyzsbEBk3ie";

// Инициализация фильтров
const { filters, loadFilters } = useFilterManagement({
  nm_id: "",
  oblast: "",
  category: "",
  brand: "",
  last_change_date: "",
});

// Работа с данными
const {
  currentPeriodData,
  previousPeriodData,
  fetchWeekData,
  getUniqueValues,
} = useProductData(getWeekDates);

const metrics = [
  { key: "sales_count", title: "Количество продаж" },
  { key: "avg_price", title: "Средняя цена продажи" },
  { key: "cancel_count", title: "Количество отмен" },
  { key: "avg_discount", title: "Средний размер скидки" },
];

const filteredData = computed(() => {
  return currentPeriodData.value.filter((item) => {
    return (
      (!filters.value.nm_id ||
        item.nm_id.toString().includes(filters.value.nm_id.toString())) &&
      (!filters.value.oblast || item.oblast === filters.value.oblast) &&
      (!filters.value.category || item.category === filters.value.category) &&
      (!filters.value.brand || item.brand === filters.value.brand) &&
      (!filters.value.last_change_date ||
        item.last_change_date === filters.value.last_change_date)
    );
  });
});

const oblasts = computed(() =>
  getUniqueValues(currentPeriodData.value, "oblast")
);
const categories = computed(() =>
  getUniqueValues(currentPeriodData.value, "category")
);
const brands = computed(() =>
  getUniqueValues(currentPeriodData.value, "brand")
);

const nm_ids = computed(() =>
  getUniqueValues(currentPeriodData.value, "nm_id")
);

const last_change_dates = computed(() =>
  getUniqueValues(currentPeriodData.value, "last_change_date")
);

// Навигация
const goToMetricPage = (metric) => {
  router.push({
    name: "metric",
    params: { metric },
    query: { ...filters.value },
  });
};

const goToProductPage = (nm_id) => {
  router.push({
    name: "product",
    params: { nm_id },
    query: { ...filters.value },
  });
};

const topProductsData = computed(() => (metricKey) => {
  return getTopProducts(
    metricKey,
    filteredData.value,
    previousPeriodData.value
  );
});

// Загрузка данных
const isLoading = ref(true);

const loadData = async () => {
  isLoading.value = true;
  try {
    const [current, previous] = await Promise.all([
      fetchWeekData("current", API_KEY),
      fetchWeekData("previous", API_KEY),
    ]);

    currentPeriodData.value = current;
    previousPeriodData.value = previous;
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = async () => {
  await loadData();
};

onMounted(async () => {
  loadFilters();
  await loadData();
});
</script>

<style scoped>
.products-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.filter-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  outline: none;
  background-color: #ffffff;
}

.filter-select {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  appearance: none;
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  outline: none;
  background-color: #ffffff;
}

.filter-button {
  padding: 12px 24px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.filter-button:hover {
  background-color: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.filter-button:active {
  transform: translateY(0);
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.clickable-chart {
  cursor: pointer;
}

@media (max-width: 992px) {
  .filters {
    flex-direction: column;
    gap: 12px;
  }

  .filter-input,
  .filter-select {
    width: 100%;
    min-width: auto;
  }
  .dashboard {
    grid-template-columns: 1fr;
  }

  .products-page {
    padding: 0px;
  }
}
</style>