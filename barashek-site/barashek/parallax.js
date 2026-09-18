function Parallax(pArray) {
	if(!pArray) {
		alert('Для параллакса необходимо передать массив фреймов');
		return;
	}
	this.parallaxArray = pArray;
	var _this = this;
	this.firstStart = true;
	if(this.entryList.length == 0) {
		this.setScrollHandler();
	}
	this.setEntry(this.animateFrame.bind(this));
	this.calcFrames();
	
	window.addEventListener('load', function () { _this.resize() }, false);
	window.addEventListener('resize', function () { _this.resize() }, false);
}

Parallax.prototype = {
	viewHeight: 1000, // абсолютная высота полотна
	entryList: [], // массив функций, которые вызываются по скроллу
	scrollArray: {prev: undefined, current: undefined}, // объект для определения направления скролла
	resizeTime: undefined, // время последнего ресайза для пересчёта размеров блоков
	minWidth: undefined, // ширина экрана, при которой отключается параллакс
	
	// установка обработчика события scroll
	setScrollHandler: function () {
		var _this = this;
		window.addEventListener('scroll', function (e) { _this.scrollHandler(e) }, false);
	},
	// добавление новой функции в обработчик скролла
	setEntry: function (func) {
		Parallax.prototype.entryList.push(func);
	},
	// обработчик скролла
	scrollHandler: function (e) {
		if(this.minWidth && this.minWidth >= document.body.offsetWidth) return;
		if(Parallax.pause) return;
		var scroll = document.body.scrollTop || document.documentElement.scrollTop;
		Parallax.prototype.scrollArray.prev = Parallax.prototype.scrollArray.current
		Parallax.prototype.scrollArray.current = scroll;
		var entryList = Parallax.prototype.entryList;
		for(var i = 0; i < entryList.length; i++) {
			entryList[i](scroll);
		}
	},
	// обработчик скролла для текущего объекта
	animateFrame: function (docScroll, rrr) {
		if(!this.parallaxArray || !this.viewHeight) {
			console.error('Указаны неверные конфигурации Parallax');
			return;
		}
		// рассчёт скролла относительно размера полотна
		
		var relScroll = docScroll / (document.body.scrollHeight - document.documentElement.clientHeight) * 100;
		var scroll = this.viewHeight * relScroll / 100;
		
		// Recompute in timeline order, including skipped frames. This handles
		// scrollbar dragging, PageDown, restored positions and fast scrolling.
		var ordered = Object.keys(this.parallaxArray).map(function(key) {
			return this.parallaxArray[key];
		}, this).sort(function(a, b) { return a._start - b._start; });
		for(var reset = ordered.length - 1; reset >= 0; reset--) {
			if(scroll < ordered[reset]._start) this.callAnimateHandler(ordered[reset], ordered[reset]._start);
		}
		for(var frame = 0; frame < ordered.length; frame++) {
			if(scroll >= ordered[frame]._start) this.callAnimateHandler(ordered[frame], Math.min(scroll, ordered[frame]._end));
		}
		this.firstStart = false;
	},
	// вызов обработчика фрейма
	callAnimateHandler: function (pObject, scroll) {
		var calcScroll = scroll - pObject._start; // абсолютный скролл от start до end
		var rScroll = calcScroll / (pObject._end - pObject._start) * 100; // относительный скролл от 0 до 100 в пределах текущего фрейма
		if(rScroll > 100) rScroll = 100;
		if(rScroll < 0) rScroll = 0;
		
		// рассчёт позиции через кубик Безье
		if(pObject.timing && pObject.timing != 'linear' && rScroll > 0 && rScroll < 100) {
			if(this.bezier.timing[pObject.timing]) rScroll = this.bezier.get(rScroll / 100, this.bezier.timing[pObject.timing]) * 100;
			else if(typeof pObject.timing == 'object') rScroll = this.bezier.get(rScroll / 100, pObject.timing) * 100;
		}
		
		pObject.func.call(this, rScroll, pObject, scroll);
	},
	// определение направления скролла
	getScrollDirection: function () {
		if(Parallax.prototype.scrollArray.current > Parallax.prototype.scrollArray.prev) return 'down';
		else if(Parallax.prototype.scrollArray.current < Parallax.prototype.scrollArray.prev) return 'up';
		else return false;
	},
	bezier: {
		ITERATIONS: 20, // число итераций для рассчёта времени от X
		// шаблоны времени
		timing: {
			'ease': 		[0.25, 0.1, 0.25, 1.0],
			'ease-in': 		[0.42, 0.0, 1.00, 1.0],
			'ease-out': 	[0.00, 0.0, 0.58, 1.0],
			'ease-in-out':	[0.42, 0.0, 0.58, 1.0]
		},
		// рассчёт координат по формуле кубика Безье
		calcBezier: function (t, p1, p2) {
			var res = 3 * t * Math.pow(1 - t, 2) * p1 + 3 * Math.pow(t, 2) * (1 - t) * p2 + Math.pow(t, 3);
			return res;
		},
		// рассчёт времени от X
		getTime: function (x, x1, x2) {
			var time = 0.5;
			var interval = 0.5;
			for(var i = 0; i < this.ITERATIONS; i++) {
				var tx = this.calcBezier(time, x1, x2);
				interval = interval / 2;
				if(tx > x) time -= interval;
				else if(tx < x) time += interval;
				else return time;
			}
			return time;
		},
		// получение Y от X на кривой Безье
		get: function (x, c) {
			var t = this.getTime(x, c[0], c[2]);
			var y = this.calcBezier(t, c[1], c[3]);
			return y;
		}
	},
	
	// выставление трансформа для элементов
	transform: function (elem, styles) {		if(!elem) return false;
		var propValue = [];
		var _tObj = {};
		for(var prop in styles) {
			var args = styles[prop];
			
			if(prop == 'translate') {
				var tr = this.getTranslate(elem, args, _tObj);
				if(tr) propValue.push(tr);
				continue;
			}
			
			propValue.push(prop + '(' + args.join(',') + ')');
		}
		elem.style[prefixes.Transform] = propValue.join(' ');
		return _tObj;
	},
	// генерирование translate элемента в пикселях
	getTranslate: function (elem, args, _tObj) {		if(!elem) return false;
		// если у элемента не пересчитаны размеры или произошел ресайз
		if(!elem._height || elem._resizeTime != this.resizeTime) {
			elem._height = elem.offsetHeight;
			elem._resizeTime = this.resizeTime;
		}
		if(!elem._width || elem._resizeTime != this.resizeTime) {
			elem._width = elem.offsetWidth;
			elem._resizeTime = this.resizeTime;
		}
		
		var x = args[0],
			y = args[1],
			z = args[2];
		
		var argsPx = [];
		
		if(x) argsPx.push(elem._width / 100 * x + 'px');
		else argsPx.push(0);
		if(y) argsPx.push(elem._height / 100 * y + 'px');
		else argsPx.push(0);
		if(z) argsPx.push(z + 'px');
		else argsPx.push(0);
		
		_tObj.x = parseFloat(argsPx[0]);
		_tObj.y = parseFloat(argsPx[1]);
		
		if(argsPx.length > 0) return 'translate3d('+ argsPx.join(',') +')';
		else return false;
	},
	// обработчик ресайза
	resize: function () {
		// установка нового времени ресайза
		this.resizeTime = (new Date()).getTime();
		// запуск пересчёта позиций всех блоков и их размеров
		this.firstStart = true;
		this.scrollHandler();
	},
	// расчёт времени начала и конца для каждого фрейма
	calcFrames: function () {
		for(var i in this.parallaxArray) {
			var pObject = this.parallaxArray[i];
			// если фрейм имеет фиксированные начало и конец
			if(pObject.start !== undefined && pObject.end !== undefined) {
				pObject._start = pObject.start;
				pObject._end = pObject.end;
			}
			// если фрейм привязан к родителю
			else if(pObject.parent !== undefined) {
				if(pObject.parent !== null && !this.parallaxArray[pObject.parent]) {
					console.warn('Фрейм '+ i +' ссылается на несуществующий объект');
					continue;
				}
				if(!pObject.duration) {
					console.warn('Для фрейма '+ i +' не указана продолжительность');
					continue;
				}
				
				var parentObject = pObject;
				pObject._duration = pObject.duration;
				pObject._waiting = 0;
				// перебор родителей и установка задержки для каждого фрейма
				while(parentObject) {
					// если родитель имеет время окончания
					if(parentObject.end !== undefined) {
						pObject._start = parentObject.end + pObject._waiting;
						pObject._end = parentObject.end + pObject._waiting + pObject.duration;
						if(parentObject.parent === null) parentObject.end = undefined;
						break;
					}
					// если есть родитель
					else if(parentObject.parent !== undefined) {
						if(parentObject.pause) pObject._waiting += parentObject.pause;
						if(parentObject.parent === null) parentObject.end = 0;
						else {
							if(parentObject == this.parallaxArray[parentObject.parent]) {
								console.warn('Фрейм '+ parentObject.parent +' не может ссылаться сам на себя');
								break;
							}
							parentObject = this.parallaxArray[parentObject.parent];
							var addWaiting = (parentObject.duration) ? parentObject.duration : 0;
							pObject._waiting += addWaiting;
						}
					}
					else {
						console.warn('Ошибка в родителях фрейма '+ i);
						break;
					}
				}
			}
			else {
				console.warn('Ошибка фрейма '+ i);
				continue;
			}
		}
	}
};