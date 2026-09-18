var Menu = {
	blockClass: 'item',
	headClass: '.item h2',
	dataClass: 'danone'
};

Menu.init = function () {
	Menu.blocks = document.querySelectorAll('.' + Menu.blockClass);
	for(var i = 0; i < Menu.blocks.length; i++) {
		Menu.setPosition(Menu.blocks[i]);
		Menu.drawLine(Menu.blocks[i]);
	}
	window.addEventListener('resize', function () { Menu.onResize() });
}

Menu.setPosition = function (block) {
	if(!block) return;
	
	var data = block.querySelector('.' + this.dataClass);
	if(!data) return;
	data = JSON.parse(data.innerHTML);
	
	var pos = data.position;
	if(typeof pos != 'object' || !pos[0] || !pos[1]) {
		console.warn('Ошибка координат блока');
		return;
	}
	
	block.positionData = data;
	block.style.left = pos[0] + '%';
	block.style.top = pos[1] + '%';
}

Menu.drawLine = function (block) {
	if(!block || !block.positionData) return;
	var head = block.querySelector(this.headClass);
	if(!head) return;
	
	var pos = block.positionData.line;
	
	if(!pos) return;
	
	if(typeof pos != 'object' || !pos[0]) {
		console.warn('Ошибка при построении линии');
		return;
	}
	
	var holder = document.createElement('div');
	holder.className = 'line_holder';
	insertAfter(holder, head);
	
	var hLine = document.createElement('div');
	hLine.className = 'h_line';
	block.line = hLine;
	block.linePosition = pos;
	holder.appendChild(hLine);
	
	var vLine = document.createElement('div');
	hLine.line = vLine;
	vLine.className = 'v_line';
	hLine.appendChild(vLine);
	
	var dott = document.createElement('div');
	vLine.dott = dott;
	dott.className = 'dott';
	vLine.appendChild(dott);
	
	var dott = document.createElement('div');
	hLine.dott = dott;
	dott.className = 'dott';
	hLine.appendChild(dott);
	
	if(!pos[1]) {
		var height = block.parentNode.offsetHeight;
		pos[1] = ((block.offsetTop + holder.offsetTop) / height * 100).toFixed(4);
	}
	
	this.setLinePosition(block);
}

Menu.setLinePosition = function (block, _tObj) {
	if(!block.line) return;
	var pos = block.linePosition,
	    hLine = block.line,
	    vLine = hLine.line,
	    dott = vLine.dott,
		dott2 = hLine.dott,
	    width = block.parentNode.offsetWidth,
	    height = block.parentNode.offsetHeight,
		holder = hLine.parentNode;
	
	if(!_tObj) {
		var holderRect = holder.getBoundingClientRect(),
			sectionRect = block.parentNode.getBoundingClientRect(),
			blockLeft = holderRect.left,
			blockTop = holderRect.top - sectionRect.top;
	}
	else {
		var blockLeft = (block.offsetLeft + _tObj.x) * _tObj.scale;
		var blockTop = (block.offsetTop + _tObj.y) * _tObj.scale;
		width *= _tObj.scale;
		height *= _tObj.scale;
	}
	var lw = Math.floor(width * pos[0] / 100 - blockLeft);
	var lh = Math.floor(Math.floor(height * pos[1] / 100 - (blockTop)));
	
	var p = {};
	if(lh > 0 && lw > 0) {
		p.h = 'left';
		p.v = 'top';
	}
	else if(lh > 0 && lw <= 0) {
		p.h = 'right';
		p.v = 'top';
	}
	else if(lh <= 0 && lw > 0) {
		p.h = 'left';
		p.v = 'bottom';
	}
	else if(lh <= 0 && lw <= 0) {
		p.h = 'right';
		p.v = 'bottom';
	}
	else return;
	
	if(p.v == 'top') p.dy = 3;
	else p.dy = -3;
	if(p.h == 'left') p.d2x = -2;
	else p.d2x = 2;
	
	hLine.style[p.h] = 0;
	vLine.style[p.v] = 0;
	vLine.style[Menu.invert(p.h)] = 0;
	dott.style.left = 0;
	dott.style[Menu.invert(p.v)] = 0;
	dott2.style[p.h] = 0;
	dott2.style.top = 0;
	
	hLine.style[Menu.invert(p.h)] = '';
	vLine.style[Menu.invert(p.v)] = '';
	vLine.style[p.h] = '';
	dott.style[p.v] = '';
	dott2.style[Menu.invert(p.h)] = '';
	dott2.style[Menu.invert(p.v)] = '';
	
	dott.style.transform = 'translate(-2px, '+ p.dy +'px)';
	dott2.style.transform = 'translate('+ p.d2x +'px, -3px)';
	
	if(lw <= 0) lw = Math.abs(lw) + holder.offsetWidth;
	
	if(Math.abs(lw) < block.offsetWidth) holder.style.opacity = 0;
	else holder.style.opacity = 1;
	
	hLine.style.width = Math.abs(lw) + 'px';
	vLine.style.height = Math.abs(lh) + 'px';
}

Menu.invert = function invert(val) {
	if(val == 'top') return 'bottom';
	if(val == 'bottom') return 'top';
	if(val == 'left') return 'right';
	if(val == 'right') return 'left';
}

Menu.onResize = function () {
	for(var i = 0; i < this.blocks.length; i++) {
		this.setPosition(this.blocks[i]);
		this.setLinePosition(this.blocks[i]);
	}
}

Menu.coordsGetter = function () {
	window.addEventListener('click', function (e) {
		var scroll = document.body.scrollTop || document.documentElement.scrollTop;
		var target = e.target;
		while(target) {
			if(target.tagName == 'SECTION') break;
			target = target.parentNode;
		}
		
		if(!target) return;
		
		var rect = target.getBoundingClientRect();
		
		var x = ((e.clientX - rect.left) / rect.width * 100).toFixed(4);
		var y = ((e.clientY - rect.top) / rect.height * 100).toFixed(4);
		
		var div = document.createElement('div');
		div.innerHTML = x + ', ' + y;
		document.body.appendChild(div);
		var range = document.createRange();  
		range.selectNode(div);
		
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		document.execCommand('copy');
		document.body.removeChild(div);
	});
}

function insertAfter(block, after) {
	if(!after.parentNode) return;
	var next = after;
	while(next) {
		next = next.nextSibling;
		if(!next) break;
		if(next.nodeType == 1) break;
	}
	if(next) after.parentNode.insertBefore(block, next);
	else after.parentNode.appendChild(block);
}