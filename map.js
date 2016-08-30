var ø = [];

var map = [
	'#   ##   # #      ##',
	' #   #       #  #  #',
	' #  #    ###   ##  #',
	' #     ##      #  # ',
	'  #      #  #### ## ',
	'#  #  ###     #     ',
	'##   #   #  #    ###',
	' # ##   #   # # ##  ',
	'   #    #   # #  #  ',
	'   #     #  #  #    ',
	'  ##     ###   ###  ',
	' #           #   #  ',
	' #         # #     #',
	' #   #  ###  ##  ## ',
	'#      #          # ',
	'       #  #  ## #  #',
	' ##   #    ###   #  ',
	'  #  #    # #  # ###',
	'   # #   #  #  #    ',
	' # # #         #    '
];
var layer1 = [
	'                    ',
	'.                   ',
	'                    ',
	'                   .',
	'                    ',
	'                    ',
	'                    ',
	'                    ',
	'                    ',
	'                    ',
	'      @             ',
	'                    ',
	'                    ',
	'.                   ',
	'                    ',
	'                    ',
	'                    ',
	'                    ',
	'                    ',
	'                    '
];

function TilesMap(tiles) {
	tiles = Matrix.map(tiles, function(stack, x, y) {
		return new Tile(x, y, stack[0], stack.slice(1).map(function(item) { return Item(item, x, y); }));
	});

	// TODO: add methods...

	return tiles;
}
function Tile(x, y, terrain, features) {
	this.x = x;
	this.y = y;
	this.terrain = terrain;
	this.features = features.filter(function(feat) { return feat != null; });
}

var testMap = new TilesMap(layers2stacks([map, layer1].map(rows2cols)));
