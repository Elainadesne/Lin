<template>
  <div
    class="pull-cord-container"
    :class="{ pulled: isPulled }"
    ref="lampCordRef"
    @mousedown.prevent="handlePull"
    @touchstart.prevent="handlePull"
  >
    <div class="cord" @transitionend="handleTransitionEnd">
      <div class="knob"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '../../stores/useAppStore';

const appStore = useAppStore();
const lampCordRef = ref<HTMLElement | null>(null);
const isPulled = ref(false);

const handlePull = () => {
  if (isPulled.value) return;
  isPulled.value = true;
};

const handleTransitionEnd = (e: TransitionEvent) => {
  if (e.propertyName === 'height' && isPulled.value) {
    isPulled.value = false;
    triggerThemeSwitch();
  }
};

const triggerThemeSwitch = () => {
  const switchTheme = () => {
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
    const notebook = document.querySelector('.notebook') as HTMLElement;
    const pageFronts = document.querySelectorAll('.page-front');

    if (notebook) notebook.style.transition = 'background-color 1.2s ease';
    pageFronts.forEach((p) => ((p as HTMLElement).style.transition = 'background-color 1.2s ease'));

    switchTheme();

    const cleanupTransition = (ev: TransitionEvent) => {
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

<style scoped></style>
