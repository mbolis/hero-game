var Scheduler = (function() {
	return new Scheduler();

	function Scheduler() {
		var queue = this.queue=[];
		this.add = function(time, action) {
			if (!queue.length) {
				queue.push([time, action]);
			} else {
				for (var i = 0; i < queue.length; i++) {
					var evt = queue[i];
					if (evt[0] > time) {
						queue.splice(i, 0, [time, action]);
						return;
					}
				}
				queue.push([time, action]);
			}
		};
		this.poll = function() {
			if (!queue.length) {
				return;
			}
		
			var action = queue.shift()[1];
			if (typeof action == 'function') return action();
		};
		this.cancel = function(action) {
			if (queue.length) {
				for (var i = 0; i < queue.length; i++) {
					var evt = queue[i];
					if (evt[1] == action) {
						queue.splice(i, 1);
						return;
					}
				}
			}
		};
		this.touch = function(action, time) {
			if (queue.length) {
				var iTouch, evtTouch;
				for (var i = 0; i < queue.length; i++) {
					var evt = queue[i];
					if (iTouch == null && evt[0] > time) {
						if (evtTouch) {
							queue.splice(i, 0, [time, action]);
							return;
						}
						iTouch = i;
					}
					if (!evtTouch && evt[1] == action) {
						evtTouch = queue.splice(i, 1);
						if (iTouch != null) {
							queue.splice(iTouch, 0, [time, action]);
							return;
						}
					}
				}
				if (evtTouch) {
					queue.push([time, action]);
				}
			}
		};
	}
}());
