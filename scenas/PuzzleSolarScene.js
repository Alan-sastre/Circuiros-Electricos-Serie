import BasePuzzleScene from "./BasePuzzleScene.js";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  clamp,
  drawCircuitFill,
  energizeBulbs,
  makeBattery,
  makeBulb,
  makeSwitch,
} from "./helpers.js";

export default class PuzzleSolarScene extends BasePuzzleScene {
  constructor() {
    super("Puzzle1", 0, "Puzzle2");
    this.targets = [];
    this.pieces = [];
    this.occupied = {};
    this.guideOrder = ["battery", "switch", "bulb"];
  }

  create() {
    this.createBase();
    this.add
      .rectangle(500, 250, 830, 300, 0x2b2d42, 0.95)
      .setStrokeStyle(4, 0x8d99ae);
    drawCircuitFill(this, 500, 250, 810, 280);
    this.add
      .rectangle(500, 430, 780, 50, 0x1a2538, 1)
      .setStrokeStyle(3, 0x3b4f6b);

    const wiresBase = this.add.graphics();
    wiresBase.lineStyle(14, 0x455a64, 1);
    wiresBase.beginPath();
    wiresBase.moveTo(220, 185);
    wiresBase.lineTo(360, 185);
    wiresBase.lineTo(360, 150);
    wiresBase.lineTo(500, 150);
    wiresBase.lineTo(500, 185);
    wiresBase.lineTo(640, 185);
    wiresBase.lineTo(640, 150);
    wiresBase.lineTo(780, 150);
    wiresBase.lineTo(780, 185);
    wiresBase.strokePath();

    this.wiresGlow = this.add.graphics();
    this.wiresGlow.lineStyle(10, 0xffe066, 0);
    this.wiresGlow.beginPath();
    this.wiresGlow.moveTo(220, 185);
    this.wiresGlow.lineTo(360, 185);
    this.wiresGlow.lineTo(360, 150);
    this.wiresGlow.lineTo(500, 150);
    this.wiresGlow.lineTo(500, 185);
    this.wiresGlow.lineTo(640, 185);
    this.wiresGlow.lineTo(640, 150);
    this.wiresGlow.lineTo(780, 150);
    this.wiresGlow.lineTo(780, 185);
    this.wiresGlow.strokePath();

    const slots = [
      { key: "battery", x: 220, y: 200, w: 175, h: 90 },
      { key: "switch", x: 500, y: 200, w: 175, h: 90 },
      { key: "bulb", x: 780, y: 200, w: 175, h: 90 },
    ];

    slots.forEach((slot) => {
      this.add
        .rectangle(slot.x, slot.y, slot.w, slot.h, 0x3a506b, 0.35)
        .setStrokeStyle(3, 0x87bfff)
        .setDepth(1);
      this.targets.push(slot);
    });

    const battery = makeBattery(this, 240, 430, 0.8);
    battery.kind = "battery";
    const sw = makeSwitch(this, 500, 430, 0.8);
    sw.kind = "switch";
    const bulb = makeBulb(this, 760, 410, 0.74);
    bulb.kind = "bulb";
    this.finalBulb = bulb;
    this.pieces = [battery, sw, bulb];

    this.makeDraggablePieces();
    this.updateGuideStep();
  }

  makeDraggablePieces() {
    this.input.setTopOnly(true);
    this.pieces.forEach((piece) => {
      piece.startX = piece.x;
      piece.startY = piece.y;
      piece.locked = false;
      piece.setInteractive(
        new Phaser.Geom.Rectangle(-90, -90, 180, 180),
        Phaser.Geom.Rectangle.Contains,
      );
      this.input.setDraggable(piece);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (gameObject.locked) return;
      gameObject.x = clamp(dragX, 120, GAME_WIDTH - 120);
      gameObject.y = clamp(dragY, 100, GAME_HEIGHT - 70);
    });

    this.input.on("dragend", (pointer, gameObject) => {
      if (gameObject.locked) return;
      const target = this.targets.find(
        (slot) => slot.key === gameObject.kind && !this.occupied[slot.key],
      );
      if (!target) return;
      const distance = Phaser.Math.Distance.Between(
        gameObject.x,
        gameObject.y,
        target.x,
        target.y,
      );
      if (distance < 90) {
        gameObject.locked = true;
        this.occupied[target.key] = true;
        this.tweens.add({
          targets: gameObject,
          x: target.x,
          y: target.y,
          duration: 220,
          ease: "Back.Out",
          onComplete: () => {
            this.updateGuideStep();
            this.checkSolved();
          },
        });
      } else {
        this.tweens.add({
          targets: gameObject,
          x: gameObject.startX,
          y: gameObject.startY,
          duration: 260,
          ease: "Sine.easeInOut",
        });
      }
    });
  }

  updateGuideStep() {
    const nextKind = this.guideOrder.find((kind) => !this.occupied[kind]);
    if (!nextKind) {
      this.clearGuideStep();
      return;
    }
    const piece = this.pieces.find((item) => item.kind === nextKind);
    const target = this.targets.find((slot) => slot.key === nextKind);
    if (!piece || !target) return;
    this.setGuideStep(
      { x: piece.startX, y: piece.startY + 40 },
      { x: target.x, y: target.y + 35 },
      820,
    );
  }

  checkSolved() {
    const allPlaced = this.targets.every((slot) => this.occupied[slot.key]);
    if (!allPlaced) return;
    const pulse = this.add
      .circle(220, 185, 10, 0xfff3bf, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    const path = new Phaser.Curves.Path(220, 185);
    path.lineTo(360, 185);
    path.lineTo(360, 150);
    path.lineTo(500, 150);
    path.lineTo(500, 185);
    path.lineTo(640, 185);
    path.lineTo(640, 150);
    path.lineTo(780, 150);
    path.lineTo(780, 185);
    this.tweens.add({
      targets: this.wiresGlow,
      alpha: 1,
      duration: 400,
      yoyo: true,
      repeat: 4,
    });
    this.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration: 1700,
      repeat: 1,
      onUpdate: (tween, target) => {
        const point = path.getPoint(target.t);
        pulse.setPosition(point.x, point.y);
      },
      onComplete: () => pulse.destroy(),
    });
    energizeBulbs(this, [this.finalBulb], {
      repeat: 10,
      duration: 320,
      delayStep: 0,
    });
    this.time.delayedCall(2000, () => this.completePuzzle());
  }
}
