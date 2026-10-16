/* =====================================================================
   ORBITS.IO — HEAD TRACKING
   Путь: head-tracking.js

   MediaPipe Face Landmarker для слежения за головой.
   Камера работает в фоне. Окно калибровки показывается только при калибровке.

   API:
     HeadTracking.init()
     HeadTracking.isAvailable()
     HeadTracking.isCalibrated()
     HeadTracking.getCalibration()
     HeadTracking.resetCalibration()
     HeadTracking.requestCamera()
     HeadTracking.startCalibration(onStep)
     HeadTracking.cancelCalibration()
     HeadTracking.startTracking()
     HeadTracking.stopTracking()
     HeadTracking.onUpdate(cb)
     HeadTracking.destroy()
   ===================================================================== */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'orbits_head_tracking';
  const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';

  const SMOOTHING = 0.80;
  const DEAD_ZONE_DEG = 3;
  const FADE_OUT_MS = 250;
  const FADE_IN_MS = 500;

  const CALIBRATION_STEPS = [
    { id: 'center', label: 'Смотрите прямо в камеру', icon: '⬤', duration: 2500 },
    { id: 'left',   label: 'Поверните голову ВЛЕВО',  icon: '⬅', duration: 2500 },
    { id: 'right',  label: 'Поверните голову ВПРАВО', icon: '➡', duration: 2500 },
    { id: 'up',     label: 'Поверните голову ВВЕРХ',  icon: '⬆', duration: 2500 },
    { id: 'down',   label: 'Поверните голову ВНИЗ',   icon: '⬇', duration: 2500 }
  ];

  let initialized = false;
  let cameraGranted = false;
  let cameraStream = null;
  let videoEl = null;
  let landmarker = null;
  let loadingPromise = null;

  let tracking = false;
  let trackingRAF = 0;
  let lastVideoTime = -1;

  let currentAngles = { yaw: 0, pitch: 0, roll: 0 };
  let smoothedAngles = { yaw: 0, pitch: 0, roll: 0 };
  let targetAngles = { yaw: 0, pitch: 0, roll: 0 };
  let lastFaceSeen = 0;
  let wasTracked = false;
  let fadeActive = false;

  let calibration = null;
  let calibrationActive = false;
  let calibrationStepIndex = 0;
  let calibrationSamples = [];
  let calibrationOnStep = null;
  let calibrationCanceled = false;

  const listeners = [];

  // ============ ЗАГРУЗКА MEDIAPIPE ============
  async function loadMediaPipe() {
    if (landmarker) return landmarker;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
      try {
        const vision = await import(MEDIAPIPE_CDN + '/vision_bundle.mjs');
        const { FaceLandmarker, FilesetResolver } = vision;

        const fileset = await FilesetResolver.forVisionTasks(
          MEDIAPIPE_CDN + '/wasm'
        );

        landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true
        });

        console.log('[HeadTracking] MediaPipe загружен');
        return landmarker;
      } catch (e) {
        console.error('[HeadTracking] MediaPipe не загрузился:', e.message);
        loadingPromise = null;
        throw e;
      }
    })();

    return loadingPromise;
  }

  // ============ КАМЕРА ============
  async function requestCamera() {
    if (cameraGranted) return true;
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false
      });
      cameraGranted = true;
      console.log('[HeadTracking] камера разрешена');
      return true;
    } catch (e) {
      console.warn('[HeadTracking] камера недоступна:', e.message);
      cameraGranted = false;
      return false;
    }
  }

  function createHiddenVideo() {
    if (videoEl) return videoEl;
    videoEl = document.createElement('video');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('muted', '');
    videoEl.muted = true;
    videoEl.style.position = 'fixed';
    videoEl.style.left = '-9999px';
    videoEl.style.top = '-9999px';
    videoEl.style.width = '1px';
    videoEl.style.height = '1px';
    videoEl.style.opacity = '0';
    videoEl.style.pointerEvents = 'none';
    document.body.appendChild(videoEl);
    return videoEl;
  }

  async function startVideoStream() {
    if (!cameraStream) return false;
    const v = createHiddenVideo();
    if (v.srcObject !== cameraStream) {
      v.srcObject = cameraStream;
    }
    try { await v.play(); } catch (e) {}
    return true;
  }

  // ============ ИЗВЛЕЧЕНИЕ УГЛОВ ============
  function extractAngles(faceMatrix) {
    if (!faceMatrix || !faceMatrix.data) return null;
    const m = faceMatrix.data;
    const yaw = Math.atan2(m[8], m[10]) * 180 / Math.PI;
    const pitch = Math.asin(-Math.max(-1, Math.min(1, m[9]))) * 180 / Math.PI;
    const roll = Math.atan2(m[1], m[5]) * 180 / Math.PI;
    return { yaw, pitch, roll };
  }

  function smoothAngle(prev, next) {
    return prev * SMOOTHING + next * (1 - SMOOTHING);
  }

  function applyDeadZone(prev, next) {
    const diff = next - prev;
    if (Math.abs(diff) < DEAD_ZONE_DEG) return prev;
    return next;
  }

  // ============ ЦИКЛ СЛЕЖЕНИЯ ============
  function trackingLoop() {
    trackingRAF = requestAnimationFrame(trackingLoop);
    if (!tracking || !videoEl || !landmarker) return;
    if (videoEl.readyState < 2) return;
    if (videoEl.currentTime === lastVideoTime) return;
    lastVideoTime = videoEl.currentTime;

    try {
      const results = landmarker.detectForVideo(videoEl, performance.now());
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const matrix = results.facialTransformationMatrixes && results.facialTransformationMatrixes[0];
        if (matrix) {
          const angles = extractAngles(matrix);
          if (angles) {
            currentAngles = angles;
            lastFaceSeen = performance.now();

            targetAngles.yaw = applyDeadZone(targetAngles.yaw, angles.yaw);
            targetAngles.pitch = applyDeadZone(targetAngles.pitch, angles.pitch);
            targetAngles.roll = applyDeadZone(targetAngles.roll, angles.roll);

            smoothedAngles.yaw = smoothAngle(smoothedAngles.yaw, targetAngles.yaw);
            smoothedAngles.pitch = smoothAngle(smoothedAngles.pitch, targetAngles.pitch);
            smoothedAngles.roll = smoothAngle(smoothedAngles.roll, targetAngles.roll);

            wasTracked = true;
            fadeActive = false;
            notify();
          }
        }
      } else {
        // Лицо потеряно — замираем (не двигаем углы)
        if (wasTracked && !fadeActive) {
          fadeActive = true;
          wasTracked = false;
          const fadeStart = performance.now();
          const fadeTick = () => {
            const elapsed = performance.now() - fadeStart;
            if (elapsed >= FADE_OUT_MS) {
              fadeActive = false;
              return;
            }
            requestAnimationFrame(fadeTick);
          };
          fadeTick();
        }
        notify();
      }
    } catch (e) {}
  }

  function notify() {
    const payload = {
      yaw: smoothedAngles.yaw,
      pitch: smoothedAngles.pitch,
      roll: smoothedAngles.roll,
      isTracked: wasTracked && !fadeActive
    };
    for (let i = 0; i < listeners.length; i++) {
      try { listeners[i](payload); } catch (e) {}
    }
  }

  // ============ КАЛИБРОВКА ============
  function loadCalibration() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.done) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function saveCalibration(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  async function startCalibration(onStep) {
    if (!cameraGranted) {
      const ok = await requestCamera();
      if (!ok) return false;
    }
    try { await loadMediaPipe(); } catch (e) { return false; }
    await startVideoStream();

    calibrationActive = true;
    calibrationCanceled = false;
    calibrationStepIndex = 0;
    calibrationSamples = [];
    calibrationOnStep = onStep || null;

    return runNextCalibrationStep();
  }

  function cancelCalibration() {
    calibrationCanceled = true;
    calibrationActive = false;
    calibrationSamples = [];
  }

  async function runNextCalibrationStep() {
    if (calibrationCanceled) return false;
    if (calibrationStepIndex >= CALIBRATION_STEPS.length) {
      finishCalibration();
      return true;
    }

    const step = CALIBRATION_STEPS[calibrationStepIndex];
    const samples = [];
    const startTime = performance.now();
    const stepDuration = step.duration;

    if (calibrationOnStep) {
      try { calibrationOnStep(step.id, calibrationStepIndex, CALIBRATION_STEPS.length); } catch (e) {}
    }

    const collect = () => {
      if (calibrationCanceled) return;
      const elapsed = performance.now() - startTime;
      if (elapsed < stepDuration) {
        if (videoEl && videoEl.readyState >= 2 && landmarker) {
          try {
            if (videoEl.currentTime !== lastVideoTime) {
              lastVideoTime = videoEl.currentTime;
              const results = landmarker.detectForVideo(videoEl, performance.now());
              if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const matrix = results.facialTransformationMatrixes && results.facialTransformationMatrixes[0];
                if (matrix) {
                  const angles = extractAngles(matrix);
                  if (angles) samples.push(angles);
                }
              }
            }
          } catch (e) {}
        }
        requestAnimationFrame(collect);
      } else {
        const avg = averageSamples(samples);
        calibrationSamples.push({ step: step.id, avg });
        calibrationStepIndex++;
        if (!calibrationCanceled) {
          runNextCalibrationStep();
        }
      }
    };
    collect();
    return true;
  }

  function averageSamples(samples) {
    if (!samples.length) return { yaw: 0, pitch: 0, roll: 0 };
    let yaw = 0, pitch = 0, roll = 0;
    for (let i = 0; i < samples.length; i++) {
      yaw += samples[i].yaw;
      pitch += samples[i].pitch;
      roll += samples[i].roll;
    }
    return {
      yaw: yaw / samples.length,
      pitch: pitch / samples.length,
      roll: roll / samples.length
    };
  }

  function finishCalibration() {
    calibrationActive = false;
    const data = {
      done: true,
      timestamp: Date.now(),
      samples: calibrationSamples,
      center: calibrationSamples[0] ? calibrationSamples[0].avg : { yaw: 0, pitch: 0, roll: 0 },
      minYaw: Math.min.apply(null, calibrationSamples.map(s => s.avg.yaw)),
      maxYaw: Math.max.apply(null, calibrationSamples.map(s => s.avg.yaw)),
      minPitch: Math.min.apply(null, calibrationSamples.map(s => s.avg.pitch)),
      maxPitch: Math.max.apply(null, calibrationSamples.map(s => s.avg.pitch)),
      minRoll: Math.min.apply(null, calibrationSamples.map(s => s.avg.roll)),
      maxRoll: Math.max.apply(null, calibrationSamples.map(s => s.avg.roll))
    };
    calibration = data;
    saveCalibration(data);
    console.log('[HeadTracking] калибровка завершена:', data);
  }

  // ============ ПУБЛИЧНЫЙ API ============
  const HeadTracking = {
    async init() {
      if (initialized) return true;
      initialized = true;
      calibration = loadCalibration();
      return true;
    },

    isAvailable() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
      return true;
    },

    isCalibrated() {
      return !!(calibration && calibration.done);
    },

    getCalibration() {
      return calibration ? JSON.parse(JSON.stringify(calibration)) : null;
    },

    resetCalibration() {
      calibration = null;
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    },

    async requestCamera() {
      return await requestCamera();
    },

    async startCalibration(onStep) {
      return await startCalibration(onStep);
    },

    cancelCalibration() {
      cancelCalibration();
    },

    async startTracking() {
      if (tracking) return true;
      if (!cameraGranted) {
        const ok = await requestCamera();
        if (!ok) return false;
      }
      try { await loadMediaPipe(); } catch (e) { return false; }
      await startVideoStream();
      tracking = true;
      lastVideoTime = -1;
      trackingLoop();
      console.log('[HeadTracking] слежение запущено');
      return true;
    },

    stopTracking() {
      tracking = false;
      if (trackingRAF) { cancelAnimationFrame(trackingRAF); trackingRAF = 0; }
    },

    onUpdate(cb) {
      if (typeof cb !== 'function') return function () {};
      listeners.push(cb);
      return function () {
        const i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      };
    },

    destroy() {
      HeadTracking.stopTracking();
      if (cameraStream) {
        cameraStream.getTracks().forEach(function (t) { t.stop(); });
        cameraStream = null;
      }
      cameraGranted = false;
      if (videoEl && videoEl.parentNode) videoEl.parentNode.removeChild(videoEl);
      videoEl = null;
      landmarker = null;
      loadingPromise = null;
    }
  };

  global.HeadTracking = HeadTracking;
})(window);