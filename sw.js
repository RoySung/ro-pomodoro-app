if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,a,i)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const c={uri:location.origin+s.slice(1)};return Promise.all(a.map((s=>{switch(s){case"exports":return r;case"module":return c;default:return e(s)}}))).then((e=>{const s=i(...e);return r.default||(r.default=s),r}))})))}}define("./sw.js",["./workbox-d56b8aa9"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/[...all].77de4d94.js",revision:"dd42f69bf0c9d875b31d981d004813e8"},{url:"assets/404.76934419.js",revision:"6df3fe29d7a45c8e9f10340f0a8088ef"},{url:"assets/about.a12bda3a.js",revision:"360cad864bf907b5091c6257a1490483"},{url:"assets/Game.73649eff.css",revision:"ae701ad41a4b804cb5f61366e4f61a08"},{url:"assets/Game.96999986.js",revision:"222b2705803e9c11ba0c26593d784a41"},{url:"assets/home.3d9abbb2.js",revision:"a8341e0897a5e4ccac53d00f9a4bd9d3"},{url:"assets/index.65849a94.css",revision:"46e0c59e1ab3635c1a9627d788aca760"},{url:"assets/index.771bf665.js",revision:"d7b194c3356cac75e737e2949225c944"},{url:"assets/README.c1626cc4.js",revision:"175fd01ac887a4d9bec8991ea8689338"},{url:"assets/vendor.f162f9c0.js",revision:"896d81f8cc9acf06720e016066506fba"},{url:"assets/virtual_pwa-register.1edc5112.js",revision:"573aa5b470c09451fc6fedcae5258db1"},{url:"index.html",revision:"cd77d3a9da670e884ffc34466cd79ac8"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"favicon/android-chrome-192x192.png",revision:"2312ffeba6dbe72d0d36bd77725a4a39"},{url:"favicon/android-chrome-512x512.png",revision:"3d247f55409225342ca18713291363b1"},{url:"manifest.webmanifest",revision:"27b281a093a91c44d9e60a16cb776479"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
