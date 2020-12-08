const playerNames = [
	"Coreen",
	"Lee",
	"Steve",
	"Margaret",
	"Holly",
	"Benjamin",
	"Devon",
	"Carl",
	"Abigail",
	"Veronica"
];

/* Game Manager class
	- game stage
	- turn phase
	- types {
		sun: {
			name: "Sun"
			icon: src
		},
		cow: {
			name: "Ranch",
			icon: src
		},
		bread: {
			name: "grocery",
			icon: src
		}
		factory: {
			name: "Factory",
			icon: src
		},
		...
	}
	
	// Objects
	Deck
	- which cards
	Drawpiles
	
	// Actions
	rollDice(numDice) {

	}
*/
class GameManager {
	constructor(numPlayers = 2) {
		// Iterates through players
		this.whoseTurn = 0;
		this.phases = ["roll", "actions", "buy"];
		this.phase = "roll"; // "roll", "actions", "buy"

		this.errorStyle = 'color: red; font-style: italic; border-top: 1px solid; border-bottom: 1px solid;'

		if (this.createMe) {
			this.createMe();
		}

		this.deck = [
			new WheatField(),
			new WheatField(),
			new WheatField(),
			new WheatField(),
			new WheatField(),
			new Ranch(),
			new Ranch(),
			new Ranch(),
			new Ranch(),
			new Bakery(),
			new Bakery(),
			new Bakery(),
			new Bakery(),
			new Bakery(),
			new Cafe(),
			new Cafe(),
			new Cafe(),
			new Cafe(),
			new ConvenienceStore(),
			new ConvenienceStore(),
			new ConvenienceStore(),
			new ConvenienceStore(),
			new Forest(),
			new Forest(),
			new Forest(),
			new Forest(),
			new Stadium(),
			new Stadium(),
			new Stadium(),
			new TVStation(),
			new TVStation(),
			new BusinessCenter(),
			new BusinessCenter(),
			new CheeseFactory(),
			new CheeseFactory(),
			new CheeseFactory(),
			new CheeseFactory(),
			new CheeseFactory(),
			new FurnitureFactory(),
			new FurnitureFactory(),
			new FurnitureFactory(),
			new FurnitureFactory(),
			new Mine(),
			new Mine(),
			new Mine(),
			new Mine(),
			new Mine(),
			new FamilyRestaurant(),
			new FamilyRestaurant(),
			new FamilyRestaurant(),
			new FamilyRestaurant(),
			new AppleOrchard(),
			new AppleOrchard(),
			new AppleOrchard(),
			new AppleOrchard(),
			new AppleOrchard(),
			new AppleOrchard(),
			new FruitAndVegetableMarket(),
			new FruitAndVegetableMarket(),
			new FruitAndVegetableMarket(),
			new FruitAndVegetableMarket()
		];

		// Instantiate the piles
		this.numPiles = 10;
		this.piles = [];
		for (let i=0; i<this.numPiles; i++) {
			this.piles.push(new Pile(this));
		}

		// Instantiate the dice
		this.numDice = 2;
		this.dice = [];
		for (let i=0; i<this.numDice; i++) {
			this.dice.push(new Die(this, 6));
		}

		// Instantiate the players
		this.numPlayers = numPlayers;
		this.players = [];
		for (let i=0; i<this.numPlayers; i++) {
			this.players.push(
				new Player(this, playerNames[i])
			);
		}

		// Begin the game!
		this.gameStart();
	}

	shuffleDeck() {
		this.shuffle(this.deck);
	}

	// "de facto" shuffle: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	// Deal out cards until all piles have unique cards in them
	deal() {
		while(this.deck.length > 0 && this.emptyPiles().length != 0) {
			// Take a card from the deck and put it in a pile with like cards or the next empty pile
			const card = this.deck.shift();

			let nextEmpty = null;
			// First check if this card is in any other piles
			for (const pile of this.piles) {
				if (pile.isEmpty()) {
					if (nextEmpty == null) {
						nextEmpty = pile;
					}
				} else if (pile.getLastCard().name == card.name) {
					pile.addCard(card);
					nextEmpty = null;
					break;
				}
			}

			// If not, and there's an empty pile, put it there!
			if (nextEmpty != null) {
				nextEmpty.addCard(card);
				continue;
			}
		}
	}

