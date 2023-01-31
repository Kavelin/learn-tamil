<template>

    <div><h1>hi{{ theLevel }} </h1></div>
    <div id="gaming">
      <h1 id="to_type"> {{ to_type }}</h1>
      <input type="text" v-model="main_input" />
    </div>
  </template>
  
  <script lang="ts" setup>
  
  const route = useRoute();
  
  let theLevel = route.params.id;
  let gam:boolean = false;
  let main_input:String = "";
  let to_type:String = "";
  </script>
  