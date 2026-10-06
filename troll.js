/* =====================================================================
   ORBITS.IO — TROLL v4 (полная адаптивная ИИ-система с скелетами)
   Путь: troll.js

   Самообучающаяся система управления производительностью.
   Без нейросетей, без библиотек, без нагрузки на GPU.

   Компоненты:
   - Perception  — замер FPS, frame time, jitter, тренд, прогноз
   - Memory      — скелеты (базы + дети), глобальные точки, типы нагрузки
   - Reasoning   — ансамбль из 5 стратегий с обучаемыми весами
   - Action      — плавное изменение FPS и renderScale
   - Reflection  — проверка результата, откат ошибочных решений
   - Feedback    — обновление весов, затухание, перепривязка сирот

   Скелеты:
   - База (base) — полный контекст + метрики
   - Ребёнок (child) — только diff от базы + метрики
   - Экономия 3-5x по памяти
   - Функциональность 1:1 (с реконструкцией)
   - Перепривязка сирот при удалении базы

   API:
     Troll.setBlock('map1');
     Troll.setContext({ zone:'water', phase:'race' });
     Troll.setLoadTypes(['water','particles']);
     Troll.clearContext();
     Troll.markMin(ctx); Troll.markMax(ctx);
     Troll.subscribe(cb);
     Troll.getProfile('map1');
     Troll.getStats();
     Troll.resetAll();
     Troll.show(); Troll.hide();
   ===================================================================== */
