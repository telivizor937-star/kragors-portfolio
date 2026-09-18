function Ajax(file) {
	var xhr = new XMLHttpRequest();
	this.xhr = xhr;
	if(!file) this.file = '/ajax/main.php';
	else this.file = file;
	this.data = {};
	xhr.open('POST', this.file, true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	var _this = this;
	xhr.onreadystatechange = function () {_this.stateChange(this)};
}

Ajax.prototype = {
	exec: function () {
		var a = [];
		for(var i in this.data) a.push(i + '=' + this.data[i]);
		var request = a.join('&');
		this.xhr.send(request);
	},
	stateChange: function (xhr) {
		if(xhr.readyState != 4) return;
		if(xhr.status == 200) {
			var response = xhr.responseText;
			try {
				if(response) var obj = JSON.parse(response);
				else var obj = {};
			}
			catch(e) {
				this.error();
				return;
			}
			this.success(obj);
		}
	},
	success: function () {
		
	},
	error: function () {
		alert('Не получилось добавить в корзину. Попробуйте ещё разок');
	}
}

if(!Element.remove) {
	Element.prototype.remove = function () {
		if(this.parentNode) this.parentNode.removeChild(this);
	}
}

function Feedback(feedbackForm, o) {
	if(!feedbackForm) return false;
	var _this = this;
	this.form = feedbackForm;
	this.form.feedback = this;
	this.action = o.action || 'feedback';
	// if(o.param) this.param = o.param;
	// else this.param = '';
	Element.prototype.feedbackMethods = Feedback.prototype;
	this.fileList = new Array();
	var inputs = this.form.getElementsByTagName('input');
	for(var i = 0; i < inputs.length; i++) {
		var input = inputs[i];
		if(input.type == 'file') input.addEventListener('change', this.feedbackUpload, false);
		var a = input.name.split('-');
		for(var i2 = 1; i2 < a.length; i2++) {
			var c = a[i2];
			if(c == 'num') input.onkeypress = function (e) { return _this.checkNum(e) };
			if(c == 'phone') input.onkeypress = function (e) { return _this.checkPhone(e) };
		}
	}
	this.button = this.form.getElementsByClassName(o.buttonSend || 'feedback_send')[0];
	this.button.addEventListener('click', this.feedbackSend, false);
	this.error = this.form.getElementsByClassName(o.error || 'feedback_error')[0];
	if(o.postParams) this.postParams = o.postParams;
	else this.postParams = '';
	this.successHandler = o.successHandler;
	this.noDisable = o.noDisable;
	if(o.errorMarkHandler) this.errorMark = o.errorMarkHandler;
	this.successColor = o.successColor;
	this.errorColor = o.errorColor;
    
    this.cfg = o;
	
	this.setDefaultContacts();
}
Feedback.prototype = {
	getThis: function (f) {
		if(!f) return false;
		while(f) {
			if(f.feedback) return f.feedback;
			else f = f.parentNode;
		}
		return false;
	},
	
	setDefaultContacts: function () {
		if(!localStorage.contact_data) return;
		try {
			var contacts = JSON.parse(localStorage.contact_data);
		}
		catch (e) {
			return;
		}
		
		if(!this.form) return;
		var form = this.form;
		for(var i = 0; i < form.elements.length; i++) {
			var elem = form[i];
			var name = elem.name.split('-')[0];
			
			if(contacts[name]) elem.value = contacts[name];
		}
	},
	
	feedbackSend: function () {
		var _this = this.feedbackMethods.getThis(this);
		if(!_this) return false;
		
		if(_this.preventSend) return;
		
		if(_this.feedbackError('getError')) return;
        
        if (typeof _this.cfg.afterClick == 'function') {
            if (!_this.cfg.afterClick(_this)) {
                return;
            }
        }
		
		_this.feedbackError('clean');
		var inputs = _this.form.getElementsByTagName('input');
		var areas = _this.form.getElementsByTagName('textarea');
		var polity = _this.form.querySelector('.policy__input');
		var obj = new Object();
		var letter = 'action='+ _this.action;
		var sendType = 'form';
		var noSend = false;
		_this.fields = new Array();
		mark:
		for(var i = 0; i < _this.form.elements.length; i++) {
			var input = _this.form[i];
			if(!input) continue;
			if(input.value === undefined) continue;
			_this.fields.push(input);
			var a = input.name.split('-');
			for(var i2 = 1; i2 < a.length; i2++) {
				var c = a[i2];
				if(c == 'nec') {
					if(input.value.length == 0) {
						_this.feedbackError('empty', input);
						noSend = true;
						continue mark;
					}
				}
				if(c == 'num') {
					if(input.value.length < 6 || input.value.length > 12) {
						_this.feedbackError('number', input);
						continue mark;
					}
				}
				else if(c == 'email') {
					if(!_this.checkEmail(input.value)) {
						_this.feedbackError('email', input);
						noSend = true;
						continue mark;
					}
				}
			}
			var name = a[0];
			obj[input.name] = name;
			letter += '&'+ name +'='+ input.value;
			if(input.type == 'file') {
				if(input.files.length != 0) {
					sendType = 'formData';
					obj[input.name] = input.files[0];
					continue;
				}
			}
			if(name == 'email' && input.value.length > 0) {
				if(!_this.checkEmail(input.value)) {
					_this.feedbackError('email', input);
					noSend = true;
					continue;
				}
			}
			if(name == 'permit' && input.type == 'checkbox') {
				if(input.checked == false) {
					_this.feedbackError('permit', input);
					noSend = true;
					continue;
				}
			}

			if (polity.checked == false) {
				noSend = true;
				document.querySelector('.order_error').style.display = 'block';
				document.querySelector('.order_error').innerHTML = 'Дайте согласие на обработку персональных данных';
				continue;
			}
		}
		if(noSend) return;
		if(!_this.noDisable) _this.preventSend = true;
		if(_this.fileList.length > 0) {
			var filesJSON = JSON.stringify(_this.fileList);
			letter += '&file_list='+ filesJSON;
		}
		if(_this.param) letter += '&argument='+ _this.param;
    if(document.querySelector('.order_error-book')) {
      document.querySelector('.order_error-book').style.display = 'none';
    }
		this.innerHTML = 'Подождите...';
		letter += '&url='+ location.href;
		letter += '&'+ _this.postParams;
		_this.ajaxForm(letter);
		
	},
	
	feedbackUpload: function () {
		var _this = this.feedbackMethods.getThis(this);
		var divUpload = this.parentNode;
		if(!divUpload) {
			var divUpload = document.createElement('div');
			divUpload.style.backgroundImage = 'url(/images/loading.gif)';
			divUpload.style.backgroundSize = 'contain';
			divUpload.style.backgroundRepeat = 'no-repeat';
			this.parentNode.style.position = 'relative';
			divUpload.style.position = 'absolute';
			divUpload.style.top = 0;
			divUpload.style.left = '10px';
			divUpload.style.width = this.parentNode.offsetHeight + 'px';
			divUpload.style.height = this.parentNode.offsetHeight + 'px';
			this.parentNode.appendChild(divUpload);
		}
		var spanUpload = this.parentNode.getElementsByTagName('span')[0];
		_this.feedbackError('cleanError');
		if(!window.FormData) {
			_this.feedbackError('browser');
			return;
		}
		var file = this.files[0];
		if(file == undefined) return;
		_this.feedbackError('clean');
		if(file.size > 5 * 1048576) {
			_this.feedbackError('fileSize');
			return;
		}
		var name = file.name.split('.');
		var ext = name[name.length - 1];
		
		var permit = new Array('exe', 'php');
		if(permit.search(ext)) {
			_this.feedbackError('fileType');
			return;
		}
		if(ext == 'exe') {
			_this.feedbackError('fileType');
			return;
		}
		spanUpload.innerHTML = 'Идет загрузка...';
		inputs = _this.form.getElementsByTagName('input');
		this.disabled = true;
		var ajax = new XMLHttpRequest();
		var formData = new FormData();
		formData.append('action', 'feedback_upload');
		formData.append(this.name, file);
		ajax.open("POST", '/ajax/feedback.php', true);
		ajax.setRequestHeader("Cache-Control", "no-cache");
		ajax.onreadystatechange = function () {
			if(ajax.readyState == 4 && ajax.status == 200) {
				var answer = ajax.responseText;
				_this.fileList.push(answer);
			}
		};
		ajax.onload = function () {
			spanUpload.innerHTML = 'Файл загружен';
			spanUpload.style.color = 'black';
			divUpload.style.backgroundImage = '';
			// var newDiv = document.createElement('div');
			// newDiv.innerHTML = '<span>Прикрепить файл</span>';
			// newDiv.className = 'input_upload';
			// var newInput = document.createElement('input');
			// newInput.type = 'file';
			// newInput.name = 'file';
			// newInput.addEventListener('change', feedbackUpload, false);
			// newDiv.appendChild(newInput);
			// _this.parentNode.insertAfter(newDiv);
		};
		ajax.send(formData);
	},
	
	feedbackError: function (type, input) {
		var _this = this;
		if(!_this.error) return;
		var error = _this.error;
		if(!_this.errorColor) error.style.color = 'red';
		else error.style.color = _this.errorColor;
		error.style.display = 'block';
		if(type == 'clean') {
			error.innerHTML = '';
			error.style.display = 'none';
			var areas = _this.form.getElementsByTagName('textarea');
			for(var i = 0; i < areas.length; i++) {
				var area = areas[i];
				_this.errorMark(area, 'off');
			}
			var inputs = _this.form.getElementsByTagName('input');
			for(var i = 0; i < inputs.length; i++) {
				var input = inputs[i];
				_this.errorMark(input, 'off');
			}
		}
		else if(type == 'empty') {
			error.innerHTML = 'Заполните обязательные поля';
			_this.errorMark(input, 'on');
		}
		else if(type == 'email') {
			error.innerHTML = 'Введите корректный e-mail';
			_this.errorMark(input, 'on');
		}
		else if(type == 'number') {
			error.innerHTML = 'Введите корректный номер телефона';
			_this.errorMark(input, 'on');
		}
		else if(type == 'fileSize') {
			error.innerHTML = 'Загружен слишком большой файл';
			error.error = true;
			_this.errorMark(input, 'on');
		}
		else if(type == 'fileType') {
			error.innerHTML = 'Загружен файл с неверным форматом';
			error.error = true;
			_this.errorMark(input, 'on');
		}
		else if(type == 'getError') {
			return error.error;
		}
		else if(type == 'browser') {
			error.innerHTML = 'Ваш браузер не поддерживат загрузку файлов';
		}
		else if(type == 'cleanError') {
			error.error = undefined;
		}
		else if(type == 'success') {
			if(!_this.successColor) error.style.color = 'green';
			else error.style.color = _this.successColor;
			error.innerHTML = 'Сообщение отправлено';
			_this.button.innerHTML = 'Отправлено';
		}
		else if(type == 'serverError') {
			error.innerHTML = 'Произошла ошибка, обновите страницу и попробуйте еще раз';
			_this.button.innerHTML = 'Отправить заказ';
		}
		else if(type == 'permit') {
			error.innerHTML = 'Вы не дали согласие на обработку персональных данных';
			_this.errorMark(input, 'on');
		}
		else if(type == 'emptyBasket') {
			error.innerHTML = 'Вы не можете сделать заказ с пустой корзиной';
			_this.button.innerHTML = 'Отправить заказ';
		}
		else if(type == 'orderNoExist') {
			error.innerHTML = 'Невозможно сделать повторный заказ, необходимо создать новый';
			_this.button.innerHTML = 'Отправить заказ';
		}
	},
	
	errorMark: function (elem, mark) {
		if(mark == 'on') {
			elem.style.boxShadow = '0 0 10px red';
			elem.style.webKitBoxShadow = '0 0 10px red';
			elem.style.mozBoxShadow = '0 0 10px red';
			elem.style.oBoxShadow = '0 0 10px red';
			elem.style.msBoxShadow = '0 0 10px red';
		}
		else if(mark == 'off') {
			elem.style.boxShadow = 'none';
			elem.style.webKitBoxShadow = 'none';
			elem.style.mozBoxShadow = 'none';
			elem.style.oBoxShadow = 'none';
			elem.style.msBoxShadow = 'none';
		}
	},
	
	checkEmail: function (mail) {
		if(mail.length == 0) return true;
		var check = false;
		for(var i = 0; i < mail.length; i++) {
			var code = mail.charCodeAt(i);
			code = code.valueOf();
			if(code >= 97 && code <=122) check = true;
			else if(code >= 65 && code <= 90) check = true;
			else if(code == 64 || code == 46 || code == 45 || code == 95 || code == 64) check = true;
			else if(code >= 48 && code <= 57) check = true;
			else return false;
		}
		if(mail.indexOf('@') < 2) return false;
		else if(mail.lastIndexOf('.') - mail.indexOf('@') < 3) return false;
		else if(mail.length - mail.lastIndexOf('.') < 3) return false;
		else return true;
	},
	
	checkNum: function (e) {
		var charC = e.keyCode;
		if(charC < 47 || charC > 57) {
			e.preventDefault();
		}
	},
	checkPhone: function (e) {
		var charC = e.keyCode;
		if(e.target.value.length >= 20) {
			e.preventDefault();
			return;
		}
		if(charC < 47 || charC > 57) {
			if(charC == 40 || charC == 41 || charC == 43 || charC == 45 || charC == 32) return;
			e.preventDefault();
		}
	},
	
	ajaxForm: function (letter) {
		if(localStorage.order_status == 2 && localStorage.order_id) {
			letter += '&order_id='+ localStorage.order_id;
		}
		var _this = this;
		var aRequest = _this.parseQueryString(letter);
		localStorage.setItem('contact_data', JSON.stringify(aRequest));
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "/ajax/feedback.php", true);
		ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		ajax.onreadystatechange = function () {
			if(ajax.readyState == 4 && ajax.status == 200) {
				var answer = ajax.responseText;
				try {
					var obj = JSON.parse(answer);
				}
				catch (e) {
					_this.feedbackError('serverError', this);
					return;
				}
				if(obj.status == 'success') {
					_this.feedbackError('success', this);
					localStorage.setItem('order_id', obj.order_id);
					if(_this.successHandler) _this.successHandler.call(_this);
					for(var i = 0; i < _this.fields.length; i++) {
						if(!_this.noDisable) _this.fields[i].disabled = true;
						else _this.fields[i].value = '';
					}
				}
				else if(obj.status == 'empty_cart') {
					_this.feedbackError('emptyBasket', this);
				}
				else if(obj.status == 'order_no_exist') {
					_this.feedbackError('orderNoExist', this);
				}
				else if(obj.status == 'success_feedback') {
					_this.feedbackError('success', this);
					if(_this.successHandler) _this.successHandler.call(_this);
					for(var i = 0; i < _this.fields.length; i++) {
						if(!_this.noDisable) _this.fields[i].disabled = true;
						else _this.fields[i].value = '';
					}
				}
				else _this.feedbackError('serverError', this);
			}
		}
		ajax.send(letter);
	},
	
	setPostParam: function (param) {
		this.param += param;
	},
	
	parseQueryString: function (str) {
		var parts = str.split('&');
		var o = {};
		for(var i = 0; i < parts.length; i++) {
			var value = parts[i].split('=');
			o[value[0]] = value[1];
		}
		return o;
	}
}

function word(num, w1, w2, w5) {
	var decNum = Math.floor(num / 100);
	var end = num - decNum * 100;
	if(end >= 11 && end <= 19) return w5;
	decNum = Math.floor(num / 10);
	end = num - decNum * 10;
	if(end == 1) return w1
	else if(end >= 2 && end <= 4) return w2
	else return w5
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
		// this.start();
	}
};


function menuDownload(){
	setTimeout(() => {
		var element = document.querySelector('.page-menu');
		element.classList.remove("changing_page");
	}, 1000);
}
