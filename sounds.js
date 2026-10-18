/* =====================================================================
   ORBITS.IO — SOUND ENGINE v5
   Путь: sounds.js

   Возможности:
   - Моно / Стерео / Пространство (Dolby Surround)
   - Music crossfade при повторе (без багов с setTimeout)
   - Spatial = Haas effect + anti-phase кроссфид
   ===================================================================== */
(function (global) {
  'use strict';

  const SYS_SOUNDS = {
    back_select_menu: './Звуки/Система/Back-select-menu.wav',
    back:             './Звуки/Система/Back.wav',
    blok_slot:        './Звуки/Система/Blok_slot.wav',
    button:           './Звуки/Система/Button.wav',
    error:            './Звуки/Система/Error.wav',
    message:          './Звуки/Система/Message.wav',
    save:             './Звуки/Система/Save.wav',
    setting:          './Звуки/Система/Setting.wav',
    start_race:       './Звуки/Система/Start-race-menu-to-select.wav',
    tap_screen:       './Звуки/Система/Tap-to-screen.wav',
    unblok_slot:      './Звуки/Система/Unblok_slot.wav',
    window:           './Звуки/Система/Window.wav'
  };
  const SYS_PREFIX = 'sys_';

  const CROSSFADE_TAIL = 0.015;
  const FADE_SMOOTH = 0.02;

  // Haas effect + Crossfeed для Dolby Surround
  const SURROUND_DELAY = 0.008; // 8 мс
  const SURROUND_CROSS = -0.2;  // Anti-phase

  const Sound = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    unlocked: false,

    _audioMode: 'stereo',

    _buffers: {},
    _musicNodes: null,
    _musicTimers: [],
    _sfxPool: [],
    _poolSize: 20,
    _securityInstalled: false,
    _sysPreloaded: false,

    init() {
      if (this.ctx) return this.ctx;
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) { console.warn('[Sound] Web Audio API недоступен'); return null; }

      this._readSettings();

      this.ctx = new AC({ latencyHint: 'interactive' });

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 1.0;
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 1.0;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this._applyAudioMode();

      for (let i = 0; i < this._poolSize; i++) {
        const g = this.ctx.createGain();
        g.connect(this.sfxGain);
        this._sfxPool.push({ gain: g, busy: false, source: null, nodes: [] });
      }

      if (global.Settings && global.Settings.onChange) {
        global.Settings.onChange((key) => {
          if (key === 'audioMode') {
            this._readSettings();
            this._applyAudioMode();
          }
        });
      }

      this.installSecurity();
      return this.ctx;
    },

    _readSettings() {
      if (!global.Settings) return;
      const mode = global.Settings.get('audioMode');
      if (mode) this._audioMode = mode;
    },

    _applyAudioMode() {
      if (!this.ctx) return;
      if (this._audioMode === 'mono') this._setChannelCount(1);
      else this._setChannelCount(2);
    },

    _setChannelCount(n) {
      try {
        if (this.ctx.destination.channelCount !== n) {
          this.ctx.destination.channelCount = n;
        }
      } catch (e) {}
    },

    setAudioMode(mode) {
      if (['mono','stereo','spatial'].indexOf(mode) < 0) return false;
      this._audioMode = mode;
      this._applyAudioMode();
      return true;
    },

    getAudioMode() { return this._audioMode; },

    installSecurity() {
      if (this._securityInstalled) return;
      this._securityInstalled = true;
      const isField = (t) => t === 'input' || t === 'textarea';

      document.addEventListener('contextmenu', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      }, { passive: false });

      document.addEventListener('selectstart', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      }, { passive: false });

      document.addEventListener('copy', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      });
      document.addEventListener('cut', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      });
      document.addEventListener('dragstart', (e) => e.preventDefault());

      document.addEventListener('keydown', (e) => {
        const k = (e.key || '').toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        if (k === 'f12') { e.preventDefault(); return; }
        if (ctrl && shift && (k === 'i' || k === 'j' || k === 'c')) { e.preventDefault(); return; }
        if (ctrl && k === 'u') { e.preventDefault(); return; }
        if (ctrl && k === 's') { e.preventDefault(); return; }
        if (ctrl && k === 'p') { e.preventDefault(); return; }
      }, { passive: false });
    },

    async unlock() {
      this.init();
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') {
        try { await this.ctx.resume(); } catch (e) {}
      }
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.ctx.destination);
      src.start(0);
      this.unlocked = true;
      return true;
    },

    async loadBuffer(key, source, opts = {}) {
      if (!opts.force && this._buffers[key]) return this._buffers[key];
      this.init();
      if (!this.ctx) return null;

      let arrayBuffer;
      if (source instanceof Uint8Array) {
        arrayBuffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
      } else if (source instanceof ArrayBuffer) {
        arrayBuffer = source;
      } else if (source instanceof Blob) {
        arrayBuffer = await source.arrayBuffer();
      } else if (typeof source === 'string') {
        arrayBuffer = await this._fetchAudio(source);
      } else {
        throw new Error('loadBuffer: неподдерживаемый тип source');
      }

      const buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this._buffers[key] = buffer;
      return buffer;
    },

    async _fetchAudio(url) {
      try {
        const resp = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return await resp.arrayBuffer();
      } catch (e) { console.warn('[Sound] fetch не сработал:', e.message); }
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
          else reject(new Error('XHR ' + xhr.status));
        };
        xhr.onerror = () => reject(new Error('XHR network error'));
        xhr.send();
      });
    },

    _stopNode(node, when) { try { node.stop(when); } catch (e) {} },

    _clearMusicTimers() {
      for (let i = 0; i < this._musicTimers.length; i++) {
        clearTimeout(this._musicTimers[i]);
      }
      this._musicTimers = [];
    },

    async playMusic(key, opts = {}) {
      this.init();
      if (!this.ctx) return null;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }
      this.stopMusic(0);

      const buffer = this._buffers[key];
      if (!buffer) throw new Error('playMusic: буфер "' + key + '" не загружен');

      const tailTrim = (typeof opts.tailTrim === 'number') ? opts.tailTrim : 0;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const wantLoop = (opts.loop !== false);
      src.loop = wantLoop;

      const loopStart = opts.loopStart != null ? opts.loopStart : 0;
      const loopEndRaw = opts.loopEnd != null ? opts.loopEnd : buffer.duration;
      const loopEnd = Math.max(loopStart + 0.01, loopEndRaw - tailTrim);

      if (wantLoop) {
        src.loopStart = Math.max(0, Math.min(loopStart, buffer.duration - 0.01));
        src.loopEnd = Math.max(src.loopStart + 0.01, Math.min(loopEnd, buffer.duration));
      }

      src.connect(this.musicGain);

      const now = this.ctx.currentTime;
      const startAt = now + (opts.fadeIn || 0);
      src.start(startAt, opts.startAt || 0);

      if (opts.fadeIn) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(0.0001, now);
        this.musicGain.gain.linearRampToValueAtTime(opts.volume != null ? opts.volume : 1.0, startAt + opts.fadeIn);
      } else {
        this.musicGain.gain.setValueAtTime(opts.volume != null ? opts.volume : 1.0, now);
      }

      this._musicNodes = src;
      return src;
    },

    async playMusicIntroLoop(key, opts = {}) {
      this.init();
      if (!this.ctx) return null;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }
      this.stopMusic(0);

      const buffer = this._buffers[key];
      if (!buffer) throw new Error('playMusicIntroLoop: буфер "' + key + '" не загружен');

      const loopStart = opts.loopStart != null ? opts.loopStart : 0;
      const loopEnd = opts.loopEnd != null ? opts.loopEnd : buffer.duration;
      const volume = opts.volume != null ? opts.volume : 1.0;
      const fadeIn = opts.fadeIn != null ? opts.fadeIn : 0;
      const tailTrim = opts.tailTrim != null ? opts.tailTrim : 0;

      const lStart = Math.max(0, Math.min(loopStart, buffer.duration - 0.01));
      const lEnd = Math.max(lStart + 0.01, Math.min(loopEnd, buffer.duration - tailTrim));
      const introEnd = Math.max(0.01, buffer.duration - tailTrim);

      const now = this.ctx.currentTime;

      const intro = this.ctx.createBufferSource();
      intro.buffer = buffer;
      intro.loop = false;
      intro.connect(this.musicGain);
      intro.start(now, 0);
      intro.stop(now + introEnd);

      const loop = this.ctx.createBufferSource();
      loop.buffer = buffer;
      loop.loop = true;
      loop.loopStart = lStart;
      loop.loopEnd = lEnd;
      loop.connect(this.musicGain);
      loop.start(now + introEnd, lStart);

      if (fadeIn > 0) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(0.0001, now);
        this.musicGain.gain.linearRampToValueAtTime(volume, now + fadeIn);
      } else {
        this.musicGain.gain.setValueAtTime(volume, now);
      }

      this._musicNodes = { intro: intro, loop: loop };
      return this._musicNodes;
    },

    async playMusicCrossfade(key, opts = {}) {
      this.init();
      if (!this.ctx) return null;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }
      this.stopMusic(0);
      this._clearMusicTimers();

      const buffer = this._buffers[key];
      if (!buffer) throw new Error('playMusicCrossfade: буфер "' + key + '" не загружен');

      const volume = opts.volume != null ? opts.volume : 1.0;
      const fadeIn = opts.fadeIn != null ? opts.fadeIn : 0.3;
      const tailTrim = opts.tailTrim != null ? opts.tailTrim : 0;

      const now = this.ctx.currentTime;
      const dur = buffer.duration - tailTrim;
      const cf = CROSSFADE_TAIL;

      const first = this.ctx.createBufferSource();
      first.buffer = buffer;
      first.loop = false;
      first.connect(this.musicGain);
      first.start(now, 0);

      if (fadeIn > 0) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(0.0001, now);
        this.musicGain.gain.linearRampToValueAtTime(volume, now + fadeIn);
      } else {
        this.musicGain.gain.setValueAtTime(volume, now);
      }

      let currentSrc = first;
      let currentStart = now;
      let isStopped = false;

      const scheduleNextLoop = () => {
        if (isStopped) return;
        const cfTime = currentStart + dur - cf;
        const next = this.ctx.createBufferSource();
        next.buffer = buffer;
        next.loop = false;
        next.connect(this.musicGain);
        next.start(cfTime, 0);
        try { currentSrc.stop(cfTime + cf); } catch (e) {}
        currentSrc = next;
        currentStart = cfTime;
        const delay = Math.max(0, (dur - cf) * 1000 - 100);
        const t = setTimeout(scheduleNextLoop, delay);
        this._musicTimers.push(t);
      };
      const t0 = setTimeout(scheduleNextLoop, Math.max(0, (dur - cf) * 1000 - 100));
      this._musicTimers.push(t0);

      this._musicNodes = {
        crossfade: true,
        src: first,
        stopAll: () => {
          isStopped = true;
          try { currentSrc.stop(); } catch (e) {}
          this._clearMusicTimers();
        }
      };
      return this._musicNodes;
    },

    stopMusic(fadeOut = 0) {
      this._clearMusicTimers();

      if (!this._musicNodes || !this.ctx) return;
      const src = this._musicNodes;
      const now = this.ctx.currentTime;

      if (src.stopAll) {
        try { src.stopAll(); } catch (e) {}
      }

      if (fadeOut > 0) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, now + fadeOut);
        const stopTime = now + fadeOut + 0.05;
        if (src.intro && src.loop) {
          this._stopNode(src.intro, stopTime);
          this._stopNode(src.loop, stopTime);
        } else {
          this._stopNode(src, stopTime);
        }
      } else {
        if (src.intro && src.loop) {
          this._stopNode(src.intro, now);
          this._stopNode(src.loop, now);
        } else {
          this._stopNode(src, now);
        }
      }
      this._musicNodes = null;
    },

    async playSFX(key, opts = {}) {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }

      const buffer = this._buffers[key];
      if (!buffer) { console.warn('playSFX: буфер "' + key + '" не загружен'); return; }

      let slot = null;
      for (let i = 0; i < this._sfxPool.length; i++) {
        if (!this._sfxPool[i].busy) { slot = this._sfxPool[i]; break; }
      }
      if (!slot) {
        slot = this._sfxPool[0];
        this._cleanupSlot(slot);
      }
      slot.busy = true;
      slot.nodes = [];

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      if (this._audioMode === 'mono') {
        src.connect(slot.gain);
      } else if (this._audioMode === 'spatial') {
        // ★ Dolby Surround эффект (Haas + anti-phase)
        const splitter = this.ctx.createChannelSplitter(2);
        const merger = this.ctx.createChannelMerger(2);
        const gainL = this.ctx.createGain(); gainL.gain.value = 1.0;
        const gainR = this.ctx.createGain(); gainR.gain.value = 1.0;
        const delayL = this.ctx.createDelay(0.05); delayL.delayTime.value = SURROUND_DELAY;
        const delayR = this.ctx.createDelay(0.05); delayR.delayTime.value = SURROUND_DELAY;
        const crossL = this.ctx.createGain(); crossL.gain.value = SURROUND_CROSS;
        const crossR = this.ctx.createGain(); crossR.gain.value = SURROUND_CROSS;
        
        src.connect(splitter);
        splitter.connect(gainL, 0);
        splitter.connect(gainR, 1);
        splitter.connect(delayL, 1);
        splitter.connect(delayR, 0);
        delayL.connect(crossL); crossL.connect(merger, 0, 0);
        delayR.connect(crossR); crossR.connect(merger, 0, 1);
        gainL.connect(merger, 0, 0); gainR.connect(merger, 0, 1);
        merger.connect(slot.gain);
        slot.nodes = [splitter, merger, gainL, gainR, delayL, delayR, crossL, crossR];
      } else {
        src.connect(slot.gain);
      }

      slot.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      slot.gain.gain.setValueAtTime(opts.volume != null ? opts.volume : 1.0, this.ctx.currentTime);

      if (opts.rate) src.playbackRate.value = opts.rate;

      src.onended = () => {
        this._cleanupSlot(slot);
      };
      src.start(0);
      slot.source = src;
    },

    _cleanupSlot(slot) {
      slot.busy = false;
      slot.source = null;
      if (slot.nodes) {
        for (let i = 0; i < slot.nodes.length; i++) {
          try { slot.nodes[i].disconnect(); } catch (e) {}
        }
        slot.nodes = [];
      }
    },

    playSys(name, baseVolume) {
      if (!name) return false;
      const url = SYS_SOUNDS[name];
      if (!url) return false;
      const key = SYS_PREFIX + name;
      if (!this._buffers[key]) {
        this.loadBuffer(key, url).catch(() => {});
        return false;
      }
      const vol = (typeof baseVolume === 'number') ? baseVolume : 1.0;
      this.playSFX(key, { volume: vol });
      return true;
    },

    async preloadAllSys() {
      if (this._sysPreloaded) return;
      this._sysPreloaded = true;
      this.init();
      if (!this.ctx) return;
      const tasks = [];
      for (const name in SYS_SOUNDS) {
        const key = SYS_PREFIX + name;
        if (!this._buffers[key]) {
          tasks.push(this.loadBuffer(key, SYS_SOUNDS[name]).catch(() => {}));
        }
      }
      await Promise.all(tasks);
    },

    getSysList() { return Object.keys(SYS_SOUNDS); },

    setMasterVolume(v, fade) { this._ramp(this.masterGain.gain, v, fade || 0); },
    setMusicVolume(v, fade)  { this._ramp(this.musicGain.gain, v, fade || 0); },
    setSFXVolume(v, fade)    { this._ramp(this.sfxGain.gain, v, fade || 0); },

    _ramp(param, value, duration) {
      if (!this.ctx || !param) return;
      const now = this.ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      if (duration > 0) param.linearRampToValueAtTime(value, now + duration);
      else param.value = value;
    },

    mute(fade)   { this.setMasterVolume(0.0001, fade || 0.2); },
    unmute(fade) { this.setMasterVolume(1.0, fade || 0.2); },
    pauseAll()  { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); },
    resumeAll() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

    hasBuffer(key) { return !!this._buffers[key]; },
    getDuration(key) { return this._buffers[key] ? this._buffers[key].duration : 0; },
    unloadBuffer(key) { delete this._buffers[key]; },
    unloadAll() { this._buffers = {}; this._sysPreloaded = false; }
  };

  const originalUnlock = Sound.unlock.bind(Sound);
  Sound.unlock = async function () {
    const ok = await originalUnlock();
    if (ok) { try { await Sound.preloadAllSys(); } catch (e) {} }
    return ok;
  };

  global.Sound = Sound;
})(window);
