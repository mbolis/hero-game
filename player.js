function Player(x, y) {
	if (typeof Player.get == 'function') {
		throw new Error('Only one player allowed');
	}

	EventTarget(this);

	var player = this;
	Player.get = function() {
		return player;
	}

	Object.defineProperties(this, {
		x : { get : function() { return x; } },
		y : { get : function() { return y; } }
	});
	this.move = function move(x1, y1) {
		var x0 = x, y0 = y;
		x = x1;
		y = y1;

		player.dispatch('move', x0, y0);
	};
}
Player.prototype.stats = {
	sightRadius : 5
};
