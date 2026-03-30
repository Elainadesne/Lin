<template>
  <div
    class="birthday-present-container"
    :class="{ 'is-closing': isClosing }"
    @animationend="handleAnimationEnd"
  >
    <canvas ref="confettiRef" class="confetti-canvas"></canvas>

    <div class="tres-wrapper">
      <TresCanvas clear-color="transparent" alpha>
        <TresPerspectiveCamera :position="[22, 22, 22]" :look-at="[0, 0, 0]" />
        <TresAmbientLight :intensity="0.8" color="#ffffff" />
        <TresDirectionalLight
          :position="[10, 20, 0]"
          :intensity="0.5"
          color="#ffffff"
          cast-shadow
        />

        <TresGroup
          :scale="groupScale"
          :rotation="groupRotation"
          @click="handleInteract"
          @touchstart.prevent="handleInteract"
        >
          <TresGroup
            v-for="(side, sIdx) in sides"
            :key="`side_${sIdx}`"
            :position="side.pos"
            :rotation="side.rot"
          >
            <TresMesh
              v-for="piece in side.pieces"
              :key="piece.id"
              :position="piece.pos"
              :rotation="piece.rot"
              receive-shadow
            >
              <TresPlaneGeometry :args="[fracS, fracS]" />
              <TresMeshStandardMaterial
                :color="piece.isM ? '#ff4d79' : '#ffe6e6'"
                :side="2"
                transparent
                :opacity="presentOpacity"
              />
            </TresMesh>
          </TresGroup>

          <TresMesh :position="bow.pos" :rotation="bow.rot" cast-shadow>
            <TresDodecahedronGeometry :args="[2]" />
            <TresMeshStandardMaterial color="#ff4d79" transparent :opacity="presentOpacity" />
          </TresMesh>
        </TresGroup>
      </TresCanvas>
    </div>

    <div class="interact-hint" :style="{ opacity: opened || opening ? 0 : 1 }">
      生日快乐！点击拆开礼物 🎁
    </div>

    <button class="close-btn" v-if="opened && presentOpacity === 1" @click="closeComponent">
      收起礼物
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLoop } from '@tresjs/core';
import { onMounted, onUnmounted, ref } from 'vue';
import { useChatStore } from '../../stores/useChatStore';

const emit = defineEmits<{ (e: 'close'): void }>();
const chatStore = useChatStore();

const S = 8,
  HS = S / 2,
  divs = 3;
const fracS = S / divs;
const HD = divs / 2;

const opening = ref(false);
const opened = ref(false);
const openTime = ref(0);
const presentOpacity = ref(1);
const groupScale = ref<[number, number, number]>([1, 1, 1]);
const groupRotation = ref<[number, number, number]>([0, Math.PI / 4, 0]);
const isClosing = ref(false);

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const sides = ref<any[]>([]);
const bow = ref({
  pos: [0, HS + 1, 0] as [number, number, number],
  firstPos: [0, HS + 1, 0] as [number, number, number],
  rot: [0, 0, 0] as [number, number, number],
  vel: [
    rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
    1.5,
    rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
  ] as [number, number, number],
  rotSpeed: [rand(0.1, 0.2), rand(0.1, 0.2), rand(0.1, 0.2)] as [number, number, number],
});

for (let s = 0; s < 6; ++s) {
  let pos = [0, 0, 0];
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
          rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
          rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
          rand(0.5, 1.5) * (Math.random() < 0.5 ? -1 : 1),
        ],
        rotSpeed: [
          rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1),
          rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1),
          rand(0.05, 0.15) * (Math.random() < 0.5 ? -1 : 1),
        ],
      });
    }
  }
  sides.value.push({ pos, rot, pieces });
}

const { onBeforeRender } = useLoop();

