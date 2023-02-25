<template>
  <h1 class="greeting">Lets Learn Tamil!</h1>
  <NuxtLink :to="'/learn/' + learnLevel">Go -></NuxtLink>
  <NuxtLink to="/conjugation/">Conjugation -></NuxtLink>
</template>
<script setup lang="ts">
    let learnLevel:number = 1;
</script>
