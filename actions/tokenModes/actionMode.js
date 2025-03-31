import { Helpers } from "../../helpers.js";

function localize(str, category, formatData) {
    return Helpers.localize(str, category, formatData)
}

let actionsOffset = 0;

export const actionsMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'actions') continue;
                button.update('md-pf2e.updateAllTokenActions')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        
        const actionSettings = settings.actionMode;

        if (actionSettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }

        else {
            actions.update.push({
                run: this.onActionsUpdate,
                on: ['updateItem', 'refreshToken']
            })
    
            actions.keyUp.push({
                run: this.onKeypressUseItem
            });
        }
        
        
        return actions;
    },

    onOffsetUpdate: function(data) {
        const settings = data.settings.actionMode.offset;
        let icon = '';
        if (data.settings.display.actionMode.offsetIcon) {
            if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
            else if (settings.value > 0) icon = 'fas fa-arrow-right';
            else if (settings.value < 0) icon = 'fas fa-arrow-left';
        }
        
        return {
            icon,
            text: data.settings.display.actionMode.offset ? actionsOffset : '',
            options: {
                border: true,
                borderColor: (settings.mode === 'set' && actionsOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
    },

    onOffsetKeydown: function(data) {
        const settings = data.settings.actionMode.offset;
        if (settings.mode === 'set') actionsOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') actionsOffset += parseInt(settings.value);

        actionsMode.updateAll();
    },

    onActionsUpdate: function(data) {
        const item = getAction(data.actor, data.settings.actionMode);

        if (!item) return;

        if (data.hooks === 'updateItem' && data.args[0].id !== item.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== token.id) return 'doNothing';
        
        const displaySettings = data.settings.display.actionMode;
        return Helpers.getItemDisplay(item, data.actor, displaySettings);
    },

    onKeypressUseItem: function(data) {
        const item = getAction(data.actor, data.settings.actionMode);
        if (!item) return;
        Helpers.useItem(item, data.actor, data.settings.actionMode.keyUp)
    },

    

    /****************************************************************
     * Get settings
     ****************************************************************/

    getSettings: function() {
        return [
            {
                label: localize('ActionType'),
                id: "actionMode.mode",
                type: "select",
                default: "any",
                options: [
                    { label: localize('ActionTypeAction', 'PF2E'), children: getActionTypes()},
                    { value: 'offset', label: localize('Offset', 'MD') }
                ]
            },{
                id: `actionMode-item-wrapper`,
                type: "wrapper",
                visibility: { hideOn: [ { [`actionMode.mode`]: "offset" } ] },
                settings:
                [
                    {
                        type: "line-right"
                    },{
                        label: localize('Selection', "MD"),
                        id: "actionMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("Nr", "MD"),
                        id: "actionMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ['actionMode.selection.mode']: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "actionMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ['actionMode.selection.mode']: "nameId" } ] }
                    },{
                        type: "line-right"
                    },{
                        label: localize('RollType'),
                        id: `actionMode.keyUp.rollType`,
                        type: "select",
                        default: "default",
                        options: [
                            {value:'default', label: localize('Default', 'ALL')},
                            ...Helpers.getRollTypes()
                        ]
                    },{
                        label: localize('ModifierTitle', 'PF2E'),
                        id: `actionMode.keyUp.rollModifier`,
                        type: "select",
                        default: "default",
                        visibility: { 
                            hideOn: [ 
                                { [`actionMode.keyUp.rollType`]: "description" },
                                { [`actionMode.keyUp.rollType`]: "damage" },
                                { [`actionMode.keyUp.rollType`]: "critical" },
                                { [`actionMode.keyUp.rollType`]: "use" }
                            ] 
                        },
                        options: [
                            {value:'default', label: localize('Default', 'ALL')},
                            ...Helpers.getRollModifiers()
                        ]
                    },
                    {
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "actionMode-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Item.IconLabel", "PF2E") },
                            { label: localize("Name", "ALL") },
                            { label: localize("Box") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.actionMode.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.actionMode.name",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.actionMode.box",
                                    type: "select",
                                    default: "none",
                                    options: [
                                        { value: 'none', label: localize('None', 'ALL') },
                                        { value: 'uses', label: localize('Item.Consumable.Uses.Label', 'PF2E') },
                                        { value: 'toHit', label: localize('ToHit') },
                                        { value: 'damage', label: localize('DamageLabel', 'PF2E') }
                                    ]
                                }
                            ],[
                                { 
                                    type: "label", 
                                    label: localize("ToHit") + `&nbsp;&nbsp;`, 
                                    font: "bold" 
                                },{ 
                                    type: "label", 
                                    label: localize('DamageLabel', 'PF2E'), 
                                    font: "bold"
                                },
                                { 
                                    type: "label", 
                                    label: localize("RuleEditor.General.Range", "PF2E")  ,
                                    font: "bold"
                                }
                            ],[
                                {
                                    id: "display.actionMode.toHit",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.actionMode.damage",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.actionMode.range",
                                    type: "checkbox",
                                    default: false
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `actionMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`actionMode.mode`]: "offset" } ] },
                settings:
                [
                    {
                        type: "line-right"
                    },{
                        label: localize("Offset", "MD"),
                        id: "actionMode.offset.mode",
                        type: "select",
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "MD"),
                        id: "actionMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "actionMode-offset-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Item.IconLabel", "PF2E") },
                            { label: localize("Offset", "MD") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.actionMode.offsetIcon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.actionMode.offset",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            }
        ]
    }
}

const actionTypes = [
    { value: "attacks", label: "PF2E.AttackLabel" }, 
    { value: "action", label: "PF2E.ActionTypeAction" },
    { value: "reaction", label: "PF2E.ActionTypeReaction" }, 
    { value: "free", label: "PF2E.ActionTypeFree" }
];

function getActionTypes() {
    let types = [{value: 'any', label: localize('Any') }];
    for (let type of actionTypes)
        types.push({value: type.value, label: localize(type.label, "ALL")})

    return types;
}

function getAction(actor, settings) {
    
    let items = [];

    if (settings.mode === 'any') {
        for (let actorActions of actor.system.actions)
            items.push(actorActions.item)
        items.push(...actor.items.filter(i => actionTypes.find(a => a.value === i.system?.actionType?.value)));
        
    }
    else if (settings.mode === 'attacks') {
        for (let actorActions of actor.system.actions)
            items.push(actorActions.item)
    }
    else {
        items = actor.items.filter(i => i.system?.actionType?.value === settings.mode);
    }

    let item;
    if (settings.selection.mode === 'nr') {
        let itemNr = parseInt(settings.selection.nr) - 1 + actionsOffset;
        return items[itemNr];
    }
    else if (settings.selection.mode === 'nameId') {
        item = items.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!item) item = items.find(i => i.name === settings.selection.nameId);
        if (!item) item = items.find(i => game.materialDeck.Helpers.stringIncludes(i.name, settings.selection.nameId));
        return item;
    }

}