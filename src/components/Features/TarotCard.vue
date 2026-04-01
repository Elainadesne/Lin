<template>
  <div
    class="tarot-card-wrapper"
    :class="{ 'is-closing': isClosing }"
    @animationend="handleAnimationEnd"
  >
    <div class="tarot-hover-box" @click="handleFlip">
      <div class="tarot-flip-container">
        <div
          class="tarot-inner"
          :style="{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }"
        >
          <div class="tarot-back">
            <div class="tarot-back-text">?</div>
          </div>

          <div class="tarot-front">
            <img
              :src="currentCardUrl"
              class="tarot-img"
              :class="{ 'tarot-reversed': isReversed }"
              alt="塔罗牌面"
            />
          </div>
        </div>
      </div>
    </div>

    <p class="tarot-title">
      <span
        class="tarot-title-text"
        :style="{
          opacity: showTitle ? 1 : 0,
          transform: showTitle ? 'translateY(0)' : 'translateY(-8px)',
        }"
        @transitionend="handleTitleTransitionEnd"
      >
        {{ titleText }}
      </span>
    </p>

    <button class="close-overlay-btn" @click="handleClose">
      {{ isFlipped ? '收起卡片' : '不看了，收起卡片' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useMessageSync } from '../../composables/useMessageSync';
import { useChatStore } from '../../stores/useChatStore';
import type { TarotCard } from '../../types';

const emit = defineEmits<(e: 'close') => void>();

const chatStore = useChatStore();

const majorArcana: TarotCard[] = [
  { id: '00_The_Fool', path: 'Major Arcana/00_The_Fool.webp', cn: '愚者' },
  { id: '01_The_Magician', path: 'Major Arcana/01_The_Magician.webp', cn: '魔术师' },
  { id: '02_The_High_Priestess', path: 'Major Arcana/02_The_High_Priestess.webp', cn: '女祭司' },
  { id: '03_The_Empress', path: 'Major Arcana/03_The_Empress.webp', cn: '皇后' },
  { id: '04_The_Emperor', path: 'Major Arcana/04_The_Emperor.webp', cn: '皇帝' },
  { id: '05_The_Hierophant', path: 'Major Arcana/05_The_Hierophant.webp', cn: '教皇' },
  { id: '06_The_Lovers', path: 'Major Arcana/06_The_Lovers.webp', cn: '恋人' },
  { id: '07_The_Chariot', path: 'Major Arcana/07_The_Chariot.webp', cn: '战车' },
  { id: '08_Strength', path: 'Major Arcana/08_Strength.webp', cn: '力量' },
  { id: '09_The_Hermit', path: 'Major Arcana/09_The_Hermit.webp', cn: '隐者' },
  { id: '10_Wheel_of_Fortune', path: 'Major Arcana/10_Wheel_of_Fortune.webp', cn: '命运之轮' },
  { id: '11_Justice', path: 'Major Arcana/11_Justice.webp', cn: '正义' },
  { id: '12_The_Hanged_Man', path: 'Major Arcana/12_The_Hanged_Man.webp', cn: '倒吊人' },
  { id: '13_Death', path: 'Major Arcana/13_Death.webp', cn: '死神' },
  { id: '14_Temperance', path: 'Major Arcana/14_Temperance.webp', cn: '节制' },
  { id: '15_The_Devil', path: 'Major Arcana/15_The_Devil.webp', cn: '恶魔' },
  { id: '16_The_Tower', path: 'Major Arcana/16_The_Tower.webp', cn: '高塔' },
  { id: '17_The_Star', path: 'Major Arcana/17_The_Star.webp', cn: '星星' },
  { id: '18_The_Moon', path: 'Major Arcana/18_The_Moon.webp', cn: '月亮' },
  { id: '19_The_Sun', path: 'Major Arcana/19_The_Sun.webp', cn: '太阳' },
  { id: '20_Judgement', path: 'Major Arcana/20_Judgement.webp', cn: '审判' },
  { id: '21_The_World', path: 'Major Arcana/21_The_World.webp', cn: '世界' },
];

const suits = [
  { key: 'Cups', cn: '圣杯' },
  { key: 'Pentacles', cn: '星币' },
  { key: 'Swords', cn: '宝剑' },
  { key: 'Wands', cn: '权杖' },
];
const ranks = [
  { k: '01_Ace', cn: '王牌' },
  { k: '02_Two', cn: '二' },
  { k: '03_Three', cn: '三' },
  { k: '04_Four', cn: '四' },
  { k: '05_Five', cn: '五' },
  { k: '06_Six', cn: '六' },
  { k: '07_Seven', cn: '七' },
  { k: '08_Eight', cn: '八' },
  { k: '09_Nine', cn: '九' },
  { k: '10_Ten', cn: '十' },
  { k: '11_Page', cn: '侍从' },
  { k: '12_Knight', cn: '骑士' },
  { k: '13_Queen', cn: '王后' },
  { k: '14_King', cn: '国王' },
];

const tarotDeck: TarotCard[] = [...majorArcana];
suits.forEach((suit) => {
  ranks.forEach((rank) => {
    tarotDeck.push({
      id: `${rank.k}_of_${suit.key}`,
      path: `Minor Arcana/${suit.key}/${rank.k}_of_${suit.key}.webp`,
      cn: `${suit.cn}${rank.cn}`,
    });
  });
});

const randomCard = ref<TarotCard | null>(null);
const isReversed = ref(false);

const isFlipped = ref(false);
const hasSynced = ref(false);
const isClosing = ref(false);

const titleText = ref('点击卡牌翻开');
const showTitle = ref(true);

const currentCardUrl = computed(() => {
  if (!randomCard.value) return '';
  const baseUrl = import.meta.env.BASE_URL || '/';
  return `${baseUrl}tarot/${randomCard.value.path}`;
});

onMounted(() => {
  randomCard.value = tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
  isReversed.value = Math.random() > 0.5;
});

const handleFlip = (): void => {
  isFlipped.value = !isFlipped.value;

  if (isFlipped.value && !hasSynced.value && randomCard.value) {
    hasSynced.value = true;

    showTitle.value = false;

    const messageSync = useMessageSync();
    if (!messageSync.isDevTest.value) {
      const orientation = isReversed.value ? '逆位' : '正位';
      const report = `系统提示：来访者刚刚翻开了一张塔罗牌。【抽牌结果】：${randomCard.value.cn} (${randomCard.value.id})【牌面状态】：${orientation}`;
      chatStore.addTempPromptToHost(report);
    }
  }
};

const handleTitleTransitionEnd = (e: TransitionEvent): void => {
  if (e.propertyName === 'opacity' && !showTitle.value && randomCard.value) {
    const orientation = isReversed.value ? '逆位' : '正位';
    titleText.value = `${randomCard.value.cn} (${orientation})`;
    showTitle.value = true;
  }
};

const handleClose = (): void => {
  if (isClosing.value) return;

  if (!hasSynced.value) {
    const report = `系统提示：来访者在看到塔罗牌后，并没有翻开它，而是选择收起了牌。`;
    chatStore.addTempPromptToHost(report);
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
.tarot-card-wrapper.is-closing {
  animation: handBackToTop 1s ease-in-out forwards;
  pointer-events: none;
}

.tarot-inner {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: 100%;
  height: 100%;
}

.tarot-back {
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  backface-visibility: hidden;
  box-sizing: border-box;
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.15);
  border: 8px solid #fcfcfc;
  border-radius: 12px;
  background: linear-gradient(135deg, #a29bfe, #fd79a8);
  width: 100%;
  height: 100%;
}

.tarot-front {
  position: absolute;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  box-sizing: border-box;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border: 8px solid #fcfcfc;
  border-radius: 12px;
  background: #fff;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.tarot-title {
  margin-bottom: 5px;
  min-height: 24px;
  font-weight: 800;
  font-size: 16px;
  text-align: center;
}
</style>
