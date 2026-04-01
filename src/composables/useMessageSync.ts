import { onMounted, onUnmounted, ref, type Ref } from 'vue';

import { useChatStore } from '../stores/useChatStore';

const triggerBirthday = ref(false);
const triggerTarot = ref(false);
const activeScaleId = ref<string | null>(null);
const isDevTest = ref(false);

export function useMessageSync(): {
  triggerBirthday: Ref<boolean>;
  triggerTarot: Ref<boolean>;
  activeScaleId: Ref<string | null>;
  isDevTest: Ref<boolean>;
  resetTrigger: (type: 'birthday' | 'tarot' | 'scale') => void;
} {
  const chatStore = useChatStore();

  const messageHandler = (event: MessageEvent): void => {
    const data = event.data as { type?: string; scale?: string };
    if (!data?.type) return;

    if (data.type === 'TRIGGER_BIRTHDAY') {
      isDevTest.value = false;
      triggerBirthday.value = true;
      return;
    }
    if (data.type === 'TRIGGER_TAROT') {
      isDevTest.value = false;
      triggerTarot.value = true;
      return;
    }
    if (data.type === 'TRIGGER_SCALE') {
      isDevTest.value = false;
      activeScaleId.value = data.scale ?? null;
      return;
    }

    chatStore.handleHostMessage(event);
  };

  onMounted(() => {
    window.addEventListener('message', messageHandler);
  });

  onUnmounted(() => {
    window.removeEventListener('message', messageHandler);
  });

  const resetTrigger = (type: 'birthday' | 'tarot' | 'scale'): void => {
    if (type === 'birthday') triggerBirthday.value = false;
    if (type === 'tarot') triggerTarot.value = false;
    if (type === 'scale') activeScaleId.value = null;
  };

  return {
    triggerBirthday,
    triggerTarot,
    activeScaleId,
    isDevTest,
    resetTrigger,
  };
}
