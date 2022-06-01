// Objeto de Estado del Juego:
function GameStats () {
	this.coins = 15;
	this.tiles = {
		count: 7,
		width: {value: 6, unit: 'rem'},
		height: {value: 6, unit: 'rem'}
	};
	this.positions = [0, 0, 0];
	this.thrown = false;
	this.prizes = [
			{name:'Trío Bulbasur', coins: 3},
			{name:'Trío Abra', coins: 7},
			{name:'Trío Charmander', coins: 10},
			{name:'Trío Cubone', coins: 2},
			{name:'Trio Magikarp', coins: 30},
			{name:'Trío Pikachu', coins: 6},
			{name:'Trío Squirtle', coins: 15},
	];
}
GameStats.prototype.isWinner = function () {
	return this.thrown && this.positions[0] == this.positions[1] && this.positions[1] == this.positions[2];
};

// Código de la Máquina:
function Machine () {
	this.stats = new GameStats();
	this.locked = false;
	this.updateButtonsStatus();
	this.advanceIndex = 0;
	this.advanceMaxIndex = 64;
}

Machine.prototype.throw = function () {
	// Comprobamos que no esté bloqueada (Ejecutando alguna función), para evitar llamadas simultáneas por doble click o similares:
	if(this.locked) {
		return;
	}
	// Bloqueamos la máquina, estamos en un proceso:
	this.locked = true;
	this.avances= 3;
	// Cobramos la partida:
	this.stats.coins--;
	// Reproducimos el sonido:
	document.getElementById('lever').play();
	// Actualizamos los botones, así queda todo bloqueado (disabled):
	this.updateButtonsStatus();
	// Obtenemos el elemento de la máquina:
	var machine = document.getElementById('Container');
	// Dentro de la máquina, obtenemos los DIV (Para buscar las ruletas):
	var divs = machine.getElementsByTagName('div');
	for (var d = 0; d < divs.length; d++) {
		var div = divs[d];
		var divClass = div.getAttribute('class');
		if(divClass && divClass.indexOf('ruleta')!=-1) {
			div.setAttribute('class', divClass+' anim');
		}
	}
	setTimeout(this.throw2.bind(this), 3000);
};

Machine.prototype.throw2 = function () {
	// Obtenemos el elemento de la máquina:
	var machine = document.getElementById('Container');
	// Dentro de la máquina, obtenemos los DIV (Para buscar las ruletas):
	var divs = machine.getElementsByTagName('div');
	for (var d = 0; d < divs.length; d++) {
		var div = divs[d];
		var divClass = div.getAttribute('class');
		if(divClass && divClass.indexOf('ruleta')!=-1) {
			div.setAttribute('class', divClass.replace('anim', '').trim());
		}
	}
	this.locked = false;
	this.stats.thrown = true;
	this.stats.positions = [
		Math.floor(Math.random() * this.stats.tiles.count),
		Math.floor(Math.random() * this.stats.tiles.count),
		Math.floor(Math.random() * this.stats.tiles.count)
	];
	for (var d = 0; d < divs.length; d++) {
		var div = divs[d];
		var divClass = div.getAttribute('class');
		if(divClass && divClass.indexOf('ruleta')!=-1) {
			var yPos = getComputedStyle(div).backgroundPositionY;
			var yPos0 = yPos;
			var duration = 0;
			if(divClass.indexOf('pos1')!=-1) {
				yPos =(this.stats.tiles.height.value * (this.stats.positions[0] + 1)) + this.stats.tiles.height.unit;
				yPos0 = (this.stats.tiles.height.value * (this.stats.positions[0] - 2)) + this.stats.tiles.height.unit;
				duration = 300;
			} else if(divClass.indexOf('pos2')!=-1) {
				yPos =(this.stats.tiles.height.value * (this.stats.positions[1] + 1)) + this.stats.tiles.height.unit;
				yPos0 = (this.stats.tiles.height.value * (this.stats.positions[1] - 2)) + this.stats.tiles.height.unit;
				duration = 600;
			} else if(divClass.indexOf('pos3')!=-1) {
				yPos =(this.stats.tiles.height.value * (this.stats.positions[2] + 1)) + this.stats.tiles.height.unit;
				yPos0 = (this.stats.tiles.height.value * (this.stats.positions[2] - 2)) + this.stats.tiles.height.unit;
				duration = 900;
			}
			div.style.backgroundPositionY = yPos;
			var anim = [
				{backgroundPositionY: yPos0, offset: 0},
				{backgroundPositionY: yPos, offset: 1}
			];
			div.animate(anim, duration);
		}
	}
	// Reproducimos los sonido:
	setTimeout(function(){document.getElementById('stop1').play();},300);
	setTimeout(function(){document.getElementById('stop2').play();},600);
	setTimeout(function(){document.getElementById('stop3').play();},900);
	setTimeout(this.updateButtonsStatus.bind(this), 910);
};

