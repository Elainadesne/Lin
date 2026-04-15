<template>
  <div
    class="scale-notebook"
    :class="{ 'is-closing': isClosing }"
    @animationend="handleAnimationEnd"
  >
    <div class="scale-close-btn" @click="handleClose">×</div>

    <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888">
      正在加载问卷...
    </div>
    <div v-else-if="fetchError" style="text-align: center; padding: 40px; color: #e74c3c">
      {{ fetchError }}
    </div>

    <template v-else-if="scaleData">
      <h1 class="scale-title">{{ scaleData.title }}</h1>
      <div class="scale-desc"><strong>填写指引：</strong> {{ scaleData.desc }}</div>

      <div ref="formScrollRef" class="scale-questions-container">
        <div
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
            class="scale-q"
            :class="{
              answered: virtualRow.index in answers,
              'highlight-flash': highlightedIndex === virtualRow.index,
            }"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }"
          >
            <div class="scale-q-text">
              {{ virtualRow.index + 1 }}. {{ scaleData.questions[virtualRow.index].q }}
            </div>

            <div class="scale-options">
              <label
                v-for="(opt, oIndex) in scaleData.options"
                :key="oIndex"
                class="opt-label"
                :class="{ 'circled-option': answers[virtualRow.index] === opt.value }"
                :style="
                  answers[virtualRow.index] === opt.value ? getCircleStyle(virtualRow.index) : {}
                "
              >
                <input
                  v-model="answers[virtualRow.index]"
                  type="radio"
                  :name="'sq' + virtualRow.index"
                  :value="opt.value"
                  @change="generateCircleStyle(virtualRow.index)"
                />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <button
        class="notebook-btn submit-btn"
        :class="{ incomplete: !isAllAnswered }"
        @click="handleBottomButtonClick"
      >
        {{
          isAllAnswered
            ? '完成评估，同步给林医生'
            : `还有 ${unansweredCount} 道题未完成... 点击定位`
        }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import { computed, onMounted, ref } from 'vue';

import { useMessageSync } from '../../composables/useMessageSync';
import { useChatStore } from '../../stores/useChatStore';
import type { ScaleForm } from '../../types';

const props = defineProps<{
  scaleId: string;
}>();

const emit = defineEmits<(e: 'close') => void>();

const chatStore = useChatStore();

const scaleData = ref<ScaleForm | null>(null);
const isLoading = ref(true);
const fetchError = ref('');

const isClosing = ref(false);
const isSubmitted = ref(false);

const answers = ref<Record<number, number>>({});
const circleStyles = ref<Record<number, Record<string, string>>>({});

const formScrollRef = ref<HTMLElement | null>(null);

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: scaleData.value?.questions.length ?? 0,
    getScrollElement: (): HTMLElement | null => formScrollRef.value,
    estimateSize: (): number => 110,
    overscan: 5,
  })),
);

const messageSync = useMessageSync();

onMounted(async () => {
  if (props.scaleId === 'dev') {
    scaleData.value = {
      title: '开发者测试量表',
      desc: '这是一份由代码直接注入的虚拟量表，用于测试 UI 渲染和交互反馈是否正常。',
      questions: [
        { q: '我感觉我的代码里隐藏着 Bug', f: 'A' },
        { q: '我今天想喝一杯冰奶茶', f: 'B' },
        { q: '我觉得这套 UI 交互做得很顺滑', f: 'A' },
      ],
      options: [
        { label: '完全没有', value: 0 },
        { label: '偶尔', value: 1 },
        { label: '经常', value: 2 },
        { label: '总是', value: 3 },
      ],
      factors: { A: { name: '工作压力', count: 2 }, B: { name: '生活欲望', count: 1 } },
    };
    isLoading.value = false;
    return;
  }

  const baseUrl = import.meta.env.BASE_URL || '/';
  try {
    const res = await fetch(`${baseUrl}scales/${props.scaleId}.json`);
    if (!res.ok) throw new Error('找不到表单文件');
    scaleData.value = (await res.json()) as ScaleForm;
  } catch (e: unknown) {
    console.error(e);
    fetchError.value = `[系统提示] 无法加载表单 ${props.scaleId}.json`;
  } finally {
    isLoading.value = false;
  }
});

const totalQuestions = computed(() => scaleData.value?.questions.length ?? 0);
const answeredCount = computed(() => Object.keys(answers.value).length);
const unansweredCount = computed(() => totalQuestions.value - answeredCount.value);
const isAllAnswered = computed(() => totalQuestions.value > 0 && unansweredCount.value === 0);

const highlightedIndex = ref<number | null>(null);
let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

const handleBottomButtonClick = (): void => {
  if (isAllAnswered.value) {
    handleSubmit();
  } else {
    const targetIdx = scaleData.value?.questions.findIndex((_, i) => !(i in answers.value)) ?? -1;
    if (targetIdx !== -1) {
      rowVirtualizer.value.scrollToIndex(targetIdx, { align: 'center', behavior: 'smooth' });
      if (highlightTimeout) clearTimeout(highlightTimeout);
      highlightedIndex.value = null;

      setTimeout(() => {
        highlightedIndex.value = targetIdx;
        highlightTimeout = setTimeout(() => {
          highlightedIndex.value = null;
        }, 1500);
      }, 50);
    }
  }
};

