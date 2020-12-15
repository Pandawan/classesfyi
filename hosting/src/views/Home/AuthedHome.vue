<template>
  <div class="split-content">
    <div>
      <h2>Want to get started?</h2>
      <label>
        <!-- TODO: Previous term viewing (termStore can have isCurrentTerm to display/hide register button) -->
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { refreshCurrentTermData } from "/@/stores/term";
import { availableCampuses, CampusId } from "/@/utilities/campus";

export default defineComponent({
  name: "AuthedHome",
  setup() {
    const campusSelect = ref<CampusId | null>(null);

    const router = useRouter();

    const navigateToCampusLookup = () => {
      // Refresh the term data (just in case) when selecting a campus
      refreshCurrentTermData(campusSelect.value);

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