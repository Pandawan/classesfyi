<template>
  <button class="button" @click="signOut">Sign Out</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import fire from "../utilities/fire";

export default defineComponent({
  name: "SignOutButton",
  setup() {
    const router = useRouter();

    const signOut = async () => {
      await fire.auth().signOut();
      router.push("/");
    };

    return { signOut };
  },
});
</script>

<style scoped>
</style>