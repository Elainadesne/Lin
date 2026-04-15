<template>
  <div ref="containerRef" class="tabs-container">
    <div
      v-for="tab in visibleTabs"
      :key="tab.index"
      class="tab"
      :class="{
        active: appStore.activeTab === tab.index,
        'is-top-tab': tabStyles[tab.index]?.position === 'top',
        'is-bottom-tab': tabStyles[tab.index]?.position === 'bottom',
      }"
      :style="getStyle(tab.index)"
      :data-index="tab.index"
      @click="handleTabClick(tab.index)"
    >
      {{ tab.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { computed, nextTick, onMounted, ref } from 'vue';

import { useAppStore } from '../../stores/useAppStore';

const appStore = useAppStore();
const containerRef = ref<HTMLElement | null>(null);

const allTabs = [
  { index: 0, label: '📝 诊室' },
  { index: 1, label: '📋 档案' },
  { index: 2, label: '🌿 桌面' },
  { index: 3, label: '⚙️ 设置' },
  { index: 4, label: '🛠️ 调试' },
];

const visibleTabs = computed(() => {
  return allTabs.filter((tab) => tab.index !== 4 || appStore.isDevModeUnlocked);
});

type TabPosition = 'right' | 'top' | 'bottom';
const tabStyles = ref<Record<number, { position: TabPosition; left: string }>>({});

const handleTabClick = (index: number): void => {
  appStore.activeTab = index;
};

const adjustTabs = async (): Promise<void> => {
  await nextTick();
  const notebook = document.querySelector('.notebook');
  const tabElements = containerRef.value?.querySelectorAll<HTMLElement>('.tab');

  if (!notebook || !tabElements) return;

  const notebookRect = notebook.getBoundingClientRect();
  const maxBottom = notebookRect.bottom - 15;
  const maxRight = notebookRect.right - 50;

  const tabsInfo = Array.from(tabElements).map((tabEl) => ({
    el: tabEl,
    index: parseInt(tabEl.getAttribute('data-index') ?? '0'),
    rect: tabEl.getBoundingClientRect(),
    width: tabEl.offsetWidth,
  }));

  let topOffset = 60;
  let bottomOffset = 60;
  let placement: 'right' | 'top' | 'bottom' = 'right';

  const newStyles: Record<number, { position: TabPosition; left: string }> = {};

  tabsInfo.forEach((tab) => {
    let currentLeft = '';

    if (placement === 'right') {
      if (tab.rect.bottom > maxBottom) {
        placement = 'top';
      }
    }

    if (placement === 'top') {
      currentLeft = `${topOffset}px`;
      const estimatedRightEdge = notebookRect.left + topOffset + tab.width;

      if (estimatedRightEdge > maxRight) {
        placement = 'bottom';
        currentLeft = '';
      } else {
        topOffset += tab.width + 8;
      }
    }

    if (placement === 'bottom') {
      currentLeft = `${bottomOffset}px`;
      bottomOffset += tab.width + 8;
    }

    newStyles[tab.index] = { position: placement, left: currentLeft };
  });

  tabStyles.value = newStyles;
};

const getStyle = (index: number): Record<string, string> => {
  const styleObj = tabStyles.value[index];
  if (!styleObj) return {};
  return {
    left: styleObj.left || '',
    top: '',
    bottom: '',
  };
};

onMounted(() => {
  void adjustTabs();

  if (document.fonts) {
    void document.fonts.ready
      .then(() => {
        void adjustTabs();
      })
      .catch((e: unknown) => {
        console.warn('Font loading failed:', e);
      });
  }

  const notebook = document.querySelector<HTMLElement>('.notebook');
  if (notebook) {
    useResizeObserver(notebook, () => {
      requestAnimationFrame(() => {
        void adjustTabs();
      });
    });
  }
});

defineExpose({ adjustTabs });
</script>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1;
  margin-top: 6%;
  margin-left: -15px;
  width: 42px;
}
.tab {
  position: relative;
  transform: translateX(0);
  transition:
    transform 0.6s
      linear(
        0,
        0.311 9.1%,
        0.548 18.2%,
        0.718 27.2%,
        0.824 36.3%,
        0.887 45.4%,
        0.95 55%,
        0.985 64.1%,
        1.01 73.1%,
        1 100%
      ),
    color 0.3s ease;
  will-change: transform;
  cursor: pointer;
  box-shadow:
    -2px 6px 10px rgba(0, 0, 0, 0.15),
    inset 1px 1px 2px rgba(255, 255, 255, 0.5),
    inset -1px -1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 0 12px 12px 0;
  padding: 16px 8px 16px 22px;
  overflow: hidden;
  color: #555;
  font-weight: 800;
  font-size: calc(var(--base-font-size) - 1px);
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
body.use-sys-fonts .tab {
  letter-spacing: 3px !important;
}
.tab::before {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.6;
  mix-blend-mode: multiply;
  background-image: var(--page-noise);
  background-repeat: repeat;
  width: 100%;
  height: 100%;
  pointer-events: none;
  content: '';
}
.tab.active {
  transform: translateX(12px);
  box-shadow:
    -4px 8px 12px rgba(0, 0, 0, 0.2),
    inset 1px 1px 2px rgba(255, 255, 255, 0.6);
  color: #222;
}
.tab[data-index='0'] {
  background: var(--tab-1);
}
.tab[data-index='1'] {
  background: var(--tab-2);
}
.tab[data-index='2'] {
  background: var(--tab-3);
}
.tab[data-index='3'] {
  background: var(--tab-4);
}

.tab.is-top-tab {
  position: absolute;
  top: -46px;
  transform: translateY(18px);
  z-index: 1;
  box-shadow:
    2px -4px 10px var(--shadow-color),
    inset 2px 2px 5px rgba(255, 255, 255, 0.4);
  border-radius: 12px 12px 0 0;
  padding: 12px 20px 35px 20px;
  letter-spacing: 2px;
  writing-mode: horizontal-tb;
  white-space: nowrap;
}
.tab.is-top-tab.active {
  transform: translateY(0);
}

.tab.is-bottom-tab {
  position: absolute;
  top: auto;
  bottom: -46px;
  transform: translateY(-18px);
  z-index: 1;
  box-shadow:
    2px 4px 10px var(--shadow-color),
    inset 2px -2px 5px rgba(255, 255, 255, 0.4);
  border-radius: 0 0 12px 12px;
  padding: 35px 20px 12px 20px;
  letter-spacing: 0px;
  writing-mode: horizontal-tb;
  white-space: nowrap;
}
body.use-sys-fonts .tab.is-bottom-tab {
  letter-spacing: 2px !important;
}
.tab.is-bottom-tab.active {
  transform: translateY(0);
}

#tab-dev {
  background: #e74c3c !important;
  color: white !important;
}
</style>
