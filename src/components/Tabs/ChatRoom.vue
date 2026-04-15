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
                ? { '--random-rot': `${(((virtualRow.index * 13.5) % 6) - 3).toFixed(1)}deg` }
                : {}
            "
          >
            <div
              v-html="
                listData[virtualRow.index].parsedHtml ||
                renderMarkdown(listData[virtualRow.index].rawText)
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
import { useResizeObserver, useThrottleFn } from '@vueuse/core';
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
  requestAnimationFrame(() => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  });
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

const updateScrollState = useThrottleFn((): void => {
  if (scrollContainerRef.value) {
    scrollState.value = {
      scrollTop: scrollContainerRef.value.scrollTop,
      clientHeight: scrollContainerRef.value.clientHeight,
      scrollHeight: scrollContainerRef.value.scrollHeight,
    };
    checkPendingTrigger();
  }
}, 100);

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
    void updateScrollState();
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

let isTicking = false;
const handlePointerMove = (e: PointerEvent): void => {
  const track = scrollbarTrackRef.value;
  const container = scrollContainerRef.value;
  if (!isDraggingTimeline.value || !track || !container) return;
  hasDraggedTimeline = true;

  if (!isTicking) {
    window.requestAnimationFrame(() => {
      const trackRect = track.getBoundingClientRect();
      const trackHeight = trackRect.height;
      const pointerY = Math.max(0, Math.min(e.clientY - trackRect.top, trackHeight));
      const percentage = pointerY / trackHeight;
      const maxScrollTop = container.scrollHeight - container.clientHeight;

      container.scrollTop = percentage * maxScrollTop;
      isTicking = false;
    });
    isTicking = true;
  }
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

onMounted(() => {
  const wrapper = document.getElementById('chat-input-wrapper');
  if (wrapper) {
    useResizeObserver(wrapper, (entries) => {
      const entry = entries[0];
      if (entry) {
        const boxHeight =
          entry.borderBoxSize && entry.borderBoxSize.length > 0
            ? entry.borderBoxSize[0].blockSize
            : entry.contentRect.height + 22;

        inputBottomSpace.value = boxHeight + 15;
      }
    });
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
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      void scrollToLatest();
    });
  });
});
</script>

<style scoped>
@keyframes popIn {
  0% {
    transform: scale(0.8) rotate(calc(var(--random-rot, -2deg) + 7deg));
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(var(--random-rot, -2deg));
    opacity: 1;
  }
}

#chat-history {
  position: absolute;
  top: 25px;
  right: 20px;
  bottom: 0px;
  left: 20px;
  z-index: 10;
  padding-bottom: 95px;
  overflow-y: auto;
  scrollbar-width: none;
}
#chat-history::-webkit-scrollbar {
  display: none;
}

.input-wrapper {
  display: flex;
  position: absolute;
  right: 20px;
  bottom: 20px;
  left: 20px;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
  z-index: 60;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.08),
    inset 0 1px 2px rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.65);
  padding: 10px 15px;
  height: auto;
  min-height: 55px;
}
body.dark-mode .input-wrapper {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}
.input-wrapper textarea {
  flex: 1 1 120px;
  margin-right: auto;
  outline: none;
  border: none;
  background: transparent;
  padding: 4px 0;
  min-height: 24px;
  max-height: 100px;
  overflow-y: auto;
  resize: none;
  color: #333;
  font-weight: bold;
  font-size: var(--base-font-size);
  line-height: 1.5;
  font-family: var(--font-user);
}
body.dark-mode .input-wrapper textarea {
  color: #f0f0f0;
}
.send-btn {
  flex-shrink: 0;
  transition:
    transform 0.1s cubic-bezier(0.2, 0, 0, 1),
    box-shadow 0.1s cubic-bezier(0.2, 0, 0, 1);
  will-change: transform;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(231, 76, 60, 0.4);
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tab-1), #c64032);
  width: 40px;
  height: 40px;
  color: #fff;
  font-size: 18px;
}
.send-btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 2px rgba(231, 76, 60, 0.4);
}

.fs-btn {
  flex-shrink: 0;
  opacity: 0.6;
  z-index: 100 !important;
  transition: transform 0.2s;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 30px;
  height: 40px;
  pointer-events: auto !important;
  color: var(--text-main);
  font-size: 22px;
}
.fs-btn:active {
  transform: scale(0.9);
}

