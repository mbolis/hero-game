function randomPillarForest(width, height, p) {
	p = p || 0.8;
	var level = Matrix.of(width, height, ' ');
	level.forEach(function(c, x, y) {
		if (Math.random() > p) {
			level.put(x, y, '#');
		}
	});
	return level;
}
function randomDungeonLevel(width, height) {
	// pick start position : downwards / upwards / sidewards ??
	// lay chamber : natural / rough / precise / masterwork / ... ??
	// connect more like chambers : larger and smaller, start with a likely list of "functions" for the chambers or generate them on the fly
	// generate related features (ore lodes, rivers, vents, fissures, magma chambers, ...) ; these could span the entire level if appropriate ; they can define new goals / flavour
	// generate parallel events
}

var RNG = (function() {
	return {
		next : next,
		nextInt : nextInt,
		nextGaussian : nextGaussian,
		oneOf : oneOf
	};

	function next() {
		return Math.random();
	}

	function nextInt(min, max) {
		if (max == null) {
			max = min;
			min = 0;
		}
		return min + Math.random() * (max - min);
	}

	var gauss;
	function nextGaussian() {
		var retVal;
		if (gauss != null) {
			retVal = gauss;
			gauss = null;
		} else {
			var x1, x2, w;
			do {
				x1 = 2*Math.random() - 1;
				x2 = 2*Math.random() - 1;
				w = x1*x1 + x2*x2
			} while (w >= 1);

			w = Math.sqrt(-2*Math.log(w) / w);

			retVal = x1 * w;
			gauss = x2 * w;
		}
		return retVal;
	}

	function oneOf(obj) {
		var arr;
		if (obj instanceof Array) {
			arr = obj;
		} else {
			arr = [];
			for (var key in obj) {
				var value = obj[key];
				for (var i = 0; i < value; i++) {
					arr.push(key);
				}
			}
		}
		return arr[nextInt(arr.length)];
	}
}());

function fillNoise(grid, scale, alg, seed) {
	var size;
	if (typeof grid == 'number') {
		grid = Matrix.of(grid);
	}
	size = Matrix.size(grid);
	var sx = scale / size.cols, sy = scale / size.rows;
	alg = (alg || 'perlin') + '2';
	noise.seed(seed || Date.now());
	return Matrix.forEach(grid, function(z, x, y) {
		grid[x][y] = noise[alg](x * sx, y * sy);
	});
}

function fractalNoise(grid, depth, roughness, alg, seed) {
	roughness = roughness || 0.5;
	var size;
	if (typeof grid == 'number') {
		grid = Matrix.of(grid);
	}
	size = Matrix.size(grid);
	var k = 1, sx = 2 / size.cols, sy = 2 / size.rows;
	alg = (alg || 'perlin') + '2';
	noise.seed(seed || Date.now());
	for (var i = 0; i < depth; i++) {
		Matrix.forEach(grid, function(z, x, y) {
			grid[x][y] = (z || 0) + k * noise[alg](x * sx, y * sy);
		});
		k *= roughness;
		sx *= 2;
		sy *= 2;
	}
	return grid;
}

function brownianMotion(grid, sx, sy, length, scale) {
	var size;
	if (typeof grid == 'number') {
		grid = Matrix.of(grid, grid, 0);
	}
	size = Matrix.size(grid);
	Matrix.put(grid, sx, sy, 1);
	for (var i = 0; i < length; i++) {
		var nx = Math.round(sx + scale * RNG.nextGaussian());
		var ny = Math.round(sy + scale * RNG.nextGaussian());

		var xmin, xmax, dx;
		if (sx < nx) {
			xmin = sx;
			xmax = nx;
		} else {
			xmin = nx;
			xmax = sx;
		}
		dx = xmax - xmin;

		var ymin, ymax, dy = ny - sy;
		if (sy < ny) {
			ymin = sy;
			ymax = ny;
		} else {
			ymin = ny;
			ymax = sy;
		}

		for (var x = 0; x < dx; x++) {
			var y = Math.round(x / dx * dy);
			if (xmin + x >= 0 && xmin + x < size.cols && ymin + y >= 0 && ymin + y < size.rows) {
				Matrix.put(grid, xmin + x, ymin + y, 1);
			}
		}
		if (nx >= 0 && nx < size.cols && ny >= 0 && ny < size.rows) {
			Matrix.put(grid, nx, ny, 1);
		}
		sx = nx;
		sy = ny;
	}
	return grid;
}

function brownianPath(length, scale) {
	var sx = 0, sy = 0, path = [[sx, sy]];
	for (var i = 0; i < length; i++) {
		var nx = Math.round(sx + scale * RNG.nextGaussian());
		var ny = Math.round(sy + scale * RNG.nextGaussian());

		path.push([nx, ny]);
		sx = nx;
		sy = ny;
	}
	return path;
}
function radialGradient(radius, depth) {
	var size = 2* radius + 1, step = depth / radius;
	var gradient = Matrix.of(size, size);
	for (var r = 0; r <= radius; r++) {
		for (var x = 0; x <= r; x++) {
			for (var y = 0; y <= r; y++) {
				if (!gradient[radius + x][radius + y]) {
					var dist = Math.round(Math.sqrt(x*x + y*y));
					if (dist <= r) {
						gradient[radius + x][radius + y] = depth;
						gradient[radius - y][radius + x] = depth;
						gradient[radius - x][radius - y] = depth;
						gradient[radius + y][radius - x] = depth;
					}
				}
			}
		}
		depth -= step;
	}
	return gradient;
}

