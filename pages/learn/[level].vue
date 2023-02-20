<template>
  <div class="level">
    <div v-if="!showGaming" id="pages-outer" class="inner">
      <h1 id="lesson">
        {{ (curLevel > 2 ? "பாடம் " : "Lesson ") + curLevel }}: {{ data.title }}
      </h1>
      <br /><br /><br />
      <div id="pages">
        <p v-html="data.pages[curPage]"></p>
        <button @click="backPage">← Back</button>
        <button @click="nextPage">Next →</button>
      </div>
    </div>
    <div id="gaming" class="inner" v-else>
      <div id="sounds" v-if="!showGamingWords">
        <div v-if="currentSounds.length != 0">
          <h1>{{ currentSounds[0] }}</h1>
          <div class="buttons">
            <button
              v-for="es in gameCurrentEnglishSounds"
              :key="es"
              class="sound-btn"
              @click="() => checkSound(es)"
            >
              {{ es }}
            </button>
          </div>
        </div>
        <div v-else-if="wrongSounds.length != 0 && currentSounds.length == 0">
          <h1>Re: {{ wrongSounds[0] }}</h1>
          <div class="buttons">
            <button
              v-for="es in gameCurrentEnglishSounds"
              :key="es"
              class="sound-btn"
              @click="() => checkWrongSound(es)"
            >
              {{ es }}
            </button>
          </div>
        </div>
        <button @click="showGamingWords = !showGamingWords" v-else>
          Learn Words →
        </button>
      </div>
      <div id="words" v-else>
        <h1 id="to_type">
          {{ words[curWord].word }}
          <span v-if="showDef">: {{ words[curWord].def }} </span>
        </h1>
        <input
          type="text"
          @keypress.enter="() => (showDef ? nextWord() : check())"
          v-model="mainInput"
        />

        <button @click="() => (showDef ? nextWord() : check())">
          {{ showDef ? "Next" : "Check" }} →
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import levels from "./levels.json";
import chars from "./chars";
import { checkDef } from "./check";
const route = useRoute();
const router = useRouter();

interface Word {
  image?: String;
  sound?: String;
  word: String;
  def: String;
}
let curLevel = ref(Number(route.params.level));
let curWord = ref(0);
let curPage = ref(0);

let data = ref(levels[curLevel.value - 1]);

let showGaming = ref(false);
let showGamingWords = ref(false);

let showDef = ref(false);
let mainInput = ref("");
let words = ref(data.value.words);

let currentSounds = ref(<string[]>[]);
let wrongSounds = ref(<string[]>[]);
let currentEnglishSounds = ref(chars.map((x) => x.slice(1)).flat());
let gameCurrentEnglishSounds = ref(<string[]>[]);
let nextPage = () => {
  if (++curPage.value != data.value.pages.length)
    showGaming.value = showGaming.value;
  else {
    initSounds();
    showGaming.value = !showGaming.value;
  }
};

let initSounds = () => {
  let cur = levels.slice(0, curLevel.value);
  cur
    .map((x) => x.vowels)
    .flat()
    .map((x) => x[1])
    .forEach((i) =>
      cur
        .map((x) => x.consanants)
        .flat()
        .forEach((j) => currentSounds.value.push(j + i))
    );
  currentSounds.value.sort(() => 0.5 - Math.random());
  shuffleSounds(currentSounds.value);
};

let shuffleSounds = (arr: String[]) => {
  gameCurrentEnglishSounds.value = <string[]>[
    chars
      .find((d) => d[0] == arr[0])
      ?.slice(1)
      .sort(() => 0.5 - Math.random())[0],
  ]
    .concat(
      currentEnglishSounds.value.sort(() => 0.5 - Math.random()).slice(0, 3)
    )
    .sort(() => 0.5 - Math.random());
};

let backPage = () => {
  if (curPage.value > 0) curPage.value--;
};

let checkSound = (es: string) => {
  if (
    chars
      .find((d) => d[0] == currentSounds.value[0])
      ?.slice(1)
      ?.includes(es)
  ) {
    currentSounds.value.splice(0, 1);
  } else {
    wrongSounds.value.push(currentSounds.value[0]);
    currentSounds.value.splice(0, 1);
  }
  if (!currentSounds.value.length) shuffleSounds(wrongSounds.value);
  else shuffleSounds(currentSounds.value);
};
let checkWrongSound = (es: string) => {
  if (
    chars
      .find((d) => d[0] == wrongSounds.value[0])
      ?.slice(1)
      ?.includes(es)
  ) {
    wrongSounds.value.splice(0, 1);
  } else {
    wrongSounds.value.push(wrongSounds.value[0]);
    wrongSounds.value.splice(0, 1);
  }
  shuffleSounds(wrongSounds.value);
};

let check = () => {
  if (checkDef(mainInput.value, words.value[curWord.value].word))
    showDef.value = !showDef.value;
  else mainInput.value = "";
};
let nextWord = async () => {
  showDef.value = !showDef.value;
  mainInput.value = "";
  if (++curWord.value == words.value.length) {
    if (levels[curLevel.value]) {
      await navigateTo("./" + ++curLevel.value);
      router.go(0);
    } else await navigateTo("./completed");
  }
};
</script>
