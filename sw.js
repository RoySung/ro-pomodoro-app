if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,a,i)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const c={uri:location.origin+s.slice(1)};return Promise.all(a.map((s=>{switch(s){case"exports":return r;case"module":return c;default:return e(s)}}))).then((e=>{const s=i(...e);return r.default||(r.default=s),r}))})))}}define("./sw.js",["./workbox-d56b8aa9"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/[...all].aa038fd2.js",revision:"6e5262fa29758e651f285a80d49e5b4d"},{url:"assets/404.735465f1.js",revision:"7b2f251bda142c0e64b4aa56e777f4e3"},{url:"assets/about.d944db09.js",revision:"49408af7fe415f6881766e8cb5871ba0"},{url:"assets/Game.06eee659.js",revision:"93ab4613d48bbad45109ee9d4be6688d"},{url:"assets/Game.0b3a7e43.css",revision:"1c479a3554f5593bd2df1a103097428b"},{url:"assets/home.3f6b03b1.js",revision:"16300fa6557ea2ff893ff0b614a0cd0c"},{url:"assets/index.51330f2e.css",revision:"52e3de5f210f748432091609c7ac9e51"},{url:"assets/index.c7b13531.js",revision:"f33f079ebc1f3a6d8d078d57dfe237a0"},{url:"assets/README.4ca7b0e0.js",revision:"dc51af56b32f44a763fbc91a872c4ac5"},{url:"assets/vendor.749c3d53.js",revision:"c682bc8b614cd30fa2ccb1bcc40358e6"},{url:"assets/virtual_pwa-register.5c305ca7.js",revision:"7a0c81376a3b86587565ec3e27075e57"},{url:"index.html",revision:"b9ca7e5e9d365c5232f2e2c95ac475ef"},{url:"favicon.svg",revision:"fd480326ce2f9db2043fceedae54cb67"},{url:"robots.txt",revision:"5e0bd1c281a62a380d7a948085bfe2d1"},{url:"safari-pinned-tab.svg",revision:"5eaf74d1c43d30e0af743b68a3f48504"},{url:"pwa-192x192.png",revision:"65f6c00ff3d88d8371df0480c1ba0272"},{url:"pwa-512x512.png",revision:"20a2db7d5040eb315e6acf49c6983de9"},{url:"manifest.webmanifest",revision:"6a7adb6e8b956cd87187ff337118e0b2"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));