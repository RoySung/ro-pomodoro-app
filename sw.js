if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const l=e||("document"in self?document.currentScript.src:"")||location.href;if(s[l])return;let o={};const t=e=>i(e,l),a={module:{uri:l},exports:o,require:t};s[l]=Promise.all(r.map((e=>a[e]||t(e)))).then((e=>(n(...e),o)))}}define(["./workbox-ab24e45d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/_...all_.6230b721.js",revision:null},{url:"assets/404.9af3c2df.js",revision:null},{url:"assets/Game.83a14f50.js",revision:null},{url:"assets/Game.9a198078.css",revision:null},{url:"assets/home.dd2d28ff.js",revision:null},{url:"assets/index.245558d3.js",revision:null},{url:"assets/index.ecd3d12e.css",revision:null},{url:"assets/README.fa3a0906.js",revision:null},{url:"assets/virtual_pwa-register.d6bb5f26.js",revision:null},{url:"assets/workbox-window.prod.es5.6954f450.js",revision:null},{url:"index.html",revision:"3769ae4063ebaf233aefee18893ad464"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"favicon/android-chrome-192x192.png",revision:"2312ffeba6dbe72d0d36bd77725a4a39"},{url:"favicon/android-chrome-512x512.png",revision:"3d247f55409225342ca18713291363b1"},{url:"manifest.webmanifest",revision:"27b281a093a91c44d9e60a16cb776479"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
