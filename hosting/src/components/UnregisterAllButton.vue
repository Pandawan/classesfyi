<template>
  <div class="container">
    <button v-if="state === 'initial'" @click="unregister" class="button">
      Unregister From All Classes
    </button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="state === 'loading'">Loading...</div>
    <div v-if="state === 'success'" class="success">
      Successfully unregistered.
    </div>
  </div>
</template>

<script lang="ts">
import { userStore } from "/@/stores/user";
import { defineComponent, PropType, ref } from "vue";
import { ClassInfo } from "/@/utilities/openCourseApi";
import { unregisterFromAllClasses } from "/@/utilities/classesFyiApi";
import fire from "/@/utilities/fire";

export default defineComponent({
  name: "UnregisterAllButton",
  setup(props, { emit }) {
    const state = ref<"initial" | "loading" | "success">("initial");
    const error = ref<string | null>(null);

    const unregister = async () => {
      if (userStore.state.isSignedIn === false) {
        error.value = "Could not register for class, please sign in.";
        return;
      }
      error.value = null;
      state.value = "loading";

      try {
        const userDoc = await fire
          .firestore()
          .collection("users")
          .doc(userStore.state.email);

        // User doc SHOULD exist, no way to see the unregister all button otherwise
        if ((await userDoc.get()).exists) {
          await userDoc.delete();
        }
      } catch (err) {
        state.value = "initial";
        error.value = `Something went wrong, please try again. ${err.toString()}`;
      }
    };

    return { state, error, unregister };
  },
});
</script>

<style scoped>
</style>
