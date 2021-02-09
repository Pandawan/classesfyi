<template>
  <div>
    <p>
      Ready to start? Let's link your email.
      <span class="tooltip" tabindex="0">
        Why do you need this?
        <span class="tooltip-text">
          Linking your email lets us verify it and send you updates about your
          classes.
        </span>
      </span>
    </p>
    <form action="#" @submit.prevent="submit">
      <input
        v-model="emailInput"
        @input="error = null"
        type="email"
        name="email"
        placeholder="Enter your email..."
        :class="error !== null ? 'error' : ''"
      />
      <button type="submit" :class="error !== null ? 'button error' : 'button'">
        Link Email
      </button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">{{ success }}</div>
  </div>
  <div class="class-select">
    <h2>Just looking for class information?</h2>
    <label>
      <!-- TODO: Previous term viewing (termStore can have isCurrentTerm to display/hide register button) -->
      <p>Choose a campus and look for classes</p>
      <CampusSelect />
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { userStore } from "/@/stores/user";
import fire from "/@/utilities/fire";
import CampusSelect from "/@/components/CampusSelect.vue";

export default defineComponent({
  name: "NonAuthedHome",
  components: { CampusSelect },
  setup() {
    const emailInput = ref<string | null>(userStore.state.email ?? null);
    const error = ref<string | null>(null);
    const success = ref<string | null>(null);

    const submit = async () => {
      error.value = null;
      try {
        userStore.setEmail(emailInput.value);

        const result = await fire
          .auth()
          .sendSignInLinkToEmail(emailInput.value, {
            url: window.location.href,
            handleCodeInApp: true,
          });

        success.value = "Okay! Please check your email for a sign in link.";
      } catch (err) {
        error.value = err?.message ?? err;
      }
    };

    return { emailInput, error, success, submit };
  },
});
</script>

<style scoped>
.class-select {
  margin-top: 1.5rem;
}

.class-select h2 {
  margin-bottom: 0.5rem;
}

.tooltip {
  position: relative;
  display: inline-block;
  color: var(--side-text);
  border-bottom: 1px dotted var(--side-text);
}

.tooltip .tooltip-text {
  visibility: hidden;
  width: 200px;
  background-color: var(--side-text);
  color: var(--background);
  border-radius: 6px;
  padding: 5px;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  opacity: 0;
  left: 105%;

  transition: all 0.1s ease;
}

@media only screen and (max-width: 500px) {
  .tooltip:hover,
  .tooltip:focus {
    margin-bottom: 80px;
  }
  .tooltip .tooltip-text {
    top: 125%;
    left: 0;
    display: block;
  }
}

.tooltip:hover .tooltip-text,
.tooltip:focus .tooltip-text {
  visibility: visible;
  opacity: 1;
}

@media only screen and (min-width: 500px) {
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
}
</style>