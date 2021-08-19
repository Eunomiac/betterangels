import {HellboundActorSheet} from "./actor-hellbound-sheet.mjs";

class DemonCompanionSheet extends HellboundActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [...super.defaultOptions.classes, "demon", "companion"],
            width: 400,
            height: 700,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "strats&tacts"}]
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

export {DemonCompanionSheet};