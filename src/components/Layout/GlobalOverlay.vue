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

<style scoped>
.global-overlay-container {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  perspective: 1000px;
  z-index: 9999;
  padding: 5vh 0;
  width: 100vw;
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
