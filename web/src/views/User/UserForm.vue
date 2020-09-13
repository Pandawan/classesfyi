<template>
  <p>See which classes you're registered to</p>
  <form @submit="submit">
    <input
      v-model="input"
      v-on:change="error = null"
      :class="error ? 'error-input' : ''"
      type="email"
      placeholder="Enter your email..."
    />
    <div v-if="error" class="error-message">{{error}}</div>
    <button class="button">Check Registered Classes</button>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { emailStore } from "../../stores/email";
export default defineComponent({
  name: "UnregisterForm",
  setup(props) {
    const router = useRouter();
    const error = ref<string | null>(null);
    const input = ref<string>(emailStore.state.email ?? "");

    const submit = async () => {
      error.value = null;
      if (emailStore.validateEmail(input.value) === false) {
        error.value = "Invalid email address";
        return;
      }
      emailStore.setEmail(input.value);

      router.push(`/user/${input.value}`);
    };

    return { input, submit, error };
  },
});
</script>

<style scoped>
.error-input {
  border-color: #ff7975;
}
.error-message {
  color: red;
}
</style>