<template>
  <h2>
    <BackButton />
    <span>User Information</span>
  </h2>
  <label for="email">
    <p>See and manage the classes you're registered to</p>
  </label>
  <form @submit="submit" class="active">
    <input
      id="email"
      v-model="input"
      v-on:change="error = null"
      :class="`active-input ${error ? 'error-input' : ''}`"
      type="email"
      placeholder="Enter your email..."
    />
    <button class="button active-button">Check Registered Classes</button>
    <div v-if="error" class="error-message">{{error}}</div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { emailStore } from "../../stores/email";
import BackButton from "../../components/BackButton.vue";

export default defineComponent({
  name: "UnregisterForm",
  components: {
    BackButton,
  },
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
</style>