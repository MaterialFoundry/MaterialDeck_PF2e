let rollModifier = 'dialog';
let rollModifierDefault = 'none';
let rollType = 'description';
let rollTypeDefault = 'none';

export class Helpers {
    
    static localize(str, category='', formatData) {
        if (category === '') return game.i18n.format(`MATERIALDECK_PF2E.${str}`, formatData);
        else if (category === 'ALL') return game.i18n.format(str, formatData);
        else if (category === 'MD') return game.i18n.format(`MATERIALDECK.${str}`, formatData);
        else if (category === 'PF2E') return game.i18n.format(`PF2E.${str}`, formatData);
        return game.i18n.format(`MATERIALDECK_PF2E.${category}.${str}`, formatData);
    }

    static getImage(name, path=`modules/materialdeck-pf2e/img/`) {
        return path + name;
    }

    static getSpellTypes(includeCantrips=false, includeInnate=false) {
        const localize = (str) => Helpers.localize(str, "Token.TokenMode.Stats")
        let spellTypes = [];
        if (includeCantrips) spellTypes = [{ value: 'any', label: localize('Any')}, { value:'spell0', label: localize('Stats.Cantrip') }]
        spellTypes.push(...[
            { value:'spell1', label: localize('1stLevel') },
            { value:'spell2', label: localize('2ndLevel') },
            { value:'spell3', label: localize('3rdLevel') },
            { value:'spell4', label: localize('4thLevel') },
            { value:'spell5', label: localize('5thLevel') },
            { value:'spell6', label: localize('6thLevel') },
            { value:'spell7', label: localize('7thLevel') },
            { value:'spell8', label: localize('8thLevel') },
            { value:'spell9', label: localize('9thLevel') },
        ])
        if (includeInnate) spellTypes.push({ value: 'innate', label: localize('SpellbookMode.Innate')})
        return spellTypes;
    }

    static isLimitedSheet(actor) {
        const limitedSheets = ['loot', 'vehicle'];
        return limitedSheets.includes(actor.type);
    }

    /**
     * Roll Modifiers
     */
    static getRollModifiers() {
        return [
            { value: 'dialog', label: Helpers.localize('Dialog') },
            { value: 'normal', label: Helpers.localize('Roll.Normal', 'PF2E') },
            { value: 'advantage', label: Helpers.localize('Roll.Fortune', 'PF2E') },
            { value: 'disadvantage', label: Helpers.localize('Roll.Misfortune', 'PF2E') }
        ]
    }

    static getRollModifier(reset=false) {
        const type = rollModifier;
        if (reset && rollModifierDefault !== 'none') Helpers.setRollModifier(rollModifierDefault, rollModifierDefault);
        return type;
    }
    
    static setRollModifier(mode, resetTo) {
        rollModifier = mode;
        rollModifierDefault = resetTo;
        Hooks.call('mdUpdateRollModifier');
    }

    /**
     * Roll Types
     */
    static getRollTypes() {
        return [
            { value: 'description', label: Helpers.localize('Description', 'ALL')},
            { value: 'strike', label: Helpers.localize('WeaponStrikeLabel', 'PF2E')},
            { value: 'map1', label: Helpers.localize('WeaponMAPLabel', 'PF2E') + '#1'},
            { value: 'map2', label: Helpers.localize('WeaponMAPLabel', 'PF2E') + '#2'},
            { value: 'damage', label: Helpers.localize('DamageLabel', 'PF2E')},
            { value: 'critical', label: Helpers.localize('CriticalDamageLabel', 'PF2E')},
            { value: 'use', label: Helpers.localize('Item.Consumable.Uses.Use', 'PF2E')}
        ]
    }

    static getRollTypeIcon() {
        return [
            { value: 'description', icon: 'fas fa-subtitles'},
            { value: 'strike', icon: 'fas fa-mace' },
            { value: 'map1', icon: ['fas fa-mace', 'fas fa-circle-exclamation'], iconSize: [0.9, 0.4], iconSpacing: [{x:-10, y:0}, {x:45, y:45}]},
            { value: 'map2', icon: ['fas fa-mace', 'fas fa-triangle-exclamation'], iconSize: [0.9, 0.4], iconSpacing: [{x:-10, y:0}, {x:45, y:45}]},
            { value: 'damage', icon: 'fas fa-face-head-bandage'},
            { value: 'critical', icon: ['fas fa-face-head-bandage','fas fa-star-exclamation'], iconSize: [0.8, 0.4], iconSpacing: [{x:-10, y:0}, {x:45, y:55}]},
            { value: 'use', icon: 'fas fa-flask'}
        ]
    }

    static getRollType(reset=false) {
        const type = rollType;
        if (reset && rollTypeDefault !== 'none') Helpers.setRollType(rollTypeDefault, rollTypeDefault);
        return type;
    }
    
    static setRollType(mode, resetTo) {
        rollType = mode;
        rollTypeDefault = resetTo;
        Hooks.call('mdUpdateRollType');
    }

