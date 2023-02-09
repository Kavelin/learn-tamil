<template>
  <div class="level">
    <div v-if="!gam" id="pages-outer" class="inner">
      <h1 id="lesson"> {{ (curLevel > 2 ? 'பாடம் ' : 'Lesson ') + curLevel }}: {{ data.title }}</h1>
      <br /><br /><br />
      <div id="pages">
        <p v-html="data.pages[curPage]"></p>
        <button @click="backPage">&lt;- Back</button>
        <button @click="nextPage">Next -></button>
      </div>
    </div>
    <div id="gaming" class="inner" v-else>
      <div>
        <h1 id="to_type">
          {{ words[curWord].word }}
          <span v-if="defin">: {{ words[curWord].def }}</span>
        </h1>
        <input
          type="text"
          @keypress.enter="() => (defin ? nextWord() : check())"
          v-model="mainInput"
        />

        <button @click="() => (defin ? nextWord() : check())">{{ defin?'Next':'Check'}} -></button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import levels from "../../src/levels.json";
import { checkDef } from "./check";
const route = useRoute();
const router = useRouter();

interface Word {
  image?: String;
  sound?: String;
  word: String;
  def: String;
}

let curLevel = useState("curLevel", () => Number(route.params.level));
let curWord = useState("curWord", () => 0);
let curPage = useState("curPage", () => 0);
let data = useState("data", () => levels.levels[curLevel.value - 1]);
let gam = useState("gam", () => false);
let defin = useState("defin", () => false);
let mainInput = useState("mainInput", () => "");
let words = useState("words", () => data.value.words);
const refreshing = ref(false);
let nextPage = () => {
  if (++curPage.value != data.value.pages.length) gam.value = gam.value;
  else gam.value = !gam.value;
};
let backPage = () => {
  if (curPage.value > 0) curPage.value--;
}
let check = () => {
  if (checkDef(mainInput.value, words.value[curWord.value].word))
    defin.value = !defin.value;
  else mainInput.value = "";
};
let nextWord = async () => {
  defin.value = !defin.value;
  mainInput.value = "";
  if (++curWord.value == words.value.length) {
    if (levels.levels[curLevel.value]) {
      await navigateTo("./" + ++curLevel.value);
      router.go(0);
    } else await navigateTo("./completed");
  }
};
</script>
