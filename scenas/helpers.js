export const GAME_WIDTH = 1000;
export const GAME_HEIGHT = 500;
export const PUZZLE_KEYS = ["Puzzle1", "Puzzle2", "Puzzle3", "Puzzle4"];

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const drawRoundedPanel = (scene) => {
  const panel = scene.add.graphics();
  panel.fillGradientStyle(0x152b3f, 0x152b3f, 0x0b1828, 0x0b1828, 0.98);
  panel.lineStyle(6, 0x3f6287, 0.95);
  panel.fillRoundedRect(40, 30, 920, 430, 30);
  panel.strokeRoundedRect(40, 30, 920, 430, 30);
  panel.lineStyle(2, 0x8db6d8, 0.45);
  panel.strokeRoundedRect(56, 46, 888, 398, 20);
  const screws = [
    { x: 66, y: 56 },
    { x: 934, y: 56 },
    { x: 66, y: 434 },
    { x: 934, y: 434 },
  ];
  screws.forEach((screw) => {
    const cap = scene.add.circle(screw.x, screw.y, 7, 0x9fb8cf, 0.9);
    cap.setStrokeStyle(2, 0x607d99, 1);
    scene.add.rectangle(screw.x, screw.y, 8, 1.5, 0x4b6178, 0.95);
  });
};

export const drawCircuitFill = (scene, x, y, width, height) => {
  const top = y - height / 2;
  const left = x - width / 2;
  const traces = scene.add.graphics();
  traces.lineStyle(4, 0x5fd6b5, 0.28);
  traces.beginPath();
  traces.moveTo(left + 28, top + 34);
  traces.lineTo(left + 210, top + 34);
  traces.lineTo(left + 210, top + 78);
  traces.lineTo(left + 340, top + 78);
  traces.lineTo(left + 340, top + 40);
  traces.lineTo(left + 520, top + 40);
  traces.lineTo(left + 520, top + 110);
  traces.lineTo(left + 690, top + 110);
  traces.lineTo(left + 690, top + 50);
  traces.lineTo(left + width - 24, top + 50);
  traces.moveTo(left + 42, top + height - 42);
  traces.lineTo(left + 200, top + height - 42);
  traces.lineTo(left + 200, top + height - 88);
  traces.lineTo(left + 390, top + height - 88);
  traces.lineTo(left + 390, top + height - 42);
  traces.lineTo(left + 578, top + height - 42);
  traces.lineTo(left + 578, top + height - 92);
  traces.lineTo(left + 760, top + height - 92);
  traces.strokePath();

  const vias = [
    { x: left + 28, y: top + 34 },
    { x: left + 210, y: top + 78 },
    { x: left + 340, y: top + 40 },
    { x: left + 520, y: top + 110 },
    { x: left + 690, y: top + 50 },
    { x: left + width - 24, y: top + 50 },
    { x: left + 42, y: top + height - 42 },
    { x: left + 200, y: top + height - 88 },
    { x: left + 390, y: top + height - 42 },
    { x: left + 578, y: top + height - 92 },
    { x: left + 760, y: top + height - 92 },
  ];
  vias.forEach((via) => {
    const ring = scene.add.circle(via.x, via.y, 7, 0x8af3d0, 0.35);
    ring.setStrokeStyle(2, 0x7cf3cf, 0.6);
    scene.add.circle(via.x, via.y, 2.5, 0x1e3f4a, 0.95);
  });

  const chip1 = scene.add.rectangle(left + 120, top + 150, 92, 54, 0x1d2c3f, 0.85);
  chip1.setStrokeStyle(2, 0x6b94be, 0.7);
  const chip2 = scene.add.rectangle(left + width - 130, top + 170, 110, 62, 0x1d2c3f, 0.85);
  chip2.setStrokeStyle(2, 0x6b94be, 0.7);
  for (let i = 0; i < 6; i += 1) {
    scene.add.rectangle(left + 82 + i * 12, top + 126, 6, 12, 0x8db6d8, 0.8);
    scene.add.rectangle(left + 82 + i * 12, top + 174, 6, 12, 0x8db6d8, 0.8);
  }
  for (let i = 0; i < 7; i += 1) {
    scene.add.rectangle(left + width - 172 + i * 14, top + 138, 6, 12, 0x8db6d8, 0.8);
    scene.add.rectangle(left + width - 172 + i * 14, top + 202, 6, 12, 0x8db6d8, 0.8);
  }
};

export const drawProgress = (scene, index) => {
  for (let i = 0; i < PUZZLE_KEYS.length; i += 1) {
    const dot = scene.add.circle(
      450 + i * 50,
      20,
      8,
      i <= index ? 0xffd166 : 0x4b6584,
      1,
    );
    if (i === index) {
      scene.tweens.add({
        targets: dot,
        scale: 1.3,
        yoyo: true,
        duration: 500,
        repeat: -1,
      });
    }
  }
};

