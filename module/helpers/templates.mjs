export const preloadHandlebarsTemplates = async function() {
    /**
     * Define a set of template paths to pre-load.
     * Pre-loaded templates are compiled and cached for fast access when rendering.
     */
    return loadTemplates([
        // Actor partials.
        "systems/betterangels/templates/actor/parts/actor-background.html",
        "systems/betterangels/templates/actor/parts/actor-equipment.html",
        "systems/betterangels/templates/actor/parts/actor-powers.html",
        "systems/betterangels/templates/actor/parts/actor-strats&tacts.html"
    ]);
};
