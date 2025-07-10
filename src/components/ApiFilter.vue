<template>
  <div class="api-filters">
    <div class="api-filter-group">
      <label>Дата с:</label>
      <input type="date" v-model="filters.dateFrom" class="api-filter-input" />
    </div>

    <div class="api-filter-group">
      <label>Дата по:</label>
      <input type="date" v-model="filters.dateTo" class="api-filter-input" />
    </div>

    <div class="api-filter-group">
      <label>API ключ:</label>
      <input type="text" v-model="filters.key" class="api-filter-input" />
    </div>

    <div class="api-filter-group">
      <label>Лимит:</label>
      <input
        type="number"
        v-model="filters.limit"
        min="1"
        max="100"
        class="api-filter-input"
      />
    </div>

    <div class="api-filter-group">
      <label>Страница:</label>
      <input
        type="number"
        v-model="filters.page"
        min="1"
        max="100"
        class="api-filter-input"
      />
    </div>

    <button @click="applyFilters" class="api-filter-button">
      Применить фильтры
    </button>
    <!-- Блок для отображения ошибки -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: "ApiFilter",
  props: {
    initialFilters: {
      type: Object,
      default: () => ({
        dateFrom: "2025-06-25",
        dateTo: "2025-06-26",
        key: "E6kUTYrYwZq2tN4QEtyzsbEBk3ie",
        limit: 10,
        page: 1,
      }),
    },
    apiError: {
      type: [String, Boolean],
      default: false,
    },
  },
  data() {
    // Функция для получения дат
    const getDefaultDates = () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return {
        dateFrom: this.formatDate(today),
        dateTo: this.formatDate(tomorrow),
      };
    };

    return {
      filters: {
        ...getDefaultDates(),
        key: "E6kUTYrYwZq2tN4QEtyzsbEBk3ie",
        limit: 10,
        page: 1,
        ...this.initialFilters, // Переопределение значений по умолчанию
      },
      errorMessage: "",
    };
  },
  watch: {
    // Отслеживание изменения пропса apiError
    apiError: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.errorMessage =
            typeof newVal === "string"
              ? newVal
              : "Кажется, вы ввели некорректные данные! Для Stocks данные приходят за текущий день (UTC+3), для Sales, Incomes и Orders данные приходят за прошедший период.";
        } else {
          this.errorMessage = "";
        }
      },
    },
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    applyFilters() {
      this.errorMessage = "";
      this.$emit("filter-changed", { ...this.filters });
    },
  },
};
</script>

<style scoped>
.api-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f4f8;
  border-radius: 8px;
}

.api-filter-group {
  display: flex;
  flex-direction: column;
  min-width: 180px;
}

.api-filter-group label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.api-filter-input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.api-filter-button {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-end;
  height: fit-content;
  margin-top: auto;
}

.api-filter-button:hover {
  background-color: #66b1ff;
}

.error-message {
  color: #f56c6c;
  padding: 10px;
  background-color: #fef0f0;
  border-radius: 4px;
  margin-top: 10px;
  width: 100%;
  border: 1px solid #fbc4c4;
}
</style>