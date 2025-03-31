# Other Actions

3 new functions are added to 'Other Actions':

* [Set Default Roll Modifier](#set-default-roll-modifier)
* [Set Default Roll Type](#set-default-roll-type)

## Set Default Roll Modifier
Using this function you can change the 'default roll modifier'.<br>
This roll modifier is applied to rolls in the [Token Action](./token.md) if their `Roll Modifier` is set to `Default`.<br>

### Modifier
You can configure a button to set the modifier to:

* <b>Normal</b>: Perform a normal roll
* <b>Fortune</b>: Perform a roll with 'fortune' (roll twice, keep the highest)
* <b>Misfortune</b>: Perform a roll with 'misfortune' (roll twice, keep the lowest)

Say you have a 'Token Action' button set to:

* `Mode`: `Inventory`
* Selection options: Set to select a weapon
* `On Press`: `Use`
* `Show Dialog`: `False`
* `Roll Modifier`: `Default`

If you then press a 'Set Default Roll Modifier' button set to `Fortune` and then press the 'Token Action' button, the selected weapon will roll with fortune.<br>
Similarly, if you have the 'Set Default Roll Modifier' button set to `Misfortune` the weapon will roll with misfortune.

### Set After Use To
With this setting you can configure what the default roll mode should be set to after performing a roll.<br>
For example, you might want it to always default to normal rolls, so you set it to `Normal`.<br>
If you have multiple 'Set Default Roll Modifier' buttons on the display, their `Set After Use To` setting will be the same for all.

`Set After Use To` is only applied when something is rolled that actually uses the default roll modifier.

## Set Default Roll Type
Using this function you can change the 'default roll type'.<br>
This roll type is applied to rolls in the [Token Action](./token.md) if their `Roll Type` is set to `Default`.<br>

### Type
You can configure a button to set the type to:

* <b>Default</b>: Perform a default roll, which for, for example, weapons, means an attack roll (with dialog)
* <b>Strike</b>: Perform a strike roll
* <b>Multiple Attack Penalty #1</b>: Perform a strike roll with multiple attack penalty
* <b>Multiple Attack Penalty #2</b>: Perform a strike roll with multiple attack penalty
* <b>Damage</b>: Perform a damage roll
* <b>Critial</b>: Perform a critical damage roll
* <b>Use</b>: Perform a use roll

Say you have a 'Token Action' button set to:

* `Mode`: `Inventory`
* Selection options: Set to select a weapon
* `On Press`: `Use`
* `Show Dialog`: `False`
* `Roll Type`: `Default`

If you then press a 'Set Default Roll Type' button set to `Strike` and then press the 'Token Action' button, an strike roll will be performed for the weapon.<br>
Similarly, if you have the 'Set Default Roll Type' button set to `Damage` the roll will be a damage roll.

If the item you attempt to roll for is not able to perform a roll of the specified type, it will perform a default roll.

### Set After Use To
Functions the same as for [Set Default Roll Modifier](#set-after-use-to).