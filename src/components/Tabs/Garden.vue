<template>
  <div class="garden-frame">
    <div class="garden-svg-container" v-html="generatedSvg"></div>

    <template v-if="isDouble12">
      <canvas ref="beastCanvasRef" class="beast-canvas"></canvas>
      <div class="beast-title">飞禽走兽</div>
    </template>

    <div class="garden-label">{{ gardenLabel }}</div>
  </div>

  <div class="mini-player">
    <div class="player-info" :class="{ active: audioStore.isPlaying }">
      <span class="p-artist">
        <div v-if="audioStore.currentTrack?.name.length > 20" class="marquee-container">
          <span class="marquee-inner">{{ audioStore.currentTrack?.name || '等待播放' }}</span>
        </div>
        <span v-else>{{ audioStore.currentTrack?.name || '等待播放' }}</span>
      </span>
      <span class="p-name">
        {{ audioStore.currentTrack?.artist || '载入中...' }}
      </span>

      <div class="p-time-display">
        <span>{{ formatTime(audioStore.currentTime) }}</span> /
        <span>{{ formatTime(audioStore.totalTime) }}</span>
      </div>

      <div ref="progressBarRef" class="p-progress-bar" @click="handleSeek">
        <div class="p-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <div class="player-control-panel" :class="{ active: audioStore.isPlaying }">
      <div class="p-album-art" :class="audioStore.timePeriod"></div>

      <div class="p-controls">
        <div
          class="p-btn p-mode"
          :class="{
            loop: audioStore.playerSettings.mode === 0,
            random: audioStore.playerSettings.mode === 1,
            single: audioStore.playerSettings.mode === 2,
          }"
          title="切换播放模式"
          @click="toggleMode"
        ></div>

        <div class="p-btn p-prev" title="上一首" @click="audioStore.playPrev"></div>

        <div
          class="p-btn p-play"
          :class="{ playing: audioStore.isPlaying }"
          @click="audioStore.togglePlay"
        ></div>

        <div class="p-btn p-next" title="下一首" @click="() => audioStore.playNext(false)"></div>
      </div>
    </div>

    <div class="playlist-container">
      <div
        v-for="(track, index) in audioStore.playlist"
        :key="track.src"
        class="playlist-item"
        :class="{
          active: audioStore.currentTrackIndex === index,
          disabled: isTrackDisabled(track.src),
        }"
        @click="handlePlaylistItemClick(index, track.src)"
      >
        <div class="playlist-item-info">
          <span class="li-title">
            <div v-if="track.name.length > 20" class="marquee-container">
              <span class="marquee-inner">{{ track.name }}</span>
            </div>
            <span v-else>{{ track.name }}</span>
          </span>
          <span class="li-artist">{{ track.artist }}</span>
        </div>
        <div
          class="li-toggle"
          :title="isTrackDisabled(track.src) ? '解除拉黑' : '拉黑此歌曲'"
          @click.stop="toggleTrackDisable(track.src)"
        >
          {{ isTrackDisabled(track.src) ? '🙉' : '🎵️' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';

import { usePlantEngine } from '../../composables/usePlantEngine';
import { useAppStore } from '../../stores/useAppStore';
import { useAudioStore } from '../../stores/useAudioStore';

const appStore = useAppStore();
const audioStore = useAudioStore();
const { generatedSvg, gardenLabel, generatePlant } = usePlantEngine();

const progressBarRef = ref<HTMLElement | null>(null);

const today = new Date();
const isDouble12 = today.getMonth() === 11 && today.getDate() === 12;
const beastCanvasRef = ref<HTMLCanvasElement | null>(null);
let animFrameId = 0;

const initBeastAnimation = (): void => {
  const canvas = beastCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.parentElement?.getBoundingClientRect() ?? { width: 300, height: 400 };
  canvas.width = rect.width;
  canvas.height = rect.height;

  const cw = canvas.width;
  const ch = canvas.height;

  class Bird {
    x = Math.random() * cw;
    y = 20 + Math.random() * (ch * 0.4);
    scale = 0.3 + Math.random() * 0.3;
    speed = 0.8 + Math.random() * 1.2;
    flapSpeed = 8 + Math.random() * 4;
    phase = Math.random() * Math.PI * 2;

    update(): void {
      this.x -= this.speed;
      if (this.x < -50) {
        this.x = cw + 50;
        this.y = 20 + Math.random() * (ch * 0.4);
      }
    }
    draw(ctx: CanvasRenderingContext2D, time: number): void {
      let flap = Math.sin(time * this.flapSpeed + this.phase);
      let yBob = this.y + Math.cos(time * this.flapSpeed + this.phase) * 3 * this.scale;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.ellipse(this.x, yBob, 8 * this.scale, 2.5 * this.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(this.x, yBob);
      ctx.quadraticCurveTo(
        this.x + 3 * this.scale,
        yBob - 15 * flap * this.scale,
        this.x + 10 * this.scale,
        yBob - 12 * flap * this.scale,
      );
      ctx.quadraticCurveTo(
        this.x + 3 * this.scale,
        yBob + 2 * this.scale,
        this.x + 4 * this.scale,
        yBob,
      );
      ctx.fill();
      ctx.restore();
    }
  }

  class Beast {
    x: number;
    baseScale: number;
    speed: number;
    runSpeed = 12;
    y = 0;
    constructor(xOffset: number) {
      this.x = xOffset;
      this.baseScale = 0.3 + Math.random() * 0.2;
      this.speed = 1.2 + Math.random() * 1;
    }
    update(time: number): void {
      this.x += this.speed;
      if (this.x > cw + 100) this.x = -100;
      this.y = ch - 30 - 20 * this.baseScale + Math.sin(this.x * 0.05 + time * 3) * 5;
    }
    draw(ctx: CanvasRenderingContext2D, time: number): void {
      let t = time * this.runSpeed;
      let cx = this.x + 10 * this.baseScale;
      let cy = this.y + Math.sin(t) * 3 * this.baseScale;
      let px = this.x - 10 * this.baseScale;
      let py = this.y + Math.sin(t - 1) * 3 * this.baseScale;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const drawLeg = (ox: number, oy: number, phase: number, color: string): void => {
        let angle = Math.PI / 2 + Math.sin(t + phase) * 0.6;
        let length = 12 * this.baseScale;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(angle) * length, oy + Math.sin(angle) * length);
        ctx.stroke();
      };

      ctx.lineWidth = 4 * this.baseScale;
      drawLeg(px, py, Math.PI, 'rgba(0,0,0,0.3)');
      drawLeg(cx, cy, Math.PI + 1, 'rgba(0,0,0,0.3)');

      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 10 * this.baseScale;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      ctx.lineWidth = 4 * this.baseScale;
      drawLeg(px, py, 0, 'rgba(0,0,0,0.5)');
      drawLeg(cx, cy, 1, 'rgba(0,0,0,0.5)');

      ctx.restore();
    }
  }

  const birds = Array.from({ length: 7 }, () => new Bird());
  const beasts = Array.from({ length: 3 }, (_, i) => new Beast(-100 - i * 120));

  const animate = (): void => {
    const time = performance.now() / 1000;
    ctx.clearRect(0, 0, cw, ch);

    beasts.forEach((b) => {
      b.update(time);
      b.draw(ctx, time);
    });
    birds.forEach((b) => {
      b.update();
      b.draw(ctx, time);
    });

    animFrameId = requestAnimationFrame(animate);
  };

  animate();
};

const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return '00:00';
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const progressPercent = computed(() => {
  if (audioStore.totalTime === 0) return 0;
  return (audioStore.currentTime / audioStore.totalTime) * 100;
});

const handleSeek = (e: MouseEvent): void => {
  if (!progressBarRef.value || audioStore.totalTime === 0) return;
  const rect = progressBarRef.value.getBoundingClientRect();
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audioStore.seekTrack(percent * audioStore.totalTime);
};

const toggleMode = (): void => {
  audioStore.playerSettings.mode = (audioStore.playerSettings.mode + 1) % 3;
};

const isTrackDisabled = (src: string): boolean => {
  return audioStore.playerSettings.disabled.includes(src);
};

const toggleTrackDisable = (src: string): void => {
  const arr = audioStore.playerSettings.disabled;
  const idx = arr.indexOf(src);
  if (idx !== -1) {
    arr.splice(idx, 1);
  } else {
    arr.push(src);
    if (audioStore.currentTrack?.src === src) {
      audioStore.playNext(true);
    }
  }
};

const handlePlaylistItemClick = (index: number, src: string): void => {
  if (isTrackDisabled(src)) return;
  if (audioStore.currentTrackIndex === index) {
    audioStore.togglePlay();
  } else {
    audioStore.loadTrack(index, true);
  }
};

onMounted(() => {
  if (isDouble12) {
    void nextTick(() => {
      initBeastAnimation();
    });
  }

  if (audioStore.playlist.length === 0) {
    audioStore.initTimePeriod();

    void nextTick(() => {
      const validIndices = audioStore.playlist
        .map((t, i) => ({ t, i }))
        .filter(({ t }) => !audioStore.playerSettings.disabled.includes(t.src))
        .map(({ i }) => i);

      let startIdx = 0;
      if (validIndices.length > 0) {
        startIdx =
          audioStore.playerSettings.mode === 1
            ? validIndices[Math.floor(Math.random() * validIndices.length)]
            : validIndices[0];
      }
      audioStore.loadTrack(startIdx, false);
    });
  }

  const unlockAudio = (): void => {
    if (appStore.settings.autoPlay && !audioStore.isPlaying && audioStore.currentTrack) {
      audioStore.playTrack();
    }
    ['click', 'touchstart', 'keydown'].forEach((evt) => {
      document.removeEventListener(evt, unlockAudio);
    });
  };

  ['click', 'touchstart', 'keydown'].forEach((evt) => {
    document.addEventListener(evt, unlockAudio);
  });
});

onBeforeUnmount(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
});

watch(
  () => appStore.activeTab,
  (newTab) => {
    if (newTab === 2 && !generatedSvg.value) {
      generatePlant();
    }
  },
);
</script>

<style scoped>
.garden-frame {
  position: relative; /* 确保Canvas可绝对定位在画框内 */
}

/* 飞禽走兽彩蛋样式 */
.beast-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 穿透点击，不影响音乐及其他操作 */
}

