export interface DossierState {
  病历状态: string;
  本次记录: string;
  上次互动: string;
  当前关系: string;
  特殊性: string;
  优势资源: string;
  注意事项: string;
  问题成因: string;
  影响评估: string;
  干预方案: string;
  执行事项: string;
  预期目标: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  rawText: string;
  parsedHtml: string;
  timestamp?: number | string;
  date?: string;
  statusData?: Partial<DossierState> | null;
  isTarot?: boolean;
  scaleId?: string;
}

export interface GlobalSettings {
  vol: number;
  fontSize: number;
  turnSpeed: number;
  autoPlay: boolean;
  autoOpen: boolean;
  useSysFont: boolean;
  syncEnvData: boolean;
}

export interface PlayerSettings {
  mode: number;
  disabled: string[];
}

export interface AudioTrack {
  artist: string;
  name: string;
  src: string;
}

export interface TarotCard {
  id: string;
  path: string;
  cn: string;
}

export interface ScaleOption {
  label: string;
  value: number;
}

export interface ScaleQuestion {
  q: string;
  f?: string;
}

export interface ScaleFactor {
  name: string;
  count: number;
}

export interface ScaleForm {
  title: string;
  desc: string;
  questions: ScaleQuestion[];
  options: ScaleOption[];
  factors?: Record<string, ScaleFactor>;
  reference?: string;
}

export interface PlantVariant {
  n: string;
  c: string[];
  w: number;
  tCol?: string;
  lCol?: string;
  m?: Record<string, any>;
}

export interface PlantConfig {
  arch: 'vine' | 'herb' | 'tree' | 'basal';
  fType: string;
  lShape: string;
  tCol: string;
  lCol: string;
  baseLen?: number;
  lenVar?: number;
  sympodial?: boolean;
  vars: PlantVariant[];
  fCol?: string[];
  name?: string;
  m?: Record<string, any>;
}

export type AppMessageType =
  | 'TRIGGER_BIRTHDAY'
  | 'TRIGGER_TAROT'
  | 'TRIGGER_SCALE'
  | 'SYNC_CHAT'
  | 'SYNC_INPUT_FROM_ST'
  | 'GEN_STATE'
  | 'CLEAR_STORAGE'
  | 'STREAM_UPDATE';

export interface AppMessageEvent extends MessageEvent {
  data: {
    type: AppMessageType;
    [key: string]: any;
  };
}