export const createConfetti = (scene, onComplete) => {
  for (let i = 0; i < 120; i += 1) {
    const particle = scene.add.rectangle(
      Phaser.Math.Between(60, GAME_WIDTH - 60),
      Phaser.Math.Between(-180, -20),
      Phaser.Math.Between(5, 12),
      Phaser.Math.Between(8, 16),
      Phaser.Display.Color.RandomRGB(120, 255).color,
    );
    scene.tweens.add({
      targets: particle,
      y: GAME_HEIGHT + 80,
      x: particle.x + Phaser.Math.Between(-100, 100),
      angle: Phaser.Math.Between(160, 540),
      alpha: 0.8,
      duration: Phaser.Math.Between(1500, 2300),
      ease: "Cubic.easeIn",
      delay: Phaser.Math.Between(0, 350),
      onComplete: () => particle.destroy(),
    });
  }
  scene.time.delayedCall(2200, () => {
    if (onComplete) onComplete();
  });
};

export const energizeBulbs = (scene, bulbs, options = {}) => {
  const repeat = options.repeat ?? 8;
  const delayStep = options.delayStep ?? 120;
  const duration = options.duration ?? 360;
  bulbs
    .filter((bulb) => bulb && bulb.glow)
    .forEach((bulb, index) => {
      scene.tweens.add({
        targets: bulb.glow,
        alpha: 0.95,
        duration: 160,
        delay: index * delayStep,
      });
      scene.tweens.add({
        targets: bulb.glow,
        alpha: 0.6,
        scaleX: 1.08,
        scaleY: 1.08,
        duration,
        yoyo: true,
        repeat,
        delay: index * delayStep,
      });
      if (bulb.coreGlow) {
        scene.tweens.add({
          targets: bulb.coreGlow,
          alpha: 0.78,
          duration: 180,
          delay: index * delayStep,
        });
        scene.tweens.add({
          targets: bulb.coreGlow,
          alpha: 0.45,
          scaleX: 1.15,
          scaleY: 1.15,
          duration: duration - 20,
          yoyo: true,
          repeat,
          delay: index * delayStep,
        });
      }
      if (bulb.glass) {
        scene.tweens.add({
          targets: bulb.glass,
          alpha: 1,
          duration: duration + 40,
          yoyo: true,
          repeat,
          delay: index * delayStep,
        });
      }
      if (bulb.filament) {
        scene.tweens.add({
          targets: bulb.filament,
          alpha: 1,
          duration: duration - 40,
          yoyo: true,
          repeat,
          delay: index * delayStep,
        });
      }
    });
};

export const makeBattery = (scene, x, y, scale = 1) => {
  const body = scene.add.graphics();
  body.fillGradientStyle(0x384756, 0x384756, 0x1f2933, 0x1f2933, 1);
  body.fillRoundedRect(-72, -34, 144, 68, 12);
  body.lineStyle(3, 0xd9e2ec, 0.9);
  body.strokeRoundedRect(-72, -34, 144, 68, 12);
  const bodyGloss = scene.add.graphics();
  bodyGloss.fillStyle(0xffffff, 0.2);
  bodyGloss.fillRoundedRect(-62, -26, 98, 18, 8);
  const plusCap = scene.add.graphics();
  plusCap.fillGradientStyle(0xe6edf3, 0xe6edf3, 0xaab7c4, 0xaab7c4, 1);
  plusCap.fillRoundedRect(50, -18, 24, 36, 6);
  plusCap.lineStyle(2, 0xf8fbff, 0.8);
  plusCap.strokeRoundedRect(50, -18, 24, 36, 6);
  const minusCap = scene.add.graphics();
  minusCap.fillGradientStyle(0x495057, 0x495057, 0x212529, 0x212529, 1);
  minusCap.fillRoundedRect(-74, -16, 20, 32, 5);
  minusCap.lineStyle(2, 0xadb5bd, 0.8);
  minusCap.strokeRoundedRect(-74, -16, 20, 32, 5);
  const centerBand = scene.add.graphics();
  centerBand.fillGradientStyle(0xff6b6b, 0xff6b6b, 0xb42318, 0xb42318, 1);
  centerBand.fillRoundedRect(-14, -31, 28, 62, 7);
  const sideShadow = scene.add.graphics();
  sideShadow.fillStyle(0x000000, 0.22);
  sideShadow.fillRoundedRect(14, -31, 54, 62, 8);
  const container = scene.add
    .container(x, y, [
      body,
      sideShadow,
      bodyGloss,
      plusCap,
      minusCap,
      centerBand,
    ])
    .setScale(scale);
  container.setSize(170 * scale, 80 * scale);
  return container;
};

