/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 13 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

export default class extends Item {
  
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) { return null }
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.data.data);

    return rollData;
  }

  async roll() {
    const item = this.data;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({actor: this.actor});
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.data.data.formula) {
      ChatMessage.create({
        speaker,
        rollMode,
        flavor: label,
        content: item.data.description ?? ""
      });
    } else { // Otherwise, create a roll and send a chat message from it.
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData).roll();
      roll.toMessage({
        speaker,
        rollMode,
        flavor: label
      });
      return roll;
    }
    return false;
  }
}