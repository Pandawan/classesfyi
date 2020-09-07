<template>
  <section>
    <h2>What is it?</h2>
    <ul class="feature-list">
      <li>No need to constantly refresh the class signup page.</li>
      <li>Simply register for updates for the classes you want, and we'll email you when they open up.</li>
      <li>Get started now, no account required.</li>
    </ul>
  </section>
  <section class="split-content">
    <div>
      <h2>Want to get started?</h2>
      <p>Choose a campus</p>
      <router-link class="button" to="/lookup/fh">Foothill</router-link>
      <router-link class="button" to="/lookup/da">De Anza</router-link>
    </div>
    <div>
      <h2>Tired of updates?</h2>
      <p>Unregister</p>
      <router-link class="button" to="/unregister">From a Class</router-link>
      <router-link class="button" to="/unregister_all">From All Updates</router-link>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: "Home",
};
</script>

<style scoped>
section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.split-content {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.split-content > * {
  flex: 1 50%;
}

@media only screen and (max-width: 756px) {
  .split-content {
    flex-direction: column;
  }

  .split-content > *:not(:last-child) {
    margin-bottom: 1.5rem;
  }
}
</style>