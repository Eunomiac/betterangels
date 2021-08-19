 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/betterangels/templates/actor/parts/actor-features.html",
    "systems/betterangels/templates/actor/parts/actor-items.html",
  ]);
};