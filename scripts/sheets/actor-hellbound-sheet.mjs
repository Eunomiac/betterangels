import BetterAngelsActorSheet from "./actor-sheet.mjs";

export default class extends BetterAngelsActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: [...super.defaultOptions.classes, "hellbound"],
      width: 400,
      height: 700,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "strats&tacts"}]
    });
  }

  getData() {
    /*~ Retrieve the data structure from the base sheet. You can inspect or log
            the context variable to see the structure, but some key properties for
            sheets are the actor object, the data object, whether or not it's
            editable, the items array, and the effects array. */
    const context = super.getData();

    //~ Use a safe clone of the actor data for further operations.
    const thisActorData = context.actor.data;

    //~ Prepare character data and items.
    //~ if (thisActorData.type === "character") {
    //~     this._prepareItems(context);
    //~     this._prepareCharacterData(context);
    //~ }

    //~ Add roll data for TinyMCE editors.
    //~ context.rollData = context.actor.getRollData();

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