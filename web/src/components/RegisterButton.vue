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
          v-on:change="error = null"
          :class="`active-input ${error ? 'error-input' : ''}`"
          type="email"
          placeholder="Enter your email..."
        />
        <button v-on:click="register" class="button active-button">Register</button>
      </form>
      <div v-if="error" class="error-message">{{error.toString()}}</div>
    </div>
    <div v-if="state === 'success'" class="success-message">Successfully registered for updates.</div>
  </div>
</template>

<script lang="ts">
import { emailStore } from "../stores/email";
import { defineComponent, PropType, ref } from "vue";
import { ClassInfo } from "../utilities/openCourseApi";
import { registerForClass } from "../utilities/classesFyiApi";

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
    const input = ref<string>(emailStore.state.email ?? "");
    const error = ref<string | null>(null);

    const register = async () => {
      error.value = null;
      if (emailStore.validateEmail(input.value) === false) {
        error.value = "Invalid email address";
        return;
      }
      emailStore.setEmail(input.value);

      const [apiError, result] = await registerForClass(
        input.value,
        props.classInfo
      );

      if (result !== null) {
        if (result[0].type === "registered") {
          state.value = "success";
        } else if (result[0].type === "duplicated") {
          error.value = "You are already registered for this class.";
        }
      } else {
        error.value = `Something went wrong, please try again. ${apiError.toString()}`;
      }
    };

    return { state, input, error, register };
  },
});
</script>

<style scoped>
.active {
  display: flex;
  flex-direction: column;
}

@media (min-width: 400px) {
  .active {
    flex-direction: row;
  }
  .active-input {
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    flex: 1;
  }
  .active-button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
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
