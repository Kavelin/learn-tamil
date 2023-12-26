<template>
  <div class="level">
    <h1 id="cur">
      <span class="padam">{{ curLevel > 2 ? "பாடம்" : "Lesson" }}</span> {{ curLevel }}
    </h1>
    <h1 v-if="!showGaming" id="lesson">{{ data.title }}</h1>
    <div v-if="!showGaming" id="pages-outer" class="inner">
      <div id="pages">
        <div class="page" v-html="data.pages[curPage]"></div>
        <button @click="backPage">← Back</button>
        <button @click="nextPage">Next →</button>
      </div>
    </div>
    <div id="gaming" class="inner" v-else>
      <div id="sounds" v-if="!showGamingWords">
        <div v-if="currentSounds.length != 0">
          <h1 id="sound-header">{{ currentSounds[0] }}</h1>
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
      </div>
      <div id="words" v-else>
        <h1 id="to_type">
          {{ words[curWord].word }}<span v-if="showDef">: {{ words[curWord].def }} </span>
        </h1>
        <img :src="'/images/' + curLevel + '/' + words[curWord].image" v-if="words[curWord].image && showDef" width="300" />
        <div id="mostAccRom" v-if="showDef">
          <i> {{ words[curWord].rom }} </i> <button v-on:click="playWord(words[curWord])">🔊</button>
        </div>
        <input type="text" v-if="!showDef" v-model="mainInput" id="input" autocomplete="off" />
        <div id="correction" v-html="correction"></div>
        <button id="check-btn" @click="() => (showDef ? nextWord() : check())" class="">{{ showDef ? "Next" : "Check" }} →</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import levels from "./levels.json"; //["அ", ""],["ஆ", "ா"],["இ", "ி"],["ஈ", "ீ"],["உ", "ு"], ["ஊ", "ூ"],["எ", "ெ"], ["ஏ", "ே"],["ஐ", "ை"],["ஒ", "ொ"], ["ஓ", "ோ"], ["ஔ", "ெள"]
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

let soundDisable = ref(false); // if the game sound buttons should be disabled or not
let currentSounds = ref(<string[]>[]);
let wrongSounds = ref(<string[]>[]);
let currentEnglishSounds = ref(<string[]>[]); //only the first english sound
let gameCurrentEnglishSounds = ref(<string[]>[]); //current english sounds that are being played (4)

let nextPage = async () => {
  if (++curPage.value != data.value.pages.length) {
    showGaming.value = showGaming.value;
    await nextTick();
    initDraw(document.querySelector(".draw"), document.querySelector(".page")); //for every canvas element in the page
    initButtons(document.querySelectorAll("button[data-sound]")); //for all buttons that play a sound
  } else {
    //if the next page is clicked on the last page
    initSounds();
    showGaming.value = !showGaming.value;
  }
};
let backPage = async () => {
  if (curPage.value > 0) curPage.value--;
  await nextTick();
  initDraw(document.querySelector(".draw"), document.querySelector(".page"));
  initButtons(document.querySelectorAll("button[data-sound]"));
};

let initButtons = (btns: NodeListOf<HTMLButtonElement>) => {
  btns.forEach((i) => i.addEventListener("click", (e) => playAudio(i.dataset.sound!)));
};

function shuffleArray(a: Array<any>, len?: number) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (len) return a.slice(0, len);
  return a;
}

