<template>
  <div class="level">
    <div v-if="!gam">
      <h1>Lesson {{ curLevel }}: {{ data.title }}</h1>
      <div>
        <p v-html="data.pages[curPage]"></p>
        <button @click="nextPage">Next -></button>
      </div>
    </div>
    <div id="gaming" v-else>
      <div>
        <h1 id="to_type">
          {{ words[curWord].word }}
          <div v-if="defin">
            <h1>{{ words[curWord].def }}</h1>
          </div>
        </h1>
        <input
          type="text"
          @keypress.enter="() => (defin ? nextWord() : check())"
          v-model="mainInput"
        />

        <button
          @click="() => (defin ? nextWord() : check())"
          v-if="curWord != words.length - 1"
        >
          Next ->
        </button>

        <NuxtLink
          v-else-if="defin"
          @click="nextWord"
          :to="'../learn/' + (Number(curLevel) + 1)"
          >Go -></NuxtLink
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import levels from "../../src/levels.json";
const route = useRoute();
const router = useRouter();

interface Word {
  image?: String;
  sound?: String;
  word: String;
  rom?: String; //romanization
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
let check = () => {
  if (mainInput.value == words.value[curWord.value].rom)
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
    } else {
      await navigateTo("./completed");
    }
  }
};
</script>
