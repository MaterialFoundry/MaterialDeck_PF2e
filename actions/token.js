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
        let actions = { update: [], keyDown: [], keyUp: [], hold: [], dial: [] };
        if (settings.mode === 'token') actions = tokenMode.getActions(settings);
        else if (settings.mode === 'actions') actions = actionsMode.getActions(settings);
        else if (settings.mode === 'inventory') actions = inventoryMode.getActions(settings);
        else if (settings.mode === 'spellbook') actions = spellbookMode.getActions(settings);

        actions.update.push({
            run: this.updateWoundOverlay,
            on: ['updateActor', 'createToken', 'deleteToken'],
            source: 'always'
        })

        return actions;
    },

    updateWoundOverlay: function(data) {
        if (!data.actor) return;
        const settings = data.settings.overlay;
        if (!settings || settings.mode === "none") return;

        const hp = data.actor.system.attributes?.hp;
        const perc = hp.value/hp.max;

        const overlayData = materialDeck.overlays.get(settings.mode);

        let overlay = "null";
        for (let o of overlayData.overlays) {
            if (perc > o.value) continue;
            overlay = structuredClone(o);
            break;
        }

        if (overlay === "null") return;

        if (!overlay.color) overlay.color = settings.color;
        if (!overlay.alpha) overlay.alpha = settings.alpha;

        return {overlay}
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
                id: "overlay-wrapper",
                type: "wrapper",
                before: "color-wrapper",
                settings: [
                    {
                        id: "overlay-contents",
                        type: "wrapper",
                        label: "Wound Overlay",
                        expandable: true,
                        settings: [
                            {
                                label: localize('Overlays.Wound', 'MD'),
                                id: "overlay.mode",
                                type: "select",
                                options: [
                                    { value: "none", label: localize("None", "MD") },
                                    ...materialDeck.overlays.getList("wound")
                                ]
                            },{
                                label: localize('Opacity', 'MD'),
                                id: "overlay.alpha",
                                type: "range",
                                default: 0.6,
                                min: 0,
                                max: 1,
                                step: 0.05,
                                displayValue: true,
                                indent: true
                            },{
                                label: localize('Color', 'MD'),
                                id: "overlay.color",
                                type: "color",
                                default: "#FF0000",
                                indent: true
                            }
                        ]
                    },{
                        type: "line"
                    }
                ]
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