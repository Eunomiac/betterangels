/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Sep 30 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

export default class extends Actor {
  // Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.

  prepareData() {
    /* Prepare data for the actor. Calling the super version of this executes the following, in order:
            - data reset (to clear active effects),
            - prepareBaseData(),
            - prepareEmbeddedDocuments() (including active effects),
            - prepareDerivedData(). */
    super.prepareData();
  }

  prepareBaseData() {
    // Data modifications in this step occur before processing embedded documents or derived data.
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