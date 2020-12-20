<template>
  <div class="split-content">
    <div>
      <h2>Want to get started?</h2>
      <label>
        <!-- TODO: Previous term viewing (termStore can have isCurrentTerm to display/hide register button) -->
        <p>Choose a campus and look for classes</p>
        <CampusSelect />
      </label>
    </div>
    <div>
      <h2>User information</h2>
      <label>
        <p>Looking to see and modify your class updates?</p>
        <router-link class="button" to="/user"
          >See Current Class Registration</router-link
        >
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CampusSelect from "/@/components/CampusSelect.vue";

export default defineComponent({
  name: "AuthedHome",
  components: { CampusSelect },
});
</script>

<style scoped>
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