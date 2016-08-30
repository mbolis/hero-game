function EventTarget(target) {
	var router = {};

	Object.defineProperties(target, {
		on : {
			value : function(event, listener) {
				if (typeof listener != 'function') {
					throw new Error('Listener must be a function.');
				}

				var queue = router[event] || (router[event] = []);
				queue.push(listener);

				return this;
			}
		},
		one : {
			value : function(event, listener) {
				if (typeof listener != 'function') {
					throw new Error('Listener must be a function.');
				}

				function fire() {
					target.off(event, fire);
					listener.apply(this, arguments);
				}
				fire.listener = listener;
				target.on(event, listener);

				return this;
			}
		},
		off : {
			value : function(event, listener) {
				var queue = router[event];
				if (queue) {
					if (typeof listener == 'function') {
						for (var i = 0; i < queue.length; i++) {
							var curr = queue[i];
							if (curr == listener || curr.listener == listener) {
								queue.splice(i, 1);
								break;
							}
						}
						if (!queue.length) {
							delete router[event];
						}
					} else if (listener == '*') {
						delete router[event];
					} else {
						throw Error('Listener must be either a function or "*".');
					}
				}
				return this;
			}
		},
		dispatch : {
			value : function() {
				var args = Array.prototype.slice.call(arguments), event = args.shift(), queue = router[event];
				if (queue) {
					for (var i = 0; i < queue.length; i++) {
						queue[i].apply(this, args);
					}
				}
				return this;
			}
		}
	});
}
