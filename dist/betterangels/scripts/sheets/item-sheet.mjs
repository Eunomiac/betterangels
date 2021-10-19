/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 13 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

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
    return `${path}/item-${this.item.data.type}-sheet.html`;
  }

  getData() {
    const context = super.getData();
    const itemData = context.item.data;
    context.rollData = {};
    const actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }
    context.data = itemData.data;
    context.flags = itemData.flags;

    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.isEditable) { return }
  }

}