<template>
  <div class="level-wrapper">
    <!-- Comic Header / Lesson Counter -->
    <h1 id="cur" class="comic-badge">
      <span class="padam">{{ curLevel > 2 ? "பாடம்" : "Lesson" }}</span> {{ curLevel }}
    </h1>

    <h1 v-if="!showGaming" id="lesson" class="comic-title">{{ data.title }}</h1>

    <!-- Page / Lesson Reader Panel -->
    <div v-if="!showGaming" id="pages-outer" class="inner comic-card">
      <div id="pages">
        <div class="page" v-html="data.pages[curPage]"></div>
        <div class="page-nav-buttons">
          <button class="comic-btn secondary" @click="backPage">&LongLeftArrow;</button>
          <button class="comic-btn primary" @click="nextPage">&LongRightArrow;</button>
        </div>
      </div>
    </div>

    <!-- Mini-Game / Quiz Panel -->
    <div id="gaming" class="inner comic-card" v-else>
      <div id="sounds" v-if="!showGamingWords">
        
        <!-- Sound Game Section -->
        <div v-if="currentSounds.length != 0" class="game-box">
          <h1 id="sound-header" class="sound-bubble">{{ currentSounds[0] }}</h1>
          <p class="comic-subtitle">Tap the matching sound! ⚡</p>
          <div class="buttons">
            <button 
              v-for="(es, idx) in gameCurrentEnglishSounds" 
              :key="currentSounds[0] + es" 
              :disabled="soundDisable" 
              class="comic-btn sound-btn" 
              @click="checkSound($event, es)"
            >
              <span class="key-hint">[{{ idx + 1 }}]</span> {{ es }}
            </button>
          </div>
        </div>

        <div v-else-if="wrongSounds.length != 0 && currentSounds.length == 0" class="game-box">
          <h1 class="retry-title">🔄 Try Again: <span class="highlight-wrong">{{ wrongSounds[0] }}</span></h1>
          <div class="buttons">
            <button 
              v-for="(es, idx) in gameCurrentEnglishSounds" 
              :disabled="soundDisable" 
              :key="wrongSounds[0] + es" 
              class="comic-btn sound-btn" 
              @click="checkSound($event, es)"
            >
              <span class="key-hint">[{{ idx + 1 }}]</span> {{ es }}
            </button>
          </div>
        </div>

      </div>

      <!-- Word Typing Game Section -->
      <div id="words" v-else class="game-box">
        <h1 id="to_type">
          {{ words[curWord].word }}
          <span v-if="showDef" class="def-text">: {{ words[curWord].def }} </span>
        </h1>
        
        <div class="image-container" v-if="words[curWord].image && showDef">
          <img :src="'/images/' + curLevel + '/' + words[curWord].image" width="240" class="comic-img" />
        </div>

        <div id="mostAccRom" v-if="showDef" class="rom-box">
          <span class="rom-text"><i> {{ words[curWord].rom }} </i></span> 
          <button class="comic-btn audio-btn" @click="playWord(words[curWord])">🔊 Play</button>
        </div>

        <input 
          type="text" 
          v-if="!showDef" 
          v-model="mainInput" 
          id="input" 
          placeholder="Type romanized spelling..."
          autocomplete="off" 
        />
        
        <div id="correction" class="correction-box" v-html="correction"></div>
        
        <button id="check-btn" @click="() => (showDef ? nextWord() : check())" class="comic-btn primary full-width">
          {{ showDef ? "Next Word 🚀" : "Check Answer ⚡" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
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
let currentEnglishSounds = ref(<string[]>[]);
let gameCurrentEnglishSounds = ref(<string[]>[]);

let nextPage = async () => {
  if (++curPage.value != data.value.pages.length) {
    showGaming.value = showGaming.value;
    await nextTick();
    initDraw(document.querySelector(".draw"), document.querySelector(".page"));
    initButtons(document.querySelectorAll("button[data-sound]"));
  } else {
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
  btns.forEach((i) => i.addEventListener("click", () => playAudio(i.dataset.sound!)));
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
  let curData = levels.slice(curLevel.value - 1, curLevel.value)[0];
  (curData.vowels ?? [])
    .map((x) => x[1])
    .forEach((i) =>
      (curData.consanants ?? []).forEach((j) => {
        if (!(j == "ங" || (j == "ஞ" && (i != "ா" && i != "")))) currentSounds.value.push(j + i);
      })
    );
  currentSounds.value.push(
    ...(curData.vowels ?? []).map((x) => x[0]),
    ...(curData.consanants ?? []).map((x) => x + "்")
  );
  currentEnglishSounds.value.push(...chars.filter(x => currentSounds.value.includes(x[0])).map(x => x[1]));
  currentSounds.value = shuffleArray(currentSounds.value, 5);
  if (curLevel.value > 1) {
    let notcurDatas = levels.slice(0, curLevel.value - 1);
    let notcur = <string[]>[];
    let extraSounds = 3;
    notcurDatas
      .flatMap((x) => x.vowels ?? [])
      .map((x) => x[1])
      .forEach((i) =>
        notcurDatas
          .flatMap((x) => x.consanants ?? [])
          .forEach((j) => {
            if (!(j == "ங" || (j == "ஞ" && (i != "ா" && i != "")))) notcur.push(j + i);
          })
      );
    notcur.push(
      ...notcurDatas.flatMap((x) => x.vowels ?? []).map((x) => x[0]),
      ...notcurDatas.flatMap((x) => x.consanants ?? []).map((x) => x + "்")
    );
    currentEnglishSounds.value.push(...chars.filter(x => notcur.includes(x[0])).map(x => x[1]));
    for (let i = 0; i < extraSounds; i++) currentSounds.value.push(notcur[Math.floor(Math.random() * notcur.length)]);
    shuffleArray(currentSounds.value);
  }
  shuffleSounds(currentSounds.value);
};

let shuffleSounds = (arr: String[]) => {
  gameCurrentEnglishSounds.value = <string[]>[chars.find((d) => d[0] == arr[0])![1]];
  while (gameCurrentEnglishSounds.value.length != 4) {
    let toPush = currentEnglishSounds.value[Math.floor(Math.random() * currentEnglishSounds.value.length)];
    if (gameCurrentEnglishSounds.value.indexOf(toPush) == -1) gameCurrentEnglishSounds.value.push(toPush);
  }
  shuffleArray(gameCurrentEnglishSounds.value);
};

let checkSound = (e: Event, es: string) => {
  soundDisable.value = true;
  const targetBtn = e.currentTarget as HTMLButtonElement;
  
  if (chars.find((d) => d[0] == (currentSounds.value.length != 0 ? currentSounds.value : wrongSounds.value)[0])![1] == es) {
    targetBtn.classList.add("correct");
    playAudio("/sounds/correct.mp3");
    setTimeout(() => playSound((currentSounds.value.length != 0 ? currentSounds.value : wrongSounds.value)[0]), 300);
  } else {
    wrongSounds.value.push(currentSounds.value[0]);
    targetBtn.classList.add("wrong");
    playAudio("/sounds/wrong.mp3");
  }
  
  if (currentSounds.value.length != 0)
    setTimeout(() => {
      currentSounds.value.splice(0, 1);
      if (currentSounds.value.length == 0) {
        if (wrongSounds.value.length == 0) showGamingWords.value = !showGamingWords.value;
        else shuffleSounds(wrongSounds.value);
      } else shuffleSounds(currentSounds.value);
      soundDisable.value = false;
    }, 1000);
  else
    setTimeout(() => {
      if (wrongSounds.value.length == 1) {
        wrongSounds.value = [];
        showGamingWords.value = !showGamingWords.value;
      } else {
        wrongSounds.value.splice(0, 1);
        shuffleSounds(wrongSounds.value);
        soundDisable.value = false;
      }
    }, 1000);
};

let playSound = (sound: string) => {
  if ([...sound].length > 1) {
    if (sound[1] == "்") playAudio("/sounds/muthal/" + "k,ng,ch,nj,d,danagaram,th,thanagaram,p,m,y,r,l1,v,l3,l2,Rstrong,ranagaram".split(",")[[..."கஙசஞடணதநபமயரலவழளறன"].indexOf(sound[0])] + ".mp3");
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
    setTimeout(() => playWord(words.value[curWord.value]), 300);
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
  if (!ctx) ctx = new AudioContext();
  ctx.resume();
  let source: AudioBufferSourceNode = ctx.createBufferSource();
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
        if (document.activeElement != document.querySelector("#input") && e.key.length == 1) {
          const inputEl = document.querySelector("#input") as HTMLInputElement;
          if (inputEl) {
            inputEl.focus();
            mainInput.value += e.key;
          }
        }
        if (e.key == "Enter") showDef.value ? nextWord() : check();
      }
      if (!showGamingWords.value && !isNaN(Number(e.key))) {
        const btn = document.querySelectorAll(".sound-btn")[Number(e.key) - 1] as HTMLButtonElement;
        btn?.click();
      }
      if (wrongSounds.value.length != 0 && currentSounds.value.length == 0 && e.key == "Enter") showGamingWords.value = !showGamingWords.value;
    } else {
      if (e.key == "ArrowRight") nextPage();
      if (e.key == "ArrowLeft") backPage();
    }
  });
  window.addEventListener("resize", () => {
    initDraw(document.querySelector(".draw"), document.querySelector(".page"));
  });
});

