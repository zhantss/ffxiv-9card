<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    msg: String,
  },
  setup() {
    return {
    };
  },
});
</script>

<template>
  <h1>{{ msg }}</h1>

  <p>See <code>README.md</code> for more information.</p>

</template>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
