import { reactive } from "vue";
import fire from "/@/utilities/fire";

export const userStore = {
  state: reactive({
    isSignedIn: false,
    // By default, email uses the localStorage value
    email: localStorage.getItem("email") ?? "",
  }),

  /**
   * Set the email in the store & localStorage.
   * Note: This is used for authentcation flow to remember the email it is currently signing in with.
   * @param email The email to store.
   */
  setEmail(email: string) {
    this.state.email = email;
    localStorage.setItem("email", email);
  },

  /**
   * Update the userStore about changes to the currently authenticated user.
   * 
   * **Note: This should only be called by firebase's `onAuthStateChanged`**
   * @param user The firebase user to set.
   */
  updateUser(user: firebase.default.User | null) {
    if (user) {
      this.state.isSignedIn = true;
      this.state.email = user.email;
    } else {
      this.state.isSignedIn = false;
      this.state.email = "";
    }
  },
};

export let authStateUnsub: firebase.default.Unsubscribe | null = null;
if (authStateUnsub === null) {
  authStateUnsub = fire.auth().onAuthStateChanged((user) => {
    userStore.updateUser(user);
  });
}