let initSounds = () => {
  currentEnglishSounds.value = chars.map((x) => x[1]).flat();
  let curData = levels.slice(curLevel.value - 1, curLevel.value)[0]; // current level data
  curData.vowels //uyirmey
    .map((x) => x[1]) //get the "additive vowel" character
    .forEach(
      (i) => curData.consanants.forEach((j) => currentSounds.value.push(j + i)) //add each vowel to each consonant and push that to current sounds
    );
  currentSounds.value.push( //push the non uyirmey
    ...curData.vowels.map((x) => x[0]), //uyir
    ...curData.consanants.map((x) => x + "்") //mey
  );
  currentSounds.value = shuffleArray(currentSounds.value, 5); //limit it to 5 sounds
  if (curLevel.value > 1) {
    let notcurDatas = levels.slice(0, curLevel.value - 1); //all level data before current level
    let notcur = <string[]>[]; // have to limit other level sounds into current sounds
    let extraSounds = 3; //number of other level sounds
    notcurDatas
      .flatMap((x) => x.vowels) //get vowels from every level, they are all inside objects so flatten
      .map((x) => x[1]) //get the "additive vowel" character
      .forEach((i) => notcurDatas.flatMap((x) => x.consanants).forEach((j) => notcur.push(j + i)));
    notcur.push(
      ...notcurDatas.flatMap((x) => x.vowels).map((x) => x[0]), //uyir
      ...notcurDatas.flatMap((x) => x.consanants).map((x) => x + "்") //mey
    );
    for (let i = 0; i <= extraSounds; i++) currentSounds.value.push(notcur[Math.floor(Math.random() * notcur.length)]);
    shuffleArray(currentSounds.value, 5); // shuffle new sounds in 
  }
  shuffleSounds(currentSounds.value); //run shuffle sounds for first time
};

let shuffleSounds = (arr: String[]) => {
  // the first element of arr is the current sound
  gameCurrentEnglishSounds.value = <string[]>[chars.find((d) => d[0] == arr[0])![1]]; // make array with the right sound

  while (gameCurrentEnglishSounds.value.length != 4) {
    //add sounds from any level
    let toPush = currentEnglishSounds.value[Math.floor(Math.random() * currentEnglishSounds.value.length)];
    //make sure there isn't a duplicate
    if (gameCurrentEnglishSounds.value.indexOf(toPush) == -1) gameCurrentEnglishSounds.value.push(toPush);
  }
  shuffleArray(gameCurrentEnglishSounds.value);
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
    playAudio("/sounds/correct.mp3");
    setTimeout( ()=>playSound(currentSounds.value[0]), 300);
  } else {
    wrongSounds.value.push(currentSounds.value[0]);
    (<HTMLButtonElement>e.target).classList.add("wrong");
    playAudio("/sounds/wrong.mp3");
  }
  setTimeout(() => {
    currentSounds.value.splice(0, 1);
    if (!currentSounds.value.length) {
      if (wrongSounds.value.length == 0) showGamingWords.value = !showGamingWords.value;
      else shuffleSounds(wrongSounds.value);
    } else shuffleSounds(currentSounds.value);
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
    playAudio("/sounds/correct.mp3");
    setTimeout( ()=>playSound(wrongSounds.value[0]), 300);
  } else {
    wrongSounds.value.push(wrongSounds.value[0]);
    (<HTMLButtonElement>e.target).classList.add("wrong");
    playAudio("/sounds/wrong.mp3");
  }
  setTimeout(() => {
    if (wrongSounds.value.length == 1) {
      wrongSounds.value = [];
      showGamingWords.value = !showGamingWords.value;
    } else {
      wrongSounds.value.splice(0, 1);
      shuffleSounds(wrongSounds.value);
      soundDisable.value = false;
    }
  }, 1600);
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
    playAudio("/sounds/correct.mp3");
    setTimeout( ()=>playWord(words.value[curWord.value]), 300);
  } else {
    correction.value = mainInput.value.slice(0, val.curInp) + `<span class='correction'>${val.curEnglish}</span>` + mainInput.value.slice(val.curInp + val.curEnglish.length);
    playAudio("/sounds/wrong.mp3");
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
  document.body.style.backgroundImage = "url(/images/background/" + ('000' + Math.floor(Math.random() * 250 + 1)).slice(-4) + ".png)";
  document.body.style.backgroundPosition = curLevel.value / 12 * 100 + "vw 100vh";
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
          //(<HTMLButtonElement>document.querySelector("#check-btn")).click();
          showDef.value ? nextWord() : check();
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
