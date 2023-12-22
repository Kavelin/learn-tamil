<template>
  <div class="level">
    <div v-if="!showGaming" id="pages-outer" class="inner">
      <h1 id="lesson">{{ (curLevel > 2 ? "பாடம் " : "Lesson ") + curLevel }}: {{ data.title }}</h1>
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
            <button v-for="es in gameCurrentEnglishSounds" :key="currentSounds[0] + es" :disabled="soundDisable" class="sound-btn" @click="checkSound($event, es)">
              {{ es }}
            </button>
          </div>
        </div>
        <div v-else-if="wrongSounds.length != 0 && currentSounds.length == 0">
          <h1>Re: {{ wrongSounds[0] }}</h1>
          <div class="buttons">
            <button v-for="es in gameCurrentEnglishSounds" :disabled="soundDisable" :key="wrongSounds[0] + es" class="sound-btn" @click="checkWrongSound($event, es)">
              {{ es }}
            </button>
          </div>
        </div>
        <button @click="showGamingWords = !showGamingWords" v-else>Learn Words →</button>
      </div>
      <div id="words" v-else>
        <h1 id="to_type">
          {{ words[curWord].word }}
          <span v-if="showDef">: {{ words[curWord].def }} </span>
        </h1>
        <div id="mostAccRom" v-if="showDef">
          <b> {{ words[curWord].rom }} </b> <button v-on:click="playWord(words[curWord])">🔊</button>
        </div>
        <input type="text" v-if="!showDef" v-model="mainInput" id="input" autocomplete="off" />
        <div id="correction" v-html="correction"></div>
        <button id="check-btn" @click="() => (showDef ? nextWord() : check())" class="">{{ showDef ? "Next" : "Check" }} →</button>
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
interface Word {
  word: string;
  def: string;
  rom: string;
  sound?: string;
  image?: string;
}

let curLevel = ref(Number(route.params.level));
let curWord = ref(0);
let curPage = ref(0);

let data = ref(levels[curLevel.value - 1]);

let showGaming = ref(false);
let showGamingWords = ref(false);

let showDef = ref(false);
let mainInput = ref("");
let correction = ref("");
let words = ref(<Word[]>data.value.words);

let soundDisable = ref(false);

let currentSounds = ref(<string[]>[]);
let wrongSounds = ref(<string[]>[]);
let currentEnglishSounds = ref(chars.map((x) => x.slice(1)).flat());
let gameCurrentEnglishSounds = ref(<string[]>[]);
let nextPage = async () => {
  if (++curPage.value != data.value.pages.length) {
    showGaming.value = showGaming.value;
    await nextTick();
    initDraw(document.querySelector(".draw"));
    initButtons(document.querySelectorAll("button[data-sound]"));
  } else {
    initSounds();
    showGaming.value = !showGaming.value;
  }
};

function shuffleArray(a: Array<any>) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let backPage = async () => {
  if (curPage.value > 0) curPage.value--;
  await nextTick();
  initDraw(document.querySelector(".draw"));
};

let initButtons = (btns: NodeListOf<HTMLButtonElement>) => {
  btns.forEach((i) => i.addEventListener("click", (e) => playAudio(i.dataset.sound!)));
};

let initSounds = () => {
  let curData = levels.slice(curLevel.value - 1, curLevel.value)[0]; // level data
  let notcurDatas = levels.slice(0, curLevel.value - 1); //all before current level data
  let notcur = <string[]>[]; // have to limit other level sounds into current sounds
  let extraSounds = 5; //number of other level sounds
  curData.vowels
    .map((x) => x[1]) //get the "additive vowel" character
    .forEach(
      (
        i //add each vowel to each consonant and push that to current sounds
      ) => curData.consanants.forEach((j) => currentSounds.value.push(j + i))
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
          .forEach((j) => {
            notcur.push(j + i);
          })
      );
    shuffleArray(notcur);
  }
  currentSounds.value.push(...notcur.slice(0, extraSounds));
  shuffleSounds(currentSounds.value);
};

