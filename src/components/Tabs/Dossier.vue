<template>
  <div class="archive-header">
    <div class="archive-title">病历档案 📋</div>
    <img
      src="/assets/stethoscope.webp"
      class="decor-stethoscope"
      alt="听诊器"
      width="702"
      height="732"
      @click="handleStethClick"
    />
  </div>

  <div class="clean-dossier">
    <div class="cd-section">
      <h2 class="cd-title">🔍 评估</h2>
      <div class="cd-grid">
        <div class="cd-box cd-full">
          <span class="cd-label">病历状态</span>
          <span class="cd-val">{{ chatStore.dossier['病历状态'] || '暂无数据' }}</span>
        </div>
        <div class="cd-box">
          <span class="cd-label">本次记录</span>
          <span class="cd-val">{{ chatStore.dossier['本次记录'] || '暂无数据' }}</span>
        </div>
        <div class="cd-box">
          <span class="cd-label">上次互动</span>
          <span class="cd-val">{{ chatStore.dossier['上次互动'] || '暂无数据' }}</span>
        </div>
        <div class="cd-box">
          <span class="cd-label">当前关系</span>
          <span class="cd-val">{{ chatStore.dossier['当前关系'] || '暂无数据' }}</span>
        </div>
        <div class="cd-box">
          <span class="cd-label">特殊性</span>
          <span class="cd-val">{{ chatStore.dossier['特殊性'] || '暂无数据' }}</span>
        </div>
      </div>
    </div>

    <div class="cd-section">
      <h2 class="cd-title">🧠 解析</h2>
      <ul class="cd-list">
        <li>
          <strong class="cd-highlight">优势资源：</strong>
          <span>{{ chatStore.dossier['优势资源'] || '暂无数据' }}</span>
        </li>
        <li>
          <strong class="cd-highlight">问题成因：</strong>
          <span>{{ chatStore.dossier['问题成因'] || '暂无数据' }}</span>
        </li>
        <li>
          <strong class="cd-highlight">影响评估：</strong>
          <span>{{ chatStore.dossier['影响评估'] || '暂无数据' }}</span>
        </li>
      </ul>
      <div class="cd-warning">
        ⚠️ <strong>注意事项：</strong>
        <span>{{ chatStore.dossier['注意事项'] || '暂无数据' }}</span>
      </div>
    </div>

    <div class="cd-section" style="margin-bottom: 20px">
      <h2 class="cd-title">🛠️ 干预与目标</h2>
      <ul class="cd-list">
        <li>
          <strong>干预方案：</strong>
          <span>{{ chatStore.dossier['干预方案'] || '暂无数据' }}</span>
        </li>
        <li>
          <strong>执行事项：</strong>
          <span>{{ chatStore.dossier['执行事项'] || '暂无数据' }}</span>
        </li>
      </ul>
      <div class="cd-target">
        🎯 <strong>预期目标：</strong>
        <span>{{ chatStore.dossier['预期目标'] || '暂无数据' }}</span>
      </div>
    </div>

    <div class="signature-section">
      <img
        src="/assets/glasses.webp"
        class="decor-glasses"
        alt="金边眼镜"
        width="582"
        height="333"
        @click="handleGlassesClick"
      />
      <div class="doctor-signature">
        <span class="sign-text">林 雨 涵</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useAppStore } from '../../stores/useAppStore';
import { useChatStore } from '../../stores/useChatStore';

const chatStore = useChatStore();
const appStore = useAppStore();

const stethClicks = ref(0);
const glassesClicks = ref(0);

const handleStethClick = (): void => {
  stethClicks.value++;
  if (stethClicks.value === 2) {
    console.log('[Dev] 听诊器就绪 (2/2)');
  }
};

const handleGlassesClick = (): void => {
  if (stethClicks.value >= 2 && !appStore.isDevModeUnlocked) {
    glassesClicks.value++;
    if (glassesClicks.value === 24) {
      appStore.isDevModeUnlocked = true;
      alert('🛠️ 开发者模式已解锁！');
      appStore.activeTab = 4;
    }
  }
};
</script>

