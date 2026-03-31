import { useMediaQuery, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { onMounted, ref, watch } from 'vue';
import type { GlobalSettings } from '../types';
import { useEnvStore } from './useEnvStore';

export const useAppStore = defineStore('appStore', () => {
  const systemIsDark = useMediaQuery('(prefers-color-scheme: dark)');

  const themeMode = useStorage<'auto' | 'light' | 'dark'>('LinUI_ThemeMode', 'auto');

  const isDark = ref(false);

  const applyTheme = () => {
    if (isDark.value) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const evaluateTheme = () => {
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

  const toggleDark = () => {
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

  const activeTab = useStorage<number>('LinUI_ActiveTab', 0);

  if (!settings.value.autoOpen) {
    activeTab.value = -1;
  }

  const isDevModeUnlocked = useStorage<boolean>('LinUI_DevUnlocked', false);

  const applyCssVariables = () => {
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
      envStore.syncEnvDataToWorldbook(true);
    }
  });

  const resetSettings = () => {
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
    envStore.syncEnvDataToWorldbook(false);
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