function swirl(src, cx, cy, radius, twists) {
	var size = Matrix.size(src);
	var dest = Matrix.of(size.cols, size.rows);
	for (var x = 0; x < size.cols; x++) {
		for (var y = 0; y < size.rows; y++) {
			var px = x - cx, py = y - cy;
			var dist = Math.sqrt(px*px + py*py);
			var theta = Math.atan2(py, px);
			var amt = 1 - (dist / radius);
			if (amt > 0) {
				theta += twists * amt * 2*Math.PI;
				px = Math.round(Math.cos(theta) * dist);
				py = Math.round(Math.sin(theta) * dist);
			}

			dest[x][y] = Matrix.get(src, cx + px, cy + py) || 0;
		}
	}
	return dest;
}

function brownianGradient(grid, sx, sy, length, scale, depth) {
	var size;
	if (typeof grid == 'number') {
		grid = Matrix.of(grid, grid, 0);
	}
	size = Matrix.size(grid);
	Matrix.put(grid, sx, sy, 1);

	var step = 1 / depth;
	for (var i = 0; i < length; i++) {
		var nx = Math.round(sx + scale * RNG.nextGaussian());
		var ny = Math.round(sy + scale * RNG.nextGaussian());

		var xmin, xmax, dx;
		if (sx < nx) {
			xmin = sx;
			xmax = nx;
		} else {
			xmin = nx;
			xmax = sx;
		}
		dx = xmax - xmin;

		var ymin, ymax, dy;
		if (sy < ny) {
			ymin = sy;
			ymax = ny;
		} else {
			ymin = ny;
			ymax = sy;
		}
		dy = ymax - ymin;

		if (nx < size.cols && ny < size.rows) {
			Matrix.put(grid, nx, ny, 1);
		}
		for (var d = 1; d < depth; d++) {
			var value = 1 - (d * step);
			Ring(nx, ny, d).forEach(function(xy) {
				var x = xy[0], y = xy[1];
				if (x < size.cols && y < size.rows && (Matrix.get(grid, x, y) || 0) < value) {
					Matrix.put(grid, x, y, value);
				}
			});
		}

		sx = nx;
		sy = ny;
	}
	return grid;
}

function Ring(cx, cy, radius) {
	var ring = [ [], [], [], [] ];
	for (var x = 0; x <= radius; x++) {
		for (var y = 0; y <= radius; y++) {
			var dist = Math.round(Math.sqrt(x*x + y*y));
			if (dist == radius) {
				ring[0].push([cx + x, cy + y]);
				ring[1].push([cx + y, cy - x]);
				ring[2].push([cx - x, cy - y]);
				ring[3].push([cx - y, cy + x]);
			}
		}
	}
	ring = ring.reduce(function(a, q) { return a.concat(q); }, []);
	return ring;
}

function lerp(v0, v1, t) { return v0 * (1-t) + v1 * t; }
function smoothstep(t) { return t*t * (3 - 2*t); }
function quintic(t) { return t*t*t * (t * (t * 6 - 15) + 10); }
function dot(v1, v2) { return v1[0] * v2[0] + v1[1] * v2[1]; }

function normalize(grid) {
	var min = Matrix.min(grid), max = Matrix.max(grid), delta = max - min;
	return Matrix.map(grid, function(v) { return (v - min) / delta; });
}

function valueNoise(resolution, grain) {
	var size = Math.pow(2, resolution), grain = size / Math.pow(2, grain);
	var grid = Matrix.of(size);
	for (var x = 0; x < size; x += grain) {
		for (var y = 0; y < size; y += grain) {
			Matrix.put(grid, x, y, RNG.next());
		}
	}

	var mask = size - 1;
	for (var x = 0; x < size; x++) {
		var x0 = grain * (0| x / grain);
		var x1 = (x0 + grain) & mask;
		var dx = x - x0;

		var sx = smoothstep(dx / grain);

		for (var y = 0; y < size; y++) {
			var y0 = grain * (0| y / grain);
			var y1 = (y0 + grain) & mask;
			var dy = y - y0;

			var sy = smoothstep(dy / grain);

			var nx0 = lerp(grid[x0][y0], grid[x0][y1], sy);
			var nx1 = lerp(grid[x1][y0], grid[x1][y1], sy);
			grid[x][y] = lerp(nx0, nx1, sx);
		}
	}

	return grid;
}