	findCardPile(ClassName) {
		for (const pile of this.piles) {
			if (pile.getLastCard() instanceof ClassName) {
				return pile;
			}
		}

		return false;
	}

	areThereEmptyPiles() {
		return this.emptyPiles().length != 0;
	}

	emptyPiles() {
		let empties = [];

		for (const pile of this.piles) {
			if (pile.isEmpty()) {
				empties.push(pile);
			}
		}

		return empties;
	}

	rollDice(numDice = 1) {
		let rolls = [];

		for (let i=0; i<numDice; i++) {
			rolls.push( this.dice[i].roll() );
		}

		console.log(`%cRolled a ${rolls.reduce((total, num) => {return total+num})} (${rolls.join(', ')})`, 'color: red; font-weight: bold;');

		return rolls;
	}

	acceptRoll() {
		console.log("%cBegin card actions", "color: green; font-size: bold; border-left: 4px solid green; border-top: 1px solid green; padding: 1em;");

		// Things happen!
		const theRoll = this.getCurrentRoll();

		// First - see what "others" cards activate (if not the current player)
		for (const player of this.players) {
			if (player != this.getActivePlayer()) {
				for (const card of player.hand) {
					if (card.activatesOnTurn == "others") {
						card.doAction(theRoll, "others");
					}
				}
			}
		}

		// Next, see what "anyones" cards activate
		for (const player of this.players) {
			for (const card of player.hand) {
				if (card.activatesOnTurn == "anyones") {
					card.doAction(theRoll, "anyones");
				}
			}
		}

		// Last, see what "yours" cards activate
		for (const card of this.getActivePlayer().hand) {
			if (card.activatesOnTurn == "yours") {
				card.doAction(theRoll, "yours");
			}
		}

		console.log("%cEnd card actions", "color: green; font-size: bold; border-left: 4px solid green; border-bottom: 1px solid green; padding: 1em;");

		// Enter buy phase!
		this.phaseAdvance("buy");
	}

	getPhase() {
		return this.phase;
	}

	setPhase(which) {
		if (this.phases.includes(which)) {
			this.phase = which;
			this.phaseAdvanced();
		} else {
			console.log(`${which} is not a phase.`, this.errorStyle);
		}
	}

	phaseAdvance(which) {
		if (which == "undefined") {
			// Next phase
			for (let i=0; i<this.phases.length; i++) {
				if (this.phases[i] == this.getPhase()) {
					// If last phase, go back to first phase
					i = i+2<this.phases.length ? 0 : i+1;
					this.setPhase(this.phases[i]);
				}
			}
		} else {
			this.setPhase(which);
		}

		if (this.updatePhase) {
			this.updatePhase();
		}
	}

	phaseAdvanced() {
		console.log(`Entering ${this.getPhase()} phase for ${this.getActivePlayer().name}'s turn`);
		if (this.getPhase() == 'buy') {
			this.showCardsToBuy();
		}
	}

	doneBuying(player) {
		if (this.getActivePlayer() == player) {
			if (this.getPhase() == "buy") {
				this.nextTurn();
			} else {
				console.log(`${player.name} can't end their turn yet, it's the ${this.getPhase()} phase.`);
			}
		} else {
			console.log(`Not your turn, ${player.name}`);
		}
	}

	nextTurn() {
		// Make the dice inactive
		for (const die of this.dice) {
			die.isAcive = false;
		}
		
		// Advance active players
		if (this.whoseTurn == this.numPlayers - 1) {
			this.whoseTurn = 0;
		} else {
			this.whoseTurn ++;
		}

		// Reset the phase
		this.phaseAdvance("roll");
	}

	getActivePlayer() {
		return this.players[this.whoseTurn];
	}

	getCardsAvailableToBuy() {
		let cards = [];

		for (const pile of this.piles) {
			if (!pile.isEmpty()) {
				cards.push(pile.getLastCard());
			}
		}

		return cards;
	}

