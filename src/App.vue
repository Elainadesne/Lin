<template>
  <div id="global-overlay"></div>
  <GlobalOverlay />

  <PullCord />

  <div
    class="app-container"
    :class="{
      'fullscreen-mode': isFullscreen,
      'app-ready': isAppReady,
    }"
  >
    <main class="notebook">
      <div id="spirals" class="spiral-container">
        <div v-for="i in 14" :key="i" class="spiral-ring"></div>
      </div>

      <div id="book-pages" class="pages-container">
        <div
          class="page"
          data-index="-1"
          :class="{ flipped: isCoverFlipped || appStore.activeTab > -1 }"
        >
          <div class="page-front cover-design">
            <h1>林雨涵</h1>
            <p>诊疗笔记</p>
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img
              src="/doodles/doodle_1.webp"
              class="doodle-img"
              alt="妈妈超厉害！"
              width="1033"
              height="616"
            />
          </div>
        </div>

        <div class="page" data-index="0" :class="{ flipped: appStore.activeTab > 0 }">
          <div id="page-0" class="page-front">
            <ChatRoom />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img
              src="/doodles/doodle_2.webp"
              class="doodle-img"
              alt="绿色奶龙"
              width="717"
              height="680"
            />
          </div>
        </div>

        <div class="page" data-index="1" :class="{ flipped: appStore.activeTab > 1 }">
          <div id="page-1" class="page-front">
            <Dossier />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img
              src="/doodles/doodle_3.webp"
              class="doodle-img"
              alt="给叔叔/阿姨的开心药（不苦！）"
              width="1221"
              height="645"
            />
          </div>
        </div>

        <div class="page" data-index="2" :class="{ flipped: appStore.activeTab > 2 }">
          <div id="page-2" class="page-front">
            <Garden />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img
              src="/doodles/doodle_4.webp"
              class="doodle-img"
              alt="休息一会儿吧！"
              width="1221"
              height="645"
            />
          </div>
        </div>

        <div class="page" data-index="3" :class="{ flipped: appStore.activeTab > 3 }">
          <div id="page-3" class="page-front">
            <Settings />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img
              src="/doodles/doodle_5.webp"
              class="doodle-img"
              alt="妈妈的秘密！"
              width="723"
              height="1189"
            />
          </div>
        </div>

        <div
          v-if="appStore.isDevModeUnlocked"
          class="page"
          data-index="4"
          :class="{ flipped: appStore.activeTab > 4 }"
        >
          <div id="page-4" class="page-front dev-page-front">
            <DevPanel />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <div class="dev-page-back-text">=== 越过此处即是虚无 ===</div>
          </div>
        </div>
      </div>
    </main>

    <SideTabs />
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from 'vue';

import GlobalOverlay from './components/Layout/GlobalOverlay.vue';
import PullCord from './components/Layout/PullCord.vue';
import SideTabs from './components/Layout/SideTabs.vue';
import ChatRoom from './components/Tabs/ChatRoom.vue';
import DevPanel from './components/Tabs/DevPanel.vue';
import Dossier from './components/Tabs/Dossier.vue';
import Garden from './components/Tabs/Garden.vue';
import Settings from './components/Tabs/Settings.vue';
import { useMessageSync } from './composables/useMessageSync';
import { useAppStore } from './stores/useAppStore';

const appStore = useAppStore();

useMessageSync();

const isCoverFlipped = ref(false);
const isFullscreen = ref(false);
const isAppReady = ref(false);

provide('toggleFullscreen', () => {
  isFullscreen.value = !isFullscreen.value;
});

const closeBook = (): void => {
  appStore.activeTab = -1;
  isCoverFlipped.value = false;
};

