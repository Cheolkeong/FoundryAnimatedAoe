class AnimatedAoe {
	constructor() {
        game.settings.register("animated-aoe", "journalName", {
            name: "Name of the Animated Aoe Journal to use",
            hint: "The name of the journal entry to use for Animation JSON. There can only be one. Refer to README file in module website for how to configure triggers.",
            scope: "world",
            config: true,
            default: "Trigger Happy",
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
}

Hooks.on('init', () => game.animatedAoe = new AnimatedAoe());
