/* =====================================================================
   ORBITS.IO — SETTINGS MANAGER
   Путь: settings-manager.js
   ===================================================================== */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'orbits_settings';
  const LANGUAGES = ['ru', 'en', 'fr', 'es'];

  // ★ Определение языка при первом запуске
  function detectInitialLanguage() {
    try {
      const nav = (navigator.language || navigator.userLanguage || 'ru').toLowerCase();
      const code = nav.slice(0, 2);
      if (LANGUAGES.includes(code)) return code;
    } catch (e) {}
    return 'ru';
  }

  // ★ Определение доступности аудио-режимов
  function detectAudioCapabilities() {
    let maxChannels = 1;
    let hasCamera = false;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      maxChannels = ctx.destination.maxChannelCount || 1;
      try { ctx.close(); } catch (e) {}
    } catch (e) {}
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) hasCamera = true;

    return {
      mono: maxChannels >= 1,
      stereo: maxChannels >= 2,
      spatial: maxChannels >= 2,
      spatial3D: maxChannels >= 2 && hasCamera,
      maxChannels
    };
  }

  // Определяем аудио-возможности один раз при старте
  const AUDIO_CAPS = detectAudioCapabilities();

  // ★ Дефолтный режим: spatial если есть 2 канала, иначе mono
  const DEFAULT_AUDIO_MODE = AUDIO_CAPS.spatial ? 'spatial' : 'mono';

  const DEFAULTS = {
    // Звук (старые)
    sfxVolume:   0.8,
    musicVolume: 0.8,
    // Прочее
    vibration:   true,
    nickname:    '',
    brightness:  100,
    language:    detectInitialLanguage(),
    // ★ Звук (новые)
    audioMode: DEFAULT_AUDIO_MODE,        // 'mono' | 'stereo' | 'spatial'
    spatialNoHeadphones: true,            // стереоскопический без наушников (по умолчанию)
    spatialHeadphones: false,             // 3D для наушников
    headTracking: false,                  // реакция на поворот головы
    calibrationDone: false                // калибровка пройдена
  };

  const VALIDATORS = {
    sfxVolume:   (v) => typeof v === 'number' && v >= 0 && v <= 1,
    musicVolume: (v) => typeof v === 'number' && v >= 0 && v <= 1,
    vibration:   (v) => typeof v === 'boolean',
    nickname:    (v) => typeof v === 'string' && v.length <= 32,
    brightness:  (v) => typeof v === 'number' && v >= 0 && v <= 150,
    language:    (v) => typeof v === 'string' && LANGUAGES.includes(v),
    audioMode:   (v) => typeof v === 'string' && ['mono','stereo','spatial'].includes(v),
    spatialNoHeadphones: (v) => typeof v === 'boolean',
    spatialHeadphones:   (v) => typeof v === 'boolean',
    headTracking:        (v) => typeof v === 'boolean',
    calibrationDone:     (v) => typeof v === 'boolean'
  };

  let data = Object.assign({}, DEFAULTS);
  const listeners = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const key of Object.keys(DEFAULTS)) {
        if (key in parsed && VALIDATORS[key](parsed[key])) data[key] = parsed[key];
      }
    }
  } catch (e) {
    console.warn('[Settings] localStorage:', e.message);
  }

  // ★ Корректировка режима, если возможности не совпадают
  function enforceAudioMode() {
    if (data.audioMode === 'stereo' && !AUDIO_CAPS.stereo) {
      data.audioMode = 'mono';
    }
    if (data.audioMode === 'spatial' && !AUDIO_CAPS.spatial) {
      data.audioMode = 'mono';
    }
    if (data.audioMode !== 'spatial') {
      // Если не spatial — head tracking и spatial-опции не имеют смысла
      data.headTracking = false;
    }
    if (data.audioMode !== 'spatial') {
      data.spatialNoHeadphones = false;
      data.spatialHeadphones = false;
    }
  }
  enforceAudioMode();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function notify(key, value) {
    listeners.forEach(cb => { try { cb(key, value, data); } catch (e) {} });
  }

  const Settings = {
    DEFAULTS: Object.assign({}, DEFAULTS),
    LANGUAGES: LANGUAGES.slice(),
    AUDIO_CAPS: AUDIO_CAPS,   // ★ экспортируем возможности

    get(key) { return (key in data) ? data[key] : undefined; },
    getAll() { return Object.assign({}, data); },

    set(key, value) {
      if (!(key in DEFAULTS)) { console.warn('[Settings] Неизвестный ключ:', key); return false; }
      if (!VALIDATORS[key](value)) { console.warn('[Settings] Неверное значение для', key, ':', value); return false; }
      data[key] = value;
      enforceAudioMode();
      persist();
      notify(key, value);
      return true;
    },

    reset() {
      data = Object.assign({}, DEFAULTS);
      enforceAudioMode();
      persist();
      for (const key of Object.keys(DEFAULTS)) notify(key, data[key]);
      return true;
    },

    onChange(cb) {
      if (typeof cb !== 'function') return () => {};
      listeners.push(cb);
      return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); };
    },

    // ★ Полезные геттеры
    getAudioCapabilities() { return Object.assign({}, AUDIO_CAPS); },
    isAudioModeSupported(mode) {
      if (mode === 'mono') return AUDIO_CAPS.mono;
      if (mode === 'stereo') return AUDIO_CAPS.stereo;
      if (mode === 'spatial') return AUDIO_CAPS.spatial;
      return false;
    }
  };

  global.Settings = Settings;
})(window);
