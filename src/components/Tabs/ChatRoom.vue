<template>
  <div class="chat-room-container">
    <div id="chat-history-container" class="chat-history" v-bind="containerProps">
      <div v-bind="wrapperProps" class="chat-history-inner">
        <div v-if="listData.length === 0" class="message-item ai-msg msg-narration">
          <p>这里很安静。</p>
        </div>
        <div
          v-for="item in list"
          :key="item.data.id"
          :data-date="item.data.date"
          :class="[
            'message-item',
            item.data.role === 'ai' ? 'ai-msg msg-narration' : 'user-note msg-user',
          ]"
          :style="
            item.data.role === 'user'
              ? { transform: `rotate(${(((item.index * 13.5) % 6) - 3).toFixed(1)}deg)` }
              : {}
          "
        >
          <div v-html="renderMarkdown(item.data.rawText, item.data.role === 'ai')"></div>
        </div>

        <div
          v-if="chatStore.isGenerating && chatStore.streamText"
          class="ai-msg msg-narration"
          id="typing-bubble"
        >
          <div v-html="renderTypingHtml(chatStore.streamText)"></div>
        </div>
      </div>
    </div>

    <div class="input-wrapper" id="chat-input-wrapper">
      <div style="position: relative; width: 38px; height: 38px">
        <button
          class="glass-btn"
          @click="openCalendar"
          title="历史检索"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2"
        >
          📅
        </button>
        <flat-pickr v-model="selectedDate" :config="fpConfig" class="hidden-fp-input" ref="fpRef" />
      </div>

      <button v-if="isViewingHistory" class="glass-btn glass-btn-wide" @click="scrollToLatest">
        回到最新 ↓
      </button>

      <template v-else>
        <textarea
          ref="chatInputRef"
          v-model="inputText"
          placeholder="写下你的感受..."
          rows="1"
          @keydown.enter.prevent="handleSend"
          @input="adjustInputHeight"
        ></textarea>

        <button
          class="send-btn"
          :class="{ 'is-loading': chatStore.isGenerating }"
          @click="handleSend"
        >
          <span v-if="!chatStore.isGenerating">↑</span>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="white" class="send-btn-icon">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </template>

      <button class="fs-btn" @click="toggleFullscreen" title="全屏切换">⛶</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver, useVirtualList } from '@vueuse/core';
import { Mandarin } from 'flatpickr/dist/l10n/zh.js';
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import FlatPickr from 'vue-flatpickr-component';
import { useMarkdown } from '../../composables/useMarkdown';
import { useChatStore } from '../../stores/useChatStore';

const chatStore = useChatStore();
const { renderMarkdown, renderTypingHtml } = useMarkdown();

const toggleFullscreen = inject<() => void>('toggleFullscreen', () => {});

const inputText = ref('');
const chatInputRef = ref<HTMLTextAreaElement | null>(null);

watch(
  () => chatStore.syncedInputText,
  (newVal) => {
    if (inputText.value !== newVal) {
      inputText.value = newVal;
      nextTick(adjustInputHeight);
    }
  },
);

watch(inputText, (newVal) => {
  chatStore.syncInputToHost(newVal);
});

const adjustInputHeight = () => {
  const el = chatInputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
  triggerScrollPadding();
};

const handleSend = () => {
  if (chatStore.isGenerating) {
    chatStore.stopGeneration();
    return;
  }
  if (!inputText.value.trim()) return;

  chatStore.sendMessageToHost(inputText.value.trim());
  inputText.value = '';
  nextTick(() => {
    adjustInputHeight();
    scrollToLatest();
  });
};

const listData = computed(() => chatStore.messages);

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(listData, {
  itemHeight: 120,
});

const triggerScrollPadding = () => {
  const wrapper = document.getElementById('chat-input-wrapper');
  const container = document.getElementById('chat-history-container');
  if (wrapper && container) {
    container.style.paddingBottom = `${wrapper.offsetHeight + 15}px`;
  }
};

