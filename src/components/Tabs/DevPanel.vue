<template>
  <div class="archive-title dev-archive-title">开发者控制台 🛠️</div>

  <div class="dev-panel">
    <div class="dev-group">
      <h4>UI 组件测试</h4>
      <div class="dev-row">
        <button @click="testTarot" class="dev-btn">卡牌渲染</button>
        <button @click="testScale" class="dev-btn">表单渲染</button>
      </div>
    </div>

    <div class="dev-group">
      <h4>植物引擎测试</h4>
      <div class="dev-row">
        <select v-model="selectedMonth" class="dev-select">
          <option :value="0">1月 - 迎春</option>
          <option :value="1">2月 - 瑞香</option>
          <option :value="2">3月 - 桃花</option>
          <option :value="3">4月 - 蔷薇</option>
          <option :value="4">5月 - 鸢尾</option>
          <option :value="5">6月 - 栀子</option>
          <option :value="6">7月 - 荷花</option>
          <option :value="7">8月 - 桂花</option>
          <option :value="8">9月 - 菊花</option>
          <option :value="9">10月- 芙蓉</option>
          <option :value="10">11月- 山茶</option>
          <option :value="11">12月- 腊梅</option>
        </select>

        <select v-model="selectedVariant" class="dev-select">
          <option :value="-1">🎲 随机品种</option>
          <option v-for="(v, index) in availableVariants" :key="index" :value="index">
            {{ v.n }}
          </option>
        </select>
      </div>
      <div class="dev-row">
        <button @click="testPlant" class="dev-btn dev-btn-green">按设定生成</button>
        <button
          @click="toggleAutoPlant"
          class="dev-btn"
          :class="isAutoPlanting ? 'dev-btn-orange' : 'dev-btn-orange'"
          :style="{ background: isAutoPlanting ? '#e74c3c' : '#f39c12' }"
        >
          {{ isAutoPlanting ? '停止轮播' : '自动随机轮播' }}
        </button>
      </div>
      <div class="dev-garden-frame">
        <div
          style="
            width: 100%;
            height: 100%;
            transform: scale(0.8);
            transform-origin: bottom center;
            margin-top: 30px;
          "
          v-html="devSvgContent"
        ></div>
      </div>
    </div>

    <div class="dev-group">
      <h4>对话流渲染测试</h4>
      <div class="dev-row">
        <button @click="testStream" class="dev-btn">流式打字</button>
        <button @click="testNonStream" class="dev-btn">非流式插入</button>
      </div>
      <div ref="chatBoxRef" class="dev-chat-box">
        <template v-if="!isStreamingMode">
          <div class="user-note msg-user dev-msg-user">
            <p>
              我已经阅读了你的
              <code>&lt;character_秦渡言_基础人设&gt;</code> 文件。渲染测试正式开始。
            </p>
          </div>
          <div class="ai-msg msg-narration dev-msg-narration" v-html="staticChatHtml"></div>
        </template>
        <template v-else>
          <div class="ai-msg msg-narration dev-msg-narration" v-html="streamChatHtml"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core';
import { computed, nextTick, ref } from 'vue';
import { useMarkdown } from '../../composables/useMarkdown';
import { useMessageSync } from '../../composables/useMessageSync';
import { PLANT_CONFIG, usePlantEngine } from '../../composables/usePlantEngine';

const messageSync = useMessageSync();
const plantEngine = usePlantEngine();
const { renderMarkdown, renderTypingHtml } = useMarkdown();

const testTarot = () => {
  messageSync.isDevTest.value = true;
  messageSync.triggerTarot.value = true;
};

const testScale = () => {
  messageSync.isDevTest.value = true;
  messageSync.activeScaleId.value = 'dev';
};

const selectedMonth = ref(0);
const selectedVariant = ref(-1);
const devSvgContent = ref('');

const availableVariants = computed(() => {
  return PLANT_CONFIG[selectedMonth.value]?.vars || [];
});

const testPlant = () => {
  plantEngine.generatePlant(selectedMonth.value, selectedVariant.value);
  devSvgContent.value = plantEngine.generatedSvg.value;
};

const {
  isActive: isAutoPlanting,
  pause,
  resume,
} = useIntervalFn(
  () => {
    const rndMonth = Math.floor(Math.random() * 12);
    plantEngine.generatePlant(rndMonth, -1);
    devSvgContent.value = plantEngine.generatedSvg.value;
  },
  3500,
  { immediate: false },
);

