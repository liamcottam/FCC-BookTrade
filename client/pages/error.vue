<template>
  <section class="error-container">
    <h1 class="title">404</h1>
    <h2 class="info">Page Not Found</h2>
    <b-button variant="primary" to="/">Go Home</b-button>
  </section>
</template>

<script>
export default {
  name: 'error',
};
</script>

<style scoped>
.error-container {
  width: 100%;
  text-align: center;
}

.title {
  margin-top: 15px;
  margin-bottom: 0;
  font-size: 5em;
}

.info {
  font-weight: 300;
  padding-bottom: 1rem;
  color: #9aabb1;
  margin: 0;
}

.btn {
  margin: 0 0.2rem;
}
</style>
