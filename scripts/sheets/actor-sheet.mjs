export default class extends ActorSheet {

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["betterangels", "sheet", "actor"],
			template: "systems/betterangels/templates/actor/actor-sheet.hbs",
			width: 700,
			height: 700,
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "human"}]
		});
	}

	get template() { return `systems/betterangels/templates/actor/actor-${this.actor.data.type}-sheet.hbs` }

	getData() {
		/*~ Retrieve the data structure from the base sheet. You can inspect or log
            the context variable to see the structure, but some key properties for
            sheets are the actor object, the data object, whether or not it's
            editable, the items array, and the effects array. */
		const context = super.getData();

		//~ Use a safe clone of the actor data for further operations.
		const actorData = context.actor.data;

		//~ Add the actor's data to context.data for easier access, as well as flags.
		context.data = actorData.data;
		context.flags = actorData.flags;

		//~ Prepare character data and items.
		if (actorData.type === "character") {
			this._prepareItems(context);
			this._prepareCharacterData(context);
		}

		//~ Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();

		return context;
	}

	_prepareCharacterData(context) { }

	_prepareItems(context) {
		//~ Initialize containers.
		const gear = [];
		const features = [];

		//~ Iterate through items, allocating to containers
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

		//~ Assign and return
		context.gear = gear;
		context.features = features;
	}

	activateListeners(html) {
		super.activateListeners(html);

		//~ Render the item sheet for viewing/editing prior to the editable check.
		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		//~ Everything below here is only needed if the sheet is editable
		if (!this.isEditable) { return }

		//~ Add Inventory Item
		html.find(".item-create").click(this._onItemCreate.bind(this));

		//~ Delete Inventory Item
		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		//~ Rollable abilities.
		html.find(".rollable").click(this._onRoll.bind(this));

		//~ Drag events for macros.
		if (this.actor.isOwner) {
			const handler = (ev) => this._onDragStart(ev);
			html.find("li.item").each((i, li) => {
				if (li.classList.contains("inventory-header")) { return }
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}
	}

	async _onItemCreate(event) { //~ Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
		event.preventDefault();
		const header = event.currentTarget;
		//~ Get the type of item to create.
		const {type} = header.dataset;
		//~ Grab any data associated with this control.
		const data = duplicate(header.dataset);
		//~ Initialize a default name.
		const name = `New ${type.capitalize()}`;
		//~ Prepare the item object.
		const itemData = {name, type, data};
		//~ Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.data.type;

		//~ Finally, create the item!
		return await Item.create(itemData, {parent: this.actor});
	}

	_onRoll(event) { //~ Handle clickable rolls
		event.preventDefault();
		const element = event.currentTarget;
		const {dataset} = element;

		//~ Handle item rolls.
		if (dataset.rollType) {
			if (dataset.rollType === "item") {
				const {itemId} = element.closest(".item").dataset;
				const item = this.actor.items.get(itemId);
				if (item) {
					return item.roll();
				}
			}
		}

		//~ Handle rolls that supply the formula directly.
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