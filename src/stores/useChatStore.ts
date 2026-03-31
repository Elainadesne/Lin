import { useDateFormat } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppMessageEvent, ChatMessage, DossierState } from '../types';

export const useChatStore = defineStore('chatStore', () => {
  const messages = ref<ChatMessage[]>([]);
  const isGenerating = ref(false);

  const dossier = ref<DossierState>({
    病历状态: '加载中...',
    本次记录: '加载中...',
    上次互动: '加载中...',
    当前关系: '加载中...',
    特殊性: '加载中...',
    优势资源: '加载中...',
    注意事项: '加载中...',
    问题成因: '加载中...',
    影响评估: '加载中...',
    干预方案: '加载中...',
    执行事项: '加载中...',
    预期目标: '加载中...',
  });

  const syncedInputText = ref('');

  const streamText = ref('');

  const availableDates = computed(() => {
    const dates = new Set<string>();
    messages.value.forEach((msg) => {
      if (msg.date) dates.add(msg.date);
    });
    return Array.from(dates).sort();
  });

  const parseStatusString = (rawStr: string): Partial<DossierState> | null => {
    const statusMatch = rawStr.match(/<状态栏>([\s\S]*?)<\/状态栏>/);
    if (!statusMatch) return null;

    const statusContent = statusMatch[1];
    const extract = (key: string) => {
      const regex = new RegExp(`${key}【([\\s\\S]*?)】`);
      const match = statusContent.match(regex);
      return match ? match[1].trim() : '';
    };

    return {
      病历状态: extract('病历状态'),
      本次记录: extract('本次记录'),
      上次互动: extract('上次互动'),
      当前关系: extract('当前关系'),
      特殊性: extract('特殊性'),
      优势资源: extract('优势资源'),
      注意事项: extract('注意事项'),
      问题成因: extract('问题成因'),
      影响评估: extract('影响评估'),
      干预方案: extract('干预方案'),
      执行事项: extract('执行事项'),
      预期目标: extract('预期目标'),
    };
  };

  const handleHostMessage = (event: AppMessageEvent) => {
    const { type, text, state, messages: incomingMsgs } = event.data;

    if (type === 'GEN_STATE') {
      isGenerating.value = Boolean(state);
      if (!isGenerating.value) {
        streamText.value = '';
      }
    }

    if (type === 'SYNC_INPUT_FROM_ST' && typeof text === 'string') {
      syncedInputText.value = text;
    }

    if (type === 'CLEAR_STORAGE') {
      localStorage.clear();
      window.location.reload();
    }

    if (type === 'STREAM_UPDATE' && typeof text === 'string') {
      streamText.value = text;
      const parsedStatus = parseStatusString(text);
      if (parsedStatus) {
        Object.assign(dossier.value, parsedStatus);
      }
    }

    if (type === 'SYNC_CHAT' && Array.isArray(incomingMsgs)) {
      const newMessages: ChatMessage[] = incomingMsgs.map((m: any, index: number) => {
        let formattedDate = useDateFormat(new Date(), 'YYYY-MM-DD').value;
        if (m.timestamp) {
          const match = String(m.timestamp).match(
            /(\d{4})[年\-\/.]\s*(\d{1,2})[月\-\/.]\s*(\d{1,2})/,
          );
          if (match) {
            formattedDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
          } else {
            const d = new Date(m.timestamp);
            if (!isNaN(d.getTime())) {
              formattedDate = useDateFormat(d, 'YYYY-MM-DD').value;
            }
          }
        }

        const isAI = m.role === 'ai';
        let parsedStatus: Partial<DossierState> | null = null;
        if (isAI && index === incomingMsgs.length - 1) {
          parsedStatus = parseStatusString(m.text || '');
        }

        return {
          id: `msg_${index}_${m.timestamp || Date.now()}`,
          role: m.role,
          rawText: m.text || '',
          parsedHtml: '',
          date: formattedDate,
          statusData: parsedStatus,
        };
      });

      const latestMsgWithStatus = newMessages.filter((m) => m.statusData).pop();
      if (latestMsgWithStatus && latestMsgWithStatus.statusData) {
        Object.assign(dossier.value, latestMsgWithStatus.statusData);
      }

      messages.value = newMessages;
    }
  };

  const sendMessageToHost = (text: string) => {
    if (!text.trim() || isGenerating.value) return;

    messages.value.push({
      id: `msg_temp_${Date.now()}`,
      role: 'user',
      rawText: text,
      parsedHtml: text,
      date: useDateFormat(new Date(), 'YYYY-MM-DD').value,
    });

    if (window.parent !== window) {
      window.parent.postMessage({ type: 'SEND_CHAT_TO_ST', text: text }, '*');
    }
  };

  const stopGeneration = () => {
    if (window.parent !== window && isGenerating.value) {
      window.parent.postMessage({ type: 'STOP_GEN_TO_ST' }, '*');
    }
  };

  const syncInputToHost = (text: string) => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'SYNC_INPUT_TO_ST', text }, '*');
    }
  };

  const addTempPromptToHost = (text: string, options?: { name?: string }) => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ADD_TEMP_PROMPT', text, name: options?.name }, '*');
    }
  };

  const removeTempPromptFromHost = (name: string) => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'REMOVE_TEMP_PROMPT', name }, '*');
    }
  };

  return {
    removeTempPromptFromHost,
    messages,
    dossier,
    availableDates,
    isGenerating,
    syncedInputText,
    streamText,
    handleHostMessage,
    sendMessageToHost,
    stopGeneration,
    syncInputToHost,
    addTempPromptToHost,
  };
});
