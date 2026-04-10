<template>
  <div
    class="birthday-present-container"
    :class="{ 'is-closing': isClosing }"
    @animationend="handleAnimationEnd"
  >
    <canvas ref="confettiRef" class="confetti-canvas"></canvas>

    <div class="tres-wrapper" :class="{ 'is-visible': showGift, 'is-kept': isKeeping }">
      <TresCanvas clear-color="#000000" :clear-alpha="0" alpha>
        <TresPerspectiveCamera :position="[18, 18, 18]" :look-at="[0, 0, 0]" />
        <TresAmbientLight :intensity="1.2" color="#ffffff" />
        <TresDirectionalLight
          :position="[10, 20, 10]"
          :intensity="1.5"
          color="#fff0f5"
          cast-shadow
        />
        <TresPointLight
          :position="[0, 0, 0]"
          :intensity="opened ? 8 : 0.5"
          color="#ff4d79"
          :distance="80"
        />

        <TresGroup
          :scale="[
            groupScale[0] * hoverScale,
            groupScale[1] * hoverScale,
            groupScale[2] * hoverScale,
          ]"
          :rotation="[groupRotation[0], groupRotation[1], groupRotation[2]]"
          :position="[groupPosition[0], groupPosition[1], groupPosition[2]]"
          @click="handleInteract"
          @touchstart.prevent="handleInteract"
          @pointer-enter="onPointerEnter"
          @pointer-leave="onPointerLeave"
        >
          <TresGroup
            v-for="(side, sIdx) in sides"
            :key="`side_${sIdx}`"
            :position="[side.pos[0], side.pos[1], side.pos[2]]"
            :rotation="[side.rot[0], side.rot[1], side.rot[2]]"
          >
            <TresMesh
              v-for="piece in side.pieces"
              :key="piece.id"
              :position="[piece.pos[0], piece.pos[1], piece.pos[2]]"
              :rotation="[piece.rot[0], piece.rot[1], piece.rot[2]]"
              cast-shadow
              receive-shadow
            >
              <TresPlaneGeometry :args="[fracS, fracS]" />
              <TresMeshPhysicalMaterial
                :color="piece.isM ? '#ff1a53' : '#fff0f5'"
                :side="2"
                :metalness="piece.isM ? 0.4 : 0.1"
                :roughness="piece.isM ? 0.2 : 0.4"
                :clearcoat="1.0"
                :clearcoat-roughness="0.1"
              />
            </TresMesh>
          </TresGroup>

          <TresMesh
            :position="[bow.pos[0], bow.pos[1], bow.pos[2]]"
            :rotation="[bow.rot[0], bow.rot[1], bow.rot[2]]"
            cast-shadow
          >
            <TresDodecahedronGeometry :args="[1.5]" />
            <TresMeshPhysicalMaterial
              color="#ff1a53"
              :metalness="0.5"
              :roughness="0.15"
              :clearcoat="1.0"
              :clearcoat-roughness="0.1"
            />
          </TresMesh>
        </TresGroup>
      </TresCanvas>
    </div>

    <div class="interact-hint" :class="{ 'is-hidden': opened || opening, 'is-visible': showHint }">
      点击拆开礼物 🎁
    </div>

    <div
      class="envelope-wrapper"
      :class="{ 'is-visible': showEnvelope, 'is-open': openEnvelope, 'is-kept': isKeeping }"
    >
      <div class="envelope">
        <div class="flap front"></div>
        <div class="flap top"></div>
        <div class="letter" :class="{ 'is-unfolded': isUnfolded }">
          <div class="fold fold-top">
            <div class="face front">
              <div class="letter-content-wrapper">
                <h3 class="letter-title">✉️ 生日快乐</h3>
                <p class="letter-text">{{ pages[currentPage] }}</p>
                <div v-if="pages.length > 1" class="pagination">
                  <button :disabled="currentPage === 0" @click="prevPage">上页</button>
                  <span>{{ currentPage + 1 }} / {{ pages.length }}</span>
                  <button :disabled="currentPage === pages.length - 1" @click="nextPage">
                    下页
                  </button>
                </div>
              </div>
            </div>
            <div class="face back"></div>
          </div>

          <div class="fold fold-middle">
            <div class="face front">
              <div class="letter-content-wrapper">
                <h3 class="letter-title">✉️ 生日快乐</h3>
                <p class="letter-text">{{ pages[currentPage] }}</p>
                <div v-if="pages.length > 1" class="pagination">
                  <button :disabled="currentPage === 0" @click="prevPage">上页</button>
                  <span>{{ currentPage + 1 }} / {{ pages.length }}</span>
                  <button :disabled="currentPage === pages.length - 1" @click="nextPage">
                    下页
                  </button>
                </div>
              </div>
            </div>
            <div class="face back"></div>
          </div>

          <div class="fold fold-bottom">
            <div class="face front">
              <div class="letter-content-wrapper">
                <h3 class="letter-title">✉️ 生日快乐</h3>
                <p class="letter-text">{{ pages[currentPage] }}</p>
                <div v-if="pages.length > 1" class="pagination">
                  <button :disabled="currentPage === 0" @click="prevPage">上页</button>
                  <span>{{ currentPage + 1 }} / {{ pages.length }}</span>
                  <button :disabled="currentPage === pages.length - 1" @click="nextPage">
                    下页
                  </button>
                </div>
              </div>
            </div>
            <div class="face back"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="envelope-wrapper is-open shadow-measure">
      <div class="envelope">
        <div class="letter shadow-letter is-unfolded">
          <div class="letter-content-wrapper">
            <h3 class="letter-title">✉️ 生日快乐</h3>
            <p ref="measureRef" class="letter-text"></p>
            <div class="pagination">
              <button>上页</button><span>1 / 1</span><button>下页</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="showLetterText"
      class="close-btn"
      :class="{ 'is-kept': isKeeping }"
      @click="closeComponent"
    >
      收下贺卡
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick, watch } from 'vue';

