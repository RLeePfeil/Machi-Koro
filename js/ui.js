$body = $('body');


/* Modify the classes to hook their DOM elements */

GameManager.prototype.createMe = function() {
	this.$el = $(
		`<h1 id="game-title">Machi Koro</h1><div id="game-area"></div>`
	);
	this.$el.data('me', this);

	this.$piles = $(`<div id="piles"></div>`);
	this.$el.append(this.$piles);

	this.$playerArea = $(`<div id="player-area"></div>`);
	this.$el.append(this.$playerArea);

	$body.append(this.$el);
}

Card.prototype.createMe = function() {
	this.$el = $(
		`<span class="card type-${this.type}">
			<h3>${this.name}</h3>
			<h4>${this.description}</h4>
			<h6>${this.cost}</h6>
		</span>`
	);
	this.$el.data('me', this);
}

Card.prototype.addMeToHand = function() {
	this.owner.$el.find('.player-mat').append(this.$el);
}

Player.prototype.createMe = function() {
	this.$el = $(
		`<div class="player">
			<h3>${this.name}</h3>
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