<template>
  <div v-if="campusId !== null && departments !== null && error === null">
    <h2>{{ campusName }} Departments</h2>
    <SearchableList
      :items="departments"
      v-slot="{ item: department }"
      :filter="(item, query) =>
    item.name.toLowerCase().indexOf(query.toLowerCase()) != -1 || item.id.toLowerCase().indexOf(query.toLowerCase()) != -1"
    >
      <router-link :to="`/lookup/${campusId}/${department.id}`">
        <div class="department">
          <span class="id">{{department.id}}</span>
          -
          <span class="name">{{ department.name }}</span>
        </div>
      </router-link>
    </SearchableList>
  </div>
  <div v-else>
    <p>{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SearchableList from "../../components/SearchableList.vue";
import {
  APIError,
  availableCampuses,
  getCampusDepartments,
  isAvailableCampus,
  DepartmentInfo,
} from "../../utilities/openCourseApi";

export default defineComponent({
  name: "Lookup",
  components: {
    SearchableList,
  },
  setup(props) {
    const route = useRoute();
    const campusId = computed(() => route.params.campusId as string);
    const campusName = computed<string>(
      () => availableCampuses[campusId.value]
    );

    let departments = ref<DepartmentInfo[]>([]);
    let error = ref<APIError | null>(null);

    const getDepartments = async () => {
      if (isAvailableCampus(campusId.value)) {
        const [err, depts] = await getCampusDepartments(campusId.value);

        if (err === null) departments.value = depts;
        else error.value = err;
      } else {
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
  padding: 0.5em 0;
  font-size: 1.15em;
}
</style>