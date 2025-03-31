import { Helpers } from "../../helpers.js";

function localize(str, category, formatData) {
    return Helpers.localize(str, category, formatData)
}

let inventoryOffset = 0;

export const inventoryMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'inventory') continue;
                button.update('md-pf2e.updateAllTokenInventory')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        const holdTime = game.materialDeck.holdTime;

        const inventorySettings = settings.inventoryMode;

        if (inventorySettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }

        else if (inventorySettings.mode === 'setSyncFilter') {
            actions.update.push({
                run: this.onSetSyncFilterUpdate,
                on: ['md-token-PageSettingChanged']
            });
            actions.keyDown.push({
                run: this.onSetSyncFilterKeydown
            })
        }

        else {
            actions.update.push({
                run: this.onInventoryUpdate,
                on: ['updateItem', 'refreshToken']
            });

            const onPress = inventorySettings.keyUp.mode;
            const onHold = inventorySettings.hold.mode;
            
            if (onPress === 'useItem') {
                actions.keyUp.push({
                    run: this.onKeypressUseItem,
                    stopOnHold: true
                });
            }
            if (onHold === 'useItem') {
                actions.hold.push({
                    run: this.onKeypressUseItem,
                    delay: holdTime
                });
            }

            if (onPress === 'setCarryType') {
                actions.keyUp.push({
                    run: this.onKeypressSetCarryType,
                    stopOnHold: true
                });
            }
            if (onHold === 'setCarryType') {
                actions.hold.push({
                    run: this.onKeypressSetCarryType,
                    delay: holdTime
                });
            }
        }

        return actions;
    },

    onOffsetUpdate: function(data) {
        const settings = data.settings.inventoryMode.offset;
        let icon = '';
        if (data.settings.display.inventoryMode.offsetIcon) {
            if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
            else if (settings.value > 0) icon = 'fas fa-arrow-right';
            else if (settings.value < 0) icon = 'fas fa-arrow-left';
        }
        
        return {
            icon,
            text: data.settings.display.inventoryMode.offset ? inventoryOffset : '',
            options: {
                border: true,
                borderColor: (settings.mode === 'set' && inventoryOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
    },

    onOffsetKeydown: function(data) {
        const settings = data.settings.inventoryMode.offset;
        if (settings.mode === 'set') inventoryOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') inventoryOffset += parseInt(settings.value);

        inventoryMode.updateAll();
    },

    onSetSyncFilterUpdate: function(data) {
        const mode = data.settings.inventoryMode.setSync.mode;
        const displaySettings = data.settings.display.inventoryMode.setSync;

        let icon = '';
        if (displaySettings.icon) {
            if (mode === 'any') icon = 'fas fa-suitcase';
            else if (mode === 'weapon') icon = 'fas fa-sword';
            else if (mode === 'armor') icon = 'fas fa-shield';
            else if (mode === 'equipment') icon = 'fas fa-toolbox';
            else if (mode === 'consumable') icon = 'fas fa-flask';
            else if (mode === 'loot') icon = 'fas fa-gem';
            else if (mode === 'container') icon = 'fas fa-backpack';
            else if (mode === 'kit') icon = '';
        }
        
        let text = displaySettings.name ? getItemTypes().find(t => t.value === mode)?.label : '';
        const thisSelected = game.materialDeck.Helpers.isSynced(data.settings.inventoryMode.setSync, 'inventoryMode.syncFilter', 'inventoryMode.',  'token');

        return {
            text,
            icon,
            options: {
                border: true,
                borderColor: thisSelected ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
        
    },

    onSetSyncFilterKeydown: function(data) {
        const settings = data.settings.inventoryMode.setSync;

        let syncedSettings = [
            { key: 'inventoryMode.mode', value: settings.mode },
            { key: 'inventoryMode.selection.filter.held1', value: settings.selection.filter.held1 },
            { key: 'inventoryMode.selection.filter.held2', value: settings.selection.filter.held2 },
            { key: 'inventoryMode.selection.filter.worn', value: settings.selection.filter.worn },
            { key: 'inventoryMode.selection.filter.stowed', value: settings.selection.filter.stowed },
            { key: 'inventoryMode.selection.filter.dropped', value: settings.selection.filter.dropped },
        ]

        data.button.sendData({
            type: 'setPageSync',
            payload: {
                context: data.button.context,
                device: data.button.device.id,
                action: 'token',
                sync: 'inventoryMode.syncFilter',
                settings: syncedSettings
            }
        })
    },

    onInventoryUpdate: function(data) {
        const settings = data.settings.inventoryMode;
        const item = getItem(data.actor, settings);

        if (!item) return;

        if (data.hooks === 'updateItem' && data.args[0].id !== item.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== token.id) return 'doNothing';

        const displaySettings = data.settings.display.inventoryMode;
        return Helpers.getItemDisplay(item, data.actor, displaySettings);
    },

    onKeypressUseItem: function(data) {
        const settings = data.settings.inventoryMode;
        const onPressSettings = settings[data.actionType];
        const item = getItem(data.actor, settings);
        if (!item) return;
        Helpers.useItem(item, data.actor, onPressSettings)
    },

    onKeypressSetCarryType: function(data) {
        const settings = data.settings.inventoryMode;
        const carryType = settings[data.actionType]?.carryType;
        const item = getItem(data.actor, settings);
        if (!item) return;

        let equipped = {};
        if (carryType === 'held1') equipped = { carryType: 'held', handsHeld: 1 };
        else if (carryType === 'held2') equipped = { carryType: 'held', handsHeld: 2 };
        else equipped = { carryType, handsHeld: 0 };

        item.update({"system.equipped": equipped});
    },

    getSelectionSettings: function(type='', sync='inventoryMode.syncFilter') {
        let modeOptions = [];
        if (type === '') 
            modeOptions = [ 
                { label: localize("DOCUMENT.Item", "ALL"), children: getItemTypes()},
                { value: 'setSyncFilter', label: localize('SetTypeAndFilterSync') },
                { value: 'offset', label: localize('Offset', 'MD') }
            ]
        else modeOptions = getItemTypes();

        return [{
            label: localize('ItemType'),
            id: `inventoryMode${type}.mode`,
            type: "select",
            default: "any",
            sync,
            options: modeOptions
        },{
            label: localize("SelectionFilter"),
            id: "inventoryMode-selectionFilter-table",
            type: "table",
            visibility: { 
                hideOn: [ 
                    { [`inventoryMode.mode`]: "offset" },
                    { [`inventoryMode.mode`]: type === "" ? "setSyncFilter" : "" } 
                ] 
            },
            columns: 
            [
                { label: localize("CarryType.held1", "PF2E") },
                { label: localize("CarryType.held2", "PF2E") },
                { label: localize("CarryType.worn", "PF2E") },
                { label: localize("CarryType.stowed", "PF2E") },
                { label: localize("CarryType.dropped", "PF2E") }
            ],
            rows: 
            [
                [
                    { 
                        id: `inventoryMode${type}.selection.filter.held1`,
                        type: "checkbox",
                        default: true,
                        sync
                    },{ 
                        id: `inventoryMode${type}.selection.filter.held2`,
                        type: "checkbox",
                        default: true,
                        sync
                    },{ 
                        id: `inventoryMode${type}.selection.filter.worn`,
                        type: "checkbox",
                        default: true,
                        sync
                    },{ 
                        id: `inventoryMode${type}.selection.filter.stowed`,
                        type: "checkbox",
                        default: false,
                        sync
                    },{ 
                        id: `inventoryMode${type}.selection.filter.dropped`,
                        type: "checkbox",
                        default: true,
                        sync
                    }
                ]
            ]
        }]
    },

    getSettings: function() {
        return [
            ...inventoryMode.getSelectionSettings(),
            {
                label: localize('SyncTypeAndFilter'),
                id: 'inventoryMode.syncFilter',
                type: 'checkbox',
                indent: true,
                visibility: { 
                    hideOn: [ 
                        { [`inventoryMode.mode`]: "offset" },
                        { [`inventoryMode.mode`]: "setSyncFilter" } 
                    ] 
                },
            },{
                type: 'line-right'
            },{
                id: `inventoryMode-item-wrapper`,
                type: "wrapper",
                visibility: { 
                    hideOn: [ 
                        { [`inventoryMode.mode`]: "offset" },
                        { [`inventoryMode.mode`]: "setSyncFilter" } 
                    ] 
                },
                settings:
                [
                    {
                        label: localize("Selection", "MD"),
                        id: "inventoryMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("Order"),
                        id: "inventoryMode.selection.sort",
                        type: "select",
                        indent: true,
                        options: [
                            {value:'default', label: localize('CharacterSheet')},
                            {value:'alphabetically', label: localize('Alphabetically')}
                        ],
                        visibility: { showOn: [ { ["inventoryMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Nr", "MD"),
                        id: "inventoryMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ['inventoryMode.selection.mode']: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "inventoryMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ['inventoryMode.selection.mode']: "nameId" } ] }
                    },{
                        type: "line-right"
                    },
                    ...getItemOnPressSettings(),{
                        type: "line-right"
                    },
                    ...getItemOnPressSettings('hold'),
                    {
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "inventoryMode-display-table",
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
                                    id: "display.inventoryMode.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.name",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.box",
                                    type: "select",
                                    default: "none",
                                    options: [
                                        { value: 'none', label: localize('None', 'ALL') },
                                        { value: 'quantity', label: localize('QuantityLabel', 'PF2E') },
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
                                },{ 
                                    type: "label", 
                                    label: localize("RuleEditor.General.Range", "PF2E"),
                                    font: "bold"
                                }
                            ],[
                                {
                                    id: "display.inventoryMode.toHit",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.inventoryMode.damage",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.inventoryMode.range",
                                    type: "checkbox",
                                    default: false
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `inventoryMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`inventoryMode.mode`]: "offset" } ] },
                settings:
                [
                    {
                        type: "line-right"
                    },{
                        label: localize("Offset", "MD"),
                        id: "inventoryMode.offset.mode",
                        type: "select",
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "MD"),
                        id: "inventoryMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "inventoryMode-offset-display-table",
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
                                    id: "display.inventoryMode.offsetIcon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.offset",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `inventoryMode-setSync-wrapper`,
                type: "wrapper",
                indent: "true",
                visibility: { showOn: [ { [`inventoryMode.mode`]: "setSyncFilter" } ] },
                settings: [
                    ...inventoryMode.getSelectionSettings('.setSync', undefined),
                    {
                        type: 'line-right'
                    },{
                        label: localize("Display", "MD"),
                        id: "inventoryMode-setSync-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Icon", "MD") },
                            { label: localize("Name", "ALL") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.inventoryMode.setSync.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.setSync.name",
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

function getItemOnPressSettings(type='keyUp') {
    return [
        {
            label: localize(type=='keyUp' ? 'OnPress' : 'OnHold', 'MD'),
            id: `inventoryMode.${type}.mode`,
            type: "select",
            options: [
                { value: 'doNothing', label: localize('DoNothing', "MD") },
                { value: 'useItem', label: localize('UseItem') },
                { value: 'setCarryType', label: localize('Actor.Inventory.CarryType.OpenMenu', 'PF2E') }
            ]
        },{
            id: `inventoryMode-${type}-useItem-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [ { [`inventoryMode.${type}.mode`]: "useItem" } ] },
            settings:
            [
                {
                    label: localize('RollType'),
                    id: `inventoryMode.${type}.rollType`,
                    type: "select",
                    default: "default",
                    options: [
                        {value:'default', label: localize('Default', 'ALL')},
                        ...Helpers.getRollTypes()
                    ]
                },{
                    label: localize('RollModifier'),
                    id: `inventoryMode.${type}.rollModifier`,
                    type: "select",
                    default: "default",
                    visibility: { 
                        hideOn: [ 
                            { [`inventoryMode.${type}.rollType`]: "description" },
                            { [`inventoryMode.${type}.rollType`]: "damage" },
                            { [`inventoryMode.${type}.rollType`]: "critical" },
                            { [`inventoryMode.${type}.rollType`]: "use" }
                        ] 
                    },
                    options: [
                        {value:'default', label: localize('Default', 'ALL')},
                        ...Helpers.getRollModifiers()
                    ]
                }
            ]
        },{
            label: localize('Type', 'ALL'),
            id: `inventoryMode.${type}.carryType`,
            type: "select",
            indent: true,
            visibility: { showOn: [ { [`inventoryMode.${type}.mode`]: "setCarryType" } ] },
            options: [
                { value: 'held1', label: localize('CarryType.held1', 'PF2E') },
                { value: 'held2', label: localize('CarryType.held2', 'PF2E') },
                { value: 'worn', label: localize('CarryType.worn', 'PF2E') },
                { value: 'stowed', label: localize('CarryType.stowed', 'PF2E') },
                { value: 'dropped', label: localize('CarryType.dropped', 'PF2E') },
            ]
        },{
            id: `inventoryMode-${type}-setQuantity-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [{ [`inventoryMode.${type}.mode`]: "setQuantity" } ]},
            settings:
            [
                {
                    label: localize("Mode", "MD"),
                    id: `inventoryMode.${type}.setQuantity.mode`,
                    type: "select",
                    options: [
                        { value: "set", label: localize("SetToValue", "MD") },
                        { value: "increment", label: localize("Increase/Decrease", "MD") }
                    ]
                },{
                    label: localize("Value", "MD"),
                    id: `inventoryMode.${type}.setQuantity.value`,
                    type: "number",
                    step: "1",
                    default: "0"
                }
            ]
        },{
            id: `inventoryMode-${type}-setCharged-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [{ [`inventoryMode.${type}.mode`]: "setCharges" } ]},
            settings:
            [
                {
                    label: localize("Mode", "MD"),
                    id: `inventoryMode.${type}.setCharges.mode`,
                    type: "select",
                    options: [
                        { value: "reset", label: localize("Reset", "ALL") },
                        { value: "set", label: localize("SetToValue", "MD") },
                        { value: "increment", label: localize("Increase/Decrease", "MD") }
                    ]
                },{
                    label: localize("Value", "MD"),
                    id: `inventoryMode.${type}.setCharges.value`,
                    type: "number",
                    step: "1",
                    default: "0",
                    visibility: { hideOn: [{ [`inventoryMode.${type}.setCharges.mode`]: "reset" } ]}
                }
            ]
        }
    ]
}

const itemTypes = ["weapon", "shield", "armor", "equipment", "consumable", "treasure", "backpack", "kit"];

function getItem(actor, settings) {
    if (!actor) return;
    let items = [];
    
    for (let type of itemTypes) {
        if (settings.mode === 'any' || settings.mode === type)
            items.push(...Helpers.sort(actor.itemTypes[type]))
    }

    if (settings.selection.sort === 'alphabetically')
        items = Helpers.sort(items, 'alphabetically');

    const selectionFilter = settings.selection.filter;
    if (!selectionFilter.held1) items = items.filter(i => i.system.equipped?.carryType !== 'held' || i.system.equipped?.handsHeld !== 1);
    if (!selectionFilter.held2) items = items.filter(i => i.system.equipped?.carryType !== 'held' || i.system.equipped?.handsHeld !== 2);
    if (!selectionFilter.worn) items = items.filter(i => i.system.equipped?.carryType !== 'worn');
    if (!selectionFilter.stowed) items = items.filter(i => i.system.equipped?.carryType !== 'stowed');
    if (!selectionFilter.dropped) items = items.filter(i => i.system.equipped?.carryType !== 'dropped');

    let item;
    if (settings.selection.mode === 'nr') {
        let itemNr = parseInt(settings.selection.nr) - 1 + inventoryOffset;
        return items[itemNr];
    }
    else if (settings.selection.mode === 'nameId') {
        item = items.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!item) item = items.find(i => i.name === settings.selection.nameId);
        if (!item) item = items.find(i => game.materialDeck.Helpers.stringIncludes(i.name, settings.selection.nameId));
        return item;
    }
}

function getItemTypes() {
    const loc = (str) => localize(`TYPES.Item.${str}`, "ALL");

    let types = [{value: 'any', label: localize('Any') }];
    for (let type of itemTypes) {
        types.push({value: type, label: loc(type)})
    }

    return types;
}