import { useAudioStore } from '../../stores/useAudioStore';
import { useChatStore } from '../../stores/useChatStore';

const emit = defineEmits<(e: 'close') => void>();
const chatStore = useChatStore();
const audioStore = useAudioStore();

const S = 8,
  HS = S / 2,
  divs = 6;
const fracS = S / divs;
const HD = divs / 2;

const opening = ref(false);
const opened = ref(false);
const openTime = ref(0);

const groupScale = ref([0.5, 0.5, 0.5]);
const groupRotation = ref([0, Math.PI / 4, 0]);
const groupPosition = ref([0, 0, 0]);
const isClosing = ref(false);

const showGift = ref(false);
const showHint = ref(false);
const isHovered = ref(false);
const hoverScale = ref(1);
let hintTimeout: ReturnType<typeof setTimeout>;

const showEnvelope = ref(false);
const openEnvelope = ref(false);
const isUnfolded = ref(false);
const showLetterText = ref(false);
const isKeeping = ref(false);

const currentPage = ref(0);
const pages = ref<string[]>([]);
const measureRef = ref<HTMLElement | null>(null);

const rawText = computed(
  () =>
    chatStore.birthdayCardContent ||
    '愿你每一天都充满阳光与温暖。祝你生日快乐，心想事成，万事如意，笑口常开！',
);

const prevPage = (): void => {
  if (currentPage.value > 0) currentPage.value--;
};
const nextPage = (): void => {
  if (currentPage.value < pages.value.length - 1) currentPage.value++;
};