function kernel(grid, kern, wrapMode) {
	var ksize = Matrix.size(kern);
	var radius = 0| ksize.rows / 2;
	var size = Matrix.size(grid);
	var ext = Matrix.of(size.cols + 2*radius, size.rows + 2*radius, function(x, y) {
		var xo = x - radius, yo = y - radius;
		if (wrapMode == 'wrap') {
			if (xo < 0) {
				xo = size.cols - xo;
			} else if (xo >= size.cols) {
				xo -= size.cols;
			}
			if (yo < 0) {
				yo = size.rows - yo;
			} else if (yo >= size.rows) {
				yo -= size.rows;
			}
		} else if (wrapMode == 'bleed') {
			if (xo < 0) {
				xo = 0;
			} else if (xo >= size.cols) {
				xo = size.cols - 1;
			}
			if (yo < 0) {
				yo = 0;
			} else if (yo >= size.rows) {
				yo = size.rows - 1;
			}
		} else if (wrapMode == 'mirror') {
			if (xo < 0) {
				xo = -xo;
			} else if (xo >= size.cols) {
				xo = 2*size.cols - xo;
			}
			if (yo < 0) {
				yo = -yo;
			} else if (yo >= size.rows) {
				yo = 2*size.rows - yo;
			}
		}
		return Matrix.get(grid, xo, yo) || 0;
	});

	return Matrix.map(grid, function(val, x, y) {
		return Matrix.reduce(kern, function(out, val, kx, ky) {
			return out + val * ext[x + kx][y + ky];
		}, kern.bias || 0) * (kern.factor || 1);
	});
}
var Filters = {
	blur : function(radius) {
		var kern = [], length = 2*radius + 1;

		var center = [];
		for (var y = 0; y < length; y++) {
			center.push(1);
		}
		kern.push(center);

		var samples = length;
		for (var i = 0; i < radius; i++) {
			samples += 2*(length - 2*i);

			var col = center.slice();
			for (var y = 0; y <= i; y++) {
				col[y] = col[length - 1 - y] = 0;
			}
			kern.push(col);
			kern.unshift(col.slice());
		}

		kern.factor = 1 / samples;
		return kern;
	},
	motionBlur : function(radius, direction) {
		var length = 2*radius + 1, kern = Matrix.of(length, length, 0);
		if (direction == '/') {
			for (var i = 0; i < length; i++) {
				kern[i][length - 1 - i] = 1;
			}
		} else if (direction == '-') {
			for (var i = 0; i < length; i++) {
				kern[i][radius] = 1;
			}
		} else if (direction == '\\') {
			for (var i = 0; i < length; i++) {
				kern[i][i] = 1;
			}
		}
		if (direction == '|') {
			for (var i = 0; i < length; i++) {
				kern[radius][i] = 1;
			}
		}

		kern.factor = 1 / length;
		return kern;
	},
	sharpen : function(smooth) {
		if (smooth == 'smooth') {
			var kern = [
				[-1,-1,-1,-1,-1],
				[-1, 2, 2, 2,-1],
				[-1, 2, 8, 2,-1],
				[-1, 2, 2, 2,-1],
				[-1,-1,-1,-1,-1]
			];
			kern.factor = 1 / 8;
			return kern;
		}
		if (smooth == 'harsh') {
			return [
				[1, 1, 1],
				[1,-7, 1],
				[1, 1, 1]
			];
		}
		return [
			[-1,-1,-1],
			[-1, 9,-1],
			[-1,-1,-1]
		];
	},
	emboss : function(radius, direction) {
		direction = direction || 'nw';
		var length = 2*radius + 1, kern = Matrix.of(length, length, 1);
		var max = length - 1;
		if (direction == 'nw') {
			for (var x = 0; x < length; x++) {
				for (var y = 0; y < max - x; y++) {
					kern[x][y] = -1;
				}
				kern[x][y] = 0;
			}
		} else if (direction == 'ne') {
			for (var x = 0; x < length; x++) {
				for (var y = 0; y < max - x; y++) {
					kern[x][max - y] = -1;
				}
				kern[x][max - y] = 0;
			}
		} else if (direction == 'se') {
			for (var x = 0; x < length; x++) {
				kern[x][max - x] = 0;
				for (var y = length - x; y < length; y++) {
					kern[x][y] = -1;
				}
			}
		} else if (direction == 'sw') {
			for (var x = 0; x < length; x++) {
				kern[x][x] = 0;
				for (var y = length - x; y < length; y++) {
					kern[x][max - y] = -1;
				}
			}
		}

		kern.bias = 0.5;
		return kern;
	},
	mean : function(radius) {
		var length = 2*radius + 1, kern = Matrix.of(length, length, 1);
		kern.factor = 1 / (length*length);
		return kern;
	}
};

function testNoise(grid) {
	var canvas = document.getElementsByTagName('CANVAS')[0];
	var g = canvas.getContext('2d');
	g.fillStyle = 'black';
	g.fillRect(0, 0, canvas.width, canvas.height);

	var min = Matrix.min(grid), max = Matrix.max(grid);
	Matrix.forEach(grid, function(v, x, y) {
		var alpha = ((v || 0) - min) / (max - min)
		g.fillStyle = 'rgba(255,255,255,' + alpha + ')';
		g.fillRect(x, y, 1, 1);
	});
}
