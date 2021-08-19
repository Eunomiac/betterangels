import {BetterAngelsActorSheet} from "./actor-sheet.mjs";

class MajorNPCSheet extends BetterAngelsActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: [...super.defaultOptions.classes, "npc", "majornpc"],
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

export {MajorNPCSheet};