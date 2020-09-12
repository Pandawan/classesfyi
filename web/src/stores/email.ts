import { reactive } from "vue";

export const emailStore = {
  debug: true,

  state: reactive({
    email: "",
  }),

  setEmail(newValue: string) {
    if (this.debug) {
      console.log("setEmail triggered with", newValue);
    }

    this.state.email = newValue;
  },

  validateEmail(e: string) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      e
    );
  },
};