onMounted(() => {
  const appContainer = document.querySelector('.app-container');

  if (appContainer) {
    appContainer.addEventListener('animationend', (e: Event) => {
      const animEvent = e as AnimationEvent;
      if (animEvent.animationName === 'appHandOver') {
        if (appStore.settings.autoOpen && appStore.activeTab === -1) {
          isCoverFlipped.value = true;
        }
      }
    });
  }

  const initApp = (): void => {
    if (isAppReady.value) return;
    requestAnimationFrame(() => {
      isAppReady.value = true;
    });
  };

  initApp();
});
</script>
<style>
:root {
  --font-lin: sans-serif;
  --font-qin: sans-serif;

  --font-children: cursive;
  --font-user: cursive;
  --font-narration: serif;

  --font-ui-sans: var(--font-user);

  --turn-speed: 1s;
  --bg-color: #d1cbc3;

  --cover-noise: url('/textures/cream-paper.png');
  --page-noise: url('/textures/cardboard-flat.png');

  --notebook-bg: #e8e3db;
  --line-color: rgba(130, 120, 105, 0.25);

  --text-main: #3d3935;
  --text-ai: #2a2724;
  --shadow-color: rgba(20, 15, 10, 0.25);
  --spotlight: radial-gradient(
    circle at 50% 30%,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(0, 0, 0, 0.05) 100%
  );

  --tab-1: #d6c5b3;
  --tab-2: #d4cfb6;
  --tab-3: #bdc7b9;
  --tab-4: #bac6c8;

  --card-bg: rgba(255, 255, 255, 0.4);
  --border-light: rgba(0, 0, 0, 0.04);
  --ui-base-size: 15px;
  --base-font-size: var(--ui-base-size);
}
html {
  overflow: hidden;
  overscroll-behavior: none;
}
body.dark-mode {
  --bg-color: #1c1a18;
  --notebook-bg: #6b645c;
  --line-color: rgba(40, 35, 30, 0.4);
  --text-main: #d4cfc7;
  --text-ai: #e8e3db;
  --shadow-color: rgba(0, 0, 0, 0.8);
  --spotlight: radial-gradient(
    circle at 50% 40%,
    rgba(255, 220, 150, 0.15) 0%,
    rgba(20, 18, 15, 0.5) 80%,
    rgba(0, 0, 0, 0.7) 100%
  );
  --card-bg: rgba(0, 0, 0, 0.2);
  --border-light: rgba(255, 255, 255, 0.06);
}

body.use-sys-fonts {
  --font-lin: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-qin: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-children:
    system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-user: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-narration:
    system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-ui-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

:focus-visible {
  outline: 2px solid var(--tab-3);
  outline-offset: 4px;
  border-radius: 2px;
}
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid #2ecc71;
}

* {
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  display: grid;
  place-content: center;
  transform: translateZ(0);
  background-repeat: repeat;
  background-color: var(--bg-color);
  height: 100dvh;
  overflow: hidden;
  font-family: var(--font-ui-sans);
}

body::before,
body::after {
  position: fixed;
  transform: translateZ(0);
  opacity: 0.5;
  z-index: -1;
  mix-blend-mode: multiply;
  filter: blur(80px);
  animation: bg-drift 15s infinite alternate ease-in-out;
  will-change: transform;
  border-radius: 50%;
  pointer-events: none;
  content: '';
}

body::before {
  top: -10vw;
  left: -10vw;
  background: radial-gradient(circle, var(--tab-3) 0%, transparent 70%);
  width: 40vw;
  height: 40vw;
}

body::after {
  right: -10vw;
  bottom: -20vw;
  animation-delay: -5s;
  background: radial-gradient(circle, var(--tab-1) 0%, transparent 70%);
  width: 50vw;
  height: 50vw;
}

body.dark-mode::before,
body.dark-mode::after {
  opacity: 0.15;
  mix-blend-mode: screen;
}

@keyframes bg-drift {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(5vw, 5vw) scale(1.2);
  }
}

@keyframes floating {
  0% {
    transform: translate3d(0, 0px, 0);
  }
  50% {
    transform: translate3d(0, -6px, 0);
  }
  100% {
    transform: translate3d(0, 0px, 0);
  }
}

@keyframes appHandOver {
  0% {
    transform: translateY(-100vh) rotateX(-15deg) scale(0.85);
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotateX(0) scale(1);
    opacity: 1;
  }
}

.app-container {
  display: flex;
  position: relative;
  align-items: flex-start;
  transform: translateY(-100vh) rotateX(-15deg) scale(0.85);
  opacity: 0;
  backface-visibility: hidden;
  will-change: transform, opacity;
  container-type: size;
  aspect-ratio: 3/4;
  width: min(92vw, calc(88dvh * 0.75));
  height: min(88dvh, calc(92vw * 1.333));
}

.app-container.app-ready {
  animation:
    appHandOver 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards,
    floating 6s ease-in-out 1.2s infinite;
}

