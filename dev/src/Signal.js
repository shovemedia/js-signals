/*global signals:false, SignalBinding:false*/

	// Signal --------------------------------------------------------
	//================================================================

	function validateListener(listener, fnName) {
		if (typeof listener !== 'function') {
			throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
		}
	}

	/**
	 * Custom event broadcaster
	 * <br />- inspired by Robert Penner's AS3 Signals.
	 *
	 * @author Miller Medeiros
	 * @author <br />Jon Williams (type-checking enhancement)
	 * 
	* @param {...*} [params] can be:
	* <br />null (no type-checking), 
	* <br />OR a list of arguments matching the types of arguments to be dispatched, 
	* <br />OR a named hash of arguments if dispatching a named hash single object argument.
	 * 
	 * @constructor
	 * 
	 *
	 */
	signals.Signal = function () {
		/**
		 * @type Array.<SignalBinding>
		 * @private
		 */
		 
		var args = Array.prototype.slice.call(arguments);
				
		if (args.length > 1 || (args.length > 0 && !(isPlainObject(args[0]))) )
		{
			   //use standard arguments 'array'
			   this._argumentTypes = args;
			   this._argumentIsHash = false;
		}
		else if (args.length == 1 && (args[0] instanceof Object) )
		{
			   //use single-argument named hash
			   this._argumentTypes = arguments[0];
			   this._argumentIsHash = true;
		}
			   
				 
		this._bindings = [];
		this._prevParams = null;
	};

	signals.Signal.prototype = {

		/**
		 * If Signal should keep record of previously dispatched parameters and
		 * automatically execute listener during `add()`/`addOnce()` if Signal was
		 * already dispatched before.
		 * @type boolean
		 */
		memorize : false,

		/**
		 * @type boolean
		 * @private
		 */
		_shouldPropagate : true,

		/**
		 * If Signal is active and should broadcast events.
		 * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
		 * @type boolean
		 */
		active : true,

		/**
		 * @param {Function} listener
		 * @param {boolean} isOnce
		 * @param {Object} [listenerContext]
		 * @param {Number} [priority]
		 * @return {SignalBinding}
		 * @private
		 */
		_registerListener : function (listener, isOnce, listenerContext, priority) {

			var prevIndex = this._indexOfListener(listener, listenerContext),
				binding;

			if (prevIndex !== -1) {
				binding = this._bindings[prevIndex];
				if (binding.isOnce() !== isOnce) {
					throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
				}
			} else {
				binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
				this._addBinding(binding);
			}

			if(this.memorize && this._prevParams){
				binding.execute(this._prevParams);
			}

			return binding;
		},

		/**
		 * @param {SignalBinding} binding
		 * @private
		 */
		_addBinding : function (binding) {
			//simplified insertion sort
			var n = this._bindings.length;
			do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
			this._bindings.splice(n + 1, 0, binding);
		},

		/**
		 * @param {Function} listener
		 * @return {number}
		 * @private
		 */
		_indexOfListener : function (listener, context) {
			var n = this._bindings.length,
				cur;
			while (n--) {
				cur = this._bindings[n];
				if (cur._listener === listener && cur.context === context) {
					return n;
				}
			}
			return -1;
		},

		/**
		 * Check if listener was attached to Signal.
		 * @param {Function} listener
		 * @param {Object} [context]
		 * @return {boolean} if Signal has the specified listener.
		 */
		has : function (listener, context) {
			return this._indexOfListener(listener, context) !== -1;
		},

		/**
		 * Add a listener to the signal.
		 * @param {Function} listener Signal handler function.
		 * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
		 * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
		 * @return {SignalBinding} An Object representing the binding between the Signal and listener.
		 */
		add : function (listener, listenerContext, priority) {
			validateListener(listener, 'add');
			return this._registerListener(listener, false, listenerContext, priority);
		},

		/**
		 * Add listener to the signal that should be removed after first execution (will be executed only once).
		 * @param {Function} listener Signal handler function.
		 * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
		 * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
		 * @return {SignalBinding} An Object representing the binding between the Signal and listener.
		 */
		addOnce : function (listener, listenerContext, priority) {
			validateListener(listener, 'addOnce');
			return this._registerListener(listener, true, listenerContext, priority);
		},

		/**
		 * Remove a single listener from the dispatch queue.
		 * @param {Function} listener Handler function that should be removed.
		 * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
		 * @return {Function} Listener handler function.
		 */
		remove : function (listener, context) {
			validateListener(listener, 'remove');

			var i = this._indexOfListener(listener, context);
			if (i !== -1) {
				this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
				this._bindings.splice(i, 1);
			}
			return listener;
		},

		/**
		 * Remove all listeners from the Signal.
		 */
		removeAll : function () {
			var n = this._bindings.length;
			while (n--) {
				this._bindings[n]._destroy();
			}
			this._bindings.length = 0;
		},

		/**
		 * @return {number} Number of listeners attached to the Signal.
		 */
		getNumListeners : function () {
			return this._bindings.length;
		},

		/**
		 * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
		 * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
		 * @see signals.Signal.prototype.disable
		 */
		halt : function () {
			this._shouldPropagate = false;
		},

		/**
		 * Dispatch/Broadcast Signal to all listeners added to the queue.
		 * @param {...*} [params] Parameters that should be passed to each handler.
		 * @throws Error if parameters do not match the signature provided to the Signal constructor.
		 */
		dispatch : function (params) {
			if (! this.active) {
				return;
			}

			var paramsArr = Array.prototype.slice.call(arguments),
				n = this._bindings.length,
				bindings;

				
			// strict parameter type checking
			
			if (this._argumentTypes)
			{	    
				// single argument named hash
				if (this._argumentIsHash)
				{
					if (paramsArr.length != 1)
					{
						throw ( new Error ('strict Signal argument length Mismatch. Expected single argument, named hash. Got: ' + paramsArr.length));
					}
					
					var signalData = paramsArr[0];
					
					for (var i in this._argumentTypes)
					{
						var value = signalData[i];
						var expectedType = this._argumentTypes[i];
						
						verifyType(value, expectedType, i);					 
					}   
				}
				else
				{
					// standard arguments 'array'
					if (paramsArr.length != this._argumentTypes.length)
					{
						throw ( new Error ('strict Signal argument length Mismatch. Expected: ' + this._argumentTypes.length + '. Got: ' + paramsArr.length));
					}
					
					for (var i=0, len=this._argumentTypes.length; i<len; i++)
					{
						var value = paramsArr[i];
						var expectedType = this._argumentTypes[i];
						
						verifyType(value, expectedType, i);					 
					}				   
				}
			}	

			if (this.memorize) {
				this._prevParams = paramsArr;
			}

			if (! n) {
				//should come after memorize
				return;
			}

			bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
			this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

			//execute all callbacks until end of the list or until a callback returns `false` or stops propagation
			//reverse loop since listeners with higher priority will be added at the end of the list
			do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
		},

		/**
		 * Forget memorized arguments.
		 * @see signals.Signal.memorize
		 */
		forget : function(){
			this._prevParams = null;
		},

		/**
		 * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
		 * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
		 */
		dispose : function () {
			this.removeAll();
			delete this._bindings;
			delete this._prevParams;
		},

		/**
		 * @return {string} String representation of the object.
		 */
		toString : function () {
			return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
		}

	};

	if (typeof jQuery != 'undefined') {
		var hasOwn = jQuery.hasOwn,
		isArray = jQuery.isArray,
		isNumeric = jQuery.isNumeric,
		isFunction = jQuery.isFunction,
		isWindow = jQuery.isWindow,
		isPlainObject = jQuery.isPlainObject
	}
	else
	{
		var objectToString = Object.prototype.toString,
		
		hasOwn = Object.prototype.hasOwnProperty,
		
		isArray = (Array.isArray) || function(obj) {
			return objectToString.call(obj) == '[object Array]';
		},
		
		isNumeric = function(a) {
			return !isNaN(parseFloat(a)) && isFinite(a);
		},
		
		
		isFunction = function( obj ) {
			return objectToString.call(obj) == '[object function]';
		},
	
		// A crude way of determining if an object is a window
		isWindow = function( obj ) {
			return obj && typeof obj === "object" && "setInterval" in obj;
		},
	
		isPlainObject = function( obj ) {
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			
			if ( !obj || objectToString.call(obj) !== "[object Object]" || obj.nodeType || isWindow( obj ) ) {
				return false;
			}
	
			try {
				// Not own constructor property must be Object
				if ( obj.constructor &&
					!hasOwn.call(obj, "constructor") &&
					!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
					return false;
				}
			} catch ( e ) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}
	
			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
	
			var key;
			for ( key in obj ) {}
	
			if ( key === undefined || hasOwn.call( obj, key ))
			{
				return true
			}
			else
			{
				return false
			};
		}		
	}
	

	
	var verifyType = function (value, expectedType, i)
	{
		switch (expectedType)
		{
			case Number:
				if (!(isNumeric(value) && !isArray(value) && !(value.constructor === String || value instanceof String)))
				{
					throw ( new Error ('strict Signal argument Type Mismatch on argument ' + i + ' is not Number'));
				}
			break;
			case String:
				if (!(value.constructor === String || value instanceof String))
				{
					throw ( new Error ('strict Signal argument Type Mismatch on argument ' + i + ' is not String'));
				}
			break;
			case Array:
				if (!isArray(value))
				{
					throw ( new Error ('strict Signal argument Type Mismatch on argument ' + i + ' is not Array'));							 
				}
			break;
			default:
				if (!(value instanceof expectedType || expectedType.isPrototypeOf(value)) )
				{
					throw ( new Error ('strict Signal argument Type Mismatch on argument ' + i + ' is not custom Class type: ' + expectedType));
				}
				break;
		}	   
	}