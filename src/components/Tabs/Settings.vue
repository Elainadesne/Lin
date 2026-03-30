<template>
  <div class="archive-title">系统偏好 ⚙️</div>

  <div class="setting-item" style="margin-top: 15px">
    <label>主题外观</label>
    <div class="theme-selector">
      <label class="theme-radio" :class="{ active: appStore.themeMode === 'light' }">
        <input type="radio" value="light" v-model="appStore.themeMode" name="themeMode" />
        <span>☀️ 浅色</span>
      </label>
      <label class="theme-radio" :class="{ active: appStore.themeMode === 'dark' }">
        <input type="radio" value="dark" v-model="appStore.themeMode" name="themeMode" />
        <span>🌙 深色</span>
      </label>
      <label class="theme-radio" :class="{ active: appStore.themeMode === 'auto' }">
        <input type="radio" value="auto" v-model="appStore.themeMode" name="themeMode" />
        <span>💻 跟随系统</span>
      </label>
    </div>
  </div>

  <div class="setting-item">
    <label>字体大小 (Aa)</label>
    <div class="slider-with-input">
      <input type="range" v-model.number="appStore.settings.fontSize" min="12" max="24" />
      <input
        type="number"
        v-model.number="appStore.settings.fontSize"
        min="12"
        max="24"
        class="num-input"
      />
    </div>
  </div>

  <div class="setting-item">
    <label>翻页速度 📖</label>
    <div class="slider-with-input">
      <input type="range" v-model.number="appStore.settings.turnSpeed" min="1" max="10" />
      <input
        type="number"
        v-model.number="appStore.settings.turnSpeed"
        min="1"
        max="10"
        class="num-input"
      />
    </div>
  </div>

  <div class="setting-item">
    <label>音乐音量 🎵</label>
    <div class="slider-with-input">
      <input type="range" v-model.number="appStore.settings.vol" min="0" max="100" />
      <input
        type="number"
        v-model.number="appStore.settings.vol"
        min="0"
        max="100"
        class="num-input"
      />
    </div>
  </div>

  <div class="setting-item">
    <div class="setting-row">
      <label>背景音乐自动播放</label>
      <label class="switch">
        <input type="checkbox" v-model="appStore.settings.autoPlay" />
        <span class="slider"></span>
      </label>
    </div>
    <div class="setting-row" style="margin-top: 15px">
      <label>启动时自动翻开</label>
      <label class="switch">
        <input type="checkbox" v-model="appStore.settings.autoOpen" />
        <span class="slider"></span>
      </label>
    </div>
    <div class="setting-row" style="margin-top: 15px">
      <label>全部使用系统字体</label>
      <label class="switch">
        <input type="checkbox" v-model="appStore.settings.useSysFont" />
        <span class="slider"></span>
      </label>
    </div>
  </div>

  <button class="reset-btn" @click="handleReset">恢复默认设置</button>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/useAppStore';

const appStore = useAppStore();

const handleReset = () => {
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

/* 主题选择器样式 */
.theme-selector {
  display: flex;
  gap: 10px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  padding: 6px;
}

body.dark-mode .theme-selector {
  background: rgba(255, 255, 255, 0.03);
}

.theme-radio {
  flex: 1;
  justify-content: center;
  align-items: center;
  opacity: 0.6;
  transition: all 0.2s;
  cursor: pointer;
  margin-bottom: 0;
  border-radius: 8px;
  padding: 8px 0;
  color: var(--text-main);
  font-weight: 800;
  font-size: calc(var(--base-font-size) - 2px);
  text-align: center;
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
</style>
