<template>
  <div class="content">
    <Navbar />
    <main>
      <router-view />
    </main>
  </div>
  <div class="footer">
    <p>
      Contact us at
      <a href="mailto:help@classes.fyi">help@classes.fyi</a>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "./components/Navbar.vue";

export default defineComponent({
  name: "App",
  components: {
    Navbar,
  },
});
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
.footer {
  margin-top: 1rem;
  color: var(--side-text);
  text-align: center;
}
</style>