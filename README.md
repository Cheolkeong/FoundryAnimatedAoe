# FoundryAnimatedAoe
For use in rigging up player and gm macros to punctuate spell and item effects with sounds and light animations.

![Demo Gif](demogif.gif)

# WARNING: THIS MODULE IS INCREDIBLY UNSTABLE AT THE MOMENT

# Vision
- The purpose of this module is to provide a framework for, among other things, allow players to produce visual and audio effects by using macros that send configuration sockets for lighting and sound to the gm. Tutorials and demos will be coming soon enough to help GM's that are newer to JS. Macros, animation configs, and sound assets not included, but I will be posting walkthroughs and providing boiler plate code and eventually helper functions.

## How to Use

Much of this is subject to change, but for anyone curious to tinker with this in its infancy, my current application for this module is as follows:

- **Establish an animation manifest in a journal, using JSON.** This is pretty much required. The module reads the manifest to know what colors, animations, etc go with each manifest key (e.g. `ColorSpray` ). These settings cut down on repetitive code in macros and allow you to update basic animation configurations in one place.

- **Create a macro for a PC's action.** The macro needs to take note of the players position and create an appropriately sized and positioned measuring template. The player can shift the measurement around, and in my case I immediately switch the player to the measurement view. I also use flags to keep track of metamagic in case the spell needs to be wider or originate from a familiar. The macro will create a `Hook.once` using the template data to listen for a `spellcast` event or whatever event you choose. Using a hook isn't always necessary, but is ideal for spells where placement and angle are important. You could, for instance, make an animation macros for a whooshing sound and brief swirling steel lighting on a token making some sort of cleave attack. This doesn't end up needing a hook OR a measurement template because there is nothing to aim and no choice to be made. But I digress.

- **Create a macro for confirmation.** Whether it's tossing a bomb or aiming burning hands, you need an easy way for the player to establish that they are ready for the animation to go off. The good news is, you really only need one total macro for this, and it can confirm all other PC Action macros for you with a simple `Hooks.call()`.

- **Now about that PC Action hook.** Once confirmed, the hook within the PC macro should use the template's positioning and other properties to finalize animation configurations. Any configurations set up here will override the settings in the animation manifest. For spells that are always circles of a given size, you really only need to pass in location for each light and sound.

These examples are also a work in progress, but here is an end to end example of a working pair of macros with an animation config.
Animation Manifest:
```
{
   "ColorSpray":{
      "lights":[
         {
            "t":"l",
            "dim":15,
            "bright":15,
            "angle":"90",
            "tintColor":"#016ba5",
            "tintAlpha":0.65,
            "lightAnimation":{
               "type":"chroma",
               "speed":10,
               "intensity":10
            }
         },
         {
            "t":"l",
            "dim":16,
            "bright":15,
            "angle":"90",
            "tintColor":"#ff852b",
            "tintAlpha":0.4,
            "lightAnimation":{
               "type":"sunburst",
               "speed":8,
               "intensity":4
            }
         },
         {
            "t":"l",
            "dim":17,
            "bright":16,
            "angle":"90",
            "tintColor":"#a001a5",
            "tintAlpha":0.4,
            "lightAnimation":{
               "type":"emanation",
               "speed":8,
               "intensity":6
            }
         }
      ],
      "sounds":[
         {
            "type":"l",
            "radius":60,
            "volume":0.5,
            "path":"macroSounds/HEALING%20SPELL%20-%20White%20Magic%20Light%20Throw%20Whoosh%2001%20%20%20%20%5B003701%5D.wav"
         },
         {
            "type":"l",
            "radius":60,
            "volume":0.5,
            "path":"macroSounds/SMALL%20LIQUID%20BLOWING%20UP%20EXPLOSION%20-%20Water%20Object%20Demolition%20Burst%20Shatter%20-%2001%20%20%20%20%5B004420%5D.wav"
         }
      ],
      "totalDuration":2000
   }
}
```

Action Macro:

