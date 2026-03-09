import BasePuzzleScene from "./BasePuzzleScene.js";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  clamp,
  drawCircuitFill,
  energizeBulbs,
  makeBattery,
  makeBulb,
} from "./helpers.js";

export default class Puzzle2Scene extends BasePuzzleScene {
  constructor() {
    super("Puzzle2", 1, "Puzzle3");
    this.gapTargets = [];
    this.gapPlaced = {};
    this.wirePieces = [];
    this.eventsAttached = false;
    this.guideOrder = ["g1", "g2", "g3"];
  }

  create() {
    this.createBase();
    this.input.setTopOnly(true);
    this.input.dragDistanceThreshold = 2;
    this.add
      .rectangle(500, 250, 830, 300, 0x1c2a3a, 0.95)
      .setStrokeStyle(4, 0x7aa2c5);
    drawCircuitFill(this, 500, 250, 810, 280);
    this.add.rectangle(500, 430, 770, 50, 0x111b2a).setStrokeStyle(3, 0x3d5a80);

    const staticWire = this.add.graphics();
    staticWire.lineStyle(12, 0x596b7d, 1);
    staticWire.beginPath();
    staticWire.moveTo(170, 120);
    staticWire.lineTo(380, 120);
    staticWire.moveTo(470, 120);
    staticWire.lineTo(750, 120);
    staticWire.lineTo(750, 280);
    staticWire.moveTo(750, 360);
    staticWire.lineTo(250, 360);
    staticWire.lineTo(250, 240);
    staticWire.moveTo(250, 160);
    staticWire.lineTo(170, 160);
    staticWire.strokePath();

    const bulbA = makeBulb(this, 430, 250, 0.55);
    const bulbB = makeBulb(this, 650, 250, 0.55);
    this.bulbs = [bulbA, bulbB];
    makeBattery(this, 170, 140, 0.52);

    this.gapTargets = [
      { key: "g1", x: 425, y: 120, width: 88, height: 20 },
      { key: "g2", x: 750, y: 320, width: 20, height: 88 },
      { key: "g3", x: 250, y: 200, width: 20, height: 88 },
    ];

    this.gapTargets.forEach((gap) => {
      this.add
        .rectangle(gap.x, gap.y, gap.width + 20, gap.height + 20, 0x3a506b, 0.4)
        .setStrokeStyle(3, 0x8ecae6);
    });

    const p1 = this.createWirePiece("g1", 300, 430, 92, 16);
    const p2 = this.createWirePiece("g2", 500, 430, 16, 92);
    const p3 = this.createWirePiece("g3", 700, 430, 16, 92);
    this.wirePieces = [p1, p2, p3];
    this.updateGuideStep();
  }

  createWirePiece(key, x, y, width, height) {
    const pickPadW = width > height ? width + 18 : Math.max(width + 18, 34);
    const pickPadH = height > width ? height + 18 : Math.max(height + 18, 34);
    const shadow = this.add.rectangle(0, 4, width, height, 0x0b1320, 0.5);
    const body = this.add
      .rectangle(0, 0, width, height, 0xffb703)
      .setStrokeStyle(3, 0xffe8a3);
    const shine = this.add.rectangle(
      0,
      -2,
      width * 0.88,
      Math.max(6, height * 0.25),
      0xfff3bf,
      0.35,
    );
    const copper = this.add.rectangle(
      0,
      0,
      Math.max(8, width * 0.35),
      Math.max(8, height * 0.35),
      0xff8f00,
      0.9,
    );
    const container = this.add.container(x, y, [shadow, body, shine, copper]);
    container.key = key;
    container.setSize(pickPadW, pickPadH);
    container.startX = x;
    container.startY = y;
    container.locked = false;
    container.setDepth(0);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-pickPadW / 2, -pickPadH / 2 + 2, pickPadW, pickPadH),
      Phaser.Geom.Rectangle.Contains,
    );
    container.input.cursor = "grab";
    this.input.setDraggable(container);
    return container;
  }

  update() {
    if (!this.eventsAttached) {
      this.attachEvents();
      this.eventsAttached = true;
    }
  }

  attachEvents() {
    this.input.on("dragstart", (pointer, gameObject) => {
      if (gameObject.locked) return;
      gameObject.setDepth(20);
      gameObject.input.cursor = "grabbing";
      this.tweens.add({
        targets: gameObject,
        scale: 1.08,
        duration: 120,
      });
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      if (gameObject.locked) return;
      gameObject.x = clamp(dragX, 90, GAME_WIDTH - 90);
      gameObject.y = clamp(dragY, 80, GAME_HEIGHT - 40);
    });

    this.input.on("dragend", (pointer, gameObject) => {
      if (gameObject.locked) return;
      const target = this.gapTargets.find(
        (gap) => gap.key === gameObject.key && !this.gapPlaced[gap.key],
      );
      if (!target) return;
      const d = Phaser.Math.Distance.Between(
        gameObject.x,
        gameObject.y,
        target.x,
        target.y,
      );
      if (d < 80) {
        gameObject.locked = true;
        this.gapPlaced[target.key] = true;
        this.tweens.add({
          targets: gameObject,
          x: target.x,
          y: target.y,
          duration: 220,
          ease: "Back.Out",
          onComplete: () => {
            gameObject.scale = 1;
            gameObject.setDepth(0);
            gameObject.input.cursor = "grab";
            this.updateGuideStep();
            this.checkSolved();
          },
        });
      } else {
        this.tweens.add({
          targets: gameObject,
          x: gameObject.startX,
          y: gameObject.startY,
          duration: 240,
          ease: "Sine.easeInOut",
          onComplete: () => {
            gameObject.scale = 1;
            gameObject.setDepth(0);
            gameObject.input.cursor = "grab";
          },
        });
      }
    });
  }

  updateGuideStep() {
    const nextKey = this.guideOrder.find((key) => !this.gapPlaced[key]);
    if (!nextKey) {
      this.clearGuideStep();
      return;
    }
    const piece = this.wirePieces.find((item) => item.key === nextKey);
    const target = this.gapTargets.find((gap) => gap.key === nextKey);
    if (!piece || !target) return;
    this.setGuideStep(
      { x: piece.startX, y: piece.startY + 34 },
      { x: target.x, y: target.y + 34 },
      900,
    );
  }

  checkSolved() {
    if (!this.gapTargets.every((gap) => this.gapPlaced[gap.key])) return;
    const pulse = this.add
      .circle(170, 120, 10, 0xfff3bf, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    const path = new Phaser.Curves.Path(170, 120);
    path.lineTo(750, 120);
    path.lineTo(750, 360);
    path.lineTo(250, 360);
    path.lineTo(250, 160);
    path.lineTo(170, 160);
    this.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration: 1800,
      repeat: 2,
      onUpdate: (tween, target) => {
        const p = path.getPoint(target.t);
        pulse.setPosition(p.x, p.y);
      },
      onComplete: () => pulse.destroy(),
    });
    energizeBulbs(this, this.bulbs, {
      repeat: 9,
      duration: 360,
      delayStep: 140,
    });
    this.time.delayedCall(2200, () => this.completePuzzle());
  }
}
