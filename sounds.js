/* =====================================================================
   ORBITS.IO — SOUND ENGINE v3
   Путь: sounds.js
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

  const Sound = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    unlocked: false,

    _audioMode: 'stereo',
    _spatialNoHeadphones: false,
    _spatialHeadphones: false,
    _listenerOrientation: { yaw: 0, pitch: 0, roll: 0 },
    _listenerPosition: { x: 0, y: 0, z: 0 },

    _buffers: {},
    _musicNodes: null,
    _sfxPool: [],
    _poolSize: 20,
    _securityInstalled: false,
    _sysPreloaded: false,
    _headTrackingUnsub: null,

    // ============ INIT ============
    init() {
      if (this.ctx) return this.ctx;
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) { console.warn('Web Audio API недоступен'); return null; }

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
        this._sfxPool.push({ gain: g, busy: false, source: null, panner: null });
      }

      if (global.Settings && global.Settings.onChange) {
        global.Settings.onChange((key) => {
          if (key === 'audioMode' || key === 'spatialNoHeadphones' ||
              key === 'spatialHeadphones' || key === 'headTracking') {
            this._readSettings();
            this._applyAudioMode();
            if (key === 'headTracking') {
              this.enableHeadTracking(!!global.Settings.get('headTracking'));
            }
          }
        });
      }

      this.installSecurity();
      return this.ctx;
    },

    _readSettings() {
      if (!global.Settings) return;
      const s = global.Settings;
      const mode = s.get('audioMode');
      if (mode) this._audioMode = mode;
      this._spatialNoHeadphones = !!s.get('spatialNoHeadphones');
      this._spatialHeadphones = !!s.get('spatialHeadphones');
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
    enableSpatialNoHeadphones(v) { this._spatialNoHeadphones = !!v; },
    enableSpatialHeadphones(v) { this._spatialHeadphones = !!v; },

    // ============ HEAD TRACKING ============
    enableHeadTracking(enable) {
      if (enable) {
        if (!global.HeadTracking) {
          console.warn('[Sound] HeadTracking модуль не загружен');
          return false;
        }
        if (this._headTrackingUnsub) return true;
        this._headTrackingUnsub = global.HeadTracking.onUpdate((data) => {
          this.setListenerOrientation(data.yaw, data.pitch, data.roll);
        });
        console.log('[Sound] Head tracking включён');
        return true;
      } else {
        if (this._headTrackingUnsub) {
          this._headTrackingUnsub();
          this._headTrackingUnsub = null;
        }
        this.setListenerOrientation(0, 0, 0);
        console.log('[Sound] Head tracking выключен');
        return true;
      }
    },

    isHeadTrackingEnabled() {
      return !!this._headTrackingUnsub;
    },

    // ============ SECURITY ============
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

    // ============ UNLOCK ============
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

    // ============ BUFFER ============
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

    // ============ MUSIC ============
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

      const buffer = this._buffers[key];
      if (!buffer) throw new Error('playMusicCrossfade: буфер "' + key + '" не загружен');

      const volume = opts.volume != null ? opts.volume : 1.0;
      const fadeIn = opts.fadeIn != null ? opts.fadeIn : 0.3;

      const now = this.ctx.currentTime;
      const dur = buffer.duration;
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

      const scheduleNextLoop = () => {
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
        setTimeout(scheduleNextLoop, delay);
      };
      setTimeout(scheduleNextLoop, Math.max(0, (dur - cf) * 1000 - 100));

      this._musicNodes = { crossfade: true, src: first };
      return this._musicNodes;
    },

    stopMusic(fadeOut = 0) {
      if (!this._musicNodes || !this.ctx) return;
      const src = this._musicNodes;
      const now = this.ctx.currentTime;

      if (fadeOut > 0) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, now + fadeOut);
        const stopTime = now + fadeOut + 0.05;
        if (src.intro && src.loop) {
          this._stopNode(src.intro, stopTime);
          this._stopNode(src.loop, stopTime);
        } else if (src.crossfade) {
          this._stopNode(src.src, stopTime);
        } else {
          this._stopNode(src, stopTime);
        }
      } else {
        if (src.intro && src.loop) {
          this._stopNode(src.intro, now);
          this._stopNode(src.loop, now);
        } else if (src.crossfade) {
          this._stopNode(src.src, now);
        } else {
          this._stopNode(src, now);
        }
      }
      this._musicNodes = null;
    },

    // ============ SFX ============
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
        try { slot.source && slot.source.stop(); } catch (e) {}
      }
      slot.busy = true;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      if (this._audioMode === 'mono') {
        src.connect(slot.gain);
      } else {
        if (opts.position && this._audioMode === 'spatial') {
          const panner = this._createPanner(opts.position);
          src.connect(panner);
          panner.connect(slot.gain);
          slot.panner = panner;
        } else {
          src.connect(slot.gain);
        }
      }

      slot.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      slot.gain.gain.setValueAtTime(opts.volume != null ? opts.volume : 1.0, this.ctx.currentTime);

      if (opts.rate) src.playbackRate.value = opts.rate;

      src.onended = () => { slot.busy = false; slot.source = null; slot.panner = null; };
      src.start(0);
      slot.source = src;
    },

    _createPanner(position) {
      const panner = this.ctx.createPanner();
      if (this._spatialHeadphones) panner.panningModel = 'HRTF';
      else panner.panningModel = 'equalpower';
      panner.distanceModel = 'inverse';
      panner.refDistance = 1;
      panner.maxDistance = 10000;
      panner.rolloffFactor = 1;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;

      const now = this.ctx.currentTime;
      const px = position.x || 0, py = position.y || 0, pz = position.z || 0;
      if (panner.positionX) {
        panner.positionX.setValueAtTime(px, now);
        panner.positionY.setValueAtTime(py, now);
        panner.positionZ.setValueAtTime(pz, now);
      } else {
        panner.setPosition(px, py, pz);
      }

      this._updateListener();
      return panner;
    },

    _updateListener() {
      if (!this.ctx) return;
      const l = this.ctx.listener;
      const now = this.ctx.currentTime;
      const o = this._listenerOrientation;
      const p = this._listenerPosition;

      if (l.positionX) {
        l.positionX.setValueAtTime(p.x, now);
        l.positionY.setValueAtTime(p.y, now);
        l.positionZ.setValueAtTime(p.z, now);
      } else {
        try { l.setPosition(p.x, p.y, p.z); } catch (e) {}
      }

      const yaw = o.yaw * Math.PI / 180;
      const pitch = o.pitch * Math.PI / 180;
      const roll = o.roll * Math.PI / 180;

      const fx = Math.sin(yaw) * Math.cos(pitch);
      const fy = Math.sin(pitch);
      const fz = -Math.cos(yaw) * Math.cos(pitch);

      const ux = Math.sin(roll) * Math.cos(yaw);
      const uy = Math.cos(roll);
      const uz = Math.sin(roll) * Math.sin(yaw);

      if (l.forwardX) {
        l.forwardX.setTargetAtTime(fx, now, FADE_SMOOTH);
        l.forwardY.setTargetAtTime(fy, now, FADE_SMOOTH);
        l.forwardZ.setTargetAtTime(fz, now, FADE_SMOOTH);
        l.upX.setTargetAtTime(ux, now, FADE_SMOOTH);
        l.upY.setTargetAtTime(uy, now, FADE_SMOOTH);
        l.upZ.setTargetAtTime(uz, now, FADE_SMOOTH);
      } else {
        try { l.setOrientation(fx, fy, fz, ux, uy, uz); } catch (e) {}
      }
    },

    setListenerOrientation(yaw, pitch, roll) {
      this._listenerOrientation.yaw = yaw || 0;
      this._listenerOrientation.pitch = pitch || 0;
      this._listenerOrientation.roll = roll || 0;
      this._updateListener();
    },

    setListenerPosition(x, y, z) {
      this._listenerPosition.x = x || 0;
      this._listenerPosition.y = y || 0;
      this._listenerPosition.z = z || 0;
      this._updateListener();
    },

    async playSpatial(key, position, opts = {}) {
      return this.playSFX(key, Object.assign({}, opts, { position: position }));
    },

    // ============ SYS ============
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

    // ============ VOLUME ============
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
