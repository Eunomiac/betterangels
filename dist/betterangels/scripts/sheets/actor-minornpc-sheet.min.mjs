/* ▌██░░ betterangels v0.0.1-prealpha (2021) ║ MIT License ║ https://github.com/Eunomiac/betterangels ░░██▐ */import BetterAngelsActorSheet from "./actor-sheet.mjs";

export default class extends BetterAngelsActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [...super.defaultOptions.classes, "npc", "minornpc"],
      width: 400,
      height: 400
    });
  }

  getData() {
    
    const context = super.getData();
    const thisActorData = context.actor.data;

    return context;
  }

  _prepareCharacterData(context) {
    super._prepareCharacterData(context);
  }

  _prepareItems(context) {
    super._prepareItems(context);
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

}