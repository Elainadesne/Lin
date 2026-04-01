<template>
  <div class="chat-room-container">
    <div id="chat-history-container" ref="scrollContainerRef" class="chat-history">
      <div v-if="listData.length === 0" class="message-item ai-msg msg-narration">
        <p>这里很安静。</p>
      </div>

      <div
        v-if="listData.length > 0"
        :style="{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }"
      >
        <div
          v-for="virtualRow in rowVirtualizer.getVirtualItems()"
          :key="virtualRow.index"
          :ref="(el) => rowVirtualizer.measureElement(el as HTMLElement | null)"
          :data-index="virtualRow.index"
          class="message-item-wrapper"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
          }"
        >
          <div
            :data-date="listData[virtualRow.index].date"
            :class="[
              'message-item',
              listData[virtualRow.index].role === 'ai'
                ? 'ai-msg msg-narration'
                : 'user-note msg-user',
            ]"
            :style="
              listData[virtualRow.index].role === 'user'
                ? { transform: `rotate(${(((virtualRow.index * 13.5) % 6) - 3).toFixed(1)}deg)` }
                : {}
            "
          >
            <div
              v-html="
                renderMarkdown(
                  listData[virtualRow.index].rawText,
                  listData[virtualRow.index].role === 'ai',
                )
              "
            ></div>
          </div>
        </div>
      </div>

      <div
        v-if="chatStore.isGenerating && chatStore.streamText"
        id="typing-bubble"
        class="ai-msg msg-narration"
        style="margin-top: 15px"
      >
        <div v-html="renderTypingHtml(chatStore.streamText)"></div>
      </div>

      <div :style="{ height: `${inputBottomSpace}px` }" style="flex-shrink: 0; width: 100%"></div>
    </div>

    <div id="chat-input-wrapper" class="input-wrapper">
      <div style="position: relative; width: 38px; height: 38px">
        <button
          class="glass-btn"
          title="历史检索"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2"
          @click="openCalendar"
        >
          📅
        </button>
        <flat-pickr ref="fpRef" v-model="selectedDate" :config="fpConfig" class="hidden-fp-input" />
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

      <button class="fs-btn" title="全屏切换" @click="toggleFullscreen">⛶</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useResizeObserver } from '@vueuse/core';
import { Mandarin } from 'flatpickr/dist/l10n/zh.js';
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue';
import FlatPickr from 'vue-flatpickr-component';

import { useMarkdown } from '../../composables/useMarkdown';
import { useChatStore } from '../../stores/useChatStore';
import { useEnvStore } from '../../stores/useEnvStore';

const chatStore = useChatStore();
const { renderMarkdown, renderTypingHtml } = useMarkdown();

const toggleFullscreen = inject<() => void>('toggleFullscreen', () => {
  console.warn('toggleFullscreen is not provided');
});

const inputText = ref('');
const chatInputRef = ref<HTMLTextAreaElement | null>(null);

watch(
  () => chatStore.syncedInputText,
  (newVal) => {
    if (inputText.value !== newVal) {
      inputText.value = newVal;
      void nextTick(adjustInputHeight);
    }
  },
);

watch(inputText, (newVal) => {
  chatStore.syncInputToHost(newVal);
});

const adjustInputHeight = (): void => {
  const el = chatInputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
  triggerScrollPadding();
};

const handleSend = (): void => {
  if (chatStore.isGenerating) {
    chatStore.stopGeneration();
    return;
  }
  if (!inputText.value.trim()) return;

  chatStore.sendMessageToHost(inputText.value.trim());
  inputText.value = '';
  void nextTick(() => {
    adjustInputHeight();
    void scrollToLatest();
  });
};

const inputBottomSpace = ref(120);
const scrollContainerRef = ref<HTMLElement | null>(null);

const listData = computed(() => chatStore.messages);

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: listData.value.length,
    getScrollElement: (): HTMLElement | null => scrollContainerRef.value,
    estimateSize: (): number => 120,
    overscan: 1,
  })),
);

const triggerScrollPadding = (): void => {
  const wrapper = document.getElementById('chat-input-wrapper');
  if (wrapper) {
    inputBottomSpace.value = wrapper.offsetHeight + 15;
  }
};

onMounted(() => {
  const wrapper = document.getElementById('chat-input-wrapper');
  if (wrapper) {
    useResizeObserver(wrapper, triggerScrollPadding);
  }
});

const scrollToLatest = async (): Promise<void> => {
  isViewingHistory.value = false;
  selectedDate.value = null;

  await nextTick();
  if (chatStore.messages.length > 0) {
    rowVirtualizer.value.scrollToIndex(chatStore.messages.length - 1, { align: 'end' });
  }
  const container = scrollContainerRef.value;
  if (container) container.scrollTop = container.scrollHeight;
};

watch(
  [(): number => chatStore.messages.length, (): string => chatStore.streamText],
  async (): Promise<void> => {
    if (!isViewingHistory.value) {
      await nextTick();
      if (chatStore.messages.length > 0) {
        rowVirtualizer.value.scrollToIndex(chatStore.messages.length - 1, { align: 'end' });
      }
      const container = scrollContainerRef.value;
      if (container) container.scrollTop = container.scrollHeight;
    }
  },
);

const fpRef = ref<InstanceType<typeof FlatPickr> | null>(null);
const selectedDate = ref<string | null>(null);
const isViewingHistory = ref(false);

const openCalendar = (): void => {
  if (fpRef.value?.fp) {
    fpRef.value.fp.open();
  }
};

const envStore = useEnvStore();

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

    onDayCreate: (_dObj: Date[], _dStr: string, _fp: unknown, dayElem: HTMLElement): void => {
      const targetDateObj = (dayElem as HTMLElement & { dateObj?: Date }).dateObj;
      if (!targetDateObj) return;

      const dateStr = [
        targetDateObj.getFullYear(),
        String(targetDateObj.getMonth() + 1).padStart(2, '0'),
        String(targetDateObj.getDate()).padStart(2, '0'),
      ].join('-');

      if (enabledDates.includes(dateStr)) {
        dayElem.innerHTML += `<span class="event-marker"></span>`;
      }

      const weather = envStore.weatherMap[dateStr];
      const holidayName = envStore.holidayMap[dateStr];

      dayElem.style.position = 'relative';

      if (holidayName) {
        dayElem.innerHTML += `<span title="${holidayName}" style="position:absolute; top:-2px; right:2px; font-size:10px; cursor:help; z-index:10; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));">🎊</span>`;
      }
      if (weather) {
        dayElem.innerHTML += `<span title="${weather.text} ${weather.min}°C~${weather.max}°C" style="position:absolute; bottom:0px; left:2px; font-size:12px; cursor:help; z-index:10; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));">${weather.emoji}</span>`;
      }
    },

    onChange: (selectedDates: Date[], _dateStr: string): void => {
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
            : new Date(`${m.date ?? targetDateStr} 00:00:00`).getTime();
          const diff = Math.abs(mTime - targetTime);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        });

        rowVirtualizer.value.scrollToIndex(closestIndex, { align: 'start' });
      } else {
        const index = chatStore.messages.findIndex(
          (m) => m.date === targetDateStr || m.date?.startsWith(targetDateStr),
        );
        if (index !== -1) rowVirtualizer.value.scrollToIndex(index, { align: 'start' });
      }
    },
  };
});

onMounted(() => {
  triggerScrollPadding();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      void scrollToLatest();
    });
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