const calculatePagination = async (): Promise<void> => {
  await nextTick();
  if (!measureRef.value) return;
  const el = measureRef.value;
  const fullText = rawText.value;
  const newPages: string[] = [];

  let startIndex = 0;

  while (startIndex < fullText.length) {
    let endIndex = startIndex + 1;

    while (endIndex <= fullText.length) {
      el.textContent = fullText.substring(startIndex, endIndex);
      if (el.scrollHeight > el.clientHeight) {
        endIndex--;
        break;
      }
      endIndex++;
    }

    if (endIndex > fullText.length) endIndex = fullText.length;
    if (endIndex === startIndex) endIndex++;

    newPages.push(fullText.substring(startIndex, endIndex));
    startIndex = endIndex;
  }

  pages.value = newPages.length > 0 ? newPages : [fullText];
  currentPage.value = 0;
};

watch(
  rawText,
  () => {
    void calculatePagination();
  },
  { immediate: true },
);

const rand = (min: number, max: number): number => Math.random() * (max - min) + min;

interface Piece {
  id: string;
  isM: boolean;
  pos: number[];
  firstPos: number[];
  rot: number[];
  vel: number[];
  rotSpeed: number[];
}
interface Side {
  pos: number[];
  rot: number[];
  pieces: Piece[];
}
const sides = ref<Side[]>([]);

const bow = ref({
  pos: [0, HS + 1, 0] as [number, number, number],
  firstPos: [0, HS + 1, 0] as [number, number, number],
  rot: [0, 0, 0] as [number, number, number],
  vel: [
    rand(0.2, 0.6) * (Math.random() < 0.5 ? -1 : 1),
    1.5,
    rand(0.2, 0.6) * (Math.random() < 0.5 ? -1 : 1),
  ] as [number, number, number],
  rotSpeed: [rand(0.05, 0.1), rand(0.05, 0.1), rand(0.05, 0.1)] as [number, number, number],
});

for (let s = 0; s < 6; ++s) {
  let pos: number[];
  let rot = [0, 0, 0];

  if (s === 0) {
    pos = [0, -HS, 0];
    rot[0] = Math.PI / 2;
  } else if (s === 1) {
    pos = [0, 0, -HS];
    rot[1] = Math.PI;
  } else if (s === 2) {
    pos = [-HS, 0, 0];
    rot[1] = -Math.PI / 2;
  } else if (s === 3) {
    pos = [HS, 0, 0];
    rot[1] = Math.PI / 2;
  } else if (s === 4) {
    pos = [0, 0, HS];
  } else {
    pos = [0, HS, 0];
    rot[0] = -Math.PI / 2;
  }

  const pieces = [];
  for (let h = -HD; h < HD; h++) {
    for (let w = -HD; w < HD; w++) {
      const isM = (w >= -1 && w <= 0) || (h >= -1 && h <= 0 && (s === 0 || s === 5));
      const pPos = [fracS * w + fracS / 2, fracS * h + fracS / 2, 0];
      pieces.push({
        id: `s${s}_h${h}_w${w}`,
        isM,
        pos: [...pPos],
        firstPos: [...pPos],
        rot: [0, 0, 0],
        vel: [
          rand(0.1, 0.4) * (Math.random() < 0.5 ? -1 : 1),
          rand(0.1, 0.5),
          rand(0.1, 0.4) * (Math.random() < 0.5 ? -1 : 1),
        ],
        rotSpeed: [
          rand(0.02, 0.08) * (Math.random() < 0.5 ? -1 : 1),
          rand(0.02, 0.08) * (Math.random() < 0.5 ? -1 : 1),
          rand(0.02, 0.08) * (Math.random() < 0.5 ? -1 : 1),
        ],
      });
    }
  }
  sides.value.push({ pos, rot, pieces });
}

let presentRafId: number;

