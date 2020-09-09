<template>
  <div
    v-if="campusId !== null && departmentId !== null && courseInfo !== null && classes !== null && error === null"
  >
    <h2>{{ campusId.toUpperCase() }} {{ departmentId }}{{ courseInfo.course }} {{ courseInfo.title }} Classes</h2>
    <SearchableList
      :items="classes"
      v-slot="{ item: classInfo }"
      :filter="(item, query) =>
    item.course.toLowerCase().indexOf(query.toLowerCase()) != -1 || item.title.toLowerCase().indexOf(query.toLowerCase()) != -1"
    >
      <div class="class">
        <pre><code>{{ JSON.stringify(classInfo, null, '\t') }}</code></pre>
      </div>
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
  getDepartmentCourses,
  getDepartmentInfo,
  isAvailableCampus,
  CourseInfo,
  getCourseInfo,
  getCourseClasses,
  ClassInfo,
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
    const departmentId = computed(() => route.params.departmentId as string);
    const courseId = computed(() => route.params.courseId as string);

    let courseInfo = ref<CourseInfo | null>(null);

    let error = ref<APIError | null>(null);

    const getInfoForCourse = async () => {
      if (isAvailableCampus(campusId.value)) {
        const [err, crs] = await getCourseInfo(
          campusId.value,
          departmentId.value,
          courseId.value
        );

        if (err === null) courseInfo.value = crs;
        else error.value = err;
      } else {
        error.value = new APIError(404, "No campus found with given id");
      }
    };

    let classes = ref<ClassInfo[] | null>(null);

    const getClasses = async () => {
      if (isAvailableCampus(campusId.value)) {
        const [err, crs] = await getCourseClasses(
          campusId.value,
          departmentId.value,
          courseId.value
        );

        if (err === null) classes.value = crs;
        else error.value = err;
      } else {
        error.value = new APIError(404, "No campus found with given id");
      }
    };

    onMounted(getInfoForCourse);
    onMounted(getClasses);

    return {
      campusId,
      campusName,
      departmentId,
      courseInfo,
      classes,
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