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
    <div class="notebook">
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
            <img src="/doodles/doodle_1.webp" class="doodle-img" alt="妈妈超厉害！" />
          </div>
        </div>

        <div class="page" data-index="0" :class="{ flipped: appStore.activeTab > 0 }">
          <div id="page-0" class="page-front">
            <ChatRoom />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img src="/doodles/doodle_2.webp" class="doodle-img" alt="绿色奶龙" />
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
            />
          </div>
        </div>

        <div class="page" data-index="2" :class="{ flipped: appStore.activeTab > 2 }">
          <div id="page-2" class="page-front">
            <Garden />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img src="/doodles/doodle_4.webp" class="doodle-img" alt="休息一会儿吧！" />
          </div>
        </div>

        <div class="page" data-index="3" :class="{ flipped: appStore.activeTab > 3 }">
          <div id="page-3" class="page-front">
            <Settings />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img src="/doodles/doodle_5.webp" class="doodle-img" alt="妈妈的秘密！" />
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
    </div>

    <SideTabs />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue';

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

  if (document.readyState === 'complete') {
    initApp();
  } else {
    window.addEventListener('load', initApp);
  }

  const fallbackTimer = setTimeout(initApp, 10000);

  onUnmounted(() => {
    window.removeEventListener('load', initApp);
    clearTimeout(fallbackTimer);
  });
});
</script>
