export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
        // Actor partials.
        "systems/betterangels/templates/actor/parts/actor-background.html",
        "systems/betterangels/templates/actor/parts/actor-equipment.html",
        "systems/betterangels/templates/actor/parts/actor-powers.html",
        "systems/betterangels/templates/actor/parts/actor-strats&tacts.html"
    ]);
};