.beast-title {
  position: absolute;
  top: 20%;
  z-index: 6;
  animation: beastBreath 4s infinite alternate ease-in-out;
  padding-left: 12px; /* 修正字间距带来的居中视觉偏移 */
  width: 100%;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
  font-size: 24px;
  font-family: 'KaiTi', 'STKaiti', serif;
  letter-spacing: 12px;
  text-align: center;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.6),
    0 0 20px rgba(255, 215, 0, 0.6);
}

@keyframes beastBreath {
  0% {
    transform: scale(0.95);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.05);
    opacity: 1;
  }
}
:deep(.p-album-art.morning) {
  --player-theme: #4bb5a3;
  --player-bg-active: rgba(75, 181, 163, 0.15);
  --player-bg-active-dark: rgba(75, 181, 163, 0.2);
}
:deep(.p-album-art.afternoon) {
  --player-theme: #e67e22;
  --player-bg-active: rgba(230, 126, 34, 0.12);
  --player-bg-active-dark: rgba(230, 126, 34, 0.2);
}
:deep(.p-album-art.evening) {
  --player-theme: #8e7cc3;
  --player-bg-active: rgba(142, 124, 195, 0.15);
  --player-bg-active-dark: rgba(142, 124, 195, 0.2);
}
:deep(.p-album-art.birthday) {
  --player-theme: #ff85a2;
  --player-bg-active: rgba(255, 133, 162, 0.15);
  --player-bg-active-dark: rgba(255, 133, 162, 0.2);
}

.mini-player {
  --player-theme: var(--tab-3);
  --player-bg-active: rgba(163, 217, 177, 0.2);
  --player-bg-active-dark: rgba(163, 217, 177, 0.1);
}

.marquee-container {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}
.marquee-inner {
  display: inline-block;
  animation: scroll-left 8s linear infinite;
}
@keyframes scroll-left {
  0% {
    transform: translateX(10%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
