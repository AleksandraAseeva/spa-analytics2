<template>
  <div class="products-page">
    <ApiFilter
      :initial-filters="apiFilters"
      :api-error="apiRequestError"
      @filter-changed="handleApiFilterChange"
    />
    <!-- Фильтры -->
    <div class="filters">
      <input
        v-model="searchQuery"
        placeholder="Поиск товаров"
        class="filter-input"
      />
      <select v-model="selectedIncomeId" class="filter-select">
        <option value="">Все ID поставок</option>
        <option v-for="incomeId in incomeIds" :key="incomeId" :value="incomeId">
          {{ incomeId }}
        </option>
      </select>

      <select v-model="selectedWarehouse" class="filter-select">
        <option value="">Все склады</option>
        <option
          v-for="warehouse in warehouses"
          :key="warehouse"
          :value="warehouse"
        >
          {{ warehouse }}
        </option>
      </select>
      <button @click="applyFilters" class="filter-button">Применить</button>
    </div>

    <div class="layout">
      <!-- Товары -->
      <div class="left-panel">
        <ProductsWithPagination
          :products="filteredProducts"
          :current-page="currentPage"
          :items-per-page="itemsPerPage"
          pageType="incomes"
          @page-changed="handlePageChange"
        />
      </div>

      <!-- Диаграмма и таблица -->
      <div class="right-panel">
        <div class="chart-container">
          <select v-model="selectedFilter" class="filter-select">
            <option value="income_id">income_id</option>
            <option value="warehouse_name">Склады</option>
          </select>
          <ChartComponent :data="chartData" chartType="bar" />
        </div>

        <div class="table-container">
          <TableComponent :data="tableData" pageType="incomes" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ProductsWithPagination from "@/components/ProductsWithPagination.vue";
import ChartComponent from "@/components/ChartComponent.vue";
import TableComponent from "@/components/TableComponent.vue";
import ApiFilter from "@/components/ApiFilter.vue";
import { API_BASE_URL } from '@/config';

// Реактивные данные
const apiFilters = ref({
  dateFrom: "2025-06-24",
  dateTo: "2025-06-30",
  key: "E6kUTYrYwZq2tN4QEtyzsbEBk3ie",
  limit: 10,
  page: 1,
});

const searchQuery = ref("");
const selectedIncomeId = ref("");
const selectedWarehouse = ref("");
const selectedFilter = ref("income_id");
const currentPage = ref(1);
const itemsPerPage = ref(8);
const incomeIds = ref([]);
const warehouses = ref([]);
const products = ref([]);
const loading = ref(false);
const error = ref(null);
const apiRequestError = ref(false);

// Вычисляемые свойства
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const searchLower = searchQuery.value.toLowerCase();
    const matchesSearch =
      product.warehouse_name.toLowerCase().includes(searchLower) ||
      (product.supplier_article &&
        product.supplier_article.toLowerCase().includes(searchLower)) ||
      (product.nm_id && product.nm_id.toString().includes(searchQuery.value)) ||
      (product.quantity &&
        product.quantity.toString().includes(searchQuery.value)) ||
      (product.date && product.date.toString().includes(searchQuery.value));
    const matchesIncomeId = selectedIncomeId.value
      ? product.income_id === selectedIncomeId.value
      : true;
    const matchesWarehouse = selectedWarehouse.value
      ? product.warehouse_name === selectedWarehouse.value
      : true;
    return matchesSearch && matchesIncomeId && matchesWarehouse;
  });
});

const chartData = computed(() => {
  if (!selectedFilter.value || filteredProducts.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  const groupData = filteredProducts.value.reduce((acc, product) => {
    const key = product[selectedFilter.value] || "Другие";
    acc[key] = (acc[key] || 0) + (product.quantity || 1);
    return acc;
  }, {});

  return {
    labels: Object.keys(groupData),
    datasets: [
      {
        label: "Кол-во",
        data: Object.values(groupData),
        // цвета для графиков про запас
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#F6C0F5",
          "#333G0H",
          "#9966FF",
          "#FF9F40",
          "#8AC24A",
          "#FF6B6B",
          "#47B8E0",
          "#7CDDDD",
          "#FFA3B1",
          "#A28AFF",
          "#FFD166",
          "#06D6A0",
          "#EF476F",
          "#118AB2",
          "#073B4C",
          "#83C5BE",
          "#FFDDD2",
        ],
      },
    ],
  };
});

const tableData = computed(() => {
  return [...filteredProducts.value]
    .sort((a, b) => parseFloat(b.quantity) - parseFloat(a.quantity))
    .map((item) => ({
      ...item,
      name: item.warehouse_name,
      quantity: parseFloat(item.quantity),
    }));
});

// Методы
const handleApiFilterChange = (newFilters) => {
  apiFilters.value = newFilters;
  fetchProducts();
};

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  apiRequestError.value = false;
  try {
    const url = new URL(`${API_BASE_URL}/sales`);

    Object.entries(apiFilters.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    products.value = data.data;
    incomeIds.value = [...new Set(data.data.map((item) => item.income_id))];
    warehouses.value = [
      ...new Set(data.data.map((item) => item.warehouse_name)),
    ];
  } catch (err) {
    console.error("Ошибка при загрузке данных:", err);
    error.value = err.message;
    apiRequestError.value = true;
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

// Хук жизненного цикла
onMounted(fetchProducts);
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
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-input,
.filter-select {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.filter-button {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.filter-button:hover {
  background-color: #66b1ff;
}

.layout {
  display: flex;
  gap: 30px;
}

.left-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
}

.right-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.chart-container,
.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

@media (max-width: 992px) {
  .layout, .filters {
    flex-direction: column;
  }
}
</style>
