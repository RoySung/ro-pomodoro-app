if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,i,a)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const d={uri:location.origin+s.slice(1)};return Promise.all(i.map((s=>{switch(s){case"exports":return r;case"module":return d;default:return e(s)}}))).then((e=>{const s=a(...e);return r.default||(r.default=s),r}))})))}}define("./sw.js",["./workbox-d56b8aa9"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/[...all].c24ce203.js",revision:"d35562e638f5effb0892468ad8030a56"},{url:"assets/404.6ae04973.js",revision:"101e1b1e114320d718c79e97c41505bf"},{url:"assets/about.f7d9f4f9.js",revision:"0207edfc1dbabeb2d041dcc17d7fdfe6"},{url:"assets/Game.32e546ca.js",revision:"c553f18d1a8e80d5641a30953ebd8e44"},{url:"assets/Game.cc5a9873.css",revision:"9dd408adc1d3a87eee76716406c8d06d"},{url:"assets/home.383ddd6e.js",revision:"80357ef021b6c5744ac347c025b46a10"},{url:"assets/index.434c803c.css",revision:"48ea6d8de6cc13c6b027d82198a6a7eb"},{url:"assets/index.52ec15a8.js",revision:"70f1f772c8993cdd666397bcb8b7ee85"},{url:"assets/README.15a912af.js",revision:"d9b0707890584c7e74d36087b4789520"},{url:"assets/vendor.0d34a853.js",revision:"5dc3a1753b379535912ca812df5789d6"},{url:"assets/virtual_pwa-register.5c305ca7.js",revision:"7a0c81376a3b86587565ec3e27075e57"},{url:"index.html",revision:"7d0ea4b4c35457c03dda0527592824e4"},{url:"favicon.svg",revision:"fd480326ce2f9db2043fceedae54cb67"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"safari-pinned-tab.svg",revision:"5eaf74d1c43d30e0af743b68a3f48504"},{url:"pwa-192x192.png",revision:"65f6c00ff3d88d8371df0480c1ba0272"},{url:"pwa-512x512.png",revision:"20a2db7d5040eb315e6acf49c6983de9"},{url:"manifest.webmanifest",revision:"6a7adb6e8b956cd87187ff337118e0b2"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
