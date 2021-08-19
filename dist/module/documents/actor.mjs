class BetterAngelsActor extends Actor {

    prepareData() {
        super.prepareData();
    }

    prepareBaseData() {
    }

    prepareDerivedData() {
        const actorData = this.data;
        const {data} = actorData;
        const flags = actorData.flags.betterangels || {};

        this._prepareCharacterData(actorData);
    }

    _prepareCharacterData(actorData) {
        if (actorData.type !== "character") { return }

        const {data} = actorData;
    }

    getRollData() {
        const data = super.getRollData();

        this._getCharacterRollData(data);

        return data;
    }

    _getCharacterRollData(data) {
        if (this.data.type !== "character") { return }

        if (data.attributes.level) {
            data.lvl = data.attributes.level.value ?? 0;
        }
    }
}

export {BetterAngelsActor};