<template>
  <div class="product-view">
    <div class="product-container">
      <div class="product-info">
        <h2>Артикул: {{ productDetails.nm_id || $route.params.nm_id }}</h2>
        <div class="product-image-placeholder">
          <img src="#" alt="Изображение товара" />
        </div>
        <div class="product-details">
          <p>
            <strong>Бренд:</strong> {{ productDetails.brand || "Не указан" }}
          </p>
          <p>
            <strong>Категория:</strong>
            {{ productDetails.category || "Не указана" }}
          </p>
          <p>
            <strong>Регион:</strong> {{ productDetails.oblast || "Не указан" }}
          </p>
          <p>
            <strong>Штрих-код:</strong>
            {{ productDetails.barcode || "Не указан" }}
          </p>
          <p>
            <strong>Артикул поставщика:</strong>
            {{ productDetails.supplier_article || "Не указан" }}
          </p>
        </div>
      </div>

      <div class="product-metrics">
        <table class="metrics-table">
          <thead>
            <tr>
              <th>Показатель</th>
              <th v-for="date in dates" :key="date">
                {{ formatDateLabel(date) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in metrics" :key="metric.key">
              <td>{{ metric.title }}</td>
              <td v-for="date in dates" :key="date">
                {{ getMetricValue(metric.key, date) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useDateUtils } from "@/composables/useDateUtils";
import { useProductData } from "@/composables/useProductData";

const route = useRoute();
const { getWeekDates, formatDateLabel } = useDateUtils();
const { currentPeriodData, fetchWeekData } = useProductData();

const API_KEY = "E6kUTYrYwZq2tN4QEtyzsbEBk3ie";

const metrics = [
  { key: "sales_count", title: "Количество продаж" },
  { key: "avg_price", title: "Средняя цена продажи" },
  { key: "cancel_count", title: "Количество отмен" },
  { key: "avg_discount", title: "Средний размер скидки" },
];

const productDetails = ref({});

const dates = computed(() => {
  const { monday, nextMonday } = getWeekDates();
  const dateArray = [];
  const currentDate = new Date(monday);

  while (currentDate < nextMonday) {
    dateArray.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
});

const productData = computed(() => {
  if (!currentPeriodData.value?.length) return [];

  const idFields = ["nm_id", "id", "article", "vendor_code"].filter(
    (field) => field in currentPeriodData.value[0]
  );

  if (!idFields.length) {
    console.error("No ID field found in data structure");
    return [];
  }

  return currentPeriodData.value.filter(
    (item) => String(item[idFields[0]]) === String(route.params.nm_id)
  );
});

const loadData = async () => {
  try {
    const data = await fetchWeekData("current", API_KEY);
    console.log("Loaded data:", data);

    currentPeriodData.value = data;

    updateProductDetails();
  } catch (error) {
    console.error("Error loading data:", error);
  }
};

const updateProductDetails = () => {
  if (!productData.value.length) return;

  const firstItem = productData.value[0];
  productDetails.value = {
    nm_id: firstItem.nm_id,
    brand: firstItem.brand,
    category: firstItem.category,
    oblast: firstItem.oblast,
    barcode: firstItem.barcode,
    supplier_article: firstItem.supplier_article,
  };
};


// значение метрики для конкретной даты
const getMetricValue = (metricKey, date) => {
  if (!productData.value.length) return "-";

  const dayData = productData.value.filter((item) =>
    item.date?.startsWith(date)
  );

  if (!dayData.length) return "-";

  switch (metricKey) {
    case "sales_count":
      return dayData.length;

    case "avg_price": {
      const total = dayData.reduce(
        (sum, item) => sum + (parseFloat(item.total_price) || 0),
        0
      );
      return total > 0 ? (total / dayData.length).toFixed(2) : "-";
    }

    case "cancel_count":
      return dayData.filter((item) => item.is_cancel).length;

    case "avg_discount": {
      const discountTotal = dayData.reduce(
        (sum, item) => sum + (parseFloat(item.discount_percent) || 0),
        0
      );
      return discountTotal > 0
        ? (discountTotal / dayData.length).toFixed(2) + "%"
        : "-";
    }

    default:
      return "-";
  }
};

onMounted(async () => {
  await loadData();
});

watch(() => route.params.nm_id, loadData);
</script>

<style scoped>
.product-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-container {
  display: flex;
  gap: 30px;
}

.product-info {
  flex: 1;
  max-width: 33%;
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-image-placeholder {
  width: 100%;
  height: 200px;
  background: #e9ecef;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
}

.product-image-placeholder img {
  max-width: 100%;
  max-height: 100%;
}

.product-details {
  margin-top: 20px;
}

.product-details p {
  margin: 8px 0;
}

.product-metrics {
  flex: 2;
  overflow-x: auto;
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.metrics-table th,
.metrics-table td {
  padding: 12px 15px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.metrics-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.metrics-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.metrics-table tr:hover {
  background-color: #e9ecef;
}

@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }

  .product-info {
    max-width: 100%;
  }
}
</style>