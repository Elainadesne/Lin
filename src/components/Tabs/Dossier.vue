<template>
  <div class="archive-header">
    <div class="archive-title">病历档案 📋</div>
    <img
      src="/assets/stethoscope.webp"
      class="decor-stethoscope"
      alt="听诊器"
      @click="handleStethClick"
    />
  </div>

  <div class="clean-dossier">
    <div class="cd-section">
      <h3 class="cd-title">🔍 评估</h3>
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
      <h3 class="cd-title">🧠 解析</h3>
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
      <h3 class="cd-title">🛠️ 干预与目标</h3>
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

<style scoped></style>
