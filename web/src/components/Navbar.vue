<template>
  <header>
    <nav>
      <h1 class="title">
        <router-link to="/">Classes.fyi</router-link>
      </h1>
      <ul class="links">
        <li v-for="route in routes" :key="route.path">
          <router-link :to="route.to" :class="{ active: isActive(route.to) }">
            {{
            route.text
            }}
          </router-link>
        </li>
      </ul>
    </nav>
    <p class="headline">Get updates when your classes's seats open up.</p>
  </header>
</template>

<script>
import { computed } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const routes = [
      { to: "/", text: "Home" },
      { to: "/about", text: "About" },
    ];
    const router = useRouter();
    const activeRoute = computed(() => router.currentRoute.value.path);
    const isActive = (path) => path === activeRoute.value;
    return { isActive, routes };
  },
};
</script>

<style scoped>
header {
  margin-bottom: 2em;
}
header nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header nav a {
  display: inline-block;
  color: var(--important-text);
  text-decoration: none;
  box-sizing: border-box;
}
header nav .title {
  margin-bottom: 0;
}
header nav .links {
  list-style: none;
  padding: 0;
  margin: 0;
}
header nav .links li {
  padding: 0.35em 0.5em;
  list-style-position: inside;
  display: inline-block;
}
</style>
