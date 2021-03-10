<template>
  <section>
    <h2>
      <BackButton />
      <span>About</span>
    </h2>
    <p>
      Classes.fyi aims to help student register for their classes more easily.
    </p>
    <p>
      Because of the limited availability of classes, it is often difficult to
      get an open spot for all of the classes you are interested in. This tool
      sends simple email alerts whenever a spot for a class you're looking to
      get into opens up, allowing you to get on MyPortal and register
      immediately.
    </p>
  </section>
  <section>
    <h2>Privacy</h2>
    <p>
      This website does not collect any personal information other than your
      email address in order to send you class availability alerts.
    </p>
    <p>
      Your email address is stored securely, will never be used for any other
      purposes, and will never be sold to third-parties.
    </p>
  </section>
  <section>
    <h2>Credits</h2>
    <p>
      The Classes.fyi website and its server are entirely open source and
      <a href="https://github.com/Pandawan/classesfyi">available on GitHub</a>.
    </p>
    <p>
      Made by
      <a href="https://migueltenant.com">Miguel Tenant de La Tour</a>
      with the help of
      <a href="https://github.com/madhavarshney">Madhav Varshney</a>.
    </p>
    <p>
      Class data provided by
      <a href="https://github.com/OpenCourseAPI/OpenCourseAPI">OpenCourseAPI</a
      >.
    </p>
  </section>
  <section>
    <h2>Need Help?</h2>
    <p>
      Contact us at
      <a href="mailto:help@classes.fyi">help@classes.fyi</a> or on Discord
      <code>@Pandawan#4158</code>
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BackButton from "/@/components/BackButton.vue";

export default defineComponent({
  name: "About",
  components: {
    BackButton,
  },
});
</script>

<style scoped>
section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
</style>