<template>
  <div id="wrapper">
    <div class="comic-card">
      <span id="title"> Learn Tamil! </span>
      <p class="subtitle">தமிழ் கற்கலாம், வாங்க!</p>
      
      <div class="links-container">
        <NuxtLink :to="'/basics/' + learnLevel" class="comic-btn primary">
          <span class="btn-text">Basics</span> 
          <br> 
          <i>learn the tamil alphabet!</i>
        </NuxtLink>
        
        <NuxtLink to="/conjugation" class="comic-btn secondary">
          <span class="btn-text">Conjugation</span> 
          <br> 
          <i>learn conjugation of verbs!</i>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
let learnLevel: number = 1;
</script>

<style scoped>
#wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Comic dot-halftone background texture fallback */
  background-color: var(--comic-bg, #fffdf5);
  background-image: radial-gradient(#d1cbb8 1.5px, transparent 1.5px);
  background-size: 24px 24px;
}

/* Comic Panel Wrapper */
.comic-card {
  margin: auto;
  width: 90%;
  max-width: 450px;
  background: var(--comic-card, #ffffff);
  border: 4px solid var(--comic-border, #2b2b2b);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 6px 6px 0px var(--comic-border, #2b2b2b);
  position: relative;
  text-align: center;
}

/* Playful Comic Title */
#title {
  font-weight: 900;
  font-size: 2.5em;
  color: var(--comic-text, #1a1a1a);
  text-shadow: 3px 3px 0px var(--comic-yellow, #ffe600);
  display: block;
  letter-spacing: -1px;
}

.subtitle {
  font-family: 'Caveat', cursive, sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  margin-top: 4px;
  margin-bottom: 24px;
  color: #555;
}

.links-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Chunky Comic Links */
.comic-btn {
  border: 3px solid var(--comic-border, #2b2b2b);
  border-radius: 16px;
  color: var(--comic-text, #1a1a1a);
  text-decoration: none;
  padding: 14px 18px;
  font-family: "Noto Sans Tamil", sans-serif;
  box-shadow: 3px 3px 0px var(--comic-border, #2b2b2b);
  transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
  display: block;
  text-align: left;
}

.comic-btn.primary {
  background: var(--comic-yellow, #ffe600);
}

.comic-btn.secondary {
  background: var(--comic-pink, #ff6f91);
  color: #fff;
  text-shadow: 1px 1px 0px var(--comic-border, #2b2b2b);
}

.comic-btn:hover {
  transform: translate(-3px, -3px);
  box-shadow: 6px 6px 0px var(--comic-border, #2b2b2b);
}

.comic-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px var(--comic-border, #2b2b2b);
}

.btn-text {
  font-size: 1.2rem;
  font-weight: 900;
}

.comic-btn i {
  font-size: 85%;
  font-style: normal;
  opacity: 0.9;
}

.disabled {
  color: rgb(126, 126, 126) !important;
  background: #d4d4d4 !important;
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none !important;
  transform: none !important;
}
</style>