<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/" class="nav-link" active-class="active-link">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">Home</span>
      </router-link>
      <router-link to="/stocks" class="nav-link" active-class="active-link">
        <span class="nav-icon">📦</span>
        <span class="nav-text">Stocks</span>
      </router-link>
      <router-link to="/incomes" class="nav-link" active-class="active-link">
        <span class="nav-icon">💰</span>
        <span class="nav-text">Incomes</span>
      </router-link>
      <router-link to="/orders" class="nav-link" active-class="active-link">
        <span class="nav-icon">🛒</span>
        <span class="nav-text">Orders</span>
      </router-link>
      <router-link to="/sales" class="nav-link" active-class="active-link">
        <span class="nav-icon">📊</span>
        <span class="nav-text">Sales</span>
      </router-link>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style scoped>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0 auto;
  padding: 20px;
  background-color: rgb(212, 213, 255);
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link:hover {
  background-color: rgba(66, 153, 225, 0.1);
  transform: translateY(-2px);
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background-color: #4299e1;
  transition: width 0.3s ease;
}

.nav-link:hover::before {
  width: 80%;
}

.active-link {
  background-color: rgba(66, 153, 225, 0.15);
  color: #2b6cb0;
}

.active-link::before {
  width: 80%;
  background-color: #2b6cb0;
}

.nav-icon {
  margin-right: 8px;
  font-size: 1.1em;
  transition: transform 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.2);
}

.nav-text {
  transition: color 0.3s ease;
}

@media (max-width: 768px) {
  .main-nav {
    flex-direction: column;
    gap: 8px;
  }
  
  .nav-link {
    justify-content: center;
    padding: 10px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.nav-link {
  animation: fadeIn 0.5s ease forwards;
}

.nav-link:nth-child(1) { animation-delay: 0.1s; }
.nav-link:nth-child(2) { animation-delay: 0.2s; }
.nav-link:nth-child(3) { animation-delay: 0.3s; }
.nav-link:nth-child(4) { animation-delay: 0.4s; }
</style>
