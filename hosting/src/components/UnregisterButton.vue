<template>
  <div class="container">
    <button
      v-if="state === 'initial'"
      v-on:click="unregister"
      class="button initial-button"
    >
      Unregister
    </button>
    <div v-if="error" class="error-message">{{ error.toString() }}</div>
    <div v-if="state === 'success'" class="success-message">
      Successfully unregistered.
    </div>
  </div>
</template>

<script lang="ts">
import { emailStore } from "../stores/email";
import { defineComponent, PropType, ref } from "vue";
import { unregisterForClass } from "../utilities/classesFyiApi";
import { ClassInfo } from "../utilities/openCourseApi";

export default defineComponent({
  name: "UnregisterButton",
  props: {
    classInfo: {
      type: Object as PropType<ClassInfo>,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const state = ref<"initial" | "loading" | "success">("initial");
    const input = ref<string>(emailStore.state.email ?? "");
    const error = ref<string | null>(null);

    const unregister = async () => {
      error.value = null;

      state.value = "loading";

      const [apiError, result] = await unregisterForClass(props.email, {
        campus: props.classInfo.campus,
        department: props.classInfo.department,
        course: props.classInfo.course,
        crn: props.classInfo.CRN,
      });

      if (result !== null) {
        // TODO: Change API to return list of registered/duplicated classes so client can say when they were not registered
        state.value = "success";
      } else {
        state.value = "initial";
        error.value = `Something went wrong, please try again. ${apiError.toString()}`;
      }
    };

    return { state, input, error, unregister };
  },
});
</script>

<style>
.error-input {
  border-color: #ff7975;
}
.error-message {
  color: red;
}
.success-message {
  color: green;
}
</style>
