<template>
  <div class="header">
    <h2>
      <BackButton />
      <span>User {{ email }}</span>
    </h2>
    <SignOutButton class="right-align" v-if="isSignedIn" />
  </div>
  <p v-if="state === 'loading'">Loading...</p>
  <section v-else-if="state === 'loaded'">
    <div class="header">
      <h3>Currently Registered Classes</h3>
      <UnregisterAllButton
        v-if="possibleClasses !== null"
        class="right-align"
        :email="email"
      />
    </div>
    <div v-if="classesError !== null">
      <p>{{ classesError }}</p>
    </div>
    <SearchableList
      v-if="possibleClasses !== null"
      placeholder="Search..."
      :items="possibleClasses"
      :filter="searchFilter"
      v-slot="{ item: { status, error, data: classInfo } }"
    >
      <div v-if="status === 'success' && classInfo !== null" class="class">
        <ClassView :classData="classInfo" :key="classInfo.raw_course">
          <UnregisterButton :classInfo="classInfo" :email="email" />
        </ClassView>
      </div>
      <p v-else-if="status === 'error' && error !== null" class="error">
        <span v-if="classInfo !== null">
          <!-- TODO: This dual CRN thing is ugly -->
          Could not load class data for
          {{
            `${classInfo.campus.toUpperCase()} ${classInfo.term} ${
              classInfo.year
            } ${classInfo.department?.toUpperCase() ?? ""}${
              classInfo.course?.toUpperCase() ?? ""
            } with CRN: ${classInfo.CRN ?? classInfo.crn}: `
          }}
        </span>
        <span>{{ error }}</span>
      </p>
    </SearchableList>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import { ShortClassInfo } from "/@/utilities/classInfo";
import SearchableList from "/@/components/SearchableList.vue";
import {
  ClassInfo,
  getClassesInfo,
  getClassInfo,
} from "/@/utilities/openCourseApi";
import { APIError } from "/@/utilities/APIError";
import { groupBy } from "/@/utilities/groupBy";
import ClassView from "/@/components/ClassView.vue";
import UnregisterButton from "/@/components/UnregisterButton.vue";
import UnregisterAllButton from "/@/components/UnregisterAllButton.vue";
import BackButton from "/@/components/BackButton.vue";
import { CampusId } from "/@/utilities/campus";
import { userStore } from "/@/stores/user";
import SignOutButton from "/@/components/SignOutButton.vue";
import fire from "/@/utilities/fire";

// TODO: Clean this up
const searchFilter = ({ status, error, data: classInfo }, query) => {
  // Run a basic query on short class info
  let shouldAppear =
    error !== null ||
    `${classInfo.department} ${classInfo.course} ${classInfo.department}${classInfo.course} ${classInfo.CRN}`
      .toLowerCase()
      .indexOf(query.toLowerCase()) != -1;
  if (status === "success" && error === null) {
    // Search by instructor name
    shouldAppear =
      shouldAppear ||
      classInfo.times.some((classSchedule) =>
        classSchedule.instructor.some(
          (instructor) =>
            instructor.toLowerCase().indexOf(query.toLowerCase()) != -1
        )
      );
  }
  return shouldAppear;
};

export default defineComponent({
  name: "User",
  components: {
    SearchableList,
    ClassView,
    UnregisterButton,
    UnregisterAllButton,
    BackButton,
    SignOutButton,
  },
  setup(props) {
    // TODO: Cleanup
    const email = computed(() => userStore.state.email);
    const state = ref<"loading" | "loaded">("loading");
    const isSignedIn = computed(() => userStore.state.isSignedIn);

    const possibleClasses = ref<
      | (
          | {
              status: "success";
              data: ClassInfo;
            }
          | {
              status: "error";
              error: string;
              data: ShortClassInfo;
            }
        )[]
      | null
    >(null);
    const classesError = ref<string | null>(null);

    const getClasses = async () => {
      if (userStore.state.isSignedIn === false) {
        state.value = "loaded";
        classesError.value = "You are not signed in.";
        possibleClasses.value = null;
        return;
      }

      const registeredClasses = userStore.state.registeredClasses;

      if (registeredClasses === null) {
        state.value = "loaded";
        classesError.value = "You are not registered to any class.";
        possibleClasses.value = null;
        return;
      }

      const classesDataByCampus = groupBy(
        registeredClasses,
        (shortClassInfo) => shortClassInfo.campus
      );
      const tasks = Object.entries(classesDataByCampus).map(
        async ([campus, shortClassesInfo]) => {
          const classesResults = await Promise.all(
            shortClassesInfo.map(async (shortClassInfo) => {
              try {
                const classInfo = await getClassInfo(
                  campus as CampusId,
                  shortClassInfo.crn,
                  shortClassInfo.year,
                  shortClassInfo.term
                );
                return classInfo;
              } catch (error) {
                return [error, null];
              }
            })
          );

          return {
            campus,
            result: classesResults,
          };
        }
      );

      const classInfoResultsByCampus = await Promise.all(tasks);

      const campusErrors = [];
      let mergedClassInfos: (
        | {
            status: "success";
            data: ClassInfo;
          }
        | {
            status: "error";
            error: string;
            data: ShortClassInfo;
          }
      )[] = [];
      // Loop through each campus and report errors or concat with classInfos
      for (const {
        campus,
        result: campusResults,
      } of classInfoResultsByCampus) {
        const formattedResults = campusResults.map(([error, result], index) => {
          if (error !== null) {
            return {
              status: "error",
              error: error.toString(),
              data: classesDataByCampus[campus][index],
            } as { status: "error"; error: string; data: ShortClassInfo };
          }

          return {
            status: "success",
            // If there was an error, put the short class info to identify which class this was
            // Because OpenCourseAPI doesn't specify which request failed
            data: { ...result, ...classesDataByCampus[campus][index] },
          } as { status: "success"; data: ClassInfo };
        });

        mergedClassInfos = mergedClassInfos.concat(formattedResults);
      }

      state.value = "loaded";
      possibleClasses.value = mergedClassInfos;
      classesError.value =
        campusErrors.length !== 0 ? campusErrors.join("\n") : null;
    };

    watchEffect(getClasses);

    return {
      isSignedIn,
      email,
      possibleClasses,
      classesError,
      getClasses,
      state,
      searchFilter,
    };
  },
});
</script>

<style scoped>
/* TODO: Add more "generic" stylings in index.css so common formats like left & right aligned header aren't repeated */
@media (min-width: 500px) {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header .right-align {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
  }
}
.class {
  margin: 2em 0;
}
</style>