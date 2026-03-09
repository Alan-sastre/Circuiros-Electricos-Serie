import {
  createConfetti,
  drawProgress,
  drawRoundedPanel,
} from "./helpers.js";

export default class BasePuzzleScene extends Phaser.Scene {
  constructor(key, puzzleIndex, nextKey) {
    super(key);
    this.puzzleIndex = puzzleIndex;
    this.nextKey = nextKey;
    this.completed = false;
  }

  createBase() {
    this.cameras.main.setBackgroundColor("#091120");
    drawRoundedPanel(this);
    drawProgress(this, this.puzzleIndex);
  }

  setGuideStep(from, to, duration = 900) {
    if (!this.guideHand || !this.guideHand.active) {
      this.guideHand = this.add.text(from.x, from.y, "👆🏻", {
        fontSize: "52px",
      });
      this.guideHand.setDepth(30);
      this.guideHand.setAlpha(0.95);
    }
    if (this.guideTween) {
      this.guideTween.stop();
      this.guideTween = null;
    }
    this.guideHand.setPosition(from.x, from.y);
    this.guideTween = this.tweens.add({
      targets: this.guideHand,
      x: to.x,
      y: to.y,
      duration,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  clearGuideStep() {
    if (this.guideTween) {
      this.guideTween.stop();
      this.guideTween = null;
    }
    if (this.guideHand && this.guideHand.active) {
      this.guideHand.destroy();
    }
  }

  completePuzzle() {
    if (this.completed) return;
    this.completed = true;
    this.clearGuideStep();
    createConfetti(this, () => {
      if (this.nextKey) {
        this.scene.start(this.nextKey);
      } else {
        this.scene.start("FinalScene");
      }
    });
  }
}
