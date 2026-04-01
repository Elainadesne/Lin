import { createPinia } from 'pinia';
import { createApp, type Component } from 'vue';

import '../style.css';

import { css as childCss } from '../rawfonts/Dymon-ShouXieTi.otf';
import { css as narrCss, css as userCss } from '../rawfonts/LXGWWenKaiScreen.ttf';
import { css as qinCss } from '../rawfonts/XuanZongTi-v0.1.otf';
import { css as linCss } from '../rawfonts/云峰寒蝉体.ttf';

import App from './App.vue';

const rootStyle = document.documentElement.style;
rootStyle.setProperty('--font-lin', `"${linCss.family}", sans-serif`);
rootStyle.setProperty('--font-qin', `"${qinCss.family}", sans-serif`);
rootStyle.setProperty('--font-children', `"${childCss.family}", cursive`);
rootStyle.setProperty('--font-user', `"${userCss.family}", cursive`);
rootStyle.setProperty('--font-narration', `"${narrCss.family}", serif`);
rootStyle.setProperty('--font-ui-sans', `"${userCss.family}", cursive`);

const app = createApp(App as Component);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
