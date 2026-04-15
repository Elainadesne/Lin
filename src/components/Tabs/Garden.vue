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
    if (appStore.activeTab !== 2) {
      animFrameId = requestAnimationFrame(animate);
      return;
    }
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
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: center;
  transform-style: preserve-3d;
  margin-bottom: 10px;
  box-shadow:
    inset 0 10px 25px rgba(0, 0, 0, 0.1),
    inset 0 2px 5px rgba(0, 0, 0, 0.05),
    0 1px 1px rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  background: transparent;
  padding: 10px;
  height: 35vh;
  min-height: 200px;
  overflow: visible;
}

body.dark-mode .garden-frame {
  box-shadow:
    inset 0 15px 35px rgba(0, 0, 0, 0.5),
    inset 0 2px 5px rgba(0, 0, 0, 0.4),
    0 1px 1px rgba(255, 255, 255, 0.05);
}

.garden-frame::before {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  mix-blend-mode: soft-light;
  clip-path: inset(0 round 12px);
  filter: blur(2px);
  animation: sun-ray 6s ease-in-out infinite alternate;
  border-radius: 12px;
  background:
    radial-gradient(ellipse at 50% -20%, rgba(255, 250, 230, 0.6) 0%, transparent 60%),
    conic-gradient(
      from 160deg at 50% -10%,
      transparent 0deg,
      rgba(255, 255, 255, 0.4) 20deg,
      transparent 40deg
    );
  background-blend-mode: overlay;
  pointer-events: none;
  content: '';
}

body.dark-mode .garden-frame::before {
  filter: blur(2px);
  background:
    radial-gradient(ellipse at 50% -20%, rgba(180, 200, 255, 0.2) 0%, transparent 60%),
    conic-gradient(
      from 160deg at 50% -10%,
      transparent 0deg,
      rgba(200, 220, 255, 0.15) 20deg,
      transparent 40deg
    );
}

@keyframes sun-ray {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(5px) scale(1.02);
    opacity: 1;
  }
}

.garden-svg-container {
  position: relative;
  z-index: 3;
  background: radial-gradient(circle at 50% 100%, rgba(0, 0, 0, 0.05) 0%, transparent 50%);
  width: 100%;
  height: 100%;
}
body.dark-mode .garden-svg-container {
  background: radial-gradient(circle at 50% 100%, rgba(0, 0, 0, 0.3) 0%, transparent 50%);
}
.garden-label {
  margin-top: 10px;
  background: linear-gradient(110deg, #b6303b 0%, #8a5701 33%, #14713a 66%, #1263b3 100%);
  -webkit-background-clip: text;
  background-clip: text;
  padding-top: 10px;
  width: 100%;
  font-weight: bold;
  font-size: calc(var(--base-font-size) + 8px);
  font-family: var(--font-children);
  letter-spacing: 2px;
  text-align: center;
  -webkit-text-fill-color: transparent;
  transform: translateZ(0);
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.15));
  color: transparent;
}

