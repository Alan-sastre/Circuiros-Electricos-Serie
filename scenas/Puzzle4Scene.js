import BasePuzzleScene from "./BasePuzzleScene.js";
import {
  drawCircuitFill,
  energizeBulbs,
  makeBattery,
  makeBulb,
  makeSwitch,
} from "./helpers.js";

export default class Puzzle4Scene extends BasePuzzleScene {
  constructor() {
    super("Puzzle4", 3, null);
    this.switches = [];
    this.trace = null;
    this.pathPoints = [];
    this.bulbs = [];
  }

  create() {
    this.createBase();
    this.input.setTopOnly(true);
    this.add
      .rectangle(500, 250, 830, 300, 0x173842, 0.95)
      .setStrokeStyle(4, 0x76c5cf);
    drawCircuitFill(this, 500, 250, 810, 280);
    this.add
      .rectangle(500, 430, 820, 52, 0x0f2128, 1)
      .setStrokeStyle(3, 0x4e7a87);
    this.pathPoints = [
      { x: 210, y: 250 },
      { x: 280, y: 250 },
      { x: 410, y: 250 },
      { x: 540, y: 250 },
      { x: 670, y: 250 },
      { x: 760, y: 250 },
      { x: 760, y: 220 },
      { x: 840, y: 220 },
      { x: 840, y: 300 },
      { x: 760, y: 300 },
      { x: 760, y: 340 },
      { x: 180, y: 340 },
      { x: 180, y: 282 },
    ];

    this.drawBaseTrack();
    this.trace = this.add.graphics();

    makeBattery(this, 150, 265, 0.55);
    const bulbA = makeBulb(this, 840, 220, 0.5);
    const bulbB = makeBulb(this, 840, 300, 0.5);
    this.bulbs = [bulbA, bulbB];

    this.createSwitchModule(345, 250, false);
    this.createSwitchModule(475, 250, true);
    this.createSwitchModule(605, 250, false);
    this.createSwitchModule(735, 250, true);
    this.refreshTrace();
    this.updateGuideStep();
  }

  drawBaseTrack() {
    const track = this.add.graphics();
    track.lineStyle(10, 0x4b7888, 1);
    track.beginPath();
    track.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
    for (let i = 1; i < this.pathPoints.length; i += 1) {
      track.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
    }
    track.strokePath();
  }

  createSwitchModule(x, y, initialOn) {
    this.add.rectangle(x, y, 106, 82, 0x143143, 0.5).setStrokeStyle(2, 0x7fc7d1, 0.8);
    const toggle = makeSwitch(this, x, y + 4, 0.42);
    toggle.isOn = initialOn;
    toggle.setAngle(toggle.isOn ? 0 : -28);
    toggle.setSize(150, 118);
    toggle.setInteractive(
      new Phaser.Geom.Rectangle(-75, -59, 150, 118),
      Phaser.Geom.Rectangle.Contains,
    );
    toggle.input.cursor = "pointer";
    const led = this.add.circle(x, y - 30, 7, toggle.isOn ? 0x80ed99 : 0xff6b6b, 1);
    led.setStrokeStyle(2, 0xe6f4ff, 0.8);
    toggle.led = led;
    toggle.on("pointerdown", () => {
      if (this.completed) return;
      toggle.isOn = !toggle.isOn;
      this.tweens.add({
        targets: toggle,
        angle: toggle.isOn ? 0 : -28,
        duration: 160,
        ease: "Sine.easeInOut",
      });
      toggle.led.setFillStyle(toggle.isOn ? 0x80ed99 : 0xff6b6b, 1);
      this.refreshTrace();
      this.updateGuideStep();
      this.checkSolved();
    });
    this.switches.push(toggle);
  }

  updateGuideStep() {
    const nextSwitch = this.switches.find((item) => !item.isOn);
    if (!nextSwitch) {
      this.clearGuideStep();
      return;
    }
    this.setGuideStep(
      { x: nextSwitch.x, y: nextSwitch.y + 78 },
      { x: nextSwitch.x, y: nextSwitch.y + 8 },
      650,
    );
  }

  refreshTrace() {
    this.trace.clear();
    const firstOff = this.switches.findIndex((item) => !item.isOn);
    const cutoff = firstOff === -1 ? 6 : firstOff + 2;
    this.trace.lineStyle(8, 0xffe38a, 0.9);
    this.trace.beginPath();
    this.trace.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
    for (let i = 1; i <= cutoff; i += 1) {
      this.trace.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
    }
    if (firstOff === -1) {
      for (let i = 7; i < this.pathPoints.length; i += 1) {
        this.trace.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
      }
    }
    this.trace.strokePath();
  }

  checkSolved() {
    const solved = this.switches.every((item) => item.isOn);
    if (!solved) return;
    if (this.completed) return;
    this.clearGuideStep();
    this.bulbs.forEach((bulb) => {
      bulb.glow.setAlpha(0.98);
      if (bulb.coreGlow) bulb.coreGlow.setAlpha(0.82);
      if (bulb.filament) bulb.filament.setAlpha(1);
    });
    const pulse = this.add
      .circle(this.pathPoints[0].x, this.pathPoints[0].y, 10, 0xfff3bf, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    const path = new Phaser.Curves.Path(this.pathPoints[0].x, this.pathPoints[0].y);
    for (let i = 1; i < this.pathPoints.length; i += 1) {
      path.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
    }
    this.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration: 2200,
      repeat: 1,
      onUpdate: (tween, target) => {
        const point = path.getPoint(target.t);
        pulse.setPosition(point.x, point.y);
      },
      onComplete: () => pulse.destroy(),
    });

    energizeBulbs(this, this.bulbs, {
      repeat: 18,
      duration: 340,
      delayStep: 110,
    });

    this.time.delayedCall(3200, () => this.completePuzzle());
  }
}
