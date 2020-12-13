<template>
  <header>
    <nav>
      <h1 class="title">
        <router-link to="/">Classes.fyi</router-link>
      </h1>
      <ul class="links">
        <li><router-link to="/">Home</router-link></li>
        <li><router-link to="/about">About</router-link></li>
        <li v-if="isSignedIn"><router-link to="/user">User</router-link></li>
      </ul>
    </nav>
    <p class="headline">Get updates when your classes's seats open up.</p>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRouter } from "vue-router";
import { userStore } from "../stores/user";

export default defineComponent({
  name: "Navbar",
  setup() {
    const isSignedIn = computed(() => userStore.state.isSignedIn);
    return { isSignedIn };
  },
});
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
@media (max-width: 450px) {
  header nav {
    flex-direction: column;
  }
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
