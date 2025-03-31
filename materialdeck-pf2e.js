import { combatTrackerAction } from "./actions/combatTracker.js";
import { otherAction } from "./actions/other.js";
import { tokenAction } from "./actions/token.js";

export const documentation = "https://materialfoundry.github.io/MaterialDeck_PF2E/";

Hooks.once('MaterialDeck_Ready', () => {
    const moduleData = game.modules.get('materialdeck-pf2e');

    game.materialDeck.registerSystem({
        systemId: 'pf2e',
        moduleId: 'materialdeck-pf2e',
        systemName: 'Pathfinder 2e',
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