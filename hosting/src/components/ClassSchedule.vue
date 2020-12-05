<template>
  <ul class="schedule-list">
    <li v-for="time in schedule">
      <!-- TODO: Have some kind of link/popup that shows the time schedule in a calendar/weekly planner view 
            Or at least have it so hovering over time.days shows a list of all the full days?
          -->
      <div v-if="time.days !== 'TBA'">On {{ time.days }}</div>
      <div v-if="time.start_time !== 'TBA' || time.end_time !== 'TBA'">
        From {{ time.start_time }} to {{ time.end_time }}
      </div>
      <div
        v-if="
          time.days === 'TBA' &&
          time.start_time === 'TBA' &&
          time.end_time === 'TBA'
        "
      >
        Asynchronous
      </div>
      <!-- TODO: Have a RateMyProfessor link -->
      <div>{{ time.type }} with {{ time.instructor.join(", and") }}</div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ClassInfo } from "../utilities/openCourseApi";

export default defineComponent({
  name: "ClassSchedule",
  props: {
    schedule: {
      type: Object as PropType<ClassInfo["times"]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.schedule-list {
  list-style: none;
  margin: 0;
}
.schedule-list li {
  margin-left: 0.25rem;
  border-left: 2px solid grey;
  padding-left: 1rem;
  margin: 0.25rem;
}
</style>