@keyframes fluid-blink {
  0%,
  100% {
    transform: scaleY(0.7);
    opacity: 0;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
.glass-btn {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  width: 38px;
  height: 38px;
  color: var(--text-main);
  font-size: 15px;
}
.glass-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.7);
}
.glass-btn:active {
  transform: translateY(1px);
}
.glass-btn-wide {
  flex: 1;
  border-radius: 20px;
  padding: 0 16px;
  width: auto;
  color: #e74c3c;
  font-weight: 800;
  letter-spacing: 1px;
}
body.dark-mode .glass-btn {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #e2e8f0;
}
body.dark-mode .glass-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
body.dark-mode .glass-btn-wide {
  color: #ff9a9a;
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

.input-wrapper.is-pending-item::before {
  position: absolute;
  z-index: -1;
  animation: pulseOpacity 2s infinite alternate ease-in-out;
  will-change: transform, opacity;
  inset: 0;
  border-radius: 16px;
  background: rgba(163, 217, 177, 0.3);
  content: '';
}
@keyframes pulseOpacity {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.02);
    opacity: 1;
  }
}

@keyframes pendingPulseDark {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.02) translateY(-2px);
    opacity: 1;
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

<style>
.user-note::before {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.45);
  width: 35px;
  height: 14px;
  content: '';
}
.ai-msg {
  animation: fadeIn 0.8s ease forwards;
  margin-bottom: 15px;
  color: var(--text-ai);
  font-size: calc(var(--base-font-size) + 1px);
  line-height: 1.6;
}
.user-note {
  position: relative;
  transform: rotate(-2deg);
  transform-origin: top right;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  will-change: transform, opacity;
  margin-inline-start: auto;
  margin-inline-end: 0;
  margin-block: 10px 20px;
  box-shadow:
    3px 5px 12px rgba(0, 0, 0, 0.15),
    inset 1px 1px 2px rgba(255, 255, 255, 0.6);
  border-radius: 2px 12px 12px 12px;
  background: linear-gradient(135deg, #fff9c4 0%, #fbc02d 100%);
  padding: 12px 16px;
  width: max-content;
  max-width: 85%;
  color: #333;
  font-size: var(--base-font-size);
  line-height: 1.5;
  font-family: var(--font-user) !important;
}

.ai-msg p,
.user-note p {
  margin: 0;
  margin-bottom: 8px;
  text-wrap: pretty;
  overflow-wrap: break-word;
}
.ai-msg p:last-child,
.user-note p:last-child {
  margin-bottom: 0;
}
.ai-msg blockquote,
.user-note blockquote {
  margin: 10px 0;
  border-left: 4px solid var(--tab-3);
  border-radius: 0 8px 8px 0;
  background: rgba(163, 217, 177, 0.15);
  padding: 10px 15px;
  color: #555;
}
body.dark-mode .ai-msg blockquote {
  background: rgba(163, 217, 177, 0.08);
  color: #cfe4ff;
}
.ai-msg blockquote p,
.user-note blockquote p {
  margin-bottom: 5px;
}
.ai-msg blockquote p:last-child {
  margin-bottom: 0;
}
.ai-msg pre,
.user-note pre {
  margin: 10px 0;
  border-radius: 8px;
  background: #282c34;
  padding: 12px;
  overflow-x: auto;
  color: #abb2bf;
  font-size: calc(var(--base-font-size) - 2px);
  font-family: 'Courier New', Courier, monospace;
}
.ai-msg code,
.user-note code {
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 5px;
  color: #e74c3c;
  font-family: 'Courier New', Courier, monospace;
}
body.dark-mode .ai-msg code {
  background: rgba(255, 255, 255, 0.1);
  color: #da8282;
}
.ai-msg pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}
.ai-msg table {
  margin: 10px 0;
  border-collapse: collapse;
  width: 100%;
  font-size: calc(var(--base-font-size) - 1px);
}
.ai-msg th,
.ai-msg td {
  border: 1px solid var(--border-light);
  padding: 8px 12px;
  text-align: left;
}
.ai-msg th {
  background: rgba(0, 0, 0, 0.03);
  font-weight: bold;
}
body.dark-mode .ai-msg th {
  background: rgba(255, 255, 255, 0.05);
}
.ai-msg ul input[type='checkbox'] {
  margin-right: 6px;
  accent-color: #4d6954;
}
body.dark-mode .ai-msg ul input[type='checkbox'] {
  margin-right: 6px;
  accent-color: #293a2d;
}
.ai-msg del {
  color: #6d6d6d;
}
body.dark-mode .ai-msg del {
  color: #e3e3e3;
}
.ai-msg ul,
.ai-msg ol,
.user-note ul,
.user-note ol {
  margin: 10px 0;
  padding-left: 24px;
}
.ai-msg ul ul,
.ai-msg ul ol,
.user-note ol ul,
.user-note ol ol {
  margin: 0;
}
.ai-msg li,
.user-note li {
  margin-bottom: 6px;
}
.ai-msg li:last-child,
.user-note li:last-child {
  margin-bottom: 0;
}
.ai-msg li:has(input[type='checkbox']),
.user-note li:has(input[type='checkbox']) {
  margin-left: -24px;
  list-style: none;
}

