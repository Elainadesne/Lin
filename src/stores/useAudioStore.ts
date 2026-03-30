import { useStorage } from '@vueuse/core';
import { Howl, Howler } from 'howler';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import type { AudioTrack, PlayerSettings } from '../types';
import { useAppStore } from './useAppStore';

declare module 'howler' {
  interface HowlerGlobal {
    _obtainHtml5Audio: () => HTMLAudioElement;
    _html5AudioPool: HTMLAudioElement[];
    _unlockAudio: () => void;
  }
}

if (typeof Howler !== 'undefined') {
  Howler._obtainHtml5Audio = function () {
    const self = this || Howler;
    if (self._html5AudioPool && self._html5AudioPool.length) {
      return self._html5AudioPool.pop() as HTMLAudioElement;
    }
    return new Audio();
  };

  const originalUnlock = Howler._unlockAudio;
  Howler._unlockAudio = function () {
    const origAdd = document.addEventListener;
    document.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === 'touchstart') return;
      origAdd.call(document, type, listener, options);
    };
    originalUnlock.apply(this, arguments as any);
    document.addEventListener = origAdd;
  };
}

const filesMap: Record<string, string[]> = {
  morning: [
    'atlasaudio-corporate-491319.mp3',
    'atlasaudio-jazz-490623.mp3',
    'atlasaudio-upbeat-491082.mp3',
    'paulyudin-piano-music-piano-485929.mp3',
    'paulyudin-technology-tech-technology-484304.mp3',
    'prettyjohn1-emotional-piano-487334.mp3',
    'prettyjohn1-medical-doctor-clinic-background-487928.mp3',
    'the_mountain-chill-485562.mp3',
    'the_mountain-luxury-luxury-music-490006.mp3',
    'the_mountain-news-news-music-490008.mp3',
    'the_mountain-presentation-presentation-music-490011.mp3',
    'the_mountain-relaxing-relaxing-music-492810.mp3',
    'the_mountain-successful-492812.mp3',
    'the_mountain-wedding-487025.mp3',
  ],
  afternoon: [
    'apalonbeats-afrobeat-afro-beat-2-491432.mp3',
    'maksym_dudchyk-lost-in-love-hip-hop-background-music-for-video-stories-43-second-490026.mp3',
    'mondamusic-background-music-491692.mp3',
    'mondamusic-promo-advertising-music-491682.mp3',
    'mondamusic-upbeat-491686.mp3',
    'paulyudin-no-copyright-music-482400.mp3',
    'the_mountain-advertising-advertising-music-492799.mp3',
    'the_mountain-hopeful-hopeful-music-492806.mp3',
    'the_mountain-meditation-meditation-music-490007.mp3',
    'the_mountain-piano-background-music-487020.mp3',
    'the_mountain-soft-background-music-492811.mp3',
    'the_mountain-upbeat-upbeat-background-music-487024.mp3',
  ],
  evening: [
    'eliveta-corporate-491206.mp3',
    'mondamusic-asian-491695.mp3',
    'mondamusic-chill-491681.mp3',
    'mondamusic-chill-beats-chill-491676.mp3',
    'mondamusic-dark-ambient-soundscape-dreamscape-2-487315.mp3',
    'mondamusic-dark-ambient-soundscape-dreamscape-2-491706.mp3',
    'mondamusic-educational-presentation-tutorial-music-491691.mp3',
    'mondamusic-lofi-chill-491719.mp3',
    'mondamusic-lofi-lofi-chill-lofi-girl-491690.mp3',
    'mondamusic-lounge-491696.mp3',
    'mondamusic-lounge-jazz-elevator-music-487312.mp3',
    'mondamusic-minimal-491664.mp3',
    'mondamusic-positive-house-491683.mp3',
    'mondamusic-vlogs-vlog-youtube-491672.mp3',
    'prettyjohn1-lofi-lofi-chill-lofi-girl-490466.mp3',
    'prettyjohn1-sad-background-music-489875.mp3',
    'the_mountain-emotional-emotional-music-490002.mp3',
  ],
};

const parseFileName = (filename: string) => {
  const rawName = filename.replace('.mp3', '');
  const parts = rawName.split('-');
  if (parts.length < 3) return { artist: '未知艺术家', title: rawName };
  const artist = parts[0].replace(/_/g, ' ').toUpperCase();
  const title = parts.slice(1, -1).join(' ').replace(/_/g, ' ');
  return { artist, title };
};

