<template>
  <div class="table-component">
    <h3>Топ товаров</h3>
    <table v-if="pageType === 'stocks'">
      <thead>
        <tr>
          <th>Артикул</th>
          <th>Бренд</th>
          <th>Цена</th>
          <th>Остаток</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.income_id">
          <td>{{ item.supplier_article }}</td>
          <td>{{ item.brand }}</td>
          <td>{{ item.price.toLocaleString() }} ₽</td>
          <td>{{ item.quantity_full }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">Общая сумма: {{ totalSum.toLocaleString() }} ₽</td>
        </tr>
      </tfoot>
    </table>
    <table v-if="pageType === 'incomes'">
      <thead>
        <tr>
          <th>income_id</th>
          <th>Склад</th>
          <th>Количество</th>
          <th>Штрихкод</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.income_id">
          <td>{{ item.income_id }}</td>
          <td>{{ item.warehouse_name }}</td>
          <td>{{ item.quantity.toLocaleString() }} шт</td>
          <td>{{ item.barcode }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">
            Общее количество: {{ totalCount.toLocaleString() }} шт
          </td>
        </tr>
      </tfoot>
    </table>
    <table v-if="pageType === 'orders-view'">
      <thead>
        <tr>
          <th>income_id</th>
          <th>Склад</th>
          <th>Общая цена</th>
          <th>Скидка</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.income_id">
          <td>{{ item.income_id }}</td>
          <td>{{ item.warehouse_name }}</td>
          <td>{{ item.total_price.toLocaleString() }} ₽</td>
          <td>{{ item.discount_percent.toLocaleString() }} %</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="4">
            Средняя скидка: {{ avgDiscountPercent.toFixed(2) }}%
          </td>
        </tr>
      </tfoot>
    </table>
    <table v-if="pageType === 'sales'">
      <thead>
        <tr>
          <th>income_id</th>
          <th>Скидка</th>
          <th>Цена со скидкой</th>
          <th>Финальная цена</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.income_id }}</td>
          <td>{{ item.discount_percent.toLocaleString() }} %</td>
          <td>{{ item.price_with_disc.toLocaleString() }} ₽</td>
          <td>{{ item.finished_price.toLocaleString() }} ₽</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "TableComponent",
  props: {
    data: {
      type: Array,
      required: true,
    },
    pageType: {
      type: String,
      required: true,
      validator: (value) =>
        ["stocks", "incomes", "orders-view", "sales"].includes(value),
    },
  },
  computed: {
    totalSum() {
      return this.data.reduce((sum, item) => sum + item.price, 0);
    },
    totalCount() {
      return this.data.reduce((sum, item) => sum + item.quantity, 0);
    },
    avgDiscountPercent() {
      if (this.data.length === 0) return 0;
      return (
        this.data.reduce((sum, item) => sum + (item.discount_percent || 0), 0) /
        this.data.length
      );
    },
  },
};
</script>

<style scoped>
.table-component {
  width: 100%;
  overflow-x: auto;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
}

tr:hover {
  background-color: #f5f7fa;
}
</style>