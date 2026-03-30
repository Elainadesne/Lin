<template>
  <Teleport to="#global-overlay">
    <Transition name="overlay-fade">
      <div class="global-overlay-container" v-if="hasActiveOverlay">
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
import { computed } from 'vue';
import { useMessageSync } from '../../composables/useMessageSync';
import BirthdayPresent from '../Features/BirthdayPresent.vue';
import ScaleForm from '../Features/ScaleForm.vue';
import TarotCard from '../Features/TarotCard.vue';

const messageSync = useMessageSync();

const hasActiveOverlay = computed(() => {
  return (
    messageSync.triggerBirthday.value ||
    messageSync.triggerTarot.value ||
    !!messageSync.activeScaleId.value
  );
});

const handleClose = (type: 'birthday' | 'tarot' | 'scale') => {
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
