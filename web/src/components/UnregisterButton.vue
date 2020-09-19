<template>
  <div class="container">
    <button
      v-if="state === 'initial'"
      v-on:click="unregister"
      class="button initial-button"
    >Unregister</button>
    <div v-if="error" class="error-message">{{error.toString()}}</div>
    <div v-if="state === 'success'" class="success-message">Successfully unregistered.</div>
  </div>
</template>

<script lang="ts">
import { emailStore } from "../stores/email";
import { defineComponent, PropType, ref } from "vue";
import { ClassInfo } from "../utilities/openCourseApi";
import { unregisterForClass } from "../utilities/classesFyiApi";

export default defineComponent({
  name: "RegisterButton",
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
    const state = ref<"initial" | "success">("initial");
    const input = ref<string>(emailStore.state.email ?? "");
    const error = ref<string | null>(null);

    const unregister = async () => {
      error.value = null;

      const [apiError, result] = await unregisterForClass(
        props.email,
        props.classInfo
      );

      if (result !== null) {
        if (result.length === 0) {
          error.value = "This email address was not signed up for that class.";
        } else if (result[0].type === "unregistered") {
          state.value = "success";
        }
      } else {
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
