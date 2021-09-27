/**
 *
 * @extends {Actor}
 */
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
    /*~ Augment the basic actor data with additional dynamic data. Typically,
            you'll want to handle most of your calculated/derived data in this step.
            Data calculated in this step should generally not exist in template.json
            (such as ability modifiers rather than ability scores) and should be
            available both inside and outside of character sheets (such as if an actor
            is queried and has a roll executed directly from it). */
    const actorData = this.data;
    const {data} = actorData;
    const flags = actorData.flags.betterangels || {};

    //~ Make separate methods for each Actor type (character, npc, etc.) to keep things organized.
    this._prepareCharacterData(actorData);
  }

  _prepareCharacterData(actorData) {
    //~ Prepare Character type specific data
    if (actorData.type !== "character") { return }

    //~ Make modifications to data here. For example:
    const {data} = actorData;
  }

  getRollData() {
    //~ Override getRollData() that's supplied to rolls.
    const data = super.getRollData();

    //~ Prepare character roll data.
    this._getCharacterRollData(data);

    return data;
  }

  _getCharacterRollData(data) {
    //~ Prepare character roll data.
    if (this.data.type !== "character") { return }

    //~ Add level for easier access, or fall back to 0.
    if (data.attributes.level) {
      data.lvl = data.attributes.level.value ?? 0;
    }
  }
}