class TrigHelper {
	constructor(){
	}

	findRotation(originX, originY, targetX, targetY) {
		(this.radiansToDegrees(Math.atan2(targetX - originX, originY - targetY)) + 180) % 360
	}

	findAngle(width, originX, originY, targetX, targetY){
		let delta = this.findDistanceDelta(originX - targetX, originY - targetY);
		return 2 * this.radiansToDegrees(Math.atan((0.5 * width)/delta));
	}

	findDistanceDelta(deltaX, deltaY) {
		return Math.sqrt( (deltaX*deltaX) + (deltaY*deltaY) );
	}

	radiansToDegrees(theta) {
		return theta *(180/Math.PI);
	}
}

export default TrigHelper;
