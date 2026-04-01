import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useChatStore } from './useChatStore';

export const useEnvStore = defineStore('envStore', () => {
  const weatherMap = ref<Record<string, { emoji: string; text: string; min: number; max: number }>>(
    {},
  );
  const holidayMap = ref<Record<string, string>>({});

  const isSyncing = ref(false);

  const getWeatherEmoji = (code: number): { emoji: string; text: string } => {
    if ([0].includes(code)) return { emoji: '☀️', text: '晴' };
    if ([1, 2, 3].includes(code)) return { emoji: '⛅', text: '多云' };
    if ([45, 48].includes(code)) return { emoji: '🌫️', text: '雾' };
    if ([51, 53, 55, 56, 57].includes(code)) return { emoji: '🌧️', text: '毛毛雨' };
    if ([61, 63, 65, 66, 67].includes(code)) return { emoji: '🌧️', text: '雨' };
    if ([71, 73, 75, 77].includes(code)) return { emoji: '❄️', text: '雪' };
    if ([80, 81, 82].includes(code)) return { emoji: '🌦️', text: '阵雨' };
    if ([85, 86].includes(code)) return { emoji: '🌨️', text: '阵雪' };
    if ([95, 96, 99].includes(code)) return { emoji: '⛈️', text: '雷阵雨' };
    return { emoji: '🌈', text: '未知' };
  };

  const fetchHolidays = async (countryCode: string): Promise<void> => {
    const currentYear = new Date().getFullYear();
    const cacheKey = `LinUI_HolidayCache_${countryCode}`;
    const cache = JSON.parse(localStorage.getItem(cacheKey) ?? 'null') as {
      timestamp: number;
      data: Record<string, string>;
    } | null;

    if (cache && Date.now() - cache.timestamp < 7 * 24 * 60 * 60 * 1000) {
      holidayMap.value = cache.data;
      return;
    }

    const parsedHolidays: Record<string, string> = {};

    try {
      if (countryCode === 'CN') {
        const res = await fetch(
          'https://raw.githubusercontent.com/lanceliao/china-holiday-calender/master/holidayAPI.json',
        );
        const data = (await res.json()) as {
          Years?: Record<string, { Days?: { Month: string; Day: number; Name?: string }[] }[]>;
        };
        const years = data.Years ?? {};
        for (const year in years) {
          const yearData = years[year] || [];
          for (const monthData of yearData) {
            for (const day of monthData.Days ?? []) {
              const dateStr = `20${day.Month.substring(0, 2)}-${day.Month.substring(2, 4)}-${String(day.Day).padStart(2, '0')}`;
              parsedHolidays[dateStr] = day.Name ?? '节假日';
            }
          }
        }
      } else {
        const fetchYear = async (y: number): Promise<void> => {
          try {
            const res = await fetch(
              `https://date.nager.at/api/v3/PublicHolidays/${y}/${countryCode}`,
            );
            if (res.ok) {
              const data = (await res.json()) as {
                date: string;
                localName?: string;
                name: string;
              }[];
              data.forEach((h) => {
                parsedHolidays[h.date] = h.localName ?? h.name;
              });
            }
          } catch (e: unknown) {
            console.warn(`[LinUI] 获取节假日数据失败 (年份: ${y})`, e);
          }
        };
        await Promise.all([fetchYear(currentYear), fetchYear(currentYear + 1)]);
      }

      holidayMap.value = parsedHolidays;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: parsedHolidays }),
      );
    } catch (e) {
      console.warn('[LinUI] 获取节假日失败', e);
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('当前浏览器不支持定位功能。'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          let msg = '定位获取失败。';
          if (err.code === 1) msg = '定位权限被拒绝。请在浏览器中允许酒馆(SillyTavern)获取位置。';
          if (err.code === 2) msg = '无法获取当前位置(信号弱或无网络)。';
          if (err.code === 3) msg = '获取定位超时。';
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        },
      );
    });
  };

  const syncEnvDataToWorldbook = async (enabled: boolean): Promise<void> => {
    if (!enabled) {
      removeWorldbookEntry();
      return;
    }

    if (isSyncing.value) return;
    isSyncing.value = true;

    try {
      const { lat, lon } = await getCurrentLocation();

      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`,
      );
      const geoData = (await geoRes.json()) as {
        locality?: string;
        city?: string;
        principalSubdivision?: string;
        countryCode?: string;
      };
      const city = geoData.locality ?? geoData.city ?? geoData.principalSubdivision ?? '未知城市';
      const countryCode = geoData.countryCode ?? 'CN';

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`,
      );
      const weatherData = (await weatherRes.json()) as {
        daily?: {
          time?: string[];
          weathercode?: number[];
          temperature_2m_min?: number[];
          temperature_2m_max?: number[];
        };
      };
      const daily = weatherData.daily ?? {};
      let weatherPrompt = '';

      const time = daily.time ?? [];
      const weathercode = daily.weathercode ?? [];
      const temperature_2m_min = daily.temperature_2m_min ?? [];
      const temperature_2m_max = daily.temperature_2m_max ?? [];

      for (let i = 0; i < time.length; i++) {
        const date = time[i];
        const code = weathercode[i];
        const min = temperature_2m_min[i];
        const max = temperature_2m_max[i];
        const { emoji, text } = getWeatherEmoji(code);

        weatherMap.value[date] = { emoji, text, min, max };
        weatherPrompt += `- ${date}: ${text}${emoji}, ${min}°C ~ ${max}°C\n`;
      }

      await fetchHolidays(countryCode);

      const nowTs = Date.now();
      const upcomingHolidays = Object.entries(holidayMap.value)
        .filter(([date]) => {
          const dTs = new Date(date).getTime();
          return dTs >= nowTs - 86400000 && dTs <= nowTs + 30 * 86400000;
        })
        .map(([date, name]) => `- ${date}: ${name}`)
        .join('\n');

      const promptStr = `【环境同步数据】\n所在地：${city} (${countryCode})\n\n[未来七天天气]\n${weatherPrompt}\n[近期30天节假日]\n${upcomingHolidays ? upcomingHolidays : '近期无节假日'}\n\n(此信息供AI参考当前现实世界的外部环境，在自然对话中顺畅应用。不必强行提及，但若聊天话题涉及气温、出门或放假时应保持认知一致。)`;

      const chatStore = useChatStore();
      chatStore.addTempPromptToHost(promptStr, { name: 'lin_env_sync' });
    } catch (e: unknown) {
      console.error('[LinUI] 环境数据同步失败', e);
      alert((e as Error).message ?? '同步环境数据失败，请检查网络。');
      throw e;
    } finally {
      isSyncing.value = false;
    }
  };

  const removeWorldbookEntry = (): void => {
    const chatStore = useChatStore();
    chatStore.removeTempPromptFromHost('lin_env_sync');
  };

  return { weatherMap, holidayMap, isSyncing, syncEnvDataToWorldbook };
});
