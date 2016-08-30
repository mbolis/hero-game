var term = new Terminal(11, 11, 32);
document.body.appendChild(term.display);

var player = Player.get();
var level = new Level(testMap);

var simFov;
term.onmouseover = function(x, y, e) {
	var sim = level.fov.simmetry.get(x + player.x - 5, y + player.y - 5);
	if (sim && sim[0] != null && sim[1] != null && Math.abs(sim[0] - sim[1]) > 0.0001) {
		console.log(sim)
		simFov = new FieldOfView(level.tiles);
		simFov.setRadius(level.fov.getRadius());
		simFov.explore(x + player.x - 5, y + player.y - 5);
	} else {
		simFov = null;
		console.log(level.fov.visibility[x+player.x-5][y+player.y-5]);
	}
	render(level, term);
};

render(level, term);
function render(level, term) {
	level.fov.calculateSimmetry(player.x, player.y);

	term.clear();
	level.layers.slice(player.x - 5, player.y - 5, 11, 11).forEach(function(tile, x, y, tx, ty) {
		if (tile[0]) {
			term.fillTile(x, y, tile[0].terrain == '#' ? 'gray' : 'green');
			term.fillTile(x, y, 'rgba(0,0,0,' + (1-(tile[1] || 0)) + ')');

			var sim = tile[3];
			if (sim[0] != null && sim[1] != null) {
				if (Math.abs(sim[0] - sim[1]) > 0.0001) {
					term.fillCircle(x, y, 'red');
				}
			}
			if (simFov) {
				var simV = simFov.visibility.get(tx, ty);
				if (simV != null) {
					term.fillTile(x, y, 'rgba(255,0,0,' + (0.3 + simV / 2) + ')');
				}
			}
		}
	});
	term.fillCircle(5, 5, 'blue');
}

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

	var cell = level.tiles.get(x, y);
	if (!cell || cell.terrain == '#') {
		return;
	}

	player.x = x;
	player.y = y;

	level.fov.explore(x, y);
	render(level, term);
};
