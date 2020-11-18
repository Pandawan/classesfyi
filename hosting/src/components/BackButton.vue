<template>
  <a class="back" v-on:click="goBack"></a>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "BackButton",
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.back();
    };

    return { goBack };
  },
});
</script>

<style scoped>
.back {
  cursor: pointer;
}
.back {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.25em;
}

.back:after {
  content: "";
  display: inline-block;
  margin-left: 0.2em;
  width: 0.5em;
  height: 0.5em;
  border-top: 0.15em solid var(--important-text);
  border-right: 0.15em solid var(--important-text);
  -moz-transform: rotate(-135deg);
  -webkit-transform: rotate(-135deg);
  transform: rotate(-135deg);
}
</style>