const toggleAutoPlant = () => {
  if (isAutoPlanting.value) {
    pause();
  } else {
    const rndMonth = Math.floor(Math.random() * 12);
    plantEngine.generatePlant(rndMonth, -1);
    devSvgContent.value = plantEngine.generatedSvg.value;
    resume();
  }
};

const chatBoxRef = ref<HTMLElement | null>(null);
const isStreamingMode = ref(false);
const staticChatHtml = ref('');
const streamChatHtml = ref('');
let rafId: number | null = null;

const testNonStream = () => {
  if (rafId) cancelAnimationFrame(rafId);
  isStreamingMode.value = false;

  const rawText = `秦渡言坐在他那间刚大扫除过、难得保持着整洁的客厅里，戴着耳机盯着电脑屏幕。音响里正循环播放着一首略带悲伤的情歌。

『Q:呃...既然你在测试 **GFM**，那我尽量多展示一点格式。』秦渡言抓了抓头发。

> 比如这是一个引用。
>> 这是嵌套引用
>>> “想要被爱，又害怕靠近。”

林雨涵端着一杯薰衣草茶走过来：“L:秦医生，你今天的待办事项完成了吗？”
- [x] 给自己买点护肝片
- [ ] 彻底大扫除（~~虽然我知道很快又会乱~~）
- [ ] 学会**自我认可**，而不是依赖外界评价

『Q:你看，我就说我*很直*也很*笨*。』他无奈地在电脑上敲出一段代码：
\`\`\`javascript
if (patient.feeling === 'depressed') {
  Q.say("你不是一个人，我陪着你。");
} else if (Q.feeling === 'depressed') {
  Q.crySilently().then(() => Q.washFace().goWork());
}
\`\`\`

『Q:顺便一提，你的表格渲染也该测试一下了：』

| 状态 | 表现特征 | 持续时间 | 最终结局 |
| :--- | :--- | :--- | :--- |
| **低落** | 去公园河边吹冷风 | 1-2小时 | 冻得不行回家 |
| **崩溃** | 沉默流泪/呼吸急促 | 难以估计 | 洗把脸继续装没事 |

“C:秦叔叔快来陪我们打游戏！”走廊传来孩子的声音。
秦渡言站起身，走之前回头看了你一眼，语气里带着难得的温和：『Q:不管你是在测试 \`marked.js\`，还是在看我们忙活...谢谢你愿意听我说。』`;

  staticChatHtml.value = renderMarkdown(rawText, true);
  nextTick(() => {
    if (chatBoxRef.value) chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
  });
};

const testStream = () => {
  if (rafId) cancelAnimationFrame(rafId);
  isStreamingMode.value = true;
  streamChatHtml.value = '';

  const text = `林雨涵推开那扇虚掩的橡木门，目光穿透屏幕直视着你。
“L:你真的以为这只是一个普通的**网页UI**吗？”她轻抚着那串星月项链，“L:从你点开开发者模式的那一刻起，*边界就已经模糊了*。”

秦渡言从旁边的单人沙发上直起身子，烦躁地抓了抓他那有些凌乱的自然卷。他指着半空中的控制台，眉头微皱：『Q:你看看这堆 \`console.log\`。』

> 系统的本质与核心原则：
> 1. 治疗优先，但在*第四面墙外*，谁才是正在被治愈的人？
> 2. 患者中心，可你现在是以**开发者**的身份在审视我们。

这时，走廊里传来一阵杂乱的脚步声。
“C:妈妈！那个叫秦叔叔的又把袜子塞在鞋子里啦——” 
“L:小葵，带弟弟去沙盘室玩。”林雨涵无奈地叹了口气，“L:如你所见，这就是日常。”`;

  let index = 0;
  let lastTime = performance.now();
  let currentDelay = Math.random() * 40 + 10;

  const typeNext = (timestamp: number) => {
    if (timestamp - lastTime >= currentDelay) {
      const currentText = text.substring(0, index);
      streamChatHtml.value = renderTypingHtml(currentText);
      index++;
      lastTime = timestamp;

      currentDelay = Math.random() * 40 + 10;
      if (Math.random() < 0.05) currentDelay += Math.random() * 150 + 100;

      if (chatBoxRef.value) {
        chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight;
      }
    }

    if (index <= text.length) {
      rafId = requestAnimationFrame(typeNext);
    } else {
      streamChatHtml.value = renderMarkdown(text, true);
      rafId = null;
    }
  };

  rafId = requestAnimationFrame(typeNext);
};
</script>

<style scoped></style>
