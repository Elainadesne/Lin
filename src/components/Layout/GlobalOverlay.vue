<template>
  <Teleport to="#global-overlay">
    <Transition name="overlay-fade">
      <div v-if="hasActiveOverlay" class="global-overlay-container">
        <BirthdayPresent
          v-if="messageSync.triggerBirthday.value"
          @close="handleClose('birthday')"
        />

        <TarotCard v-if="messageSync.triggerTarot.value" @close="handleClose('tarot')" />

        <ScaleForm
          v-if="messageSync.activeScaleId.value"
          :scale-id="messageSync.activeScaleId.value"
          @close="handleClose('scale')"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, type Component } from 'vue';

import { useMessageSync } from '../../composables/useMessageSync';

const BirthdayPresent = defineAsyncComponent(
  () => import('../Features/BirthdayPresent.vue'),
) as Component;
const ScaleForm = defineAsyncComponent(() => import('../Features/ScaleForm.vue')) as Component;
const TarotCard = defineAsyncComponent(() => import('../Features/TarotCard.vue')) as Component;

const messageSync = useMessageSync();

const hasActiveOverlay = computed(() => {
  return (
    messageSync.triggerBirthday.value ||
    messageSync.triggerTarot.value ||
    !!messageSync.activeScaleId.value
  );
});

const handleClose = (type: 'birthday' | 'tarot' | 'scale'): void => {
  messageSync.resetTrigger(type);
};
</script>

<style>
#global-overlay {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  perspective: 1000px;
  z-index: 9999;
  padding: 5vh 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  pointer-events: none;
}

@keyframes handOverFromTop {
  0% {
    transform: translateY(-120vh) rotateX(45deg) scale(0.8);
    opacity: 0;
  }
  70% {
    transform: translateY(5vh) rotateX(-5deg) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes handBackToTop {
  0% {
    transform: translateY(0) rotateX(0) scale(1);
    opacity: 1;
  }
  30% {
    transform: translateY(5vh) rotateX(-5deg) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateY(-120vh) rotateX(45deg) scale(0.8);
    opacity: 0;
  }
}
.close-overlay-btn {
  transition: transform 0.1s;
  cursor: pointer;
  margin-top: 15px;
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.3);
  border: none;
  border-radius: 8px;
  background: var(--tab-1);
  padding: 12px;
  width: 100%;
  color: #fff;
  font-weight: bold;
  font-size: 15px;
}
.close-overlay-btn:active {
  transform: scale(0.96);
}

.global-overlay-container {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  perspective: 1000px;
  z-index: 9999;
  padding: 5vh 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  pointer-events: none;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.5s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