let shuffleSounds = (arr: String[]) => {
  gameCurrentEnglishSounds.value = <string[]>shuffleArray(
    [
      //
      shuffleArray(chars.find((d) => d[0] == arr[0])?.slice(1)!)[0], //
    ].concat(shuffleArray(currentEnglishSounds.value).slice(0, 3))
  );
};
let checkSound = (e: Event, es: string) => {
  soundDisable.value = true;
  if (
    chars
      .find((d) => d[0] == currentSounds.value[0])
      ?.slice(1)
      ?.includes(es)
  ) {
    (<HTMLButtonElement>e.target).classList.add("correct");
    console.log(currentSounds.value[0]);
    playSound(currentSounds.value[0]);
  } else {
    wrongSounds.value.push(currentSounds.value[0]);
    (<HTMLButtonElement>e.target).classList.add("wrong");
  }
  setTimeout(() => {
    currentSounds.value.splice(0, 1);
    if (!currentSounds.value.length) shuffleSounds(wrongSounds.value);
    else shuffleSounds(currentSounds.value);
    soundDisable.value = false;
  }, 1000);
};
let checkWrongSound = (e: Event, es: string) => {
  soundDisable.value = true;
  if (
    chars
      .find((d) => d[0] == wrongSounds.value[0])
      ?.slice(1)
      ?.includes(es)
  ) {
    (<HTMLButtonElement>e.target).classList.add("correct");
    playSound(wrongSounds.value[0]);
  } else {
    wrongSounds.value.push(wrongSounds.value[0]);
    (<HTMLButtonElement>e.target).classList.add("wrong");
  }
  setTimeout(() => {
    wrongSounds.value.splice(0, 1);
    shuffleSounds(wrongSounds.value);
    soundDisable.value = false;
  }, 1000);
};
let playSound = (sound: string) => {
  if ([...sound].length > 1) {
    if (sound[1] == "்") playAudio("/sounds/muthal/" + "k,ng,ch,ny,d,danagaram,th,thanagaram,p,m,y,r,l1,v,l3,l2,Rstrong,ranagaram".split(",")[[..."கஙசஞடணதநபமயரலவழளறன"].indexOf(sound[0])] + ".mp3");
    else playAudio("/sounds/uyirmey/" + "k,ng,ch,ny,d,danagaram,th,thanagaram,p,m,y,r,l1,v,l3,l2,Rstrong,ranagaram".split(",")[[..."கஙசஞடணதநபமயரலவழளறன"].indexOf(sound[0])] + "/" + "aa,i,ee,u,oo,e,ae,ai,o,onedil,ow".split(",")[[..."ாிீுூெேைொோௌ"].indexOf(sound[1])] + ".mp3");
  } else {
    if ([..."அஆஇஈஉஊஎஏஐஒஓஔ"].indexOf(sound) > -1) playAudio("/sounds/muthal/" + "a,aa,i,ee,u,oo,e,ae,ai,o,onedil,ou".split(",")[[..."அஆஇஈஉஊஎஏஐஒஓஔ"].indexOf(sound)] + ".mp3");
    else playAudio("/sounds/uyirmey/" + "k,ng,ch,ny,d,danagaram,th,thanagaram,p,m,y,r,l1,v,l3,l2,Rstrong,ranagaram".split(",")[[..."கஙசஞடணதநபமயரலவழளறன"].indexOf(sound)] + "/a.mp3");
  }
};

let check = () => {
  let val = checkDef(mainInput.value, words.value[curWord.value].word);
  if (val.ret) {
    showDef.value = !showDef.value;
    correction.value = "";
    mainInput.value = "";
    playWord(words.value[curWord.value]);
  } else {
    correction.value = mainInput.value.slice(0, val.curInp) + `<span class='correction'>${val.curEnglish}</span>` + mainInput.value.slice(val.curInp + val.curEnglish.length);
  }
};

let playWord = (word: Word) => {
  playAudio("/sounds/words/" + curLevel.value + "/" + (word.sound ?? word.rom + ".mp3"));
};
let ctx: AudioContext;
let playAudio = async (path: string) => {
  let source: AudioBufferSourceNode;
  source = ctx.createBufferSource();
  const audioBuffer = await fetch(path)
    .then((res) => res.arrayBuffer())
    .then((ArrayBuffer) => ctx.decodeAudioData(ArrayBuffer));

  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
};
onMounted(() => {
  ctx = new AudioContext();
  ctx.resume();
  document.addEventListener("keyup", (e) => {
    if (showGaming.value) {
      if (showGamingWords.value) {
        if (document.activeElement != <HTMLInputElement>document.querySelector("#input") && e.key.length == 1) {
          (<HTMLInputElement>document.querySelector("#input")).focus();
          mainInput.value += e.key;
        }
        if (e.key == "Enter") {
          (<HTMLButtonElement>document.querySelector("#check-btn")).click();
        }
      }
      if (!showGamingWords.value && !isNaN(Number(e.key))) (<HTMLButtonElement>document.querySelectorAll(".sound-btn")[Number(e.key) - 1])?.click();
      if (wrongSounds.value.length != 0 && currentSounds.value.length == 0 && e.key == "Enter") showGamingWords.value = !showGamingWords.value;
    } else {
      if (e.key == "ArrowRight") nextPage();
      if (e.key == "ArrowLeft") backPage();
    }
  });
});

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
