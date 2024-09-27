<template>
  <div id="wrapper">
    <div>
      <span id="title">Learn Tamil!</span>
      <br> <br>
      <NuxtLink :to="'/basics/' + learnLevel">Basics -> <br> <i> learn the tamil alphabet! </i> </NuxtLink>
      <a class="disabled" title="under construction!">Conjugation -> <br> <i> learn conjugation of verbs! (under construction)</i> </a>
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
  text-align:center;
}
a {
  border: 2px solid #adadad;
  background: #d4d4d4;
  border-radius: 4px;
  color: black;
  text-decoration: none;
  padding: 8px 0 8px 8px;
  font-family: "Noto Sans Tamil", sans-serif;
  margin: 8px;
  transition: background 300ms, border-color 300ms, color 300ms;
  width: 100%;
  display: block;
}
a:hover {
  background: #adadad;
  color: black;
}
a:click {
  background: #353535;
  border-color: #353535;
}
a i {
  font-size:80%;
  color: rgb(126, 126, 126);
}
.disabled {
  color: rgb(126, 126, 126)!important;
  background: #d4d4d4!important;
  cursor: not-allowed;
  opacity: 0.5;
  text-decoration: none;
}
</style>
<script setup lang="ts">
let learnLevel: number = 1;
</script>
