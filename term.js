function Terminal(cols, rows, scale) {
	var width = cols * scale, height = rows * scale;

	var display = this.display = document.createElement('DIV');
	var displayStyle = display.style;
	displayStyle.position = 'relative';
	displayStyle.width = width + 'px';
	displayStyle.height = height + 'px';
	displayStyle.border = '1px solid silver';

	var canvas = document.createElement('CANVAS');
	display.appendChild(canvas);
	canvas.width = width;
	canvas.height = height;

	var cells = Matrix.of(cols, rows).map(function(empty, x, y) {
		var cell = document.createElement('DIV');
		cell.addEventListener('mouseover', onMouseEnter.bind(this, cell, x, y));

		var cellStyle = cell.style;
		cellStyle.position = 'absolute';
		cellStyle.top = (y * scale) + 'px';
		cellStyle.left = (x * scale) + 'px';
		cellStyle.width = scale + 'px';
		cellStyle.height = scale + 'px';

		display.appendChild(cell);
		return cell;
	}.bind(this));

	function onMouseEnter(cell, x, y, e) {
		typeof this.onmouseover == 'function' && this.onmouseover.call(cell, x, y, e);
	}

	var gfx = canvas.getContext('2d');

	this.clear = function(bg) {
		gfx.save();
		gfx.fillStyle = bg || 'black';
		gfx.fillRect(0, 0, width, height);
		gfx.restore();
	}

	this.fillTile = function(x, y, fillStyle) {
		gfx.save();
		gfx.fillStyle = fillStyle;
		gfx.fillRect(x * scale, y * scale, scale, scale);
		gfx.restore();
	}
	this.fillCircle = function(x, y, fillStyle) {
		gfx.beginPath();
		gfx.arc((x+0.5) * scale, (y+0.5) * scale, scale / 2, 0, 2*Math.PI);
		gfx.save();
		gfx.fillStyle = fillStyle;
		gfx.fill();
		gfx.restore();
	}
	this.print = function(x, y, text, fillStyle) {
		gfx.save();
		gfx.fillStyle = fillStyle;
		gfx.fillText(text, x * scale, y * scale + 10);
		gfx.restore();
	};
        this.bresenham = function bresenham(x0, y0, x1, y1, color) {
		var dx = Math.abs(x1-x0), sx = Math.sign(x1-x0);
		var dy = Math.abs(y1-y0), sy = Math.sign(y1-y0);
		var D = (dx>dy ? dx : -dy) / 2;
                var x = x0, y = y0;
		while (true) {
			grid[x][y].style.background = color || 'red';
			if (x === x1 && y === y1) break;
			var d = D;
			if (d > -dx) {
				D -= dy;
				x += sx;
			}
			if (d < dy) {
				D += dx;
				y += sy;
			}
		}
	}

	var layers = {}, zLayers = [];
	this.createLayer = function(id, z) {
		var layer = new Layer(id, z);
		layers[id] = layer;
		zLayers[z] = layer;
	};
	this.fillLayer = function(id, color, alphaMap) {
		var layer = layers[id];
		if (layer) {
			layer.fill(color, alphaMap);
		}
	};

	function Layer(id, z) {
		var layer = document.createElement('DIV');
		canvas.appendChild(layer);
		layer.id = id;

		var layerStyle = layer.style;
		layerStyle.position = 'absolute';
		layerStyle.top = 0;
		layerStyle.right = 0;
		layerStyle.bottom = 0;
		layerStyle.left = 0;
		layerStyle.zIndex = 10 + z;
		layerStyle.pointerEvents = 'none';

		var layerGrid = []
		for (var x = 0; x < cols; x++) {
			layerGrid[x] = [];
			for (var y = 0; y < rows; y++) {
				var cell = document.createElement('DIV');

				var cellStyle = cell.style;
				cellStyle.position = 'absolute';
				cellStyle.top = y * scale + 'px';
				cellStyle.left = x * scale + 'px';
				cellStyle.width = scale + 'px';
				cellStyle.height = scale + 'px';

				layer.appendChild(cell);
				layerGrid[x][y] = cell;
			}
		}

		this.fill = function(color, alphaMap) {
			for (var x = 0; x < cols; x++) {
				for (var y = 0; y < rows; y++) {
					var alpha = alphaMap ? (alphaMap[x] || ø)[y] : 1, cellStyle = layerGrid[x][y].style;
					cellStyle.background = alpha ? color : 'none';
					cellStyle.opacity = alpha;
				}
			}
		};
	}

	function DisplayEntity(id, opts) {
		var div = document.createElement('DIV');
		this.id = div.id = id;

		var divStyle = div.style;
		divStyle.position = 'absolute';

		opts = opts || {};

		var position = opts.position || [0, 0];
		divStyle.top = position[1] * scale + 'px';
		divStyle.left = position[0] * scale + 'px';

		var size = opts.size || [1, 1];
		divStyle.width = size[0] * scale + 'px';
		divStyle.height = size[1] * scale + 'px';

		if (opts.hidden) {
			divStyle.display = 'none';
		}

		if ('color' in opts) {
			divStyle.background = opts.color;
		}
		if ('image' in opts) {
			if (typeof opts.image == 'object') {
				var imageOpts = opts.image;
				divStyle.background = 'url("' + imageOpts.url.replace(/"/g, '\\"') + '") ' + (imageOpts.repeat || 'no-repeat');
			} else {
				divStyle.background = 'url("' + opts.image.replace(/"/g, '\\"') + '") no-repeat top left';
			}
		}
		// users of Display ask for creation of DisplayEntities
		// display entities can be updated (position, appearance, UI behavior...)
		// they have a size and can interact with mouse events
		// they can be added, effectively nesting them into each other - entity hierarchy hijacks DOM hierarchy!
		// attachments can be added to a display entity (usually game objects)
	}

	document.addEventListener('keydown', onkeydown.bind(this));
	function onkeydown(e) {
		typeof this.onkeydown == 'function' && this.onkeydown(e);
	}
}
