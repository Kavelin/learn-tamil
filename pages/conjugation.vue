<template>
  <div class="conj-trainer-wrapper">
    <div class="comic-card">
      <div class="conj-trainer">
        
        <!-- Controls Section -->
        <section class="controls" v-if="!running">
          <div class="comic-header">
            <h2>Verb Conjugation </h2>
            <p>Master your Tamil verb conjugation!</p>
          </div>

          <div class="select-group">
            <label for="set">Choose verb set:</label>
            <select id="set" v-model="selectedSet" class="comic-select">
              <option v-for="(s, key) in Object.keys(verbSets)" :key="key" :value="s">
                {{ s }}
              </option>
            </select>
          </div>

          <div class="action-buttons">
            <button class="comic-btn secondary" @click="usePredefined(selectedSet)">Load set 📦</button>
            <button class="comic-btn accent" @click="randomPick">Get random 10 🎲</button>
          </div>

          <div class="selected-list">
            <strong>Selected verbs ({{ chosen.length }}/10):</strong>
            <div v-if="chosen.length === 0" class="empty-notice">No verbs selected yet! Load a set or pick random ones.</div>
            <ul v-else class="comic-ul">
              <li v-for="v in chosen" :key="v.infinitive">
                <span class="tamil-word">{{ v.infinitive }}</span> — <span class="trans">{{ v.translation }}</span>
              </li>
            </ul>
          </div>

          <button class="comic-btn primary start-btn" @click="startQuiz" :disabled="chosen.length === 0">
            Start Quiz 🚀
          </button>
        </section>

        <!-- Quiz Trainer Section -->
        <section class="trainer" v-else>
          <div class="status-panel">
            <div class="status">
              <div><strong>Verb:</strong> <span class="tamil-word-lg">{{ current.infinitive }}</span></div>
              <small class="rom">({{ romanize(current.infinitive) }})</small> —
              <em class="trans-lg">{{ current.translation }}</em>
            </div>
            <div class="progress-badge">
              {{ index + 1 }} / {{ chosen.length }}
            </div>
          </div>

          <div class="options comic-callout">
            <div><strong>🎯 Tense:</strong> <span class="badge-pill">{{ tense }}</span></div>
            <div><strong>👤 Person:</strong> <span class="badge-pill">{{ persons[person] }}</span></div>
          </div>

          <form @submit.prevent="checkAnswer" class="quiz-form">
            <input
              id="input"
              v-model="answer"
              placeholder="Type conjugation here..."
              autocomplete="off"
            />
            <div class="form-actions">
              <button type="submit" class="comic-btn primary">Check ⚡</button>
              <button type="button" class="comic-btn secondary" @click="showAnswer">Show Answer 💡</button>
            </div>
          </form>

          <!-- Feedback Stamp Box -->
          <div class="feedback-box" v-if="feedback" :class="{ 'is-correct': feedback.includes('Correct'), 'is-wrong': feedback.includes('Incorrect') || feedback.includes('No answer') }">
            {{ feedback }}
          </div>

          <div class="controls-quiz">
            <button class="comic-btn" @click="prev" :disabled="index === 0">◀ Prev</button>
            <button class="comic-btn accent" @click="next">Next ▶</button>
            <button class="comic-btn danger" @click="stop">Quit 🛑</button>
          </div>

          <!-- Conjugation Reference Table (Kept hidden/toggleable as in your code) -->
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
    </div>
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
  const all = Object.values(verbSets).flat();
  const copy = [...all];
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
  generatePrompts();
  index.value = 0;
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

watch(index, (n) => {
  if (prompts.value[n]) {
    tense.value = prompts.value[n].tense;
    person.value = prompts.value[n].person;
  }
});

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
    out.push(one);
    i += 1;
  }
  return out.filter(Boolean).join("").replace(/\s+/g, " ");
}

function checkAnswer() {
  const correct = tableFor(current.value, tense.value)[person.value];
  if (!correct) {
    feedback.value = "No answer available for this tense/person.";
    return;
  }

  const userRaw = (answer.value || "").trim();

  if (asciiNormalize(userRaw) === asciiNormalize(correct)) {
    feedback.value = "Correct! ✅";
    return;
  }

  try {
    const r = checkDef(userRaw, correct);
    if (r.ret && r.curInp === userRaw.length) {
      feedback.value = "Correct! ✅";
      return;
    }
  } catch (e) {}

  const correctRom = romanize(correct);
  if (asciiNormalize(userRaw) === asciiNormalize(correctRom)) {
    feedback.value = "Correct! ✅";
    return;
  }

  feedback.value = `Incorrect — correct: ${correct} (${correctRom})`;
}

function showAnswer() {
  const correct = tableFor(current.value, tense.value)[person.value];
  feedback.value = correct ? `Answer: ${correct} (${romanize(correct)})` : "No answer available.";
}