body.dark-mode .garden-label {
  border-top-color: rgba(255, 255, 255, 0.15);
  background: linear-gradient(110deg, #ff9a9e 0%, #fecfef 33%, #a1c4fd 66%, #c2e9fb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.5));
  color: transparent;
}

.svg-stem {
  animation: draw-plant 2.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  fill: none;
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.svg-leaf {
  transform: scale(0);
  transform-origin: center;
  opacity: 0;
  animation: grow-leaf 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes draw-plant {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes grow-leaf {
  to {
    transform: scale(1);
    opacity: 0.9;
  }
}

.mini-player {
  position: relative;
  z-index: 5;
  margin: 25% auto 0 auto;
  width: 88%;
  max-width: none;
}

.setting-item {
  display: flex;
  flex-direction: column;
  margin-top: 35px;
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.setting-row label {
  margin-bottom: 0 !important;
}
.switch {
  display: inline-block;
  position: relative;
  width: 50px;
  height: 26px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.switch input {
  opacity: 0;
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
  background-color: var(--player-theme);
}
input:checked + .slider:before {
  transform: translateX(24px);
}
.player-info {
  position: absolute;
  top: 0;
  right: 10px;
  left: 10px;
  transform: translateY(0);
  opacity: 0;
  z-index: 1;
  backdrop-filter: blur(5px);
  clip-path: inset(-30px -30px 100% -30px);
  transition:
    transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    clip-path 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.4s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.65);
  padding: 10px 15px 25px 105px;
  height: auto;
  pointer-events: none;
}
body.dark-mode .player-info {
  border-color: rgba(255, 255, 255, 0.05);
  background-color: var(--card-bg);
}

.p-artist {
  display: block;
  margin-bottom: 3px;
  max-width: calc(100% - 65px);
  overflow: hidden;
  color: var(--text-main);
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 1px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.p-name {
  display: block;
  opacity: 0.8;
  margin-bottom: 10px;
  max-width: calc(100% - 65px);
  overflow: hidden;
  color: var(--text-ai);
  font-size: 11px;
  font-family: 'Courier New', Courier, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.p-time-display {
  position: absolute;
  top: 26px;
  right: 15px;
  opacity: 0.6;
  margin: 0;
  color: var(--text-main);
  font-size: 9px;
  font-family: 'Courier New', Courier, monospace;
}

@media (max-width: 768px) {
  .player-info {
    padding-left: 20px;
  }
  .p-controls {
    padding: 0 10px 0 80px;
  }
  .p-album-art {
    top: -8px;
    left: 10px;
    width: 60px;
    height: 60px;
  }
  .player-control-panel.active .p-album-art {
    transform: scale(1.02);
  }
  .p-btn {
    margin: 0 2px;
  }
}

.p-progress-bar {
  position: relative;
  transition: height 0.2s;
  cursor: pointer;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.08);
  width: 100%;
  height: 6px;
  pointer-events: auto;
}
.p-progress-bar:hover {
  height: 8px;
}
body.dark-mode .p-progress-bar {
  background-color: rgba(255, 255, 255, 0.1);
}
.p-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  transition: width 0.15s linear;
  border-radius: 3px;
  background-color: var(--player-theme);
  width: 0%;
  pointer-events: none;
}
.p-bar::after {
  position: absolute;
  top: 50%;
  right: -4px;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  background: #fff;
  width: 8px;
  height: 8px;
  content: '';
}
.p-progress-bar:hover .p-bar::after {
  opacity: 1;
}

.player-info.active {
  transform: translateY(calc(-100% + 25px));
  opacity: 1;
  clip-path: inset(-30px -30px 25px -30px);
}

.player-control-panel {
  display: flex;
  position: relative;
  align-items: center;
  z-index: 5;
  box-shadow:
    0px 8px 20px rgba(0, 0, 0, 0.04),
    inset 0 1px 1px rgba(255, 255, 255, 0.4);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background-color: var(--card-bg);
  width: 100%;
  height: 70px;
}
body.dark-mode .player-control-panel {
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
}

.p-album-art {
  position: absolute;
  top: -15px;
  left: 15px;
  transform: scale(1);
  transition: all 0.5s ease;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
  border: 3px solid #fff;
  border-radius: 50%;
  width: 75px;
  height: 75px;
}
.p-album-art.morning {
  background: linear-gradient(135deg, #f9d423 0%, #b4e2d5 100%);
}
.p-album-art.afternoon {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}
.p-album-art.evening {
  background: linear-gradient(135deg, #1f1c2c 0%, #928dab 100%);
}
.p-album-art.birthday {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a1c4fd 100%);
}
body.dark-mode .p-album-art {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  border-color: #24283b;
}
.p-album-art::after {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  background-color: #fff;
  width: 12px;
  height: 12px;
  content: '';
}
body.dark-mode .p-album-art::after {
  background-color: #24283b;
}
.p-album-art::before {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 50%;
  background-image: url('data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="50" cy="50" r="45" fill="none" stroke="%23ffffff" stroke-width="1.5" stroke-dasharray="10 5" opacity="0.6" /%3E%3Ccircle cx="50" cy="50" r="30" fill="none" stroke="%23ffffff" stroke-width="1" stroke-dasharray="5 5" opacity="0.4" /%3E%3C/svg%3E');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  content: '';
}

.player-control-panel.active .p-album-art {
  transform: scale(1.05);
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
}
body.dark-mode .player-control-panel.active .p-album-art {
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.4);
}
.player-control-panel.active .p-album-art::before {
  animation: p-rotation 5s infinite linear;
}
@keyframes p-rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.p-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 15px 0 100px;
  width: 100%;
  height: 100%;
}
.p-btn {
  opacity: 0.6;
  transition: all 0.2s ease;
  cursor: pointer;
  margin: 0 4px;
  border-radius: 50%;
  background-position: center center;
  background-size: 16px;
  background-repeat: no-repeat;
  width: 40px;
  height: 40px;
}
body.dark-mode .p-btn {
  filter: invert(0.8);
}
.p-btn:active {
  transform: scale(0.9);
}
.p-btn:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.04);
}

.p-mode {
  margin-right: 2px;
  background-size: 16px;
}
.p-mode.loop {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232d3748'%3E%3Cpath d='M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z'/%3E%3C/svg%3E");
}
.p-mode.random {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232d3748'%3E%3Cpath d='M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z'/%3E%3C/svg%3E");
}
.p-mode.single {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232d3748'%3E%3Cpath d='M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z'/%3E%3C/svg%3E");
}
.p-prev {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232d3748'%3E%3Cpath d='M6 6h2v12H6zm3.5 6l8.5 6V6z'/%3E%3C/svg%3E");
}
.p-play {
  opacity: 0.9;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232d3748'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
  background-size: 20px;
}
.p-play.playing {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232d3748'%3E%3Cpath d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/%3E%3C/svg%3E");
}
.p-next {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232d3748'%3E%3Cpath d='M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z'/%3E%3C/svg%3E");
}

.playlist-container {
  margin-top: 6%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--card-bg);
  padding: 10px;
  max-height: max(180px, 25vh);
  overflow-y: auto;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
  scrollbar-width: thin;
}
body.dark-mode .playlist-container {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.05);
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}
.playlist-container::-webkit-scrollbar {
  width: 6px;
}
.playlist-container::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.1);
}
body.dark-mode .playlist-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

