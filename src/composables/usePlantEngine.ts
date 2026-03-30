import rough from 'roughjs';
import { ref } from 'vue';
import type { PlantConfig, PlantVariant } from '../types';

export const PLANT_CONFIG: PlantConfig[] = [
  {
    arch: 'vine',
    fType: 'jasmine',
    lShape: 'willow',
    tCol: '#4a5d23',
    lCol: '#5c7a1a',
    vars: [
      { n: '金梅迎春', c: ['#FFD700'], w: 7000 },
      { n: '小叶迎春', c: ['#FFEA00'], w: 2500 },
      { n: '素馨迎春', c: ['#F4C430'], w: 500 },
    ],
  },
  {
    arch: 'herb',
    fType: 'cluster',
    lShape: 'tear',
    tCol: '#5c4033',
    lCol: '#7a8f6a',
    vars: [
      { n: '金边瑞香', c: ['#E6A8D7'], w: 6000 },
      { n: '白花瑞香', c: ['#FFFFFF', '#FFB7C5'], w: 3000 },
      { n: '蔷薇瑞香', c: ['#DDA0DD'], w: 997.76 },
      { n: '林涵霁雨', c: ['#00E5FF', '#B23AEE'], w: 2.24, tCol: '#E0E0E0', lCol: '#7FFFD4' },
    ],
  },
  {
    arch: 'tree',
    fType: 'peach',
    lShape: 'none',
    tCol: '#3E2F26',
    lCol: '#2d4c1e',
    baseLen: 85,
    lenVar: 35,
    vars: [
      { n: '碧桃', c: ['#FFB7C5', '#FF69B4'], w: 6000 },
      { n: '白花桃', c: ['#FFFFFF', '#FFB7C5'], w: 3000 },
      { n: '绛桃', c: ['#FF1493', '#C71585'], w: 900 },
      {
        n: '紫叶桃',
        c: ['#FF69B4', '#FF1493'],
        w: 100,
        tCol: '#2c141d',
        m: { bProb: 0.95, fProb: 0.15 },
      },
    ],
  },
  {
    arch: 'vine',
    fType: 'rose',
    lShape: 'sharp',
    tCol: '#556B2F',
    lCol: '#3D5222',
    vars: [
      { n: '粉团蔷薇', c: ['#FFC0CB', '#FF69B4'], w: 4500 },
      { n: '七姊妹', c: ['#E32636', '#800020'], w: 3500 },
      { n: '白玉堂', c: ['#FFFFFF', '#F5F5F5'], w: 1500 },
      { n: '黄蔷薇', c: ['#FFD700', '#FFA500'], w: 450 },
      { n: '珊瑚橘', c: ['#FF7F50', '#FF4500'], w: 50 },
    ],
  },
  {
    arch: 'basal',
    fType: 'iris',
    lShape: 'sword',
    tCol: '#4F7942',
    lCol: '#4F7942',
    vars: [
      { n: '蓝蝴蝶', c: ['#6A5ACD', '#E6E6FA'], w: 6000 },
      { n: '深紫鸢尾', c: ['#4B0082', '#8A2BE2'], w: 2500 },
      { n: '白雪鸢尾', c: ['#FFFFFF', '#F0F8FF'], w: 1000 },
      { n: '金脉鸢尾', c: ['#FFD700', '#FFFACD'], w: 500 },
    ],
  },
  {
    arch: 'herb',
    fType: 'simple',
    lShape: 'round',
    tCol: '#5C5448',
    lCol: '#2E472D',
    vars: [
      { n: '大叶栀子', c: ['#FFFFFF', '#F5F5F5'], w: 8000 },
      { n: '水栀子', c: ['#FFFFF0', '#FFF8DC'], w: 2000 },
    ],
  },
  {
    arch: 'basal',
    fType: 'lotus',
    lShape: 'lotus',
    tCol: '#2E8B57',
    lCol: '#2E8B57',
    vars: [
      { n: '红建莲', c: ['#FF69B4', '#FFC0CB'], w: 6000 },
      { n: '白洋淀', c: ['#FFFFFF', '#FFEC8B'], w: 3000 },
      { n: '千瓣莲', c: ['#FF1493', '#C71585'], w: 1000, m: { layers: 5, dense: true } },
    ],
  },
  {
    arch: 'tree',
    fType: 'micro',
    lShape: 'tear',
    tCol: '#696969',
    lCol: '#355E3B',
    baseLen: 75,
    lenVar: 35,
    vars: [
      { n: '金桂', c: ['#FFD700'], w: 5500 },
      { n: '银桂', c: ['#FFFACD'], w: 3500 },
      { n: '丹桂', c: ['#FFA500'], w: 1000 },
    ],
  },
  {
    arch: 'herb',
    fType: 'mum',
    lShape: 'lobed',
    tCol: '#6B8E23',
    lCol: '#556B2F',
    vars: [
      { n: '秋菊', c: ['#FFD700', '#DAA520'], w: 4500 },
      { n: '白菊', c: ['#FFFFFF', '#D3D3D3'], w: 3000 },
      { n: '紫菊', c: ['#D8BFD8', '#800080'], w: 1500 },
      {
        n: '墨菊',
        c: ['#8B0000', '#4A0404'],
        w: 900,
        m: { cMod: 2.0, lDense: 2.5, fScale: 1.5, hMod: 0.8, dense: true },
      },
      { n: '绿菊', c: ['#98FB98', '#2E8B57'], w: 100 },
    ],
  },
  {
    arch: 'tree',
    fType: 'hibiscus',
    lShape: 'broad',
    tCol: '#5E4B3C',
    lCol: '#4F7942',
    baseLen: 70,
    lenVar: 30,
    vars: [
      { n: '晨白芙蓉', c: ['#FFFFFF', '#FFB6C1'], w: 4500 },
      { n: '午粉芙蓉', c: ['#FF69B4', '#FFF0F5'], w: 4000 },
      { n: '暮红芙蓉', c: ['#DC143C', '#FF1493'], w: 1500 },
    ],
  },
  {
    arch: 'tree',
    fType: 'rose',
    lShape: 'round',
    tCol: '#3B3C36',
    lCol: '#004225',
    baseLen: 65,
    lenVar: 25,
    vars: [
      { n: '赤丹', c: ['#DC143C', '#8B0000'], w: 5000 },
      { n: '宫粉', c: ['#FFC0CB', '#FFF0F5'], w: 3000 },
      { n: '白天鹅', c: ['#FFFFFF', '#F5F5F5'], w: 1950 },
      { n: '十八学士', c: ['#FF0000', '#FFFFFF'], w: 50, m: { phyllotaxis: true, petals: 34 } },
    ],
  },
  {
    arch: 'tree',
    fType: 'peach',
    lShape: 'none',
    tCol: '#2F2F2F',
    lCol: '#1C1C1C',
    sympodial: true,
    baseLen: 60,
    lenVar: 25,
    vars: [
      { n: '素心腊梅', c: ['#FFFF00', '#FFD700'], w: 7500 },
      { n: '狗牙腊梅', c: ['#FFFACD', '#8B008B'], w: 2500 },
    ],
  },
];

