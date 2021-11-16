/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["betterangels", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
    });
  }

  get template() {
    const path = "systems/betterangels/templates/item";
    //~ To return a single sheet for all item types:
    //~ return `${path}/item-sheet.hbs`;

    //~ To return a different sheet for each item type (e.g. 'weapon-sheet.hbs'):
    return `${path}/item-${this.item.data.type}-sheet.hbs`;
  }

  getData() {
    //~ Retrieve base data structure.
    const context = super.getData();

    //~ Use a safe clone of the item data for further operations.
    const itemData = context.item.data;

    //~ Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    const actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    //~ Add the actor's data to context.data for easier access, as well as flags.
    context.data = itemData.data;
    context.flags = itemData.flags;

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    //~ Everything below here is only needed if the sheet is editable
    if (this.isEditable) { return } // eslint-disable-line no-useless-return

    //~ Roll handlers, click handlers, etc. would go here.
  }

}