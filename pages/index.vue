<template>
  <p class="greeting">Lets Learn Tamil!</p>
  <NuxtLink :to="'/learn/' + learnLevel">Go -></NuxtLink>
</template>
<script setup lang="ts">
    let learnLevel:number = 1;
</script>
