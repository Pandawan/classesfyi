<template>
  <div
    v-if="campusId !== null && departmentId !== null && courseInfo !== null && classes !== null && error === null"
  >
    <h2>{{ campusId.toUpperCase() }} {{ departmentId }}{{ courseInfo.course }} {{ courseInfo.title }} Classes</h2>
    <SearchableList
      placeholder="Search by CRN or instructor..."
      :items="classes"
      v-slot="{ item: classInfo }"
      :filter="(item, query) => {
        // Search by CRN or instructor name
        return item.CRN.toString().toLowerCase().indexOf(query.toLowerCase()) != -1 || item.times.some((classSchedule) => classSchedule.instructor.some((instructor) => instructor.toLowerCase().indexOf(query.toLowerCase()) != -1))
    }"
    >
      <div class="class">
        <ClassView :classData="classInfo" />
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
import ClassView from "../../components/ClassView.vue";
import {
  getCampusDepartments,
  getDepartmentCourses,
  getDepartmentInfo,
  CourseInfo,
  getCourseInfo,
  getCourseClasses,
  ClassInfo,
} from "../../utilities/openCourseApi";
import { APIError } from "../../utilities/APIError";
import { availableCampuses, isAvailableCampus } from "../../utilities/campus";

export default defineComponent({
  name: "Lookup",
  components: {
    SearchableList,
    ClassView,
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
.class {
  margin: 2em 0;
}
</style>