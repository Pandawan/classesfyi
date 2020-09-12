<template>
  <input class="search-input" v-model="searchQuery" :placeholder="placeholder" />
  <div class="list">
    <div class="list-item" v-for="item in filteredItems">
      <slot :item="item">Missing template</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";

export default defineComponent({
  name: "SearchableList",
  props: {
    placeholder: {
      type: String,
      required: false,
      default: "Search...",
    },
    items: {
      type: Array,
      required: true,
    },
    filter: {
      type: Function as PropType<(item: any, query: string) => boolean>,
      required: false,
      default: () => {
        return (item, query) =>
          item.toLowerCase().indexOf(query.toLowerCase()) != -1;
      },
    },
  },
  setup(props) {
    const searchQuery = ref<string>("");

    const filteredItems = computed(() =>
      props.items.filter((item) => props.filter(item, searchQuery.value))
    );

    return { searchQuery, filteredItems };
  },
});
</script>

<style scoped>
.search-input {
  width: 100%;
  text-align: start;
  padding: 0.75em 0.5em;
  margin-bottom: 1em;
}
</style>