	showCardsToBuy() {
		const cards = this.getCardsAvailableToBuy();
		console.log(`${cards.reduce((output, card, index, arr)=>{ return output + "\n"+card.name }, "Cards for purchase:\n" )}`);
	}

	getCurrentRoll() {
		let value = 0;
		for (const die of this.dice) {
			if (die.isActive == true) {
				value += die.value;
			}
		}

		return value;
	}

	gameStart() {
		this.shuffleDeck();
		this.deal();

		if (this.updatePhase) {
			this.updatePhase();
		}
	}
}

class Die {
	constructor(gameManager, numSides = 6) {
		this.numSides = numSides;
		this.value = 1;
		this.isActive = false;
		this.gm = gameManager;

		if (this.createMe) {
			this.createMe();
		}
	}

	roll() {
		this.isActive = true;
		this.value = Math.ceil( Math.random() * this.numSides );

		if (this.update) {
			this.update();
		}

		return this.value;
	}

}

class Pile {
	constructor(gameManager) {
		this.myCards = [];

		this.gm = gameManager;

		if (this.createMe) {
			this.createMe();
		}
	}

	addCard(card) {
		this.myCards.push(card);

		if (this.updatePile) {
			this.updatePile();
		}
	}

	buyCard() {
		this.gm.getActivePlayer().buyCard(this.getLastCard().constructor);
	}

	getLastCard() {
		if (this.myCards.length > 0) {
			return this.myCards[this.myCards.length-1];
		} else {

		}
	}

	removeLastCard() {
		if (this.myCards.length > 0) {
			return this.myCards.pop();
		} else {
			return false;
		}
	}

	isEmpty() {
		return this.myCards.length == 0;
	}
}

/* Card class
	- name (String) (Mine)
	- description (String)
	- image (String) [url]
	- type (String) [sun]
	- activatesOnNumber (Array) [9, 10]
	- activatesOnTurn (String) [others, yours, anyones]
	- cost (let int)
*/ 
class Card {
	constructor(name, description, image, type, activatesOnNumber, activatesOnTurn, cost, owner) {
		this.name = name;
		this.description = description;
		this.image = image;
		this.type = type;
		this.activatesOnNumber = activatesOnNumber;
		this.activatesOnTurn = activatesOnTurn;
		this.cost = cost;

		if (owner != undefined) {
			this.owner = owner;
		}

		this.logStyle = 'color: green; padding-left: 1em; border-left: 4px solid green;';

		if (this.createMe) {
			this.createMe();
		}
	}

	changeOwnership(player) {
		this.owner = player;
	}

	getActivePlayer() {
		if (this.owner != undefined) {
			return this.owner.gm.getActivePlayer();
		}

		return false;
	}

	shouldCardActionOccur(currentRoll, currentTurn) {
		if (this.activatesOnNumber.includes(currentRoll) &&
			this.activatesOnTurn == currentTurn) {
			return true;
		} else {
			return false;
		}
	}

	doAction(currentRoll, currentTurn) {
		//console.log(`%cChecking ${this.owner.name}'s ${this.name} card`);
		if (this.shouldCardActionOccur(currentRoll, currentTurn)) {
			this.action();
		}
	}

	action() {
		console.log('default action - do nothing');
	}
}


// Specific card classes
// WheatField
// Ranch
// Bakery
// Cafe
// ConvenienceStore
// Forest
// Stadium
// TVStation
// BusinessCenter
// CheeseFactory
// FurnitureFactory
// Mine
// FamilyRestaurant
// AppleOrchard
// FruitAndVegetableMarket

class WheatField extends Card {
	constructor(owner) {
        super(
        	"Wheat Field", // name
        	"Get 1 coin from the bank on anyone's turn", // description
        	"", // image
        	"crop", // type
        	[1], // activatesOnNumber
        	"anyones", // activatesOnTurn
        	1, // cost
        	owner
        );
    }

    action() {
    	// Get one coin from the bank
    	console.log(`%c${this.owner.name} gets one coin from their Wheat Field`, this.logStyle);
    	this.owner.adjustMoney(1);
    }
}