.msg-narration {
  color: #566378 !important;
  font-size: var(--base-font-size) !important;
  font-family: var(--font-narration) !important;
  letter-spacing: 0.5px !important;
}
body.dark-mode .msg-narration {
  color: #e4effe !important;
}
span.msg-lin {
  color: #0f3057 !important;
  font-size: calc(var(--base-font-size) + 6px) !important;
  font-family: var(--font-lin) !important;
  letter-spacing: 0px !important;
  text-shadow: 0px 0px 1px rgba(15, 48, 87, 0.3) !important;
}
body.dark-mode span.msg-lin {
  color: #ebedfc !important;
  text-shadow: 0px 0px 1px rgba(168, 192, 234, 0.3) !important;
}
span.msg-qin {
  color: #1a1a1a !important;
  font-size: calc(var(--base-font-size) + 5px) !important;
  font-family: var(--font-qin) !important;
  letter-spacing: 1px !important;
  text-shadow:
    1px 1px 2px rgba(0, 0, 0, 0.3),
    0 0 1px rgba(0, 0, 0, 0.5) !important;
}
body.dark-mode span.msg-qin {
  color: #eeeeee !important;
}
span.msg-children {
  background: linear-gradient(
    110deg,
    #b6303b 0%,
    #8a5701 33%,
    #14713a 66%,
    #1263b3 100%
  ) !important;
  background-size: 100% 100% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  font-weight: bold !important;
  font-size: calc(var(--base-font-size) + 6px) !important;
  font-family: var(--font-children) !important;
  letter-spacing: 1px !important;
  -webkit-text-fill-color: transparent !important;
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.15)) !important;
  color: transparent !important;
}
body.dark-mode span.msg-children {
  background: linear-gradient(110deg, #ffd5ff, #fcd6ff, #6eff99, #5ef7ff) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
}

.typing-cursor {
  display: inline-block;
  vertical-align: text-bottom;
  animation: fluid-blink 1s infinite cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 4px;
  border-radius: 3px;
  background: linear-gradient(to bottom, var(--tab-3), var(--tab-4));
  width: 5px;
  height: calc(var(--base-font-size) + 2px);
}

.flatpickr-calendar {
  position: absolute;
  transform: translateY(-10px);
  visibility: hidden;
  opacity: 0;
  z-index: 99999;
  backdrop-filter: blur(16px) saturate(120%);
  transition:
    opacity 0.3s cubic-bezier(0.2, 0, 0, 1),
    transform 0.3s cubic-bezier(0.2, 0, 0, 1),
    visibility 0s 0.3s;
  box-sizing: border-box;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  background: rgba(245, 245, 245, 0.95);
  padding: 12px;
  width: 320px;
  font-family: var(--font-user);
}
.flatpickr-calendar.open,
.flatpickr-calendar.inline {
  transform: translateY(0);
  visibility: visible;
  opacity: 1;
  transition:
    opacity 0.3s cubic-bezier(0.2, 0, 0, 1),
    transform 0.3s cubic-bezier(0.2, 0, 0, 1);
}
body.dark-mode .flatpickr-calendar {
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(40, 42, 54, 0.95);
}
@supports (backdrop-filter: blur(16px)) {
  .flatpickr-calendar {
    background: rgba(255, 255, 255, 0.35);
  }
  body.dark-mode .flatpickr-calendar {
    background: rgba(20, 20, 20, 0.5);
  }
}
.flatpickr-calendar.arrowTop::before,
.flatpickr-calendar.arrowTop::after,
.flatpickr-calendar.arrowBottom::before,
.flatpickr-calendar.arrowBottom::after {
  display: none;
}
.flatpickr-months {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}
.flatpickr-prev-month,
.flatpickr-next-month {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  cursor: pointer;
  padding: 5px;
}
.flatpickr-prev-month {
  left: 5px;
}
.flatpickr-next-month {
  right: 5px;
}
.flatpickr-prev-month svg,
.flatpickr-next-month svg {
  transition: fill 0.2s;
  fill: var(--text-ai);
  width: 14px;
  height: 14px;
}
body.dark-mode .flatpickr-prev-month svg,
body.dark-mode .flatpickr-next-month svg {
  fill: #e2e8f0;
}
.flatpickr-prev-month:hover svg,
.flatpickr-next-month:hover svg {
  fill: var(--tab-3);
}
.flatpickr-month {
  display: flex;
  flex: 1;
  justify-content: center;
}
.flatpickr-current-month {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-ai);
  font-weight: 800;
  font-size: 16px;
  line-height: 1;
}
body.dark-mode .flatpickr-current-month {
  color: #e2e8f0;
}
.flatpickr-monthDropdown-months {
  appearance: none;
  transition: background 0.2s;
  cursor: pointer;
  outline: none;
  border: none;
  background: transparent;
  padding-right: 5px;
  color: inherit;
  font-weight: inherit;
  font-size: inherit;
  font-family: inherit;
}
.flatpickr-monthDropdown-months:hover {
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
}
body.dark-mode .flatpickr-monthDropdown-months:hover {
  background: rgba(255, 255, 255, 0.05);
}
.numInputWrapper {
  display: flex;
  position: relative;
  align-items: center;
  height: auto;
}
.numInputWrapper input {
  transition: background 0.2s;
  cursor: pointer;
  outline: none;
  border: none;
  background: transparent;
  width: 5ch;
  color: inherit;
  font-weight: inherit;
  font-size: inherit;
  font-family: inherit;
  text-align: center;
}
.numInputWrapper input:hover {
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
}
body.dark-mode .numInputWrapper input:hover {
  background: rgba(255, 255, 255, 0.05);
}
.numInputWrapper input::-webkit-outer-spin-button,
.numInputWrapper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.numInputWrapper span {
  display: none;
}
.flatpickr-weekdays {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
  text-align: center;
}
.flatpickr-weekdaycontainer {
  display: flex;
  flex: 1;
}
.flatpickr-weekday {
  flex: 1;
  opacity: 0.6;
  color: var(--text-main);
  font-weight: bold;
  font-size: 12px;
}
body.dark-mode .flatpickr-weekday {
  color: #cbd5e1;
}
.flatpickr-days {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
.dayContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 4px 0;
  width: 100%;
}
.flatpickr-day {
  display: flex;
  position: relative;
  flex-basis: 14.2857%;
  justify-content: center;
  align-items: center;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  max-width: 14.2857%;
  height: 38px;
  color: var(--text-main);
  font-weight: bold;
}
body.dark-mode .flatpickr-day {
  color: #e2e8f0;
}
.flatpickr-day.prevMonthDay,
.flatpickr-day.nextMonthDay {
  opacity: 0.3;
  font-weight: normal;
}
.flatpickr-day.disabled,
.flatpickr-day.disabled:hover {
  transform: none;
  opacity: 0.15;
  cursor: not-allowed;
  box-shadow: none;
  border-color: transparent;
  background: transparent;
}
.flatpickr-day:hover:not(.disabled) {
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.6);
}
body.dark-mode .flatpickr-day:hover:not(.disabled) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
}
.flatpickr-day.selected {
  transform: scale(1.1);
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #fff;
  background: rgba(255, 255, 255, 0.9);
  color: #c64032;
  font-weight: 900;
}
body.dark-mode .flatpickr-day.selected {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.6);
  color: #ff9a9a;
}
.flatpickr-day.today {
  border-color: rgba(0, 0, 0, 0.2);
}
body.dark-mode .flatpickr-day.today {
  border-color: rgba(255, 255, 255, 0.2);
}
.flatpickr-time {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 10px;
  height: 40px;
}
body.dark-mode .flatpickr-time {
  border-top-color: rgba(255, 255, 255, 0.05);
}
.flatpickr-time .numInputWrapper {
  display: flex;
  flex: 1;
  height: 100%;
}
.flatpickr-time input {
  flex: 1;
  transition: background 0.2s;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: transparent;
  padding: 0;
  color: var(--text-main);
  font-weight: bold;
  font-size: 16px;
  font-family: var(--font-user);
  text-align: center;
}
body.dark-mode .flatpickr-time input {
  color: #e2e8f0;
}
.flatpickr-time input:hover,
.flatpickr-time input:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.05);
}
body.dark-mode .flatpickr-time input:hover,
body.dark-mode .flatpickr-time input:focus {
  background: rgba(255, 255, 255, 0.1);
}
.flatpickr-time-separator {
  display: flex;
  align-items: center;
  color: var(--text-main);
  font-weight: bold;
  font-size: 16px;
}
body.dark-mode .flatpickr-time-separator {
  color: #e2e8f0;
}
.flatpickr-am-pm {
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s;
  cursor: pointer;
  border-radius: 8px;
  padding: 0 8px;
  color: var(--text-main);
  font-weight: bold;
}
body.dark-mode .flatpickr-am-pm {
  color: #e2e8f0;
}
.flatpickr-am-pm:hover,
.flatpickr-am-pm:focus {
  outline: none;
  background: rgba(0, 0, 0, 0.05);
}
body.dark-mode .flatpickr-am-pm:hover,
body.dark-mode .flatpickr-am-pm:focus {
  background: rgba(255, 255, 255, 0.1);
}

.event-marker {
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
body.dark-mode .event-marker {
  background-color: #ff9a9a;
}
</style>
