<template>
  <h2>User {{email}}</h2>
  <section>
    <div class="header">
      <h3>Currently Registered Classes</h3>
      <UnregisterAllButton
        v-if="possibleClasses !== null"
        class="unregister-button"
        :email="email"
        v-on:success="getClasses"
      />
    </div>
    <SearchableList
      v-if="possibleClasses !== null"
      placeholder="Search..."
      :items="possibleClasses"
      v-slot="{ item: [shortClassInfo, [error, classInfo]] }"
      :filter="([shortClassInfo, [error, classInfo]], query) => {
        // Run a basic query on short class info
        shouldAppear = `${shortClassInfo.department} ${shortClassInfo.course} ${shortClassInfo.department}${shortClassInfo.course} ${shortClassInfo.CRN}`.toLowerCase().indexOf(query.toLowerCase()) != -1;
        if (error === null) {
          // Search by instructor name
          shouldAppear = shouldAppear || classInfo.times.some((classSchedule) => classSchedule.instructor.some((instructor) => instructor.toLowerCase().indexOf(query.toLowerCase()) != -1));
        }
        return shouldAppear;
    }"
    >
      <div v-if="error === null && classInfo !== null" class="class">
        <ClassView :classData="classInfo">
          <div v-if="classInfo.seats === 0 && classInfo.wait_seats === 0">
            <UnregisterButton :classInfo="shortClassInfo" :email="email" />
          </div>
        </ClassView>
      </div>
      <div v-else-if="error !== null">
        <p>Error loading {{shortClassInfo.campus.toUpperCase()}} {{shortClassInfo.department}}{{shortClassInfo.course}} {{shortClassInfo.CRN}}</p>
        <p>{{error}}</p>
      </div>
    </SearchableList>
    <div v-if="classesError !== null">
      <p>{{classesError}}</p>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getUserClasses, ShortClassInfo } from "../../utilities/classesFyiApi";
import SearchableList from "../../components/SearchableList.vue";
import { getClassInfo } from "../../utilities/openCourseApi";
import { ClassInfo } from "../../../../server/api/data";
import { APIError } from "../../utilities/APIError";
import ClassView from "../../components/ClassView.vue";
import UnregisterButton from "../../components/UnregisterButton.vue";
import UnregisterAllButton from "../../components/UnregisterAllButton.vue";

export default defineComponent({
  name: "UserData",
  components: {
    SearchableList,
    ClassView,
    UnregisterButton,
    UnregisterAllButton,
  },
  setup(props) {
    const route = useRoute();
    const email = computed(() => route.params.email as string);

    const possibleClasses = ref<
      [ShortClassInfo, [APIError, null] | [null, ClassInfo]][] | null
    >(null);
    const classesError = ref<string | null>(null);

    const getClasses = async () => {
      const [apiError, result] = await getUserClasses(email.value);

      if (result !== null) {
        const tasks = result.map(async (shortClassInfo) => {
          return [
            shortClassInfo,
            await getClassInfo(
              shortClassInfo.campus,
              shortClassInfo.department,
              shortClassInfo.course,
              shortClassInfo.CRN
            ),
          ] as [ShortClassInfo, [APIError, null] | [null, ClassInfo]];
        });
        const classInfos = await Promise.all(tasks);

        possibleClasses.value = classInfos;
        classesError.value = null;
      } else if (apiError !== null) {
        classesError.value = `Something went wrong, please try again. ${apiError.toString()}`;
        possibleClasses.value = null;
      } else {
        classesError.value = `No classes found.`;
        possibleClasses.value = null;
      }
    };

    onMounted(getClasses);

    return { email, possibleClasses, classesError, getClasses };
  },
});
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.header > * {
  flex: 1;
}
.header .unregister-button {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.class {
  margin: 2em 0;
}
</style>