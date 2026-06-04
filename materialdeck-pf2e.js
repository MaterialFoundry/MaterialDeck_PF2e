import { combatTrackerAction } from "./actions/combatTracker.js";
import { otherAction } from "./actions/other.js";
import { tokenAction } from "./actions/token.js";
import { Helpers } from "./helpers.js";

export const documentation = "https://materialfoundry.github.io/MaterialDeck_PF2e/";

Hooks.once('MaterialDeck_Ready', () => {
    Helpers.rollModifier = new materialDeck.Helpers.ModeSwitcher('normal', 'mdUpdateRollModifier');
    Helpers.rollType = new materialDeck.Helpers.ModeSwitcher('strike', 'mdUpdateRollType');

    const moduleData = game.modules.get('materialdeck-pf2e');

    const systemId = game.system.id === "sf2e" ? "sf2e" : "pf2e";

    materialDeck.registerSystem({
        systemId,
        moduleId: 'materialdeck-pf2e',
        systemName: 'Pathfinder 2e/Starfinder 2e',
        version: moduleData.version,
        manifest: moduleData.manifest,
        documentation,
        actions: [
            tokenAction,
            otherAction,
            combatTrackerAction
        ]
    });
});