<template>
  <section>
    <h2>What is it?</h2>
    <ul class="feature-list">
      <li>No need to constantly refresh the class signup page.</li>
      <li>
        Simply register for updates for the classes you want, and we'll email
        you when they open up.
      </li>
      <li>Get started now, no account required.</li>
    </ul>
    <p class="side-text">
      Please note that you are not actually signing up for these classes, you
      are simply getting updates about their availability.
    </p>
  </section>
  <section class="split-content">
    <div>
      <h2>Want to get started?</h2>
      <label>
        <!-- TODO: Term Selecting -->
        <p>Choose a campus and look for classes</p>
        <select v-model="campusSelect">
          <option v-for="(name, id) in availableCampuses" :value="id" :key="id">
            {{ name }}
          </option>
        </select>
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
  </section>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { availableCampuses, CampusId } from "/@/utilities/campus";

export default defineComponent({
  name: "Home",
  setup() {
    const campusSelect = ref<CampusId | null>(null);

    const router = useRouter();

    const navigateToCampusLookup = () => {
      router.push(`/lookup/${campusSelect.value}`);
    };

    watch(campusSelect, navigateToCampusLookup);

    return {
      availableCampuses,
      campusSelect,
    };
  },
});
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

.side-text {
  font-size: 0.85rem;
}
</style>