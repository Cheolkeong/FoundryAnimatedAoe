class SceneHelper {
	constructor(){
	}

    getTokenByName(tokenName) {
        return canvas.scene.data.tokens.filter((token) => {
            return token.name === tokenName;
        })[0];
    }
	
}

export default SceneHelper;