.app-container.fullscreen-mode {
  transform: none !important;
  opacity: 1 !important;
  animation: none !important;
  border-radius: 0;
  aspect-ratio: auto;
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
}
.app-container.fullscreen-mode .notebook,
.app-container.fullscreen-mode .page-front {
  border-radius: 0;
}
.app-container.fullscreen-mode .tabs-container,
.app-container.fullscreen-mode .spiral-container,
.app-container.fullscreen-mode .pull-cord-container {
  display: none;
}
.app-container.fullscreen-mode .pages-container {
  left: 0;
  border-radius: 0;
}

.notebook {
  position: relative;
  flex: 1;
  z-index: 10;
  box-shadow:
    2px 3px 2.5px var(--shadow-color),
    5px 8px 6.5px var(--shadow-color),
    10px 16px 13px var(--shadow-color),
    18px 25px 22px var(--shadow-color),
    35px 45px 40px var(--shadow-color),
    inset -2px 0 5px rgba(255, 255, 255, 0.5);
  border-radius: 8px 18px 18px 8px;
  background: var(--notebook-bg);
  height: 100%;
}

.spiral-container {
  display: flex;
  position: absolute;
  top: 2%;
  left: 0;
  flex-direction: column;
  justify-content: space-evenly;
  z-index: 100;
  width: 30px;
  height: 96%;
  pointer-events: none;
}
.spiral-ring {
  transform: rotate(-6deg);
  margin-left: -18px;
  box-shadow:
    3px 6px 8px rgba(0, 0, 0, 0.45),
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    inset 0 -1px 2px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  background: linear-gradient(
    to right,
    #4a3f2b 0%,
    #b89961 15%,
    #ebd59b 40%,
    #9e814b 75%,
    #2c2417 100%
  );
  width: 38px;
  height: 12px;
}

.pages-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 35px;
  transform-style: preserve-3d;
  perspective: 2500px;
  z-index: 110;
  border-radius: 0 18px 18px 0;
}
.page {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: left center;
  transform-style: preserve-3d;
  transition:
    transform var(--turn-speed, 1s) cubic-bezier(0.645, 0.045, 0.355, 1),
    z-index 0s var(--turn-speed, 1s);
  will-change: transform;
  width: 100%;
  height: 100%;
}
.page.flipped {
  transition:
    transform var(--turn-speed, 1s) cubic-bezier(0.645, 0.045, 0.355, 1),
    z-index 0s 0s;
}
.page-front,
.page-back {
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 0 18px 18px 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.page-front::-webkit-scrollbar,
.page-back::-webkit-scrollbar {
  display: none;
}

.page-front {
  z-index: 2;
  box-shadow:
    inset 25px 0 35px rgba(0, 0, 0, 0.08),
    inset 2px 0 4px rgba(0, 0, 0, 0.05);
  background-image:
    var(--spotlight),
    radial-gradient(ellipse at center, transparent 70%, rgba(139, 115, 85, 0.08) 100%),
    var(--page-noise),
    repeating-linear-gradient(
      transparent 0,
      transparent 34px,
      var(--line-color) 34px,
      var(--line-color) 35px
    );
  background-position:
    center top,
    center center,
    0 0,
    0 40px;
  background-size:
    100% 100%,
    100% 100%,
    auto,
    100% auto;
  background-repeat: no-repeat, no-repeat, repeat, repeat;
  background-color: var(--notebook-bg);
  padding: 25px 20px 90px 20px;
}

.page-back {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: rotateY(180deg);
  z-index: 1;
  cursor: pointer;
  box-shadow: inset -25px 0 35px rgba(0, 0, 0, 0.08);
  border-radius: 18px 0 0 18px;
  background-image: var(--page-noise);
  background-repeat: repeat;
  background-color: var(--notebook-bg);
}

.doodle-img {
  transform: rotate(-2deg) translateZ(0);
  opacity: 0.85;
  mix-blend-mode: multiply;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.05));
  will-change: transform;
  width: 85%;
  max-height: 85%;
  object-fit: contain;
  pointer-events: none;
}

body.dark-mode .doodle-img {
  opacity: 0.85;
  mix-blend-mode: screen;
  filter: invert(0.85) hue-rotate(180deg) drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5));
}

.page[data-index='-1'].flipped {
  transform: translateZ(1px) rotateY(-105deg);
  z-index: 101;
}
.page[data-index='0'].flipped {
  transform: translateZ(2px) rotateY(-102deg);
  z-index: 102;
}
.page[data-index='1'].flipped {
  transform: translateZ(3px) rotateY(-99deg);
  z-index: 103;
}
.page[data-index='2'].flipped {
  transform: translateZ(4px) rotateY(-96deg);
  z-index: 104;
}
.page[data-index='3'].flipped {
  transform: translateZ(5px) rotateY(-93deg);
  z-index: 105;
}