usePredefined(selectedSet.value);
</script>

<style scoped>
.conj-trainer-wrapper {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--comic-bg, #fffdf5);
  background-image: radial-gradient(#d1cbb8 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  padding: 1rem;
  box-sizing: border-box;
}

/* Comic Panel Container */
.comic-card {
  width: 100%;
  max-width: 650px;
  background: var(--comic-card, #ffffff);
  border: 4px solid var(--comic-border, #2b2b2b);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 6px 6px 0px var(--comic-border, #2b2b2b);
}

.conj-trainer {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.comic-header h2 {
  font-weight: 900;
  font-size: 2rem;
  margin-bottom: 0.2rem;
  letter-spacing: -0.5px;
}

.comic-header p {
  font-family: 'Caveat', cursive;
  font-size: 1.3rem;
  font-weight: 700;
  color: #555;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.select-group {
  margin-bottom: 1rem;
  font-weight: 700;
}

.comic-select {
  border: 3px solid var(--comic-border, #2b2b2b);
  padding: 8px 12px;
  border-radius: 12px;
  font-family: "Noto Sans Tamil", sans-serif;
  font-weight: 700;
  background: #fff;
  margin-left: 8px;
  box-shadow: 2px 2px 0px var(--comic-border, #2b2b2b);
  outline: none;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

/* Chunky Comic Buttons */
.comic-btn {
  border: 3px solid var(--comic-border, #2b2b2b);
  border-radius: 14px;
  padding: 10px 16px;
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

.comic-btn.accent {
  background: var(--comic-pink, #ff6f91);
  color: #fff;
  text-shadow: 1px 1px 0px var(--comic-border, #2b2b2b);
}

.comic-btn.danger {
  background: var(--comic-red, #ff5959);
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

.selected-list {
  background: #fdfaf0;
  border: 3px dashed var(--comic-border, #2b2b2b);
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 1.5rem;
}

.comic-ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
  max-height: 150px;
  overflow-y: auto;
}

.comic-ul li {
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.tamil-word {
  font-weight: 900;
  color: var(--comic-text);
}

.tamil-word-lg {
  font-weight: 900;
  font-size: 1.4rem;
}

.trans {
  color: #555;
  font-style: italic;
}

.trans-lg {
  font-size: 1.2rem;
  color: #555;
}

.empty-notice {
  font-family: 'Caveat', cursive;
  font-size: 1.2rem;
  color: #777;
  margin-top: 4px;
}

.start-btn {
  width: 100%;
  font-size: 1.2rem;
  padding: 14px;
}

/* Quiz Section Layout */
.status-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 3px solid var(--comic-border);
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 1rem;
  box-shadow: 3px 3px 0px var(--comic-border);
}

.progress-badge {
  background: var(--comic-yellow);
  border: 2px solid var(--comic-border);
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 0.9rem;
}

.comic-callout {
  display: flex;
  gap: 16px;
  background: #eef7ff;
  border: 3px solid var(--comic-border);
  padding: 12px 16px;
  border-radius: 14px;
  margin-bottom: 1rem;
  box-shadow: 3px 3px 0px var(--comic-border);
}

.badge-pill {
  background: #fff;
  border: 2px solid var(--comic-border);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
}

.quiz-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
}

#input {
  font-size: 1.5rem;
  font-family: "Noto Sans Tamil", sans-serif;
  font-weight: 700;
  padding: 12px 16px;
  border: 3px solid var(--comic-border);
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 3px 3px 0px rgba(0,0,0,0.06);
  outline: none;
}

#input:focus {
  border-color: var(--comic-blue);
  box-shadow: inset 3px 3px 0px rgba(77, 157, 224, 0.15), 3px 3px 0px var(--comic-border);
}

.form-actions {
  display: flex;
  gap: 8px;
}

.form-actions button {
  flex: 1;
}

/* Comic Feedback Box */
.feedback-box {
  padding: 12px 16px;
  border: 3px solid var(--comic-border);
  border-radius: 14px;
  font-weight: 900;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  box-shadow: 3px 3px 0px var(--comic-border);
  background: #fff;
  text-align: center;
}

.feedback-box.is-correct {
  background: var(--comic-green, #37c788);
  color: #fff;
}

.feedback-box.is-wrong {
  background: var(--comic-red, #ff5959);
  color: #fff;
}

.controls-quiz {
  display: flex;
  gap: 8px;
}

.controls-quiz button {
  flex: 1;
}

/* Reference Table styles */
.conjugation-table {
  margin-top: 1rem;
  background: #fff;
  border: 3px solid var(--comic-border);
  padding: 12px;
  border-radius: 14px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 2px solid var(--comic-border);
  padding: 8px;
}

th {
  background: var(--comic-yellow);
}
</style>