<style scoped>
.dossier-wrapper {
  display: flex;
  position: relative;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 10px;
}
.dossier-wrapper::after {
  position: absolute;
  top: 40%;
  left: 10%;
  transform: rotate(-30deg);
  opacity: 0.04;
  pointer-events: none;
  content: 'CONFIDENTIAL';
  color: var(--text-main);
  font-weight: 900;
  font-size: 40px;
  letter-spacing: 4px;
}
.dossier-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 5px;
}
.d-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotate(-4deg);
  clip-path: polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%);
  filter: drop-shadow(3px 6px 6px rgba(0, 0, 0, 0.15));
  background: linear-gradient(135deg, var(--tab-4), var(--tab-3));
  aspect-ratio: 1;
  width: 54px;
  height: 54px;
  font-size: 26px;
}
.d-header-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}
.d-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.d-tag {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  padding: 4px 10px;
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.tag-anxiety {
  border: 1px solid rgba(243, 176, 176, 0.8);
  background: rgba(243, 176, 176, 0.35);
  color: #c0392b;
}
.tag-defense {
  border: 1px solid rgba(242, 227, 148, 0.8);
  background: rgba(242, 227, 148, 0.4);
  color: #b8860b;
}
body.dark-mode .tag-anxiety {
  border-color: rgba(243, 176, 176, 0.3);
  background: rgba(243, 176, 176, 0.15);
  color: #ff9a9a;
}
body.dark-mode .tag-defense {
  border-color: rgba(242, 227, 148, 0.3);
  background: rgba(242, 227, 148, 0.15);
  color: #ffd700;
}
.d-time {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.7;
  color: var(--text-main);
  font-weight: 700;
  font-size: 12px;
}
.dossier-section {
  position: relative;
  animation: fadeIn 0.6s ease forwards;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.02),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--card-bg);
  padding: 18px;
  overflow: hidden;
}
.dossier-section::before {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
  background: linear-gradient(90deg, var(--tab-4), var(--tab-3));
  width: 100%;
  height: 4px;
  content: '';
}
.dossier-section.plan::before {
  background: linear-gradient(90deg, var(--tab-2), var(--tab-1));
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  color: var(--text-ai);
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 1px;
}
.d-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.d-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px dashed rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  padding: 12px;
}
body.dark-mode .d-box {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}
.d-box.full {
  grid-column: span 2;
}
.d-box-label {
  opacity: 0.8;
  margin-bottom: 6px;
  color: var(--text-main);
  font-weight: 800;
  font-size: 12px;
}
.d-box-val {
  color: var(--text-ai);
  font-weight: 600;
  font-size: 13px;
  line-height: 1.5;
  text-align: justify;
}
.clinical-notes {
  margin: 0;
  padding: 0;
  list-style: none;
}
.clinical-notes li {
  position: relative;
  margin-bottom: 12px;
  padding-left: 18px;
  color: var(--text-main);
  font-size: 13px;
  line-height: 1.6;
  text-align: justify;
}
.clinical-notes li:last-child {
  margin-bottom: 0;
}
.clinical-notes li::before {
  position: absolute;
  top: 1px;
  left: 0;
  content: '📌';
  font-size: 11px;
}
.clinical-notes strong {
  color: var(--text-ai);
  font-weight: 800;
}
.task-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.01);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  padding: 10px 12px;
  color: var(--text-main);
  font-weight: 600;
  font-size: 13px;
}
body.dark-mode .task-item {
  border-color: rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
}
.task-item input[type='checkbox'] {
  cursor: pointer;
  margin-top: 3px;
  width: 16px;
  height: 16px;
  accent-color: #e74c3c;
}
.goal-box {
  margin-top: 14px;
  border-left: 4px solid var(--tab-3);
  border-radius: 0 8px 8px 0;
  background: rgba(163, 217, 177, 0.15);
  padding: 12px 14px;
  color: var(--text-ai);
  font-weight: 600;
  font-size: 13px;
  line-height: 1.6;
}
body.dark-mode .goal-box {
  border-left-color: var(--tab-3);
  background: rgba(163, 217, 177, 0.1);
}

.clean-dossier {
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: fadeIn 0.6s ease forwards;
  color: var(--text-main);
  font-family: var(--font-ui-sans);
}

