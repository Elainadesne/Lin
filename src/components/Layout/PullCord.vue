<template>
  <div
    ref="lampCordRef"
    class="pull-cord-container"
    :class="{ pulled: isPulled }"
    @mousedown.prevent="handlePull"
    @touchstart.prevent="handlePull"
  >
    <div class="cord" @transitionend="handleTransitionEnd">
      <svg class="ice-crystal-svg" viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="iceTopLeft" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="rgba(180, 230, 255, 0.5)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0.9)" />
          </linearGradient>
          <linearGradient id="iceTopRight" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="rgba(100, 200, 255, 0.6)" />
            <stop offset="100%" stop-color="rgba(200, 240, 255, 0.8)" />
          </linearGradient>
          <linearGradient id="iceBotLeft" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(50, 150, 255, 0.4)" />
            <stop offset="100%" stop-color="rgba(180, 240, 255, 0.7)" />
          </linearGradient>
          <linearGradient id="iceBotRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(20, 100, 200, 0.7)" />
            <stop offset="100%" stop-color="rgba(100, 200, 255, 0.9)" />
          </linearGradient>
          <linearGradient id="silverChain" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#b0c4de" />
            <stop offset="50%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#778899" />
          </linearGradient>
          <radialGradient id="iceCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="50%" stop-color="#88ddff" />
            <stop offset="100%" stop-color="rgba(0, 150, 255, 0)" />
          </radialGradient>
          <filter id="iceGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="sparkleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <g id="sparkle-star">
            <path
              d="M 0,-6 Q 1,-1 6,0 Q 1,1 0,6 Q -1,1 -6,0 Q -1,-1 0,-6 Z"
              fill="#ffffff"
              filter="url(#sparkleGlow)"
            />
          </g>
        </defs>

        <line
          x1="30"
          y1="0"
          x2="30"
          y2="130"
          stroke="url(#silverChain)"
          stroke-width="2.5"
          stroke-dasharray="0 6"
          stroke-linecap="round"
        />
        <line
          x1="30"
          y1="0"
          x2="30"
          y2="130"
          stroke="#ffffff"
          stroke-width="1"
          stroke-dasharray="0 6"
          stroke-linecap="round"
        />

        <path d="M 27,125 C 27,135 33,135 33,125 Z" fill="url(#silverChain)" />
        <circle cx="30" cy="132" r="3" fill="url(#silverChain)" />

        <circle cx="30" cy="155" r="15" fill="url(#iceCore)" filter="url(#iceGlow)" opacity="0.8" />

        <g
          transform="translate(30, 155)"
          stroke="rgba(255,255,255,0.5)"
          stroke-width="0.5"
          stroke-linejoin="round"
        >
          <polygon points="0,-22 -14,-5 0,0" fill="url(#iceTopLeft)" />
          <polygon points="0,-22 14,-5 0,0" fill="url(#iceTopRight)" />
          <polygon points="-14,-5 0,35 0,0" fill="url(#iceBotLeft)" />
          <polygon points="14,-5 0,35 0,0" fill="url(#iceBotRight)" />
          <polygon points="0,-18 -6,-5 0,25" fill="rgba(255, 255, 255, 0.4)" />
          <polygon points="0,-18 3,-5 0,15" fill="rgba(255, 255, 255, 0.8)" />
        </g>

        <use
          href="#sparkle-star"
          x="22"
          y="140"
          opacity="0.9"
          style="animation: pulse-star 2s infinite alternate"
        />
        <use
          href="#sparkle-star"
          x="42"
          y="170"
          opacity="0.6"
          style="animation: pulse-star 3s infinite alternate-reverse"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useAppStore } from '../../stores/useAppStore';

const appStore = useAppStore();
const lampCordRef = ref<HTMLElement | null>(null);
const isPulled = ref(false);

const handlePull = (): void => {
  if (isPulled.value) return;
  isPulled.value = true;
};

const handleTransitionEnd = (e: TransitionEvent): void => {
  if (e.propertyName === 'height' && isPulled.value) {
    isPulled.value = false;
    triggerThemeSwitch();
  }
};

const triggerThemeSwitch = (): void => {
  const switchTheme = (): void => {
    appStore.toggleDark();
  };

  if (document.startViewTransition && lampCordRef.value) {
    const rect = lampCordRef.value.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom - 200;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.style.setProperty('--ripple-x', `${x}px`);
    document.documentElement.style.setProperty('--ripple-y', `${y}px`);
    document.documentElement.style.setProperty('--ripple-r', `${maxRadius}px`);

    document.startViewTransition(switchTheme);
  } else {
    document.body.style.transition = 'background-color 1.2s ease';
    const notebook = document.querySelector<HTMLElement>('.notebook');
    const pageFronts = document.querySelectorAll('.page-front');

    if (notebook) notebook.style.transition = 'background-color 1.2s ease';
    pageFronts.forEach((p) => ((p as HTMLElement).style.transition = 'background-color 1.2s ease'));

    switchTheme();

    const cleanupTransition = (ev: TransitionEvent): void => {
      if (ev.propertyName === 'background-color') {
        document.body.style.transition = '';
        if (notebook) notebook.style.transition = '';
        pageFronts.forEach((p) => ((p as HTMLElement).style.transition = ''));
        document.body.removeEventListener('transitionend', cleanupTransition);
      }
    };
    document.body.addEventListener('transitionend', cleanupTransition);
  }
};
</script>

<style scoped>
@keyframes pulse-star {
  0% {
    transform: scale(0.6) rotate(0deg);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.2) rotate(45deg);
    opacity: 1;
  }
}
</style>
