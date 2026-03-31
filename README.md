# <img src="public/favicon.ico"> 林雨涵心理诊所

![License: Unlicense](https://img.shields.io/badge/license-Unlicense-808080?logo=unlicense&logoColor=white)
![Frontend: Vue 3](https://img.shields.io/badge/Frontend-Vue_3-4FC08D?logo=vuedotjs&logoColor=white)
![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Bundler: Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)
![Platform: SillyTavern](https://img.shields.io/badge/Platform-SillyTavern-BB0D0D)

> _然后，就是这扇门。它就那样毫无预兆地站在那里，仿佛不是你找到了它，而是它厌倦了你的兜兜转转，决定亲自站在你面前。_  
> —— “请坐，红茶里要放糖吗？”

## 使用指南

本项目由两部分组成：前端 UI（基于 Vue 3 + Vite） 与 角色卡（JSON）。前端界面通过 Iframe 嵌入到 SillyTavern 中进行联动。

### 1. 导入角色卡到 SillyTavern

1. 下载角色卡文件（例如 `林雨涵.png`）。
2. 打开你的 SillyTavern，在角色管理面板中导入该文件。
3. 角色卡内自带酒馆助手脚本，它会挂载 UI 。

### 2. 前端本地部署

默认情况下，角色卡脚本会指向一个在线的 GitHub Pages 地址。如果你想在本地进行二次开发或完全本地化运行，请按以下步骤操作：

**环境要求：** 需要安装[Node.js](https://nodejs.org/) 以及 [pnpm](https://pnpm.io/) 。

```bash
# 克隆仓库
git clone https://github.com/SeveredLine/Lin.git
cd Lin

# 安装依赖
pnpm install

# 启动本地开发服务器
pnpm dev
```

启动后，Vite 会分配一个本地地址 `http://localhost:24121/Lin/`。

- 在 SillyTavern 弹出的 UI 界面顶部，点击 **“云朵/电脑”** 图标按钮，即可将界面来源切换为你的本地环境。

## 免责声明

本项目旨在提供初步的情绪评估、心理健康探索体验和叙事陪伴。**但请注意，AI 绝对不能替代专业的心理咨询或临床治疗。** 本系统提供的所有信息仅供娱乐和参考，不应被视为医学诊断、治疗方案或专业建议。如果您感到情绪极度低落、焦虑，或出现自我伤害等念头，请务必立即寻求现实中专业的医疗帮助或拨打危机干预热线。

## 鸣谢

如果没有开源社区提供的优秀资源、库和灵感，这个项目将无法实现：

- **纹理材质:** 来源于 [transparenttextures.com](https://www.transparenttextures.com/)
  - _Cream Paper_ - 由 Devin Holmes 制作。
  - _Cardboard Flat_ - 由 Appleshadow 制作。
- **音乐资源:** 来源于 [Pixabay](https://pixabay.com/)（基于 CC0 协议发布）。
- **植物分形算法:** 灵感来源于《The Algorithmic Beauty of Plants》（作者 Springer-Verlag）。
- **动画与视觉特效:**
  - **彩带动画:** 灵感来自 CodePen 上的 [iprodev](https://codepen.io/iprodev/pen/azpWBr)。（采用 [MIT](public/licenses/MIT-iprodev.txt) 协议）
  - **礼盒动画:** 灵感来自 CodePen 上的 [jkantner](https://codepen.io/jkantner/pen/oNgwLLz)。（采用 [MIT](public/licenses/MIT-jkantner.txt) 协议）
- **技术栈:**
  - [![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/) - 前端框架。（采用 [MIT](public/licenses/MIT-vue.txt) 协议）
  - [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) - 编程语言。（采用 [Apache-2.0](public/licenses/Apache-2.0-typescript.txt) 协议）
  - [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) - 前端构建工具。（采用 [MIT](public/licenses/MIT-vite.txt) 协议）
  - [![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=white)](https://pinia.vuejs.org/) - 状态管理。（采用 [MIT](public/licenses/MIT-pinia.txt) 协议）
  - [![VueUse](https://img.shields.io/badge/VueUse-4FC08D?logo=vueuse&logoColor=white)](https://vueuse.org/) - Vue API 工具集。（采用 [MIT](public/licenses/MIT-vueuse.txt) 协议）
  - [![TanStack Virtual](https://img.shields.io/badge/TanStack_Virtual-000000?logo=tanstack&logoColor=white)](https://tanstack.com/virtual) - 虚拟滚动引擎。（采用 [MIT](public/licenses/MIT-tanstack-virtual.txt) 协议）
  - [![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)](https://threejs.org/) & [TresJS](https://tresjs.org/) - 3D 引擎。（采用 [MIT](public/licenses/MIT-threejs.txt) 、[MIT](public/licenses/MIT-tresjs.txt) 协议）
  - [![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black)](https://prettier.io/) - 代码规范与格式化工具。（采用 [MIT](public/licenses/MIT-prettier.txt) 协议）
  - [![PostCss](https://img.shields.io/badge/PostCss-DD3A0A?logo=postcss&logoColor=black)](https://postcss.org/) - 利用 JS 插件转换 CSS 的工具。（采用 [MIT](public/licenses/MIT-postcss.txt) 协议）
  - [Autoprefixer](https://github.com/postcss/autoprefixer) - 自动解析 CSS 并添加浏览器厂商前缀的 PostCSS 插件。（采用[MIT](public/licenses/MIT-autoprefixer.txt) 协议）
  - [Howler.js](https://howlerjs.com/) - Web 音频播放库。（采用 [MIT](public/licenses/MIT-howler.txt) 协议）
  - [marked](https://marked.js.org/) - Markdown 解析与编译器。（采用 [MIT](public/licenses/MIT-marked.txt) 协议）
  - [DOMPurify](https://github.com/cure53/DOMPurify) - XSS 消毒库。（采用 [Apache-2.0 / MPL-2.0](public/licenses/Apache-2.0-DOMPurify.txt) 协议）
  - [vite-plugin-font](https://www.npmjs.com/package/vite-plugin-font) - Web 字体切片工具。（采用 [Apache-2.0](public/licenses/Apache-2.0-vite-plugin-font.txt) 协议）
  - [Rough.js](https://roughjs.com/) - 手绘风格矢量图形引擎。（采用 [MIT](public/licenses/MIT-roughjs.txt) 协议）
  - [flatpickr](https://flatpickr.js.org/) - 日期选择器（结合 `vue-flatpickr-component` 封装）。（采用 [MIT](public/licenses/MIT-flatpickr.txt) 、[MIT](public/licenses/MIT-vue-flatpickr-component.txt)协议）
  - [vue-tsc](https://github.com/vuejs/language-tools) - 针对 Vue 的 TypeScript 命令行工具。
  - [prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports) - 导入语句排序。（采用 [MIT](public/licenses/MIT-prettier-plugin-organize-imports.txt) 协议）
  - [prettier-plugin-css-order](https://github.com/huchenme/prettier-plugin-css-order) - CSS 属性排序（采用 [ISC](public/licenses/ISC-prettier-plugin-css-order.txt) 协议）
  - [prettier-plugin-packagejson](https://github.com/shinnn/prettier-plugin-packagejson) - `package.json` 配置项排序。（采用 [MIT](public/licenses/MIT-prettier-plugin-packagejson.txt) 协议）
- 本项目中使用的所有字体均有合法来源，并经过 `vite-plugin-font` 切片优化以提升加载性能：
  - **霞鹜文楷 屏幕阅读版** - 设计者 lxgw。（采用 [OFL-1.1](public/licenses/OFL-1.1-LXGWWenKaiScreen.txt) 协议）
  - **呆萌手写体** - 设计者 K99Xmas。（采用 [OFL-1.1](public/licenses/OFL-1.1-DymonShouXieTi.txt) 协议）
  - **玄宗体** - 设计者 Yuchen Tian。（采用 [OFL-1.1](public/licenses/OFL-1.1-XuanZongTi.txt) 协议）
  - **云峰寒蝉体** - 设计者 云峰字库。（_[基于作者声明免费使用](https://mp.weixin.qq.com/s/qLRQPJf43h15yPgpcNbLNw)_）
- **API:**
  - [BigDataCloud](https://www.bigdatacloud.com/) - 提供地理位置逆解析服务。
  - [Open-Meteo](https://open-meteo.com/) - 天气预报。
  - [Nager.Date](https://date.nager.at/) - 全球公共节假日查询。
  - [china-holiday-calender](https://github.com/lanceliao/china-holiday-calender) - 中国节假日数据源。

## License

本项目代码与相关配置采用 [![Unlicense](https://img.shields.io/badge/Unlicense-808080?logo=unlicense&logoColor=white)](https://unlicense.org/) 协议发布。
可以自由地复制、修改、发布、使用、编译、出售或以其它任何方式分发本软件，无论是用于商业还是非商业目的。

详见 [UNLICENSE](LICENSE) 文件。
