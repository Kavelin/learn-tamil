<template>
  <div class="conj-trainer">
    <section class="controls" v-if="!running">
      <label for="set">Choose verb set:</label>
      <select id="set" v-model="selectedSet">
        <option v-for="(s, key) in Object.keys(verbSets)" :key="key" :value="s">
          {{ s }}
        </option>
      </select>

      <button @click="usePredefined(selectedSet)">Load set</button>
      <button @click="randomPick">Get random 10</button>

      <div class="selected-list">
        <strong>Selected verbs ({{ chosen.length }}/10):</strong>
        <div v-if="chosen.length === 0">No verbs selected.</div>
        <ul>
          <li v-for="v in chosen" :key="v.infinitive">
            {{ v.infinitive }} — {{ v.translation }}
          </li>
        </ul>
      </div>

      <button @click="startQuiz" :disabled="chosen.length === 0">
        Start Quiz
      </button>
    </section>
    <section class="trainer" v-else>
      <div class="status">
        <strong>Verb:</strong> {{ current.infinitive }}
        <small class="rom">{{ romanize(current.infinitive) }}</small> —
        <em>{{ current.translation }}</em>
        <span class="progress">({{ index + 1 }} / {{ chosen.length }})</span>
      </div>

      <div class="options">
        <!-- Randomized prompt: tense and person are chosen automatically per-verb -->
        <div><strong>Tense:</strong> {{ tense }}</div>
        <div><strong>Person:</strong> {{ persons[person] }}</div>
      </div>

      <form @submit.prevent="checkAnswer">
        <input
          v-model="answer"
          placeholder="Type conjugation here"
          autocomplete="off"
        />
        <button type="submit">Check</button>
        <button type="button" @click="showAnswer">Show answer</button>
      </form>

      <div class="feedback" v-if="feedback">{{ feedback }}</div>

      <div class="controls-quiz">
        <button @click="prev" :disabled="index === 0">Prev</button>
        <button @click="next">Next</button>
        <button @click="stop">Stop</button>
      </div>

      <div class="conjugation-table" style="display: none">
        <h3>Conjugation Table ({{ tense }})</h3>
        <table>
          <thead>
            <tr>
              <th>Person</th>
              <th>Conjugation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in persons" :key="i">
              <td>{{ p }}</td>
              <td>
                <div class="tamil">
                  {{ tableFor(current, tense)[i] || "—" }}
                </div>
                <div class="rom small">
                  {{ romanize(tableFor(current, tense)[i] || "") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import chars from "./basics/chars";
import { checkDef } from "./basics/check";

type Verb = {
  infinitive: string;
  translation?: string;
  irregular?: boolean;
  conjugations: Record<string, string[]>;
};

import verbData from "./verbs.json";
const verbSets: Record<string, Verb[]> = verbData as unknown as Record<
  string,
  Verb[]
>;

const selectedSet = ref(Object.keys(verbSets)[0]);
const chosen = ref<Verb[]>([]);

const tenses = ["Present", "Preterite", "Future"];
const persons = ["I", "You (sing.)", "He/She", "We", "You (pl.)", "They"];

// For each chosen verb we create a random prompt {tense, person} so the quiz
// presents a randomized challenge. Keeping prompts per-verb lets users
// navigate back and forth without changing the prompt for an item.
const prompts = ref<{ tense: string; person: number }[]>([]);

function generatePrompts() {
  prompts.value = chosen.value.map(() => ({
    tense: tenses[Math.floor(Math.random() * tenses.length)],
    person: Math.floor(Math.random() * persons.length),
  }));
}

const running = ref(false);
const index = ref(0);
const tense = ref(tenses[0]);
const person = ref(0);
const answer = ref("");
const feedback = ref("");

function usePredefined(setName: string) {
  const list = verbSets[setName] || [];
  chosen.value = list.slice(0, 10);
}

function randomPick() {
  // pick 10 random verbs
  const all = Object.values(verbSets).flat();
  const copy = [...all];
  // shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  chosen.value = copy.slice(0, 10);
}

const current = computed(
  () =>
    chosen.value[index.value] ||
    ({ infinitive: "", translation: "", conjugations: {} } as Verb)
);

function tableFor(v: Verb, t: string) {
  return v.conjugations && v.conjugations[t] ? v.conjugations[t] : [];
}

function startQuiz() {
  // generate a stable random prompt (tense+person) for each chosen verb
  generatePrompts();
  index.value = 0;
  // set the current prompt from the generated list
  tense.value = prompts.value[0]?.tense ?? tenses[0];
  person.value = prompts.value[0]?.person ?? 0;
  running.value = true;
  feedback.value = "";
  answer.value = "";
}

function stop() {
  running.value = false;
}

function next() {
  if (index.value < chosen.value.length - 1) index.value++;
  answer.value = "";
  feedback.value = "";
}

function prev() {
  if (index.value > 0) index.value--;
  answer.value = "";
  feedback.value = "";
}

// When the current index changes, update the displayed tense/person from prompts
watch(index, (n) => {
  if (prompts.value[n]) {
    tense.value = prompts.value[n].tense;
    person.value = prompts.value[n].person;
  }
});

function normalize(s: string) {
  return (s || "").trim().toLowerCase();
}

function asciiNormalize(s: string) {
  return (s || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function romanize(s: string) {
  if (!s) return "";
  let out: string[] = [];
  let i = 0;
  while (i < s.length) {
    // try 2-char match (consonant + vowel marker)
    const two = s.slice(i, i + 2);
    const one = s.slice(i, i + 1);
    let found: any = chars.find((d: any) => d[0] === two);
    if (found) {
      out.push(found[1] || "");
      i += 2;
      continue;
    }
    found = chars.find((d: any) => d[0] === one);
    if (found) {
      out.push(found[1] || "");
      i += 1;
      continue;
    }
    // fallback: push the character itself
    out.push(one);
    i += 1;
  }
  // join parts and normalize spacing
  return out.filter(Boolean).join("").replace(/\s+/g, " ");
}

function checkAnswer() {
  const correct = tableFor(current.value, tense.value)[person.value];
  if (!correct) {
    feedback.value = "No answer available for this tense/person.";
    return;
  }

  const userRaw = (answer.value || "").trim();

  // 1) If the user typed the exact Tamil string (ignoring unicode diacritics/spaces), accept immediately.
  if (asciiNormalize(userRaw) === asciiNormalize(correct)) {
    feedback.value = "Correct!";
    return;
  }

  // 2) Try tolerant romanization matching using the same algorithm as `pages/basics/check.ts`.
  //    `checkDef` will attempt to match the user's roman input sequentially against
  //    the set of allowed roman variants for each Tamil character (from `chars`).
  try {
    const r = checkDef(userRaw, correct);
    // `r.ret` true indicates the matching algorithm succeeded for the sequence;
    // ensure the user's input was fully consumed (no trailing chars left)
    if (r.ret && r.curInp === userRaw.length) {
      feedback.value = "Correct ✅";
      return;
    }
  } catch (e) {
    // If checkDef throws for unexpected input, ignore and fall back to romanize compare.
    // (This is defensive; checkDef is stable but may throw if given unexpected types.)
  }

  // 3) Fallback: accept if the ascii-normalized romanization equals the user's ascii-normalized input.
  const correctRom = romanize(correct);
  if (asciiNormalize(userRaw) === asciiNormalize(correctRom)) {
    feedback.value = "Correct!";
    return;
  }

  // If nothing matched, show the correct form and its romanization to help the learner.
  feedback.value = `Incorrect — correct: ${correct} (${correctRom})`;
}

function showAnswer() {
  const correct = tableFor(current.value, tense.value)[person.value];
  feedback.value = correct ? `Answer: ${correct}` : "No answer available.";
}

usePredefined(selectedSet.value);
</script>

<style scoped>
.conj-trainer {
  width:100vw;
  height:100vh;
  margin: auto;
  font-family: system-ui, sans-serif;
  display:flex;
}

.conj-trainer section {
    width: 80%;
    height: 80%;
}
.controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.selected-list {
  flex-basis: 100%;
  margin-top: 8px;
}
.trainer {
  margin-top: 16px;
}
.status {
  margin-bottom: 8px;
}
.options {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.conjugation-table {
  margin-top: 12px;
}
table {
  border-collapse: collapse;
  width: 100%;
}
td,
th {
  border: 1px solid #ddd;
  padding: 6px;
}
.feedback {
  margin-top: 8px;
}
.progress {
  margin-left: 8px;
  color: #666;
}
.rom {
  color: #444;
  margin-left: 8px;
  font-style: italic;
}
.small {
  font-size: 0.9em;
  color: #666;
}
.tamil {
  font-weight: 600;
}
</style>
