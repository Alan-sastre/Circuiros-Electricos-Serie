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

export default class Puzzle3Scene extends BasePuzzleScene {
  constructor() {
    super("Puzzle3", 2, "Puzzle4");
    this.cards = [];
    this.slots = [];
    this.slotState = {};
    this.guideOrder = ["battery", "switch", "bulb1", "bulb2"];
  }

  create() {
    this.createBase();
    this.input.setTopOnly(true);
    this.add
      .rectangle(500, 250, 830, 300, 0x162335, 0.95)
      .setStrokeStyle(4, 0x5f85a8);
    drawCircuitFill(this, 500, 250, 810, 280);
    this.add
      .rectangle(500, 430, 780, 50, 0x101a29, 1)
      .setStrokeStyle(3, 0x395370);

    this.slots = [
      { index: 0, x: 260, y: 210, expected: "battery" },
      { index: 1, x: 420, y: 210, expected: "switch" },
      { index: 2, x: 580, y: 210, expected: "bulb1" },
      { index: 3, x: 740, y: 210, expected: "bulb2" },
    ];

    this.drawSeriesTrack();

    this.slots.forEach((slot) => {
      this.add
        .rectangle(slot.x, slot.y, 130, 110, 0x3a506b, 0.38)
        .setStrokeStyle(3, 0x90caf9);
      this.slotState[slot.index] = null;
    });

    const deck = [
      { id: "bulb2", maker: () => makeBulb(this, 0, -5, 0.5), x: 220 },
      { id: "battery", maker: () => makeBattery(this, 0, 0, 0.54), x: 420 },
      { id: "switch", maker: () => makeSwitch(this, 0, 5, 0.54), x: 620 },
      { id: "bulb1", maker: () => makeBulb(this, 0, -5, 0.5), x: 820 },
    ];

    deck.forEach((cardData) => {
      const cardBg = this.add
        .rectangle(0, 0, 130, 110, 0x0b1421, 0.95)
        .setStrokeStyle(3, 0x6ea8fe);
      const art = cardData.maker();
      art.setPosition(0, 0);
      const card = this.add.container(cardData.x, 430, [cardBg, art]);
      card.id = cardData.id;
      card.startX = cardData.x;
      card.startY = 430;
      card.currentSlot = null;
      card.setSize(130, 110);
      card.setInteractive(
        new Phaser.Geom.Rectangle(-65, -55, 130, 110),
        Phaser.Geom.Rectangle.Contains,
      );
      card.input.cursor = "grab";
      this.input.setDraggable(card);
      this.cards.push(card);
    });

    this.attachCardEvents();
    this.updateGuideStep();
  }

  drawSeriesTrack() {
    const track = this.add.graphics();
    track.lineStyle(10, 0x425972, 1);
    track.beginPath();
    track.moveTo(200, 160);
    track.lineTo(800, 160);
    track.lineTo(800, 260);
    track.lineTo(200, 260);
    track.closePath();
    track.strokePath();
    this.trackGlow = this.add.graphics();
    this.trackGlow.lineStyle(8, 0xffd166, 0);
    this.trackGlow.beginPath();
    this.trackGlow.moveTo(200, 160);
    this.trackGlow.lineTo(800, 160);
    this.trackGlow.lineTo(800, 260);
    this.trackGlow.lineTo(200, 260);
    this.trackGlow.closePath();
    this.trackGlow.strokePath();
  }

  attachCardEvents() {
    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = clamp(dragX, 80, GAME_WIDTH - 80);
      gameObject.y = clamp(dragY, 80, GAME_HEIGHT - 30);
      gameObject.setDepth(12);
    });

    this.input.on("dragend", (pointer, card) => {
      const nearest = this.getNearestSlot(card);
      if (
        !nearest ||
        Phaser.Math.Distance.Between(card.x, card.y, nearest.x, nearest.y) > 90
      ) {
        if (card.currentSlot !== null) {
          this.slotState[card.currentSlot] = null;
          card.currentSlot = null;
        }
        this.tweens.add({
          targets: card,
          x: card.startX,
          y: card.startY,
          duration: 220,
          ease: "Sine.easeInOut",
          onComplete: () => card.setDepth(0),
        });
        return;
      }

      if (card.currentSlot !== null) {
        this.slotState[card.currentSlot] = null;
      }
      const occupiedBy = this.cards.find(
        (c) => c.currentSlot === nearest.index && c !== card,
      );
      if (occupiedBy) {
        occupiedBy.currentSlot = null;
        this.slotState[nearest.index] = null;
        this.tweens.add({
          targets: occupiedBy,
          x: occupiedBy.startX,
          y: occupiedBy.startY,
          duration: 220,
          ease: "Sine.easeInOut",
        });
      }

      card.currentSlot = nearest.index;
      this.slotState[nearest.index] = card.id;
      this.tweens.add({
        targets: card,
        x: nearest.x,
        y: nearest.y,
        duration: 220,
        ease: "Back.Out",
        onComplete: () => {
          card.setDepth(0);
          this.updateGuideStep();
          this.checkSolved();
        },
      });
    });
  }

  updateGuideStep() {
    const pending = this.slots.find(
      (slot) => this.slotState[slot.index] !== slot.expected,
    );
    if (!pending) {
      this.clearGuideStep();
      return;
    }
    const card = this.cards.find((item) => item.id === pending.expected);
    if (!card) return;
    this.setGuideStep(
      { x: card.x, y: card.y + 42 },
      { x: pending.x, y: pending.y + 38 },
      900,
    );
  }

  getNearestSlot(card) {
    let nearest = null;
    let best = Number.POSITIVE_INFINITY;
    this.slots.forEach((slot) => {
      const d = Phaser.Math.Distance.Between(card.x, card.y, slot.x, slot.y);
      if (d < best) {
        best = d;
        nearest = slot;
      }
    });
    return nearest;
  }

  checkSolved() {
    const allOccupied = this.slots.every(
      (slot) => this.slotState[slot.index] !== null,
    );
    if (!allOccupied) return;
    const ordered = this.slots.every(
      (slot) => this.slotState[slot.index] === slot.expected,
    );
    if (!ordered) return;
    this.tweens.add({
      targets: this.trackGlow,
      alpha: 1,
      duration: 420,
      yoyo: true,
      repeat: 5,
    });
    const pulse = this.add
      .circle(200, 160, 10, 0xfff3bf, 1)
      .setBlendMode(Phaser.BlendModes.ADD);
    const path = new Phaser.Curves.Path(200, 160);
    path.lineTo(800, 160);
    path.lineTo(800, 260);
    path.lineTo(200, 260);
    path.lineTo(200, 160);
    this.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration: 1900,
      repeat: 1,
      onUpdate: (tween, target) => {
        const point = path.getPoint(target.t);
        pulse.setPosition(point.x, point.y);
      },
      onComplete: () => pulse.destroy(),
    });
    const bulbs = this.cards
      .filter((card) => card.id.includes("bulb"))
      .map((card) => card.list[1]);
    energizeBulbs(this, bulbs, {
      repeat: 10,
      duration: 340,
      delayStep: 120,
    });
    this.time.delayedCall(2200, () => this.completePuzzle());
  }
}
