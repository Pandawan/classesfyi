<template>
  <section>
    <h2>What is it?</h2>
    <ul class="feature-list">
      <li>No need to constantly refresh the class signup page.</li>
      <li>
        Simply register for updates for the classes you want, and we'll email
        you when they open up.
      </li>
      <li>Get started now, no account required.</li>
    </ul>
    <p class="side-text">
      Please note that you are not actually signing up for these classes, you
      are simply getting updates about their availability.
    </p>
  </section>
  <section>
    <div v-if="isSignedIn === true">
      <AuthedHome />
    </div>
    <div v-else-if="isSignedIn === false">
      <p v-if="signInError" class="error">
        {{ signInError.toString() }}
      </p>
      <NonAuthedHome />
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import AuthedHome from "./AuthedHome.vue";
import NonAuthedHome from "./NonAuthedHome.vue";
import { userStore } from "/@/stores/user";
import fire from "/@/utilities/fire";

export default defineComponent({
  name: "Home",
  components: { AuthedHome, NonAuthedHome },
  setup() {
    const isSignedIn = computed(() => userStore.state.isSignedIn);
    const signInError = ref<string | null>(null);

    const attemptSignIn = async () => {
      if (fire.auth().currentUser !== null) {
        signInError.value = null;
        return;
      }

      // If current link is trying to sign in
      if (
        userStore.state.email !== null &&
        fire.auth().isSignInWithEmailLink(window.location.href)
      ) {
        try {
          const result = await fire
            .auth()
            .signInWithEmailLink(userStore.state.email);

          signInError.value = null;
        } catch (err) {
          // HACK: Don't show error message with internal-error because those happen when loading user state.
          if (err.code !== undefined && err.code !== "auth/internal-error") {
            signInError.value =
              "Could not complete sign in process, please try again.";
            console.error(err);
          }
        }
      }
    };
    // Run and watch for changes to dependencies
    watchEffect(attemptSignIn);

    window["fire"] = fire;

    return { isSignedIn, signInError };
  },
});
</script>

<style scoped>
section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
</style>