<template>
  <div  class="table-container">
    <table v-if="shouldShowTable && !isMobile" class="top-products-table">
      <thead>
        <tr>
          <th>Артикул</th>
          <th>Текущий</th>
          <th>Предыдущий</th>
          <th>Изменение</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="item in validItems" 
          :key="item.nm_id"
          @click="handleRowClick(item.nm_id)"
          class="clickable-row"
        >
          <td>{{ item.nm_id }}</td>
          <td>{{ formatNumber(item.current) }}</td>
          <td>{{ formatNumber(item.previous) }}</td>
          <td :class="getChangeClass(item)">
            {{ formatChange(item.change) }}
            <span v-if="showChangeIndicator">{{ getChangeIndicator(item) }}</span>
            <span v-if="showDifference">&nbsp;({{ formatDifference(item.current, item.previous) }})</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Мобильная версия таблицы -->
    <div v-if="shouldShowTable && isMobile" class="mobile-table">
      <div v-for="item in validItems" :key="item.nm_id" class="mobile-row" @click="handleRowClick(item.nm_id)">
        <div class="row-header">
          <span class="nm-id">Артикул: {{ item.nm_id }}</span>
        </div>
        <div class="row-data">
          <div class="data-item">
            <span class="label">Текущий:</span>
            <span class="value">{{ formatNumber(item.current) }}</span>
          </div>
          <div class="data-item">
            <span class="label">Предыдущий:</span>
            <span class="value">{{ formatNumber(item.previous) }}</span>
          </div>
          <div class="data-item">
            <span class="label">Изменение:</span>
            <span class="value" :class="getChangeClass(item)">
              {{ formatChange(item.change) }}
              <span v-if="showChangeIndicator">{{ getChangeIndicator(item) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showNoDataMessage" class="no-data-message">
      {{ noDataMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount  } from 'vue';
import { defineProps, defineEmits } from 'vue'; 

// Добавляем отслеживание размера экрана
const isMobile = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 520;
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize);
});

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  showChangeIndicator: {
    type: Boolean,
    default: true
  },
  showDifference: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['row-click']);

const validItems = computed(() => {
  if (!props.items) return [];
  
  return props.items.filter(item => 
    item && 
    item.nm_id !== undefined && 
    item.current !== undefined && 
    item.previous !== undefined &&
    item.change !== undefined
  );
});

const shouldShowTable = computed(() => {
  return validItems.value.length > 0;
});

const showNoDataMessage = computed(() => {
  return !props.items || props.items.length === 0;
});

const noDataMessage = computed(() => {
  return props.items ? 'Нет данных для отображения' : 'Данные не загружены';
});

const handleRowClick = (nm_id) => {
  if (nm_id) {
    emit('row-click', nm_id);
  }
};

const formatNumber = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return value.toFixed(2);
};

const formatChange = (change) => {
  if (typeof change !== 'number') return 'N/A';
  return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
};

const formatDifference = (current, previous) => {
  if (typeof current !== 'number' || typeof previous !== 'number') return 'N/A';
  const difference = current - previous;
  const formatted = difference.toFixed(2);
  return difference > 0 ? `+${formatted}` : formatted;
};

const getChangeClass = (item) => {
  if (item.change > 0) return 'positive';
  if (item.change < 0) return 'negative';
  return 'neutral';
};

const getChangeIndicator = (item) => {
  if (item.change > 0) return '↑';
  if (item.change < 0) return '↓';
  return '→';
};
</script>

<style scoped>
.table-container {
  margin-top: 20px;
  width: 100%;
}

.no-data-message {
  padding: 16px;
  text-align: center;
  color: #757575;
  font-style: italic;
  background-color: #fafafa;
  border-radius: 4px;
  margin-top: 10px;
}

/* Стили для десктопной таблицы */
.top-products-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.top-products-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.top-products-table th,
.top-products-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f5f5f5;
}

.mobile-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  font-size: 13px;
}

.mobile-row {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.mobile-row:active {
  transform: scale(0.98);
}

.row-header {
  padding: 12px;
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 1px solid #e0e0e0;
}

.row-data {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-item {
  display: flex;
  justify-content: space-between;
}

.label {
  color: #616161;
  font-weight: 500;
}

.value {
  font-weight: 500;
}

.positive {
  color: #2e7d32;
}

.negative {
  color: #c62828;
}

.neutral {
  color: #616161;
}

@media (max-width: 520px) {
  .top-products-table {
    display: none;
  }
  
  .mobile-table {
    display: flex;
  }
}

@media (min-width: 521px) {
  .mobile-table {
    display: none;
  }
}
</style>