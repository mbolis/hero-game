/*
 * Field of View algorithm adapted and expanded from an original concept by Bob Nystrom
 * http://journal.stuffwithstuff.com/2015/09/07/what-the-hero-sees/
 */

var Octant = [
	function(x, y) { return [x, y]; },
	function(x, y) { return [y, x]; },
	function(x, y) { return [-y, x]; },
	function(x, y) { return [-x, y]; },
	function(x, y) { return [-x, -y]; },
	function(x, y) { return [-y, -x]; },
	function(x, y) { return [y, -x]; },
	function(x, y) { return [x, -y]; }
];
Object.freeze(Octant);

function FieldOfView(grid) {
	var Q = 0.4;

	var gridSize = Matrix.size(grid);
	var fov = Matrix.of(gridSize.cols, gridSize.rows, ObjectFrom({ explored : false }));

	var radius = 0, sweep = Sweep();
	Object.defineProperty(fov, 'radius', {
		get : function() {
			return radius;
		},
		set : function(r) {
			radius = r;
			sweep = Sweep(r);
		}
	});
	function Sweep(r) {
		var sweep = [];
		for (var x = 0; x <= radius; x++) {
			sweep[x] = [];
			for (var y = 0; y <= x; y++) {
				var dist = Math.round(Math.sqrt(x*x + y*y));
				if (dist <= radius) {
					sweep[x][y] = true;
				}
			}
		}
		Object.freeze(sweep);

		return {
			scan : function(octant, fn) {
				if (typeof fn != 'function') {
					throw new Error('Invalid argument `fn` is not a function');
				}
				var transpose = Octant[octant];
				for (var x = 0; x < sweep.length; x++) {
					var slopeStep = 1 / (x+1);
					for (var y = 0; y < sweep[x].length; y++) {
						var xy = transpose(x, y);
						fn(xy[0], xy[1], slope(y, slopeStep));
					}
				}
			}
		};
	}

	fov.explore = function(cx, cy) {
		Matrix.forEach(fov, function(cell) {
			delete cell.visibility;
		});
		for (var i = 0; i < 8; i++) {
			var shadows = [];
			sweep.scan(i, function (ox, oy, slopeRange) {
				var x = cx + ox, y = cy + oy;
				var tile = Matrix.get(grid, x, y);
				if (tile) {
					var v = visibility(slopeRange, shadows);
					if (v != 0) {
						var cell = Matrix.get(fov, x, y);
						// visibilityMap.put(x, y, Math.max(0, v - Q) / (1-Q)); // FIXME
						cell.visibility = v; //
						if (tile.terrain == '#') {
							merge(slopeRange, shadows);
							cell.explored = true;
						} else if (v >= Q) {
							cell.explored = true;
						}
					}
				}
			});
		}
	};

	return fov;

	function slope(y, step) {
		return [y * step, (y+1) * step];
	}
	function visibility(range, shadows) {
		var totalCover = 0;
		for (var i = 0; i < shadows.length; i++) {
			var shadow = shadows[i];
			if (shadow[0] <= range[0] && shadow[1] >= range[1]) {
				return 0;
			}
			var cover;
			if (shadow[0] < range[0] && shadow[1] > range[0]) {
				cover = shadow[1] - range[0];
			} else if (shadow[0] < range[1] && shadow[1] > range[1]) {
				cover = range[1] - shadow[0];
			}
			if (cover) {
				totalCover += cover / (range[1] - range[0]);
			}
			if (shadow[0] > range[1]) {
				break;
			}
		}
		return Math.max(0, 1 - totalCover);
	}
	function merge(range, shadows) {
		shadows.push(range);
		if (shadows.length == 1) {
			return;
		}
		shadows.sort(function(s1, s2) { return s1[0] - s2[0]; });
		var prev = shadows[0], curr;
		for (var i = 1; i < shadows.length; i++) {
			curr = shadows[i];
			if (prev[1] >= curr[0]) {
				prev[1] = Math.max(prev[1], curr[1]);
				shadows.splice(i--, 1);
			} else {
				prev = curr;
			}
		}
	}
}

