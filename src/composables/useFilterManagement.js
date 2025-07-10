import { ref, watch } from 'vue';

export function useFilterManagement(initialFilters = {}) {
  const filters = ref({ ...initialFilters });

  const saveFilters = () => {
    localStorage.setItem('productFilters', JSON.stringify(filters.value));
  };

  const loadFilters = () => {
    const savedFilters = localStorage.getItem('productFilters');
    if (savedFilters) {
      filters.value = JSON.parse(savedFilters);
    }
  };

  const resetFilters = () => {
    filters.value = { ...initialFilters };
    saveFilters();
  };

  // Автоматическое сохранение при изменении фильтров
  watch(filters, () => {
    saveFilters();
  }, { deep: true });

  return {
    filters,
    loadFilters,
    resetFilters
  };
}