if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const l=e||("document"in self?document.currentScript.src:"")||location.href;if(s[l])return;let o={};const t=e=>i(e,l),u={module:{uri:l},exports:o,require:t};s[l]=Promise.all(r.map((e=>u[e]||t(e)))).then((e=>(n(...e),o)))}}define(["./workbox-ab24e45d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/_...all_.1d5617ef.js",revision:null},{url:"assets/404.9c71229d.js",revision:null},{url:"assets/Game.267e6832.js",revision:null},{url:"assets/Game.9a198078.css",revision:null},{url:"assets/home.64c6c84a.js",revision:null},{url:"assets/index.2299a3fc.css",revision:null},{url:"assets/index.277d1887.js",revision:null},{url:"assets/README.fa3a0906.js",revision:null},{url:"assets/virtual_pwa-register.6fbe3db2.js",revision:null},{url:"assets/workbox-window.prod.es5.6954f450.js",revision:null},{url:"index.html",revision:"758b8877f24278436fa0fb1fc4eb735e"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"favicon/android-chrome-192x192.png",revision:"2312ffeba6dbe72d0d36bd77725a4a39"},{url:"favicon/android-chrome-512x512.png",revision:"3d247f55409225342ca18713291363b1"},{url:"manifest.webmanifest",revision:"27b281a093a91c44d9e60a16cb776479"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
