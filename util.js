var ø = [];

/**
 * -----    |||||
 * -----    |||||
 * ----- => |||||
 * -----    |||||
 * -----    |||||
 */
function rows2cols(grid) {
	return Matrix.transpose(grid);
}

/**
 * XXX: Only for convenience ─ 
 * ┌                   ┐
 * │ ····· ***** ----- │    [·*-][·*-][·*-][·*-][·*-]
 * │ ····· ***** ----- │    [·*-][·*-][·*-][·*-][·*-]
 * │ ····· ***** ----- │ => [·*-][·*-][·*-][·*-][·*-]
 * │ ····· ***** ----- │    [·*-][·*-][·*-][·*-][·*-]
 * │ ····· ***** ----- │    [·*-][·*-][·*-][·*-][·*-]
 * └                   ┘
 */
function layers2stacks(layers) {
	var root = layers[0];
	var features = layers.slice(1);
	return Matrix.map(root, function(elem, x, y) {
		return [elem].concat(features.map(function(layer) { return Matrix.get(layer, x, y); }).filter(NOT_NULL));
	});
}

function NOT_NULL(x) {
	return x != null;
}
function Return(x) {
	return function() { return x; };
}
function ObjectFrom(x) {
	return function() { return Object.create(x); };
}

var Matrix = {
	of : function(w, h, defaultValue) {
		if (typeof w == 'object' && 'cols' in w && 'rows' in w) {
			defaultValue = h;
			h = w.rows;
			w = w.rows;
		} else if (h == null) {
			h = w;
		}
		var factory = typeof defaultValue == 'function' && defaultValue;
		return Array.apply(null, Array(w)).map(function(a, x) {
			return Array.apply(null, Array(h)).map(function(b, y) {
				return factory ? factory(x, y) : defaultValue;
			});
		});
	},
	size : function(matrix) {
		return {
			cols : matrix.length,
			rows : (matrix[0] || ø).length
		};
	},
	clear : function(matrix, defaultValue) {
		var factory = typeof defaultValue == 'function' && defaultValue;
		for (var x = 0; x < matrix.length; x++) {
			for (var y = 0; y < matrix[x].length; y++) {
				matrix[x][y] = factory ? factory(x, y) : defaultValue;
			}
		}
	},
	get : function(matrix, x, y) {
		return (matrix[x] || ø)[y];
	},
	put : function(matrix, x, y, value) {
		(matrix[x] || (matrix[x] = []))[y] = value;
	},
	transpose : function(matrix) {
		var trans = [[]];
		for (var y = 0; y < matrix.length; y++) {
			var row = matrix[y];
			for (var x = 0; x < row.length; x++) {
				(trans[x] || (trans[x] = []))[y] = row[x];
			}
		}
		return trans;
	},
	slice : function(matrix, ox, oy, width, height) {
		var sub = [];
		for (var x = 0; x < width; x++) {
			sub[x] = [];
			for (var y = 0; y < height; y++) {
				sub[x][y] = (matrix[ox + x] || ø)[oy + y];
			}
		}
		return sub;
	},
	forEach : function(matrix, fn) {
		matrix.forEach(function(col, x) {
			col.forEach(function(cell, y) {
				fn(cell, x, y);
			});
		});
		return matrix;
	},
	map : function(matrix, fn) {
		return matrix.map(function(col, x) {
			return col.map(function(cell, y) {
				return fn(cell, x, y);
			});
		});
	},
	reduce : function(matrix, fn, init) {
		return matrix.reduce(function(acc, col, x) {
			return col.reduce(function(acci, cell, y) {
				return fn(acci, cell, x, y);
			}, acc);
		}, init);
	},
	min : function(grid) {
		return grid.reduce(function(min, col) {
			return Math.min(min, col.reduce(function(min, x) {
				return x != null ? Math.min(min, x) : min;
			}, min));
		}, Number.MAX_VALUE);
	},
	max : function(grid) {
		return grid.reduce(function(max, col) {
			return Math.max(max, col.reduce(function(max, x) {
				return x != null ? Math.max(max, x) : max;
			}, max));
		}, Number.MIN_VALUE);
	},
	toString : function(matrix) {
		return matrix.map(function(col) {
			return col.join('');
		}).join('\n');
	}
};
Object.freeze(Matrix);

function View(ox, oy, width, height) {
	var xmax = ox + width, ymax = oy + height;
	var view = {
		offset : { x : ox, y : oy },
		size : { width : width, height : height },
		clear : function(matrix) {
			var size = Matrix.size(matrix);
			for (var x = ox; x < Math.min(xmax, size.width); x++) {
				for (var y = oy; y < Math.min(ymax, size.height); y++) {
					delete matrix[x][y];
				}
			}
		},
		get : function(matrix, x, y) {
			if (x >= 0 && x < width && y >= 0 && y < height) {
				return Matrix.get(matrix, ox + x, oy + y);
			}
		},
		put : function(matrix, x, y, value) {
			if (x >= 0 && x < width && y >= 0 && y < height) {
				Matrix.put(matrix, ox + x, oy + y, value);
			}
		},
		slice : function(matrix) {
			return Matrix.slice(matrix, ox, oy, width, height);
		},
		forEach : function(matrix, fn) {
			for (var x = 0; x < width; x++) {
				for (var y = 0; y < height; y++) {
					fn(Matrix.get(matrix, ox + x, oy + y), x, y);
				}
			}
		},
		map : function(matrix, fn) {
			return Matrix.map(this.slice(matrix), fn);
		},
		toString : function(matrix) {
			return Matrix.toString(this.slice(matrix));
		}
	};
	Object.freeze(view.offset);
	Object.freeze(view.size);
	Object.freeze(view);
	return view;
}