onBeforeRender(() => {
  if (!opening.value && !opened.value) {
    groupRotation.value[1] += 0.01;
  } else if (opening.value) {
    const scaleBy = 1 - 0.05 * Math.sin((8 * Math.PI * openTime.value) / 100);
    groupScale.value = [scaleBy, scaleBy, scaleBy];
    openTime.value += 5;
    if (openTime.value >= 100) {
      opening.value = false;
      opened.value = true;
      chatStore.addTempPromptToHost('系统提示：来访者拆开了你准备的生日礼物。');
    }
  } else if (opened.value) {
    if (presentOpacity.value > 0) {
      presentOpacity.value = Math.max(0, presentOpacity.value - 0.03);

      sides.value.forEach((side) => {
        side.pieces.forEach((p: any) => {
          p.pos[0] += p.vel[0];
          p.pos[1] += p.vel[1];
          p.pos[2] += p.vel[2];
          p.rot[0] += p.rotSpeed[0];
          p.rot[1] += p.rotSpeed[1];
          p.rot[2] += p.rotSpeed[2];
        });
      });
      bow.value.pos[0] += bow.value.vel[0];
      bow.value.pos[1] += bow.value.vel[1];
      bow.value.pos[2] += bow.value.vel[2];
      bow.value.rot[0] += bow.value.rotSpeed[0];
      bow.value.rot[1] += bow.value.rotSpeed[1];
      bow.value.rot[2] += bow.value.rotSpeed[2];
    } else {
      presentOpacity.value = 1;
      opened.value = false;
      openTime.value = 0;
      groupScale.value = [1, 1, 1];

      sides.value.forEach((side) => {
        side.pieces.forEach((p: any) => {
          p.pos = [...p.firstPos];
          p.rot = [0, 0, 0];
        });
      });
      bow.value.pos = [...bow.value.firstPos];
      bow.value.rot = [0, 0, 0];
    }
  }
});

const handleInteract = () => {
  if (!opening.value && !opened.value) {
    opening.value = true;
    stopConfetti();
  }
};

const closeComponent = () => {
  isClosing.value = true;
  stopConfetti();
};

const handleAnimationEnd = (e: AnimationEvent) => {
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
  AddForce(fx: number, fy: number) {
    this.force.x += fx;
    this.force.y += fy;
  }
  Integrate(dt: number) {
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
  update(dt: number) {
    this.time += dt;
    this.rotation += this.rotationSpeed * dt;
    this.pos.x += Math.cos(this.time * this.oscSpeed) * this.xSpeed * dt;
    this.pos.y += this.ySpeed * dt;
    if (this.pos.y > window.innerHeight) {
      this.pos.x = Math.random() * window.innerWidth;
      this.pos.y = -50;
    }
  }
  draw(retina: number) {
    const cosA = Math.cos(DEG_TO_RAD * this.rotation);
    ctx.fillStyle = cosA > 0 ? this.front : this.back;
    ctx.beginPath();
    this.corners.forEach((c, i) => {
      const px = (this.pos.x + c.x * this.size) * retina;
      const py = (this.pos.y + c.y * this.size * cosA) * retina;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  }
}

const entities: any[] = [];
let lastTime = Date.now();
let w = window.innerWidth;
let h = window.innerHeight;
let retina = Math.min(2, window.devicePixelRatio || 1);

class ConfettiRibbon {
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
  update(dt: number) {
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
  draw(retina: number) {
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

const stopConfetti = () => {
  if (confettiRef.value) confettiRef.value.style.opacity = '0';
  isConfettiStopping = true;
  cancelAnimationFrame(rafId);
};

onMounted(() => {
  if (!confettiRef.value) return;
  ctx = confettiRef.value.getContext('2d') as CanvasRenderingContext2D;
  confettiRef.value.width = w * retina;
  confettiRef.value.height = h * retina;
  confettiRef.value.style.opacity = '1';

  const paperCount = w < 768 ? 20 : 40;
  const ribbonCount = w < 768 ? 8 : 16;
  for (let i = 0; i < paperCount; i++) entities.push(new Paper());
  for (let i = 0; i < ribbonCount; i++)
    entities.push(new ConfettiRibbon(Math.random() * w, -Math.random() * h * 2));

  const animate = () => {
    const now = Date.now();
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt <= 0.001) dt = 0.001;
    dt = Math.min(dt, 0.05);

    ctx.clearRect(0, 0, w * retina, h * retina);
    entities.forEach((p) => {
      p.update(dt);
      p.draw(retina);
    });

    if (!isConfettiStopping) rafId = requestAnimationFrame(animate);
  };
  animate();

  chatStore.addTempPromptToHost('系统提示：来访者收到了你准备的生日礼物！');
});

onUnmounted(() => {
  stopConfetti();
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
  pointer-events: none; /* 让事件穿透到内部的按钮和3D画布 */
}
.birthday-present-container.is-closing {
  animation: handBackToTop 1s ease-in-out forwards;
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
  z-index: 10;
  cursor: pointer;
  width: min(80vw, 400px);
  height: min(80vw, 400px);
  pointer-events: auto;
}

.interact-hint {
  position: absolute;
  bottom: 20%;
  transition: opacity 0.5s;
  pointer-events: none;
  color: #fff;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  bottom: 10%;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  pointer-events: auto;
  color: #fff;
  font-weight: 800;
  font-size: 16px;
}
.close-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.4);
}
.close-btn:active {
  transform: translateY(1px);
}
</style>
