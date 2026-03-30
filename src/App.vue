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
      <div class="spiral-container" id="spirals">
        <div v-for="i in 14" :key="i" class="spiral-ring"></div>
      </div>

      <div class="pages-container" id="book-pages">
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
          <div class="page-front" id="page-0">
            <ChatRoom />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img src="/doodles/doodle_2.webp" class="doodle-img" alt="绿色奶龙" />
          </div>
        </div>

        <div class="page" data-index="1" :class="{ flipped: appStore.activeTab > 1 }">
          <div class="page-front" id="page-1">
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
          <div class="page-front" id="page-2">
            <Garden />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img src="/doodles/doodle_4.webp" class="doodle-img" alt="休息一会儿吧！" />
          </div>
        </div>

        <div class="page" data-index="3" :class="{ flipped: appStore.activeTab > 3 }">
          <div class="page-front" id="page-3">
            <Settings />
          </div>
          <div class="page-back close-book-area" @click="closeBook">
            <img src="/doodles/doodle_5.webp" class="doodle-img" alt="妈妈的秘密！" />
          </div>
        </div>

        <div
          class="page"
          data-index="4"
          v-if="appStore.isDevModeUnlocked"
          :class="{ flipped: appStore.activeTab > 4 }"
        >
          <div class="page-front dev-page-front" id="page-4">
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
import { useMessageSync } from './composables/useMessageSync';
import { useAppStore } from './stores/useAppStore';

import GlobalOverlay from './components/Layout/GlobalOverlay.vue';
import PullCord from './components/Layout/PullCord.vue';
import SideTabs from './components/Layout/SideTabs.vue';

import ChatRoom from './components/Tabs/ChatRoom.vue';
import DevPanel from './components/Tabs/DevPanel.vue';
import Dossier from './components/Tabs/Dossier.vue';
import Garden from './components/Tabs/Garden.vue';
import Settings from './components/Tabs/Settings.vue';

const appStore = useAppStore();

useMessageSync();

const isCoverFlipped = ref(false);
const isFullscreen = ref(false);
const isAppReady = ref(false);

provide('toggleFullscreen', () => {
  isFullscreen.value = !isFullscreen.value;
});

const closeBook = () => {
  appStore.activeTab = -1;
  isCoverFlipped.value = false;
};

onMounted(() => {
  const appContainer = document.querySelector('.app-container') as HTMLElement;

  if (appContainer) {
    appContainer.addEventListener('animationend', (e: AnimationEvent) => {
      if (e.animationName === 'appHandOver') {
        if (appStore.settings.autoOpen && appStore.activeTab === -1) {
          isCoverFlipped.value = true;
        }
      }
    });
  }

  const initApp = () => {
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

<style>
.app-container {
  position: relative;
  transform: translateY(120vh) rotateX(15deg) scale(0.9);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, opacity, width, height;
  margin: auto;
}

.app-container.app-ready {
  transform: translateY(0) rotateX(0) scale(1);
  opacity: 1;
}

.app-container.fullscreen-mode {
  transform: none;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.page {
  border-radius: 0 18px 18px 0;
  background-color: var(--notebook-bg);
}
</style>
