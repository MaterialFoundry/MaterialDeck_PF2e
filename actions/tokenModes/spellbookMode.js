import { Helpers } from "../../helpers.js"

function localize(str, category, formatData) {
    return Helpers.localize(str, category, formatData)
}

let spellbookOffset = 0;

export const spellbookMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'spellbook') continue;
                button.update('md-pf2e.updateAllTokenSpellbook')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        const holdTime = game.materialDeck.holdTime;

        const spellbookSettings = settings.spellbookMode;

        if (spellbookSettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }
        else if (spellbookSettings.mode === 'setSyncFilter') {
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
                run: this.onSpellbookUpdate,
                on: ['updateItem', 'refreshToken']
            });

            actions.keyDown.push({
                run: this.onSpellbookKeydown
            })
        }

        return actions;
    },

    onOffsetUpdate: function(data) {
            const settings = data.settings.spellbookMode.offset;
            let icon = '';
            if (data.settings.display.spellbookMode.offsetIcon) {
                if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
                else if (settings.value > 0) icon = 'fas fa-arrow-right';
                else if (settings.value < 0) icon = 'fas fa-arrow-left';
            }
            
            return {
                icon,
                text: data.settings.display.spellbookMode.offset ? spellbookOffset : '',
                options: {
                    border: true,
                    borderColor: (settings.mode === 'set' && spellbookOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
                }
            }
        },
    
    onOffsetKeydown: function(data) {
        const settings = data.settings.spellbookMode.offset;
        if (settings.mode === 'set') spellbookOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') spellbookOffset += parseInt(settings.value);

        spellbookMode.updateAll();
    },

    onSetSyncFilterUpdate: function(data) {
        const mode = data.settings.spellbookMode.setSync.mode;
        const displaySettings = data.settings.display.spellbookMode.setSync;

        let text = displaySettings.name ? getSpellTypes(true).find(t => t.value == mode)?.label : '';
        const thisSelected = game.materialDeck.Helpers.isSynced(data.settings.spellbookMode.setSync, 'spellbookMode.syncFilter', 'spellbookMode.',  'token');

        return {
            text,
            options: {
                border: true,
                borderColor: thisSelected ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
        
    },

    onSetSyncFilterKeydown: function(data) {
        const settings = data.settings.spellbookMode.setSync;

        let syncedSettings = [
            { key: 'spellbookMode.mode', value: settings.mode },
            { key: 'spellbookMode.selection.filter.preparation.prepared', value: settings.selection.filter.preparation.prepared },
            { key: 'spellbookMode.selection.filter.preparation.always', value: settings.selection.filter.preparation.always },
            { key: 'spellbookMode.selection.filter.preparation.innate', value: settings.selection.filter.preparation.innate },
            { key: 'spellbookMode.selection.filter.preparation.atwill', value: settings.selection.filter.preparation.atwill },
            { key: 'spellbookMode.selection.filter.preparation.ritual', value: settings.selection.filter.preparation.ritual },
            { key: 'spellbookMode.selection.filter.preparation.pact', value: settings.selection.filter.preparation.pact },
        ]

        data.button.sendData({
            type: 'setPageSync',
            payload: {
                context: data.button.context,
                device: data.button.device.id,
                action: 'token',
                sync: 'spellbookMode.syncFilter',
                settings: syncedSettings
            }
        })
    },

    onSpellbookUpdate: function(data) {
        const settings = data.settings.spellbookMode;
        const spell = getSpell(data.actor, settings);
       
        if (data.hooks === 'updateItem' && data.args[0].id !== spell.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== token.id) return 'doNothing';

        if (!spell) return;

        const displaySettings = data.settings.display.spellbookMode;
        return Helpers.getItemDisplay(spell, data.actor, displaySettings);
    },

    onSpellbookKeydown: function(data) {
        const settings = data.settings.spellbookMode;
        const spell = getSpell(data.actor, settings);
        if (!spell) return;
        const spellcastingEntry = data.actor.spellcasting.collections.find(s => s.entry.spells.get(spell.id))?.entry;
        spellcastingEntry.cast(spell);
    },

    getSelectionSettings(type='', sync='spellbookMode.syncFilter') {
        let modeOptions = [];
        if (type === '') 
            modeOptions = [ 
                { label: localize("TYPES.Item.spell", "ALL"), children: getSpellTypes(true, true) },
                { value: 'setSyncFilter', label: localize('SetTypeAndFilterSync') },
                { value: 'offset', label: localize('Offset', 'MD') }
            ]
        else modeOptions = getSpellTypes(true)

        return [{
            label: localize('SpellType'),
            id: `spellbookMode${type}.mode`,
            type: "select",
            default: "any",
            sync,
            options: modeOptions
        }]
    },

    getSettings() {
        return [
            ...spellbookMode.getSelectionSettings(),
            {
                label: localize('SyncTypeAndFilter'),
                id: 'spellbookMode.syncFilter',
                type: 'checkbox',
                indent: true,
                visibility: { 
                    hideOn: [ 
                        { [`spellbookMode.mode`]: "offset" },
                        { [`spellbookMode.mode`]: "setSyncFilter" } 
                    ] 
                },
            },{
                id: `spellbookMode-selection-wrapper`,
                type: "wrapper",
                visibility: { hideOn: [ 
                    { [`spellbookMode.mode`]: "offset" },
                    { [`spellbookMode.mode`]: "setSyncFilter" }  
                    ] 
                },
                settings: [
                    {
                        type: "line-right"
                    },{
                        label: localize("Selection", "MD"),
                        id: "spellbookMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("Nr", "MD"),
                        id: "spellbookMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "spellbookMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nameId" } ] }
                    }
                ]
            },{
                type: "line-right"
            },{
                id: `spellbookMode-item-wrapper`,
                type: "wrapper",
                visibility: { hideOn: [ 
                    { [`spellbookMode.mode`]: "offset" },
                    { [`spellbookMode.mode`]: "setSyncFilter" } 
                ] },
                settings: [
                    {
                        label: localize("Display", "MD"),
                        id: "spellbookMode-display-table",
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
                                    id: "display.spellbookMode.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.spellbookMode.name",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.spellbookMode.box",
                                    type: "select",
                                    default: "none",
                                    options: [
                                        { value: 'none', label: localize('None', 'ALL') },
                                        { value: 'slots', label: localize('SpellSlots') },
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
                                    id: "display.spellbookMode.toHit",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.spellbookMode.damage",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.spellbookMode.range",
                                    type: "checkbox",
                                    default: false
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `spellbookMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`spellbookMode.mode`]: "offset" } ] },
                settings: [
                    {
                        label: localize("Offset", "MD"),
                        id: "spellbookMode.offset.mode",
                        type: "select",
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "MD"),
                        id: "spellbookMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "spellbookMode-offset-display-table",
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
                                    id: "display.spellbookMode.offsetIcon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.spellbookMode.offset",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `spellbookMode-setSync-wrapper`,
                type: "wrapper",
                indent: "true",
                visibility: { showOn: [ { [`spellbookMode.mode`]: "setSyncFilter" } ] },
                settings: [
                    ...spellbookMode.getSelectionSettings('.setSync', undefined),
                    {
                        label: localize("Display", "MD"),
                        id: "spellbookMode-setSync-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Name", "ALL") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.spellbookMode.setSync.name",
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

function getSpellTypes(includeCantrips=false) {
    let spellTypes = [];
    if (includeCantrips) spellTypes = [{ value: 'any', label: localize('Any')}, { value: 0, label: localize('TraitCantrip', 'PF2E') }]

    const pluralRules = new Intl.PluralRules(game.i18n.lang, { type: "ordinal" });

    for (let i=1; i<10; i++) {
        let suffix = localize(`OrdinalSuffixes.${pluralRules.select(i)}`, 'PF2E');
        spellTypes.push( {value: i, label: i + localize('Item.Spell.Rank.Ordinal', 'PF2E', {rank: suffix})} );
    }

    return spellTypes;
}

function getSpell(actor, settings) {
    let spells = actor.itemTypes['spell']

    const mode = settings.mode;
    //Filter spells
    if (mode == 0) spells = spells.filter(s => s.isCantrip);
    else if (mode !== 'any') spells = spells.filter(s => s.system.level.value == mode && !s.isCantrip);

    let spell;
    if (settings.selection.mode === 'nr') {
        let spellNr = parseInt(settings.selection.nr) - 1 + spellbookOffset;
        spell = spells[spellNr];
    }
    else if (settings.selection.mode === 'nameId') {
        spell = spells.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!spell) spell = spells.find(i => i.name === settings.selection.nameId);
        if (!spell) spell = spells.find(i => game.materialDeck.Helpers.stringIncludes(i.name,settings.selection.nameId));
    }

    return spell;
}

function castSpell(spell, settings) {
    const rollModifier = settings.rollModifier === 'default' ? Helpers.getRollModifier(true) : settings.rollModifier;
    const rollType = settings.rollType === 'default' ? Helpers.getRollType(true) : settings.rollType;

    return;

    //Get the cast level
    let castLevel = settings.castAt;
    if (castLevel === 'spellLevel') castLevel = undefined;
    else if (castLevel === 'maxLevel') {
        const spellSlots = data.actor.system.spells;
        for (let i=9; i>1; i--) {
            if (spellSlots[`spell${i}`].max !== 0) {
                castLevel = `spell${i}`;
                break;
            }
        }
    }
    else if (castLevel === 'maxAvailable') {
        const spellSlots = data.actor.system.spells;
        for (let i=9; i>1; i--) {
            if (spellSlots[`spell${i}`].value !== 0) {
                castLevel = `spell${i}`;
                break;
            }
        }
    }

    Helpers.useItem(spell, 
        {
            rollMode, 
            rollType,
            castLevel,
            consumeSlot: settings.consumeSlot,
            placeTemplate: settings.placeTemplate,
            concentration: settings.concentration
        }
    )
}