.page[data-index='-1'] {
  transform: translateZ(5px) rotateY(0deg);
  z-index: 5;
}
.page[data-index='0'] {
  transform: translateZ(4px) rotateY(0deg);
  z-index: 4;
}
.page[data-index='1'] {
  transform: translateZ(3px) rotateY(0deg);
  z-index: 3;
}
.page[data-index='2'] {
  transform: translateZ(2px) rotateY(0deg);
  z-index: 2;
}
.page[data-index='3'] {
  transform: translateZ(1px) rotateY(0deg);
  z-index: 1;
}

.page[data-index='-1'] .page-back {
  background-color: #2a3b45;
}
.page[data-index='0'] .page-back {
  background-color: #e3d9c6;
}
.page[data-index='1'] .page-back {
  background-color: #d1d8c5;
}
.page[data-index='2'] .page-back {
  background-color: #d8c5c5;
}
.page[data-index='3'] .page-back {
  background-color: #c5d0d8;
}
body.dark-mode .page[data-index='0'] .page-back {
  background-color: #4c463f;
}
body.dark-mode .page[data-index='1'] .page-back {
  background-color: #3b4252;
}
body.dark-mode .page[data-index='2'] .page-back {
  background-color: #523b3b;
}
body.dark-mode .page[data-index='3'] .page-back {
  background-color: #3b4952;
}

.cover-design {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  outline: 1px solid #1a2f26;
  box-shadow:
    inset 15px 0 30px rgba(0, 0, 0, 0.4),
    inset 1px 1px 1px rgba(255, 255, 255, 0.15),
    inset -1px -1px 2px rgba(0, 0, 0, 0.5);
  background-image:
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.05) 5%,
      transparent 8%,
      transparent 92%,
      rgba(255, 255, 255, 0.05) 98%,
      rgba(0, 0, 0, 0.2) 100%
    ),
    var(--cover-noise), linear-gradient(135deg, #1a2f26 0%, #101c16 100%);
  background-color: #1a2f26;
  background-blend-mode: normal, multiply, normal;
  padding: 0;
}

.cover-design h1 {
  opacity: 0.95;
  margin-bottom: 5cqw;
  color: #dcb670;
  font-size: 12cqw;
  font-family: var(--font-lin);
  letter-spacing: 1.5cqw;
  text-shadow:
    0px -1px 1px rgba(0, 0, 0, 0.8),
    0px 1px 1px rgba(255, 255, 255, 0.2);
}

.cover-design p {
  opacity: 0.85;
  color: #bfa168;
  font-size: 5cqw;
  font-family: var(--font-user);
  letter-spacing: 1.2cqw;
  text-shadow:
    0px -1px 1px rgba(0, 0, 0, 0.8),
    0px 1px 1px rgba(255, 255, 255, 0.15);
}

.archive-title {
  margin-bottom: 20px;
  color: var(--text-main);
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 1px;
}

@keyframes fadeIn {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
}

::view-transition-group(root) {
  animation-duration: 1.2s;
}
::view-transition-old(root),
::view-transition-new(root) {
  display: block;
  mix-blend-mode: normal;
  animation: none;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2;
  animation: ripple-reveal 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes ripple-reveal {
  0% {
    clip-path: circle(0px at var(--ripple-x, 50%) var(--ripple-y, 50%));
    filter: brightness(1.8) saturate(1.5) blur(4px);
  }
  100% {
    clip-path: circle(var(--ripple-r, 100vw) at var(--ripple-x, 50%) var(--ripple-y, 50%));
    filter: brightness(1) saturate(1) blur(0px);
  }
}

.tab {
  font-size: calc(var(--base-font-size) - 1px);
}
.archive-title {
  font-size: calc(var(--base-font-size) + 5px);
}
.d-box-label {
  font-size: calc(var(--base-font-size) - 3px);
}
.d-box-val,
.clinical-notes li,
.task-item,
.goal-box {
  font-size: calc(var(--base-font-size) - 2px);
}
.setting-item label,
.reset-btn {
  font-size: var(--base-font-size);
}
.p-artist {
  font-size: calc(var(--base-font-size) - 2px);
}
.p-name,
.li-artist {
  font-size: calc(var(--base-font-size) - 4px);
}
.opt-label {
  font-size: calc(var(--base-font-size) - 2px);
}
</style>
