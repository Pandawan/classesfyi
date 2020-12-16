<template>
  <div
    v-if="
      campusId !== null &&
      departmentId !== null &&
      courseInfo !== null &&
      classes !== null &&
      error === null
    "
  >
    <h2>
      <BackButton />
      <span
        >{{ campusId.toUpperCase() }} {{ departmentId }}{{ courseInfo.course }}
        {{ courseInfo.title }} Classes</span
      >
    </h2>
    <SearchableList
      placeholder="Search by CRN or instructor..."
      :items="classes"
      :filter="searchFilter"
      v-slot="{ item: classInfo }"
    >
      <div class="class">
        <ClassView :classData="classInfo">
          <div
            v-if="
              classInfo.isAlreadyRegistered === false &&
              classInfo.wait_seats === 0
            "
          >
            <RegisterButton :classInfo="classInfo" />
          </div>
          <div v-else-if="classInfo.isAlreadyRegistered === true">
            You are already registered for this class.
          </div>
        </ClassView>
      </div>
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
import ClassView from "/@/components/ClassView.vue";
import {
  getCampusDepartments,
  getDepartmentCourses,
  getDepartmentInfo,
  CourseInfo,
  getCourseInfo,
  getCourseClasses,
  ClassInfo,
} from "/@/utilities/openCourseApi";
import { APIError } from "/@/utilities/APIError";
import {
  availableCampuses,
  CampusId,
  isAvailableCampus,
} from "/@/utilities/campus";
import RegisterButton from "/@/components/RegisterButton.vue";
import BackButton from "/@/components/BackButton.vue";
import { getOrFetchTerm } from "/@/stores/term";
import { userStore } from "/@/stores/user";

const searchFilter = (item, query) => {
  // Search by CRN or instructor name
  return (
    item.CRN.toString().toLowerCase().indexOf(query.toLowerCase()) != -1 ||
    item.times.some((classSchedule) =>
      classSchedule.instructor.some(
        (instructor) =>
          instructor.toLowerCase().indexOf(query.toLowerCase()) != -1
      )
    )
  );
};

export default defineComponent({
  name: "Lookup",
  components: {
    SearchableList,
    ClassView,
    RegisterButton,
    BackButton,
  },
  setup(props) {
    const route = useRoute();
    const campusId = computed(() => route.params.campusId as CampusId);
    const campusName = computed<string>(
      () => availableCampuses[campusId.value]
    );
    const departmentId = computed(() => route.params.departmentId as string);
    const courseId = computed(() => route.params.courseId as string);

    let courseInfo = ref<CourseInfo | null>(null);
    let classes = ref<(ClassInfo & { isAlreadyRegistered: boolean })[] | null>(
      null
    );
    let error = ref<APIError | null>(null);

    const getInfoForCourse = async () => {
      if (isAvailableCampus(campusId.value)) {
        const { year, term } = await getOrFetchTerm(campusId.value);
        const [err, crs] = await getCourseInfo(
          campusId.value,
          departmentId.value,
          courseId.value,
          year,
          term
        );

        if (err === null) courseInfo.value = crs;
        else error.value = err;
      } else {
        error.value = new APIError(404, "No campus found with given id");
      }
    };

    const getClasses = async () => {
      if (isAvailableCampus(campusId.value)) {
        const { year, term } = await getOrFetchTerm(campusId.value);
        const [err, crs] = await getCourseClasses(
          campusId.value,
          departmentId.value,
          courseId.value,
          year,
          term
        );

        console.log(userStore.state.registeredClasses);

        const classesWithMetadata = crs.map((classInfo) => ({
          ...classInfo,
          // Is already registered IF
          isAlreadyRegistered:
            // 1. User is already registered to SOME classes
            userStore.state.registeredClasses !== null &&
            // 2. The registered classes contains the given class
            userStore.state.registeredClasses.findIndex(
              // TODO: Make a generic "class compare" function
              (registeredClass) =>
                registeredClass.crn === classInfo.CRN &&
                registeredClass.term === term &&
                registeredClass.year === year &&
                registeredClass.campus === campusId.value
            ) !== -1,
        }));

        if (err === null) {
          classes.value = classesWithMetadata;
          error.value = null;
        } else {
          classes.value = null;
          error.value = err;
        }
      } else {
        classes.value = null;
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
      searchFilter,
    };
  },
});
</script>

<style scoped>
.class {
  margin: 2em 0;
}
</style>