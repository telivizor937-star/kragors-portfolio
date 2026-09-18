if(!Element.remove) {
	Element.prototype.remove = function () {
		if(this.parentNode) this.parentNode.removeChild(this);
	};
}

function word(num, w1, w2, w5) {
	var decNum = Math.floor(num / 100);
	var end = num - decNum * 100;
	if(end >= 11 && end <= 19) return w5;
	decNum = Math.floor(num / 10);
	end = num - decNum * 10;
	if(end == 1) return w1;
	else if(end >= 2 && end <= 4) return w2;
	else return w5;
}

function SmoothMotion(handler) {
	this.handler = handler;
	this.animation._this = this;
}
SmoothMotion.prototype = {
	id: undefined,
	started: false,
	stopFlag: false,
	handler: undefined,
	newArray: [],
	currentArray: [],
	time: 0.7,
	start: function () {
		if(this.started) return;
		this.stopFlag = false;
		this.started = true;
		requestAnimationFrame(this.animation);
	},
	stop: function () {
		this.stopFlag = true;
		this.started = false;
	},
	animation: function () {
		var _this = arguments.callee._this;
		if(_this.stopFlag) return;
		if(_this.currentArray.length == 0) return;
		var steps = _this.time * 1000 / 60;
		for(var i = 0; i < _this.currentArray.length; i++) {
			if(!_this.newArray) break;
			var value = _this.currentArray[i];
			var newValue = _this.newArray[i];
			var speed = Math.abs((value - newValue) / steps);
			if(newValue > value) {
				value += speed;
				if(value > newValue) value = newValue;
			}
			else if(newValue < value) {
				value -= speed;
				if(value < newValue) value = newValue;
			}
			_this.currentArray[i] = value;
		}
		if(speed < 0.01) _this.stop();
		if(isNaN(speed)) _this.stop();
		_this.handler(_this.currentArray, speed);
		requestAnimationFrame(_this.animation);
	},
	setValues: function () {
		if(this.currentArray.length > 0) this.newArray = arguments;
		else this.currentArray = arguments;
	}
};
