const PHASES = {
  forming: "forming",
  preRoll: "preRoll",
  postRoll: "postRoll"
};
Object.freeze(PHASES);
export default class extends Roll {
  static get PHASES() { return PHASES }

  // Wait, can't you just add templates and render ability to ANY Foundry class, including Roll?
  // Roll extends Application right...?

  constructor(...args) {
    super(...args);
    this.phase = this.options.phase ?? PHASES.forming;
  }

  get phase() { return this._phase }
  set phase(v) {
    if (v in PHASES) {
      this._phase = v;
    } else {
      throw new Error(`'${v}' is not a phase: ${Object.keys(PHASES).join(", ")}`);
    }
  }
  // .appendTo(".vtt.game.system-betterangels")
  create({posX, posY}) {
    this._element = new Application({
      popOut: true

    });
  }

}