import { Helpers } from "../helpers.js"

const localize = Helpers.localize;

export const otherAction = {

    id: 'other',

    buttonActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [] };

        if (settings.function === 'setRollModifier') {
            actions.update.push({
                run: this.onUpdateRollModifier,
                on: ['mdUpdateRollModifier']
            })
            actions.keyDown.push({
                run: this.onKeypressRollModifier
            }) 
        }
        else if (settings.function === 'setRollType') {
            actions.update.push({
                run: this.onUpdateRollType,
                on: ['mdUpdateRollType']
            })
            actions.keyDown.push({
                run: this.onKeypressRollType
            }) 
        }
        
        return actions;
    },

    onUpdateRollModifier: function(data) {
        const mode = data.settings.rollModifier.mode;
        let text = "";
        if (data.settings.display.modeName) {
            text = Helpers.getRollModifiers().find(m => m.value === mode).label;
        }
        return {
            text,
            icon: data.settings.display.icon ? Helpers.getImage('d20.png') : "",
            options: {
                border: true,
                borderColor: Helpers.getRollModifier() === mode ? data.settings.colors.rollModeOn : data.settings.colors.rollModeOff,
                dim: true
            }
        };
    },

    onKeypressRollModifier: function(data) {
        Helpers.setRollModifier(data.settings.rollModifier.mode, data.settings.rollModifier.reset);
    },

    onUpdateRollType: function(data) {
        const mode = data.settings.rollType.mode;
        let text = "";
        let icon = "";
        let iconSize;
        let iconSpacing;
        if (data.settings.display.modeName) text = Helpers.getRollTypes().find(m => m.value === mode).label;
        if (data.settings.display.icon) {
            let iconData = Helpers.getRollTypeIcon().find(m => m.value === mode);
            iconSize = iconData.iconSize;
            iconSpacing = iconData.iconSpacing;
            icon = iconData.icon;
        }
        
        return {
            text,
            icon,
            options: {
                border: true,
                borderColor: Helpers.getRollType() === mode ? data.settings.colors.rollModeOn : data.settings.colors.rollModeOff,
                iconSize,
                iconSpacing
            }
        };
    },

    onKeypressRollType: function(data) {
        Helpers.setRollType(data.settings.rollType.mode, data.settings.rollType.reset);
    },

    settingsConfig: function() {
        return [
            {
                id: "function",
                link: "",
                appendOptions: [
                    { value: 'setRollModifier', label: Helpers.localize('SetRollModifier') },
                    { value: 'setRollType', label: Helpers.localize('SetRollType') }
                ]
            },{
                id: `rollModifier-wrapper`,
                type: "wrapper",
                indent: true,
                before: "pause.mode",
                visibility: { showOn: [{ function: "setRollModifier" }]},
                settings:[
                    {
                        id: "rollModifier.mode",
                        label: localize('Modifier'),
                        link: "",
                        type: "select",
                        options: Helpers.getRollModifiers()

                    },{
                        id: "rollModifier.reset",
                        label: localize('SetAfterUseTo'),
                        link: "",
                        type: "select",
                        indent: true,
                        sync: "rollModifier.pageWide",
                        options: [
                            { value: 'none', label: localize('NoChange') },
                            ...Helpers.getRollModifiers()
                        ]
                    },{
                        label: '',
                        id: "rollModifier.pageWide",
                        type: "checkbox",
                        default: true,
                        indent: true,
                        visibility: false
                    }
                ]
            },{
                id: `rollType-wrapper`,
                type: "wrapper",
                indent: true,
                before: "pause.mode",
                visibility: { showOn: [{ function: "setRollType" }]},
                settings:[
                    {
                        id: "rollType.mode",
                        label: localize('Type', 'MD'),
                        link: "",
                        type: "select",
                        options: Helpers.getRollTypes()

                    },{
                        id: "rollType.reset",
                        label: localize('SetAfterUseTo'),
                        link: "",
                        type: "select",
                        indent: true,
                        sync: "rollType.pageWide",
                        options: [
                            { value: 'none', label: localize('NoChange') },
                            ...Helpers.getRollTypes()
                        ]
                    },{
                        label: '',
                        id: "rollType.pageWide",
                        type: "checkbox",
                        default: true,
                        indent: true,
                        visibility: false
                    }
                ]
            },{
                id: "display-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { function: "setRollModifier" },
                            { function: "setRollMode" }
                        ]
                    }
                ],
                prependColumns: [
                    {
                        label: localize("Name", "ALL"),
                    }
                ],
                prependRows: [
                    [
                        {
                            id: "display.modeName",
                            type: "checkbox",
                            default: true
                        }
                    ]
                ]
            },{
                id: "colors-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { function: "setRollModifier" },
                            { function: "setRollMode" }
                        ]
                    },{ 
                        showOn: [ 
                            { function: "setRollModifier" },
                            { function: "setRollMode" }
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
                            id: "colors.rollModeOn",
                            type: "color",
                            default: "#FFFF00"
                        },{
                            id: "colors.rollModeOff",
                            type: "color",
                            default: "#000000"
                        }
                    ]
                ]
            }
        ]
    }
}