if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,a,i)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const d={uri:location.origin+s.slice(1)};return Promise.all(a.map((s=>{switch(s){case"exports":return r;case"module":return d;default:return e(s)}}))).then((e=>{const s=i(...e);return r.default||(r.default=s),r}))})))}}define("./sw.js",["./workbox-d56b8aa9"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/[...all].ade2d8ce.js",revision:"c43dd74bec50576b15dc1672a2760262"},{url:"assets/404.b730b680.js",revision:"817d878d23ad12ce0683d83ef095a95b"},{url:"assets/about.7d86665c.js",revision:"8ab652fad3174ee0ec447911a7df745d"},{url:"assets/Game.669dfb6d.js",revision:"2f1bb1a6d5f8fe2d220d0c4e63dee0f7"},{url:"assets/Game.73649eff.css",revision:"ae701ad41a4b804cb5f61366e4f61a08"},{url:"assets/home.9eaf791c.js",revision:"ed99b8032efb7ba2cc587577e65b498f"},{url:"assets/index.65849a94.css",revision:"46e0c59e1ab3635c1a9627d788aca760"},{url:"assets/index.b9367340.js",revision:"950a0b3ece7ec1ce6fb1457690b861b7"},{url:"assets/README.3b4479db.js",revision:"4af462a94ac8e733c36658c656eca1f7"},{url:"assets/vendor.346f3028.js",revision:"d77373d05dae29f35bb9586305fc3370"},{url:"assets/virtual_pwa-register.1edc5112.js",revision:"573aa5b470c09451fc6fedcae5258db1"},{url:"index.html",revision:"fc566478d272ffd0d2d687f3e2542ffd"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"favicon/android-chrome-192x192.png",revision:"2312ffeba6dbe72d0d36bd77725a4a39"},{url:"favicon/android-chrome-512x512.png",revision:"3d247f55409225342ca18713291363b1"},{url:"manifest.webmanifest",revision:"27b281a093a91c44d9e60a16cb776479"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