class Ranch extends Card {
	constructor(owner) {
        super(
        	"Ranch", // name
        	"Get 1 coin from the bank on anyone's turn", // description
        	"", // image
        	"cow", // type
        	[2], // activatesOnNumber
        	"anyones", // activatesOnTurn
        	1, // cost
        	owner
        );
    }

    action() {
    	// Get one coin from the bank
    	console.log(`%c${this.owner.name} gets one coin from their Ranch`, this.logStyle);
    	this.owner.adjustMoney(1);
    }
}

class Bakery extends Card {
	constructor(owner) {
        super(
        	"Bakery", // name
        	"Get 1 coin from the bank, on your turn only", // description
        	"", // image
        	"bread", // type
        	[2, 3], // activatesOnNumber
        	"yours", // activatesOnTurn
        	1, // cost
        	owner
        );
    }

    action() {
    	// Get one coin from the bank
    	console.log(`%c${this.owner.name} gets one coin from their Bakery`, this.logStyle);
    	this.owner.adjustMoney(1);
    }
}

class Cafe extends Card {
	constructor(owner) {
        super(
        	"Cafe", // name
        	"Get 1 coin from the player that rolled the dice", // description
        	"", // image
        	"cup", // type
        	[3], // activatesOnNumber
        	"others", // activatesOnTurn
        	2, // cost
        	owner
        );
    }

    action() {
    	// Get 1 coin from active player
    	if (this.getActivePlayer().money >= 1) {
    		console.log(`%c${this.owner.name} gets one coin from their Cafe from the active player, ${this.getActivePlayer().name}`, this.logStyle);
    		this.getActivePlayer().adjustMoney(-1);
    		this.owner.adjustMoney(1);
    	} else {
    		console.log(`%c${this.owner.name} gets no coins from their Cafe from the active player, ${this.getActivePlayer().name} because they are broke`, this.logStyle);
    	}
    }
}

class ConvenienceStore extends Card {
	constructor(owner) {
        super(
        	"Convenience Store", // name
        	"Get 3 coins from the bank, on your turn only", // description
        	"", // image
        	"bread", // type
        	[4], // activatesOnNumber
        	"yours", // activatesOnTurn
        	2, // cost
        	owner
        );
    }

    action() {
    	// Get one coin from the bank
    	console.log(`%c${this.owner.name} gets three coins from their Convenience Store`, this.logStyle);
    	this.owner.adjustMoney(3);
    }
}

class Forest extends Card {
	constructor(owner) {
        super(
        	"Forest", // name
        	"Get 1 coin from the bank, on anyone's turn", // description
        	"", // image
        	"sun", // type
        	[5], // activatesOnNumber
        	"anyones", // activatesOnTurn
        	3, // cost
        	owner
        );
    }

    action() {
    	// Get one coin from the bank
    	console.log(`%c${this.owner.name} gets one coin from their Forest`, this.logStyle);
    	this.owner.adjustMoney(1);
    }
}

class Stadium extends Card {
	constructor(owner) {
        super(
        	"Stadium", // name
        	"Get 2 coins from all players, on your turn only", // description
        	"", // image
        	"landmark", // type
        	[6], // activatesOnNumber
        	"yours", // activatesOnTurn
        	6, // cost
        	owner
        );
    }

    action() {
    	// TODO
    	console.log(`%c${this.owner.name} gets two coins from their Stadium from ALL players`, this.logStyle);
    	
    }
}

class TVStation extends Card {
	constructor(owner) {
        super(
        	"TV Station", // name
        	"Get 2 coins from all players, on your turn only", // description
        	"", // image
        	"landmark", // type
        	[6], // activatesOnNumber
        	"yours", // activatesOnTurn
        	7, // cost
        	owner
        );
    }

    action() {
    	// TODO
    	console.log(`%c${this.owner.name} gets five coins from their TV Station from one player`, this.logStyle);
    	
    }
}

