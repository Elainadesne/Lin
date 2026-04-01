<template>
  <div class="garden-frame">
    <div class="garden-svg-container" v-html="generatedSvg"></div>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { usePlantEngine } from '../../composables/usePlantEngine';
import { useAppStore } from '../../stores/useAppStore';
import { useAudioStore } from '../../stores/useAudioStore';

const appStore = useAppStore();
const audioStore = useAudioStore();
const { generatedSvg, gardenLabel, generatePlant } = usePlantEngine();

const progressBarRef = ref<HTMLElement | null>(null);

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
  generatePlant();
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
