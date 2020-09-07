<template>
  <div class="content">
    <Navbar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import Navbar from "./components/Navbar.vue";

export default {
  name: "App",
  components: {
    Navbar,
  },
};
</script>

<style scoped>
.content {
  background-color: var(--content-background);
  margin: 0 auto;
  max-width: 50rem;
  padding: 2em;
  border-radius: 10px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
</style>