const updatePresentAnimation = (): void => {
  const targetHoverScale = isHovered.value && !opening.value && !opened.value ? 1.15 : 1;
  hoverScale.value += (targetHoverScale - hoverScale.value) * 0.1;

  if (!opening.value && !opened.value) {
    groupRotation.value[1] += 0.005;
    groupPosition.value[1] = Math.sin(Date.now() * 0.002) * 0.5;

    if (isHovered.value) {
      groupRotation.value[2] = Math.sin(Date.now() * 0.02) * 0.08;
    } else {
      groupRotation.value[2] *= 0.9;
    }
  } else if (opening.value) {
    groupPosition.value[0] = (Math.random() - 0.5) * 0.15;
    groupPosition.value[2] = (Math.random() - 0.5) * 0.15;

    openTime.value += 3;
    if (openTime.value >= 100) {
      opening.value = false;
      opened.value = true;

      setTimeout(() => {
        showEnvelope.value = true;
      }, 600);
      setTimeout(() => {
        openEnvelope.value = true;
      }, 2000);
      setTimeout(() => {
        isUnfolded.value = true;
      }, 6000);
      setTimeout(() => {
        showLetterText.value = true;
      }, 8800);
    }
  } else if (opened.value) {
    const gravity = 0.015;

    sides.value.forEach((side) => {
      side.pieces.forEach((p: Piece) => {
        p.vel[1] -= gravity;
        p.pos[0] += p.vel[0];
        p.pos[1] += p.vel[1];
        p.pos[2] += p.vel[2];
        p.rot[0] += p.rotSpeed[0];
        p.rot[1] += p.rotSpeed[1];
        p.rot[2] += p.rotSpeed[2];
      });
    });
    bow.value.vel[1] -= gravity;
    bow.value.pos[0] += bow.value.vel[0];
    bow.value.pos[1] += bow.value.vel[1];
    bow.value.pos[2] += bow.value.vel[2];
    bow.value.rot[0] += bow.value.rotSpeed[0];
    bow.value.rot[1] += bow.value.rotSpeed[1];
    bow.value.rot[2] += bow.value.rotSpeed[2];
  }

  presentRafId = requestAnimationFrame(updatePresentAnimation);
};

const handleInteract = (): void => {
  if (!showGift.value) return;
  if (!opening.value && !opened.value) {
    opening.value = true;
    showHint.value = false;
    clearTimeout(hintTimeout);
  }
};

const onPointerEnter = (): void => {
  isHovered.value = true;
};
const onPointerLeave = (): void => {
  isHovered.value = false;
};

const handleAnimationEnd = (e: AnimationEvent): void => {
  if (e.animationName === 'handBackToTop') {
    emit('close');
  }
};

const confettiRef = ref<HTMLCanvasElement | null>(null);
let rafId: number;
let isConfettiStopping = false;
let ctx: CanvasRenderingContext2D;

const DEG_TO_RAD = Math.PI / 180;
const colors = [
  ['#df0049', '#660671'],
  ['#00e857', '#005291'],
  ['#2bebbc', '#05798a'],
  ['#ffd200', '#b06c00'],
];

class Vector2 {
  constructor(
    public x: number,
    public y: number,
  ) {}
}
class EulerMass {
  pos: Vector2;
  force: Vector2 = new Vector2(0, 0);
  vel: Vector2 = new Vector2(0, 0);
  constructor(
    x: number,
    y: number,
    public mass: number,
    public drag: number,
  ) {
    this.pos = new Vector2(x, y);
  }
  AddForce(fx: number, fy: number): void {
    this.force.x += fx;
    this.force.y += fy;
  }
  Integrate(dt: number): void {
    const speed = Math.hypot(this.vel.x, this.vel.y);
    const accX = (this.force.x - this.drag * this.mass * this.vel.x * speed) / this.mass;
    const accY = (this.force.y - this.drag * this.mass * this.vel.y * speed) / this.mass;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.vel.x += accX * dt;
    this.vel.y += accY * dt;
    this.force.x = 0;
    this.force.y = 0;
  }
}

