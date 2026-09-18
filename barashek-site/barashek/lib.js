

//============================================================

// Кроссбраузерное добавление и удаление класса
function addClass(el,class_name){
	if(el.className.indexOf(class_name) == -1){
		if(el.className === ""){
			el.className = class_name;
		}else{
			el.className += " "+class_name;
		}
	}
}

function removeClass(el,class_name){
	var cl = el.className;
	var ind = cl.indexOf(class_name);
	if(ind != -1){
		if(ind == 0){
			el.className = cl.substr(class_name.length+1,(cl.length-1));
		}else{
			el.className = cl.substr(0,ind-1) + cl.substr(ind+class_name.length,cl.length-1);
		}
	}
}

//============================================================

// Проверка префиксов и поддедержки 3d / 2d трансформа
function setPrefixes(){
	
	var props = ['Transform', 'TransformOrigin', 'Perspective', 'PerspectiveOrigin','Transition'];
	window.prfx = ['webkit','Webkit','moz','Moz','o','O','ms',"Ms"];
	var result = {};
	window.supTransform="";
	
	for(var i=0;i<props.length;i++){
		for(var j=0;j<prfx.length;j++){
			if(j==0){
				if( document.body.style[(((props[i]).charAt(0)).toLowerCase()) + props[i].substring(1,(props[i].length))] != undefined){
					result[props[i]] = ((((props[i]).charAt(0)).toLowerCase()) + props[i].substring(1,(props[i].length)));
					break;
				}
			}
			if(document.body.style[prfx[j]+props[i]] != undefined){
				result[props[i]] = prfx[j]+props[i];
				break;
			}
		}
	}
	
	window.prefixes = result;
	
if(prefixes.Perspective){
		supTransform="3d";
	}else if(prefixes.Transform){
		supTransform="2d";
	}else{
		supTransform="none";
	}
}
window.addEventListener("DOMContentLoaded",setPrefixes,false);

//============================================================

// loader		
function pageReady(){
	addClass(document.body,"loaded");
}
window.addEventListener("load",pageReady,false);


// no3d
window.no3dView = false;
function setClass_no3d(){
	
	if(supTransform == "2d" ||  supTransform == "none" || document.documentElement.clientWidth <= 1024){
		addClass(document.body,"no3d");
		no3dView = true;
	}else{
		no3dView = false;
		removeClass(document.body,"no3d");
	}
	
}
window.addEventListener("load", setClass_no3d, false);
window.addEventListener("resize", setClass_no3d, false);
window.addEventListener("orientationchange", setClass_no3d, false);

// ленивая загрузка изображений
function ImageLoader(rule) {
	if(!rule) rule = 'img';
	var images = document.querySelectorAll(rule);
	var _this = this;
	this.images = [];
	[].forEach.call(images, function (el) {
		_this.images.push(el);
		el.imageURL = el.src;
	});
}
ImageLoader.prototype = {
	loadImage: function (num) {
		if(!this.images[num]) return;
		var img = this.images[num];
		img.src = img.imageURL;
		console.log(num);
		this.images[num] = undefined;
		var _this = this;
		img.onload = function (e) {
			_this.onload.call(this, e);
		};
	},
	onload: function () {
		
	}
}