    static async getItemDisplay(item, actor, displaySettings) {
        let text = "";
        let toHit = "";
        let damage = "";
        let range = "";
        
        if (displaySettings?.name) text = item.name;

        if (displaySettings && item.type === 'weapon') {
            const action = actor?.system?.actions?.find(a=>a.item?.name===item.name);

            //Get toHit
            toHit = action.totalModifier > 0 ? `+${action.totalModifier}` : action.totalModifier;

            //Get damage
            damage = `${item.system.damage.dice}${item.system.damage.die}`;
            if (item.system.bonusDamage.value > 0) damage += `+${item.system.bonusDamage.value}`
            else if (item.system.bonusDamage.value < 0) damage += `${item.system.bonusDamage.value}`

            //Get range
            if (item.system.range)
                range = Helpers.localize(`WeaponRange${item.system.range}`, 'PF2E');
        }
        else if (displaySettings && item.type === 'spell') {
            const isSave = item.system.defense?.save;

            //Get toHit
            if (isSave) {
                let label = `Saves${game.materialDeck.Helpers.capitalizeFirstLetter(item.system.defense.save.statistic)}Short`
                toHit = `${actor.system.attributes.spellDC.value}DC ${Helpers.localize(label, 'PF2E')}`
            }
            else if (item.system.defense) {
                for (let trait of item.system.traits.value) {
                    const classDC = actor.system.proficiencies.classDCs[trait];
                    if (classDC) toHit = classDC.totalModifier > 0 ? `+${classDC.totalModifier}` : classDC.totalModifier;
                }
            }

            let dmg = await item.getDamage();
            if (dmg?.template?.damage?.breakdown[0]) {
                let breakDown = dmg.template.damage.breakdown[0];
                let split = breakDown.split(' ');
                damage = breakDown.replace(` ${split[split.length-1]}`, '');
            }

            range = item.system.range.value;
        }

        if (displaySettings) {
            if (text !== '') text += '\n';
            if (displaySettings.toHit && toHit !== '') 
                text += toHit;
            if (displaySettings.damage && damage !== '') {
                if (displaySettings.toHit && damage !== '') text += ` (${damage})`;
                else text += damage;
            }
            if (displaySettings.range && range !== '') {
                if (displaySettings.toHit || displaySettings.damage) text += '\n';
                text += range;
            }
        }

        let options = {};

        if (displaySettings?.box === 'quantity') options.uses = { available: item.system.quantity, box: true }; 
        else if (displaySettings?.box === 'uses') {
            if (item.system.uses)
                options.uses = { available: item.system.uses.value, maximum: item.system.uses.max, box: true };
            else if (item.system.frequency)
                options.uses = { available: item.system.frequency.value, maximum: item.system.frequency.max, box: true };
        }
        else if (displaySettings?.box === 'toHit' && toHit !== '') options.uses = { text: toHit, box: true };
        else if (displaySettings?.box === 'damage' && damage !== '') options.uses = { text: damage, box: true };
        else if (displaySettings?.box === 'slots' && item.type === 'spell' && !item.isCantrip) {
            const spellcastingEntry = actor.spellcasting.collections.find(s => s.entry.spells.get(item.id))?.entry;
            const slot = spellcastingEntry.system.slots[`slot${item.rank}`];
            const prepared = slot.prepared.find(s => s.id === item.id);
            if (prepared)
                options.uses = { available: prepared.expended ? 0 : 1 , maximum: 1, box: true }
            else
                options.uses = { available: slot.value , maximum: slot.max, box: true }
        }

        return {
            text, 
            icon: displaySettings?.icon ? item.img : '', 
            options
        };
    }

    static async useItem(item, actor, settings) {
        const rollModifier = settings.rollModifier === 'default' ? Helpers.getRollModifier(true) : settings.rollModifier;
        const rollType = settings.rollType === 'default' ? Helpers.getRollType(true) : settings.rollType;

        if (rollType === 'description' && item.id !== "xxPF2ExUNARMEDxx") return game.pf2e.rollItemMacro(`Actor.${actor.id}.Item.${item.id}`);
        if (rollType === 'use') {
            if (!item.consume) return game.pf2e.rollItemMacro(`Actor.${actor.id}.Item.${item.id}`);
            return item.consume();
        }
        
        let strikeVariant = -1;
        if (rollType === 'strike') strikeVariant = 0;
        else if (rollType === 'map1') strikeVariant = 1;
        else if (rollType === 'map2') strikeVariant = 2;
    
        const action = actor?.system?.actions?.find(a=>a.item?.name===item.name);
        if (!action) return game.pf2e.rollItemMacro(`Actor.${actor.id}.Item.${item.id}`);
    
        const rollTwice = rollModifier === 'advantage' ? 'keep-higher' : rollModifier === 'disadvantage' ? 'keep-lower' : false;
        const skipDialog = rollModifier !== 'dialog';
        let oldShowCheckDialogsChanged = undefined;
    
        if (skipDialog && game.user.settings.showCheckDialogs) {
            oldShowCheckDialogsChanged = game.user.settings.showCheckDialogs;
            game.user.settings.showCheckDialogs = false;
        }
        else if (!skipDialog && !game.user.settings.showCheckDialogs) {
            oldShowCheckDialogsChanged = game.user.settings.showCheckDialogs;
            game.user.settings.showCheckDialogs = true;
        }
    
        //Strike, MAP1 or MAP2
        if (strikeVariant >= 0) 
            await action.variants[strikeVariant]?.roll({ rollTwice });
        
        //Damage
        else if (rollType === 'damage') 
            await action.damage();
    
        //Critical
        else if (rollType === 'critical') 
            await action.critical();
    
        if (oldShowCheckDialogsChanged !== undefined) 
            game.user.settings.showCheckDialogs = oldShowCheckDialogsChanged;
    }
    
    static sort(arr, mode='default') {
        if (mode === 'default') arr.sort((a, b) => a.sort - b.sort);
        else if (mode === 'alphabetically')
            arr.sort((a, b) => {
                const nA = a.name.toUpperCase();
                const nB = b.name.toUpperCase();

                if (nA < nB) return -1;
                if (nA > nB) return 1;
                return 0;
            })

        return arr;
    }
}