import {BetterAngelsActorSheet} from "./actor-sheet.mjs";

class MinorNPCSheet extends BetterAngelsActorSheet {

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

export {MinorNPCSheet};