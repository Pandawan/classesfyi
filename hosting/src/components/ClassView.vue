<template>
  <div class="class">
    <h2 class="title">
      {{ classData.department }}{{ classData.course }} ({{ classData.CRN }})
    </h2>
    <div class="tags">
      <Tag
        :color="
          { open: 'green', waitlist: 'yellow', full: 'red', unknown: 'yellow' }[
            classData['status']
          ]
        "
        class="status-tag"
        >{{ classData.status }}</Tag
      >
      <Tag
        v-if="
          classData.times.every((time) =>
            time.location.toLowerCase().includes('online')
          )
        "
        >Online</Tag
      >
    </div>
    <div class="seats">
      <div v-if="classData.seats !== 0">
        Available seats: {{ classData.seats }}
      </div>
      <div v-else-if="classData.wait_seats !== 0">
        Available waitlist seats: {{ classData.wait_seats }}
      </div>
      <div v-else>No open or waitlist seats available.</div>
      <slot :classData="classData"></slot>
    </div>
    <div>Duration: {{ classData.start }} - {{ classData.end }}</div>
    <div>Units: {{ classData.units }}</div>
    <div>
      Schedule:
      <ul class="schedule-list">
        <!--
          Make this element a special Info element
        <li
          v-if="
            classData.times.every(
              (s) =>
                s['days'] === 'TBA' &&
                s['start_time'] === 'TBA' &&
                s['end_time'] === 'TBA'
            )
          "
        >
          This class is fully online and asynchronous with no scheduled
          meetings.
        </li>
        
        <li
          v-else-if="
            classData.times.some(
              (s) =>
                s['days'] === 'TBA' &&
                s['start_time'] === 'TBA' &&
                s['end_time'] === 'TBA'
            )
          "
        >
          This class has some online asynchronous component.
        </li>
        -->
        <li v-for="time in classData.times">
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
    </div>
  </div>
</template>

<script lang="ts">
import Tag from "./Tag.vue";
import RegisterButton from "./RegisterButton.vue";
import { PropType } from "vue";
import { ClassInfo } from "../utilities/openCourseApi";

export default {
  name: "ClassView",
  components: { Tag, RegisterButton },
  props: {
    classData: {
      type: Object as PropType<ClassInfo>,
      required: true,
    },
  },
};
</script>

<style scoped>
.title {
  margin-bottom: 0.25rem;
}

.tags > *:not(:first-child) {
  margin-left: 0.25rem;
}
.tags > *:not(:last-child) {
  margin-right: 0.25rem;
}
.status-tag {
  text-transform: capitalize;
}

.seats {
  display: flex;
  flex-direction: column;
}
.seats > *:not(:first-child) {
  margin-left: 0.5rem;
}
.seats > *:not(:last-child) {
  margin-right: 0.5rem;
}

.active {
  display: flex;
  flex-direction: column;
}

@media (min-width: 400px) {
  .seats {
    flex-direction: row;
  }
}

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