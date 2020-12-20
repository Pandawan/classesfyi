<template>
  <select v-model="campusSelect">
    <option v-for="(name, id) in availableCampuses" :value="id" :key="id">
      {{ name }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { refreshCurrentTermData } from "/@/stores/term";
import { availableCampuses, CampusId } from "/@/utilities/campus";

export default defineComponent({
  name: "CampusSelect",
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
</style>