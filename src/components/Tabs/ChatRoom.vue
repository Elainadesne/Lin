<template>
  <div class="chat-room-container">
    <div
      id="chat-history-container"
      ref="scrollContainerRef"
      class="chat-history"
      @scroll="updateScrollState"
    >
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
            <div v-html="renderMarkdown(listData[virtualRow.index].rawText)"></div>
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

    <div
      v-if="listData.length > 0"
      ref="timelineContainerRef"
      class="prompt-scrollbar-container"
      :style="{ bottom: `${inputBottomSpace}px` }"
      @mouseleave="hoveredTimelineIndex = null"
      @blur="hoveredTimelineIndex = null"
    >
      <div
        ref="scrollbarTrackRef"
        class="scrollbar-track"
        :class="{ 'is-dragging': isDraggingTimeline }"
        @pointerdown="handlePointerDown"
      >
        <div class="scrollbar-line"></div>

        <div class="scrollbar-handle" :style="scrollbarHandleStyle"></div>

        <div
          v-if="hoveredTimelineIndex !== null"
          class="timeline-tooltip"
          :style="{ top: `${timelineItems[hoveredTimelineIndex].topPercent}%` }"
        >
          <div class="tooltip-arrow"></div>
          <span class="tooltip-role">
            {{ timelineItems[hoveredTimelineIndex].role === 'ai' ? 'Model' : 'User' }} </span
          >:
          {{ timelineItems[hoveredTimelineIndex].preview }}
        </div>

        <div
          v-for="item in timelineItems"
          :key="item.index"
          class="prompt-scrollbar-item"
          :style="{ top: `${item.topPercent}%` }"
        >
          <button
            class="prompt-scrollbar-btn"
            :aria-label="'Jump to message ' + (item.index + 1)"
            @click="scrollToMessage(item.index)"
            @mouseenter="hoveredTimelineIndex = item.index"
            @focus="hoveredTimelineIndex = item.index"
            @mouseleave="hoveredTimelineIndex = null"
            @blur="hoveredTimelineIndex = null"
          >
            <div
              class="prompt-scrollbar-dot"
              :class="[item.role, { 'is-visible': visibleIndexes.has(item.index) }]"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <div
      id="chat-input-wrapper"
      class="input-wrapper"
      :class="{
        'is-pending-item': messageSync.pendingTarot.value || messageSync.pendingScaleId.value,
      }"
    >
      <div style="position: relative; width: 38px; height: 38px">
        <button
          class="glass-btn"
          title="历史检索"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2"
          @click="openCalendar"
        >
          📅
        </button>
        <flat-pickr
          ref="fpRef"
          v-model="selectedDate"
          :config="fpConfig"
          class="hidden-fp-input"
          aria-label="选择历史聊天日期"
        />
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
import { useMessageSync } from '../../composables/useMessageSync';
import { useChatStore } from '../../stores/useChatStore';
import { useEnvStore } from '../../stores/useEnvStore';

const chatStore = useChatStore();
const messageSync = useMessageSync();
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
  if (newVal !== chatStore.syncedInputText) {
    chatStore.syncInputToHost(newVal);
  }
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

  if (messageSync.pendingTarot.value || messageSync.pendingScaleId.value) {
    let skipMsg = '';
    if (messageSync.pendingTarot.value)
      skipMsg = '系统提示：来访者没有理会桌上的塔罗牌，直接继续了对话。';
    if (messageSync.pendingScaleId.value)
      skipMsg = '系统提示：来访者没有理会递过来的量表，直接继续了对话。';

    chatStore.addTempPromptToHost(skipMsg);

    messageSync.pendingTarot.value = false;
    messageSync.pendingScaleId.value = null;
  }

  chatStore.sendMessageToHost(inputText.value.trim());
  void nextTick(() => {
    void scrollToLatest();
  });
};

const inputBottomSpace = ref(120);
const scrollContainerRef = ref<HTMLElement | null>(null);

const listData = computed(() => chatStore.messages);

const scrollState = ref({ scrollTop: 0, clientHeight: 0, scrollHeight: 0 });

const checkPendingTrigger = (): void => {
  const { scrollTop, clientHeight, scrollHeight } = scrollState.value;
  if (scrollHeight > 0 && scrollTop + clientHeight >= scrollHeight - 50) {
    if (messageSync.pendingTarot.value) {
      messageSync.pendingTarot.value = false;
      messageSync.triggerTarot.value = true;
    }
    if (messageSync.pendingScaleId.value) {
      messageSync.activeScaleId.value = messageSync.pendingScaleId.value;
      messageSync.pendingScaleId.value = null;
    }
  }
};

const updateScrollState = (): void => {
  if (scrollContainerRef.value) {
    scrollState.value = {
      scrollTop: scrollContainerRef.value.scrollTop,
      clientHeight: scrollContainerRef.value.clientHeight,
      scrollHeight: scrollContainerRef.value.scrollHeight,
    };
    checkPendingTrigger();
  }
};