class Paper {
  public dead = false;
  pos = { x: Math.random() * window.innerWidth, y: Math.random() * -window.innerHeight };
  rotationSpeed = Math.random() * 600 + 800;
  angle = DEG_TO_RAD * Math.random() * 360;
  rotation = DEG_TO_RAD * Math.random() * 360;
  size = 6.0;
  oscSpeed = Math.random() * 1.5 + 0.5;
  xSpeed = 40.0;
  ySpeed = Math.random() * 60 + 50.0;
  time = Math.random();
  front: string;
  back: string;
  corners: { x: number; y: number }[];
  constructor() {
    const ci = Math.floor(Math.random() * colors.length);
    this.front = colors[ci][0];
    this.back = colors[ci][1];
    this.corners = Array.from({ length: 4 }, (_, i) => ({
      x: Math.cos(this.angle + DEG_TO_RAD * (i * 90 + 45)),
      y: Math.sin(this.angle + DEG_TO_RAD * (i * 90 + 45)),
    }));
  }
  update(dt: number): void {
    this.time += dt;
    this.rotation += this.rotationSpeed * dt;
    this.pos.x += Math.cos(this.time * this.oscSpeed) * this.xSpeed * dt;
    this.pos.y += this.ySpeed * dt;
    if (this.pos.y > window.innerHeight + 100) {
      if (isConfettiStopping) {
        this.dead = true;
      } else {
        this.pos.x = Math.random() * window.innerWidth;
        this.pos.y = -50;
      }
    }
  }
  draw(retina: number): void {
    const cosA = Math.cos(DEG_TO_RAD * this.rotation);
    ctx.fillStyle = cosA > 0 ? this.front : this.back;
    ctx.beginPath();
    this.corners.forEach((c, i) => {
      const px = (this.pos.x + c.x * this.size) * retina;
      const py = (this.pos.y + c.y * this.size * cosA) * retina;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  }
}

const entities: (Paper | ConfettiRibbon)[] = [];
let lastTime = Date.now();
let w = window.innerWidth;
let h = window.innerHeight;
let retina = Math.min(2, window.devicePixelRatio || 1);

class ConfettiRibbon {
  public dead = false;
  particleCount = 20;
  particleDist = 8.0;
  particles: EulerMass[] = [];
  front: string;
  back: string;
  xOff: number;
  yOff: number;
  pos: Vector2;
  prevPos: Vector2;
  velInherit: number;
  time: number;
  oscSpeed: number;
  oscDist: number;
  ySpeed: number;

  constructor(x: number, y: number) {
    const ci = Math.floor(Math.random() * colors.length);
    this.front = colors[ci][0];
    this.back = colors[ci][1];
    this.xOff = Math.cos(45 * DEG_TO_RAD) * 8.0;
    this.yOff = Math.sin(45 * DEG_TO_RAD) * 8.0;
    this.pos = new Vector2(x, y);
    this.prevPos = new Vector2(x, y);
    this.velInherit = Math.random() * 2 + 4;
    this.time = Math.random() * 100;
    this.oscSpeed = Math.random() * 2 + 2;
    this.oscDist = Math.random() * 40 + 40;
    this.ySpeed = Math.random() * 40 + 80;
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(new EulerMass(x, y - i * this.particleDist, 1, 0.05));
    }
  }
  update(dt: number): void {
    this.time += dt * this.oscSpeed;
    this.pos.y += this.ySpeed * dt;
    this.pos.x += Math.cos(this.time) * this.oscDist * dt;
    this.particles[0].pos.x = this.pos.x;
    this.particles[0].pos.y = this.pos.y;
    const dx = this.prevPos.x - this.pos.x;
    const dy = this.prevPos.y - this.pos.y;
    const delta = Math.hypot(dx, dy);
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
    for (let i = 1; i < this.particleCount; i++) {
      let dirX = this.particles[i - 1].pos.x - this.particles[i].pos.x;
      let dirY = this.particles[i - 1].pos.y - this.particles[i].pos.y;
      const len = Math.hypot(dirX, dirY);
      if (len > 0) {
        dirX /= len;
        dirY /= len;
      }
      this.particles[i].AddForce(
        dirX * (delta / dt) * this.velInherit,
        dirY * (delta / dt) * this.velInherit,
      );
    }
    for (let i = 1; i < this.particleCount; i++) this.particles[i].Integrate(dt);
    for (let i = 1; i < this.particleCount; i++) {
      let rpX = this.particles[i].pos.x - this.particles[i - 1].pos.x;
      let rpY = this.particles[i].pos.y - this.particles[i - 1].pos.y;
      const len = Math.hypot(rpX, rpY);
      if (len > 0) {
        rpX /= len;
        rpY /= len;
      }
      this.particles[i].pos.x = this.particles[i - 1].pos.x + rpX * this.particleDist;
      this.particles[i].pos.y = this.particles[i - 1].pos.y + rpY * this.particleDist;
    }
    if (this.pos.y > h + this.particleDist * this.particleCount) {
      if (isConfettiStopping) {
        this.dead = true;
      } else {
        this.pos.y = -Math.random() * h;
        this.pos.x = Math.random() * w;
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        for (let i = 0; i < this.particleCount; i++) {
          this.particles[i].pos.x = this.pos.x;
          this.particles[i].pos.y = this.pos.y - i * this.particleDist;
        }
      }
    }
  }
  draw(retina: number): void {
    for (let i = 0; i < this.particleCount - 1; i++) {
      const p0x = this.particles[i].pos.x + this.xOff,
        p0y = this.particles[i].pos.y + this.yOff;
      const p1x = this.particles[i + 1].pos.x + this.xOff,
        p1y = this.particles[i + 1].pos.y + this.yOff;
      const side =
        (this.particles[i].pos.x - this.particles[i + 1].pos.x) *
          (p1y - this.particles[i + 1].pos.y) -
        (this.particles[i].pos.y - this.particles[i + 1].pos.y) *
          (p1x - this.particles[i + 1].pos.x);
      ctx.fillStyle = side < 0 ? this.front : this.back;
      ctx.beginPath();
      ctx.moveTo(this.particles[i].pos.x * retina, this.particles[i].pos.y * retina);
      ctx.lineTo(this.particles[i + 1].pos.x * retina, this.particles[i + 1].pos.y * retina);
      ctx.lineTo(p1x * retina, p1y * retina);
      ctx.lineTo(p0x * retina, p0y * retina);
      ctx.closePath();
      ctx.fill();
    }
  }
}

const stopConfetti = (): void => {
  isConfettiStopping = true;
};

const closeComponent = (): void => {
  isKeeping.value = true;
  stopConfetti();
};

onMounted(() => {
  audioStore.triggerBirthdayMode();
  presentRafId = requestAnimationFrame(updatePresentAnimation);

  setTimeout(() => {
    showGift.value = true;
    hintTimeout = setTimeout(() => {
      if (!opening.value && !opened.value) {
        showHint.value = true;
      }
    }, 4000);
  }, 1500);

  if (!confettiRef.value) return;
  const context = confettiRef.value.getContext('2d');
  if (!context) return;
  ctx = context;
  confettiRef.value.width = w * retina;
  confettiRef.value.height = h * retina;
  confettiRef.value.style.opacity = '1';

  const paperCount = w < 768 ? 20 : 40;
  const ribbonCount = w < 768 ? 8 : 16;
  for (let i = 0; i < paperCount; i++) entities.push(new Paper());
  for (let i = 0; i < ribbonCount; i++)
    entities.push(new ConfettiRibbon(Math.random() * w, -Math.random() * h * 2));

  const animate = (): void => {
    const now = Date.now();
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt <= 0.001) dt = 0.001;
    dt = Math.min(dt, 0.05);

    ctx.clearRect(0, 0, w * retina, h * retina);

    entities.splice(0, entities.length, ...entities.filter((e) => !e.dead));

    entities.forEach((p) => {
      p.update(dt);
      p.draw(retina);
    });

    if (isConfettiStopping && entities.length === 0) {
      cancelAnimationFrame(rafId);
      if (isKeeping.value && !isClosing.value) {
        isClosing.value = true;
        setTimeout(() => {
          emit('close');
        }, 500);
      }
    } else {
      rafId = requestAnimationFrame(animate);
    }
  };
  animate();
});