let nextWord = async () => {
  showDef.value = !showDef.value;
  mainInput.value = "";
  if (++curWord.value == words.value.length) {
    if (levels[curLevel.value]) {
      await navigateTo("./" + ++curLevel.value);
      router.go(0);
    } else await navigateTo("./end");
  }
};
</script>

<style scoped>
.level-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--comic-bg, #fffdf5);
  background-image: radial-gradient(#d1cbb8 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* Comic Level Badge */
#cur {
  position: absolute;
  right: 1.5em;
  font-family: 'Caveat', cursive;
  font-weight: 700;
  font-size: 2em;
  background: var(--comic-pink, #ff6f91);
  border: 3px solid var(--comic-border, #2b2b2b);
  padding: 4px 14px;
  border-radius: 12px;
  box-shadow: 3px 3px 0px var(--comic-border, #2b2b2b);
  z-index: 10;
  margin: 0;
}

#lesson {
  font-weight: 900;
  position: absolute;
  top: 1.2em;
  left: 1.5em;
  max-width: 60vw;
  font-size: 1.8rem;
  color: var(--comic-text, #1a1a1a);
  text-shadow: 2px 2px 0px var(--comic-yellow, #ffe600);
  margin: 0;
}

/* Comic Panel Containers */
.inner {
  padding: 2em;
  position: relative;
  width: 70vw;
  max-width: 650px;
  display: flex;
  background: var(--comic-card, #ffffff);
  border: 4px solid var(--comic-border, #2b2b2b);
  border-radius: 24px;
  box-shadow: 6px 6px 0px var(--comic-border, #2b2b2b);
  box-sizing: border-box;
}

#pages-outer {
  flex-direction: column;
  margin-top: 5vh;
}

#pages {
  font-size: 1.1rem;
  overflow-y: auto;
  min-height: 35vh;
  max-height: 55vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.page-nav-buttons {
  display: flex;
  gap: 12px;
  margin-top: 1.5rem;
}

.page-nav-buttons button {
  flex: 1;
}

/* Gaming Section */
#gaming {
  justify-content: center;
  background: var(--comic-card, #ffffff);
  text-align: center;
}

.game-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sound-bubble {
  font-size: 5rem;
  font-weight: 900;
  background: var(--comic-yellow, #ffe600);
  border: 4px solid var(--comic-border, #2b2b2b);
  border-radius: 20px;
  padding: 10px 30px;
  display: inline-block;
  box-shadow: 4px 4px 0px var(--comic-border, #2b2b2b);
  margin-bottom: 0.5rem;
}

.comic-subtitle {
  font-family: 'Caveat', cursive;
  font-size: 1.4rem;
  font-weight: 700;
  color: #555;
  margin-bottom: 1.5rem;
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.sound-btn {
  height: 64px;
  width: 64px;
  aspect-ratio: 1;
  font-size: 1.5rem;
  font-weight: 900;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.key-hint {
  font-size: 0.6rem;
  position: absolute;
  top: 4px;
  left: 6px;
  opacity: 0.6;
}

/* Word Game UI */
#to_type {
  font-size: 2.5rem;
  font-weight: 900;
  background: var(--comic-yellow, #ffe600);
  padding: 8px 18px;
  border: 3px solid var(--comic-border, #2b2b2b);
  border-radius: 14px;
  display: inline-block;
  box-shadow: 4px 4px 0px var(--comic-border, #2b2b2b);
  margin-bottom: 1rem;
}

.def-text {
  font-size: 1.8rem;
}

.image-container {
  margin: 12px 0;
  border: 3px solid var(--comic-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 3px 3px 0px var(--comic-border);
}

.comic-img {
  display: block;
}

.rom-box {
  margin: 12px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.rom-text {
  font-size: 1.5rem;
  font-weight: 700;
}

.audio-btn {
  padding: 6px 12px;
  font-size: 1rem;
}

#input {
  font-size: 1.8rem;
  font-family: "Noto Sans Tamil", sans-serif;
  font-weight: 700;
  padding: 10px 16px;
  border: 3px solid var(--comic-border, #2b2b2b);
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 3px 3px 0px rgba(0,0,0,0.06);
  width: 100%;
  max-width: 400px;
  outline: none;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

#input:focus {
  border-color: var(--comic-blue, #4d9de0);
  box-shadow: inset 3px 3px 0px rgba(77, 157, 224, 0.15), 3px 3px 0px var(--comic-border);
}

.correction-box {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  min-height: 1.5rem;
}

.correction {
  color: var(--comic-red, #ff5959);
  text-decoration: underline wavy var(--comic-red);
  white-space: pre;
  font-weight: 900;
}

.retry-title {
  font-size: 2rem;
  font-weight: 900;
  margin-bottom: 1rem;
}

.highlight-wrong {
  color: var(--comic-red, #ff5959);
}

.full-width {
  width: 100%;
  max-width: 400px;
  font-size: 1.2rem;
  padding: 12px;
}

/* Chunky Comic Buttons */
.comic-btn {
  border: 3px solid var(--comic-border, #2b2b2b);
  border-radius: 14px;
  padding: 10px 18px;
  font-family: "Noto Sans Tamil", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: var(--comic-yellow, #ffe600);
  color: var(--comic-text, #1a1a1a);
  box-shadow: 3px 3px 0px var(--comic-border, #2b2b2b);
  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
  outline: none;
}

.comic-btn.primary {
  background: var(--comic-yellow, #ffe600);
}

.comic-btn.secondary {
  background: var(--comic-blue, #4d9de0);
  color: #fff;
  text-shadow: 1px 1px 0px var(--comic-border, #2b2b2b);
}

.comic-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0px var(--comic-border, #2b2b2b);
}

.comic-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px var(--comic-border, #2b2b2b);
}

.comic-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Correct / Wrong Game Stamps */
.correct {
  background: var(--comic-green, #37c788) !important;
  color: #fff !important;
  border-color: var(--comic-border) !important;
  animation: bounce-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.wrong {
  background: var(--comic-red, #ff5959) !important;
  color: #fff !important;
  border-color: var(--comic-border) !important;
  animation: shake 0.3s ease-in-out;
}

@keyframes bounce-pop {
  0% { transform: scale(0.9); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px) rotate(-2deg); }
  75% { transform: translateX(6px) rotate(2deg); }
}

@media (max-width: 576px) {
  .inner {
    width: 90vw;
    padding: 1.2rem;
  }
  #lesson {
    font-size: 1.3rem;
  }
  .sound-bubble {
    font-size: 3.5rem;
  }
}
</style>