(function () {
  'use strict';

  // ============================================================
  // КОНСТАНТЫ
  // ============================================================

  const HUD_ID = 'orbits-troll-hud';
  const STORAGE_KEY = 'orbits_troll_ai';
  const STORAGE_VERSION = 4;

  // Границы
  const FPS_MIN = 30;
  const FPS_NATIVE_60 = 60;
  const FPS_NATIVE_120 = 120;
  const SCALE_MIN = 0.55;
  const SCALE_MAX = 1.00;

  // Шаги (за тик 100мс)
  const FPS_STEP = 1;
  const SCALE_STEP = 0.01;

  // Множители шага
  const STEP_FAST = 3.0;
  const STEP_SLOW = 0.5;
  const STEP_NORMAL = 1.0;

  // Гистерезис (мс)
  const HYST_BAD = 3000;
  const HYST_GOOD = 8000;
  const HYST_REFLECT = 5000;

  // Замеры
  const FRAME_WINDOW = 90;
  const WARMUP_FRAMES = 30;
  const TICK_MS = 100;
  const FPS_HISTORY_SIZE = 30;

  // Пороги классификации
  const TH_GOOD = 0.95;
  const TH_OK = 0.85;
  const TH_WARN = 0.70;
  const TH_CRIT = 0.55;

  // Fuzzy match
  const FUZZY_THRESHOLD = 0.60;
  const BASE_CREATE_SIMILARITY = 0.50;   // порог для привязки к базе
  const BASE_REBIND_THRESHOLD = 0.50;    // порог для перепривязки сироты

  // Скелеты
  const CHILDREN_PER_BASE_MAX = 3;       // до 3 детей на базу

  // Затухание
  const DECAY_PER_DAY = 0.99;
  const DECAY_MIN_STRENGTH = 0.10;

  // Лимиты
  const MAX_BASES_PER_BLOCK = 500;
  const MAX_CHILDREN_PER_BLOCK = 1500;
  const MAX_GLOBAL_BASES = 1000;
  const MAX_GLOBAL_CHILDREN = 3000;
  const MAX_HISTORY = 100;
  const MAX_LOAD_TYPES = 50;

  // ============================================================
  // СОСТОЯНИЕ
  // ============================================================

  let currentBlock = null;
  let currentContext = {};
  let currentLoadTypes = [];
  let contextHash = '';

  let memory = null;

  // Текущие фактические
  let fpsActual = 0;
  let fpsTarget = null;
  let scaleTarget = SCALE_MAX;
  let scaleActual = SCALE_MAX;

  // Замеры
  let frameTimes = [];
  let lastFrameTime = 0;
  let fpsCounter = 0;
  let fpsIntervalStart = 0;
  let warmupCounter = 0;
  let paused = false;
  let fpsHistory = [];

  // Гистерезис
  let lastBadChange = 0;
  let lastGoodChange = 0;

  // Рефлексия
  let pendingAction = null;

  // Батарея
  let batteryLevel = null;
  let batteryCharging = false;

  // Подписчики
  const subscribers = [];

  // Таймеры
  let tickTimer = null;
  let rAFId = null;

  // Кэш реконструкции контекстов (WeakMap для GC)
  let ctxCache = new WeakMap();

  // Флаги оптимизации
  let lastHudRender = 0;
  let lastSaveTime = 0;

  // ============================================================
  // УТИЛИТЫ
  // ============================================================

  const now = () => performance.now();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const nowDay = () => Math.floor(Date.now() / 86400000);

  function isPWA() {
    if (typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           window.matchMedia('(display-mode: minimal-ui)').matches ||
           window.navigator.standalone === true;
  }

  function hashContext(ctx) {
    if (!ctx || typeof ctx !== 'object') return '';
    const keys = Object.keys(ctx);
    if (!keys.length) return '';
    keys.sort();
    let s = '';
    for (let i = 0; i < keys.length; i++) {
      s += keys[i] + '=' + String(ctx[keys[i]]) + (i < keys.length - 1 ? '|' : '');
    }
    return s;
  }

  // ============================================================
  // ПАМЯТЬ
  // ============================================================

  function createEmptyMemory() {
    return {
      version: STORAGE_VERSION,
      blocks: {},
      globalBases: {},
      globalChildren: {},
      loadTypes: {},
      strategies: {
        local:      { weight: 1.0, successes: 0, failures: 0 },
        global:     { weight: 0.8, successes: 0, failures: 0 },
        loadTypes:  { weight: 0.7, successes: 0, failures: 0 },
        experiment: { weight: 0.4, successes: 0, failures: 0 },
        emergency:  { weight: 1.0, successes: 0, failures: 0 }
      },
      history: [],
      _nextBaseId: 1,
      _lastDecay: 0,
      stats: {
        totalActions: 0, totalSuccesses: 0, totalFailures: 0,
        sessionsCount: 0, firstSeen: Date.now(), lastSeen: Date.now()
      }
    };
  }

  function loadMemory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyMemory();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STORAGE_VERSION) return createEmptyMemory();
      const empty = createEmptyMemory();
      // Мягкое слияние: если чего-то нет — берём из empty
      const result = Object.assign(empty, parsed);
      // Гарантируем наличие вложенных объектов
      result.blocks = result.blocks || {};
      result.globalBases = result.globalBases || {};
      result.globalChildren = result.globalChildren || {};
      result.loadTypes = result.loadTypes || {};
      result.strategies = Object.assign(empty.strategies, result.strategies || {});
      result.history = result.history || [];
      result.stats = Object.assign(empty.stats, result.stats || {});
      result._nextBaseId = result._nextBaseId || 1;
      return result;
    } catch (e) {
      console.warn('[Troll] память повреждена:', e.message);
      return createEmptyMemory();
    }
  }

  function saveMemory() {
    try {
      memory.stats.lastSeen = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch (e) {
      // Если места нет — чистим слабое
      try {
        cleanupWeakGlobal();
        for (const bid in memory.blocks) cleanupWeak(memory.blocks[bid]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
      } catch (e2) {
        console.warn('[Troll] не удалось сохранить память:', e2.message);
      }
    }
  }

  function ensureBlock(blockId) {
    if (!memory.blocks[blockId]) {
      memory.blocks[blockId] = {
        blockId,
        optimalFPS: null,
        optimalScale: SCALE_MAX,
        samples: 0,
        avgFPS: 0,
        avgScale: SCALE_MAX,
        minFPSSeen: null,
        maxFPSSeen: null,
        bases: {},
        children: {},
        lastUpdate: 0
      };
    }
    return memory.blocks[blockId];
  }

  // ============================================================
  // СКЕЛЕТЫ (базы + дети)
  // ============================================================

  function makeBaseId() {
    return 'b' + (memory._nextBaseId++);
  }

  function createBase(ctx, loadTypes, type) {
    return {
      id: makeBaseId(),
      ctx: Object.assign({}, ctx),
      loadTypes: loadTypes.slice(),
      type: type || 'min',
      fpsDelta: 0,
      scaleDelta: 0,
      strength: 1.0,
      hits: 0, misses: 0,
      lastSeen: Date.now(),
      created: Date.now()
    };
  }

  function createChild(baseId, diff, loadTypes, type) {
    return {
      baseId,
      diff: Object.assign({}, diff),
      loadTypes: loadTypes.slice(),
      type: type || 'min',
      fpsDelta: 0,
      scaleDelta: 0,
      strength: 1.0,
      hits: 0, misses: 0,
      lastSeen: Date.now(),
      created: Date.now()
    };
  }

  function resolveChild(child, bases) {
    if (!child || !child.baseId) return null;
    // Кэш
    let cached = ctxCache.get(child);
    if (cached && cached.baseId === child.baseId) return cached.ctx;
    const base = bases[child.baseId];
    if (!base) return null;
    const full = Object.assign({}, base.ctx, child.diff);
    ctxCache.set(child, { baseId: child.baseId, ctx: full });
    return full;
  }

  function findBaseFor(bases, ctx) {
    let best = null;
    let bestScore = 0;
    for (const id in bases) {
      const b = bases[id];
      const sim = contextSimilarity(b.ctx, ctx);
      if (sim > bestScore) { bestScore = sim; best = b; }
    }
    return bestScore >= BASE_CREATE_SIMILARITY ? { base: best, similarity: bestScore } : null;
  }

  function computeDiff(baseCtx, ctx) {
    const diff = {};
    for (const k in ctx) {
      if (baseCtx[k] !== ctx[k]) diff[k] = ctx[k];
    }
    return diff;
  }

  function rebindOrphans(container, removedBaseId) {
    const bases = container.bases;
    const children = container.children;
    const orphans = [];
    for (const hash in children) {
      if (children[hash].baseId === removedBaseId) orphans.push(hash);
    }
    for (const hash of orphans) {
      const child = children[hash];
      // Пробуем найти новую базу
      let rebind = null;
      for (const id in bases) {
        const b = bases[id];
        const sim = contextSimilarity(b.ctx, child.diff);
        if (sim >= BASE_REBIND_THRESHOLD && (!rebind || sim > rebind.sim)) {
          rebind = { base: b, sim };
        }
      }
      if (rebind) {
        child.baseId = rebind.base.id;
        // Пересчитываем diff относительно новой базы
        const fullCtx = Object.assign({}, bases[removedBaseId] ? bases[removedBaseId].ctx : {}, child.diff);
        child.diff = computeDiff(rebind.base.ctx, fullCtx);
      } else {
        // Превращаем в базу
        const newBase = createBase(child.diff, child.loadTypes, child.type);
        newBase.fpsDelta = child.fpsDelta;
        newBase.scaleDelta = child.scaleDelta;
        newBase.strength = child.strength;
        newBase.hits = child.hits;
        newBase.misses = child.misses;
        bases[newBase.id] = newBase;
        delete children[hash];
      }
    }
  }

  // ============================================================
  // ПОХОЖЕСТЬ
  // ============================================================

  function contextSimilarity(a, b) {
    if (!a || !b) return 0;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (!keysA.length && !keysB.length) return 1;
    if (!keysA.length || !keysB.length) return 0;

    let matches = 0;
    let total = 0;
    // Все ключи
    const seen = {};
    for (let i = 0; i < keysA.length; i++) {
      const k = keysA[i];
      seen[k] = true;
      total++;
      if (k in b && String(a[k]) === String(b[k])) matches++;
    }
    for (let i = 0; i < keysB.length; i++) {
      const k = keysB[i];
      if (!seen[k]) total++;
    }
    return total > 0 ? matches / total : 0;
  }

  function arraysSimilarity(a, b) {
    if (!a || !b || (!a.length && !b.length)) return 1;
    if (!a.length || !b.length) return 0;
    const setB = {};
    for (let i = 0; i < b.length; i++) setB[b[i]] = true;
    let matches = 0;
    for (let i = 0; i < a.length; i++) if (setB[a[i]]) matches++;
    return (2 * matches) / (a.length + b.length);
  }

  // ============================================================
  // ПОИСК ПОХОЖИХ
  // ============================================================

  function findSimilarInContainer(container, ctx, loadTypes) {
    const results = [];
    // Базы
    for (const id in container.bases) {
      const b = container.bases[id];
      const sim = contextSimilarity(b.ctx, ctx);
      if (sim >= FUZZY_THRESHOLD) {
        const loadSim = arraysSimilarity(b.loadTypes, loadTypes);
        results.push({ point: b, similarity: sim * 0.7 + loadSim * 0.3, source: 'base', strength: b.strength });
      }
    }
    // Дети
    for (const hash in container.children) {
      const c = container.children[hash];
      const fullCtx = resolveChild(c, container.bases);
      if (!fullCtx) continue;
      const sim = contextSimilarity(fullCtx, ctx);
      if (sim >= FUZZY_THRESHOLD) {
        const loadSim = arraysSimilarity(c.loadTypes, loadTypes);
        results.push({ point: c, similarity: sim * 0.7 + loadSim * 0.3, source: 'child', strength: c.strength });
      }
    }
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  function findSimilarPoints(blockId, ctx, loadTypes) {
    const p = memory.blocks[blockId];
    if (!p) return [];
    return findSimilarInContainer(p, ctx, loadTypes);
  }

  function findSimilarGlobalPoints(ctx, loadTypes) {
    return findSimilarInContainer(
      { bases: memory.globalBases, children: memory.globalChildren },
      ctx, loadTypes
    );
  }

  // ============================================================
  // UPSERT ТОЧКИ
  // ============================================================

  function upsertPoint(container, ctx, loadTypes, type) {
    const hash = hashContext(ctx);
    if (!hash) return null;

    // 1. Ребёнок с таким хэшем?
    if (container.children[hash]) {
      container.children[hash].lastSeen = Date.now();
      return container.children[hash];
    }
    // 2. База с точно таким же контекстом?
    for (const id in container.bases) {
      const b = container.bases[id];
      if (hashContext(b.ctx) === hash) {
        b.lastSeen = Date.now();
        return b;
      }
    }
    // 3. Найти подходящую базу
    const found = findBaseFor(container.bases, ctx);
    if (found && found.base) {
      // Проверяем: не слишком ли много детей у базы
      let childCount = 0;
      for (const h in container.children) {
        if (container.children[h].baseId === found.base.id) childCount++;
      }
      if (childCount < CHILDREN_PER_BASE_MAX) {
        const diff = computeDiff(found.base.ctx, ctx);
        const child = createChild(found.base.id, diff, loadTypes, type);
        container.children[hash] = child;
        return child;
      }
      // Слишком много — усиливаем базу вместо создания ребёнка
      found.base.hits++;
      found.base.strength = Math.min(1.0, found.base.strength + 0.02);
      return found.base;
    }
    // 4. Новая база
    const newBase = createBase(ctx, loadTypes, type);
    container.bases[newBase.id] = newBase;
    return newBase;
  }

  // ============================================================
  // ЗАТУХАНИЕ И ОЧИСТКА
  // ============================================================

  function decayPoints() {
    const today = nowDay();
    if (memory._lastDecay === today) return;
    memory._lastDecay = today;

    const decay = (pt) => {
      const daysSince = (Date.now() - pt.lastSeen) / 86400000;
      if (daysSince > 1) {
        pt.strength *= Math.pow(DECAY_PER_DAY, Math.floor(daysSince));
      }
    };

    // Локальные
    for (const blockId in memory.blocks) {
      const p = memory.blocks[blockId];
      const toRemoveBases = [];
      for (const id in p.bases) {
        decay(p.bases[id]);
        if (p.bases[id].strength < DECAY_MIN_STRENGTH) toRemoveBases.push(id);
      }
      for (const id of toRemoveBases) {
        delete p.bases[id];
        rebindOrphans(p, id);
      }
      for (const hash in p.children) {
        decay(p.children[hash]);
        if (p.children[hash].strength < DECAY_MIN_STRENGTH) delete p.children[hash];
      }
    }

    // Глобальные
    const toRemoveGlobal = [];
    for (const id in memory.globalBases) {
      decay(memory.globalBases[id]);
      if (memory.globalBases[id].strength < DECAY_MIN_STRENGTH) toRemoveGlobal.push(id);
    }
    for (const id of toRemoveGlobal) {
      delete memory.globalBases[id];
      rebindOrphansGlobal(id);
    }
    for (const hash in memory.globalChildren) {
      decay(memory.globalChildren[hash]);
      if (memory.globalChildren[hash].strength < DECAY_MIN_STRENGTH) delete memory.globalChildren[hash];
    }
  }

  function rebindOrphansGlobal(removedBaseId) {
    rebindOrphans(
      { bases: memory.globalBases, children: memory.globalChildren },
      removedBaseId
    );
  }

  function cleanupWeak(p) {
    // Слабые базы
    const toRemoveBases = [];
    for (const id in p.bases) {
      const b = p.bases[id];
      if (b.scaleDelta < 0.02 && b.strength < 0.2 && b.hits < 2) toRemoveBases.push(id);
    }
    for (const id of toRemoveBases) {
      delete p.bases[id];
      rebindOrphans(p, id);
    }
    // Слабые дети
    const toRemoveChildren = [];
    for (const hash in p.children) {
      const c = p.children[hash];
      if (c.scaleDelta < 0.02 && c.strength < 0.2 && c.hits < 2) toRemoveChildren.push(hash);
    }
    for (const h of toRemoveChildren) delete p.children[h];

    // Лимит баз
    const baseIds = Object.keys(p.bases);
    if (baseIds.length > MAX_BASES_PER_BLOCK) {
      baseIds.sort((a, b) => p.bases[a].strength - p.bases[b].strength);
      const excess = baseIds.length - MAX_BASES_PER_BLOCK;
      for (let i = 0; i < excess; i++) {
        const id = baseIds[i];
        delete p.bases[id];
        rebindOrphans(p, id);
      }
    }
    // Лимит детей
    const childHashes = Object.keys(p.children);
    if (childHashes.length > MAX_CHILDREN_PER_BLOCK) {
      childHashes.sort((a, b) => p.children[a].strength - p.children[b].strength);
      const excess = childHashes.length - MAX_CHILDREN_PER_BLOCK;
      for (let i = 0; i < excess; i++) delete p.children[childHashes[i]];
    }
  }

  function cleanupWeakGlobal() {
    const toRemoveBases = [];
    for (const id in memory.globalBases) {
      const b = memory.globalBases[id];
      if (b.scaleDelta < 0.02 && b.strength < 0.2 && b.hits < 2) toRemoveBases.push(id);
    }
    for (const id of toRemoveBases) {
      delete memory.globalBases[id];
      rebindOrphansGlobal(id);
    }
    const toRemoveChildren = [];
    for (const hash in memory.globalChildren) {
      const c = memory.globalChildren[hash];
      if (c.scaleDelta < 0.02 && c.strength < 0.2 && c.hits < 2) toRemoveChildren.push(hash);
    }
    for (const h of toRemoveChildren) delete memory.globalChildren[h];

    const baseIds = Object.keys(memory.globalBases);
    if (baseIds.length > MAX_GLOBAL_BASES) {
      baseIds.sort((a, b) => memory.globalBases[a].strength - memory.globalBases[b].strength);
      const excess = baseIds.length - MAX_GLOBAL_BASES;
      for (let i = 0; i < excess; i++) {
        const id = baseIds[i];
        delete memory.globalBases[id];
        rebindOrphansGlobal(id);
      }
    }
    const childHashes = Object.keys(memory.globalChildren);
    if (childHashes.length > MAX_GLOBAL_CHILDREN) {
      childHashes.sort((a, b) => memory.globalChildren[a].strength - memory.globalChildren[b].strength);
      const excess = childHashes.length - MAX_GLOBAL_CHILDREN;
      for (let i = 0; i < excess; i++) delete memory.globalChildren[childHashes[i]];
    }
  }

  // ============================================================
  // ЗАМЕР
  // ============================================================

  function measureFrame() {
    const t = now();
    if (lastFrameTime === 0) {
      lastFrameTime = t;
      fpsIntervalStart = t;
      return;
    }
    const dt = t - lastFrameTime;
    lastFrameTime = t;
    if (paused) return;
    if (warmupCounter > 0) { warmupCounter--; return; }

    frameTimes.push(dt);
    if (frameTimes.length > FRAME_WINDOW) frameTimes.shift();

    fpsCounter++;
    if (t - fpsIntervalStart >= 500) {
      const elapsed = t - fpsIntervalStart;
      fpsActual = Math.round((fpsCounter / elapsed) * 1000);
      fpsHistory.push({ t: Date.now(), fps: fpsActual });
      if (fpsHistory.length > FPS_HISTORY_SIZE) fpsHistory.shift();
      fpsCounter = 0;
      fpsIntervalStart = t;
    }
  }

  function avgFrameTime() {
    if (!frameTimes.length) return 16.67;
    let sum = 0;
    for (let i = 0; i < frameTimes.length; i++) sum += frameTimes[i];
    return sum / frameTimes.length;
  }

  function frameTimeJitter() {
    if (frameTimes.length < 10) return 0;
    const avg = avgFrameTime();
    let sq = 0;
    for (let i = 0; i < frameTimes.length; i++) {
      const d = frameTimes[i] - avg;
      sq += d * d;
    }
    return Math.sqrt(sq / frameTimes.length);
  }

  function predictFPS(secondsAhead) {
    if (fpsHistory.length < 5) return fpsActual;
    const n = fpsHistory.length;
    const t0 = fpsHistory[0].t;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      const x = (fpsHistory[i].t - t0) / 1000;
      const y = fpsHistory[i].fps;
      sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
    }
    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-6) return fpsActual;
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    const xAhead = (Date.now() - t0) / 1000 + secondsAhead;
    return Math.max(0, intercept + slope * xAhead);
  }

  // ============================================================
  // КЛАССИФИКАЦИЯ
  // ============================================================

  function nativeFPS() {
    const p = currentBlock ? memory.blocks[currentBlock] : null;
    if (p && p.maxFPSSeen && p.maxFPSSeen >= 90) return FPS_NATIVE_120;
    return FPS_NATIVE_60;
  }

  function classify() {
    if (!currentBlock) return 0;
    const p = ensureBlock(currentBlock);
    const opt = (p.optimalFPS == null) ? (fpsActual || nativeFPS()) : p.optimalFPS;
    if (opt <= 0) return 0;
    const ratio = fpsActual / opt;
    const jit = frameTimeJitter();
    const jitPenalty = jit > 8 ? 1 : 0;
    if (ratio >= TH_GOOD) return jitPenalty ? 1 : 0;
    if (ratio >= TH_OK)   return jitPenalty ? 2 : 1;
    if (ratio >= TH_WARN) return 2;
    return 3;
  }

  // ============================================================
  // СТРАТЕГИИ
  // ============================================================

  function strategyLocal(level) {
    if (!currentBlock) return null;
    const similar = findSimilarPoints(currentBlock, currentContext, currentLoadTypes);
    if (!similar.length) return null;
    let scaleDelta = 0, fpsDelta = 0, wsum = 0;
    const top = similar.slice(0, 3);
    for (let i = 0; i < top.length; i++) {
      const s = top[i];
      const w = s.similarity * s.strength;
      scaleDelta += s.point.scaleDelta * w;
      fpsDelta += s.point.fpsDelta * w;
      wsum += w;
    }
    if (wsum === 0) return null;
    scaleDelta /= wsum; fpsDelta /= wsum;
    if (level >= 2 || scaleDelta > 0.02) {
      return {
        fpsDir: fpsDelta > 1 ? -1 : 0,
        scaleDir: scaleDelta > 0.02 ? -1 : 0,
        weight: memory.strategies.local.weight * wsum,
        reason: 'local'
      };
    }
    return null;
  }

  function strategyGlobal(level) {
    const similar = findSimilarGlobalPoints(currentContext, currentLoadTypes);
    if (!similar.length) return null;
    let scaleDelta = 0, fpsDelta = 0, wsum = 0;
    const top = similar.slice(0, 3);
    for (let i = 0; i < top.length; i++) {
      const s = top[i];
      const w = s.similarity * s.strength;
      scaleDelta += s.point.scaleDelta * w;
      fpsDelta += s.point.fpsDelta * w;
      wsum += w;
    }
    if (wsum === 0) return null;
    scaleDelta /= wsum; fpsDelta /= wsum;
    if (level >= 2 || scaleDelta > 0.02) {
      return {
        fpsDir: fpsDelta > 1 ? -1 : 0,
        scaleDir: scaleDelta > 0.02 ? -1 : 0,
        weight: memory.strategies.global.weight * wsum,
        reason: 'global'
      };
    }
    return null;
  }

  function strategyLoadTypes(level) {
    if (!currentLoadTypes.length) return null;
    let scaleDelta = 0, fpsDelta = 0, wsum = 0;
    for (let i = 0; i < currentLoadTypes.length; i++) {
      const type = currentLoadTypes[i];
      const lt = memory.loadTypes[type];
      if (!lt) continue;
      const w = lt.samples > 10 ? 1 : lt.samples / 10;
      scaleDelta += (SCALE_MAX - (lt.optimalScale || SCALE_MAX)) * w;
      fpsDelta += (FPS_NATIVE_60 - (lt.optimalFPS || FPS_NATIVE_60)) * w;
      wsum += w;
    }
    if (wsum === 0) return null;
    scaleDelta /= wsum; fpsDelta /= wsum;
    if (level >= 2 || scaleDelta > 0.02) {
      return {
        fpsDir: fpsDelta > 1 ? -1 : 0,
        scaleDir: scaleDelta > 0.02 ? -1 : 0,
        weight: memory.strategies.loadTypes.weight * wsum,
        reason: 'loadTypes'
      };
    }
    return null;
  }

  function strategyExperiment(level) {
    if (level > 0) return null;
    if (now() - lastGoodChange < HYST_GOOD) return null;
    if (scaleActual >= SCALE_MAX && fpsTarget === null) return null;
    return {
      fpsDir: +1, scaleDir: +1,
      weight: memory.strategies.experiment.weight * 0.5,
      reason: 'experiment'
    };
  }

  function strategyEmergency(level) {
    if (level < 3) return null;
    const predicted = predictFPS(1.0);
    const urgent = predicted < fpsActual * 0.85;
    return {
      fpsDir: -1, scaleDir: -1,
      weight: memory.strategies.emergency.weight * (urgent ? 1.5 : 1.0),
      reason: 'emergency'
    };
  }

  function decide() {
    const level = classify();
    const proposals = [
      strategyLocal(level),
      strategyGlobal(level),
      strategyLoadTypes(level),
      strategyExperiment(level),
      strategyEmergency(level)
    ];
    let fpsScore = 0, scaleScore = 0, totalWeight = 0;
    const usedStrategies = [];
    for (let i = 0; i < proposals.length; i++) {
      const p = proposals[i];
      if (!p) continue;
      fpsScore += p.fpsDir * p.weight;
      scaleScore += p.scaleDir * p.weight;
      totalWeight += p.weight;
      usedStrategies.push(p.reason);
    }
    if (totalWeight === 0) {
      return { fpsDir: 0, scaleDir: 0, level, strategies: [] };
    }
    return {
      fpsDir: Math.sign(fpsScore),
      scaleDir: Math.sign(scaleScore),
      level,
      strategies: usedStrategies
    };
  }

  // ============================================================
  // ДЕЙСТВИЕ
  // ============================================================

  function stepFps(direction, multiplier) {
    if (direction === 0) return false;
    const native = nativeFPS();
    if (fpsTarget === null) fpsTarget = native;
    const before = fpsTarget;
    const step = FPS_STEP * (multiplier || STEP_NORMAL);
    fpsTarget = clamp(Math.round(fpsTarget + direction * step), FPS_MIN, native);
    if (fpsTarget >= native) fpsTarget = null;
    return before !== fpsTarget;
  }

  function stepScale(direction, multiplier) {
    if (direction === 0) return false;
    const before = scaleTarget;
    const step = SCALE_STEP * (multiplier || STEP_NORMAL);
    scaleTarget = clamp(scaleTarget + direction * step, SCALE_MIN, SCALE_MAX);
    return before !== scaleTarget;
  }

  function lerpScale() {
    const dist = scaleTarget - scaleActual;
    if (Math.abs(dist) < 0.001) {
      scaleActual = scaleTarget;
      return;
    }
    const speed = clamp(Math.abs(dist) * 0.5, 0.005, 0.05);
    scaleActual += Math.sign(dist) * speed;
    if ((dist > 0 && scaleActual > scaleTarget) || (dist < 0 && scaleActual < scaleTarget)) {
      scaleActual = scaleTarget;
    }
  }

  // ============================================================
  // РЕФЛЕКСИЯ
  // ============================================================

  function scheduleReflection(action) {
    pendingAction = {
      type: action.type,
      before: { fpsActual, scaleActual, level: classify() },
      at: now(),
      strategy: action.strategy || 'unknown',
      blockId: currentBlock,
      hash: contextHash,
      ctx: Object.assign({}, currentContext),
      loadTypes: currentLoadTypes.slice()
    };
  }

  function checkReflection() {
    if (!pendingAction) return;
    if (now() - pendingAction.at < HYST_REFLECT) return;

    const before = pendingAction.before;
    const after = { fpsActual, scaleActual, level: classify() };

    const fpsImproved = after.fpsActual > before.fpsActual + 2;
    const fpsWorse = after.fpsActual < before.fpsActual - 2;
    const levelImproved = after.level < before.level;
    const levelWorse = after.level > before.level;

    let result = 'neutral';
    if (levelImproved || (fpsImproved && !levelWorse)) result = 'success';
    else if (levelWorse || (fpsWorse && !levelImproved)) result = 'failure';

    if (pendingAction.strategy && memory.strategies[pendingAction.strategy]) {
      const s = memory.strategies[pendingAction.strategy];
      if (result === 'success') {
        s.successes++;
        s.weight = clamp(s.weight * 1.1, 0.05, 2.0);
      } else if (result === 'failure') {
        s.failures++;
        s.weight = clamp(s.weight * 0.9, 0.05, 2.0);
      }
    }

    if (result === 'failure' && pendingAction.type === 'up') {
      stepScale(-1, STEP_FAST);
      if (fpsTarget !== null) stepFps(-1, STEP_FAST);
    }

    memory.history.push({
      t: Date.now(),
      blockId: pendingAction.blockId,
      hash: pendingAction.hash,
      strategy: pendingAction.strategy,
      type: pendingAction.type,
      before, after, result
    });
    if (memory.history.length > MAX_HISTORY) memory.history.shift();

    memory.stats.totalActions++;
    if (result === 'success') memory.stats.totalSuccesses++;
    else if (result === 'failure') memory.stats.totalFailures++;

    pendingAction = null;
  }

  // ============================================================
  // ОБНОВЛЕНИЕ ПАМЯТИ
  // ============================================================

  function updateBlockStats() {
    if (!currentBlock) return;
    const p = ensureBlock(currentBlock);
    p.samples++;
    const a = 0.05;
    p.avgFPS = p.avgFPS ? (p.avgFPS * (1 - a) + fpsActual * a) : fpsActual;
    p.avgScale = p.avgScale ? (p.avgScale * (1 - a) + scaleActual * a) : scaleActual;
    if (p.minFPSSeen === null || fpsActual < p.minFPSSeen) p.minFPSSeen = fpsActual;
    if (p.maxFPSSeen === null || fpsActual > p.maxFPSSeen) p.maxFPSSeen = fpsActual;

    if (p.samples > 50 && fpsActual > (p.optimalFPS || 0)) {
      p.optimalFPS = Math.max(p.optimalFPS || 0, fpsActual);
      if (p.optimalFPS >= nativeFPS()) p.optimalFPS = null;
    }
    if (p.samples > 30) {
      p.optimalScale = p.avgScale;
    }
    p.lastUpdate = now();
  }

  function updateLoadTypes() {
    if (!currentLoadTypes.length) return;
    for (let i = 0; i < currentLoadTypes.length; i++) {
      const type = currentLoadTypes[i];
      if (!memory.loadTypes[type]) {
        if (Object.keys(memory.loadTypes).length >= MAX_LOAD_TYPES) {
          // Удаляем самый слабый
          let weakest = null, minS = Infinity;
          for (const k in memory.loadTypes) {
            if (memory.loadTypes[k].samples < minS) { minS = memory.loadTypes[k].samples; weakest = k; }
          }
          if (weakest) delete memory.loadTypes[weakest];
        }
        memory.loadTypes[type] = { samples: 0, optimalScale: SCALE_MAX, optimalFPS: FPS_NATIVE_60 };
      }
      const lt = memory.loadTypes[type];
      lt.samples++;
      const a = 0.05;
      lt.optimalScale = lt.optimalScale * (1 - a) + scaleActual * a;
      const native = nativeFPS();
      const currentTarget = fpsTarget === null ? native : fpsTarget;
      lt.optimalFPS = lt.optimalFPS * (1 - a) + currentTarget * a;
    }
  }

  function updatePoint() {
    if (!currentBlock || !contextHash) return;
    const p = ensureBlock(currentBlock);
    const level = classify();

    const pt = upsertPoint(p, currentContext, currentLoadTypes, 'min');
    const gpt = upsertPoint(
      { bases: memory.globalBases, children: memory.globalChildren },
      currentContext, currentLoadTypes, 'min'
    );

    const applyLevel = (point) => {
      if (!point) return;
      point.lastSeen = Date.now();
      if (level >= 2) {
        point.type = 'min';
        point.hits++;
        const scaleDelta = Math.max(0, SCALE_MAX - scaleActual);
        const native = nativeFPS();
        const fpsDelta = Math.max(0, native - (fpsTarget === null ? native : fpsTarget));
        if (scaleDelta > point.scaleDelta) point.scaleDelta = scaleDelta;
        if (fpsDelta > point.fpsDelta) point.fpsDelta = fpsDelta;
        point.strength = Math.min(1.0, point.strength + 0.05);
      } else if (level === 0 && point.type === 'min') {
        point.misses++;
        if (point.misses >= 3) {
          point.scaleDelta *= 0.5;
          point.fpsDelta = Math.round(point.fpsDelta * 0.5);
          point.strength *= 0.8;
          point.misses = 0;
        }
      }
    };
    applyLevel(pt);
    applyLevel(gpt);

    // Чистим слабые не на каждом тике — раз в 5 сек
    if (now() - (updatePoint._lastClean || 0) > 5000) {
      cleanupWeak(p);
      cleanupWeakGlobal();
      updatePoint._lastClean = now();
    }
  }

  // ============================================================
  // ГЛАВНЫЙ ТИК
  // ============================================================

  function tick() {
    if (paused) return;

    lerpScale();
    checkReflection();
    decayPoints();

    const decision = decide();

    if (decision.level >= 3 && now() - lastBadChange >= HYST_BAD / 2) {
      const changed = (stepFps(decision.fpsDir, STEP_FAST) | stepScale(decision.scaleDir, STEP_FAST));
      if (changed) {
        lastBadChange = now();
        scheduleReflection({ type: 'down', strategy: decision.strategies[0] });
      }
    } else if (decision.level === 2 && now() - lastBadChange >= HYST_BAD) {
      const changed = (stepFps(decision.fpsDir, STEP_NORMAL) | stepScale(decision.scaleDir, STEP_NORMAL));
      if (changed) {
        lastBadChange = now();
        scheduleReflection({ type: 'down', strategy: decision.strategies[0] });
      }
    } else if (decision.level <= 1 && now() - lastGoodChange >= HYST_GOOD) {
      const changed = (stepFps(decision.fpsDir, STEP_SLOW) | stepScale(decision.scaleDir, STEP_SLOW));
      if (changed) {
        lastGoodChange = now();
        scheduleReflection({ type: 'up', strategy: decision.strategies[0] });
      }
    }

    updateBlockStats();
    updateLoadTypes();
    updatePoint();

    notifySubscribers();

    // HUD — не чаще 4 раз в секунду
    if (now() - lastHudRender > 250) {
      renderHUD();
      lastHudRender = now();
    }

    // Сохранение — не чаще раза в 5 сек
    if (now() - lastSaveTime > 5000) {
      saveMemory();
      lastSaveTime = now();
    }
  }

  // ============================================================
  // API БЛОКОВ
  // ============================================================

  function setBlock(blockId) {
    if (!blockId || blockId === currentBlock) return;
    currentBlock = blockId;
    currentContext = {};
    currentLoadTypes = [];
    contextHash = '';

    const p = ensureBlock(blockId);
    scaleTarget = (p.optimalScale && p.optimalScale < SCALE_MAX) ? p.optimalScale : SCALE_MAX;
    fpsTarget = (p.optimalFPS == null) ? null : p.optimalFPS;

    frameTimes = [];
    fpsHistory = [];
    warmupCounter = WARMUP_FRAMES;
    lastFrameTime = 0;
    fpsIntervalStart = 0;
    fpsCounter = 0;
    lastBadChange = 0;
    lastGoodChange = 0;

    notifySubscribers();
  }

  function setContext(ctx) {
    if (!ctx || typeof ctx !== 'object') return;
    currentContext = Object.assign({}, ctx);
    contextHash = hashContext(currentContext);
    applyPredictive();
    notifySubscribers();
  }

  function setLoadTypes(types) {
    if (!Array.isArray(types)) return;
    currentLoadTypes = types.slice();
    notifySubscribers();
  }

  function clearContext() {
    currentContext = {};
    currentLoadTypes = [];
    contextHash = '';
  }

  function applyPredictive() {
    if (!currentBlock || !contextHash) return;
    const similar = [
      ...findSimilarPoints(currentBlock, currentContext, currentLoadTypes),
      ...findSimilarGlobalPoints(currentContext, currentLoadTypes)
    ].sort((a, b) => b.similarity - a.similarity);

    if (!similar.length) return;
    const top = similar[0];
    if (top.similarity < 0.75) return;
    if (top.point.hits < 2) return;

    const pt = top.point;
    const scaleReduction = pt.scaleDelta * top.similarity;
    if (scaleReduction > 0.02) {
      scaleTarget = clamp(Math.min(scaleTarget, scaleActual - scaleReduction), SCALE_MIN, SCALE_MAX);
    }
    const fpsReduction = pt.fpsDelta * top.similarity;
    if (fpsReduction > 1) {
      const native = nativeFPS();
      const currentT = fpsTarget === null ? native : fpsTarget;
      fpsTarget = clamp(currentT - fpsReduction, FPS_MIN, native);
    }
  }

  function markMin(ctx) {
    if (!currentBlock) return;
    const useCtx = ctx || currentContext;
    if (!hashContext(useCtx)) return;
    const p = ensureBlock(currentBlock);
    const pt = upsertPoint(p, useCtx, currentLoadTypes, 'min');
    if (pt) { pt.type = 'min'; pt.hits++; pt.strength = Math.min(1.0, pt.strength + 0.1); }
    const gpt = upsertPoint(
      { bases: memory.globalBases, children: memory.globalChildren },
      useCtx, currentLoadTypes, 'min'
    );
    if (gpt) { gpt.type = 'min'; gpt.hits++; gpt.strength = Math.min(1.0, gpt.strength + 0.1); }
  }

  function markMax(ctx) {
    if (!currentBlock) return;
    const useCtx = ctx || currentContext;
    if (!hashContext(useCtx)) return;
    const p = ensureBlock(currentBlock);
    const pt = upsertPoint(p, useCtx, currentLoadTypes, 'max');
    if (pt) { pt.type = 'max'; pt.hits++; pt.strength = Math.min(1.0, pt.strength + 0.1); }
    const gpt = upsertPoint(
      { bases: memory.globalBases, children: memory.globalChildren },
      useCtx, currentLoadTypes, 'max'
    );
    if (gpt) { gpt.type = 'max'; gpt.hits++; gpt.strength = Math.min(1.0, gpt.strength + 0.1); }
  }

  // ============================================================
  // ПОДПИСЧИКИ
  // ============================================================

  function notifySubscribers() {
    const payload = {
      fpsTarget, fpsActual,
      renderScale: scaleActual,
      renderScaleTarget: scaleTarget,
      block: currentBlock
    };
    for (let i = 0; i < subscribers.length; i++) {
      try { subscribers[i](payload); } catch (e) {}
    }
  }

  function subscribe(cb) {
    if (typeof cb !== 'function') return () => {};
    subscribers.push(cb);
    cb({ fpsTarget, fpsActual, renderScale: scaleActual, renderScaleTarget: scaleTarget, block: currentBlock });
    return () => {
      const i = subscribers.indexOf(cb);
      if (i >= 0) subscribers.splice(i, 1);
    };
  }

  // ============================================================
  // HUD
  // ============================================================

  function injectStyles() {
    if (document.getElementById('orbits-troll-styles')) return;
    const css = `
      #${HUD_ID} {
        position: fixed;
        top: 6px; left: 8px;
        z-index: 2147482000;
        display: none;
        align-items: center; gap: 9px;
        padding: 4px 9px;
        background: rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 9px;
        backdrop-filter: blur(9px) saturate(150%);
        -webkit-backdrop-filter: blur(9px) saturate(150%);
        color: #fff;
        font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.4px;
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.7);
      }
      #${HUD_ID}.visible { display: inline-flex; }
      #${HUD_ID} .tr-item { display: inline-flex; align-items: center; gap: 3px; }
      #${HUD_ID} .tr-icon { opacity: 0.45; color: #fff; vertical-align: middle; flex: 0 0 auto; }
      #${HUD_ID} .tr-val { opacity: 1; color: #fff; }
    `;
    const s = document.createElement('style');
    s.id = 'orbits-troll-styles';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function createHUD() {
    if (document.getElementById(HUD_ID)) return;
    const hud = document.createElement('div');
    hud.id = HUD_ID;
    document.body.appendChild(hud);
  }

  function svgBattery(level, charging) {
    if (level === null) {
      return `<svg class="tr-icon" viewBox="0 0 22 12" width="22" height="12">
        <rect x="0.5" y="0.5" width="19" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.1"/>
        <rect x="20.5" y="4" width="1.2" height="4" rx="0.6" fill="currentColor"/>
        <text x="10" y="9" font-size="7" text-anchor="middle" fill="currentColor">--</text>
      </svg>`;
    }
    const w = Math.max(1, (level / 100) * 17);
    const color = level < 20 ? '#ef4444' : level < 50 ? '#fbbf24' : '#4ade80';
    const bolt = charging
      ? `<path d="M 10.6 2.4 L 9.1 6.2 L 11.1 6.2 L 9.6 9.8 L 12.2 5.7 L 10.2 5.7 L 11.7 2.4 Z"
               fill="#fff" opacity="0.95"/>`
      : '';
    return `
      <svg class="tr-icon" viewBox="0 0 22 12" width="22" height="12">
        <rect x="0.5" y="0.5" width="19" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.1"/>
        <rect x="1.5" y="1.5" width="${w}" height="9" rx="1.2" fill="${color}"/>
        <rect x="20.5" y="4" width="1.2" height="4" rx="0.6" fill="currentColor"/>
        ${bolt}
      </svg>`;
  }

  function svgFpsIcon() {
    return `<svg class="tr-icon" viewBox="0 0 12 12" width="11" height="11">
      <path d="M 6 1.5 A 4.5 4.5 0 1 1 1.5 6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M 6 6 L 8.6 3.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="6" cy="6" r="0.9" fill="currentColor"/>
    </svg>`;
  }

  function svgResIcon() {
    return `<svg class="tr-icon" viewBox="0 0 12 12" width="11" height="11">
      <rect x="1" y="2" width="10" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.1"/>
      <rect x="4" y="10" width="4" height="1" rx="0.5" fill="currentColor"/>
      <path d="M 3 5 L 5 5 M 3 7 L 7 7" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" opacity="0.7"/>
    </svg>`;
  }

  function renderHUD() {
    const hud = document.getElementById(HUD_ID);
    if (!hud) return;
    if (!isPWA()) { hud.classList.remove('visible'); return; }
    if (hud.dataset.userHidden === '1') { hud.classList.remove('visible'); return; }

    const battPct = (batteryLevel !== null) ? batteryLevel + '%' : '--';
    const fpsStr = fpsTarget === null ? String(fpsActual || 0) : String(fpsTarget);
    const scaleStr = scaleActual.toFixed(2) + 'x';

    hud.innerHTML = `
      <span class="tr-item">${svgBattery(batteryLevel, batteryCharging)}<span class="tr-val">${battPct}</span></span>
      <span class="tr-item">${svgFpsIcon()}<span class="tr-val">${fpsStr}</span></span>
      <span class="tr-item">${svgResIcon()}<span class="tr-val">${scaleStr}</span></span>
    `;
    hud.classList.add('visible');
  }

  // ============================================================
  // БАТАРЕЯ
  // ============================================================

  async function initBattery() {
    if (!navigator.getBattery) return;
    try {
      const battery = await navigator.getBattery();
      const update = () => {
        batteryLevel = Math.round(battery.level * 100);
        batteryCharging = !!battery.charging;
        renderHUD();
      };
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
    } catch (e) {}
  }

  // ============================================================
  // ЦИКЛЫ
  // ============================================================

  function frameLoop() {
    rAFId = requestAnimationFrame(frameLoop);
    measureFrame();
  }

  function startTick() {
    if (tickTimer) return;
    tickTimer = setInterval(tick, TICK_MS);
  }

  function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  }

  // ============================================================
  // VISIBILITY
  // ============================================================

  function onVisibility() {
    if (document.hidden) {
      paused = true;
      frameTimes = [];
      fpsHistory = [];
      saveMemory(); // сохранить перед уходом
    } else {
      paused = false;
      warmupCounter = WARMUP_FRAMES;
      lastFrameTime = 0;
      fpsIntervalStart = 0;
      fpsCounter = 0;
      frameTimes = [];
      fpsHistory = [];
    }
  }

  // ============================================================
  // СБРОС
  // ============================================================

  function resetAll() {
    memory = createEmptyMemory();
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    if (currentBlock) ensureBlock(currentBlock);
    scaleTarget = SCALE_MAX;
    scaleActual = SCALE_MAX;
    fpsTarget = null;
    frameTimes = [];
    fpsHistory = [];
    pendingAction = null;
    ctxCache = new WeakMap();
    notifySubscribers();
  }

  // ============================================================
  // СТАРТ
  // ============================================================

  function start() {
    injectStyles();
    createHUD();
    memory = loadMemory();
    memory.stats.sessionsCount++;
    memory.stats.lastSeen = Date.now();
    initBattery();

    document.addEventListener('visibilitychange', onVisibility);

    // При закрытии страницы — сохранить
    window.addEventListener('pagehide', saveMemory);
    window.addEventListener('beforeunload', saveMemory);

    rAFId = requestAnimationFrame(frameLoop);
    startTick();
    renderHUD();
  }

  // ============================================================
  // ПУБЛИЧНЫЙ API
  // ============================================================

  window.Troll = {
    setBlock,
    setContext,
    setLoadTypes,
    clearContext,
    markMin,
    markMax,
    subscribe,
    getProfile: (id) => ensureBlock(id),
    getAllProfiles: () => JSON.parse(JSON.stringify(memory.blocks)),
    getGlobalPoints: () => ({
      bases: JSON.parse(JSON.stringify(memory.globalBases)),
      children: JSON.parse(JSON.stringify(memory.globalChildren))
    }),
    getLoadTypes: () => JSON.parse(JSON.stringify(memory.loadTypes)),
    getStrategies: () => JSON.parse(JSON.stringify(memory.strategies)),
    getHistory: () => memory.history.slice(-30),
    getStats: () => JSON.parse(JSON.stringify(memory.stats)),
    getMemorySize: () => {
      try { return JSON.stringify(memory).length; } catch (e) { return -1; }
    },
    getFPSActual: () => fpsActual,
    getFPSTarget: () => fpsTarget,
    getRenderScale: () => scaleActual,
    getRenderScaleTarget: () => scaleTarget,
    predictFPS,
    show: () => { const h = document.getElementById(HUD_ID); if (h) { h.dataset.userHidden = '0'; renderHUD(); } },
    hide: () => { const h = document.getElementById(HUD_ID); if (h) { h.dataset.userHidden = '1'; renderHUD(); } },
    setVisible: (v) => v ? window.Troll.show() : window.Troll.hide(),
    resetAll,
    save: saveMemory
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();