onUnmounted(() => {
  stopConfetti();
  clearTimeout(hintTimeout);
  cancelAnimationFrame(presentRafId);
});
</script>

<style scoped>
.birthday-present-container {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}
.birthday-present-container.is-closing {
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.confetti-canvas {
  position: absolute;
  top: 0;
  left: 0;
  transition: opacity 1s;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.tres-wrapper {
  position: absolute;
  transform: scale(0.5) translateY(50px);
  opacity: 0;
  z-index: 10;
  transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
}

.tres-wrapper.is-visible {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.tres-wrapper :deep(canvas) {
  pointer-events: auto;
}
.tres-wrapper.is-kept,
.tres-wrapper.is-kept :deep(canvas) {
  pointer-events: none !important;
}

.interact-hint {
  position: absolute;
  bottom: 15%;
  transform: translateY(10px);
  opacity: 0;
  z-index: 15;
  transition: all 0.8s ease;
  pointer-events: none;
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.interact-hint.is-visible {
  transform: translateY(0);
  opacity: 1;
}

.envelope-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 50vh) scale(0.6);
  opacity: 0;
  z-index: 20;
  transition:
    transform 1s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.8s ease;
  width: 320px;
  pointer-events: none;
}

.envelope-wrapper.is-visible {
  transform: translate(-50%, -30%) scale(1);
  opacity: 1;
  pointer-events: auto;
}

.envelope-wrapper.is-kept {
  transform: translate(-50%, 100vh) scale(0.8) !important;
  opacity: 0 !important;
  transition:
    transform 1s cubic-bezier(0.6, -0.28, 0.735, 0.045),
    opacity 0.8s ease 0.2s !important;
}

.envelope {
  position: relative;
  perspective: 1000px;
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.2),
    0 3px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background: #ffe6e6;
  width: 320px;
  height: 180px;
}

.envelope:after {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  border: 0 solid rgba(0, 0, 0, 0.15);
  border-width: 80px 160px;
  border-top-color: transparent;
  width: 0;
  height: 0;
  pointer-events: none;
  content: '';
}

.envelope .flap {
  position: absolute;
  z-index: 3;
  border: 0 solid transparent;
  border-width: 90px 160px;
  width: 100%;
  height: 0;
}

.envelope .flap.front {
  z-index: 3;
  border-right-color: #ffccd5;
  border-bottom-color: #ffb3c6;
  border-left-color: #ffccd5;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}

.envelope .flap.front:after {
  position: absolute;
  bottom: -90px;
  left: -160px;
  border: 0 solid transparent;
  border-width: 89px 160px;
  border-bottom-color: #ffccd5;
  width: 100%;
  height: 0;
  content: '';
}

.envelope .flap.top {
  transform-origin: top;
  transform-style: preserve-3d;
  z-index: 4;
  animation-fill-mode: forwards;
  border-top-width: 95px;
  border-top-color: #ff99ac;
}

.envelope-wrapper.is-open .flap.top {
  animation: flapOpen 1.2s ease-in-out forwards;
}
@keyframes flapOpen {
  0% {
    transform: rotateX(0deg);
    z-index: 4;
  }
  100% {
    transform: rotateX(180deg);
    z-index: 1;
  }
}

.envelope .flap.top:after {
  position: absolute;
  top: -95px;
  left: -160px;
  border: 0 solid transparent;
  border-width: 94px 160px;
  border-top-color: #ffb3c6;
  width: 100%;
  height: 0;
  content: '';
}

.envelope .letter {
  position: absolute;
  top: 15px;
  left: 15px;
  transform-style: preserve-3d;
  z-index: 1;
  width: 290px;
  height: 110px;
}

.envelope-wrapper.is-open .letter {
  animation: letterPullOut 2.5s ease-in-out 1.2s forwards;
}
@keyframes letterPullOut {
  0% {
    top: 15px;
    z-index: 1;
  }
  40% {
    top: -210px;
    z-index: 1;
  }
  60% {
    top: -210px;
    z-index: 5;
  }
  100% {
    top: -40px;
    z-index: 5;
  }
}

.fold {
  position: absolute;
  transform-style: preserve-3d;
  transition: transform 1.8s ease-in-out;
  width: 100%;
  height: 110px;
}

.face {
  position: absolute;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  inset: 0;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.05);
  background: #fffcfd;
  overflow: hidden;
}

.face.back {
  transform: rotateX(180deg);
  border: 1px solid rgba(0, 0, 0, 0.03);
  background: #fdfdfd;
}

.fold-middle {
  top: 0;
  z-index: 2;
}

.fold-top {
  top: -110px;
  transform: rotateX(-179.9deg);
  transform-origin: bottom;
  z-index: 1;
}

.fold-bottom {
  top: 110px;
  transform: rotateX(179.9deg);
  transform-origin: top;
  z-index: 1;
}

.letter.is-unfolded .fold-top {
  transform: rotateX(0deg);
  transition-delay: 0s;
}

.letter.is-unfolded .fold-bottom {
  transform: rotateX(0deg);
  transition-delay: 0.8s;
}

.letter-content-wrapper {
  display: flex;
  position: absolute;
  left: 0;
  flex-direction: column;
  box-sizing: border-box;
  background: #fffcfd;
  padding: 20px 20px 15px 20px;
  width: 290px;
  height: 330px;
}

.fold-top .letter-content-wrapper {
  top: 0;
  pointer-events: none;
}
.fold-middle .letter-content-wrapper {
  top: -110px;
  pointer-events: none;
}
.fold-bottom .letter-content-wrapper {
  top: -220px;
}

.shadow-letter {
  width: 290px !important;
  height: 330px !important;
}
.shadow-letter .letter-content-wrapper {
  position: relative !important;
  top: 0 !important;
}

.letter-title {
  margin: 0 0 10px 0;
  color: #ff4d79;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 2px;
  text-align: center;
}

.letter-text {
  flex: 1;
  overflow: hidden;
  color: #555;
  font-size: 1.05rem;
  line-height: 1.8;
  text-align: justify;
  white-space: pre-wrap;
  word-break: break-all;
}

.pagination {
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  border-top: 1px dashed rgba(255, 77, 121, 0.3);
  padding-top: 10px;
  height: 25px;
  color: #888;
  font-size: 0.9rem;
}

.pagination button {
  transition: opacity 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  color: #ff4d79;
  font-weight: bold;
}
.pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.close-btn {
  position: absolute;
  bottom: 8%;
  z-index: 30;
  backdrop-filter: blur(5px);
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 77, 121, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 25px;
  background: #ff4d79;
  padding: 12px 30px;
  pointer-events: auto;
  color: #fff;
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 1px;
}

.close-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 77, 121, 0.4);
  background: #ff3366;
}

.close-btn:active {
  transform: translateY(1px);
}

.close-btn.is-kept {
  transform: translateY(50px);
  opacity: 0;
  pointer-events: none;
}

.shadow-measure {
  position: fixed !important;
  top: -9999px !important;
  left: -9999px !important;
  visibility: hidden !important;
  z-index: -9999;
  pointer-events: none !important;
}

.shadow-letter {
  transition: none !important;
}
</style>
