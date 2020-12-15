<template>
  <div v-if="campusId !== null && departments !== null && error === null">
    <h2>
      <BackButton />
      <span>{{ campusName }} Departments</span>
    </h2>
    <SearchableList
      placeholder="Search for a department..."
      :items="departments"
      v-slot="{ item: department }"
      :filter="
        (item, query) =>
          item.name.toLowerCase().indexOf(query.toLowerCase()) != -1 ||
          item.id.toLowerCase().indexOf(query.toLowerCase()) != -1
      "
    >
      <router-link :to="`/lookup/${campusId}/${department.id}`">
        <div class="department">
          <span class="id">{{ department.id }}</span>
          -
          <span class="name">{{ department.name }}</span>
        </div>
      </router-link>
    </SearchableList>
  </div>
  <div v-else>
    <p>{{ error ?? "Something went wrong, please try again." }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SearchableList from "/@/components/SearchableList.vue";
import {
  getCampusDepartments,
  DepartmentInfo,
} from "/@/utilities/openCourseApi";
import { APIError } from "/@/utilities/APIError";
import {
  availableCampuses,
  CampusId,
  isAvailableCampus,
} from "/@/utilities/campus";
import BackButton from "/@/components/BackButton.vue";
import { getOrFetchTerm } from "/@/stores/term";

export default defineComponent({
  name: "Lookup",
  components: {
    SearchableList,
    BackButton,
  },
  setup(props) {
    const route = useRoute();
    const campusId = computed(() => route.params.campusId as CampusId);
    const campusName = computed<string>(
      () => availableCampuses[campusId.value]
    );

    let departments = ref<DepartmentInfo[]>([]);
    let error = ref<APIError | null>(null);

    const getDepartments = async () => {
      if (isAvailableCampus(campusId.value)) {
        const { year, term } = await getOrFetchTerm(campusId.value);
        const [err, depts] = await getCampusDepartments(
          campusId.value,
          year,
          term
        );

        if (err === null) {
          departments.value = depts;
          error.value = null;
        } else {
          departments.value = null;
          error.value = err;
        }
      } else {
        departments.value = null;
        error.value = new APIError(404, "No campus found with given id");
      }
    };

    onMounted(getDepartments);

    return {
      campusId,
      campusName,
      departments,
      error,
    };
  },
});
</script>

<style scoped>
.department {
  margin: 0 0.5em;
  padding: 0.25em 0;
  font-size: 1.15em;
}
</style>