const generateCircleStyle = (qIndex: number): void => {
  const rot = (Math.random() * 16 - 8).toFixed(1);
  const w = (Math.random() * 15 + 105).toFixed(1);
  const h = (Math.random() * 20 + 120).toFixed(1);
  const r = (): number => Math.floor(Math.random() * 20 + 40);
  const br = `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;

  circleStyles.value[qIndex] = {
    '--rand-rot': `${rot}deg`,
    '--rand-w': `${w}%`,
    '--rand-h': `${h}%`,
    '--rand-br': br,
  };
};

const getCircleStyle = (qIndex: number): Record<string, string> => {
  return circleStyles.value[qIndex] ?? {};
};

const handleSubmit = (): void => {
  if (!scaleData.value || !isAllAnswered.value) return;

  let totalScore = 0;
  let factorScores: Record<string, number> = {};
  let details: string[] = [];

  if (scaleData.value.factors) {
    for (let k in scaleData.value.factors) {
      factorScores[k] = 0;
    }
  }

  scaleData.value.questions.forEach((q, idx) => {
    const val = answers.value[idx];
    const optLabel = scaleData.value?.options.find((o) => o.value === val)?.label ?? '未知';

    totalScore += val;
    if (q.f && factorScores[q.f] != null) {
      factorScores[q.f] += val;
    }
    details.push(`${idx + 1}. ${q.q}\n答：${optLabel} (${val}分)`);
  });

  let report = `系统提示：来访者已完成《${scaleData.value.title}》。\n\n【得分情况】\n总计得分: ${totalScore}\n`;
  if (scaleData.value.factors) {
    report += `各维度分布:\n`;
    for (let k in scaleData.value.factors) {
      report += `- ${scaleData.value.factors[k].name}: ${factorScores[k]}\n`;
    }
  }

  report += `\n【详细答题情况】\n${details.join('\n\n')}`;

  if (scaleData.value.reference) {
    report += `\n\n${scaleData.value.reference}`;
  }
  report += `\n\n[系统指令]：这是来访者刚刚填写的问卷完整结果。`;

  if (!messageSync.isDevTest.value) {
    chatStore.addTempPromptToHost(report);
  }
  isSubmitted.value = true;
  handleClose();
};

const handleClose = (): void => {
  if (isClosing.value) return;

  if (!isSubmitted.value && scaleData.value) {
    let details: string[] = [];
    if (totalQuestions.value === 0) {
      const report = `系统提示：来访者拿到了《${scaleData.value.title}》，但并没有填完就直接放在了一边。`;
      chatStore.addTempPromptToHost(report);
    } else {
      scaleData.value.questions.forEach((q, idx) => {
        const val = answers.value[idx];
        if (val != null) {
          const labelText = scaleData.value?.options.find((o) => o.value === val)?.label ?? '已选';
          details.push(`${idx + 1}. ${q.q} —— (已作答：${labelText})`);
        } else {
          details.push(`${idx + 1}. ${q.q} —— (未作答/跳过)`);
        }
      });
      const report = `系统提示：来访者拿到了《${scaleData.value.title}》，但没有全部填完就收了起来。\n【进度情况】：共 ${totalQuestions.value} 题，仅填了 ${answeredCount.value} 题。\n【具体详情（按原题序）】：\n${details.join('\n')}\n\n[系统指令]：这是来访者目前填写的部分残缺结果，请根据此信息与来访者的态度，自然地推进对话。`;
      chatStore.addTempPromptToHost(report);
    }
  }

  isClosing.value = true;
};

const handleAnimationEnd = (e: AnimationEvent): void => {
  if (e.animationName === 'handBackToTop') {
    emit('close');
  }
};
</script>

<style scoped>
.scale-notebook {
  display: flex;
  position: relative;
  flex-shrink: 0;
  flex-direction: column;

  animation: handOverFromTop 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  margin: auto;
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  background: #fdfcfb;
  background-image: var(--paper-noise);
  padding: 45px 35px 50px 35px;
  width: 90vw;
  max-width: 580px;
  max-height: 100%;
  overflow: hidden !important;
  pointer-events: auto;
  color: #2c3e50;
}

body.dark-mode .scale-notebook {
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
  background: #252932;
  color: #d8dee5;
}

.scale-close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  z-index: 50;
  transition:
    color 0.2s,
    transform 0.2s;
  cursor: pointer;
  width: 32px;
  height: 32px;
  color: rgba(0, 0, 0, 0.2);
  font-size: 32px;
  line-height: 28px;
  font-family: Arial, sans-serif;
  text-align: center;
}
.scale-close-btn:hover {
  transform: scale(1.15) rotate(90deg);
  color: #2ecc71;
}
body.dark-mode .scale-close-btn {
  color: rgba(255, 255, 255, 0.2);
}
body.dark-mode .scale-close-btn:hover {
  color: #2ecc71;
}

.scale-title {
  margin-bottom: 25px;
  color: #2c3e50;
  font-weight: 700;
  font-size: calc(var(--base-font-size) + 14px);
  font-family: var(--font-lin);
  text-align: center;
  text-wrap: balance;
}
body.dark-mode .scale-title {
  color: #f0f0f0;
}

.scale-desc {
  margin-bottom: 30px;
  border-left: 4px solid #2ecc71;
  border-radius: 0 8px 8px 0;
  background: rgba(46, 204, 113, 0.06);
  padding: 14px 18px;
  color: var(--text-main);
  font-size: calc(var(--base-font-size) - 1px);
  line-height: 1.6;
}
body.dark-mode .scale-desc {
  background: rgba(46, 204, 113, 0.08);
  color: #c8d2d9;
}

.scale-q {
  transition: opacity 0.4s;
  margin-bottom: 30px;
}
.scale-q-text {
  transition: all 0.4s ease;
  margin-bottom: 12px;
  color: #34495e;
  font-weight: 600;
  font-size: var(--base-font-size);
  line-height: 1.5;
}
body.dark-mode .scale-q-text {
  color: #e2e8f0;
}
.scale-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.scale-q.answered .scale-q-text {
  opacity: 0.6;
  color: #95a5a6;
  text-decoration: line-through;
}
body.dark-mode .scale-q.answered .scale-q-text {
  color: #6d7f8b;
}

.opt-label {
  display: inline-block;
  position: relative;
  transition: color 0.3s;
  cursor: pointer;
  padding: 6px 12px;
  color: var(--text-ai);
  font-weight: bold;
  font-size: calc(var(--base-font-size) - 2px);
}
.opt-label input[type='radio'] {
  display: none;
}
.opt-label:hover {
  color: #27ae60;
}
body.dark-mode .opt-label {
  color: #94a3b8;
}

.opt-label.circled-option {
  z-index: 2;
  color: #27ae60;
}
body.dark-mode .opt-label.circled-option {
  color: #2ecc71;
}
.opt-label.circled-option::before {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(var(--rand-rot, -4deg));
  z-index: 99 !important;
  animation: sketchCircle 0.3s ease-out forwards;
  border: 2px solid #2ecc71;
  border-radius: var(--rand-br, 60% 40% 50% 50% / 40% 50% 60% 40%);
  width: var(--rand-w, 110%);
  height: var(--rand-h, 130%);
  pointer-events: none;
  content: '';
}

@keyframes sketchCircle {
  0% {
    opacity: 0;
    clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  }
  100% {
    opacity: 1;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

.notebook-btn {
  transition: all 0.2s;
  cursor: pointer;
  margin-top: 15px;
  border: 2px dashed;
  border-radius: 12px;
  background: transparent;
  padding: 14px;
  width: 100%;
  font-weight: 800;
  font-size: 16px;
  font-family: var(--font-ui-sans);
  letter-spacing: 1px;
}
.submit-btn {
  border-color: #2ecc71;
  color: #27ae60;
}
.submit-btn:hover {
  background: rgba(46, 204, 113, 0.08);
}
.submit-btn.incomplete {
  opacity: 0.7;
  cursor: not-allowed;
  border-color: #bdc3c7;
  background: transparent;
  color: #95a5a6;
}
body.dark-mode .submit-btn.incomplete {
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.3);
}

.notebook-btn:active {
  transform: scale(0.98);
}

.scale-done-notebook {
  padding: 60px 40px;
  text-align: center;
}
.scale-done-title {
  margin-bottom: 15px;
  color: #2ecc71;
  font-size: 32px;
  font-family: var(--font-lin);
}
.scale-done-p1 {
  margin-bottom: 10px;
  color: var(--text-main);
  font-weight: bold;
  font-size: 16px;
}
.scale-done-p2 {
  opacity: 0.8;
  margin-bottom: 30px;
  color: var(--text-ai);
  font-size: 14px;
}

.scale-notebook.is-closing {
  animation: handBackToTop 1s ease-in-out forwards;
  pointer-events: none;
}

.scale-questions-container {
  flex: 1;
  margin-bottom: 15px;
  margin-left: -15px;
  padding-right: 5px;
  padding-left: 15px;
  height: 0;
  overflow-y: auto;
}

.scale-questions-container::-webkit-scrollbar {
  width: 6px;
}
.scale-questions-container::-webkit-scrollbar-track {
  background: transparent;
}
.scale-questions-container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: var(--tab-3, #ccc);
}
body.dark-mode .scale-questions-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

@keyframes flashHighlight {
  0% {
    background-color: transparent;
  }
  20% {
    background-color: var(--flash-bg, rgba(46, 204, 113, 0.3));
  }
  100% {
    background-color: transparent;
  }
}

.highlight-flash {
  --flash-bg: rgba(46, 204, 113, 0.3);
  animation: flashHighlight 1.5s ease-out forwards;
  border-radius: 8px;
}

body.dark-mode .highlight-flash {
  --flash-bg: rgba(46, 204, 113, 0.2);
}
</style>