watch(
  () => messageSync.pendingTarot.value,
  (val) => {
    if (val) void nextTick(checkPendingTrigger);
  },
);
watch(
  () => messageSync.pendingScaleId.value,
  (val) => {
    if (val) void nextTick(checkPendingTrigger);
  },
);

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: listData.value.length,
    getScrollElement: (): HTMLElement | null => scrollContainerRef.value,
    estimateSize: (): number => 120,
    overscan: 1,
    onChange: updateScrollState,
  })),
);

watch(
  () => listData.value.length,
  async () => {
    await nextTick();
    updateScrollState();
  },
);

const getPreviewText = (rawText: string): string => {
  if (!rawText) return '';
  const html = renderMarkdown(rawText);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent || '';
  return text.slice(0, 50) + (text.length > 50 ? '...' : '');
};

const timelineContainerRef = ref<HTMLElement | null>(null);
const scrollbarTrackRef = ref<HTMLElement | null>(null);
const hoveredTimelineIndex = ref<number | null>(null);

interface TimelineItem {
  index: number;
  role: string;
  preview: string;
  topPercent: number;
}

const timelineItems = computed((): TimelineItem[] => {
  const totalItems = listData.value.length;
  if (totalItems === 0) return [];

  let totalWeight = 0;
  const weights = listData.value.map((msg) => {
    const textLength = msg.rawText?.length || 0;
    const weight = 120 + textLength * 0.5;
    totalWeight += weight;
    return weight;
  });

  let currentTop = 0;
  return listData.value.map((msg, index) => {
    const centerOffset = currentTop + weights[index] / 2;
    const percentage = totalWeight === 0 ? 0 : (centerOffset / totalWeight) * 100;
    currentTop += weights[index];

    return {
      index,
      role: msg.role || 'user',
      preview: getPreviewText(msg.rawText),
      topPercent: percentage,
    };
  });
});

const visibleIndexes = computed((): Set<number> => {
  const { scrollTop, clientHeight } = scrollState.value;
  const items = rowVirtualizer.value.getVirtualItems();

  return new Set(
    items
      .filter((item) => {
        return item.end > scrollTop && item.start < scrollTop + clientHeight;
      })
      .map((item) => item.index),
  );
});

const scrollbarHandleStyle = computed(() => {
  const { scrollTop, clientHeight, scrollHeight } = scrollState.value;
  if (scrollHeight === 0) return { display: 'none' };

  const top = (scrollTop / scrollHeight) * 100;
  const height = (clientHeight / scrollHeight) * 100;

  return {
    top: `${top}%`,
    height: `${height}%`,
  };
});

const isDraggingTimeline = ref(false);
let hasDraggedTimeline = false;

const handlePointerDown = (e: PointerEvent): void => {
  if (e.button !== 0) return;

  if ((e.target as HTMLElement).closest('.prompt-scrollbar-btn')) {
    return;
  }

  e.preventDefault();
  isDraggingTimeline.value = true;
  hasDraggedTimeline = false;

  document.addEventListener('pointermove', handlePointerMove);
  document.addEventListener('pointerup', handlePointerUp);
  document.addEventListener('pointercancel', handlePointerUp);

  handlePointerMove(e);
};

const handlePointerMove = (e: PointerEvent): void => {
  if (!isDraggingTimeline.value || !scrollbarTrackRef.value || !scrollContainerRef.value) return;
  hasDraggedTimeline = true;

  const trackRect = scrollbarTrackRef.value.getBoundingClientRect();
  const trackHeight = trackRect.height;

  const pointerY = Math.max(0, Math.min(e.clientY - trackRect.top, trackHeight));

  const percentage = pointerY / trackHeight;

  const scrollContainer = scrollContainerRef.value;
  const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;

  scrollContainer.scrollTop = percentage * maxScrollTop;
};

const handlePointerUp = (): void => {
  isDraggingTimeline.value = false;
  document.removeEventListener('pointermove', handlePointerMove);
  document.removeEventListener('pointerup', handlePointerUp);
  document.removeEventListener('pointercancel', handlePointerUp);

  setTimeout(() => {
    hasDraggedTimeline = false;
  }, 50);
};

