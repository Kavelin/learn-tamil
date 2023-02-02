<template>
  <div v-if="!gam">
    <h1>Level {{ theLevel }}</h1>
    <button @click="nextPage">Next -></button>
  </div>
  <div id="gaming" v-else>
    <div v-if="!defin">
      <h1 id="to_type">{{ words[currentWord].word }}</h1>
      <input type="text" @keypress.enter="check" v-model="mainInput" />
      <button @click="check">Next -></button>
    </div>
    <div v-else>
      <h1>{{ words[currentWord].def }}</h1>
      <button @click="nextWord">Next -></button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();

interface Word {
  image?: String;
  word: String;
  rom: String; //romanization
  def: String;
}

let theLevel = useState("theLevel", () => route.params.level);

let gam = useState("gam", () => false);
let defin = useState("defin", () => false);
let mainInput = useState("mainInput", () => "");
let words = useState("words", () => [
  { word: "அம்மா", rom: "amma", def: "mom" },
  { word: "அப்பா", rom: "appa", def: "dad" },
]);
let currentWord = useState("currentWord", () => 0);
let nextPage = () => {
  //if (pages opofdals jflaj)
  gam.value = !gam.value;
}
let check = () => {
  if (mainInput.value == words.value[currentWord.value].rom)
    defin.value = !defin.value;
  mainInput.value = "";
};
let nextWord = () => {
  defin.value = !defin.value;
  currentWord.value++;
};
</script>