```
// Color Spray Spell Macro

const CASTER_ID = 'zdecFFHkYWEqlH3X';

const SLOT = '1';

const SPELL_ID = "hdvOUt1mDuJSq7Rm";

const SPELL_LIST_ID = "r8r76MiHPKivI18L";


const getTokenByName = (tokenName) => {
	return canvas.scene.data.tokens.map((token, index) => {
		token.index = index;
		return token;
	}).filter((token) => {
		return token.name === tokenName;
	})[0];
};

const SHEET_ID = Object.keys(actor.apps).length && Object.keys(actor.apps)[0];

const widened = !!actor.getFlag('world', 'widenSpellActive');

(async () => {
if(!SHEET_ID) {
  ui.notifications.warn('Please open character sheet before using macros.');
  return;
}
game.pf2e.rollItemMacro("hdvOUt1mDuJSq7Rm");
let casterToken = actor.getFlag('world', 'familiarConduitActive') ? getTokenByName('Boo') : getTokenByName('Purry');

console.log(casterToken);
const areaOfEffect = await MeasuredTemplate.create({
  t: "cone",
  user: game.user._id,
  x: casterToken.x,
  y: casterToken.y,
  direction: 45,
  angle: 90,
  distance: 15,
  borderColor: "#09e7eb",
  fillColor: "#c803ff",
  texture: ""
});
const controlName = 'measure';
ui.controls.activeControl = controlName;
    const control = ui.controls.controls.find(c => c.name === controlName);
    if ( control && control.layer ) canvas.getLayer(control.layer).activate();

ui.notifications.info(`Drag the Icon to a corner of your token, then SHIFT + Scroll while hovered to rotate. Click Cancel or Cast when ready`);
if(widened) {
	ui.notifications.warn(`Spell cannot be widened. Cancel?`);
}

window.Hooks.once('spellcast', async ({successful}) => {
	if(successful) {
		const stateAnimation = {
			lights: [
				{
					x: areaOfEffect.data.x,
					y: areaOfEffect.data.y,
					rotation: (areaOfEffect.data.direction + 270) % 360
				},
				{
					x: areaOfEffect.data.x,
					y: areaOfEffect.data.y,
					rotation: (areaOfEffect.data.direction + 270) % 360
				},
				{
					x: areaOfEffect.data.x,
					y: areaOfEffect.data.y,
					rotation: (areaOfEffect.data.direction + 270) % 360
				}
			],
			sounds: [
				{
					x: areaOfEffect.data.x,
					y: areaOfEffect.data.y
				},
				{
					x: areaOfEffect.data.x,
					y: areaOfEffect.data.y
				}
			]
		};
		game.socket.emit('module.animatedAoe', {
			op: 'animate',
			user: game.user.id,
			manifestKey: 'ColorSpray',
			stateAnimation: stateAnimation
		})
		const firstPrepared = Object.values(actor.items.get(SPELL_LIST_ID).data.data.slots[`slot${SLOT}`].prepared).map((spell, index) => {
			return {id : spell.id, expended : spell.expended, index : index};
		}).filter((spell)=> {
			return (spell.id === SPELL_ID) && !spell.expended; 
		});

		if(firstPrepared.length) {
			let indexForUpdate = firstPrepared[0].index;
			actor.apps[SHEET_ID]._setExpendedPreparedSpellSlot(SLOT, indexForUpdate, SPELL_LIST_ID, true);
		}

	}

  	let wasDeleted = await areaOfEffect.delete();

	});

	actor.setFlag('world', 'castingSpell', true);
})();
```

Confirmation Macro:
```
// Cast Macro


const getTokenByName = (tokenName) => {
	return canvas.scene.data.tokens.map((token, index) => {
		token.index = index;
		return token;
	}).filter((token) => {
		return token.name === tokenName;
	})[0];
};

const getActorByName = (actorName) => {
	const token = getTokenByName(actorName);
	const myActorId = token.actorId;
	return game.actors.get(myActorId);
};

const controlName = 'token';
ui.controls.activeControl = controlName;
    const control = ui.controls.controls.find(c => c.name === controlName);
    if ( control && control.layer ) canvas.getLayer(control.layer).activate();

const purryToken = getTokenByName('Purry');
canvas.tokens.selectObjects({
x: purryToken.x - 1,
y: purryToken.y -1,
width: 257,
height: 257
});

Hooks.call('spellcast',{successful: true});

const purryActor = getActorByName('Purry')

purryActor.setFlag('world', 'widenSpellActive', false);
purryActor.setFlag('world', 'familiarConduitActive', false);
purryActor.setFlag('world', 'castingSpell', false);
```
