<template>
  <div class="products-container">
    <div class="products-grid">
      <div
        v-for="product in paginatedProducts"
        :key="product.nm_id"
        class="product-card"
      >
        <div class="product-info">
          <!-- Динамическое отображение в зависимости от типа страницы -->
          <template v-if="pageType === 'stocks'">
            <h3>Товар {{ product.nm_id }}</h3>
            <p class="category">Категория {{ product.category }}</p>
            <p class="category">Брэнд {{ product.brand }}</p>
            <p>Склад {{ product.warehouse_name }}</p>
            <p class="price">{{ product.price.toLocaleString() }} ₽</p>
            <p class="stock">
              В пути к клиенту: {{ product.in_way_to_client }} шт.
            </p>
            <p class="stock">
              В пути от клиента: {{ product.in_way_from_client }} шт.
            </p>
          </template>

          <template v-else-if="pageType === 'incomes'">
            <h3>ID{{ product.income_id }}</h3>
            <p class="warehouse">Склад: {{ product.warehouse_name }}</p>
            <p class="article">Артикул: {{ product.supplier_article }}</p>
            <p class="quantity">Количество: {{ product.quantity }} шт.</p>
            <p class="date">Дата: {{ formatDate(product.date) }}</p>
          </template>

          <template v-else-if="pageType === 'orders-view'">
            <h3>Заказ #{{ product.nm_id }}</h3>
            <p class="date">Дата: {{ formatDate(product.date) }}</p>
            <p class="warehouse">Склад: {{ product.warehouse_name }}</p>
            <p class="article">Артикул: {{ product.supplier_article }}</p>
            <p class="quantity">Общая цена: {{ product.total_price }} ₽</p>
            <p class="quantity">
              Скидка: {{ product.discount_percent }} %
            </p>
          </template>

          <template v-else>
            <h3>Продажа #{{ product.nm_id }}</h3>
            <p class="warehouse">Склад: {{ product.warehouse_name }}</p>
            <p class="warehous">Регион: {{ product.region_name }}</p>
            <p class="quantity">
              Цена со скидкой: {{ product.price_with_disc }} ₽
            </p>
            <p class="quantity">Штрихкод: {{ product.barcode }}</p>
          </template>
        </div>
      </div>
    </div>
    <div class="pagination">
      <button
        @click="currentPage > 1 ? $emit('page-changed', currentPage - 1) : null"
        :disabled="currentPage === 1"
        class="pagination-button"
      >
        &lt;
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        @click="$emit('page-changed', page)"
        :class="{ active: currentPage === page }"
        class="pagination-button"
      >
        {{ page }}
      </button>

      <button
        @click="
          currentPage < totalPages
            ? $emit('page-changed', currentPage + 1)
            : null
        "
        :disabled="currentPage === totalPages"
        class="pagination-button"
      >
        &gt;
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProductsWithPagination",
  props: {
    products: {
      type: Array,
      required: true,
    },
    pageType: {
      type: String,
      required: true,
      validator: (value) =>
        ["stocks", "incomes", "sales", "orders-view"].includes(value),
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    itemsPerPage: {
      type: Number,
      default: 8,
    },
  },
  computed: {
    totalPages() {
      return Math.ceil(this.products.length / this.itemsPerPage);
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.products.slice(start, end);
    },
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return "Не указана";
      return new Date(dateString).toLocaleDateString();
    }
  },
};
</script>

<style scoped>
.products-container {
  width: 100%;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding-bottom: 20px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-info h3 {
  margin-top: 0;
  color: #333;
  font-size: 1.1rem;
}

.product-info p {
  margin: 5px 0;
  color: #666;
  font-size: 0.9rem;
}

.price {
  font-weight: bold;
  color: #409eff;
}

.stock {
  color: #67c23a;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.pagination-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-button:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}
</style>