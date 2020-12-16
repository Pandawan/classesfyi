import { reactive } from "vue";
import fire from "/@/utilities/fire";
import { ShortClassInfo } from "/@/utilities/classInfo";

interface UserStoreState {
  isSignedIn: boolean;
  email: string | null;
  registeredClasses: ShortClassInfo[] | null;
}

export const userStore = {
  state: reactive<UserStoreState>({
    isSignedIn: false,
    // By default, email uses the localStorage value
    email: localStorage.getItem("email") ?? null,
    registeredClasses: null,
  }),

  /**
   * Set the email in the store & localStorage.
   * Note: This is used for authentcation flow to remember the email it is currently signing in with.
   * @param email The email to store.
   */
  setEmail(email: string | null) {
    this.state.email = email;
    if (email === null) {
      localStorage.removeItem("email");
    } else {
      localStorage.setItem("email", email);
    }
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
      this.setEmail(user.email);
    } else {
      this.state.isSignedIn = false;
      this.setEmail(null);
    }
  },

  /**
   * Update the list of registered classes for the user.
   * 
   * **Note: This should only be called by firebase's `onAuthStateChanged`**
   * @param registeredClasses Updated list of registered classes
   */
  updateRegisteredClasses(registeredClasses: ShortClassInfo[] | null) {
    this.state.registeredClasses = registeredClasses;
  },
};

export let authListenerUnsub: firebase.default.Unsubscribe | null = null;
export let firestoreListenerUnsub: firebase.default.Unsubscribe | null = null;

// Only register once for auth state changes
if (authListenerUnsub === null) {
  // Listen to authstate changes
  authListenerUnsub = fire.auth().onAuthStateChanged((user) => {
    // Update user store with new user
    userStore.updateUser(user);

    // Unsubscribe from previous firestore event listener
    if (firestoreListenerUnsub !== null) {
      firestoreListenerUnsub();
    }

    // If user is logged in and has email
    if (user && user.email) {
      // Subscribe to new firestore event listener with new user's email
      firestoreListenerUnsub = fire.firestore().collection("users").doc(
        user.email,
      ).onSnapshot((doc) => {
        // If the user exists in the database
        if (doc.exists) {
          // Get registered classes and keep updating them in user store
          const registeredClasses = doc.data()?.registered_classes;
          userStore.updateRegisteredClasses(registeredClasses ?? null);
        } else {
          // User does not exist, set classes to null in user store
          userStore.updateRegisteredClasses(null);
        }
      });
    } else {
      // User is not logged in, set classes to null in user store
      userStore.updateRegisteredClasses(null);
    }
  });
}
