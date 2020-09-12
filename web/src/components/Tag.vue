<template>
  <span class="tag" :style="`--backgroundColor: ${backgroundColor}; --textColor: ${textColor}`">
    <slot />
  </span>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { pickTextColorBasedOnBgColor } from "../utilities/colors";

const colorValues = {
  // TODO: Modularize this
  red: "#ff7975", //"#FF605C",
  yellow: "#ffc65d", // "#FFBD44",
  green: "#00e358", // "#00CA4E",
};

export default defineComponent({
  name: "Tag",
  props: {
    color: {
      type: String,
      required: false,
      default: "#c4c4c4",
    },
  },
  setup(props) {
    const backgroundColor = computed<string>(
      () => colorValues[props.color] ?? props.color
    );

    const textColor = computed<string>(() =>
      pickTextColorBasedOnBgColor(backgroundColor.value, "#fff", "#333")
    );

    return { backgroundColor, textColor };
  },
});
</script>

<style scoped>
.tag {
  border-radius: 5rem;
  padding: 0.1rem 0.5rem;
  font-size: 1rem;
  background-color: var(--backgroundColor, #c4c4c4);
  color: var(--textColor);
}
</style>
