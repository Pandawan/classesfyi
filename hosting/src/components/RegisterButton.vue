<template>
  <div class="container">
    <button v-if="state === 'initial'" @click="register" class="button">
      Register for Updates
    </button>
    <div v-if="error" class="error-message">{{ error.toString() }}</div>
    <div v-if="state === 'loading'">Loading...</div>
    <div v-if="state === 'success'" class="success-message">
      Successfully registered for updates.
    </div>
  </div>
</template>

<script lang="ts">
import { userStore } from "/@/stores/user";
import { defineComponent, PropType, ref } from "vue";
import { ClassInfo } from "/@/utilities/openCourseApi";
import { registerForClass } from "/@/utilities/classesFyiApi";

export default defineComponent({
  name: "RegisterButton",
  props: {
    classInfo: {
      type: Object as PropType<ClassInfo>,
      required: true,
    },
  },
  setup(props) {
    const state = ref<"initial" | "loading" | "success" | "error">("initial");
    const error = ref<string | null>(null);

    const register = async () => {
      if (userStore.state.isSignedIn === false) {
        error.value = "Could not register for class, please sign in.";
        return;
      }
      error.value = null;
      state.value = "loading";

      const [apiError, result] = await registerForClass(userStore.state.email, {
        campus: props.classInfo.campus,
        department: props.classInfo.department,
        course: props.classInfo.course,
        crn: props.classInfo.CRN,
      });

      if (result !== null) {
        // TODO: Change API to return list of registered/duplicated classes so client can say when the user is already registered
        state.value = "success";
      } else {
        state.value = "initial";
        error.value = `Something went wrong, please try again. ${apiError.toString()}`;
      }
    };

    return { state, error, register };
  },
});
</script>

<style scoped>
.error-message {
  color: red;
}
.success-message {
  color: green;
}
</style>
