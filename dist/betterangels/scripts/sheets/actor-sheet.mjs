/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Sep 29 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

export default class extends ActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["betterangels", "sheet", "actor"],
      template: "systems/betterangels/templates/actor/actor-sheet.html",
      width: 400,
      height: 700,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features"}]
    });
  }

  get template() { return `systems/betterangels/templates/actor/actor-${this.actor.data.type}-sheet.html` }

  getData() {
    
    const context = super.getData();
    const actorData = context.actor.data;
    context.data = actorData.data;
    context.flags = actorData.flags;
    if (actorData.type === "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }
    context.rollData = context.actor.getRollData();

    return context;
  }

  _prepareCharacterData(context) { }

  _prepareItems(context) {
    const gear = [];
    const features = [];
    for (const i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === "item") {
        // Append to gear.
        gear.push(i);
      } else if (i.type === "feature") {
        // Append to features.
        features.push(i);
      }
    }
    context.gear = gear;
    context.features = features;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });
    if (!this.isEditable) { return }
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });
    html.find(".rollable").click(this._onRoll.bind(this));
    if (this.actor.isOwner) {
      const handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) { return }
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const {type} = header.dataset;
    const data = duplicate(header.dataset);
    const name = `New ${type.capitalize()}`;
    const itemData = {name, type, data};
    delete itemData.data.type;
    return await Item.create(itemData, {parent: this.actor});
  }

  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const {dataset} = element;
    if (dataset.rollType) {
      if (dataset.rollType === "item") {
        const {itemId} = element.closest(".item").dataset;
        const item = this.actor.items.get(itemId);
        if (item) {
          return item.roll();
        }
      }
    }
    if (dataset.roll) {
      const label = dataset.label ? `[roll] ${dataset.label}` : "";
      const roll = new Roll(dataset.roll, this.actor.getRollData()).roll();
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode")
      });
      return roll;
    }

    return false;
  }

}