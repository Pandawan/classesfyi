<template>
  <div class="center-text">
    <h1>404</h1>
    <p>
      The page you requested could not be found.
      <br />
      <router-link to="/">Go home?</router-link>
    </p>
  </div>
</template>

<script>
export default {
  name: "NotFound",
};
</script>

<style scoped>
.center-text {
  text-align: center;
}

h1 {
  margin-bottom: 0.5rem;
  font-weight: 400;
  font-size: 3rem;
}
</style>