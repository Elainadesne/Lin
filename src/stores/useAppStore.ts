import { useMediaQuery, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { onMounted, ref, watch } from 'vue';

import type { GlobalSettings } from '../types';

import { useEnvStore } from './useEnvStore';

export const useAppStore = defineStore('appStore', () => {
  const systemIsDark = useMediaQuery('(prefers-color-scheme: dark)');

  const themeMode = useStorage<'auto' | 'light' | 'dark'>('LinUI_ThemeMode', 'auto');

  const isDark = ref(false);

  const applyTheme = (): void => {
    if (!document.getElementById('lin-theme-transition')) {
      const style = document.createElement('style');
      style.id = 'lin-theme-transition';
      style.innerHTML = 'body { transition: background-color 0.4s ease, color 0.4s ease; }';
      document.head.appendChild(style);
    }

    if (isDark.value) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'THEME_CHANGED', isDark: isDark.value }, '*');
    }
  };

  const evaluateTheme = (): void => {
    if (themeMode.value === 'auto') {
      isDark.value = systemIsDark.value;
    } else {
      isDark.value = themeMode.value === 'dark';
    }
    applyTheme();
  };

  watch([themeMode, systemIsDark], () => {
    evaluateTheme();
  });

  const toggleDark = (): void => {
    isDark.value = !isDark.value;
    applyTheme();
  };

  const settings = useStorage<GlobalSettings>('LinUI_GlobalSettings', {
    vol: 30,
    fontSize: 15,
    turnSpeed: 6,
    autoPlay: true,
    autoOpen: false,
    useSysFont: false,
    syncEnvData: false,
  });

  const activeTab = useStorage('LinUI_ActiveTab', 0);

  if (!settings.value.autoOpen) {
    activeTab.value = -1;
  }

  const isDevModeUnlocked = useStorage('LinUI_DevUnlocked', false);

  const applyCssVariables = (): void => {
    const root = document.documentElement.style;
    root.setProperty(
      '--base-font-size',
      `calc(var(--ui-base-size) + ${settings.value.fontSize - 15}px)`,
    );
    const speed = Math.max(0.2, 2.2 - settings.value.turnSpeed * 0.2).toFixed(2);
    root.setProperty('--turn-speed', `${speed}s`);

    if (settings.value.useSysFont) {
      document.body.classList.add('use-sys-fonts');
    } else {
      document.body.classList.remove('use-sys-fonts');
    }
  };

  watch(
    () => [settings.value.fontSize, settings.value.turnSpeed, settings.value.useSysFont],
    () => {
      applyCssVariables();
    },
    { deep: true },
  );

  onMounted(() => {
    applyCssVariables();
    evaluateTheme();
    if (settings.value.syncEnvData) {
      const envStore = useEnvStore();
      void envStore.syncEnvDataToWorldbook(true);
    }
  });

  const resetSettings = (): void => {
    settings.value = {
      vol: 30,
      fontSize: 15,
      turnSpeed: 6,
      autoPlay: true,
      autoOpen: false,
      useSysFont: false,
      syncEnvData: false,
    };
    themeMode.value = 'auto';
    evaluateTheme();
    const envStore = useEnvStore();
    void envStore.syncEnvDataToWorldbook(false);
  };

  return {
    isDark,
    themeMode,
    toggleDark,
    evaluateTheme,
    settings,
    activeTab,
    isDevModeUnlocked,
    resetSettings,
  };
});
