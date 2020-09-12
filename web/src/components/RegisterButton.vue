<template>
  <div class="container">
    <button
      v-if="state === 'initial'"
      v-on:click="state = 'active'"
      class="button initial-button"
    >Register for Updates</button>
    <div v-else-if="state === 'active'">
      <form v-on:submit.prevent class="active">
        <input
          v-model="input"
          v-on:change="error = undefined"
          :class="`active-input ${error ? 'error-input' : ''}`"
          type="email"
          placeholder="Enter your email..."
        />
        <button v-on:click="register" class="button active-button">Register</button>
      </form>
      <div v-if="error" class="error-message">{{error}}</div>
    </div>
    <div v-if="state === 'success'" class="success-message">Successfully registered for updates.</div>
  </div>
</template>

<script lang="ts">
import { emailStore } from "../stores/email";
import { defineComponent, PropType, ref } from "vue";
import { ClassInfo } from "../utilities/openCourseApi";

export default defineComponent({
  name: "RegisterButton",
  props: {
    classInfo: {
      type: Object as PropType<ClassInfo>,
      required: true,
    },
  },
  setup(props) {
    const state = ref<"initial" | "active" | "success">("initial");
    const input = ref<string>("");
    const error = ref<string | null>(null);

    const register = async () => {
      error.value = null;
      if (emailStore.validateEmail(input.value) === false) {
        error.value = "Invalid email address";
        return;
      }
      emailStore.setEmail(input.value);

      try {
        // TODO: Verify request
        const res = await fetch("/api/register", {
          method: "POST",
          body: JSON.stringify({
            classes: [props.classInfo],
            email: input.value,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          state.value = "success";
        } else {
          error.value = res.statusText;
        }
      } catch (e) {
        error.value = `Something went wrong, please try again.`;
        console.error(e);
      }
    };

    return { state, input, error, register };
  },
});
</script>

<style>
.active {
  display: flex;
}
.active-input {
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.active .active-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
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
