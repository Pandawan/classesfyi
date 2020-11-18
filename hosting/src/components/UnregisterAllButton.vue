<template>
  <div class="container">
    <button
      v-if="state === 'initial'"
      v-on:click="unregister"
      class="button initial-button"
    >
      Unregister From All Classes
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
import { ClassInfo } from "../utilities/openCourseApi";
import {
  unregisterForClass,
  unregisterFromAllClasses,
} from "../utilities/classesFyiApi";

export default defineComponent({
  name: "RegisterButton",
  props: {
    email: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const state = ref<"initial" | "success">("initial");
    const input = ref<string>(emailStore.state.email ?? "");
    const error = ref<string | null>(null);

    const unregister = async () => {
      error.value = null;

      const [apiError, result] = await unregisterFromAllClasses(props.email);

      if (result !== null) {
        // TODO: Change API to return list of registered/duplicated classes so client can say when they were not registered
        state.value = "success";
        emit("success");
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