onMounted(() => {
  const wrapper = document.getElementById('chat-input-wrapper');
  if (wrapper) {
    useResizeObserver(wrapper, triggerScrollPadding);
  }
});

const scrollToLatest = async () => {
  isViewingHistory.value = false;
  selectedDate.value = null;

  await nextTick();
  if (chatStore.messages.length > 0) {
    scrollTo(chatStore.messages.length - 1);
  }
};

watch([() => chatStore.messages.length, () => chatStore.streamText], async () => {
  if (!isViewingHistory.value) {
    await nextTick();
    if (chatStore.messages.length > 0) {
      scrollTo(chatStore.messages.length - 1);
    }
    const container = document.getElementById('chat-history-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
});

const fpRef = ref<any>(null);
const selectedDate = ref<string | null>(null);
const isViewingHistory = ref(false);

const openCalendar = () => {
  if (fpRef.value && fpRef.value.fp) {
    fpRef.value.fp.open();
  }
};

const fpConfig = computed(() => {
  const enabledDates = chatStore.availableDates;
  return {
    locale: Mandarin,
    disableMobile: true,
    enableTime: true,
    time_24hr: true,
    defaultHour: 0,
    defaultMinute: 0,
    dateFormat: 'Y-m-d H:i',
    enable: enabledDates,
    minDate: enabledDates[0] || undefined,
    maxDate: enabledDates[enabledDates.length - 1] || undefined,

    onDayCreate: (_dObj: Date[], _dStr: string, _fp: any, dayElem: HTMLElement) => {
      const targetDateObj = (dayElem as any).dateObj as Date;
      if (!targetDateObj) return;

      const dateStr = [
        targetDateObj.getFullYear(),
        String(targetDateObj.getMonth() + 1).padStart(2, '0'),
        String(targetDateObj.getDate()).padStart(2, '0'),
      ].join('-');

      if (enabledDates.includes(dateStr)) {
        dayElem.innerHTML += `<span class="event-marker"></span>`;
      }
    },

    onChange: (selectedDates: Date[], _dateStr: string) => {
      if (!selectedDates.length) return;
      isViewingHistory.value = true;

      const targetDate = selectedDates[0];
      const targetDateStr = [
        targetDate.getFullYear(),
        String(targetDate.getMonth() + 1).padStart(2, '0'),
        String(targetDate.getDate()).padStart(2, '0'),
      ].join('-');

      const targetTime = targetDate.getTime();

      const dayMessages = chatStore.messages
        .map((m, i) => ({ m, i }))
        .filter(
          ({ m }) =>
            m.date === targetDateStr ||
            (m.timestamp && new Date(m.timestamp).toDateString() === targetDate.toDateString()),
        );

      if (dayMessages.length > 0) {
        let closestIndex = dayMessages[0].i;
        let minDiff = Infinity;

        dayMessages.forEach(({ m, i }) => {
          const mTime = m.timestamp
            ? Number(m.timestamp)
            : new Date(`${m.date || targetDateStr} 00:00:00`).getTime();
          const diff = Math.abs(mTime - targetTime);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        });

        scrollTo(closestIndex);
      } else {
        const index = chatStore.messages.findIndex(
          (m) => m.date === targetDateStr || (m.date && m.date.startsWith(targetDateStr)),
        );
        if (index !== -1) scrollTo(index);
      }
    },
  };
});

onMounted(() => {
  triggerScrollPadding();
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToLatest);
  });
});
</script>

<style scoped>
.chat-room-container {
  position: relative;
  height: 100%;
}

.chat-history {
  position: absolute;
  top: 25px;
  right: 20px;
  bottom: 0px;
  left: 20px;
  z-index: 10;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.chat-history::-webkit-scrollbar {
  display: none;
}
.chat-history-inner {
  display: flex;
  flex-direction: column;
}

.message-item {
  margin-bottom: 15px;
}

.chat-room-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.hidden-fp-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
