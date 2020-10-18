class TrigHelper {
	constructor(){
	}

	findRotation(originX, originY, targetX, targetY) {
		let baseAngle;
		let baseAngleX;
		let baseAngleY;
		let adjacentDistance;
		let oppositeDistance;
		let m;
		let b;
		const deltaX = targetX - originX;
		const deltaY = targetY - originY;
		if ((deltaX === 0) && (deltaY === 0)) {
			return 0;
		}
		if((deltaX <= 0) && (deltaY > 0)) {
			baseAngle = 0;
			if (!deltaX) {
				return baseAngle;
			}
			adjacentDistance = this.findDistanceDelta(deltaX, deltaY);
			m = (-deltaX/deltaY);
			b = targetY - (m * targetX);
			baseAngleX = originX;
			baseAngleY = m * originX + b;
			oppositeDistance = (baseAngleX - targetX, baseAngleY - targetY);
			return this.radiansToDegrees(Math.atan(oppositeDistance / adjacentDistance)) + baseAngle;
		}
		if((deltaX < 0) && (deltaY <= 0)) {
			baseAngle = 90;
			if (!deltaY) {
				return baseAngle;
			}
			adjacentDistance = this.findDistanceDelta(deltaX, deltaY);
			m = (-deltaX/deltaY);
			b = targetY - (m * targetX);
			baseAngleX = (originY - b)/m;
			baseAngleY = originY;
			oppositeDistance = (baseAngleX - targetX, baseAngleY - targetY);
			return this.radiansToDegrees(Math.atan(oppositeDistance / adjacentDistance)) + baseAngle;
		}
		if((deltaX >= 0) && (deltaY < 0)) {
			baseAngle = 180;
			if (!deltaX) {
				return baseAngle;
			}
			adjacentDistance = this.findDistanceDelta(deltaX, deltaY);
			m = (-deltaX/deltaY);
			b = targetY - (m * targetX);
			baseAngleX = originX;
			baseAngleY = m * originX + b;
			oppositeDistance = (baseAngleX - targetX, baseAngleY - targetY);
			return this.radiansToDegrees(Math.atan(oppositeDistance / adjacentDistance)) + baseAngle;
		}
		if((deltaX > 0) && (deltaY >= 0)) {
			baseAngle = 270;
			if (!deltaY) {
				return baseAngle;
			}
			adjacentDistance = this.findDistanceDelta(deltaX, deltaY);
			m = (-deltaX/deltaY);
			b = targetY - (m * targetX);
			baseAngleX = (originY - b)/m;
			baseAngleY = originY;
			oppositeDistance = (baseAngleX - targetX, baseAngleY - targetY);
			return this.radiansToDegrees(Math.atan(oppositeDistance / adjacentDistance)) + baseAngle;
		}
		return 0;
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
