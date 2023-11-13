<template>
  <div class="level">
    <div v-if="!showGaming" id="pages-outer" class="inner">
      <h1 id="lesson">
        {{ (curLevel > 2 ? "பாடம் " : "Lesson ") + curLevel }}: {{ data.title }}
      </h1>
      <br /><br /><br />
      <div id="pages">
        <div class="page" v-html="data.pages[curPage]"></div>
        <button @click="backPage">← Back</button>
        <button @click="nextPage">Next →</button>
      </div>

    </div>
    <div id="gaming" class="inner" v-else>
      <div id="sounds" v-if="!showGamingWords">
        <div v-if="currentSounds.length != 0">
          <h1>{{ currentSounds[0] }}</h1>
          <div class="buttons">
            <button v-for="es in gameCurrentEnglishSounds" :key="es" class="sound-btn" @click="() => checkSound(es)">
              {{ es }}
            </button>
          </div>
        </div>
        <div v-else-if="wrongSounds.length != 0 && currentSounds.length == 0">
          <h1>Re: {{ wrongSounds[0] }}</h1>
          <div class="buttons">
            <button v-for="es in gameCurrentEnglishSounds" :key="es" class="sound-btn" @click="() => checkWrongSound(es)">
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
        <div id="mostAccRom" v-if="showDef"> <b> {{ words[curWord].rom  }} </b> <button v-if="'sound' in words[curWord]" v-on:click="playSound">🔊</button></div>
        <input type="text" v-if="!showDef" @keypress.enter="() => (showDef ? nextWord() : check())" v-model="mainInput" />
        <div id="correction" v-html="correction"></div>
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
import initDraw from "./initDraw";
const route = useRoute();
const router = useRouter();

let curLevel = ref(Number(route.params.level));
let curWord = ref(0);
let curPage = ref(0);

let data = ref(levels[curLevel.value - 1]);

let showGaming = ref(false);
let showGamingWords = ref(false);

let showDef = ref(false);
let mainInput = ref("");
let correction = ref("");
let words = ref(data.value.words);

let currentSounds = ref(<string[]>[]);
let wrongSounds = ref(<string[]>[]);
let currentEnglishSounds = ref(chars.map((x) => x.slice(1)).flat());
let gameCurrentEnglishSounds = ref(<string[]>[]);
let nextPage = async () => {
  if (++curPage.value != data.value.pages.length) {
    showGaming.value = showGaming.value;
    await nextTick();
    initDraw(document.querySelector(".draw"));
  } else {
    initSounds();
    showGaming.value = !showGaming.value;
  }
}

let backPage = async () => {
  if (curPage.value > 0) curPage.value--;
  await nextTick();
  initDraw(document.querySelector(".draw"));
}



let initSounds = () => {
  let curData = levels.slice(curLevel.value - 1, curLevel.value)[0]; // level data
  let notcurDatas = levels.slice(0, curLevel.value - 1); //all before current level data
  let notcur = <string[]>[]; // have to limit other level sounds into current sounds
  let extraSounds = 5; //number of other level sounds 
  curData.vowels.map((x) => x[1]) //get the "additive vowel" character
    .forEach((i) => //add each vowel to each consonant and push that to current sounds
      curData.consanants.forEach((j) => currentSounds.value.push(j + i))
    );
  if (curLevel.value > 1) {
    notcurDatas
      .map((x) => x.vowels) //get vowels from every level
      .flat() //they are all inside objects so flatten
      .map((x) => x[1]) //get the "additive vowel" character
      .forEach((i) =>
        notcurDatas
          .map((x) => x.consanants)
          .flat()
          .forEach((j) => { notcur.push(j + i) })
      );
      notcur.sort(_ => 0.5 - Math.random());
  }
  currentSounds.value.push(...notcur.slice(0, extraSounds));
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
  let val = checkDef(mainInput.value, words.value[curWord.value].word);
  if (val.ret) {
    showDef.value = !showDef.value;
    correction.value = "";
    mainInput.value = "";
    playSound();
}
  else {
    correction.value = 
      mainInput.value.slice(0, val.curInp) + 
      `<span class='correction'>${val.curEnglish}</span>` + 
      mainInput.value.slice(val.curInp + val.curEnglish.length);
  }
}
let playSound = () => {
  if ('sound' in words.value[curWord.value])  {
      var snd = new Audio("/sounds/" + words.value[curWord.value].sound);
      snd.play();
    }
}
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
