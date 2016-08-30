function Item(item, x, y) {
	switch (item) {
	case '@': return new Player(x, y);
	case '.': return new Bonus(x, y);
	case ' ': return void 0;
	}
	return item;
}
Item.init = function(item, x, y) {
	Object.setPrototypeOf(item, Item.prototype);
	item.x = x;
	item.y = y;
};
Item.prototype.pick = function() {
	this.onpick && this.onpick();
};

function Bonus(x, y) {
	Item.init(this, x, y);
}
Bonus.onpick = function() {
	alert('BONUS!');
};