export const makeSwitch = (scene, x, y, scale = 1) => {
  const base = scene.add.graphics();
  base.fillGradientStyle(0x657786, 0x657786, 0x2d3a47, 0x2d3a47, 1);
  base.fillRoundedRect(-74, -12, 148, 62, 12);
  base.lineStyle(3, 0xdce6ef, 0.8);
  base.strokeRoundedRect(-74, -12, 148, 62, 12);
  const plate = scene.add.graphics();
  plate.fillStyle(0x1c2833, 0.85);
  plate.fillRoundedRect(-56, -6, 112, 28, 8);
  const padLeft = scene.add.graphics();
  padLeft.fillGradientStyle(0xd0ebff, 0xd0ebff, 0x74c0fc, 0x74c0fc, 1);
  padLeft.fillCircle(-42, 2, 13);
  padLeft.lineStyle(2, 0xffffff, 0.7);
  padLeft.strokeCircle(-42, 2, 13);
  const padRight = scene.add.graphics();
  padRight.fillGradientStyle(0xd0ebff, 0xd0ebff, 0x74c0fc, 0x74c0fc, 1);
  padRight.fillCircle(42, 2, 13);
  padRight.lineStyle(2, 0xffffff, 0.7);
  padRight.strokeCircle(42, 2, 13);
  const arm = scene.add
    .rectangle(-10, -8, 84, 11, 0xffda79)
    .setStrokeStyle(2, 0xfff4bf);
  arm.rotation = -0.35;
  const armGlow = scene.add.rectangle(-8, -10, 56, 4, 0xffffff, 0.35);
  armGlow.rotation = -0.35;
  const knobShadow = scene.add.circle(22, -17, 14, 0x000000, 0.25);
  const knob = scene.add
    .circle(20, -20, 12, 0xffec99)
    .setStrokeStyle(2, 0xfff9db);
  const container = scene.add
    .container(x, y, [
      base,
      plate,
      padLeft,
      padRight,
      arm,
      armGlow,
      knobShadow,
      knob,
    ])
    .setScale(scale);
  container.setSize(170 * scale, 90 * scale);
  return container;
};

export const makeBulb = (scene, x, y, scale = 1) => {
  const base = scene.add.graphics();
  base.fillGradientStyle(0xc0c7cf, 0xc0c7cf, 0x6c757d, 0x6c757d, 1);
  base.fillRoundedRect(-36, 22, 72, 36, 8);
  base.lineStyle(2, 0xe9ecef, 0.9);
  base.strokeRoundedRect(-36, 22, 72, 36, 8);
  const rib1 = scene.add.rectangle(0, 28, 56, 3, 0x8d99a6, 0.8);
  const rib2 = scene.add.rectangle(0, 35, 56, 3, 0x8d99a6, 0.8);
  const rib3 = scene.add.rectangle(0, 42, 56, 3, 0x8d99a6, 0.8);
  const neck = scene.add.graphics();
  neck.fillGradientStyle(0xdde4ec, 0xdde4ec, 0x9aa5b1, 0x9aa5b1, 1);
  neck.fillRoundedRect(-24, 8, 48, 20, 6);
  neck.lineStyle(2, 0xe9ecef, 0.8);
  neck.strokeRoundedRect(-24, 8, 48, 20, 6);
  const glass = scene.add.graphics();
  glass.fillGradientStyle(0xf8fbff, 0xd5e8ff, 0x9ec5fe, 0xcfe8ff, 0.95);
  glass.fillCircle(0, -14, 36);
  glass.lineStyle(2, 0xe7f5ff, 0.9);
  glass.strokeCircle(0, -14, 36);
  glass.setAlpha(0.88);
  const glassShadow = scene.add.ellipse(8, -4, 40, 30, 0x74c0fc, 0.18);
  const glare = scene.add.ellipse(-14, -26, 14, 22, 0xffffff, 0.55);
  const filament = scene.add.rectangle(0, -8, 20, 6, 0xf08c00).setAlpha(0.65);
  const filamentStemL = scene.add.rectangle(-9, -1, 2, 10, 0xff922b).setAlpha(0.7);
  const filamentStemR = scene.add.rectangle(9, -1, 2, 10, 0xff922b).setAlpha(0.7);
  const glow = scene.add
    .circle(0, -14, 52, 0xfff3bf, 0)
    .setBlendMode(Phaser.BlendModes.ADD);
  const coreGlow = scene.add
    .circle(0, -12, 22, 0xffd166, 0)
    .setBlendMode(Phaser.BlendModes.ADD);
  const container = scene.add
    .container(x, y, [
      glass,
      glow,
      coreGlow,
      glassShadow,
      glare,
      filament,
      filamentStemL,
      filamentStemR,
      neck,
      base,
      rib1,
      rib2,
      rib3,
    ])
    .setScale(scale);
  container.setSize(120 * scale, 130 * scale);
  container.glow = glow;
  container.coreGlow = coreGlow;
  container.glass = glass;
  container.filament = filament;
  return container;
};