Machine.prototype.advance = function (index) {
	// Comprobamos que no esté bloqueada (Ejecutando alguna función), para evitar llamadas simultáneas por doble click o similares:
	if(this.locked) {
		return;
	}
	// Cobramos el movimiento:
	this.stats.coins--;
	this.avances--;
	// Reproducimos el sonido:
	document.getElementById('advance' + this.advanceIndex).play();
	this.advanceIndex = (this.advanceIndex + 1) % this.advanceMaxIndex;
	// Movemos la ruleta que corresponda: 
	// Obtenemos el elemento de la máquina:
	var machine = document.getElementById('Container');
	// Dentro de la máquina, obtenemos los DIV (Para buscar las ruletas):
	var divs = machine.getElementsByTagName('div');
	// Clase que queremos encontrar para identificar la ruleta:
	const posClass = 'pos'+index;
	for (var d = 1; d < divs.length; d++) {
		var div = divs[d];
		var divClass = div.getAttribute('class');
		if(divClass.indexOf('ruleta') != -1 && divClass.indexOf(posClass) != -1) {
			this.stats.positions[index-1] = (this.stats.positions[index-1]+1) % this.stats.tiles.count;
			var yPos =(this.stats.tiles.height.value * (this.stats.positions[index-1] + 1)) + this.stats.tiles.height.unit;
			var yPos0 = (this.stats.tiles.height.value * (this.stats.positions[index-1])) + this.stats.tiles.height.unit;
			div.style.backgroundPositionY = yPos;
			var anim = [
				{backgroundPositionY: yPos0, offset: 0},
				{backgroundPositionY: yPos, offset: 1}
			];
			div.animate(anim, 200);
		}
	}
	this.updateButtonsStatus();
};

Machine.prototype.canAdvance = function() {
	return !this.locked && !this.stats.isWinner() && this.stats.thrown && this.stats.coins && this.avances > 0;
};

Machine.prototype.updateButtonsStatus = function () {
	// Obtenemos el elemento de la máquina:
	var machine = document.getElementById('Container');
	var buttons = machine.getElementsByTagName('button');
	for (var b = 0; b < buttons.length; b++) {
		var buttonClass = buttons[b].getAttribute('class');
		if (buttonClass.indexOf('advance') != -1) {
			if(this.canAdvance()) {
				buttons[b].removeAttribute("disabled");
			} else {
				buttons[b].setAttribute("disabled", "disabled");
			}
		} else if (buttonClass.indexOf('throw') != -1) {
			if(this.locked || this.stats.coins <= 0) {
				buttons[b].setAttribute("disabled", "disabled");
			} else {
				buttons[b].removeAttribute("disabled");
			}
		}
	}
	if (this.stats.thrown && this.stats.isWinner() && !this.locked) {
		var prize = this.stats.prizes[this.stats.positions[0]];
		var msg = "Ha conseguido el premio '" + prize.name +"', que le concede " + prize.coins + " monedas extra.";
		this.stats.coins += prize.coins;
		setTimeout(function(){document.getElementById('prize').play();alert(msg);},210);
	}
	document.getElementById('coinsCount').innerText = this.stats.coins;
	console.log(this);
};

function ChangeMachine(newType) {
	document.body.setAttribute('class', newType);
	switch(newType) {
		case 'Generacion1':
			machine.stats.tiles.count = 7;
			machine.stats.prizes =  [
				{name:'Trío Bulbasur', coins: 3},
				{name:'Trío Charmander', coins: 7},
				{name:'Trío Cubone', coins: 10},
				{name:'Trío Pikachu', coins: 2},
				{name:'Trio Magikarp', coins: 30},
				{name:'Trío Squirtle', coins: 6},
				{name:'Trío Abra', coins: 15},
			];
			break;
		case 'Generacion2':
			machine.stats.tiles.count = 7;
			machine.stats.prizes =  [
				{name:'Trío Cyndaquil', coins: 3},
				{name:'Trío Mareep', coins: 7},
				{name:'Trío Tedyursa', coins: 10},
				{name:'Trío Totodile', coins: 2},
				{name:'Trio Togepi', coins: 30},
				{name:'Trío Chikorita', coins: 6},
				{name:'Trío Delibird', coins: 15},
				];
			break;
		case 'Generacion3':
			machine.stats.tiles.count = 7;
			machine.stats.prizes =  [
				{name:'Mudkip', coins: 3},
				{name:'Torchic', coins: 7},
				{name:'Altaria', coins: 10},
				{name:'Sableye', coins: 2},
				{name:'Duskull', coins: 30},
				{name:'Treecko', coins: 6},
				{name:'Waylord', coins: 15},
			];
			break;
		default:
				machine.stats.tiles.count = 7;
				machine.stats.prizes =  [
					{name:'Trío Bulbasur', coins: 3},
					{name:'Trío Charmander', coins: 7},
					{name:'Trío Cubone', coins: 10},
					{name:'Trío Pikachu', coins: 2},
					{name:'Trio Magikarp', coins: 30},
					{name:'Trío Squirtle', coins: 6},
					{name:'Trío Abra', coins: 15},
				];
	}
}
/*revisar*/
function backgrounds(){
	document.querySelectorAll('body').style = "background-image: url('../resources/arena.png');";
}

