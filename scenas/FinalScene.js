import { PUZZLE_KEYS, createConfetti, drawRoundedPanel } from "./helpers.js";

export default class FinalScene extends Phaser.Scene {
  constructor() {
    super("FinalScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#091120");
    drawRoundedPanel(this);

    this.add
      .text(500, 150, "¡Felicitaciones!", {
        fontSize: "58px",
        color: "#ffe28a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(500, 220, "Completaste todos los circuitos en serie.", {
        fontSize: "30px",
        color: "#d7ecff",
      })
      .setOrigin(0.5);

    createConfetti(this);

    const button = this.add
      .rectangle(500, 320, 300, 74, 0x1f8a70, 0.96)
      .setStrokeStyle(4, 0x97ffd8)
      .setInteractive({ useHandCursor: true });
    const buttonLabel = this.add
      .text(500, 320, "Volver a jugar", {
        fontSize: "34px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    button.on("pointerover", () => {
      button.setFillStyle(0x26a384, 0.98);
      buttonLabel.setScale(1.03);
    });
    button.on("pointerout", () => {
      button.setFillStyle(0x1f8a70, 0.96);
      buttonLabel.setScale(1);
    });
    button.on("pointerdown", () => {
      this.scene.start(PUZZLE_KEYS[0]);
    });
  }
}
