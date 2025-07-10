<template>
  <div class="chart-component">
    <canvas ref="chartCanvas" class="chartCanvas" @click="handleClick"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from "chart.js";

export default {
  name: "ChartComponent",
  props: {
    data: {
      type: Object,
      required: true,
    },
    chartType: {
      type: String,
      default: "bar",
      validator: (value) => ["bar", "pie", "polarArea", "line"].includes(value),
    },
    clickable: {
      type: Boolean,
      default: false,
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.chartCanvas) {
        this.renderChart();
      }
    });
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.renderChart();
      },
    },
    chartType() {
      this.renderChart();
    },
  },
  methods: {
    getLegendPosition() {
      const screenWidth = window.innerWidth;

      return screenWidth < 1000 ? "bottom" : "right";
    },
    renderChart() {
      Chart.register(...registerables);

      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chartInstance = new Chart(ctx, {
        type: this.chartType,
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: this.clickable ? this.chartClick : undefined,
          plugins: {
            legend: {
              position: this.getLegendPosition(),
            },
            labels: {
              boxWidth: 8,
              padding: 10,
              font: {
                size: window.innerWidth < 640 ? 10 : 12,
              },
            },
          },
        },
      });
    },
    handleClick() {
      if (this.clickable) {
        this.$emit("chart-click");
      }
    },
    chartClick(event, elements) {
      if (elements.length > 0) {
        const index = elements[0].index;
        this.$emit("point-click", index);
      }
    },
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },
};
</script>

<style scoped>

</style>