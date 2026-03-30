import { onMounted, onUnmounted, ref } from 'vue';
import { useChatStore } from '../stores/useChatStore';

const triggerBirthday = ref(false);
const triggerTarot = ref(false);
const activeScaleId = ref<string | null>(null);
const isDevTest = ref(false);

export function useMessageSync() {
  const chatStore = useChatStore();

  const messageHandler = (event: MessageEvent) => {
    if (!event.data || !event.data.type) return;

    if (event.data.type === 'TRIGGER_BIRTHDAY') {
      isDevTest.value = false;
      triggerBirthday.value = true;
      return;
    }
    if (event.data.type === 'TRIGGER_TAROT') {
      isDevTest.value = false;
      triggerTarot.value = true;
      return;
    }
    if (event.data.type === 'TRIGGER_SCALE') {
      isDevTest.value = false;
      activeScaleId.value = event.data.scale;
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

  const resetTrigger = (type: 'birthday' | 'tarot' | 'scale') => {
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
