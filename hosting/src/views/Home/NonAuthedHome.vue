<template>
  <p>Ready to start? Let's link your email.</p>
  <form
    action="#"
    @submit.prevent="submit"
    :class="error !== null ? 'error' : ''"
  >
    <input
      v-model="emailInput"
      @input="error = null"
      type="email"
      name="email"
      placeholder="Enter your email..."
    />
    <button type="submit" class="button">Link Email</button>
  </form>
  <div v-if="error" class="error-message">{{ error.toString() }}</div>
  <div v-if="success" class="success-message">{{ success.toString() }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import fire from "/@/utilities/fire";

export default defineComponent({
  name: "NonAuthedHome",
  setup() {
    const emailInput = ref<string | null>(null);
    const error = ref<string | null>(null);
    const success = ref<string | null>(null);

    const submit = async () => {
      try {
        const result = await fire
          .auth()
          .sendSignInLinkToEmail(emailInput.value, {
            url: window.location.href,
            handleCodeInApp: true,
          });

        success.value = "Okay! Please check your email for a sign in link.";
      } catch (err) {
        error.value = err;
      }
    };

    return { emailInput, error, success, submit };
  },
});
</script>

<style scoped>
form {
  flex-direction: row;
}
form input {
  border-right: none;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex: 1;
}
form button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

form.error input,
form.error button {
  border-color: #ff7975;
}
.error-message {
  color: red;
}

.success-message {
  color: green;
}
</style>