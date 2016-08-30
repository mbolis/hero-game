var term = new Terminal(21, 21, 32);
document.body.appendChild(term.display);

// create player character
var player = Player.get(); // FIXME!!!

// load level map
var level = new Level(testMap);

function render(level) {
	term.clear();
	var view = View(player.x - 10, player.y - 10, 21, 21)
	view.forEach(level.tiles, function(tile, x, y) {
		if (tile) {
			term.fillTile(x, y, tile.terrain == '#' ? 'gray' : 'green');

			var fov = view.get(level.fov, x, y) || ø;
			if (fov.visibility) {
				if (fov.visibility < 1) {
					term.fillTile(x, y, 'rgba(0,0,0,' + (1-(fov.visibility || 0)) + ')');
				}
			} else if (fov.explored) {
				term.fillTile(x, y, 'rgba(0,0,0,0.7)');
			} else {
				term.fillTile(x, y, 'black');
			}

			var pdist = view.get(level.pdist, x, y);
			if (pdist != null && pdist < Number.MAX_SAFE_INTEGER) {
				term.print(x, y, pdist.toFixed(2), 'red');
			}
		}
	});
	term.fillCircle(10, 10, 'blue');
}
render(level);

term.onkeydown = function(e) {
	var x = player.x, y = player.y;
	switch (e.code) {
	case 'ArrowUp':
	case 'Numpad8':
		y--;
		break;
	case 'Numpad9':
		x++;
		y--;
		break;
	case 'ArrowRight':
	case 'Numpad6':
		x++;
		break;
	case 'Numpad3':
		x++;
		y++;
		break;
	case 'ArrowDown':
	case 'Numpad2':
		y++;
		break;
	case 'Numpad1':
		x--;
		y++;
		break;
	case 'ArrowLeft':
	case 'Numpad4':
		x--;
		break;
	case 'Numpad7':
		x--;
		y--;
		break;
	default:
		return;
	}

	var cell = Matrix.get(level.tiles, x, y);
	if (!cell || cell.terrain == '#') {
		return;
	}

	player.move(x, y);

	render(level);
};
