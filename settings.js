/* =====================================================================
   ORBITS.IO — SETTINGS BLOCK v16
   Путь: settings.js
   ===================================================================== */
(function () {
  'use strict';

  const MUSIC_URLS = ['./Звуки/Меню/Н1-1.mp3'];

  const ASSETS = {
    bg:          './Текстуры/Меню/Фонменю.jpg',
    music:       './Звуки/Меню/Н1-1.mp3',
    sfxBtn:      './Звуки/Система/Button.wav',
    sfxSet:      './Звуки/Система/Setting.wav',
    sfxSave:     './Звуки/Система/Save.wav',
    sfxBack:     './Звуки/Система/Back.wav',
    sfxBackMenu: './Звуки/Система/Back-select-menu.wav'
  };

  if (window.ORBITS && ORBITS.registerAssets) {
    ORBITS.registerAssets([
      { key: 'set_bg',       url: ASSETS.bg },
      { key: 'set_music',    url: ASSETS.music },
      { key: 'set_sfx_btn',  url: ASSETS.sfxBtn },
      { key: 'set_sfx_set',  url: ASSETS.sfxSet },
      { key: 'set_sfx_save', url: ASSETS.sfxSave },
      { key: 'set_sfx_back', url: ASSETS.sfxBack }
    ]);
  }

  const DICT = {
    ru: {
      title: 'Настройки', back: 'Назад', save: 'Сохранить',
      nickname: 'Ник', music: 'Музыка', sfx: 'Эффекты',
      vibration: 'Вибрация', brightness: 'Яркость', language: 'Язык',
      audio_mode: 'Режим звука', audio_mono: 'Моно', audio_stereo: 'Стерео', audio_spatial: 'Пространство',
      spatial_3d: '3D звук через камеру', calibrate: 'Калибровать', calibrate_again: 'Перекалибровка',
      hint_music: 'Громкость музыки', hint_sfx: 'Громкость эффектов', hint_vibration: 'Вибрация', hint_brightness: 'Яркость', hint_nickname: 'Ваш ник (до 16 символов)',
      hint_audio_mode: 'Моно, стерео или пространственный звук', hint_spatial_3d: 'Звук подстраивается под поворот головы',
      unsaved_title: 'Изменения не сохранены', unsaved_text: 'Что сделать?', unsaved_save: 'Сохранить и выйти', unsaved_discard: 'Не сохранять', unsaved_cancel: 'Отмена',
      reset_btn: 'Стереть все данные', reset_title: 'Внимание!', reset_text: 'Все данные будут удалены.', reset_yes: 'Да, стереть', reset_no: 'Отмена',
      reset_confirm2_title: 'Вы уверены?', reset_confirm2_text: 'Отменить нельзя.', reset_confirm2_yes: 'Стереть навсегда', reset_doing: 'Очистка...',
      cal_hint: 'Смотрите прямо в камеру', cal_step: 'Шаг', cal_of: 'из',
      cal_left: 'Поверните голову ВЛЕВО', cal_right: 'Поверните голову ВПРАВО',
      cal_up: 'Поверните голову ВВЕРХ', cal_down: 'Поверните голову ВНИЗ',
      cal_done: 'Готово!', cal_saved: 'Калибровка сохранена',
      cal_loading: 'Загрузка...', cal_error: 'Ошибка калибровки',
      cal_camera_unavailable: 'Камера недоступна', cal_cancel: 'Отмена',
      cal_wrong_left: 'Вы повернули голову вправо, но нужно налево!',
      cal_wrong_right: 'Вы повернули голову влево, но нужно направо!',
      cal_wrong_up: 'Вы наклонили голову вниз, но нужно вверх!',
      cal_wrong_down: 'Вы наклонили голову вверх, но нужно вниз!',
      cal_too_small: 'Поверните сильнее', cal_correct: 'Отлично!'
    },
    en: {
      title: 'Settings', back: 'Back', save: 'Save',
      nickname: 'Nickname', music: 'Music', sfx: 'Effects',
      vibration: 'Vibration', brightness: 'Brightness', language: 'Language',
      audio_mode: 'Audio mode', audio_mono: 'Mono', audio_stereo: 'Stereo', audio_spatial: 'Spatial',
      spatial_3d: '3D sound via camera', calibrate: 'Calibrate', calibrate_again: 'Recalibrate',
      hint_music: 'Music volume', hint_sfx: 'Effects volume', hint_vibration: 'Vibration', hint_brightness: 'Brightness', hint_nickname: 'Your nickname (up to 16 chars)',
      hint_audio_mode: 'Mono, Stereo or Spatial audio', hint_spatial_3d: 'Adapts to head rotation',
      unsaved_title: 'Unsaved changes', unsaved_text: 'What to do?', unsaved_save: 'Save and exit', unsaved_discard: 'Discard', unsaved_cancel: 'Cancel',
      reset_btn: 'Erase all data', reset_title: 'Warning!', reset_text: 'All data will be deleted.', reset_yes: 'Yes, erase', reset_no: 'Cancel',
      reset_confirm2_title: 'Are you sure?', reset_confirm2_text: 'Cannot be undone.', reset_confirm2_yes: 'Erase forever', reset_doing: 'Erasing...',
      cal_hint: 'Look straight at the camera', cal_step: 'Step', cal_of: 'of',
      cal_left: 'Turn your head LEFT', cal_right: 'Turn your head RIGHT',
      cal_up: 'Turn your head UP', cal_down: 'Turn your head DOWN',
      cal_done: 'Done!', cal_saved: 'Calibration saved',
      cal_loading: 'Loading...', cal_error: 'Calibration error',
      cal_camera_unavailable: 'Camera unavailable', cal_cancel: 'Cancel',
      cal_wrong_left: 'You turned right, but need to go left!',
      cal_wrong_right: 'You turned left, but need to go right!',
      cal_wrong_up: 'You tilted down, but need to go up!',
      cal_wrong_down: 'You tilted up, but need to go down!',
      cal_too_small: 'Turn stronger', cal_correct: 'Great!'
    },
    fr: {
      title: 'Paramètres', back: 'Retour', save: 'Enregistrer',
      nickname: 'Pseudo', music: 'Musique', sfx: 'Effets',
      vibration: 'Vibration', brightness: 'Luminosité', language: 'Langue',
      audio_mode: 'Mode audio', audio_mono: 'Mono', audio_stereo: 'Stéréo', audio_spatial: 'Spatial',
      spatial_3d: 'Son 3D via caméra', calibrate: 'Calibrer', calibrate_again: 'Recalibrer',
      hint_music: 'Volume musique', hint_sfx: 'Volume effets', hint_vibration: 'Vibration', hint_brightness: 'Luminosité', hint_nickname: 'Votre pseudo (16 max)',
      hint_audio_mode: 'Mono, Stéréo ou Spatial', hint_spatial_3d: 'S\'adapte à la tête',
      unsaved_title: 'Modifications non enregistrées', unsaved_text: 'Que faire ?', unsaved_save: 'Enregistrer et quitter', unsaved_discard: 'Ne pas enregistrer', unsaved_cancel: 'Annuler',
      reset_btn: 'Effacer tout', reset_title: 'Attention !', reset_text: 'Toutes les données seront supprimées.', reset_yes: 'Oui, effacer', reset_no: 'Annuler',
      reset_confirm2_title: 'Sûr ?', reset_confirm2_text: 'Action irréversible.', reset_confirm2_yes: 'Effacer définitivement', reset_doing: 'Suppression...',
      cal_hint: 'Regardez droit', cal_step: 'Étape', cal_of: 'sur',
      cal_left: 'Tournez à GAUCHE', cal_right: 'Tournez à DROITE',
      cal_up: 'Tournez en HAUT', cal_down: 'Tournez en BAS',
      cal_done: 'Terminé !', cal_saved: 'Calibration enregistrée',
      cal_loading: 'Chargement...', cal_error: 'Erreur',
      cal_camera_unavailable: 'Caméra indisponible', cal_cancel: 'Annuler',
      cal_wrong_left: 'Vous avez tourné à droite, il faut à gauche!',
      cal_wrong_right: 'Vous avez tourné à gauche, il faut à droite!',
      cal_wrong_up: 'Vous avez penché en bas, il faut en haut!',
      cal_wrong_down: 'Vous avez penché en haut, il faut en bas!',
      cal_too_small: 'Tournez plus fort', cal_correct: 'Excellent!'
    },
    es: {
      title: 'Ajustes', back: 'Atrás', save: 'Guardar',
      nickname: 'Apodo', music: 'Música', sfx: 'Efectos',
      vibration: 'Vibración', brightness: 'Brillo', language: 'Idioma',
      audio_mode: 'Modo de audio', audio_mono: 'Mono', audio_stereo: 'Estéreo', audio_spatial: 'Espacial',
      spatial_3d: 'Sonido 3D vía cámara', calibrate: 'Calibrar', calibrate_again: 'Recalibrar',
      hint_music: 'Volumen música', hint_sfx: 'Volumen efectos', hint_vibration: 'Vibración', hint_brightness: 'Brillo', hint_nickname: 'Tu apodo (máx. 16)',
      hint_audio_mode: 'Mono, Estéreo o Espacial', hint_spatial_3d: 'Se adapta a la cabeza',
      unsaved_title: 'Cambios sin guardar', unsaved_text: '¿Qué hacer?', unsaved_save: 'Guardar y salir', unsaved_discard: 'No guardar', unsaved_cancel: 'Cancelar',
      reset_btn: 'Borrar todo', reset_title: '¡Atención!', reset_text: 'Todos los datos se eliminarán.', reset_yes: 'Sí, borrar', reset_no: 'Cancelar',
      reset_confirm2_title: '¿Seguro?', reset_confirm2_text: 'No se puede deshacer.', reset_confirm2_yes: 'Borrar para siempre', reset_doing: 'Borrando...',
      cal_hint: 'Mira al frente', cal_step: 'Paso', cal_of: 'de',
      cal_left: 'Gira a la IZQUIERDA', cal_right: 'Gira a la DERECHA',
      cal_up: 'Gira ARRIBA', cal_down: 'Gira ABAJO',
      cal_done: '¡Listo!', cal_saved: 'Calibración guardada',
      cal_loading: 'Cargando...', cal_error: 'Error',
      cal_camera_unavailable: 'Cámara no disponible', cal_cancel: 'Cancelar',
      cal_wrong_left: 'Giraste a la derecha, ¡necesitas izquierda!',
      cal_wrong_right: 'Giraste a la izquierda, ¡necesitas derecha!',
      cal_wrong_up: 'Inclinaste abajo, ¡necesitas arriba!',
      cal_wrong_down: 'Inclinaste arriba, ¡necesitas abajo!',
      cal_too_small: 'Gira más', cal_correct: '¡Excelente!'
    }
  };

  function lang() {
    const l = (window.Settings && Settings.get('language')) || 'ru';
    return DICT[l] ? l : 'ru';
  }
  function T(key) {
    const d = DICT[lang()] || DICT.ru;
    return d[key] || DICT.ru[key] || key;
  }

  const SOUND_LOCK_MS = 350;
  let container = null;
  let root = null;
  let savedSnapshot = null;
  let working = null;
  let dirty = false;
  let modalOpen = false;
  let vibeTimeouts = [];
  let currentPage = 'main';
  let soundLockActive = false;
  let soundLockTimer = null;
  let tooltipEl = null;
  let tooltipTimer = null;
  let dependentContainer = null;

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  function getS(key) { return (window.Settings && window.Settings.get) ? window.Settings.get(key) : undefined; }
  function sfxVolume() { const v = getS('sfxVolume'); return (typeof v === 'number') ? v : 0.8; }
  function musicVolume() { const v = getS('musicVolume'); return (typeof v === 'number') ? v : 0.8; }
  function vibeEnabled() { const v = getS('vibration'); return (typeof v === 'boolean') ? v : true; }
  const canVibrate = () => !!navigator.vibrate && vibeEnabled();

  function stopVibrate() {
    vibeTimeouts.forEach(t => clearTimeout(t));
    vibeTimeouts = [];
    if (canVibrate()) { try { navigator.vibrate(0); } catch (e) {} }
  }
  let lastVibeTime = 0;
  function vibrateScroll(speedPxPerSec) {
    if (!canVibrate()) return;
    const now = performance.now();
    if (now - lastVibeTime < 40) return;
    lastVibeTime = now;
    const strength = Math.max(1, Math.min(12, Math.round(speedPxPerSec / 180)));
    try { navigator.vibrate(strength); } catch (e) {}
  }
  function vibrateButton() {
    if (!canVibrate()) return;
    stopVibrate();
    const pulses = [
      { dur: 12, pause: 28 }, { dur: 9, pause: 40 }, { dur: 6, pause: 55 },
      { dur: 4, pause: 75 }, { dur: 3, pause: 100 }, { dur: 2, pause: 140 }
    ];
    let t = 0;
    pulses.forEach((p) => {
      const id = setTimeout(() => {
        if (canVibrate()) { try { navigator.vibrate(p.dur); } catch (e) {} }
      }, t);
      vibeTimeouts.push(id);
      t += p.dur + p.pause;
    });
  }
  function vibrateToggle() {
    if (!canVibrate()) return;
    stopVibrate();
    const pulses = [
      { dur: 8, pause: 25 }, { dur: 6, pause: 35 }, { dur: 5, pause: 50 },
      { dur: 4, pause: 70 }, { dur: 3, pause: 95 }, { dur: 2, pause: 130 }
    ];
    let t = 0;
    pulses.forEach((p) => {
      const id = setTimeout(() => {
        if (canVibrate()) { try { navigator.vibrate(p.dur); } catch (e) {} }
      }, t);
      vibeTimeouts.push(id);
      t += p.dur + p.pause;
    });
  }

  async function loadSounds() {
    if (!window.Sound) return;
    await Promise.all([
      Sound.loadBuffer('set_sfx_btn',      ASSETS.sfxBtn).catch(() => {}),
      Sound.loadBuffer('set_sfx_set',      ASSETS.sfxSet).catch(() => {}),
      Sound.loadBuffer('set_sfx_save',     ASSETS.sfxSave).catch(() => {}),
      Sound.loadBuffer('set_sfx_back',     ASSETS.sfxBack).catch(() => {}),
      Sound.loadBuffer('set_sfx_backMenu', ASSETS.sfxBackMenu).catch(() => {})
    ]);
  }

  function playSFX(key, base, lockMs) {
    if (!window.Sound) return false;
    if (soundLockActive) return false;
    try {
      if (!Sound.hasBuffer(key)) return false;
      Sound.playSFX(key, { volume: (base || 1.0) * sfxVolume() });
      soundLockActive = true;
      if (soundLockTimer) clearTimeout(soundLockTimer);
      soundLockTimer = setTimeout(() => {
        soundLockActive = false;
        soundLockTimer = null;
      }, lockMs || SOUND_LOCK_MS);
      return true;
    } catch (e) { return false; }
  }

  function isLocked() { return soundLockActive; }

  function ensureTooltip() {
    if (tooltipEl && tooltipEl.parentNode) return tooltipEl;
    tooltipEl = el('div', 'st-tooltip');
    root.appendChild(tooltipEl);
    return tooltipEl;
  }
  function showTooltip(target, text) {
    if (!text) return;
    const tip = ensureTooltip();
    tip.textContent = text;
    const rect = target.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    tip.style.left = (rect.left - rootRect.left) + 'px';
    tip.style.top = (rect.bottom - rootRect.top + 8) + 'px';
    tip.classList.add('show');
  }
  function hideTooltip() {
    if (tooltipEl) tooltipEl.classList.remove('show');
  }
  function bindTooltip(target, text) {
    target.addEventListener('click', (e) => {
      e.stopPropagation();
      showTooltip(target, text);
      if (tooltipTimer) clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(hideTooltip, 4000);
    });
  }

  async function loadBlockMusicWithFallback() {
    if (!window.Sound) throw new Error('Sound не загружен');
    if (Sound.hasBuffer('set_music')) return true;
    for (let i = 0; i < MUSIC_URLS.length; i++) {
      try {
        await Sound.loadBuffer('set_music', MUSIC_URLS[i]);
        if (Sound.getDuration('set_music') > 0) return true;
      } catch (e) {}
    }
    throw new Error('Музыка настроек не загрузилась');
  }
  async function startBlockMusic() {
    if (!window.Sound) return;
    try {
      try { Sound.stopMusic(0); } catch (e) {}
      await loadBlockMusicWithFallback();
      const v = 0.7 * musicVolume();
      await Sound.playMusicCrossfade('set_music', { volume: v, fadeIn: 0.3 });
    } catch (e) {}
  }
  function setBlockMusicVolume(musicVol01) {
    if (!window.Sound) return;
    try { Sound.setMusicVolume(0.7 * musicVol01, 0); } catch (e) {}
  }

  function takeSnapshot() {
    const all = (window.Settings && Settings.getAll) ? Settings.getAll() : {};
    return {
      musicVolume01: (typeof all.musicVolume === 'number') ? all.musicVolume : 0.8,
      sfxVolume01:   (typeof all.sfxVolume   === 'number') ? all.sfxVolume   : 0.8,
      vibration:     (typeof all.vibration   === 'boolean') ? all.vibration   : true,
      nickname:      (typeof all.nickname    === 'string')  ? all.nickname    : '',
      brightness:    (typeof all.brightness  === 'number')  ? all.brightness  : 100,
      language:      (typeof all.language    === 'string')  ? all.language    : 'ru',
      audioMode:     (typeof all.audioMode   === 'string')  ? all.audioMode   : 'spatial',
      spatialNoHeadphones: (typeof all.spatialNoHeadphones === 'boolean') ? all.spatialNoHeadphones : true,
      spatialHeadphones:   (typeof all.spatialHeadphones   === 'boolean') ? all.spatialHeadphones   : false,
      headTracking:        (typeof all.headTracking === 'boolean') ? all.headTracking : false
    };
  }

  function recomputeDirty() {
    dirty =
      working.musicVolume !== Math.round(savedSnapshot.musicVolume01 * 100) ||
      working.sfxVolume   !== Math.round(savedSnapshot.sfxVolume01   * 100) ||
      working.vibration   !== savedSnapshot.vibration ||
      working.nickname    !== savedSnapshot.nickname ||
      working.brightness  !== savedSnapshot.brightness ||
      working.language    !== savedSnapshot.language ||
      working.audioMode   !== savedSnapshot.audioMode ||
      working.spatialNoHeadphones !== savedSnapshot.spatialNoHeadphones ||
      working.spatialHeadphones   !== savedSnapshot.spatialHeadphones ||
      working.headTracking        !== savedSnapshot.headTracking;
  }

  function applyPreview(key, uiValue) {
    if (key === 'musicVolume') setBlockMusicVolume(uiValue / 100);
    if (key === 'brightness')  applyBrightness(uiValue);
  }
  function revertToSaved(key) {
    if (key === 'musicVolume') setBlockMusicVolume(savedSnapshot.musicVolume01);
    if (key === 'brightness')  applyBrightness(savedSnapshot.brightness);
  }
  function applyBrightness(v) {
    const b = Math.max(0, Math.min(150, v)) / 100;
    document.documentElement.style.filter = 'brightness(' + b + ')';
  }

  function buildSlider(key, label, min, max, uiValue, formatter, hint) {
    const row = el('div', 'st-row st-slider-row');
    const labelWrap = el('div', 'st-label-wrap');
    labelWrap.appendChild(el('div', 'st-label', label));
    if (hint) {
      const help = el('div', 'st-help', '?');
      bindTooltip(help, hint);
      labelWrap.appendChild(help);
    }
    row.appendChild(labelWrap);

    const trackWrap = el('div', 'st-slider-track');
    const track = el('div', 'st-slider-track-inner');
    const fill = el('div', 'st-slider-fill');
    const knob = el('div', 'st-slider-knob');
    track.appendChild(fill); track.appendChild(knob);
    trackWrap.appendChild(track);
    row.appendChild(trackWrap);
    const valBox = el('div', 'st-value', formatter(uiValue));
    row.appendChild(valBox);

    let dragging = false;
    let previewUiValue = uiValue;
    let lastMoveTime = 0, lastMoveX = 0;

    function updateUI(v) {
      const ratio = (v - min) / (max - min);
      const w = Math.max(0, Math.min(1, ratio));
      fill.style.width = (w * 100) + '%';
      knob.style.left = (w * 100) + '%';
      valBox.textContent = formatter(v);
    }
    function valueFromClientX(clientX) {
      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      return Math.round(min + (x / rect.width) * (max - min));
    }
    function onStart(e) {
      if (isLocked()) return;
      dragging = true;
      previewUiValue = working[key];
      knob.classList.add('st-knob-active');
      lastMoveTime = performance.now();
      const p = e.touches ? e.touches[0] : e;
      lastMoveX = p.clientX;
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dx = Math.abs(p.clientX - lastMoveX);
      const speed = (dx / dt) * 1000;
      lastMoveTime = now; lastMoveX = p.clientX;
      vibrateScroll(speed);
      const v = valueFromClientX(p.clientX);
      previewUiValue = v;
      updateUI(v);
      applyPreview(key, v);
      e.preventDefault();
    }
    function onEnd(e) {
      if (!dragging) return;
      dragging = false;
      knob.classList.remove('st-knob-active');
      working[key] = previewUiValue;
      updateUI(previewUiValue);
      revertToSaved(key);
      recomputeDirty();
      playSFX('set_sfx_set', 0.7, 250);
      if (e) e.preventDefault();
    }

    trackWrap.addEventListener('touchstart', onStart, { passive: false });
    trackWrap.addEventListener('touchmove',  onMove,  { passive: false });
    trackWrap.addEventListener('touchend',   onEnd);
    trackWrap.addEventListener('touchcancel',onEnd);
    trackWrap.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    updateUI(uiValue);
    return row;
  }

  function buildMiniToggle(key, label, value, hint) {
    const row = el('div', 'st-row st-mini-row');
    const labelWrap = el('div', 'st-label-wrap');
    labelWrap.appendChild(el('div', 'st-label', label));
    if (hint) {
      const help = el('div', 'st-help', '?');
      bindTooltip(help, hint);
      labelWrap.appendChild(help);
    }
    row.appendChild(labelWrap);

    const trackWrap = el('div', 'st-mini-track');
    const knob = el('div', 'st-mini-knob');
    trackWrap.appendChild(knob);
    row.appendChild(trackWrap);

    const KNOB_TRAVEL = 34;
    let dragging = false;
    let lastMoveTime = 0, lastMoveX = 0;
    let currentPos = value ? 1 : 0;

    function setPos(p, animate) {
      p = Math.max(0, Math.min(1, p));
      currentPos = p;
      const x = KNOB_TRAVEL * p;
      const scale = dragging ? 1.4 : 1;
      knob.style.transition = animate
        ? 'transform 0.42s cubic-bezier(0.16,1,0.3,1)'
        : 'transform 0.06s linear';
      knob.style.transform = 'translateY(-50%) translateX(' + x + 'px) scale(' + scale + ')';
      trackWrap.classList.toggle('on', p >= 0.5);
    }
    function commitValue(v) {
      const changed = working[key] !== v;
      working[key] = v;
      if (v) vibrateToggle();
      playSFX('set_sfx_set', 1.0, 250);
      if (changed) recomputeDirty();
    }
    function onStart(e) {
      if (isLocked()) return;
      dragging = true;
      const p = e.touches ? e.touches[0] : e;
      lastMoveX = p.clientX;
      lastMoveTime = performance.now();
      setPos(currentPos, false);
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dx = p.clientX - lastMoveX;
      const speed = (Math.abs(dx) / dt) * 1000;
      lastMoveX = p.clientX; lastMoveTime = now;
      if (speed > 0) vibrateScroll(speed);
      const rect = trackWrap.getBoundingClientRect();
      const rel = (p.clientX - rect.left - 13) / KNOB_TRAVEL;
      setPos(rel, false);
      e.preventDefault();
    }
    function onEnd(e) {
      if (!dragging) return;
      dragging = false;
      const target = currentPos < 0.5 ? 0 : 1;
      setPos(target, true);
      commitValue(!!target);
      if (e) e.preventDefault();
    }
    let tapStart = 0;
    trackWrap.addEventListener('touchstart', (e) => {
      if (isLocked()) return;
      tapStart = performance.now();
      onStart(e);
    }, { passive: false });
    trackWrap.addEventListener('touchmove', onMove, { passive: false });
    trackWrap.addEventListener('touchend', (e) => {
      const dt = performance.now() - tapStart;
      const moved = Math.abs(currentPos - (value ? 1 : 0)) > 0.1;
      if (dt < 200 && !moved) {
        dragging = false;
        const nv = !working[key];
        setPos(nv ? 1 : 0, true);
        commitValue(nv);
        if (e) e.preventDefault();
        return;
      }
      onEnd(e);
    });
    trackWrap.addEventListener('touchcancel', onEnd);

    setPos(value ? 1 : 0, false);
    return row;
  }

  function buildSegmented(key, label, options, value, hint) {
    const row = el('div', 'st-row st-seg-row');
    const labelWrap = el('div', 'st-label-wrap');
    labelWrap.appendChild(el('div', 'st-label', label));
    if (hint) {
      const help = el('div', 'st-help', '?');
      bindTooltip(help, hint);
      labelWrap.appendChild(help);
    }
    row.appendChild(labelWrap);

    const seg = el('div', 'st-seg');
    const buttons = {};
    options.forEach(opt => {
      const btn = el('div', 'st-seg-btn', opt.label);
      if (opt.value === value) btn.classList.add('active');
      btn.addEventListener('click', () => {
        if (isLocked()) return;
        if (working[key] === opt.value) return;
        Object.keys(buttons).forEach(k => buttons[k].classList.remove('active'));
        btn.classList.add('active');
        working[key] = opt.value;
        recomputeDirty();
        playSFX('set_sfx_set', 1.0, 250);
        updateDependentRows();
      });
      buttons[opt.value] = btn;
      seg.appendChild(btn);
    });
    row.appendChild(seg);
    return row;
  }

  function buildMultiToggle(key, labels, value) {
    const row = el('div', 'st-row st-multi-row');
    const wrap = el('div', 'st-multi-wrap');
    const labelsRow = el('div', 'st-multi-labels');
    const labelEls = [];
    labels.forEach(l => {
      const lb = el('div', 'st-multi-label', l);
      labelsRow.appendChild(lb);
      labelEls.push(lb);
    });
    wrap.appendChild(labelsRow);

    const trackWrap = el('div', 'st-multi-track');
    const knob = el('div', 'st-multi-knob');
    trackWrap.appendChild(knob);
    wrap.appendChild(trackWrap);
    row.appendChild(wrap);

    const N = labels.length;
    const KNOB_SIZE = 26;
    const KNOB_LEFT_PAD = 3;
    const LANG_KEYS = ['ru', 'en', 'fr', 'es'];

    let dragging = false;
    let currentPos = 0;
    let lastMoveX = 0;
    const initialIndex = Math.max(0, labels.findIndex(l => l.toLowerCase() === value.toLowerCase()));
    currentPos = initialIndex / (N - 1);

    function knobXForIndexFloat(iFloat) {
      const rect = trackWrap.getBoundingClientRect();
      const w = rect.width;
      if (!w) return 0;
      const center = ((iFloat + 0.5) / N) * w;
      const x = center - KNOB_SIZE / 2 - KNOB_LEFT_PAD;
      const maxX = w - KNOB_SIZE - KNOB_LEFT_PAD * 2;
      return Math.max(0, Math.min(maxX, x));
    }
    function setPos(p, animate) {
      p = Math.max(0, Math.min(1, p));
      currentPos = p;
      const x = knobXForIndexFloat(p * (N - 1));
      knob.style.transition = animate
        ? 'transform 0.45s cubic-bezier(0.16,1,0.3,1)'
        : 'transform 0.06s linear';
      knob.style.transform = 'translateY(-50%) translateX(' + x + 'px)';
      const idx = Math.round(p * (N - 1));
      labelEls.forEach((it, i) => it.classList.toggle('active', i === idx));
    }
    function commitIndex(idx) {
      if (idx < 0 || idx >= N) return;
      const newLangKey = LANG_KEYS[idx];
      const changed = working[key] !== newLangKey;
      working[key] = newLangKey;
      playSFX('set_sfx_set', 1.0, 250);
      if (changed) recomputeDirty();
    }
    function onStart(e) {
      if (isLocked()) return;
      dragging = true;
      const p = e.touches ? e.touches[0] : e;
      lastMoveX = p.clientX;
      setPos(currentPos, false);
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const rect = trackWrap.getBoundingClientRect();
      let x = p.clientX - rect.left - KNOB_SIZE / 2 - KNOB_LEFT_PAD;
      const maxX = rect.width - KNOB_SIZE - KNOB_LEFT_PAD * 2;
      x = Math.max(0, Math.min(maxX, x));
      const center = (x + KNOB_SIZE / 2 + KNOB_LEFT_PAD) / rect.width;
      const idx = Math.max(0, Math.min(N - 1, Math.round(center * N - 0.5)));
      currentPos = idx / (N - 1);
      knob.style.transform = 'translateY(-50%) translateX(' + x + 'px)';
      labelEls.forEach((it, i) => it.classList.toggle('active', i === idx));
      e.preventDefault();
    }
    function onEnd(e) {
      if (!dragging) return;
      dragging = false;
      const idx = Math.round(currentPos * (N - 1));
      setPos(idx / (N - 1), true);
      commitIndex(idx);
      if (e) e.preventDefault();
    }
    trackWrap.addEventListener('touchstart', onStart, { passive: false });
    trackWrap.addEventListener('touchmove', onMove, { passive: false });
    trackWrap.addEventListener('touchend', onEnd);
    trackWrap.addEventListener('touchcancel', onEnd);
    trackWrap.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    requestAnimationFrame(() => setPos(currentPos, false));
    return row;
  }

  function buildNickInput(value) {
    const row = el('div', 'st-row st-nick-row');
    const labelWrap = el('div', 'st-label-wrap');
    labelWrap.appendChild(el('div', 'st-label', T('nickname')));
    const help = el('div', 'st-help', '?');
    bindTooltip(help, T('hint_nickname'));
    labelWrap.appendChild(help);
    row.appendChild(labelWrap);

    const wrap = el('div', 'st-nick-wrap');
    const inp = el('input', 'st-nick-input');
    inp.type = 'text';
    inp.maxLength = 16;
    inp.autocomplete = 'off';
    inp.spellcheck = false;
    inp.value = value || '';
    wrap.appendChild(inp);
    row.appendChild(wrap);
    inp.addEventListener('input', () => {
      working.nickname = inp.value;
      recomputeDirty();
    });
    return row;
  }

  function buildGlassButton(label, cls) {
    const btn = el('button', 'st-btn ' + (cls || ''));
    btn.type = 'button';
    btn.textContent = label;
    return btn;
  }

  function commit() {
    if (!window.Settings) return;
    Settings.set('musicVolume', working.musicVolume / 100);
    Settings.set('sfxVolume',   working.sfxVolume   / 100);
    Settings.set('vibration',   working.vibration);
    Settings.set('nickname',    working.nickname || '');
    Settings.set('brightness',  working.brightness);
    Settings.set('language',    working.language);
    Settings.set('audioMode',   working.audioMode);
    Settings.set('spatialNoHeadphones', working.spatialNoHeadphones);
    Settings.set('spatialHeadphones',   working.spatialHeadphones);
    Settings.set('headTracking',        working.headTracking);
    setBlockMusicVolume(working.musicVolume / 100);
    applyBrightness(working.brightness);
    savedSnapshot = takeSnapshot();
    dirty = false;
    setTimeout(() => rebuildPagesContent(), 80);
  }
  function rollback() {
    if (!window.Settings) return;
    Settings.set('musicVolume', savedSnapshot.musicVolume01);
    Settings.set('sfxVolume',   savedSnapshot.sfxVolume01);
    Settings.set('vibration',   savedSnapshot.vibration);
    Settings.set('nickname',    savedSnapshot.nickname);
    Settings.set('brightness',  savedSnapshot.brightness);
    Settings.set('language',    savedSnapshot.language);
    Settings.set('audioMode',   savedSnapshot.audioMode);
    Settings.set('spatialNoHeadphones', savedSnapshot.spatialNoHeadphones);
    Settings.set('spatialHeadphones',   savedSnapshot.spatialHeadphones);
    Settings.set('headTracking',        savedSnapshot.headTracking);
    setBlockMusicVolume(savedSnapshot.musicVolume01);
    applyBrightness(savedSnapshot.brightness);
    dirty = false;
    setTimeout(() => rebuildPagesContent(), 80);
  }

  function showUnsavedModal() {
    if (modalOpen) return;
    modalOpen = true;
    const overlay = el('div', 'st-modal');
    const box = el('div', 'st-modal-box');
    box.innerHTML = '<h3>' + T('unsaved_title') + '</h3>' +
                    '<p>' + T('unsaved_text').replace('\n', '<br>') + '</p>';
    const btnSave   = buildGlassButton(T('unsaved_save'), 'st-btn-primary');
    const btnNoSave = buildGlassButton(T('unsaved_discard'), 'st-btn-danger');
    const btnCancel = buildGlassButton(T('unsaved_cancel'), 'st-btn-secondary');
    btnSave.addEventListener('click', () => {
      if (isLocked()) return;
      playSFX('set_sfx_save', 0.9, 400); vibrateButton();
      commit(); hideModalOverlay();
      setTimeout(() => { playSFX('set_sfx_backMenu', 0.9, 500); }, 200);
      exitToMenu();
    });
    btnNoSave.addEventListener('click', () => {
      if (isLocked()) return;
      playSFX('set_sfx_back', 0.9, 400); vibrateButton();
      rollback(); hideModalOverlay();
      setTimeout(() => { playSFX('set_sfx_backMenu', 0.9, 500); }, 200);
      exitToMenu();
    });
    btnCancel.addEventListener('click', () => {
      if (isLocked()) return;
      playSFX('set_sfx_btn', 1.0, 350); vibrateButton();
      hideModalOverlay();
    });
    box.appendChild(btnSave);
    box.appendChild(btnNoSave);
    box.appendChild(btnCancel);
    overlay.appendChild(box);
    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  }
  function hideModalOverlay() {
    const overlay = root.querySelector('.st-modal');
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(() => { overlay.remove(); modalOpen = false; }, 500);
  }

  function showResetModal1() {
    if (modalOpen) return;
    modalOpen = true;
    const overlay = el('div', 'st-modal');
    const box = el('div', 'st-modal-box st-modal-danger');
    box.innerHTML = '<h3>' + T('reset_title') + '</h3>' +
                    '<p>' + T('reset_text') + '</p>';
    const btnYes = buildGlassButton(T('reset_yes'), 'st-btn-danger');
    const btnNo  = buildGlassButton(T('reset_no'),  'st-btn-secondary');
    btnYes.addEventListener('click', () => {
      if (isLocked()) return;
      vibrateButton();
      playSFX('set_sfx_back', 0.9, 400);
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        modalOpen = false;
        showResetModal2();
      }, 400);
    });
    btnNo.addEventListener('click', () => {
      if (isLocked()) return;
      vibrateButton();
      playSFX('set_sfx_btn', 1.0, 350);
      overlay.classList.remove('show');
      setTimeout(() => { overlay.remove(); modalOpen = false; }, 500);
    });
    box.appendChild(btnYes);
    box.appendChild(btnNo);
    overlay.appendChild(box);
    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  }
  function showResetModal2() {
    if (modalOpen) return;
    modalOpen = true;
    const overlay = el('div', 'st-modal');
    const box = el('div', 'st-modal-box st-modal-danger');
    box.innerHTML = '<h3>' + T('reset_confirm2_title') + '</h3>' +
                    '<p>' + T('reset_confirm2_text') + '</p>';
    const btnYes = buildGlassButton(T('reset_confirm2_yes'), 'st-btn-danger');
    const btnNo  = buildGlassButton(T('reset_no'), 'st-btn-secondary');
    btnYes.addEventListener('click', async () => {
      if (isLocked()) return;
      vibrateButton();
      box.innerHTML = '<h3>' + T('reset_doing') + '</h3><p>...</p>';
      try { playSFX('set_sfx_save', 1.0, 500); } catch (e) {}
      await doFullReset();
    });
    btnNo.addEventListener('click', () => {
      if (isLocked()) return;
      vibrateButton();
      playSFX('set_sfx_btn', 1.0, 350);
      overlay.classList.remove('show');
      setTimeout(() => { overlay.remove(); modalOpen = false; }, 500);
    });
    box.appendChild(btnYes);
    box.appendChild(btnNo);
    overlay.appendChild(box);
    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  async function doFullReset() {
    try { if (window.Sound) Sound.stopMusic(0); } catch (e) {}
    try { if (window.Sound && Sound.unloadAll) Sound.unloadAll(); } catch (e) {}
    try { if (window.Sound && Sound.pauseAll)  Sound.pauseAll();  } catch (e) {}
    try { if (window.HeadTracking && HeadTracking.destroy) HeadTracking.destroy(); } catch (e) {}
    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    try {
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('orbits_io');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    } catch (e) {}
    try {
      if (window.caches && caches.keys) {
        const keys = await caches.keys();
        for (const k of keys) { try { await caches.delete(k); } catch (e) {} }
      }
    } catch (e) {}
    try {
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) { try { await r.unregister(); } catch (e) {} }
      }
    } catch (e) {}
    await sleep(350);
    try {
      const base = location.origin + location.pathname;
      location.replace(base + '?fresh=' + Date.now());
    } catch (e) {
      try { location.reload(); } catch (e2) { location.href = location.href; }
    }
  }

  async function exitToMenu() {
    if (window.Sound) { try { Sound.stopMusic(0.4); } catch (e) {} }
    if (root) {
      root.classList.remove('show');
      await sleep(400);
      root.remove();
      root = null;
    }
    if (window.ORBITS && ORBITS.back) await ORBITS.back();
  }

  function updateDependentRows() {
    if (!dependentContainer) return;
    dependentContainer.innerHTML = '';
    if (working.audioMode !== 'spatial') return;

    const row3D = buildMiniToggle(
      'headTracking',
      T('spatial_3d'),
      working.headTracking,
      T('hint_spatial_3d')
    );

    const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    if (!hasCamera) {
      row3D.style.opacity = '0.4';
      row3D.style.pointerEvents = 'none';
      const err = el('div', 'st-row-error', T('cal_camera_unavailable'));
      row3D.appendChild(err);
    } else {
      const calBtn = el('div', 'st-calibrate-btn');
      const isCal = window.HeadTracking && HeadTracking.isCalibrated();
      // ★ Кнопка "Перекалибровка" если уже откалибровано
      calBtn.textContent = isCal ? T('calibrate_again') : T('calibrate');
      calBtn.addEventListener('click', () => {
        if (isLocked()) return;
        startCalibrationFlow();
      });
      row3D.appendChild(calBtn);
    }

    dependentContainer.appendChild(row3D);
    setTimeout(() => row3D.classList.add('show'), 80);
  }

  async function startCalibrationFlow() {
    if (!window.HeadTracking) return;
    if (!HeadTracking.isAvailable()) return;

    const overlay = el('div', 'st-cal-overlay');

    // Видео (зеркальное)
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.muted = true;
    video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scaleX(-1);z-index:1;';
    overlay.appendChild(video);

    // Canvas поверх видео для контура
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.appendChild(canvas);

    // Инфо-панель
    const info = el('div', 'st-cal-info');
    const label = el('div', 'st-cal-label', T('cal_loading'));
    const step = el('div', 'st-cal-step', '');
    const hint = el('div', 'st-cal-hint', '');
    info.appendChild(label);
    info.appendChild(step);
    info.appendChild(hint);
    overlay.appendChild(info);

    // Кнопка отмены
    const cancelBtn = el('button', 'st-cal-cancel', T('cal_cancel'));
    cancelBtn.addEventListener('click', () => {
      if (window.HeadTracking) HeadTracking.cancelCalibration();
      cleanup();
    });
    overlay.appendChild(cancelBtn);

    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    let cameraStream = null;
    function cleanup() {
      overlay.classList.remove('show');
      setTimeout(() => {
        if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
        overlay.remove();
        updateDependentRows();
      }, 600);
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      });
      video.srcObject = cameraStream;
      await video.play();
    } catch (e) {
      label.textContent = T('cal_camera_unavailable');
      setTimeout(cleanup, 2000);
      return;
    }

    const STEP_META = {
      center: { label: T('cal_hint'),  icon: '⬤' },
      left:   { label: T('cal_left'),  icon: '⬅' },
      right:  { label: T('cal_right'), icon: '➡' },
      up:     { label: T('cal_up'),    icon: '⬆' },
      down:   { label: T('cal_down'),  icon: '⬇' }
    };

    const HINTS = {
      left: {
        correct: T('cal_correct'),
        wrongSide: T('cal_wrong_left'),
        tooSmall: T('cal_too_small')
      },
      right: {
        correct: T('cal_correct'),
        wrongSide: T('cal_wrong_right'),
        tooSmall: T('cal_too_small')
      },
      up: {
        correct: T('cal_correct'),
        wrongSide: T('cal_wrong_up'),
        tooSmall: T('cal_too_small')
      },
      down: {
        correct: T('cal_correct'),
        wrongSide: T('cal_wrong_down'),
        tooSmall: T('cal_too_small')
      }
    };

    const ok = await HeadTracking.startCalibration({
      canvas: canvas,
      onStep: (stepId, index, total) => {
        const meta = STEP_META[stepId] || { label: stepId, icon: '·' };
        label.textContent = meta.icon + ' ' + meta.label;
        step.textContent = T('cal_step') + ' ' + (index + 1) + ' ' + T('cal_of') + ' ' + total;
        hint.textContent = '';
        hint.style.color = '';
      },
      onFrame: ({ step: stepId, check }) => {
        if (!check || !HINTS[stepId]) return;
        if (check.correct) {
          hint.textContent = HINTS[stepId].correct;
          hint.style.color = '#4ade80';
        } else if (check.actual && check.actual !== 'center') {
          hint.textContent = HINTS[stepId].wrongSide;
          hint.style.color = '#ef4444';
        } else {
          hint.textContent = HINTS[stepId].tooSmall;
          hint.style.color = '#fbbf24';
        }
      }
    });

    if (!ok) {
      label.textContent = T('cal_error');
      setTimeout(cleanup, 2000);
      return;
    }

    const checkDone = setInterval(() => {
      if (HeadTracking.isCalibrated()) {
        clearInterval(checkDone);
        label.textContent = T('cal_done');
        step.textContent = T('cal_saved');
        hint.textContent = '';
        // ★ Применяем калибровку к звуку
        const cal = HeadTracking.getCalibration();
        if (cal && window.Sound) Sound.applyCalibration(cal);
        setTimeout(cleanup, 1500);
      }
    }, 300);
  }

  function buildBg() {
    const bg = el('div', 'st-bg');
    bg.style.backgroundImage = "url('" + ASSETS.bg + "')";
    root.appendChild(bg);
    root.appendChild(el('div', 'st-bg-overlay'));
  }

  function buildHeader() {
    const header = el('div', 'st-header');
    const arrowLeft = el('div', 'st-arrow st-arrow-left', '‹');
    arrowLeft.addEventListener('click', () => {
      if (isLocked()) return;
      vibrateButton();
      playSFX('set_sfx_btn', 0.9, 350);
      goToPage('main');
    });
    header.appendChild(arrowLeft);
    const title = el('div', 'st-title', T('title'));
    header.appendChild(title);
    const arrowRight = el('div', 'st-arrow st-arrow-right', '›');
    arrowRight.addEventListener('click', () => {
      if (isLocked()) return;
      vibrateButton();
      playSFX('set_sfx_btn', 0.9, 350);
      goToPage('lang');
    });
    header.appendChild(arrowRight);
    root.appendChild(header);
    requestAnimationFrame(() => title.classList.add('show'));
    updateHeaderArrows(arrowLeft, arrowRight);
  }
  function updateHeaderArrows(left, right) {
    if (currentPage === 'main') {
      left.classList.add('inactive');
      right.classList.remove('inactive');
    } else {
      left.classList.remove('inactive');
      right.classList.add('inactive');
    }
  }

  function buildMainPageInto(pageEl) {
    const list = el('div', 'st-list');
    pageEl.appendChild(list);

    const rowAudio = buildSegmented('audioMode', T('audio_mode'), [
      { label: T('audio_mono'),    value: 'mono' },
      { label: T('audio_stereo'),  value: 'stereo' },
      { label: T('audio_spatial'), value: 'spatial' }
    ], working.audioMode, T('hint_audio_mode'));
    list.appendChild(rowAudio);

    dependentContainer = el('div', 'st-dependent');
    list.appendChild(dependentContainer);

    const rowNick   = buildNickInput(working.nickname);
    const rowMusic  = buildSlider('musicVolume', T('music'), 0, 100, working.musicVolume, v => v + '%', T('hint_music'));
    const rowSfx    = buildSlider('sfxVolume',   T('sfx'),   0, 100, working.sfxVolume,   v => v + '%', T('hint_sfx'));

    list.appendChild(rowNick);
    list.appendChild(rowMusic);
    list.appendChild(rowSfx);

    updateDependentRows();

    const rows = [rowAudio, rowNick, rowMusic, rowSfx];
    rows.forEach((r, i) => setTimeout(() => r.classList.add('show'), 100 + i * 130));
  }

  function buildLangPageInto(pageEl) {
    const list = el('div', 'st-list');
    pageEl.appendChild(list);

    // Язык + значок (?)
    const rowLang = buildMultiToggle('language', ['RU', 'EN', 'FR', 'ES'], working.language);
    rowLang.style.position = 'relative';
    const tipBtn = el('div', 'st-help', '?');
    tipBtn.style.position = 'absolute';
    tipBtn.style.top = '50%';
    tipBtn.style.transform = 'translateY(-50%)';
    tipBtn.style.right = '2vw';
    bindTooltip(tipBtn, 'Язык интерфейса');
    rowLang.appendChild(tipBtn);
    list.appendChild(rowLang);

    // Вибрация
    const rowVibe = buildMiniToggle('vibration', T('vibration'), working.vibration, T('hint_vibration'));
    list.appendChild(rowVibe);

    // Яркость
    const rowBright = buildSlider('brightness', T('brightness'), 0, 150, working.brightness, v => String(v), T('hint_brightness'));
    list.appendChild(rowBright);

    // Сброс
    const rowReset = el('div', 'st-row st-reset-row');
    const resetBtn = el('button', 'st-reset-btn');
    resetBtn.type = 'button';
    resetBtn.textContent = T('reset_btn');
    resetBtn.addEventListener('click', () => {
      if (isLocked()) return;
      vibrateButton();
      playSFX('set_sfx_btn', 1.0, 350);
      showResetModal1();
    });
    rowReset.appendChild(resetBtn);
    list.appendChild(rowReset);

    setTimeout(() => {
      rowLang.classList.add('show');
      setTimeout(() => rowVibe.classList.add('show'), 140);
      setTimeout(() => rowBright.classList.add('show'), 280);
      setTimeout(() => rowReset.classList.add('show'), 420);
    }, 100);
  }

  function buildBottomButtons() {
    const btnBack = el('button', 'st-btn-back');
    btnBack.type = 'button';
    btnBack.textContent = T('back');
    root.appendChild(btnBack);
    const btnSave = el('button', 'st-btn-save');
    btnSave.type = 'button';
    btnSave.textContent = T('save');
    root.appendChild(btnSave);
    btnBack.addEventListener('click', () => {
      if (isLocked()) return;
      vibrateButton();
      if (dirty) {
        playSFX('set_sfx_btn', 1.0, 350);
        showUnsavedModal();
      } else {
        playSFX('set_sfx_backMenu', 0.9, 500);
        exitToMenu();
      }
    });
    btnSave.addEventListener('click', () => {
      if (isLocked()) return;
      playSFX('set_sfx_save', 1.0, 450);
      vibrateButton();
      commit();
    });
  }

  async function buildAll() {
    root.innerHTML = '';
    buildBg();
    const mainPage = el('div', 'st-page st-page-main');
    const langPage = el('div', 'st-page st-page-lang');
    root.appendChild(mainPage);
    root.appendChild(langPage);
    buildMainPageInto(mainPage);
    buildLangPageInto(langPage);
    buildHeader();
    buildBottomButtons();
  }

  async function rebuildPagesContent() {
    const main = root.querySelector('.st-page-main');
    const lang = root.querySelector('.st-page-lang');
    if (!main || !lang) return;
    main.innerHTML = '';
    lang.innerHTML = '';
    buildMainPageInto(main);
    buildLangPageInto(lang);
    const btnBack = root.querySelector('.st-btn-back');
    const btnSave = root.querySelector('.st-btn-save');
    if (btnBack) btnBack.textContent = T('back');
    if (btnSave) btnSave.textContent = T('save');
  }

  async function goToPage(page) {
    if (page === currentPage) return;
    currentPage = page;
    const mainPage = root.querySelector('.st-page-main');
    const langPage = root.querySelector('.st-page-lang');
    if (mainPage) mainPage.style.transform = page === 'lang' ? 'translateX(-100%)' : 'translateX(0)';
    if (langPage) langPage.style.transform = page === 'lang' ? 'translateX(0)' : 'translateX(100%)';
    const left = root.querySelector('.st-arrow-left');
    const right = root.querySelector('.st-arrow-right');
    updateHeaderArrows(left, right);
  }

  function injectStyles() {
    if (document.getElementById('orbits-settings-styles-v16')) return;
    const css = `
      .st-root { position: absolute; inset: 0; z-index: 50; overflow: hidden; pointer-events: auto; color: #fff; }
      .st-bg { position: absolute; inset: 0; background-size: cover; background-position: center;
        filter: brightness(0.75) saturate(1.2); z-index: 1; }
      .st-bg-overlay { position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%);
        z-index: 2; pointer-events: none; }

      .st-page { position: absolute; inset: 0; z-index: 5;
        transition: transform 0.62s cubic-bezier(0.22, 1, 0.36, 1); will-change: transform; }
      .st-page-main { transform: translateX(0); }
      .st-page-lang { transform: translateX(100%); }

      .st-header { position: absolute; top: 1.2vh; left: 0; right: 0;
        display: flex; align-items: center; justify-content: center; z-index: 8; gap: 18px; pointer-events: none; }
      .st-title { font-size: 30px; font-weight: 900; letter-spacing: 7px; text-transform: uppercase; color: #fff;
        text-shadow: 0 0 20px rgba(140,80,255,0.8); opacity: 0; transition: opacity 0.9s ease; }
      .st-title.show { opacity: 1; }

      .st-arrow { pointer-events: auto; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
        border-radius: 50%; color: #fff; font-size: 26px; font-weight: 900; cursor: pointer;
        backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
      .st-arrow:active { transform: scale(0.9); }
      .st-arrow.inactive { opacity: 0.28; pointer-events: none; }

      .st-list { position: absolute; top: 12vh; left: 50%; transform: translateX(-50%);
        width: min(85vw, 820px); display: flex; flex-direction: column; gap: 1.5vh; z-index: 5; }

      .st-row { position: relative; display: flex; align-items: center; gap: 2vw; padding: 1.25vh 2.4vh; border-radius: 24px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
        border: 1px solid rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(25px) saturate(200%); -webkit-backdrop-filter: blur(25px) saturate(200%);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.3);
        overflow: hidden; opacity: 0; transform: translateY(20px) scale(0.95);
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      .st-row::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 50%;
        background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
        pointer-events: none; border-radius: 24px 24px 0 0; }
      .st-row.show { opacity: 1; transform: translateY(0) scale(1); }

      .st-label-wrap { flex: 0 0 32%; display: flex; align-items: center; gap: 8px; position: relative; z-index: 2; }
      .st-label { font-size: 14px; letter-spacing: 2px; text-transform: uppercase; color: #fff; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

      .st-help { width: 22px; height: 22px; border-radius: 50%;
        background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 900; color: #fff; cursor: pointer; flex: 0 0 auto; }
      .st-help:active { background: rgba(255,255,255,0.5); }

      .st-tooltip { position: absolute; z-index: 100; max-width: 300px; padding: 10px 14px;
        background: rgba(20,15,40,0.95); border: 1px solid rgba(180,140,255,0.5);
        border-radius: 12px; color: #e0d8ff; font-size: 12px; line-height: 1.5;
        box-shadow: 0 8px 30px rgba(0,0,0,0.8);
        opacity: 0; transform: translateY(-6px); pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease; }
      .st-tooltip.show { opacity: 1; transform: translateY(0); }

      .st-slider-track { position: relative; flex: 1 1 auto; height: 46px; display: flex; align-items: center; padding: 0 22px; touch-action: none; }
      .st-slider-track-inner { position: relative; width: 100%; height: 12px;
        background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 20px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); }
      .st-slider-fill { position: absolute; left: 0; top: 0; bottom: 0;
        background: linear-gradient(90deg, rgba(140,70,255,1) 0%, rgba(200,120,255,1) 100%);
        border-radius: 20px; box-shadow: 0 0 15px rgba(160,80,255,0.8); }
      .st-slider-knob { position: absolute; top: 50%; left: 0; width: 30px; height: 30px; border-radius: 50%;
        background: #fff; border: 2px solid rgba(255,255,255,0.9);
        box-shadow: 0 0 15px rgba(180,120,255,1), 0 4px 10px rgba(0,0,0,0.5);
        transform: translate(-50%, -50%); pointer-events: none; transition: transform 0.2s ease; }
      .st-slider-knob.st-knob-active { transform: translate(-50%, -50%) scale(1.3); }
      .st-value { flex: 0 0 10%; text-align: right; font-size: 14px; color: #fff; font-weight: 800; }

      .st-mini-track { position: relative; flex: 0 0 66px; height: 32px;
        background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);
        border-radius: 40px; cursor: pointer; touch-action: none; }
      .st-mini-track.on { background: linear-gradient(135deg, rgba(140,70,255,1), rgba(200,120,255,1)); }
      .st-mini-knob { position: absolute; top: 50%; left: 3px; width: 26px; height: 26px; border-radius: 50%;
        background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); transform: translateY(-50%); pointer-events: none; }

      .st-seg { flex: 1 1 auto; display: flex; gap: 8px; position: relative; z-index: 2; }
      .st-seg-btn { flex: 1 1 0; padding: 10px 8px; text-align: center;
        font-size: 13px; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;
        color: rgba(255,255,255,0.6); cursor: pointer;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
        transition: all 0.3s ease; }
      .st-seg-btn.active { color: #fff; background: linear-gradient(135deg, rgba(140,70,255,0.8), rgba(200,120,255,0.8));
        border-color: rgba(255,255,255,0.4); }

      .st-multi-wrap { flex: 1 1 auto; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
      .st-multi-labels { display: flex; font-size: 14px; letter-spacing: 2px; color: rgba(255,255,255,0.5); font-weight: 800; }
      .st-multi-label { flex: 1 1 0; text-align: center; cursor: pointer; }
      .st-multi-label.active { color: #fff; text-shadow: 0 0 10px rgba(200,120,255,1); }
      .st-multi-track { position: relative; height: 32px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2);
        border-radius: 40px; cursor: pointer; touch-action: none; width: 100%; }
      .st-multi-knob { position: absolute; top: 50%; left: 3px; width: 26px; height: 26px; border-radius: 50%;
        background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.5); transform: translateY(-50%); pointer-events: none; }

      .st-nick-wrap { flex: 1 1 auto; position: relative; z-index: 2; }
      .st-nick-input { width: 100%; padding: 10px 18px;
        background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); border-radius: 14px;
        color: #fff; font-size: 16px; outline: none; }
      .st-nick-input:focus { border-color: rgba(200,120,255,0.8); }

      .st-btn-back, .st-btn-save { position: absolute; bottom: 4vh; padding: 1.5vh 4vh;
        color: #fff; font-family: inherit; font-size: 18px; letter-spacing: 2px;
        text-transform: uppercase; font-weight: 900; border-radius: 20px; cursor: pointer; z-index: 8;
        transition: transform 0.2s ease; }
      .st-btn-back { left: 4vw; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); }
      .st-btn-save { right: 4vw; background: linear-gradient(135deg, rgba(140,70,255,0.9), rgba(200,120,255,0.9));
        border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 8px 24px rgba(140,70,255,0.5); }
      .st-btn-back:active, .st-btn-save:active { transform: scale(0.95); }

      .st-reset-row { justify-content: center; padding: 1.5vh 2.4vh;
        background: rgba(255,80,80,0.15); border: 1px solid rgba(255,80,80,0.3); }
      .st-reset-btn { width: 100%; padding: 12px; font-family: inherit; font-size: 15px;
        letter-spacing: 1.5px; text-transform: uppercase; font-weight: 900; color: #ffb8b8;
        background: transparent; border: none; cursor: pointer; }

      .st-calibrate-btn { margin-left: auto; padding: 8px 16px;
        background: rgba(255,255,255,0.15); border-radius: 12px; font-size: 12px; font-weight: 800;
        letter-spacing: 1px; text-transform: uppercase; color: #fff; cursor: pointer; }
      .st-calibrate-btn:active { background: rgba(255,255,255,0.3); }
      .st-row-error { position: absolute; bottom: -18px; left: 0; right: 0; font-size: 10px; color: #ff8080; text-align: center; }

      .st-cal-overlay { position: absolute; inset: 0; z-index: 100; background: #000;
        opacity: 0; transition: opacity 0.6s ease; pointer-events: auto; }
      .st-cal-overlay.show { opacity: 1; }
      .st-cal-info { position: absolute; bottom: 8vh; left: 50%; transform: translateX(-50%);
        z-index: 3; text-align: center; color: #fff; width: min(85vw, 600px); }
      .st-cal-label { font-size: 26px; font-weight: 900; margin-bottom: 8px; text-shadow: 0 0 20px rgba(180,120,255,1); }
      .st-cal-step { font-size: 16px; color: rgba(255,255,255,0.8); margin-bottom: 10px; }
      .st-cal-hint { font-size: 18px; font-weight: 800; min-height: 24px; transition: color 0.3s ease; }
      .st-cal-cancel { position: absolute; top: 4vh; right: 4vw; z-index: 4; padding: 10px 24px;
        font-family: inherit; font-size: 14px; font-weight: 800; color: #fff;
        background: rgba(255,255,255,0.2); border: none; border-radius: 12px; cursor: pointer; }

      .st-modal { position: absolute; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0); opacity: 0; transition: opacity 0.5s ease; }
      .st-modal.show { opacity: 1; background: rgba(0,0,0,0.7); }
      .st-modal-box { width: min(88vw, 480px); padding: 30px 26px;
        background: linear-gradient(135deg, rgba(40,30,60,0.95), rgba(20,15,30,0.95));
        border: 1px solid rgba(255,255,255,0.2); border-radius: 24px; text-align: center;
        transform: scale(0.8); opacity: 0; transition: transform 0.5s ease, opacity 0.5s ease; }
      .st-modal.show .st-modal-box { transform: scale(1); opacity: 1; }
      .st-modal-box h3 { font-size: 20px; color: #fff; margin-bottom: 10px; }
      .st-modal-box p { font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 20px; }
      .st-btn { padding: 14px; font-family: inherit; font-size: 16px; font-weight: 800;
        border-radius: 16px; cursor: pointer; display: block; width: 100%; margin-top: 10px; border: none; color: #fff; }
      .st-btn-primary { background: linear-gradient(135deg, rgba(140,70,255,1), rgba(200,120,255,1)); }
      .st-btn-danger { background: rgba(255,80,80,0.8); }
      .st-btn-secondary { background: rgba(255,255,255,0.1); }
    `;
    const style = document.createElement('style');
    style.id = 'orbits-settings-styles-v16';
    style.textContent = css;
    document.head.appendChild(style);
  }

  async function start() {
    ['orbits-settings-styles', 'orbits-settings-styles-v2', 'orbits-settings-styles-v3',
     'orbits-settings-styles-v4', 'orbits-settings-styles-v5', 'orbits-settings-styles-v6',
     'orbits-settings-styles-v7', 'orbits-settings-styles-v8', 'orbits-settings-styles-v9',
     'orbits-settings-styles-v10', 'orbits-settings-styles-v11', 'orbits-settings-styles-v12',
     'orbits-settings-styles-v13', 'orbits-settings-styles-v14', 'orbits-settings-styles-v15'].forEach(id => {
      const old = document.getElementById(id);
      if (old) old.remove();
    });

    container = document.getElementById('game-container') || document.body;
    injectStyles();
    await loadSounds();

    savedSnapshot = takeSnapshot();
    working = {
      musicVolume: Math.round(savedSnapshot.musicVolume01 * 100),
      sfxVolume:   Math.round(savedSnapshot.sfxVolume01   * 100),
      vibration:   savedSnapshot.vibration,
      nickname:    savedSnapshot.nickname,
      brightness:  savedSnapshot.brightness,
      language:    savedSnapshot.language,
      audioMode:   savedSnapshot.audioMode,
      spatialNoHeadphones: savedSnapshot.spatialNoHeadphones,
      spatialHeadphones:   savedSnapshot.spatialHeadphones,
      headTracking:        savedSnapshot.headTracking
    };
    dirty = false;
    currentPage = 'main';
    applyBrightness(working.brightness);
    root = el('div', 'st-root');
    container.appendChild(root);
    await buildAll();
    await sleep(200);
    await startBlockMusic();

    // ★ Применяем калибровку к звуку если уже есть
    if (window.HeadTracking && HeadTracking.getCalibration() && window.Sound) {
      Sound.applyCalibration(HeadTracking.getCalibration());
    }
  }
  start();
})();
