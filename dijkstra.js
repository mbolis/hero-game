var SQRT_2 = Math.sqrt(2);
function DijkstraMap(tiles, cost) { // TODO : cost(sx, sy, dx, dy)
	var size = Matrix.size(tiles), map = Matrix.of(size, Number.MAX_SAFE_INTEGER);
	map.update = update;
	return map;

	function update(zeros) {
		Matrix.clear(map, Number.MAX_SAFE_INTEGER);
		if (zeros) {
			for (var i = 0; i < zeros.length; i++) {
				var zero = zeros[i], zx = zero[0], zy = zero[1];
				if (zx < 0 || zx >= size.cols || zy < 0 || zy >= size.rows) {
					continue;
				}

				map[zx][zy] = 0;
				var open = [zero], close = new CoordSet();
				while (open.length) {
					var next = open.shift(), x = next[0], y = next[1], val = map[x][y];
					var neigh = neighbors(map, x, y);
					for (var ni = 0; ni < neigh.length; ni++) {
						var n = neigh[ni], nx = n[0], ny = n[1];
						if (!close.has(n)) {
							var cn = cost(x, y, nx, ny);
							if (cn >= 0) {
								var vn = map[nx][ny], dn = val + cn;
								if (vn > dn) {
									map[nx][ny] = dn;
									open.push(n);
								}
							}
						}
					}
					close.add(next);
				}
			}
		}
		return map;
	}

	function neighbors(map, x, y) {
		var size = Matrix.size(map), neigh = [];
		for (var nx = x - 1; nx <= x + 1; nx++) {
			for (var ny = y - 1; ny <= y + 1; ny++) {
				if ((nx != x || ny != y) && nx >= 0 && nx < size.cols && ny >= 0 && ny < size.rows) {
					neigh.push([nx, ny]);
				}
			}
		}
		return neigh;
	}

	function CoordSet(iter) {
		var set = new Set();
		this.add = function(coord) {
			set.add(coord[0] + ',' + coord[1]);
		};

		if (iter) {
			for (var i = 0; i < iter.length; i++) {
				this.add(iter[i]);
			}
		}

		this.has = function(coord) {
			return set.has(coord[0] + ',' + coord[1]);
		};
		this.next = function() {
			var next = set.entries().next().value;
			if (next) {
				next = next[0];
				set.delete(next);
				next = next.split(/,/).map(parseFloat);
			}
			return next;
		};
		Object.defineProperty(this, 'size', {
			get : function() { return set.size; }
		});
	}
}