export const useAudioStore = defineStore('audioStore', () => {
  const appStore = useAppStore();

  const timePeriod = ref<'morning' | 'afternoon' | 'evening' | 'birthday'>('morning');
  const playlist = ref<AudioTrack[]>([]);
  const isBirthdayMode = ref(false);
  const currentTrackIndex = ref(0);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const totalTime = ref(0);
  const playHistory = ref<number[]>([]);

  let currentHowl: Howl | null = null;
  const fadingHowls: Howl[] = [];
  let updateIntervalId: number | null = null;

  const playerSettings = useStorage<PlayerSettings>('LinAudio_Preferences', {
    mode: 1,
    disabled: [],
  });

  const validIndices = computed(() => {
    return playlist.value
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => !playerSettings.value.disabled.includes(t.src))
      .map(({ i }) => i);
  });

  const currentTrack = computed(() => playlist.value[currentTrackIndex.value] || null);

  const initTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 18) timePeriod.value = 'afternoon';
    else if (hour >= 18 || hour < 5) timePeriod.value = 'evening';
    else timePeriod.value = 'morning';

    loadPlaylistForPeriod(timePeriod.value);
  };

  const loadPlaylistForPeriod = (period: string) => {
    const files = filesMap[period] || [];
    const baseUrl = import.meta.env.BASE_URL || '/';

    playlist.value = files.map((filename) => {
      const info = parseFileName(filename);
      return {
        artist: info.artist,
        name: info.title,
        src: `${baseUrl}music/${period}/${encodeURIComponent(filename)}`,
      };
    });
  };

  const triggerBirthdayMode = () => {
    if (isBirthdayMode.value) return;
    isBirthdayMode.value = true;
    timePeriod.value = 'birthday';

    const baseUrl = import.meta.env.BASE_URL || '/';
    const bdayTracks = [
      'the_mountain-birthday-490600.mp3',
      'the_mountain-cartoon-cartoon-music-489996.mp3',
    ].map((f) => ({
      artist: parseFileName(f).artist,
      name: parseFileName(f).title,
      src: `${baseUrl}music/birthday/${encodeURIComponent(f)}`,
    }));

    playlist.value.unshift(...bdayTracks);

    if (currentHowl) {
      currentHowl.stop();
      loadTrack(0, true);
    } else {
      loadTrack(0, appStore.settings.autoPlay);
    }
  };

  const customFade = (
    howlObj: Howl,
    from: number,
    to: number,
    duration: number,
    onComplete?: () => void,
  ) => {
    if (!howlObj) return;
    const anyHowl = howlObj as any;
    if (anyHowl._customFadeId) cancelAnimationFrame(anyHowl._customFadeId);

    const startTime = performance.now();
    const update = (now: number) => {
      let t = Math.min((now - startTime) / duration, 1);
      let vol = from < to ? from + (to - from) * (t * t) : to + (from - to) * ((1 - t) * (1 - t));

      howlObj.volume(Math.max(0, Math.min(1, vol)));

      if (t < 1) {
        anyHowl._customFadeId = requestAnimationFrame(update);
      } else {
        anyHowl._customFadeId = null;
        if (onComplete) onComplete();
      }
    };
    anyHowl._customFadeId = requestAnimationFrame(update);
  };

  const stepProgress = () => {
    if (!currentHowl || !isPlaying.value) return;
    if (currentHowl.state() !== 'loaded') return;

    const seek = currentHowl.seek();
    currentTime.value = typeof seek === 'number' ? seek : 0;

    const dur = currentHowl.duration();
    totalTime.value = typeof dur === 'number' && !isNaN(dur) && dur > 0 ? dur : 0;
  };

  const startProgressTimer = () => {
    if (updateIntervalId) clearInterval(updateIntervalId);
    updateIntervalId = window.setInterval(stepProgress, 500);
  };

  const stopProgressTimer = () => {
    if (updateIntervalId) {
      clearInterval(updateIntervalId);
      updateIntervalId = null;
    }
  };

  const loadTrack = (index: number, autoStart = false, isPrev = false) => {
    if (typeof Howl === 'undefined' || typeof Howler === 'undefined') {
      console.warn('[Lin 音乐系统] Howler.js 未加载。');
      return;
    }

    if (currentHowl && !isPrev && currentTrackIndex.value !== index) {
      playHistory.value.push(currentTrackIndex.value);
      if (playHistory.value.length > 50) playHistory.value.shift();
    }

    currentTrackIndex.value = index;
    const track = playlist.value[index];

    currentTime.value = 0;
    totalTime.value = 0;

    if (currentHowl) {
      const oldHowl = currentHowl;
      oldHowl.off();

      while (fadingHowls.length > 5) {
        const stale = fadingHowls.shift();
        stale?.stop();
        stale?.unload();
      }

      if (isPlaying.value) {
        fadingHowls.push(oldHowl);
        customFade(oldHowl, oldHowl.volume(), 0, 800, () => {
          oldHowl.stop();
          oldHowl.unload();
          const idx = fadingHowls.indexOf(oldHowl);
          if (idx !== -1) fadingHowls.splice(idx, 1);
        });
      } else {
        oldHowl.stop();
        oldHowl.unload();
      }
    }

    currentHowl = new Howl({
      src: [track.src],
      html5: true,
      preload: 'metadata',
      volume: autoStart ? 0 : 1,
    });

    currentHowl.on('load', () => {
      totalTime.value = currentHowl!.duration();
      if (autoStart) playTrack();
    });

    currentHowl.on('play', () => {
      isPlaying.value = true;
      customFade(currentHowl!, currentHowl!.volume(), 1, 1000);
      startProgressTimer();
    });

    currentHowl.on('pause', () => {
      isPlaying.value = false;
      stopProgressTimer();
    });
    currentHowl.on('stop', () => {
      isPlaying.value = false;
      stopProgressTimer();
    });

    currentHowl.on('end', () => {
      if (appStore.settings.autoPlay) playNext(true);
      else isPlaying.value = false;
    });
  };

  const playTrack = () => {
    if (!currentHowl) return;
    if (!currentHowl.playing()) {
      currentHowl.volume(0);
      currentHowl.play();
    } else {
      isPlaying.value = true;
      customFade(currentHowl, currentHowl.volume(), 1, 1000);
      startProgressTimer();
    }
  };

  const pauseTrack = () => {
    if (!currentHowl) return;
    isPlaying.value = false;
    customFade(currentHowl, currentHowl.volume(), 0, 800, () => {
      if (!isPlaying.value) currentHowl!.pause();
    });
  };

  const togglePlay = () => {
    isPlaying.value ? pauseTrack() : playTrack();
  };

  const seekTrack = (targetTime: number) => {
    if (currentHowl && currentHowl.state() === 'loaded') {
      currentHowl.seek(targetTime);
      currentTime.value = targetTime;
    }
  };

  const getNextValidIndex = (current: number, direction = 1) => {
    const valid = validIndices.value;
    if (valid.length === 0) return -1;

    if (playerSettings.value.mode === 1) {
      if (valid.length === 1) return valid[0];
      let rnd;
      do {
        rnd = valid[Math.floor(Math.random() * valid.length)];
      } while (rnd === current);
      return rnd;
    } else {
      const pos = valid.indexOf(current);
      if (pos !== -1) {
        return valid[(pos + direction + valid.length) % valid.length];
      } else {
        if (direction === 1) {
          const nextValid = valid.find((i) => i > current);
          return nextValid !== undefined ? nextValid : valid[0];
        } else {
          const prevValid = [...valid].reverse().find((i) => i < current);
          return prevValid !== undefined ? prevValid : valid[valid.length - 1];
        }
      }
    }
  };

  const playNext = (auto = false) => {
    if (validIndices.value.length === 0) return pauseTrack();
    const isCurrentDisabled = playerSettings.value.disabled.includes(
      playlist.value[currentTrackIndex.value]?.src,
    );
    let nextIndex = currentTrackIndex.value;

    if (auto && playerSettings.value.mode === 2 && !isCurrentDisabled) {
      nextIndex = currentTrackIndex.value;
    } else {
      nextIndex = getNextValidIndex(currentTrackIndex.value, 1);
    }
    loadTrack(nextIndex, true);
  };

  const playPrev = () => {
    if (validIndices.value.length === 0) return pauseTrack();

    let prevIndex = -1;
    while (playHistory.value.length > 0) {
      const idx = playHistory.value.pop()!;
      if (!playerSettings.value.disabled.includes(playlist.value[idx].src)) {
        prevIndex = idx;
        break;
      }
    }
    if (prevIndex === -1) {
      prevIndex = getNextValidIndex(currentTrackIndex.value, -1);
    }
    loadTrack(prevIndex, true, true);
  };

  watch(
    () => appStore.settings.vol,
    (vol) => {
      if (typeof Howler !== 'undefined') {
        Howler.volume(vol / 100);
      }
    },
  );

  return {
    timePeriod,
    playlist,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    totalTime,
    playerSettings,
    isBirthdayMode,

    initTimePeriod,
    triggerBirthdayMode,
    loadTrack,
    playTrack,
    pauseTrack,
    togglePlay,
    playNext,
    playPrev,
    seekTrack,
  };
});