.cd-section {
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.45);
  padding: 16px;
}
body.dark-mode .cd-section {
  border-color: rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.15);
}

.cd-section::before {
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 0;
  border-radius: 0 4px 4px 0;
  background: linear-gradient(to bottom, var(--tab-3), var(--tab-4));
  width: 4px;
  content: '';
}

.cd-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  color: var(--text-ai);
  font-weight: 800;
  font-size: calc(var(--base-font-size) + 1px);
  letter-spacing: 0.5px;
}

.cd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.cd-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px dashed rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
  padding: 10px;
}
body.dark-mode .cd-box {
  border-color: rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}
.cd-box.cd-full {
  grid-column: span 2;
}

.cd-label {
  opacity: 0.6;
  font-weight: 800;
  font-size: calc(var(--base-font-size) - 3px);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.cd-val {
  color: var(--text-ai);
  font-weight: 600;
  font-size: calc(var(--base-font-size) - 1px);
}

.cd-list {
  margin: 0;
  padding-left: 6px;
  list-style: none;
}
.cd-list li {
  position: relative;
  margin-bottom: 10px;
  padding-left: 18px;
  font-size: calc(var(--base-font-size) - 1px);
  line-height: 1.6;
  text-align: justify;
}
.cd-list li:last-child {
  margin-bottom: 0;
}
.cd-list li::before {
  position: absolute;
  top: 0px;
  left: 2px;
  content: '•';
  color: var(--tab-3);
  font-weight: bold;
  font-size: 1.2em;
}

.cd-highlight {
  border-radius: 2px;
  background: linear-gradient(transparent 60%, rgba(243, 176, 176, 0.4) 60%);
  padding: 0 2px;
}
body.dark-mode .cd-highlight {
  background: linear-gradient(transparent 60%, rgba(243, 176, 176, 0.15) 60%);
}

.cd-warning {
  margin-top: 14px;
  border-left: 3px solid #e74c3c;
  border-radius: 4px;
  background: rgba(231, 76, 60, 0.05);
  padding: 12px;
  color: #c0392b;
  font-weight: 600;
  font-size: calc(var(--base-font-size) - 1px);
}
body.dark-mode .cd-warning {
  background: rgba(231, 76, 60, 0.15);
  color: #ff9a9a;
}

.cd-target {
  margin-top: 14px;
  border: 1px dashed var(--tab-3);
  border-radius: 4px;
  background: rgba(163, 217, 177, 0.1);
  padding: 12px;
  color: var(--text-ai);
  font-weight: 600;
  font-size: calc(var(--base-font-size) - 1px);
}
body.dark-mode .cd-target {
  border-color: rgba(163, 217, 177, 0.3);
  background: rgba(163, 217, 177, 0.08);
}

.archive-header {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
  margin-bottom: 20px;
}

.archive-header .archive-title {
  margin-bottom: 0;
}

.decor-stethoscope {
  transform: rotate(8deg);
  opacity: 0.9;
  filter: drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.12));
  transition: transform 0.3s ease;
  width: 55px;
  height: auto;
}
.decor-stethoscope:hover {
  transform: rotate(0deg) scale(1.05);
}
body.dark-mode .decor-stethoscope {
  opacity: 0.85;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4));
}

.signature-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.decor-glasses {
  transform: rotate(-3deg);
  opacity: 0.85;
  z-index: 2;
  filter: drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.1));
  width: 150px;
  height: auto;
}
body.dark-mode .decor-glasses {
  opacity: 0.9;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.5));
}

.doctor-signature {
  position: relative;
  text-align: center;
}
.doctor-signature .sign-text {
  display: block;
  opacity: 0.9;
  margin-bottom: 2px;
  color: #0f3057;
  font-weight: 800;
  font-size: 26px;
  font-family: var(--font-lin);
  letter-spacing: 4px;
  text-shadow: 0px 0px 1px rgba(15, 48, 87, 0.3);
}
body.dark-mode .doctor-signature .sign-text {
  opacity: 1;
  color: #b1ecfc;
  text-shadow: 0px 0px 1px rgba(168, 192, 234, 0.3);
}
</style>
