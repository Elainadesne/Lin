<template>
  <div class="archive-title">系统偏好 ⚙️</div>

  <div class="setting-item" style="margin-top: 15px">
    <label>主题外观</label>
    <div class="theme-selector">
      <label class="theme-radio" :class="{ active: appStore.themeMode === 'light' }">
        <input v-model="appStore.themeMode" type="radio" value="light" name="themeMode" />
        <span>☀️ 浅色</span>
      </label>
      <label class="theme-radio" :class="{ active: appStore.themeMode === 'dark' }">
        <input v-model="appStore.themeMode" type="radio" value="dark" name="themeMode" />
        <span>🌙 深色</span>
      </label>
      <label class="theme-radio" :class="{ active: appStore.themeMode === 'auto' }">
        <input v-model="appStore.themeMode" type="radio" value="auto" name="themeMode" />
        <span>💻 跟随系统</span>
      </label>
    </div>
  </div>

  <div class="setting-item">
    <label>字体大小 (Aa)</label>
    <div class="slider-with-input">
      <input
        v-model.number="appStore.settings.fontSize"
        type="range"
        min="12"
        max="24"
        aria-label="调整字体大小滑动条"
      />
      <input
        v-model.number="appStore.settings.fontSize"
        type="number"
        min="12"
        max="24"
        class="num-input"
        aria-label="字体大小输入框"
      />
    </div>
  </div>

  <div class="setting-item">
    <label>翻页速度 📖</label>
    <div class="slider-with-input">
      <input
        v-model.number="appStore.settings.turnSpeed"
        type="range"
        min="1"
        max="10"
        aria-label="调整翻页速度滑动条"
      />
      <input
        v-model.number="appStore.settings.turnSpeed"
        type="number"
        min="1"
        max="10"
        class="num-input"
        aria-label="翻页速度输入框"
      />
    </div>
  </div>

  <div class="setting-item">
    <label>音乐音量 🎵</label>
    <div class="slider-with-input">
      <input
        v-model.number="appStore.settings.vol"
        type="range"
        min="0"
        max="100"
        aria-label="调整音乐音量滑动条"
      />
      <input
        v-model.number="appStore.settings.vol"
        type="number"
        min="0"
        max="100"
        class="num-input"
        aria-label="音乐音量输入框"
      />
    </div>
  </div>

  <div class="setting-item setting-row">
    <label>背景音乐自动播放</label>
    <label class="switch">
      <input
        v-model="appStore.settings.autoPlay"
        type="checkbox"
        aria-label="开关：背景音乐自动播放"
      />
      <span class="slider"></span>
    </label>
  </div>

  <div class="setting-item setting-row">
    <label>同步天气与节假日 (开启需定位)</label>
    <label class="switch">
      <input
        v-model="appStore.settings.syncEnvData"
        type="checkbox"
        aria-label="开关：同步天气与节假日"
        @change="handleEnvSyncChange"
      />
      <span class="slider"></span>
    </label>
  </div>

  <div class="setting-item setting-row">
    <label>启动时自动翻开</label>
    <label class="switch">
      <input
        v-model="appStore.settings.autoOpen"
        type="checkbox"
        aria-label="开关：启动时自动翻开"
      />
      <span class="slider"></span>
    </label>
  </div>

  <div class="setting-item setting-row">
    <label>全部使用系统字体</label>
    <label class="switch">
      <input
        v-model="appStore.settings.useSysFont"
        type="checkbox"
        aria-label="开关：全部使用系统字体"
      />
      <span class="slider"></span>
    </label>
  </div>

  <button class="reset-btn" @click="handleReset">恢复默认设置</button>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore';
import { useEnvStore } from '../../stores/useEnvStore';

const appStore = useAppStore();
const envStore = useEnvStore();

const handleEnvSyncChange = async (): Promise<void> => {
  try {
    await envStore.syncEnvDataToWorldbook(appStore.settings.syncEnvData);
  } catch {
    appStore.settings.syncEnvData = false;
  }
};

const handleReset = (): void => {
  if (confirm('确定要恢复所有系统设置为默认值吗？')) {
    appStore.resetSettings();
  }
};
</script>

