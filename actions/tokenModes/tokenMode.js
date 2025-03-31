import { Helpers } from "../../helpers.js";

function localize(str, category, formatData) {
    return Helpers.localize(str, category, formatData)
}

export const tokenMode = {

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        
        const stats = settings.tokenMode.stats.mode;

        if (stats === "HP" || stats === "TempHP") {
            actions.update.push({
                run: this.onUpdateHP,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === 'ShieldHP'){
            actions.update.push({
                run: this.onUpdateShieldHP,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "AC") {
            actions.update.push({
                run: this.onUpdateAC,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Speed") {
            actions.update.push({
                run: this.onUpdateSpeed,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Init") {
            actions.update.push({
                run: this.onUpdateInitiative,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Spellcasting") {
            actions.update.push({
                run: this.onUpdateSpellcasting,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Ability" || stats === "AbilityMod") {
            actions.update.push({
                run: this.onUpdateAbility,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Save") {
            actions.update.push({
                run: this.onUpdateSave,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Skill") {
            actions.update.push({
                run: this.onUpdateSkill,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "XP") {
            actions.update.push({
                run: this.onUpdateXP,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }

        const onPress = settings.tokenMode.keyUp?.mode;
        const onHold = settings.tokenMode.hold?.mode;
        const holdTime = game.materialDeck.holdTime;

        if (onPress === 'condition') {
            actions.update.push({
                run: this.onUpdateConditions,
                on: ['applyTokenStatusEffect'],
                source: 'onPress'
            });
            actions.keyUp.push({
                run: this.onKeydownConditions,
                source: 'onPress',
                stopOnHold: true
            });
        }
        else if (onPress === 'roll') {
            actions.keyUp.push({
                run: this.onKeydownRoll,
                source: 'onPress',
                stopOnHold: true
            });
        }

        if (onHold === 'condition') {
            actions.hold.push({
                run: this.onKeydownConditions,
                delay: holdTime,
                source: 'onPress'
            });
        }
        else if (onHold === 'roll') {
            actions.hold.push({
                run: this.onKeydownRoll,
                delay: holdTime,
                source: 'onPress'
            });
        }

        return actions;
    },

    /****************************************************************
     * Stats
     ****************************************************************/
    onUpdateHP: function(data) {
        const settings = data.settings.tokenMode.stats;

        let text = "";
        let hp;

        if (data.actor) {
            hp = data.actor.system.attributes?.hp;
            if (hp && settings.mode === "HP" && settings.hp.mode === 'nr') 
                text += hp.value + "/" + hp.max;
            else if (hp && settings.mode === "TempHP")
                text += hp.temp !== null ? hp.temp : 0;
        }
        
        return {
            text, 
            icon: settings.mode === 'HP' && data.settings.display.icon === 'stats' ? Helpers.getImage("hp_empty.png") : "", 
            options: {
                uses: {
                    available: settings.mode !== "TempHP" ? hp?.value : hp?.temp,
                    maximum: settings.mode !== "TempHP" ? hp?.max : undefined,
                    heart: (settings.mode === 'HP' && data.settings.display.icon === 'stats') ? "#FF0000" : undefined,
                    box: settings.mode === "HP" && settings.hp.mode === 'box',
                    bar: settings.mode === "HP" && settings.hp.mode === 'bar'
                }
            }
        };
    },

    onUpdateShieldHP: function(data) {
        const shieldHp = data.actor?.system.attributes.shield?.hp
        return {
            text: shieldHp ? `${shieldHp.value}/${shieldHp.max}` : '', 
            icon: data.settings.display.icon === 'stats' ? 'icons/equipment/shield/heater-steel-worn.webp' : "", 
        };
    },

    onUpdateAC: function(data) {
        return {
            text: data.actor?.system.attributes.ac?.value || '', 
            icon: data.settings.display.icon == 'stats' ? 'icons/equipment/shield/heater-steel-worn.webp' : ''
        }
    },

    onUpdateSpeed: function(data) {
        let text = '';
        if (data.actor) {
            if (Helpers.isLimitedSheet(data.actor) || data.actor.type == 'hazard') {
                text = data.actor.type === 'vehicle' ? data.actor.system.details.speed : '';
            }
            else {
                text = `${data.actor.attributes.speed?.total}'`;
                const otherSpeeds = data.actor.attributes.speed?.otherSpeeds;
                if (otherSpeeds && otherSpeeds.length > 0)
                    for (let os of otherSpeeds) 
                        text += `\n${os.type} ${os.total}'`;   
            }
        }
        
        return{
            text, 
            icon: data.settings.display.icon === 'stats' ? 'icons/equipment/feet/shoes-collared-leather-blue.webp' : ""
        };
    },

    onUpdateInitiative: function(data) {
        let text = '';

        if (data.actor) {
            if (Helpers.isLimitedSheet(data.actor) || data.actor.type == 'familiar') text = '';
            else if (data.actor.type == 'hazard') {
                let initiative = data.actor.attributes?.stealth?.value;
                text = `Stealth (${initiative})`; 
            }
            else {
                let initiative = data.actor.initiative;
                let initiativeModifier = initiative?.mod;
                let initiativeLabel = initiative?.statistic.label; //Initiative is too long for the button
                if (initiativeModifier > 0) {
                    initiativeModifier = `+${initiativeModifier}`;
                } 
                else if (!Helpers.isLimitedSheet(data.actor) && data.actor.type !== 'hazard') {
                    let perception = data.actor.perception?.mod;
                    initiativeModifier = (perception >= 0) ? `+${perception}` : perception;
                } 
                
                if (initiativeLabel !== undefined) text = `${initiativeLabel} (${initiativeModifier})`;
            }
        }
        
        return{
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage("d20.png") : '',
            options: { dim: data.settings.display.icon === 'stats' }
        };
    },

    onUpdateSpellcasting: function(data) {
        const settings = data.settings.tokenMode.stats.spellcasting;
        let text = '';
        if (data.actor) {
            const system = data.actor.system;
            const spellDC = system.attributes.spellDC;
            if (spellDC) {
                if (settings.mode === 'ability') 
                    text = localize(CONFIG.PF2E.abilities[system.attributes.classDC?.attribute], 'ALL');
                else if (settings.mode === 'dc') 
                        text = system.attributes.spellDC.value;
                else if (settings.mode === 'modifier')  {
                    const mod = system.attributes.classDC?.totalModifier;
                    text = mod >= 0 ? `+${mod}` : mod
                }
            }
        }
        
        return {
            text,
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage("skills/arcana.png") : '',
            options: { dim: data.settings.display.icon == 'stats' }
        } 
    },

    onUpdateAbility: function(data) {
        const statsMode = data.settings.tokenMode.stats.mode;
        const ability = data.settings.tokenMode.stats.ability;

        let text = '';
        
        if (data.actor) {
            if (statsMode == "Ability") {
                if (Helpers.isLimitedSheet(data.actor) || data.actor.type == 'familiar') text = '';
                else text = data.actor.abilities?.[ability]?.mod*2 + 10;
            }
            else if (statsMode == "AbilityMod") {
                if (Helpers.isLimitedSheet(data.actor) || data.actor.type == 'hazard' || data.actor.type == 'familiar') text = '';
                const val = data.actor.abilities?.[ability]?.mod;
                text = (val >= 0) ? `+${val}` : val;
            }
        }
        
        return {
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage(`abilities/${ability == 'con' ? 'cons' : ability}.png`) : '', 
            options: { dim: data.settings.display.icon == 'stats' }
        };
    },

    onUpdateSave: function(data) {
        const save = data.settings.tokenMode.stats.save;
        let text = "";

        if (data.actor) {
            if (Helpers.isLimitedSheet(data.actor)) text = '';
            else {
                const val = data.actor.system.saves?.[save]?.value;
                text = (val >= 0) ? `+${val}` : val;
            }
        }
        
        return {
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage(`saves/${save}.png`) : '', 
            options: { dim: data.settings.display.icon == 'stats' }
        };
    },

    onUpdateSkill: function(data) {
        const skill = data.settings.tokenMode.stats.skill;
        let text = "";
        
        if (data.actor) {
            const val = data.actor.system.skills?.[skill].totalModifier;
            text += (val >= 0 ? "+" : "") + val;
        }
        
        return {
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage(`skills/${skill}.png`) : '', 
            options: { dim: data.settings.display.icon == 'stats' }
        };
    },

    onUpdateXP: function(data) {
        const settings = data.settings.tokenMode.stats;
        let text = '';
        const xp = data.actor?.system?.details?.xp;
        let available = 0;
        let maximum = 0;
        if (xp) {
            available = xp.value;
            maximum = xp.max;
            if (settings.hp.mode === 'nr') {
                text = maximum ? `${available}/${maximum}` : available;
            }
            if (!maximum) maximum = available;
        }
        
        return {
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage('progression.png') : '',
            options: { 
                dim: data.settings.display.icon == 'stats',
                uses: {
                    available,
                    maximum,
                    box: settings.hp.mode === 'box',
                    bar: settings.hp.mode === 'bar'
                }
            }
        }
    },

    /****************************************************************
     * On Press
     ****************************************************************/

    onUpdateConditions: function(data) {
        const settings = data.settings.tokenMode.keyUp.condition;
        if ((data.hook === 'createActiveEffect' || data.hook === 'deleteActiveEffect') && data.args[0].parent.id !== data.actor?.id) return 'doNothing';

        const conditionActive = getConditionActive(data.actor, settings.condition);
        const displayIcon = data.settings.display.icon === 'onPress';

        return {
            icon: displayIcon ? getConditionIcon(settings.condition) : '', 
            options: { 
                dim: displayIcon,
                border: true,
                borderColor: conditionActive ? data.settings.colors.system.on : data.settings.colors.system.Off
            }
        };
    },

    onKeydownConditions: async function(data) {
        if (!data.actor) return;
        const settings = data.settings.tokenMode[data.actionType]?.condition;
        if (settings.condition === 'removeAll')
            for( let condition of data.actor.conditions.active)
                condition.delete();
        else
            data.actor.toggleStatusEffect(settings.condition);
    },

    onKeydownRoll: function(data) {
        if (!data.actor) return;
        const settings = data.settings.tokenMode[data.actionType]?.roll;
        const rollModifier = settings.modifier === 'default' ? Helpers.getRollModifier(true) : settings.modifier;

        const skipDialog = rollModifier !== 'dialog';
        const rollTwice = rollModifier === 'advantage' ? 'keep-higher' : rollModifier === 'disadvantage' ? 'keep-lower' : false;

        if (settings.mode === 'initiative')
            return data.actor.rollInitiative({rerollInitiative: true, initiativeOptions: {skipDialog, rollTwice}});

        let slug;
        let type;
        let modifiers;

        if (settings.mode === 'save') {
            const save = settings.save;
            if (data.actor.type === 'hazard' && save === 'will') return;
            const name = save.charAt(0).toUpperCase() + save.slice(1);
            slug = `${name} Saving Throw`
            type = 'saving-throw';
            modifiers = data.actor.saves?.[save];
        }
        else if (settings.mode === 'skill') {
            const skill = settings.skill;
            let skillName = data.actor.system.skills?.[skill].label;
            skillName = skillName.charAt(0).toUpperCase() + skillName.slice(1);
            slug = `Skill Check: ${skillName}`;
            type = 'skill-check';
            modifiers = data.actor.skills?.[skill];
        }

        if (!slug || !type || !modifiers) return;

        game.pf2e.Check.roll(
            new game.pf2e.CheckModifier(slug, modifiers), 
            {
                type, 
                actor: data.actor, 
                skipDialog,
                rollTwice
            }, 
            null
        );
    },

    /****************************************************************
     * Get settings
     ****************************************************************/

    getSettings: function() {
        return [
            ...getTokenStats(),
            ...getTokenOnPress(),
            ...getTokenOnPress('hold'),
        ]
    }
}

export function getTokenStats() {
    return [
        {
            id: "tokenMode.stats.mode",
            appendOptions: [
                { value: 'HP', label: localize('HitPointsShortLabel', 'PF2E') },
                { value: 'TempHP', label: localize('TempHitPointsShortLabel', 'PF2E') },
                { value: 'ShieldHP', label: localize('Actor.Creature.Shield.HitPoints.Value', 'PF2E')},
                { value: 'AC', label: localize('ArmorClassShortLabel', 'PF2E') },
                { value: 'Speed', label: localize('Actor.Speed.Label', 'PF2E') },
                { value: 'Init', label: localize('InitiativeLabel', 'PF2E') },
                { value: 'Spellcasting', label: localize('TabSpellbookLabel', 'PF2E') },
                { value: 'Ability', label: localize('AbilityTitle', 'PF2E') },
                { value: 'AbilityMod', label: localize('AbilityModifierLabel', 'PF2E') },
                { value: 'Save', label: localize('SavingThrow', 'PF2E') },
                { value: 'Skill', label: localize('SkillLabel', 'PF2E') },
                { value: 'XP', label: localize('Encounter.XP', 'PF2E') }
            ]
        },{
            id: "pf2e-tokenMode-stats-wrapper",
            type: "wrapper",
            after: "tokenMode.stats.mode",
            indent: true,
            settings: [
                {
                    label: localize('Mode', 'MD'),
                    id: "tokenMode.stats.hp.mode",
                    type: "select",
                    options: [
                        {value:'nr', label: localize('Number', 'MD') },
                        {value:'box', label: `${localize('Box')}` },
                        {value:'bar', label: `${localize('Bar')}` }
                    ],
                    visibility: { showOn: [ 
                        { ["tokenMode.stats.mode"]: "HP" },
                        { ["tokenMode.stats.mode"]: "XP" } 
                    ] }
                },{
                    id: "pf2e-tokenMode-stats-spellCasting-wrapper",
                    type: "wrapper",
                    after: "stats",
                    visibility: { showOn: [ { ["tokenMode.stats.mode"]: "Spellcasting" } ] },
                    settings: [
                        {
                            label: localize('Mode', 'MD'),
                            id: "tokenMode.stats.spellcasting.mode",
                            type: "select",
                            options: [
                                { value: 'ability', label: localize('AbilityTitle', 'PF2E') },
                                { value: 'dc', label: localize('Check.DC.Unspecific', 'PF2E') },
                                { value: 'modifier', label: localize('ModifierTitle', 'PF2E') }
                            ]
                        }
                    ]
                },{
                    label: localize('AbilityTitle', 'PF2E'),
                    id: "tokenMode.stats.ability",
                    type: "select",
                    visibility: {
                        showOn: [
                            { ["tokenMode.stats.mode"]: "Ability" },
                            { ["tokenMode.stats.mode"]: "AbilityMod" }
                        ]
                    },
                    options: getAbilityList()
                },{
                    label: localize('Save'),
                    id: "tokenMode.stats.save",
                    type: "select",
                    visibility: {
                        showOn: [
                            { ["tokenMode.stats.mode"]: "Save" }
                        ]
                    },
                    options: getSavesList()
                },{
                    label: localize('SkillLabel', 'PF2E'),
                    id: "tokenMode.stats.skill",
                    type: "select",
                    visibility: { showOn: [ { ["tokenMode.stats.mode"]: "Skill" } ] },
                    options: getSkillList()
                }
            ]
        }
    ]
}

function getTokenOnPress(mode='keyUp') {
    return [
        {
            id: `tokenMode.${mode}.mode`,
            appendOptions: [
                { value: 'condition', label: localize('ToggleCondition') },
                { value: 'roll', label: localize('DiceRoll') }
            ]
        },{
            id: `5e-${mode}-wrapper`,
            type: "wrapper",
            after: `tokenMode.${mode}.mode`,
            indent: true,
            settings: [
                {
                    label: localize('TYPES.Item.condition', 'ALL'),
                    id: `tokenMode.${mode}.condition.condition`,
                    type: "select",
                    indent: true,
                    visibility: { showOn: [ { [`tokenMode.${mode}.mode`]: "condition" } ] },
                    options: [
                        { value: "removeAll", label: localize("RemoveAll") },
                        { label: localize('TYPES.Item.condition', 'ALL'), children: getConditionList() }
                    ]
                },{
                    id: `pf2e-${mode}-roll-wrapper`,
                    type: "wrapper",
                    indent: true,
                    visibility: { showOn: [ {[`tokenMode.${mode}.mode`]: "roll"} ] },
                    settings: [
                        {
                            label: "Roll",
                            id: `tokenMode.${mode}.roll.mode`,
                            type: "select",
                            options: [
                                {value: 'initiative', label: localize('InitiativeLabel', 'PF2E')},
                                {value:'save', label: localize('Save')},
                                {value:'skill', label: localize('SkillLabel', 'PF2E')}
                            ]
                        },{
                            label: localize('AbilityTitle', 'PF2E'),
                            id: `tokenMode.${mode}.roll.ability`,
                            type: "select",
                            indent: true,
                            visibility: { showOn: [ { [`tokenMode.${mode}.roll.mode`]: "ability" } ] },
                            options: getAbilityList()
                        },{
                            label: localize('Save'),
                            id: `tokenMode.${mode}.roll.save`,
                            type: "select",
                            indent: true,
                            visibility: { showOn: [ { [`tokenMode.${mode}.roll.mode`]: "save" } ] },
                            options: getSavesList()
                        },{
                            label: localize('SkillLabel', 'PF2E'),
                            id: `tokenMode.${mode}.roll.skill`,
                            type: "select",
                            indent: true,
                            visibility: { showOn: [ { [`tokenMode.${mode}.roll.mode`]: "skill" } ] },
                            options: getSkillList()
                        },{
                            label: localize('ModifierTitle', 'PF2E'),
                            id: `tokenMode.${mode}.roll.modifier`,
                            type: "select",
                            indent: true,
                            options: [
                                {value:'default', label: localize('Default', 'ALL')},
                                ...Helpers.getRollModifiers()
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

function getConditionIcon(condition) {
    if (condition == 'removeAll') 
        return window.CONFIG.controlIcons.effects;
    return CONFIG.statusEffects.find(e => e.id === condition).img;
}

function getConditionActive(actor, condition) {
    if (!actor) return false;
    if (condition === 'removeAll') 
        return actor.conditions.active.length > 0;
    
    return actor.conditions.active.find(c => c.rollOptionSlug === condition);
}

function getAbilityList() {
    let abilities = [];
    for (let key of Object.keys(CONFIG.PF2E.abilities)) 
        abilities.push({
            value: key, 
            label: localize(CONFIG.PF2E.abilities[key], 'ALL')
        })
    return abilities;
}

function getSavesList() {
    let saves = [];
    for (let key of Object.keys(CONFIG.PF2E.saves)) 
        saves.push({
            value: key, 
            label: localize(CONFIG.PF2E.saves[key], 'ALL')
        })
    return saves;
}

function getSkillList() {
    let skills = [];
    for (let key of Object.keys(CONFIG.PF2E.skills)) {
        skills.push({
            value: key, 
            label: localize(CONFIG.PF2E.skills[key].label, 'ALL')
        })
    }
    return skills;
}

function getConditionList() {
    let conditions = [];
    for (let c of CONFIG.statusEffects) 
        conditions.push({
            value: c.id, 
            label: localize(c.name, 'ALL')
        });
    return conditions;
}