class BusinessCenter extends Card {
	constructor(owner) {
        super(
        	"Business Center", // name
        	"Trade one non-landmark establishment with another player, on your turn only", // description
        	"", // image
        	"landmark", // type
        	[6], // activatesOnNumber
        	"yours", // activatesOnTurn
        	8, // cost
        	owner
        );
    }

    action() {
    	// TODO
    	console.log(`%c${this.owner.name} trades one non-landmark establishment with another player via their Business Center`, this.logStyle);
    	
    }
}

class CheeseFactory extends Card {
	constructor(owner) {
        super(
        	"Cheese Factory", // name
        	"Get 3 coins from the bank for each {cow} establishment that you own, on your turn only", // description
        	"", // image
        	"factory", // type
        	[7], // activatesOnNumber
        	"yours", // activatesOnTurn
        	5, // cost
        	owner
        );
    }

    action() {
    	// TODO
    	console.log(`%c${this.owner.name} gets three coins per {cow} establishment from their Cheese Factory`, this.logStyle);
    }
}

class FurnitureFactory extends Card {
	constructor(owner) {
        super(
        	"Furniture Factory", // name
        	"Get 3 coins from the bank for each {sun} establishment that you own, on your turn only", // description
        	"", // image
        	"factory", // type
        	[8], // activatesOnNumber
        	"yours", // activatesOnTurn
        	3, // cost
        	owner
        );
    }

    action() {
    	// TODO
    	console.log(`%c${this.owner.name} gets three coins per {sun} establishment from their Furniture Factory`, this.logStyle);
    }
}

class Mine extends Card {
	constructor(owner) {
        super(
        	"Mine", // name
        	"Get 5 coin from the bank, on anyone's turn", // description
        	"", // image
        	"sun", // type
        	[9], // activatesOnNumber
        	"anyones", // activatesOnTurn
        	6, // cost
        	owner
        );
    }

    action() {
    	// Get one coin from the bank
    	console.log(`%c${this.owner.name} gets five coins from their Mine`, this.logStyle);
    	this.owner.adjustMoney(5);
    }
}

class FamilyRestaurant extends Card {
	constructor(owner) {
        super(
        	"Family Restaurant", // name
        	"Get 2 coins from the player who rolled the dice", // description
        	"", // image
        	"cup", // type
        	[9, 10], // activatesOnNumber
        	"others", // activatesOnTurn
        	3, // cost
        	owner
        );
    }

    action() {
    	// Get 1 coin from active player
    	if (this.getActivePlayer().money >= 1) {
    		console.log(`%c${this.owner.name} gets two coins from their Family Restaurant from the active player, ${this.getActivePlayer().name}`, this.logStyle);
    		this.getActivePlayer().money-= 1;
    		this.owner.money+= 1;
    	} else {
    		console.log(`%c${this.owner.name} gets no coins from their Family Restaurant from the active player, ${this.getActivePlayer().name} because they are broke`, this.logStyle);
    	}
    }
}

class AppleOrchard extends Card {
	constructor(owner) {
        super(
        	"Apple Orchard", // name
        	"Get 3 coins from the bank, on anyone's turn", // description
        	"", // image
        	"sun", // type
        	[10], // activatesOnNumber
        	"anyones", // activatesOnTurn
        	3, // cost
        	owner
        );
    }

    action() {
    	// Get one coin from the bank
    	console.log(`%c${this.owner.name} gets three coins from their Apple Orchard`, this.logStyle);
    	this.owner.adjustMoney(3);
    }
}

class FruitAndVegetableMarket extends Card {
	constructor(owner) {
        super(
        	"Fruit and Vegetable Market", // name
        	"Get 2 coins from the bank for each {crop} establishment that you own, on your turn only", // description
        	"", // image
        	"fruit", // type
        	[11, 12], // activatesOnNumber
        	"yours", // activatesOnTurn
        	2, // cost
        	owner
        );
    }

    action() {
    	// TODO
    	console.log(`%c${this.owner.name} gets 2 coins per {fruit} establishment from their Fruit and Vegetable Market`, this.logStyle);
    }
}




