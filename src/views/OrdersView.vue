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
      <select v-model="selectedOblast" class="filter-select">
        <option value="">Все регионы</option>
        <option v-for="oblast in oblasts" :key="oblast" :value="oblast">
          {{ oblast }}
        </option>
      </select>

      <select v-model="selectedBrand" class="filter-select">
        <option value="">Все бренды</option>
        <option v-for="brand in brands" :key="brand" :value="brand">
          {{ brand }}
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
          pageType="orders-view"
          @page-changed="handlePageChange"
        />
      </div>

      <!-- Диаграмма и таблица -->
      <div class="right-panel">
        <div class="chart-container">
          <select v-model="selectedFilter" class="filter-select">
            <option value="warehouse_name">Склады</option>
            <option value="oblast">Регион</option>
            <option value="brand">Бренды</option>
          </select>
          <ChartComponent :data="chartData" chartType="polarArea" />
        </div>

        <div class="table-container">
          <TableComponent :data="tableData" pageType="orders-view" />
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

// Реактивные переменные
const apiFilters = ref({
  dateFrom: "2025-06-25",
  dateTo: "2025-06-26",
  key: "E6kUTYrYwZq2tN4QEtyzsbEBk3ie",
  limit: 10,
  page: 1,
});
const searchQuery = ref("");
const selectedOblast = ref("");
const selectedBrand = ref("");
const selectedWarehouse = ref("");
const selectedFilter = ref("warehouse_name");
const currentPage = ref(1);
const itemsPerPage = ref(8);

const brands = ref([]);
const oblasts = ref([]);
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
      (product.barcode &&
        product.barcode.toString().includes(searchQuery.value)) ||
      (product.total_price &&
        product.total_price.toString().includes(searchQuery.value)) ||
      (product.discount_percent &&
        product.discount_percent.toString().includes(searchQuery.value));
    const matchesOblast = selectedOblast.value
      ? product.oblast === selectedOblast.value
      : true;
    const matchesBrand = selectedBrand.value
      ? product.brand === selectedBrand.value
      : true;
    const matchesWarehouse = selectedWarehouse.value
      ? product.warehouse_name === selectedWarehouse.value
      : true;
    return matchesSearch && matchesBrand && matchesWarehouse && matchesOblast;
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
    .sort(
      (a, b) => parseFloat(b.discount_percent) - parseFloat(a.discount_percent)
    )
    .map((item) => ({
      ...item,
      name: item.warehouse_name,
      discount_percent: parseFloat(item.discount_percent),
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
    const url = new URL("/api/orders", window.location.origin);

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

    const uniqueIncomeId = [...new Set(data.data.map((item) => item.oblast))];
    oblasts.value = uniqueIncomeId;

    const uniqueBrands = [...new Set(data.data.map((item) => item.brand))];
    brands.value = uniqueBrands;

    const uniqueWarehouses = [
      ...new Set(data.data.map((item) => item.warehouse_name)),
    ];
    warehouses.value = uniqueWarehouses;
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

// Хуки жизненного цикла
onMounted(() => {
  fetchProducts();
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
  .layout, .filters  {
    flex-direction: column;
  }
}
</style>
