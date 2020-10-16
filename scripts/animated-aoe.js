class AnimatedAoe {
	constructor() {
        game.settings.register("animated-aoe", "journalName", {
            name: "Name of the Animated Aoe Journal to use",
            hint: "The name of the journal entry to use for Animation JSON. There can only be one. Refer to README file in module website for how to configure triggers.",
            scope: "world",
            config: true,
            default: "Animated Aoe",
            type: String,
            onChange: this._parseJournals.bind(this)
        });
        game.settings.register("animated-aoe", "enableAnimatedAoe", {
            name: "Enable animations when running as GM",
            scope: "client",
            config: false,
            default: true,
            type: Boolean,
            onChange: this._parseJournals.bind(this)
        });
        Hooks.on("ready", this._parseJournals.bind(this));
        // Hooks.on("canvasReady", this._onCanvasReady.bind(this));
        // Hooks.on('controlToken', this._onControlToken.bind(this));
	Hooks.on('animateAoe', this._handleAnimateAoeEvent.bind(this));
        Hooks.on('createJournalEntry', this._parseJournals.bind(this));
        Hooks.on('updateJournalEntry', this._parseJournals.bind(this));
        Hooks.on('deleteJournalEntry', this._parseJournals.bind(this));
        // Hooks.on("preUpdateToken", this._onPreUpdateToken.bind(this));
        // Hooks.on("preUpdateWall", this._onPreUpdateWall.bind(this));

        this.animationManifest = {};
    }

    get journalName() {
        return game.settings.get("animated-aoe", "journalName") || "Animated Aoe";
    }
    get journals() {
        const folders = game.folders.entities.filter(f => f.type === "JournalEntry" && f.name === this.journalName);
        const journals = game.journal.entities.filter(j => j.name === this.journalName);
        // Make sure there are no duplicates (journal name is within a folder with the trigger name)
        return Array.from(new Set(this._getFoldersContentsRecursive(folders, journals)));
    }

    _getFoldersContentsRecursive(folders, contents) {
        return folders.reduce((contents, folder) => {
            // Cannot use folder.content and folder.children because they are set on populate and only show what the user can see
            const content = game.journal.entities.filter(j => j.data.folder === folder.id)
            const children = game.folders.entities.filter(f => f.type === "JournalEntry" && f.data.parent === folder.id)
            contents.push(...content)
            return this._getFoldersContentsRecursive(children, contents);
        }, contents);
    }

     _parseJournals() {
        this.animationManifest = []
        if (game.user.isGM && !game.settings.get("animated-aoe", "enableAnimatedAoe")){
            return;
        }
        this.journals.forEach(journal => this._parseJournal(journal));
    }

    _parseJournal(journal) {
        this.animationManifest = JSON.parse(journal.data.content.replace(/(<p>|<\/p>|<\/code>|<code>|<br *\/?>)/gm, '\n'))
        console.log(this.animationManifest);
    }

    _handleAnimateAoeEvent(manifestKey, stateAnimation) {
    	let animateAoeObject;
    	let manifestAnimation;
    	if(this.animationManifest?.[manifestKey]){
    		console.log('aoe event captured');
    		manifestAnimation = this.animationManifest[manifestKey];
    		animateAoeObject = this._extendAnimationWithState({stateAnimation, manifestAnimation});
    	}
    	console.log(animateAoeObject);
    	return false;
    }

    _extendAnimationWithState({
    	stateAnimation,
    	manifestAnimation,
    }) {
    	const totalDuration = stateAnimation.totalDuration || manifestAnimation.totalDuration;
    	const stateLights = stateAnimation.lights || [];
    	const animationLights = manifestAnimation.lights || [];
    	const stateSounds = stateAnimation.sounds || [];
    	const animationSounds = manifestAnimation.sounds || [];
    	const mergedLights = animationLights.map((animationLight, index)=> {
    		return {
    			light : {
    				t: stateLights?.[index]?.t || animationLight.t || 'l',
	    			x: stateLights?.[index]?.x || animationLight.x || 1000,
	    			y: stateLights?.[index]?.y || animationLight.y || 1000,
	    			rotation: stateLights?.[index]?.rotation || animationLight.rotation || 0,
	    			dim: stateLights?.[index]?.dim || animationLight.dim || 0,
	    			bright: stateLights?.[index]?.bright || animationLight.bright || 0,
	    			angle: stateLights?.[index]?.angle || animationLight.angle || 360,
	    			tintColor: stateLights?.[index]?.tintColor || animationLight.tintColor || '#cccccc',
	    			tintAlpha: stateLights?.[index]?.tintAlpha || animationLight.tintAlpha || 0.5,
	    			lightAnimation: {
	    				type: stateLights?.[index]?.lightAnimation?.type || animationLight?.lightAnimation?.type || 'fog',
	    				speed: stateLights?.[index]?.lightAnimation?.speed || animationLight?.lightAnimation?.speed || 5,
	    				intensity: stateLights?.[index]?.lightAnimation?.intensity || animationLight?.lightAnimation?.intensity || 5
	    			}
    			},
    			duration : stateLights?.[index]?.duration || animationLight.duration,
    			delay : stateLights?.[index]?.delay || animationLight.delay
    		}
    	})
    	const mergedSounds = animationSounds.map((animationSound, index)=> {
    		return {
    			sound : {
    				t: stateSounds?.[index]?.t || animationSound.t || 'l',
	    			x: stateSounds?.[index]?.x || animationSound.x || 1000,
	    			y: stateSounds?.[index]?.y || animationSound.y || 1000,
	    			radius: stateSounds?.[index]?.radius || animationSound.radius || 50,
	    			volume: stateSounds?.[index]?.volume || animationSound.volume || 0.5,
	    			path: stateSounds?.[index]?.path || animationSound.path || '',
    			},
    			duration : stateSounds?.[index]?.duration || animationSound.duration,
    			delay : stateSounds?.[index]?.delay || animationSound.delay
    		}
    	})
    	return this._animateAoe({totalDuration, lights: mergedLights, sounds: mergedSounds, delay: null});
    };

    _helperTimeout(interval) {
	  return new Promise((resolve, reject) => {
	    setTimeout(function(){
	      resolve("done");
	    }, interval);
	  });
	};

    async _animateAoe({
    	totalDuration,
    	lights,
    	sounds,
    	delay = 0
    }) {
    	if(delay && delay > 0) {
    		await this._helperTimeout(delay);
    	}
    	let deadline;
    	if(totalDuration){
    		deadline = this._helperTimeout(totalDuration);
    	}
    	const lightPromises = lights.map((light)=>{
    		return AmbientLight.create({
    			...light.light
    		});
    	});
    	const soundPromises = sounds.map((sound)=>{
    		return AmbientSound.create({
    			...sound.sound
    		});
    	});
    	let lightObjects = Promise.all(lightPromises);
    	let soundObjects = Promise.all(soundPromises);
    	if (totalDuration) {
    		lightObjects = await lightObjects;
    		soundObjects = await soundObjects;
    		await deadline;
    		lightObjects.map((lightObject) => {
    			return lightObject.delete();
    		});
    		soundObjects.map((soundObject) => {
    			return soundObject.delete();
    		});
    	}
    	
    }
}

Hooks.on('init', () => game.animatedAoe = new AnimatedAoe());
