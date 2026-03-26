# <img src="public/favicon.ico"> 林雨涵心理诊所

![License: Unlicense](https://img.shields.io/badge/license-Unlicense-green.svg)
![Frontend: Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla_JS-yellow.svg)
![Bundler: Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg)
![Platform: SillyTavern](https://img.shields.io/badge/Platform-SillyTavern-pink.svg)

> _然后，就是这扇门。它就那样毫无预兆地站在那里，仿佛不是你找到了它，而是它厌倦了你的兜兜转转，决定亲自站在你面前。_  
> —— “请坐，红茶里要放糖吗？”

## 使用指南

本项目由两部分组成：前端 UI（基于 Vite） 与 角色卡（JSON）。前端界面通过 Iframe 嵌入到 SillyTavern 中进行联动。

### 1. 导入角色卡到 SillyTavern

1. 下载角色卡文件（例如 `林雨涵.png`）。
2. 打开你的 SillyTavern，在角色管理面板中导入该文件。
3. 角色卡内自带酒馆助手脚本，它会挂载 UI 。

### 2. 前端本地部署

默认情况下，角色卡脚本会指向一个在线的 GitHub Pages 地址。如果你想在本地进行二次开发或完全本地化运行，请按以下步骤操作：

**环境要求：** 需要安装 [Node.js](https://nodejs.org/) 以及 [pnpm](https://pnpm.io/) 。

```bash
# 克隆仓库
git clone https://github.com/SeveredLine/Lin.git
cd Lin

# 安装依赖
pnpm install

# 3. 启动本地开发服务器
pnpm dev
```

启动后，Vite 会分配一个本地地址 `http://localhost:24121/Lin`。

- 在 SillyTavern 弹出的 UI 界面顶部，点击 **“云朵/电脑”** 图标按钮，即可将界面来源切换为你的本地环境。

## 免责声明

本项目旨在提供初步的情绪评估、心理健康探索体验和叙事陪伴。**但请注意，AI 绝对不能替代专业的心理咨询或临床治疗。** 本系统提供的所有信息仅供娱乐和参考，不应被视为医学诊断、治疗方案或专业建议。如果您感到情绪极度低落、焦虑，或出现自我伤害等念头，请务必立即寻求现实中专业的医疗帮助或拨打危机干预热线。

## 鸣谢

如果没有开源社区提供的优秀资源、库和灵感，这个项目将无法实现：

- **纹理材质:** 来源于 [transparenttextures.com](https://www.transparenttextures.com/)
  - _Cream Paper_ - 由 Devin Holmes 制作。
  - _Crisp Paper Ruffles_ - 由 Tish 制作。
  - _Large Leather_ - 由 Elemis 制作。
  - _Retina Wood_ - 由 Atle Mo 制作。
- **音乐资源:** 来源于 [Pixabay](https://pixabay.com/)（基于 CC0 协议发布）。
- **植物分形算法:** 灵感来源于《The Algorithmic Beauty of Plants》（作者 Springer-Verlag）。
- **技术栈:**
  - [Vite](https://vitejs.dev/) - 前端构建工具。（采用 [MIT](public/licenses/MIT-vite.txt) 协议）
  - [Howler.js](https://howlerjs.com/) - Web 音频播放库。（采用 [MIT](public/licenses/MIT-howler.txt) 协议）
  - [Three.js](https://threejs.org/) - 3D 引擎。（采用 [MIT](public/licenses/MIT-threejs.txt) 协议）
  - [marked](https://marked.js.org/) - Markdown 解析与编译器。（采用 [MIT](public/licenses/MIT-marked.txt) 协议）
  - [DOMPurify](https://github.com/cure53/DOMPurify) - XSS 消毒库。（采用 [Apache-2.0 / MPL-2.0](public/licenses/Apache-2.0-DOMPurify.txt) 协议）
  - [vite-plugin-font](https://www.npmjs.com/package/vite-plugin-font) - Web 字体切片工具。（采用 [Apache-2.0](public/licenses/Apache-2.0-vite-plugin-font.txt) 协议）
  - [Prettier](https://prettier.io/) - 代码格式化工具。（采用 [MIT](public/licenses/MIT-prettier.txt) 协议）
  - [Rough.js](https://roughjs.com/) - 手绘图形库。（采用 [MIT](public/licenses/MIT-roughjs.txt) 协议）
  - [Day.js](https://day.js.org/) - 时间和日期库。（采用 [MIT](public/licenses/MIT-dayjs.txt) 协议）
  - [flatpickr](https://flatpickr.js.org/) - 日期时间选择器。。（采用 [MIT](public/licenses/MIT-flatpickr.txt) 协议）
- **动画与视觉特效:**
  - **彩带动画:** 灵感来自 CodePen 上的 [iprodev](https://codepen.io/iprodev/pen/azpWBr)。（采用 [MIT](public/licenses/MIT-iprodev.txt) 协议）
  - **礼盒动画:** 灵感来自 CodePen 上的 [jkantner](https://codepen.io/jkantner/pen/oNgwLLz)。（采用 [MIT](public/licenses/MIT-jkantner.txt) 协议）

### 字体

本项目中使用的所有字体均有合法来源，并经过 `vite-plugin-font` 切片优化以提升加载性能：

- **霞鹜文楷 屏幕阅读版** - 设计者 lxgw。（采用 [OFL-1.1](public/licenses/OFL-1.1-LXGWWenKaiScreen.txt) 协议）
- **呆萌手写体** - 设计者 K99Xmas。（采用 [OFL-1.1](public/licenses/OFL-1.1-DymonShouXieTi.txt) 协议）
- **玄宗体** - 设计者 Yuchen Tian。（采用 [OFL-1.1](public/licenses/OFL-1.1-XuanZongTi.txt) 协议）
- **云峰寒蝉体** - 设计者 云峰字库。（_[基于作者声明免费使用](https://mp.weixin.qq.com/s/qLRQPJf43h15yPgpcNbLNw)_）

## License

本项目代码与相关配置采用 **The Unlicense** 协议发布。
可以自由地复制、修改、发布、使用、编译、出售或以其它任何方式分发本软件，无论是商业还是非商业目的。

详见 [UNLICENSE](LICENSE) 文件。
