<template>
  <div v-if="!gam">
    <h1>Level {{ curLevel }} : {{ data.title }} </h1>
    <p v-for="page in data.pages" v-bind:key="page">{{ page }}</p>
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
      <button @click="nextWord" v-if="currentWord != words.length - 1">Next -></button>
      <NuxtLink v-else @click="nextWord" :to="'../learn/' + (Number(curLevel) + 1)">Go -></NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import levels from "../../src/levels.json";
const route = useRoute();
const router = useRouter();

interface Word {
  image?: String;
  word: String;
  rom: String; //romanization
  def: String;
}

let curLevel = useState("curLevel", () => Number(route.params.level));
let data = useState("data", () => levels.levels[curLevel.value - 1]);
let gam = useState("gam", () => false);
let defin = useState("defin", () => false);
let mainInput = useState("mainInput", () => "");
let words = useState("words", () => data.value.words);
let currentWord = useState("currentWord", () => 0);
let nextPage = () => {
  //if (pages opofdals jflaj)
  gam.value = !gam.value;
};
let check = () => {
  if (mainInput.value == words.value[currentWord.value].rom)
    defin.value = !defin.value;
  mainInput.value = "";
};
let nextWord = () => {
  defin.value = !defin.value;
  if (++currentWord.value == words.value.length) {
    if (levels.levels.length > curLevel.value + 1) {
      gam.value = !gam.value;
      router.push('./' + ++curLevel.value);
    } else {
      router.push('./completed');
    }
  }
};
</script>