<style scoped>
.slider-with-input {
  display: flex;
  align-items: center;
  gap: 15px;
}

.slider-with-input input[type='range'] {
  flex: 1;
}

.num-input {
  transition: all 0.2s;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-light);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.4);
  padding: 4px 6px;
  width: 55px;
  color: var(--text-ai);
  font-weight: 800;
  font-size: calc(var(--base-font-size) - 1px);
  font-family: var(--font-user);
  text-align: center;
}

.num-input:focus {
  border-color: var(--tab-3);
  background: rgba(255, 255, 255, 0.8);
}

body.dark-mode .num-input {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: #e2e8f0;
}
body.dark-mode .num-input:focus {
  background: rgba(0, 0, 0, 0.4);
}

.num-input::-webkit-outer-spin-button,
.num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.num-input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.theme-selector {
  display: flex;
  align-items: stretch;
  gap: 10px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  padding: 6px;
  height: 46px;
}

body.dark-mode .theme-selector {
  background: rgba(255, 255, 255, 0.03);
}

.theme-radio {
  display: flex !important;
  flex: 1;
  justify-content: center !important;
  align-items: center !important;
  opacity: 0.6;
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 0;
  border-radius: 8px;
  padding: 0 !important;
  height: 100%;
  overflow: hidden;
  color: var(--text-main);
  font-weight: 800;
  font-size: calc(var(--base-font-size) - 2px);
  line-height: normal;
}

.theme-radio input {
  display: none;
}

.theme-radio.active {
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff;
  color: var(--text-ai);
}

body.dark-mode .theme-radio.active {
  background: var(--tab-3);
  color: #1a1a1a;
}

.setting-item {
  margin-top: 35px;
}
.setting-item label {
  display: block;
  margin-bottom: 15px;
  color: var(--text-main);
  font-weight: 800;
  font-size: 15px;
}
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  outline: none;
  box-shadow: inset 1px 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: #e1e8e5;
  width: 100%;
  height: 12px;
  touch-action: pan-y;
}
body.dark-mode input[type='range'] {
  box-shadow: inset 1px 2px 5px rgba(0, 0, 0, 0.3);
  background: #3b4252;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  transition: none;
  will-change: transform;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  border: 3px solid var(--tab-4);
  border-radius: 50%;
  background: #fff;
  width: 28px;
  height: 28px;
}
input[type='range']::-webkit-slider-thumb:active {
  transform: scale(1.15);
}

.reset-btn {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  margin-top: 40px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid var(--tab-1);
  border-radius: 20px;
  background: var(--card-bg);
  padding: 12px 24px;
  width: 100%;
  color: var(--text-main);
  font-weight: 800;
  font-size: 14px;
  font-family: var(--font-ui-sans);
}
.reset-btn:active {
  transform: scale(0.96);
}
body.dark-mode .reset-btn {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: #f0f0f0;
}

.switch {
  display: inline-block;
  position: relative;
  width: 50px;
  height: 26px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  margin-bottom: 0 !important;
}
.switch input {
  position: absolute;
  opacity: 0;
  margin: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transition: 0.4s;
  cursor: pointer;
  border-radius: 34px;
  background-color: #ccc;
}
body.dark-mode .slider {
  background-color: #555;
}
.slider:before {
  position: absolute;
  bottom: 4px;
  left: 4px;
  transition: 0.4s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  background-color: white;
  width: 18px;
  height: 18px;
  content: '';
}
input:checked + .slider {
  transition:
    0.4s,
    background-color 0.8s ease;
  background-color: var(--player-theme, #bdc7b9);
}
input:checked + .slider:before {
  transform: translateX(24px);
}

.setting-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 18px !important;
  width: 100%;
}
.setting-row:last-child {
  margin-bottom: 0 !important;
}

label.switch {
  display: inline-block !important;
  flex-shrink: 0;
  margin-bottom: 0 !important;
}

.setting-row > label:not(.switch) {
  display: inline-block !important;
  flex: 1;
  margin-bottom: 0 !important;
}
</style>
