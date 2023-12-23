<template>
  <div id="wrapper">
    <div>
      <span id="title">Learn Tamil!</span>
      <NuxtLink :to="'/learn/' + learnLevel">Basics -></NuxtLink>
      <NuxtLink to="/conjugation/">Conjugation -></NuxtLink>
    </div>
  </div>
</template>
<style scoped>
#wrapper {
  height:100vh;
}
#wrapper div {
  margin: auto;
  width: fit-content;
  top:20%;
  position:relative;
  padding:32px;
}
#title {
  font-weight:300;
  font-size:3em;
}
a {
  border: 2px solid #adadad;
  border-radius: 4px;
  color: black;
  text-decoration: none;
  cursor: default;
  padding: 8px;
  font-family: "Noto Sans Tamil", sans-serif;
  margin: 8px;
  transition: background 300ms, border-color 300ms, color 300ms;
  background: #d4d4d4;
  width: fit-content;
  display: block;
}
a:hover {
  background: #adadad;
  color: #3939d8;
}
a:click {
  background: #353535;
  border-color: #353535;
}
</style>
<script setup lang="ts">
let learnLevel: number = 1;
</script>