class TrainStation extends Card {
	constructor(owner) {
        super(
        	"Train Station", // name
        	"You may roll 1 or 2 dice", // description
        	"", // image
        	"objective", // type
        	[], // activatesOnNumber
        	null, // activatesOnTurn
        	4, // cost
        	owner
        );

        this.isActive = false;
    }
}

class ShoppingMall extends Card {
	constructor(owner) {
        super(
        	"Shopping Mall", // name
        	"Each of your {cup} and {bread} establishments earn +1 coin", // description
        	"", // image
        	"objective", // type
        	[], // activatesOnNumber
        	null, // activatesOnTurn
        	10,
        	owner // cost
        );

        this.isActive = false;
    }
}

class AmusementPark extends Card {
	constructor(owner) {
        super(
        	"Amusement Park", // name
        	"If you roll doubles, you may take another turn after this one", // description
        	"", // image
        	"objective", // type
        	[], // activatesOnNumber
        	null, // activatesOnTurn
        	16, // cost
        	owner
        );

        this.isActive = false;
    }
}

class RadioTower extends Card {
	constructor(owner) {
        super(
        	"Radio Tower", // name
        	"Once every turn, you may choose to re-roll your dice", // description
        	"", // image
        	"objective", // type
        	[], // activatesOnNumber
        	null, // activatesOnTurn
        	22, // cost
        	owner
        );

        this.isActive = false;
    }
}


/* Player class
	
*/
class Player {
	constructor(gameManager, name, ai = false) {
		// Reference to the game manager class that instantiated it
		this.gm = gameManager;

		this.name = name;
		this.ai = ai;

		// Starting money
		this.money = 3;

		// Starting cards (pass player reference)
		this.hand = [
			new WheatField(this),
			new Bakery(this)
		];

		// Objective cards (pass player reference)
		this.objectives = [
			new TrainStation(this),
			new ShoppingMall(this),
			new AmusementPark(this),
			new RadioTower(this)
		];

		if (this.createMe) {
			this.createMe();
		}
	}

	roll(numDice = 1) {
		if (this.gm.getActivePlayer() == this) {
			const rolls = this.gm.rollDice(numDice);

			if (this.hasCard(RadioTower)) {
				// Prompt to re-roll if desired
			} else {
				this.gm.acceptRoll();
			}
		} else {
			console.log(`You can't roll, ${this.name}! It's ${this.gm.getActivePlayer().name}'s turn.`);
		}
	}

	adjustMoney(howMuch) {
		this.money += howMuch;
		if (this.updateMoney) {
			this.updateMoney();
		}
	}
	
	buyCard(CardClass) {
		const cardPile = this.gm.findCardPile(CardClass);
		if (!cardPile) {
			// Error
			console.log(`No ${CardClass.name} is available for purchase`);
		} else {
			if (cardPile.getLastCard().cost <= this.money) {
				this.adjustMoney(-1 * cardPile.getLastCard().cost);
				
				const card = cardPile.removeLastCard();
				this.takeCard(card);
				console.log(`${this.name} buys a ${CardClass.name} for ${card.cost} and has ${this.money} remaining`);
				// If the bought card is the last in a pile, deal out more cards
				if (this.gm.areThereEmptyPiles()) {
					this.gm.deal();
					this.gm.showCardsToBuy();
				}
			} else {
				console.log(`${CardClass.name} is too expensive for ${this.name} (needs ${cardPile.getLastCard().cost}, has ${this.money})`);
			}
		}
	}

	takeCard(card) {
		card.changeOwnership(this);
		this.hand.push(card);

		if (card.addMeToHand) {
			card.addMeToHand(this);
		}
	}

	// Determines whether a player has a card of a certain class name
	// If they have the objective card, it must have been purchased
	hasCard(ClassName) {
		for (let i=0; i<this.hand.length; i++) {
			if (this.hand[i] instanceof ClassName) {
				return true;
			}
		}

		for (let i=0; i<this.objectives.length; i++) {
			if (this.objectives[i] instanceof ClassName &&
				this.objectives[i].isActive == true) {
				return true;
			}
		}

		return false;
	}

	doneBuying() {
		this.gm.doneBuying(this);
	}

}