const scrollToMessage = (index: number): void => {
  if (hasDraggedTimeline) return;
  rowVirtualizer.value.scrollToIndex(index, { align: 'start' });
};

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
    if (isViewingHistory.value) return;

    const container = scrollContainerRef.value;
    let isNearBottom = true;
    if (container) {
      isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    }

    await nextTick();

    if (isNearBottom && container) {
      if (chatStore.messages.length > 0) {
        rowVirtualizer.value.scrollToIndex(chatStore.messages.length - 1, { align: 'end' });
      }
      container.scrollTop = container.scrollHeight;
      const timeline = timelineContainerRef.value;
      if (timeline) timeline.scrollTop = timeline.scrollHeight;
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

      dayElem.style.position = 'relative';

      if (enabledDates.includes(dateStr)) {
        dayElem.innerHTML += `<span class="event-marker"></span>`;
      }

      const weather = envStore.weatherMap[dateStr];
      const holidayName = envStore.holidayMap[dateStr];

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
  right: 35px;
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

:deep(.event-marker) {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  background-color: #e74c3c;
  width: 5px;
  height: 5px;
  pointer-events: none;
}
body.dark-mode :deep(.event-marker) {
  background-color: #ff9a9a;
}

.prompt-scrollbar-container {
  position: absolute;
  top: 25px;
  right: 5px;
  z-index: 20;
  width: 24px;
  overflow: visible;
}

.scrollbar-track {
  position: relative;
  cursor: grab;
  width: 100%;
  height: 100%;
  touch-action: none;
  user-select: none;
}

.scrollbar-track.is-dragging {
  cursor: grabbing;
}

.scrollbar-track.is-dragging .prompt-scrollbar-btn {
  pointer-events: none;
}

.scrollbar-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 0;
  border-radius: 2px;
  background-color: rgba(150, 150, 150, 0.2);
  width: 2px;
}

.scrollbar-handle {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  border-radius: 8px;
  background-color: rgba(150, 150, 150, 0.3);
  width: 16px;
  pointer-events: none;
}
body.dark-mode .scrollbar-handle {
  background-color: rgba(255, 255, 255, 0.2);
}

.prompt-scrollbar-item {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.prompt-scrollbar-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  outline: none;
  border: none;
  background: transparent;
  padding: 6px;
}

.prompt-scrollbar-btn:focus-visible .prompt-scrollbar-dot {
  outline: 2px solid #4facfe;
  outline-offset: 2px;
}

.prompt-scrollbar-dot {
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  background-color: var(--tab-1);
  width: 6px;
  height: 6px;
}

.prompt-scrollbar-dot.ai {
  background-color: #bdc3c7;
}
.prompt-scrollbar-dot.user {
  background-color: #fbc02d;
}
body.dark-mode .prompt-scrollbar-dot.ai {
  background-color: #777;
}

.prompt-scrollbar-dot.is-visible {
  transform: scale(1.6);
  box-shadow: 0 0 0 2px rgba(79, 172, 254, 0.3);
  background-color: #4facfe;
}
.prompt-scrollbar-dot.user.is-visible {
  box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.3);
  background-color: #f39c12;
}

.prompt-scrollbar-btn:hover .prompt-scrollbar-dot {
  transform: scale(2);
  box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.4) !important;
  background-color: #2ecc71 !important;
}
.input-wrapper.is-pending-item {
  animation: pendingPulseLight 2s infinite alternate ease-in-out;
  box-shadow:
    0 0 15px rgba(163, 217, 177, 0.6),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  border-color: var(--tab-3);
}
.input-wrapper.is-pending-item textarea {
  color: #2a5a3b;
}
.input-wrapper.is-pending-item textarea::placeholder {
  color: #7b9c87;
}

body.dark-mode .input-wrapper.is-pending-item {
  animation: pendingPulseDark 2s infinite alternate ease-in-out;
  box-shadow: 0 0 15px rgba(163, 217, 177, 0.3);
}
body.dark-mode .input-wrapper.is-pending-item textarea {
  color: #a3d9b1;
}

@keyframes pendingPulseLight {
  0% {
    transform: scale(1);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.65);
  }
  100% {
    transform: scale(1.02) translateY(-2px);
    border-radius: 12px;
    background: rgba(230, 250, 235, 0.95);
  }
}

@keyframes pendingPulseDark {
  0% {
    transform: scale(1);
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: scale(1.02) translateY(-2px);
    border-radius: 12px;
    background: rgba(30, 50, 40, 0.8);
  }
}
.timeline-tooltip {
  display: -webkit-box;
  position: absolute;
  right: 32px;
  transform: translateY(-50%);
  z-index: 30;
  backdrop-filter: blur(8px);
  animation: fadeInRight 0.2s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background-color: rgba(30, 30, 30, 0.85);
  padding: 8px 12px;
  width: max-content;
  max-width: 220px;
  line-clamp: 3;
  pointer-events: none;
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}

body.dark-mode .timeline-tooltip {
  background-color: rgba(220, 220, 220, 0.9);
  color: #222;
}

.tooltip-role {
  color: #4facfe;
  font-weight: 600;
}
body.dark-mode .tooltip-role {
  color: #0078d7;
}

.tooltip-arrow {
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 5px solid rgba(30, 30, 30, 0.85);
  width: 0;
  height: 0;
}
body.dark-mode .tooltip-arrow {
  border-left: 5px solid rgba(220, 220, 220, 0.9);
}

@keyframes fadeInRight {
  from {
    transform: translate(-10px, -50%);
    opacity: 0;
  }
  to {
    transform: translate(0, -50%);
    opacity: 1;
  }
}
</style>
