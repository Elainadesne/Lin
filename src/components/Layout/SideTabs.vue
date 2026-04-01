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

  let topOffset = 60;
  let bottomOffset = 60;
  let placement: 'right' | 'top' | 'bottom' = 'right';

  const newStyles: Record<number, { position: TabPosition; left: string }> = {};

  tabElements.forEach((tabEl) => {
    tabEl.classList.remove('is-top-tab', 'is-bottom-tab');
    tabEl.style.left = '';

    const index = parseInt(tabEl.getAttribute('data-index') ?? '0');
    let currentLeft = '';

    if (placement === 'right') {
      if (tabEl.getBoundingClientRect().bottom > maxBottom) {
        placement = 'top';
      }
    }

    if (placement === 'top') {
      currentLeft = `${topOffset}px`;
      tabEl.style.left = currentLeft;
      tabEl.classList.add('is-top-tab');

      const currentRightEdge = tabEl.getBoundingClientRect().right;

      if (currentRightEdge > maxRight) {
        tabEl.classList.remove('is-top-tab');
        tabEl.style.left = '';
        placement = 'bottom';
      } else {
        topOffset += tabEl.getBoundingClientRect().width + 8;
      }
    }

    if (placement === 'bottom') {
      currentLeft = `${bottomOffset}px`;
      tabEl.style.left = currentLeft;
      tabEl.classList.add('is-bottom-tab');
      bottomOffset += tabEl.getBoundingClientRect().width + 8;
    }

    newStyles[index] = { position: placement, left: currentLeft };
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

<style scoped></style>
