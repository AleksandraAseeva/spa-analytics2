<template>
  <div class="products-page">
    <h2>{{ metricName }} - детальная статистика</h2>
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
      <div class="metric-card">
        <h2>{{ metricName }}</h2>
        <ChartComponent
          :data="chartData"
          chartType="bar"
          class="metric-chart"
        />
        <TopProductsTable
          :items="topProducts"
          @row-click="goToProductPage"
          class="metric-table"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFilterManagement } from "@/composables/useFilterManagement";
import { useProductData } from "@/composables/useProductData";
import { useMetrics } from "@/composables/useMetrics";
import ChartComponent from "@/components/ChartComponent.vue";
import TopProductsTable from "@/components/TopProductsTable.vue";

const route = useRoute();
const router = useRouter();
const metricKey = route.params.metric;

// Инициализация фильтров
const { filters, loadFilters } = useFilterManagement({
  nm_id: "",
  oblast: "",
  category: "",
  brand: "",
  last_change_date: ""
});

// Работа с данными
const {
  currentPeriodData,
  previousPeriodData,
  fetchWeekData,
  getUniqueValues,
} = useProductData();

const { getChartData, getTopProducts } = useMetrics();

const metricName = computed(() => {
  const names = {
    sales_count: "Количество продаж",
    avg_price: "Средняя цена продажи",
    cancel_count: "Количество отмен",
    avg_discount: "Средний размер скидки",
  };
  return names[metricKey] || metricKey;
});

const filteredData = computed(() => {
  return currentPeriodData.value.filter((item) => {
    return (
      (!filters.nm_id ||
        item.nm_id.toString().includes(filters.nm_id.toString())) &&
      (!filters.oblast || item.oblast === filters.oblast) &&
      (!filters.category || item.category === filters.category) &&
      (!filters.brand || item.brand === filters.brand) &&
      (!filters.last_change_date || item.last_change_date === filters.last_change_date)
    );
  });
});

const chartData = computed(() =>
  getChartData(
    metricKey,
    [{ key: metricKey, title: metricName.value }],
    filteredData.value
  )
);

const topProducts = computed(() =>
  getTopProducts(metricKey, filteredData.value, previousPeriodData.value, null)
);

const oblasts = computed(() =>
  getUniqueValues(currentPeriodData.value, "oblast")
);
const categories = computed(() =>
  getUniqueValues(currentPeriodData.value, "category")
);
const brands = computed(() =>
  getUniqueValues(currentPeriodData.value, "brand")
);
const last_change_dates = computed(() =>
  getUniqueValues(currentPeriodData.value, "last_change_date")
);
const nm_ids = computed(() =>
  getUniqueValues(currentPeriodData.value, "nm_id")
);


const goToProductPage = (nm_id) => {
  router.push({
    name: "product",
    params: { nm_id },
    query: { ...filters },
  });
};

// Загрузка данных
const loadData = async () => {
  const current = await fetchWeekData(
    "current",
    "E6kUTYrYwZq2tN4QEtyzsbEBk3ie"
  );
  const previous = await fetchWeekData(
    "previous",
    "E6kUTYrYwZq2tN4QEtyzsbEBk3ie"
  );

  currentPeriodData.value = current;
  previousPeriodData.value = previous;
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
}

.filter-button {
  padding: 12px 24px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.metric-chart {
  margin-top: 20px;
  height: 400px;
}

.metric-table {
  margin-top: 30px;
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
}
</style>