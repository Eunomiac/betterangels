class BetterAngelsActor extends Actor {
    prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
        super.prepareData(); 
    }
    prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    }
    prepareDerivedData() {
        const actorData = this.data;
        const {data} = actorData;
        const flags = actorData.flags.betterangels || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
        this._prepareCharacterData(actorData);
    }
    _prepareCharacterData(actorData) {
        if (actorData.type !== "character") { return }

    // Make modifications to data here. For example:
        const {data} = actorData;
    }
    getRollData() {
        const data = super.getRollData();

    // Prepare character roll data.
        this._getCharacterRollData(data);

        return data;
    }
    _getCharacterRollData(data) {
        if (this.data.type !== "character") { return }

    // Add level for easier access, or fall back to 0.
        if (data.attributes.level) {
            data.lvl = data.attributes.level.value ?? 0;
        }
    }
}

export {BetterAngelsActor as default};