export function usePlantEngine() {
  const generatedSvg = ref('');
  const gardenLabel = ref('');

  const generatePlant = (forceMonth?: number, forceVariant?: number) => {
    const date = new Date();
    const month = forceMonth !== undefined ? forceMonth : date.getMonth();
    const monthNames = [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ];

    const cfg = JSON.parse(JSON.stringify(PLANT_CONFIG[month])) as PlantConfig;

    let selectedVar: PlantVariant | null = null;

    if (forceVariant !== undefined && forceVariant !== -1 && cfg.vars[forceVariant]) {
      selectedVar = cfg.vars[forceVariant];
    }

    if (!selectedVar && forceMonth === undefined && month === 1 && date.getDate() === 24) {
      selectedVar = cfg.vars.find((v) => v.n === '林涵霁雨') || null;
    }

    if (!selectedVar) {
      let totalWeight = cfg.vars.reduce((sum, v) => sum + v.w, 0);
      let randomSpin = Math.random() * totalWeight;
      for (const v of cfg.vars) {
        if (randomSpin < v.w) {
          selectedVar = v;
          break;
        }
        randomSpin -= v.w;
      }
      if (!selectedVar) selectedVar = cfg.vars[0];
    }

    cfg.fCol = selectedVar.c;
    cfg.name = selectedVar.n;
    if (selectedVar.tCol) cfg.tCol = selectedVar.tCol;
    if (selectedVar.lCol) cfg.lCol = selectedVar.lCol;
    cfg.m = selectedVar.m || {};

    let svgContent = `
      <svg viewBox="-20 -20 440 690" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="botany-svg" style="overflow: visible;">
      <style>
        .botany-stem { animation: drawStem 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .botany-stem path { stroke-dasharray: inherit; stroke-dashoffset: inherit; stroke-linecap: round; stroke-linejoin: round; }
        .botany-leaf { opacity: 0; animation: popOrgan 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .botany-flower { opacity: 0; animation: popOrgan 1.4s cubic-bezier(0.34, 1.56, 0.4, 1.2) forwards; }
        @keyframes drawStem { to { stroke-dashoffset: 0; } }
        @keyframes popOrgan { 
          0% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0); opacity: 0; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(var(--sc)); opacity: 1; }
        }
      </style>
      <g transform="translate(200, 620) scale(1.8)">
    `;

    const paths: string[] = [];
    const organs: string[] = [];

    const rcSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rc = rough.svg(rcSvg);

    const addStem = (
      x1: number,
      y1: number,
      cx: number,
      cy: number,
      x2: number,
      y2: number,
      width: number,
      color: string,
      delay: number,
    ) => {
      const len = Math.hypot(x2 - x1, y2 - y1) * 1.5;
      const d = `M ${x1.toFixed(1)},${y1.toFixed(1)} Q ${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
      const node = rc.path(d, {
        stroke: color,
        strokeWidth: width,
        roughness: 0.6,
        bowing: 0.2,
        disableMultiStroke: true,
      });
      node.setAttribute('class', 'botany-stem');
      node.setAttribute(
        'style',
        `stroke-dasharray:${len}; stroke-dashoffset:${len}; animation-delay:${delay}s;`,
      );
      paths.push(node.outerHTML);
    };

    const getLeafPath = (shape: string) => {
      const dict: Record<string, string> = {
        willow: 'M0,0 C-4,-15 -4,-35 0,-45 C4,-35 4,-15 0,0 Z',
        sword: 'M0,0 Q-10,-40 0,-100 Q10,-40 0,0 Z',
        lotus: 'M0,-10 C-35,-10 -45,-35 0,-45 C45,-35 35,-10 0,-10 Z',
        lobed:
          'M0,0 C-10,-10 -20,-5 -15,-20 C-25,-25 -10,-35 0,-40 C10,-35 25,-25 15,-20 C20,-5 10,-10 0,0 Z',
        broad: 'M0,0 C-20,-10 -25,-30 0,-45 C25,-30 20,-10 0,0 Z',
        round: 'M0,0 C-15,-8 -18,-22 0,-30 C18,-22 15,-8 0,0 Z',
        tear: 'M0,0 C-6,-8 -8,-20 0,-25 C8,-20 6,-8 0,0 Z',
        sharp: 'M0,0 L-8,-15 L0,-28 L8,-15 Z',
      };
      return dict[shape] || '';
    };

    const addLeaf = (x: number, y: number, angle: number, scale: number, delay: number) => {
      if (cfg.lShape === 'none') return;
      const node = rc.path(getLeafPath(cfg.lShape), {
        fill: cfg.lCol,
        stroke: 'rgba(255,255,255,0.4)',
        strokeWidth: 0.5,
        fillStyle: 'zigzag',
        hachureGap: 3,
        roughness: 1.5,
      });
      organs.push(
        `<g class="botany-leaf" style="--tx:${x.toFixed(1)}px; --ty:${y.toFixed(1)}px; --rot:${angle.toFixed(1)}deg; --sc:${scale.toFixed(2)}; animation-delay:${delay}s;">${node.outerHTML}</g>`,
      );
    };

    const addFlower = (x: number, y: number, angle: number, scale: number, delay: number) => {
      let fHtml = '';
      const c1 = cfg.fCol![0];
      const c2 = cfg.fCol![1] || c1;

      const rP = (
        d: string,
        fill: string,
        stroke?: string | null,
        rot?: number,
        s?: number,
        op?: number,
      ) => {
        const n = rc.path(d, {
          fill,
          stroke: stroke || 'none',
          strokeWidth: 0.5,
          fillStyle: 'hachure',
          roughness: 1.5,
          hachureGap: 2.5,
        });
        if (rot || s) n.setAttribute('transform', `rotate(${rot || 0}) scale(${s || 1})`);
        if (op) n.setAttribute('opacity', op.toString());
        return n.outerHTML;
      };

      const rC = (
        cx: number,
        cy: number,
        r: number,
        fill: string,
        stroke?: string | null,
        rot?: number,
        s?: number,
        op?: number,
      ) => {
        const n = rc.circle(cx, cy, r * 2, {
          fill,
          stroke: stroke || 'none',
          strokeWidth: 0.5,
          fillStyle: 'hachure',
          roughness: 1.5,
        });
        if (rot || s) n.setAttribute('transform', `rotate(${rot || 0}) scale(${s || 1})`);
        if (op) n.setAttribute('opacity', op.toString());
        return n.outerHTML;
      };

      if (cfg.fType === 'peach') {
        for (let i = 0; i < 5; i++)
          fHtml += rP('M0,0 C-6,-10 -10,-18 0,-22 C10,-18 6,-10 0,0 Z', c1, c1, i * 72, 1, 0.9);
        fHtml += rC(0, 0, 3, c2);
      } else if (cfg.fType === 'lotus') {
        const layers = cfg.m!.layers || 3;
        for (let l = layers; l >= 1; l--) {
          const count = l * 2 + 1;
          const s = 1 - (layers - l) * 0.15;
          const pC = l % 2 === 0 ? c2 : c1;
          const spread = 25 + l * 12;
          for (let i = 0; i < count; i++) {
            const rot = -spread + ((spread * 2) / (count - 1 || 1)) * i + (Math.random() * 4 - 2);
            const shape = cfg.m!.dense
              ? 'M0,0 C-5,-20 -3,-45 0,-50 C3,-45 5,-20 0,0 Z'
              : 'M0,0 C-10,-15 -8,-45 0,-50 C8,-45 10,-15 0,0 Z';
            fHtml += rP(shape, pC, pC, rot, s, 0.9);
          }
        }
        const stamen = rc.ellipse(0, -8, 12, 6, {
          fill: '#FFD700',
          stroke: 'none',
          strokeWidth: 0.5,
          fillStyle: 'hachure',
          roughness: 1.5,
        });
        stamen.setAttribute('opacity', '0.85');
        fHtml += stamen.outerHTML;
      } else if (cfg.fType === 'mum') {
        const mDense = cfg.m!.dense ? 40 : 24;
        for (let i = 0; i < mDense; i++) {
          const r = 1 - Math.random() * 0.35;
          const rot = i * (360 / mDense) + Math.random() * 8;
          fHtml += rP(`M0,0 Q-4,-20 0,-${40 * r} Q4,-20 0,0 Z`, c1, c1, rot, 1, 0.85);
          fHtml += rP(`M0,0 Q-2,-10 0,-${20 * r} Q2,-10 0,0 Z`, c2, c2, rot + 15, 1, 0.95);
        }
        fHtml += rC(0, 0, 4, c2);
      } else if (cfg.fType === 'iris') {
        fHtml += rP('M0,0 C-15,-20 -20,-40 0,-45 C20,-40 15,-20 0,0 Z', c2, c2, 0, 1, 0.9);
        fHtml += rP('M0,0 C-20,10 -25,35 0,40 C25,35 20,10 0,0 Z', c1, c1, 60, 1, 0.9);
        fHtml += rP('M0,0 C-20,10 -25,35 0,40 C25,35 20,10 0,0 Z', c1, c1, -60, 1, 0.9);
      } else if (cfg.fType === 'rose') {
        const count = cfg.m!.petals || 8;
        for (let i = 1; i <= count; i++) {
          let s,
            rot,
            cx = 0,
            cy = -6,
            c;
          if (cfg.m!.phyllotaxis) {
            const r = 2.0 * Math.sqrt(i);
            rot = i * 137.5;
            cx = r * Math.sin((rot * Math.PI) / 180);
            cy = -r * Math.cos((rot * Math.PI) / 180);
            s = 1.2 - i * (1.0 / count);
            c = i > count / 2 ? c2 : c1;
          } else {
            s = 1 - i * 0.08;
            rot = i * 65;
            c = i % 2 === 0 ? c1 : c2;
          }
          fHtml += rC(cx, cy, 10, c, c, rot, s, 0.95);
        }
      } else if (cfg.fType === 'hibiscus') {
        for (let i = 0; i < 5; i++) {
          const rot = i * 72 + (Math.random() * 10 - 5);
          fHtml += rP('M0,0 C-25,-10 -35,-40 0,-45 C35,-40 25,-10 0,0 Z', c1, c1, rot, 1, 0.85);
          fHtml += rP('M0,0 C-10,-5 -15,-20 0,-25 C15,-20 10,-5 0,0 Z', c2, c2, rot, 1, 0.6);
        }
        const stamen = rc.path('M0,0 Q5,-15 0,-28', {
          stroke: '#FFD700',
          strokeWidth: 2,
          roughness: 1.5,
        });
        fHtml += stamen.outerHTML;
        fHtml += rC(0, -28, 2.5, '#FFA500');
        fHtml += rC(-2.5, -25, 1.5, '#FFA500');
        fHtml += rC(2.5, -25, 1.5, '#FFA500');
      } else if (cfg.fType === 'jasmine' || cfg.fType === 'simple') {
        for (let i = 0; i < 4; i++) fHtml += rP('M0,0 Q-8,-15 0,-20 Q8,-15 0,0 Z', c1, c1, i * 90);
        fHtml += rC(0, 0, 2, '#FFD700');
      } else if (cfg.fType === 'cluster' || cfg.fType === 'micro') {
        for (let i = 0; i < 5; i++) {
          const ox = (Math.random() - 0.5) * 15;
          const oy = (Math.random() - 0.5) * 15;
          fHtml += rC(ox, oy, 3, c1);
          fHtml += rC(ox + 3, oy, 3, c1);
        }
      }

      const filterStr = cfg.name === '林涵霁雨' ? `filter="drop-shadow(0 0 8px ${c1})"` : '';
      organs.push(
        `<g class="botany-flower" style="--tx:${x.toFixed(1)}px; --ty:${y.toFixed(1)}px; --rot:${angle.toFixed(1)}deg; --sc:${scale.toFixed(2)}; animation-delay:${delay}s;" ${filterStr}>${fHtml}</g>`,
      );
    };

    const buildTree = (
      x: number,
      y: number,
      angle: number,
      length: number,
      depth: number,
      width: number,
      delay: number,
    ) => {
      if (depth === 0) return;
      const x2 = x + Math.sin(angle) * length;
      const y2 = y - Math.cos(angle) * length;
      const isSympodial = cfg.sympodial && depth < 5;
      const cx =
        x + Math.sin(angle + (isSympodial ? 0.4 : (Math.random() - 0.5) * 0.4)) * length * 0.5;
      const cy =
        y - Math.cos(angle + (isSympodial ? 0.4 : (Math.random() - 0.5) * 0.4)) * length * 0.5;

      addStem(x, y, cx, cy, x2, y2, width, cfg.tCol, delay);
      const isEndpoint = depth === 1;
      const fProb = cfg.m!.fProb !== undefined ? cfg.m!.fProb : 0.6;
      const organScale = 1.3;

      if (cfg.fType === 'peach' || cfg.fType === 'micro') {
        if (depth <= 4 && Math.random() < fProb) {
          const blooms = Math.floor(Math.random() * 3) + 1;
          for (let b = 0; b < blooms; b++) {
            const ox = (Math.random() - 0.5) * 16;
            const oy = (Math.random() - 0.5) * 16;
            addFlower(
              x2 + ox,
              y2 + oy,
              Math.random() * 360,
              (0.6 + Math.random() * 0.5) * organScale,
              delay + 0.5 + b * 0.1,
            );
          }
        }
      } else {
        if (isEndpoint)
          addFlower(
            x2,
            y2,
            (angle * 180) / Math.PI + (Math.random() * 60 - 30),
            (1.0 + Math.random() * 0.4) * organScale,
            delay + 0.6,
          );
      }

      if (!isEndpoint && cfg.lShape !== 'none' && Math.random() < 0.8) {
        addLeaf(
          x2,
          y2,
          (angle * 180) / Math.PI + 50 + Math.random() * 30,
          (0.7 + Math.random() * 0.4) * organScale,
          delay + 0.3,
        );
        addLeaf(
          x2,
          y2,
          (angle * 180) / Math.PI - 50 - Math.random() * 30,
          (0.7 + Math.random() * 0.4) * organScale,
          delay + 0.3,
        );
      }

      const bProb = cfg.m!.bProb !== undefined ? cfg.m!.bProb : 0.65;
      let maxBranches = 1;
      if (depth === 5) maxBranches = 2 + Math.floor(Math.random() * 3);
      else {
        const r = Math.random();
        if (r < bProb - 0.3) maxBranches = 3;
        else if (r < bProb) maxBranches = 2;
        else if (r > 0.9 && depth < 3) maxBranches = 0;
      }

      for (let i = 0; i < maxBranches; i++) {
        const dir = i % 2 === 0 ? -1 : 1;
        const spread = maxBranches === 1 ? Math.random() * 0.6 - 0.3 : dir * (0.3 + i * 0.15);
        const newAngle = angle + (isSympodial ? dir * 0.5 : spread) + (Math.random() * 0.4 - 0.2);
        const lengthDrop = maxBranches > 2 ? 0.5 : 0.65;
        const newLength = length * (lengthDrop + Math.random() * 0.3);
        buildTree(x2, y2, newAngle, newLength, depth - 1, width * 0.65, delay + 0.15);
      }
    };

    const buildBasal = () => {
      const numStems =
        cfg.fType === 'lotus'
          ? 4 + Math.floor(Math.random() * 3)
          : 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numStems; i++) {
        const angle = (Math.random() - 0.5) * 0.8;
        const length = 90 + Math.random() * 80;
        const x2 = Math.sin(angle) * length;
        const y2 = -Math.cos(angle) * length;
        const delay = i * 0.15 + Math.random() * 0.1;

        if (cfg.fType === 'lotus') {
          const cx = x2 * 0.5 + (Math.random() - 0.5) * 30;
          const cy = y2 * 0.5;
          addStem(0, 0, cx, cy, x2, y2, 3 + Math.random() * 2, cfg.tCol, delay);

          if (i < 2 || Math.random() > 0.6) {
            addLeaf(
              x2,
              y2,
              (angle * 180) / Math.PI + (Math.random() - 0.5) * 20,
              1.0 + Math.random() * 0.8,
              delay + 0.4,
            );
          } else {
            addFlower(
              x2,
              y2,
              (angle * 180) / Math.PI + (Math.random() - 0.5) * 15,
              1.2 + Math.random() * 0.6,
              delay + 0.5,
            );
          }
        } else {
          if (i === Math.floor(numStems / 2) || (numStems > 6 && i === 0)) {
            const fLen = length * (1.1 + Math.random() * 0.3);
            const cx = (Math.random() - 0.5) * 40;
            const cy = -fLen * 0.5;
            const fx = Math.sin(angle) * fLen * 0.3;
            const fy = -fLen;
            addStem(0, 0, cx, cy, fx, fy, 4 + Math.random() * 2, cfg.tCol, delay);
            addFlower(fx, fy, (Math.random() - 0.5) * 30, 1.2 + Math.random() * 0.5, delay + 0.5);
          } else {
            const cx = x2 * (1.2 + Math.random() * 0.8);
            const cy = y2 * (0.3 + Math.random() * 0.4);
            addStem(0, 0, cx, cy, x2, y2, 6 + Math.random() * 4, cfg.lCol, delay);
          }
        }
      }
    };

    const buildHerb = () => {
      const hMod = cfg.m!.hMod || 1.0;
      const cMod = cfg.m!.cMod || 1.0;
      const lDense = cfg.m!.lDense || 1.0;
      const fScale = cfg.m!.fScale || 1.0;
      const height = (180 + Math.random() * 70) * hMod;
      const curveX = (Math.random() - 0.5) * 80 * cMod;
      const endX = curveX * 0.5 + (Math.random() - 0.5) * 40 * cMod;

      addStem(0, 0, curveX, -height * 0.5, endX, -height, 6 + Math.random() * 3, cfg.tCol, 0);

      const baseSteps = 4 + Math.floor(Math.random() * 4);
      const steps = Math.floor(baseSteps * lDense);

      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const px = mt * mt * 0 + 2 * mt * t * curveX + t * t * endX;
        const py = mt * mt * 0 + 2 * mt * t * (-height * 0.5) + t * t * -height;
        const delay = i * 0.15 + Math.random() * 0.1;

        let lAng = i % 2 === 0 ? -70 : 70;
        lAng += (Math.random() - 0.5) * 40;
        const lScale = 0.8 + Math.random() * 0.6;

        addLeaf(px, py, lAng, lScale, delay);
        if (cfg.fType === 'simple' || Math.random() > 0.7) {
          addLeaf(
            px,
            py,
            -lAng + (Math.random() - 0.5) * 30,
            lScale * (0.8 + Math.random() * 0.3),
            delay,
          );
        }
      }

      addFlower(
        endX,
        -height,
        (Math.random() - 0.5) * 40,
        (1.5 + Math.random() * 0.7) * fScale,
        1.0,
      );
    };

    const buildVine = () => {
      const numVines = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numVines; i++) {
        const sign = i % 2 === 0 ? 1 : -1;
        const angle = sign * (0.2 + Math.random() * 0.6);
        const len = 140 + Math.random() * 100;
        const cx = Math.sin(angle) * len * (1 + Math.random() * 0.5);
        const cy = -Math.cos(angle) * len * (1 + Math.random() * 0.5);
        const x2 = cx + sign * len * (0.1 + Math.random() * 0.5);
        const y2 = cy + len * (0.4 + Math.random() * 0.7);
        const delay = i * 0.2 + Math.random() * 0.15;

        addStem(0, 0, cx, cy, x2, y2, 3 + Math.random() * 2, cfg.tCol, delay);

        const numNodes = 3 + Math.floor(Math.random() * 5);
        for (let k = 1; k <= numNodes; k++) {
          const t = k / (numNodes + 1) + (Math.random() - 0.5) * 0.1;
          if (t <= 0 || t >= 1) continue;
          const mt = 1 - t;
          const px = mt * mt * 0 + 2 * mt * t * cx + t * t * x2;
          const py = mt * mt * 0 + 2 * mt * t * cy + t * t * y2;

          if (Math.random() > 0.1)
            addLeaf(
              px,
              py,
              sign * 90 + (Math.random() * 60 - 30),
              0.6 + Math.random() * 0.5,
              delay + t,
            );
          if (Math.random() > 0.3)
            addFlower(
              px,
              py,
              sign * 45 + (Math.random() * 50 - 25),
              0.5 + Math.random() * 0.5,
              delay + t + 0.2,
            );
        }
      }
    };

    if (cfg.arch === 'tree') {
      const bLen = cfg.baseLen || 70;
      const lVar = cfg.lenVar || 30;
      const tLength = bLen + Math.random() * lVar;
      const tWidth = tLength * 0.16 + Math.random() * 4;
      buildTree(0, 0, (Math.random() - 0.5) * 0.2, tLength, 5, tWidth, 0.2);
    } else if (cfg.arch === 'basal') {
      buildBasal();
    } else if (cfg.arch === 'herb') {
      buildHerb();
    } else if (cfg.arch === 'vine') {
      buildVine();
    }

    svgContent += paths.join('') + organs.join('') + `</g></svg>`;

    generatedSvg.value = svgContent;
    gardenLabel.value = `${monthNames[month]} · ${cfg.name}`;
  };

  return {
    generatedSvg,
    gardenLabel,
    generatePlant,
  };
}
