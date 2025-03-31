import { Helpers } from "../helpers.js";
import { tokenMode } from "./tokenModes/tokenMode.js";
import { inventoryMode } from "./tokenModes/inventoryMode.js";
import { spellbookMode } from "./tokenModes/spellbookMode.js";
import { actionsMode } from "./tokenModes/actionMode.js";

function localize(str, category) {
    return Helpers.localize(str, category)
}

export const tokenAction = {

    id: 'token',

    buttonActions: function(settings) {
        if (settings.mode === 'token') return tokenMode.getActions(settings);
        else if (settings.mode === 'actions') return actionsMode.getActions(settings);
        else if (settings.mode === 'inventory') return inventoryMode.getActions(settings);
        else if (settings.mode === 'spellbook') return spellbookMode.getActions(settings);

        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };

        return actions;
    },

    settingsConfig: function() {
        return [
            ...tokenMode.getSettings(),
            {
                id: "mode",
                appendOptions: [
                    { value: "actions", label: localize('ActionActionsLabel', 'PF2E') },
                    { value: "inventory", label: localize('TabInventoryLabel', 'PF2E') },
                    { value: "spellbook", label: localize('Item.Spell.Plural', 'PF2E') }
                ]
            },{
                id: "inventory-wrapper",
                type: "wrapper",
                after: "mode",
                visibility: { showOn: [ { mode: "inventory" } ] },
                indent: true,
                settings: inventoryMode.getSettings()
            },{
                id: "spellbook-wrapper",
                type: "wrapper",
                after: "mode",
                visibility: { showOn: [ { mode: "spellbook" } ] },
                indent: true,
                settings: spellbookMode.getSettings()
            },{
                id: "actions-wrapper",
                type: "wrapper",
                after: "mode",
                visibility: { showOn: [ { mode: "actions" } ] },
                indent: true,
                settings: actionsMode.getSettings()
            },{
                id: "colors-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { mode: "token", [`tokenMode.onPress.mode`]: "condition" },
                            { mode: "token", [`tokenMode.onHold.mode`]: "condition" },
                            { mode: "inventory", ['inventoryMode.mode']: "offset", [`inventoryMode.offset.mode`]: "set" },
                            { mode: "inventory", [`inventoryMode.onPress.mode`]: "equip" },
                            { mode: "features", ['featureMode.mode']: "offset", [`featureMode.offset.mode`]: "set" },
                            { mode: "spellbook", ['spellbookMode.mode']: "offset", [`spellbookMode.offset.mode`]: "set" },
                            { mode: "actions", ['actionMode.mode']: "offset", [`actionMode.offset.mode`]: "set" }
                        ]
                    },{ 
                        showOn: [ 
                            { mode: "token", [`tokenMode.onPress.mode`]: "condition" },
                            { mode: "token", [`tokenMode.onHold.mode`]: "condition" },
                            { mode: "inventory", ['inventoryMode.mode']: "offset", [`inventoryMode.offset.mode`]: "set" },
                            { mode: "inventory", [`inventoryMode.onPress.mode`]: "equip" },
                            { mode: "features", ['featureMode.mode']: "offset", [`featureMode.offset.mode`]: "set" },
                            { mode: "spellbook", ['spellbookMode.mode']: "offset", [`spellbookMode.offset.mode`]: "set" },
                            { mode: "actions", ['actionMode.mode']: "offset", [`actionMode.offset.mode`]: "set" }
                        ]
                    }
                ],
                prependColumns: [
                    {
                        label: localize("OnColor", "MD"),
                    },{
                        label: localize("OffColor", "MD"),
                    }
                ],
                prependRows: [
                    [
                        {
                            id: "colors.system.on",
                            type: "color",
                            default: "#FFFF00"
                        },{
                            id: "colors.system.off",
                            type: "color",
                            default: "#000000"
                        }
                    ]
                ]
            }
        ]
    }

}