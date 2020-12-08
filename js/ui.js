$body = $('body');


/* Modify the classes to hook their DOM elements */

GameManager.prototype.createMe = function() {
	this.$el = $(
		`<div id="game-area"></div>`
	);
	this.$el.data('me', this);

	this.$phase = $(`<div id="phase"></div>`);
	this.$el.append(this.$phase);

	this.$nextTurn = $(`<button id="next-turn">Next Turn</button>`);
	this.$nextTurn.on('click', ()=>{ this.getActivePlayer().doneBuying(); });
	this.$el.append(this.$nextTurn);

	this.$diceMat = $(`<div id="dice-mat"></div>`);
	this.$el.append(this.$diceMat);

	this.$piles = $(`<div id="piles"></div>`);
	this.$el.append(this.$piles);

	this.$playerArea = $(`<div id="player-area"></div>`);
	this.$el.append(this.$playerArea);

	$body.append(`<h1 id="game-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 80" preserveAspectRatio="none"><polygon points="360 80 360 0 0 0 0 80 281 6 360 80" style="fill:#307fff"/></svg><span>Machi Koro</span></h1>`);
	$body.append(this.$el);
}

GameManager.prototype.updatePhase = function() {
	this.$phase.html(`It's ${this.getActivePlayer().name}'s ${this.getPhase()} phase`);
}

Die.prototype.createMe = function() {
	this.$el = $(
		`<span class="die die-${this.numSides}">${this.value}</span>`
	);
	this.$el.data('me', this);
	this.$el.data('sides', this.numSides);

	this.$el.on('click', () => { this.gm.getActivePlayer().roll(this.dieNum); });

	this.gm.$diceMat.append(this.$el);

	// Which #die am I
	this.dieNum = this.gm.$diceMat.find('.die').index(this.$el) + 1;

	// Give me a special class based on my number
	this.$el.addClass(`die-${this.dieNum}`);
}

Die.prototype.update = function() {
	let classes = this.$el.attr('class');
	// Remove the current roll class
	classes.replace(/roll.+ /gi);
	this.$el.attr('class', classes);

	this.$el.addClass(`roll-${this.value}`);
	this.$el.html(`${this.value}`);
}

Pile.prototype.createMe = function() {
	this.$el = $(
		`<div class="pile">
			
		</div>`
	);
	this.$el.data('me', this);

	this.$el.on('click', ()=>{ this.buyCard(); });

	this.gm.$piles.append(this.$el);
}

Pile.prototype.updatePile = function() {
	for (const card of this.myCards) {
		this.$el.append(card.$el);
		setTimeout(()=> { card.$el.addClass('animate-in'); }, 10);
	}
}

Card.prototype.createMe = function() {
	this.$el = $(
		`<span class="card type-${this.type}">
			<h3>${this.name}</h3>
			<div class="activates-on">
				<span>${ this.activatesOnNumber.join('</span><span>') }</span>
			</div>
			<h4>${this.description}</h4>
			<h6>${this.cost}</h6>
		</span>`
	);
	this.$el.data('me', this);
}

Card.prototype.addMeToHand = function() {
	this.$el.removeClass('animate-in');
	this.owner.$el.find('.player-mat').append(this.$el);
	setTimeout(()=> { this.$el.addClass('animate-in'); }, 10);
	
}

Player.prototype.createMe = function() {
	this.$el = $(
		`<div class="player">
			<h3>${this.name} <span class="money">${this.money}</span></h3>
			<div class="player-mat"></div>
		</div>`
	);
	this.$el.data('me', this);

	// Add the cards in my hand to my mat
	for (const card of this.hand) {
		card.addMeToHand();
	}

	// Add my mat to the player area
	this.gm.$playerArea.append(this.$el);
}

Player.prototype.updateMoney = function() {
	this.$el.find('.money').html(this.money);
}
