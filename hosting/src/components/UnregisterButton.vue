<template>
  <div class="container">
    <button v-if="state === 'initial'" @click="unregister" class="button">
      Unregister
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
import { unregisterForClass } from "/@/utilities/classesFyiApi";
import { ClassInfo } from "/@/utilities/openCourseApi";
import { getOrFetchTerm } from "/@/stores/term";
import fire from "/@/utilities/fire";
import firebase from "firebase/app";

export default defineComponent({
  name: "UnregisterButton",
  props: {
    classInfo: {
      type: Object as PropType<ClassInfo>,
      required: true,
    },
  },
  setup(props) {
    const state = ref<"initial" | "loading" | "success">("initial");
    const error = ref<string | null>(null);

    const unregister = async () => {
      if (userStore.state.isSignedIn === false) {
        error.value = "Could not register for class, please sign in.";
        return;
      }
      error.value = null;
      state.value = "loading";

      const { year, term } = await getOrFetchTerm(props.classInfo.campus);

      try {
        const userDoc = await fire
          .firestore()
          .collection("users")
          .doc(userStore.state.email);

        // User doc SHOULD exist, no way to see the unregister button otherwise
        if ((await userDoc.get()).exists) {
          await userDoc.update({
            registered_classes: firebase.firestore.FieldValue.arrayRemove({
              campus: props.classInfo.campus,
              year,
              term,
              crn: props.classInfo.CRN,
            }),
          });

          // If user is no longer registered to any class, delete the user doc
          const newRegisteredClasses = (await userDoc.get()).data()
            .registered_classes;
          if (
            !newRegisteredClasses ||
            (Array.isArray(newRegisteredClasses) &&
              newRegisteredClasses.length === 0)
          ) {
            await userDoc.delete();
          }
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
