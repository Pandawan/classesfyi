<template>
  <h2>User {{email}}</h2>
  <section>
    <h3>Currently Registered Classes</h3>

    <pre>
    <code>{{ JSON.stringify(classes, null, '\t')}}</code>
  </pre>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getUserClasses, ShortClassInfo } from "../../utilities/classesFyiApi";

export default defineComponent({
  name: "UserData",
  setup(props) {
    const route = useRoute();
    const email = computed(() => route.params.email as string);

    const classes = ref<ShortClassInfo[] | null>(null);
    const error = ref<string | null>(null);

    const getClasses = async () => {
      const [apiError, result] = await getUserClasses(email.value);

      if (result !== null) {
        classes.value = result;
      } else {
        error.value = `Something went wrong, please try again. ${apiError.toString()}`;
      }
    };

    onMounted(getClasses);

    return { email, classes };
  },
});
</script>

<style scoped>
</style>