<template>
  <div class="class">
    <div class="class-header">
      <div>
        <h2 class="title">
          {{ classData.department }}{{ classData.course }} ({{ classData.CRN }})
        </h2>
        <div class="tags">
          <Tag v-if="isOpeningUp" color="yellow">{{
            classData.seats > 1
              ? `${classData.seats} seats are opening up`
              : `${classData.seats} seat is opening up`
          }}</Tag>
          <Tag
            v-else
            :color="statusColors[classData['status']]"
            class="status-tag"
          >
            {{ classData.status }}
          </Tag>
          <Tag v-if="isOnline">Online</Tag>
        </div>
      </div>
      <slot :classData="classData" />
    </div>
    <div class="seats">
      <div v-if="classData.seats !== 0">
        Available seats: {{ classData.seats }}
      </div>
      <div v-if="classData.wait_seats !== 0">
        Available waitlist seats: {{ classData.wait_seats }}
      </div>
      <div v-if="classData.seats === 0 && classData.wait_seats === 0">
        No open or waitlist seats available.
      </div>
    </div>
    <div>Duration: {{ classData.start }} - {{ classData.end }}</div>
    <div>Units: {{ classData.units }}</div>
    <div>
      Schedule:
      <ClassSchedule :schedule="classData.times" />
    </div>
  </div>
</template>

<script lang="ts">
import Tag from "./Tag.vue";
import RegisterButton from "./RegisterButton.vue";
import { computed, PropType } from "vue";
import { ClassInfo } from "../utilities/openCourseApi";
import ClassSchedule from "./ClassSchedule.vue";

const statusColors = {
  open: "green",
  waitlist: "yellow",
  full: "red",
  unknown: "yellow",
};

export default {
  name: "ClassView",
  components: { Tag, RegisterButton, ClassSchedule },
  props: {
    classData: {
      type: Object as PropType<ClassInfo>,
      required: true,
    },
  },
  setup(props) {
    const isOpeningUp = computed(
      () =>
        props.classData.seats > 0 &&
        props.classData.wait_seats === 0 &&
        props.classData.status === "open"
    );

    const isOnline = computed(() =>
      props.classData.times.every((time) =>
        time.location.toLowerCase().includes("online")
      )
    );

    return { isOpeningUp, isOnline, statusColors };
  },
};
</script>

<style scoped>
@media (min-width: 500px) {
  .class-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

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

@media (min-width: 500px) {
  .seats {
    flex-direction: row;
  }
}
</style>