var SQRT_2 = Math.sqrt(2);
function Level(tilesMap) {
	var player = Player.get();
	this.tiles = Matrix.forEach(tilesMap, checkFlags);

	var fov = this.fov = FieldOfView(tilesMap);
	fov.radius = player.stats.sightRadius;
	fov.explore(player.x, player.y);

	var pdist = this.pdist = DijkstraMap(tilesMap, function(sx, sy, dx, dy) {
		var dest = tilesMap[dx][dy];
		if (!dest || dest.flags.blocksMovement) {
			return -1;
		}
		if (sx == dx || sy == dy) {
			return 1;
		}
		return SQRT_2;
	});
	pdist.update([[player.x, player.y]]);

	player.on('move', function(prevx, prevy) {
		var prevTile = tilesMap[prevx][prevy];
		var currTile = tilesMap[player.x][player.y];
		if (prevTile.features[0] != player) {
			throw new Error('Player expected at previous position (' + prevx + ',' + prevy + '), but not found.');
		}

		prevTile.features.shift();
		checkFlags(prevTile, prevx, prevy);

		currTile.features.unshift(player);
		checkFlags(currTile, player.x, player.y);

		pdist.update([[player.x, player.y]]);
		fov.explore(player.x, player.y);
	});

	function checkFlags(tile, x, y) {
		tile.flags = {};
		if (tile.terrain == '#') {
			tile.flags.blocksLight = true;
			tile.flags.blocksMovement = true;
		}
		if (player.x == x && player.y == y) {
			tile.flags.hasCritter = true;
			tile.flags.blocksMovement = true;
		}
		// TODO: add flags:
		// * hasCritter, hasItem
		// * isOpenable
		// * blocksLight, blocksMovement
	}
}