.playlist-item {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  transition:
    background 0.2s,
    opacity 0.3s;
  cursor: pointer;
  margin-bottom: 6px;
  border-radius: 6px;
  padding: 8px 12px;
}
.playlist-item-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}
.playlist-item:hover {
  background: rgba(0, 0, 0, 0.03);
}
body.dark-mode .playlist-item:hover {
  background: rgba(255, 255, 255, 0.08);
}
.playlist-item.active {
  border-left: 3px solid var(--player-theme);
  background: var(--player-bg-active);
}
body.dark-mode .playlist-item.active {
  background: var(--player-bg-active-dark);
}

.playlist-item.disabled {
  opacity: 0.4;
  filter: grayscale(100%);
  text-decoration: line-through;
}
.playlist-item.active .li-title {
  display: inline-block;
  position: relative;
  transition: color 0.8s ease;
  color: var(--player-theme);
}
.playlist-item.active::after {
  position: absolute;
  top: 50%;
  right: 35px;
  transform: translateY(-50%);
  animation: eqPulse 1s infinite alternate;
  pointer-events: none;
  content: 'ılıılı';
  color: var(--player-theme);
  font-size: 10px;
  letter-spacing: 1px;
}
@keyframes eqPulse {
  0% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.li-artist {
  opacity: 0.8;
  overflow: hidden;
  color: var(--text-main);
  font-weight: 800;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.li-title {
  margin-top: 2px;
  width: max-content;
  overflow: hidden;
  color: var(--text-ai);
  font-weight: 600;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.li-toggle {
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 0 5px;
  font-size: 14px;
}
.li-toggle:hover {
  opacity: 1;
}

.player-control-panel.active .p-album-art::before {
  transform: translateZ(0);
  animation: p-rotation 5s infinite linear;
  will-change: transform;
}
.playlist-item.active .li-title::after {
  will-change: opacity;
}

.botany-svg {
  transform: translateZ(20px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15));
  will-change: filter, transform;
  overflow: visible !important;
}
body.dark-mode .botany-svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.4));
}
.garden-frame {
  position: relative;
}

.beast-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.beast-title {
  position: absolute;
  top: 20%;
  z-index: 6;
  animation: beastBreath 4s infinite alternate ease-in-out;
  padding-left: 12px;
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

<style>
:root {
  --player-theme: #bdc7b9;
  --player-bg-active: rgba(163, 217, 177, 0.2);
  --player-bg-active-dark: rgba(163, 217, 177, 0.1);
}
body:has(.p-album-art.morning) {
  --player-theme: #4bb5a3;
  --player-bg-active: rgba(75, 181, 163, 0.15);
  --player-bg-active-dark: rgba(75, 181, 163, 0.2);
}
body:has(.p-album-art.afternoon) {
  --player-theme: #e67e22;
  --player-bg-active: rgba(230, 126, 34, 0.12);
  --player-bg-active-dark: rgba(230, 126, 34, 0.2);
}
body:has(.p-album-art.evening) {
  --player-theme: #8e7cc3;
  --player-bg-active: rgba(142, 124, 195, 0.15);
  --player-bg-active-dark: rgba(142, 124, 195, 0.2);
}
body:has(.p-album-art.birthday) {
  --player-theme: #ff85a2;
  --player-bg-active: rgba(255, 133, 162, 0.15);
  --player-bg-active-dark: rgba(255, 133, 162, 0.2);
}
</style>
