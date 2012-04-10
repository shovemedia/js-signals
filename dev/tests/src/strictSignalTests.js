YUI().use('node', 'console', 'test', function (Y){		
		
    var basic = new Y.Test.Case({

        //name of the test case - if not provided, one is auto-generated
        name : "Basic Test",

        //---------------------------------------------------------------------
        // Special instructions
        //---------------------------------------------------------------------

        _should: {
            ignore: {},
            error : {
                testAddNull : 'listener is a required param of add() and should be a Function.',
                testAddOnceNull : 'listener is a required param of addOnce() and should be a Function.',
                testAddSameListenerMixed1 : 'You cannot add() then addOnce() the same listener without removing the relationship first.',
                testAddSameListenerMixed2 : 'You cannot addOnce() then add() the same listener without removing the relationship first.',
                testRemoveNull : 'listener is a required param of remove() and should be a Function.',
                testBindingDispose : true,
                testDispose1 : true,
                testDispose2 : true,
                testDispose3 : true,
                testDispose4 : true
            }
        },

        //---------------------------------------------------------------------
        // setUp and tearDown
        //---------------------------------------------------------------------

        /*
         * Sets up data that is needed by each test.
         */
        setUp : function(){
            this.signal = new signals.Signal();
        },

        /*
         * Cleans up everything that was created by setUp().
         */
        tearDown : function(){
            delete this.signal;
        },

        //---------------------------------------------------------------------
        // Test methods - names must begin with "test"
        //---------------------------------------------------------------------

        testSignalType : function(){
            var s = this.signal;

            Y.Assert.isObject(s);
            Y.Assert.isInstanceOf(signals.Signal, s);
        },

        testNumListeners0 : function(){
            var s = this.signal;

            Y.Assert.areSame(0, s.getNumListeners());
        },

        //-------------------------- Add ---------------------------------------//

        testAddSingle : function(){
            var s = this.signal;

            s.add(function(){});

            Y.Assert.areSame(1, s.getNumListeners());
        },

        testAddDouble : function(){
            var s = this.signal;

            s.add(function(){});
            s.add(function(){});

            Y.Assert.areSame(2, s.getNumListeners());
        },

        testAddDoubleSameListener : function(){
            var s = this.signal;

            var l = function(){};

            s.add(l);
            s.add(l); //shouldn't add same listener twice

            Y.Assert.areSame(1, s.getNumListeners());
        },

        testAddDoubleSameListenerDiffContext : function(){
            var s = this.signal;

            var l = function(){};

            s.add(l);
            s.add(l, {});

            Y.Assert.areSame(2, s.getNumListeners());
        },

        testAddNull : function(){
            var s = this.signal;

            s.add(); //should throw error
            Y.Assert.areSame(0, s.getNumListeners());
        },

        //--------------------------- Add / Has ---------------------------------//

        testHasListener : function(){
            var s = this.signal;

            var l = function(){};

            s.add(l);

            Y.Assert.areSame(true, s.has(l));
        },

        //--------------------------- Add Once ---------------------------------//

        testAddOnce : function(){
            var s = this.signal;

            s.addOnce(function(){});
            Y.Assert.areSame(1, s.getNumListeners());
        },

        testAddOnceDouble : function(){
            var s = this.signal;

            s.addOnce(function(){});
            s.addOnce(function(){});
            Y.Assert.areSame(2, s.getNumListeners());
        },

        testAddOnceSameDouble : function(){
            var s = this.signal;

            var l = function(){};
            s.addOnce(l);
            s.addOnce(l);
            Y.Assert.areSame(1, s.getNumListeners());
        },

        testAddOnceNull : function(){
            var s = this.signal;

            s.addOnce(); //should throw error
            Y.Assert.areSame(0, s.getNumListeners());
        },

        //--------------------------- Add Mixed ---------------------------------//

        testAddSameListenerMixed1 : function(){
            var s = this.signal;
            var l = function(){};
            s.add(l);
            s.addOnce(l); //should throw error
        },

        testAddSameListenerMixed2 : function(){
            var s = this.signal;
            var l = function(){};
            s.addOnce(l);
            s.add(l); //should throw error
        },

        //----------------------- Dispatch -------------------------------------//

        testDispatchSingleListener : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};

            s.add(l1);
            s.dispatch();

            Y.Assert.areSame(1, n);
        },

        testDispatchDoubleListeners : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){n++};

            s.add(l1);
            s.add(l2);
            s.dispatch();

            Y.Assert.areSame(2, n);
        },

        testDispatchDoubleListeners2 : function(){
            var s = this.signal;

            var str = '';
            var l1 = function(){str += 'a'};
            var l2 = function(){str += 'b'};

            s.add(l1);
            s.add(l2);
            s.dispatch();
            //ensure dispatch happened on proper order
            Y.Assert.areSame('ab', str);
        },

        testDispatchMultipleListenersPriority : function(){
            var s = this.signal;

            var str = '';
            var l1 = function(){str += 'a'};
            var l2 = function(){str += 'b'};
            var l3 = function(){str += 'c'};

            s.add(l1);
            s.add(l2, null, 1);
            s.add(l3);
            s.dispatch();
            //ensure dispatch happened on proper order
            Y.Assert.areSame('bac', str);
        },

        testDispatchMultipleListenersPriority2 : function(){
            var s = this.signal;

            var str = '';
            var l1 = function(){str += 'a'};
            var l2 = function(){str += 'b'};
            var l3 = function(){str += 'c'};

            s.add(l1, null, 1);
            s.add(l2, null, 12);
            s.add(l3, null, 2);
            s.dispatch();
            //ensure dispatch happened on proper order
            Y.Assert.areSame('bca', str);
        },

        testDispatchSingleListenerTwice : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};

            s.add(l1);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(2, n);
        },

        testDispatchDoubleListenersTwice : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){n++};

            s.add(l1);
            s.add(l2);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(4, n);
        },

        testDispatchScope : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };
            var l1 = function(){this.sum()};

            s.add(l1, scope);
            s.dispatch();

            Y.Assert.areSame(1, scope.n);
        },

        testDispatchScopeDouble : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.add(l1, scope);
            s.add(l2, scope);
            s.dispatch();

            Y.Assert.areSame(2, scope.n);
        },

        testDispatchScopeDouble2 : function(){
            var s = this.signal;

            var scope1 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var scope2 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.add(l1, scope1);
            s.add(l2, scope2);
            s.dispatch();

            Y.Assert.areSame(1, scope1.n);
            Y.Assert.areSame(1, scope2.n);
        },

        testDispatchScopeTwice : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };
            var l1 = function(){this.sum()};

            s.add(l1, scope);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(2, scope.n);
        },

        testDispatchScopeDoubleTwice : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.add(l1, scope);
            s.add(l2, scope);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(4, scope.n);
        },

        testDispatchScopeDouble2Twice : function(){
            var s = this.signal;

            var scope1 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var scope2 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.add(l1, scope1);
            s.add(l2, scope2);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(2, scope1.n);
            Y.Assert.areSame(2, scope2.n);
        },


        testDispatchAddOnceSingleListener : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};

            s.addOnce(l1);
            s.dispatch();

            Y.Assert.areSame(1, n);
        },

        testDispatchAddOnceSingleListenerTwice : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};

            s.addOnce(l1);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(1, n);
        },

        testDispatchAddOnceDoubleListener : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){n++};

            s.addOnce(l1);
            s.addOnce(l2);
            s.dispatch();

            Y.Assert.areSame(2, n);
        },

        testDispatchAddOnceDoubleListenerTwice : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){n++};

            s.addOnce(l1);
            s.addOnce(l2);
            Y.Assert.areSame(2, s.getNumListeners());
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(2, n);
        },

        testDispatchAddOnceScope : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };
            var l1 = function(){this.sum()};

            s.addOnce(l1, scope);
            s.dispatch();

            Y.Assert.areSame(1, scope.n);
        },

        testDispatchAddOnceScopeDouble : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.addOnce(l1, scope);
            s.addOnce(l2, scope);
            s.dispatch();

            Y.Assert.areSame(2, scope.n);
        },

        testDispatchAddOnceScopeDouble2 : function(){
            var s = this.signal;

            var scope1 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var scope2 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.addOnce(l1, scope1);
            s.addOnce(l2, scope2);
            s.dispatch();

            Y.Assert.areSame(1, scope1.n);
            Y.Assert.areSame(1, scope2.n);
        },

        testDispatchAddOnceScopeTwice : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };
            var l1 = function(){this.sum()};

            s.addOnce(l1, scope);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(1, scope.n);
        },

        testDispatchAddOnceScopeDoubleTwice : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.addOnce(l1, scope);
            s.addOnce(l2, scope);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(2, scope.n);
        },

        testDispatchAddOnceScopeDouble2Twice : function(){
            var s = this.signal;

            var scope1 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var scope2 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            s.addOnce(l1, scope1);
            s.addOnce(l2, scope2);
            s.dispatch();
            s.dispatch();

            Y.Assert.areSame(1, scope1.n);
            Y.Assert.areSame(1, scope2.n);
        },

        testDispatchInvalidListener : function(){
            var s = this.signal;

            var n = 0;
            var l2 = function(){n += 1}
            var l1 = function(){n += 1; s.remove(l2)}  //test for #24

            s.add(l1);
            s.add(l2);
            s.dispatch();

            Y.Assert.areSame(1, n);
        },

        //--------------------- Dispatch with params ------------------------//

        testDispatchSingleListenerParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param){n += param};

            s.add(l1);
            s.dispatch(1);

            Y.Assert.areSame(1, n);
        },

        testDispatchDoubleListenersParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param){n += param};
            var l2 = function(param){n += param};

            s.add(l1);
            s.add(l2);
            s.dispatch(1);

            Y.Assert.areSame(2, n);
        },

        testDispatchSingleListenerTwiceParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param1, param2){n += param1 + param2};

            s.add(l1);
            s.dispatch(1,2);
            s.dispatch(3,4);

            Y.Assert.areSame(10, n);
        },

        testDispatchDoubleListenersTwiceParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param1, param2){n += param1 + param2};
            var l2 = function(param1, param2){n += param1 + param2};

            s.add(l1);
            s.add(l2);
            s.dispatch(2,2);
            s.dispatch(3,3);

            Y.Assert.areSame(20, n);
        },

        testDispatchScopeParams : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                sum : function(param1,param2,param3){
                    this.n = param1 + param2 + param3;
                }
            };
            var l1 = function(param1,param2,param3){this.sum(param1,param2,param3);};

            s.add(l1, scope);
            s.dispatch(10,20,5);

            Y.Assert.areSame(35, scope.n);
        },

        testDispatchAddOnceSingleListenerParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param){n += param};

            s.addOnce(l1);
            s.dispatch(1);

            Y.Assert.areSame(1, n);
        },

        testDispatchAddOnceDoubleListenersParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param){n += param};
            var l2 = function(param){n += param};

            s.addOnce(l1);
            s.addOnce(l2);
            s.dispatch(1);

            Y.Assert.areSame(2, n);
        },

        testDispatchAddOnceSingleListenerTwiceParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param1, param2){n += param1 + param2};

            s.addOnce(l1);
            s.dispatch(1,2);
            s.dispatch(3,4);

            Y.Assert.areSame(3, n);
        },

        testDispatchAddOnceDoubleListenersTwiceParams : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(param1, param2){n += param1 + param2};
            var l2 = function(param1, param2){n += param1 + param2};

            s.addOnce(l1);
            s.addOnce(l2);
            s.dispatch(2,2);
            s.dispatch(3,3);

            Y.Assert.areSame(8, n);
        },

        testDispatchAddOnceScopeParams : function(){
            var s = this.signal;

            var scope = {
                n : 0,
                add : function(param1,param2,param3){
                    this.n = param1 + param2 + param3;
                }
            };
            var l1 = function(param1,param2,param3){this.add(param1,param2,param3);};

            s.addOnce(l1, scope);
            s.dispatch(10,20,5);

            Y.Assert.areSame(35, scope.n);
        },

        //-------------------- Stop Propagation -----------------------------//

        testStopPropagation : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){return false};
            var l3 = function(){n++};

            s.add(l1);
            s.add(l2);
            s.add(l3);
            s.dispatch();

            Y.Assert.areSame(1, n);
        },

        testStopPropagation2 : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){s.halt()};
            var l3 = function(){n++};

            s.add(l1);
            s.add(l2);
            s.add(l3);
            s.dispatch();

            Y.Assert.areSame(1, n);
        },

        testStopPropagation3 : function(){
            var s = this.signal;

            s.halt();

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){n++};
            var l3 = function(){n++};

            s.add(l1);
            s.add(l2);
            s.add(l3);
            s.dispatch();

            Y.Assert.areSame(3, n);
        },

        //--------------------------- Enable/Disable -------------------------------//

        testEnableDisableSignal : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){n++};
            var l3 = function(){n++};

            s.add(l1);
            s.add(l2);
            s.add(l3);

            Y.Assert.areSame(true, s.active);
            s.dispatch();

            s.active = false;
            Y.Assert.areSame(false, s.active);
            s.dispatch();

            s.active = true;
            Y.Assert.areSame(true, s.active);
            s.dispatch();

            Y.Assert.areSame(6, n);
        },

        testEnableDisableBinding : function(){
            var s = this.signal;

            var n = 0;
            var l1 = function(){n++};
            var l2 = function(){n++};
            var l3 = function(){n++};

            var b1 = s.add(l1);
            var b2 = s.add(l2);
            var b3 = s.add(l3);

            Y.Assert.areSame(true, s.active);
            Y.Assert.areSame(true, b2.active);
            s.dispatch();

            b2.active = false;
            Y.Assert.areSame(true, s.active);
            Y.Assert.areSame(false, b2.active);
            s.dispatch();

            b2.active = true;
            Y.Assert.areSame(true, s.active);
            Y.Assert.areSame(true, b2.active);
            s.dispatch();

            Y.Assert.areSame(8, n);
        },

        //------------------------ Bindings ----------------------------------//

        testBindingsIsOnce : function(){
            var s = this.signal;
            var b1 = s.addOnce(function(){});
            Y.Assert.areSame(1, s.getNumListeners());
            Y.Assert.areSame(true, b1.isOnce());
        },

        testBindingsIsOnce2 : function(){
            var s = this.signal;
            var b1 = s.addOnce(function(){});
            var b2 = s.addOnce(function(){});
            Y.Assert.areSame(2, s.getNumListeners());
            Y.Assert.areSame(true, b1.isOnce());
            Y.Assert.areSame(true, b2.isOnce());
            Y.Assert.areNotSame(b1, b2);
        },

        testBindingsIsOnce3 : function(){
            var s = this.signal;
            var l = function(){};
            var b1 = s.addOnce(l);
            var b2 = s.addOnce(l);
            Y.Assert.areSame(1, s.getNumListeners());
            Y.Assert.areSame(true, b1.isOnce());
            Y.Assert.areSame(true, b2.isOnce());
            Y.Assert.areSame(b1, b2);
        },

        testBindingsIsNotOnce : function(){
            var s = this.signal;
            var b1 = s.add(function(){});
            Y.Assert.areSame(1, s.getNumListeners());
            Y.Assert.areSame(false, b1.isOnce());
        },

        testBindingsIsNotOnce2 : function(){
            var s = this.signal;
            var b1 = s.add(function(){});
            var b2 = s.add(function(){});
            Y.Assert.areSame(2, s.getNumListeners());
            Y.Assert.areSame(false, b1.isOnce());
            Y.Assert.areSame(false, b2.isOnce());
            Y.Assert.areNotSame(b1, b2);
        },

        testBindingsIsNotOnce3 : function(){
            var s = this.signal;
            var l = function(){};
            var b1 = s.add(l);
            var b2 = s.add(l);
            Y.Assert.areSame(1, s.getNumListeners());
            Y.Assert.areSame(false, b1.isOnce());
            Y.Assert.areSame(false, b2.isOnce());
            Y.Assert.areSame(b1, b2);
        },

        testBindingDetach : function(){
            var s = this.signal;
            var b1 = s.add(function(){
                Y.Assert.fail();
            });
            Y.Assert.areSame(1, s.getNumListeners());
            b1.detach();
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testBindingDetachTwice : function(){
            var s = this.signal;
            var b1 = s.add(function(){
                Y.Assert.fail();
            });
            Y.Assert.areSame(1, s.getNumListeners());
            b1.detach();
            b1.detach();
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testBindingIsBound : function(){
            var s = this.signal;
            var b1 = s.add(function(){
                Y.Assert.fail();
            });
            Y.Assert.areSame(1, s.getNumListeners());
            Y.Assert.areSame(true, b1.isBound());
            b1.detach();
            Y.Assert.areSame(false, b1.isBound());
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testBindingGetListener : function(){
            var s = this.signal;
            var l1 = function(){};
            var b1 = s.add(l1);
            Y.Assert.isUndefined(b1.listener); //make sure it's private
            Y.Assert.areSame(1, s.getNumListeners());
            Y.Assert.areSame(l1, b1.getListener());
        },

        testBindingContext : function(){
            var s = this.signal;

            var scope1 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var scope2 = {
                n : 0,
                sum : function(){
                    this.n++;
                }
            };

            var l1 = function(){this.sum()};
            var l2 = function(){this.sum()};

            var b1 = s.add(l1, scope1);
            var b2 = s.add(l2, scope2);
            s.dispatch();

            Y.Assert.areSame(1, scope1.n);
            Y.Assert.areSame(1, scope2.n);

            b1.context = scope2;
            s.dispatch();

            Y.Assert.areSame(1, scope1.n);
            Y.Assert.areSame(3, scope2.n);
        },

        testBindingDispose : function(){
            var s = this.signal;
            var b1 = s.add(function(){}, {});
            Y.Assert.areSame(1, s.getNumListeners());
            b1.dispose(); //will throw error since dispose doesn't exist anymore
            Y.Assert.areSame(0, s.getNumListeners());
            Y.Assert.isUndefined(b1.listener);
            Y.Assert.isUndefined(b1.getListener());
            Y.Assert.isUndefined(b1.context);
        },

        testBindingCurry : function(){
            var s = this.signal;
            var _a, _b, _c;
            var b1 = s.add(function(a, b, c){
                _a = a;
                _b = b;
                _c = c;
            });
            b1.params = ['foo', 'bar'];
            s.dispatch(123);
            Y.Assert.areSame('foo', _a, 'curried param 1');
            Y.Assert.areSame('bar', _b, 'curried param 2');
            Y.Assert.areSame(123, _c, 'dispatched param');
        },

        testBindingCurry2 : function(){
            var s = this.signal;
            var _a, _b, _c;
            var b1 = s.add(function(a, b, c){
                _a = a;
                _b = b;
                _c = c;
            });
            b1.params = ['foo', 'bar'];
            s.dispatch();
            Y.Assert.areSame('foo', _a, 'curried param 1');
            Y.Assert.areSame('bar', _b, 'curried param 2');
            Y.Assert.isUndefined(_c, 'dispatched param');
        },

        //------------------------ Remove ----------------------------------//

        testRemoveSingle : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};

            var b1 = s.add(l1);
            s.remove(l1);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveSingle2 : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};

            var b1 = s.add(l1);
            s.remove(l1);
            Y.Assert.areSame(0, s.getNumListeners());
            Y.Assert.isUndefined(b1.listener);
            Y.Assert.isUndefined(b1.getListener());
            Y.Assert.isUndefined(b1.context);
            s.dispatch();
        },

        testRemoveSingleTwice : function(){
            var s = this.signal;

            var l = function(){Y.Assert.fail();};

            s.add(l);
            s.remove(l);
            s.remove(l);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveSingleTwice2 : function(){
            var s = this.signal;

            var l = function(){Y.Assert.fail();};

            s.add(l);
            s.remove(l);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();

            s.remove(l);
            s.dispatch();
        },

        testRemoveDouble : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};
            var l2 = function(){Y.Assert.fail();};

            s.add(l1);
            s.addOnce(l2);

            s.remove(l1);
            Y.Assert.areSame(1, s.getNumListeners());
            s.remove(l2);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveDoubleTwice : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};
            var l2 = function(){Y.Assert.fail();};

            s.add(l1);
            s.add(l2);

            s.remove(l1);
            s.remove(l1);
            Y.Assert.areSame(1, s.getNumListeners());
            s.remove(l2);
            s.remove(l2);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveDoubleTwice2 : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};
            var l2 = function(){Y.Assert.fail();};

            s.add(l1);
            s.addOnce(l2);

            s.remove(l1);
            Y.Assert.areSame(1, s.getNumListeners());
            s.remove(l2);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();

            s.remove(l1);
            s.remove(l2);
            s.dispatch();
        },

        testRemoveAll : function(){
            var s = this.signal;

            s.add(function(){Y.Assert.fail();});
            s.add(function(){Y.Assert.fail();});
            s.addOnce(function(){Y.Assert.fail();});
            s.add(function(){Y.Assert.fail();});
            s.addOnce(function(){Y.Assert.fail();});
            Y.Assert.areSame(5, s.getNumListeners());

            s.removeAll();
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveAll2 : function(){
            var s = this.signal;

            var b1 = s.add(function(){Y.Assert.fail();});
            var b2 = s.add(function(){Y.Assert.fail();});
            var b3 = s.addOnce(function(){Y.Assert.fail();});
            var b4 = s.add(function(){Y.Assert.fail();});
            var b5 = s.addOnce(function(){Y.Assert.fail();});

            Y.Assert.areSame(5, s.getNumListeners());
            s.removeAll();
            Y.Assert.areSame(0, s.getNumListeners());

            Y.Assert.isUndefined(b1.listener);
            Y.Assert.isUndefined(b1.getListener());
            Y.Assert.isUndefined(b1.context);

            Y.Assert.isUndefined(b2.listener);
            Y.Assert.isUndefined(b2.getListener());
            Y.Assert.isUndefined(b2.context);

            Y.Assert.isUndefined(b3.listener);
            Y.Assert.isUndefined(b3.getListener());
            Y.Assert.isUndefined(b3.context);

            Y.Assert.isUndefined(b4.listener);
            Y.Assert.isUndefined(b4.getListener());
            Y.Assert.isUndefined(b4.context);

            Y.Assert.isUndefined(b5.listener);
            Y.Assert.isUndefined(b5.getListener());
            Y.Assert.isUndefined(b5.context);

            s.dispatch();
        },

        testRemoveAllTwice : function(){
            var s = this.signal;

            s.addOnce(function(){Y.Assert.fail();});
            s.addOnce(function(){Y.Assert.fail();});
            s.add(function(){Y.Assert.fail();});
            s.add(function(){Y.Assert.fail();});
            s.add(function(){Y.Assert.fail();});
            Y.Assert.areSame(5, s.getNumListeners());

            s.removeAll();
            s.removeAll();
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveNull : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};

            var b1 = s.add(l1);
            s.remove(); //should throw error
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveDiffContext : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};
            var obj = {};

            var b1 = s.add(l1);
            var b2 = s.add(l1, obj);
            Y.Assert.areSame(2, s.getNumListeners());

            Y.Assert.isUndefined(b1.context);
            Y.Assert.areSame(l1, b1.getListener());
            Y.Assert.areSame(obj, b2.context);
            Y.Assert.areSame(l1, b2.getListener());

            s.remove(l1, obj);

            Y.Assert.isUndefined(b2.context);
            Y.Assert.isUndefined(b2.getListener());

            Y.Assert.isUndefined(b1.context);
            Y.Assert.areSame(l1, b1.getListener());

            Y.Assert.areSame(1, s.getNumListeners());
            s.remove(l1);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },

        testRemoveDiffContext2 : function(){
            var s = this.signal;

            var l1 = function(){Y.Assert.fail();};
            var obj = {};

            var b1 = s.add(l1);
            var b2 = s.add(l1, obj);
            Y.Assert.areSame(2, s.getNumListeners());

            Y.Assert.isUndefined(b1.context);
            Y.Assert.areSame(l1, b1.getListener());
            Y.Assert.areSame(obj, b2.context);
            Y.Assert.areSame(l1, b2.getListener());

            s.remove(l1);

            Y.Assert.isUndefined(b1.context);
            Y.Assert.isUndefined(b1.getListener());

            Y.Assert.areSame(obj, b2.context);
            Y.Assert.areSame(l1, b2.getListener());

            Y.Assert.areSame(1, s.getNumListeners());
            s.remove(l1, obj);
            Y.Assert.areSame(0, s.getNumListeners());
            s.dispatch();
        },


        //----------------- Memorize ----------------------------//

        testMemorize : function(){
           var s = new signals.Signal();
           s.memorize = true;
           var count = 0;

           var ts1 = +(new Date());

           s.addOnce(function(a, b){
               count++;
               Y.Assert.areSame('foo', a);
               Y.Assert.areSame(ts1, b);
           });

           s.dispatch('foo', ts1);

           s.addOnce(function(a, b){
               count++;
               Y.Assert.areSame('foo', a);
               Y.Assert.areSame(ts1, b);
           });

           var ts2 = +(new Date());

           s.dispatch('bar', ts2);

           s.addOnce(function(a, b){
               count++;
               Y.Assert.areSame('bar', a);
               Y.Assert.areSame(ts2, b);
           });

           Y.Assert.areSame(3, count);
        },

        testMemorizeForget : function(){
           var s = new signals.Signal();
           s.memorize = true;
           var count = 0;

           var ts1 = +(new Date());

           s.addOnce(function(a, b){
               count++;
               Y.Assert.areSame('foo', a);
               Y.Assert.areSame(ts1, b);
           });

           s.dispatch('foo', ts1);

           s.addOnce(function(a, b){
               count++;
               Y.Assert.areSame('foo', a);
               Y.Assert.areSame(ts1, b);
           });

           var ts2 = +(new Date());

           s.dispatch('bar', ts2);
           s.forget();

           s.addOnce(function(a, b){
               count++;
               Y.Assert.fail('a: '+ a +' - b: '+ b);
           });

           Y.Assert.areSame(2, count);
        },

        testMemorizeDispose : function(){
            var s = new signals.Signal();
            s.memorize = true;
            s.dispatch('foo', 123);
            Y.Assert.areSame('foo', s._prevParams[0]);
            Y.Assert.areSame(123, s._prevParams[1]);
            Y.Assert.areSame(0, s._bindings.length);
            s.dispose();
            Y.Assert.areSame(undefined, s._prevParams);
            Y.Assert.areSame(undefined, s._bindings);
        },


        //--------------------- Dispose --------------------------//

        testDispose1 : function(){
            var s = this.signal;

            s.addOnce(function(){});
            s.add(function(){});
            Y.Assert.areSame(2, s.getNumListeners());

            s.dispose();
            s.dispatch(); //will throw error
        },

        testDispose2 : function(){
            var s = this.signal;

            s.addOnce(function(){});
            s.add(function(){});
            Y.Assert.areSame(2, s.getNumListeners());

            s.dispose();
            s.add(function(){}); //will throw error
        },

        testDispose3 : function(){
            var s = this.signal;

            s.addOnce(function(){});
            s.add(function(){});
            Y.Assert.areSame(2, s.getNumListeners());

            s.dispose();
            s.remove(function(){}); //will throw error
        },

        testDispose4 : function(){
            var s = this.signal;

            s.addOnce(function(){});
            s.add(function(){});
            Y.Assert.areSame(2, s.getNumListeners());

            s.dispose();
            s.getNumListeners(); //will throw error
        }

    });








var basic2 = new Y.Test.Case({

		//name of the test case - if not provided, one is auto-generated
		name : "Strict Signal Test -- Typed dispatch arguments",

		//---------------------------------------------------------------------
		// Special instructions
		//---------------------------------------------------------------------

		_should: {
			ignore: {},
			error : {
				testNumberFail1 : true,
				testNumberFail1a : true,
				testNumberFail1b : true,
				testNumberFail1c : true,
				testNumberFail1d : true,
				testNumberFail1e : true,
				testNumberFail1f : true,
				testNumberFail2 : true,
				testNumberFail2a : true,
				testNumberFail2b : true,
				testNumberFail2c : true,
				testNumberFail3 : true,
				testNumberFail4 : true,
				testNumberFail5 : true,
				testNumberFail6 : true,
				testNumberFail7 : true,
				
				testStringFail1 : true,
				testStringFail2 : true,
				testStringFail3 : true,
				testStringFail4 : true,
				testStringFail5 : true,
				testStringFail6 : true,
				testStringFail7 : true,
				
				testDateFail1	: true,
				testDateFail2	: true,
				testDateFail3	: true,
				
				testArrayFail1	: true,
				testArrayFail2	: true,
				testArrayFail3	: true,
				testArrayFail4	: true,

				testObjectFail1	: true,
				testObjectFail2	: true,
				testObjectFail3	: true,
				testObjectFail4	: true,

				testCustomClassFail1	: true,
				testCustomClassFail2	: true,
				testCustomClassFail3	: true,
				testCustomClassFail4	: true,

				testMixedFail1	: true, 
				testMixedFail2	: true,
				testMixedFail3	: true, 
				testMixedFail4	: true,
				testMixedFail5	: true 
			}
			
/*

 */			
			
			
		},

		//---------------------------------------------------------------------
		// setUp and tearDown
		//---------------------------------------------------------------------

		/*
		 * Sets up data that is needed by each test.
		 */
		setUp : function(){
			
			CustomClass = function () {
				this.foobar = 12345;
			}
			CustomClass.prototype.method = function ()
			{}
			
			
			CustomSubClass = function () {
			}
			
			CustomSubClass.prototype = Object.create(CustomClass.prototype);
			
			CustomSubClass.prototype.method = function ()
			{}
			
			CustomSubClass.prototype.constructor = CustomSubClass;
			CustomSubClass.prototype.superConstructor = CustomClass;
			

			
			this.x;
			this.y;
			this.z;
			
			this.signalNumber1 = new signals.Signal(Number);
			this.signalNumber2 = new signals.Signal(Number, Number);
			this.signalNumber3 = new signals.Signal(Number, Number, Number);

			this.signalString1 = new signals.Signal(String);
			this.signalString2 = new signals.Signal(String, String);
			this.signalString3 = new signals.Signal(String, String, String);

			this.signalDate1 = new signals.Signal(Date);
			this.signalDate2 = new signals.Signal(Date, Date);
			this.signalDate3 = new signals.Signal(Date, Date, Date);
			
			this.signalArray1 = new signals.Signal(Array);
			this.signalArray2 = new signals.Signal(Array, Array);
			this.signalArray3 = new signals.Signal(Array, Array, Array);
			
			this.signalObject1 = new signals.Signal(Object);
			this.signalObject2 = new signals.Signal(Object, Object);
			this.signalObject3 = new signals.Signal(Object, Object, Object);
			
			this.signalCustomClass1 = new signals.Signal(CustomClass);
			this.signalCustomClass2 = new signals.Signal(CustomClass, CustomClass);
			this.signalCustomClass3 = new signals.Signal(CustomClass, CustomClass, CustomClass);
			
			this.signalMixed = new signals.Signal(Number, String, Date, Array, Object, CustomClass);

		},

		/*
		 * Cleans up everything that was created by setUp().
		 */
		tearDown : function(){
			delete this.signalNumber1;
			delete this.signalNumber2;
			delete this.signalNumber3;
			
			delete this.signalString1;
			delete this.signalString2;
			delete this.signalString3;
			
			delete this.signalDate1;
			delete this.signalDate2;
			delete this.signalDate3;
			
			delete this.signalArray1;
			delete this.signalArray2;
			delete this.signalArray3;
			
			delete this.signalObject1;
			delete this.signalObject2;
			delete this.signalObject3;
			
			delete this.signalCustomClass1;
			delete this.signalCustomClass2;
			delete this.signalCustomClass3;
			
			delete this.signalMixed;
		},

		//---------------------------------------------------------------------
		// Test methods - names must begin with "test"
		//---------------------------------------------------------------------

		testSignalType : function(){
			Y.Assert.isObject(this.signalNumber1);
			Y.Assert.isObject(this.signalNumber2);
			Y.Assert.isObject(this.signalNumber3);
			
			Y.Assert.isObject(this.signalString1);
			Y.Assert.isObject(this.signalString2);
			Y.Assert.isObject(this.signalString3);
			
			Y.Assert.isObject(this.signalDate1);
			Y.Assert.isObject(this.signalDate2);
			Y.Assert.isObject(this.signalDate3);
			
			Y.Assert.isObject(this.signalArray1);
			Y.Assert.isObject(this.signalArray2);
			Y.Assert.isObject(this.signalArray3);
			
			Y.Assert.isObject(this.signalObject1);
			Y.Assert.isObject(this.signalObject2);
			Y.Assert.isObject(this.signalObject3);
			
			Y.Assert.isObject(this.signalCustomClass1);
			Y.Assert.isObject(this.signalCustomClass2);
			Y.Assert.isObject(this.signalCustomClass3);
			
			Y.Assert.isObject(this.signalMixed);

			
			Y.Assert.isInstanceOf(signals.Signal, this.signalNumber1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalNumber2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalNumber3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalString1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalString2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalString3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalDate1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalDate2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalDate3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalArray1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalArray2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalArray3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalObject1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalObject2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalObject3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalCustomClass1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalCustomClass2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalCustomClass3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalMixed);
		},

		//-------------------------- NUMBER ---------------------------------------//

		testNumber : function(){
			this.signalNumber1.add(function(x){this.x = x;}, this);
			this.signalNumber2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalNumber3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			this.signalNumber1.dispatch(0);
			this.signalNumber1.dispatch(1);
			this.signalNumber1.dispatch(10);
			this.signalNumber1.dispatch(-10);
			
			this.signalNumber2.dispatch(0, 0);
			this.signalNumber2.dispatch(1, 1);
			this.signalNumber2.dispatch(10, 100);
			this.signalNumber2.dispatch(-10, -100);
			
			
			this.signalNumber3.dispatch(0, 0, 1);
			this.signalNumber3.dispatch(1, 0, 1);
			this.signalNumber3.dispatch(10, 100, 1000);
		   	this.signalNumber3.dispatch(-10, -100, -1000);
			
		},

		testNumberFail1 : function(){			
			this.signalNumber1.dispatch();
		},

		testNumberFail1a : function(){			
			this.signalNumber1.dispatch('ABC');
		},
		testNumberFail1b : function(){			
			this.signalNumber1.dispatch([123]);
		},
		testNumberFail1c : function(){			
			this.signalNumber1.dispatch(['123']);
		},
		testNumberFail1d : function(){			
			this.signalNumber1.dispatch([]);
		},
		testNumberFail1e : function(){			
			this.signalNumber1.dispatch({});
		},
		testNumberFail1f : function(){			
			this.signalNumber1.dispatch(new Date());
		},

		testNumberFail2 : function(){			
			this.signalNumber1.dispatch(0, 0);
		},
		
		testNumberFail2a : function(){			
			this.signalNumber2.dispatch('123', 1);
		},
		testNumberFail2b : function(){			
			this.signalNumber2.dispatch(1, '123');
		},
		testNumberFail2c : function(){			
			this.signalNumber2.dispatch('ABC', '123');
		},

		testNumberFail3 : function(){			
			this.signalNumber1.dispatch(1, 1);
		},

		testNumberFail4 : function(){			
			this.signalNumber3.dispatch(10, 100);
		},

		testNumberFail5 : function(){			
			this.signalNumber2.dispatch();
		},

		testNumberFail6 : function(){			
			this.signalNumber2.dispatch(100);
		},

		testNumberFail7 : function(){		
			this.signalNumber3.dispatch(10, 100, 1000, 1);
		},

		//-------------------------- STRING ---------------------------------------//

		testString : function(){
			this.signalString1.add(function(x){this.x = x;}, this);
			this.signalString2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalString3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			this.signalString1.dispatch('0');
			this.signalString1.dispatch('1');
			this.signalString1.dispatch('');
			this.signalString1.dispatch('abc');
			this.signalString1.dispatch('many words');
			
			this.signalString2.dispatch('0', 'ABC');
			this.signalString2.dispatch('ABC', '123');
			
			this.signalString3.dispatch('A', 'A', 'B');
			this.signalString3.dispatch('A', 'B', 'C');
			this.signalString3.dispatch('A', 'B', 'a few words');
			
		},

		testStringFail1 : function(){			
			this.signalString1.dispatch();
		},

		testStringFail2 : function(){			
			this.signalString1.dispatch('', 'abc');
		},

		testStringFail3 : function(){			
			this.signalString1.dispatch(1);
		},

		testStringFail4 : function(){			
			this.signalString3.dispatch('abc', 'ABC');
		},

		testStringFail5 : function(){			
			this.signalString2.dispatch('A', 'B', 'C');
		},

		testStringFail6 : function(){			
			this.signalString2.dispatch('A', 123);
		},

		testStringFail7 : function(){
			this.signalString3.dispatch('ABC', 'ABC', 'ABC', 'ABC');
		},
		
		//-------------------------- DATE ---------------------------------------//

		testDate : function(){
			this.signalDate1.add(function(x){this.x = x;}, this);
			this.signalDate2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalDate3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var date1 = new Date();
			var date2 = new Date(10000);
			var date3 = new Date(100000);
			
			this.signalDate1.dispatch(date1);
			this.signalDate1.dispatch(date2);
			this.signalDate1.dispatch(date3);
			
			this.signalDate2.dispatch(date1, date2);
			this.signalDate2.dispatch(date2, date3);
			
			this.signalDate3.dispatch(date1, date2, date3);
		},
		
		testDateFail1 : function(){			
			this.signalDate1.dispatch();
		},
		
		testDateFail2 : function(){			
			this.signalDate1.dispatch(123);
		},
		
		testDateFail3 : function(){			
			this.signalDate2.dispatch(new Date(), 123);
		},
		
		
		
		
		
		//-------------------------- Array ---------------------------------------//

		testArray : function(){
			this.signalArray1.add(function(x){this.x = x;}, this);
			this.signalArray2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalArray3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var array1 = new Array(1,2,3,4,5,6,7,8);
			var array2 = [];
			var array3 = [123, 'abc', {}, new Date()];
			
			this.signalArray1.dispatch(array1);
			this.signalArray1.dispatch(array2);
			this.signalArray1.dispatch(array3);
			
			this.signalArray2.dispatch(array1, array2);
			this.signalArray2.dispatch(array2, array3);
			
			this.signalArray3.dispatch(array1, array2, array3);
		},
		
		testArrayFail1 : function ()
		{
			this.signalArray1.dispatch()
		},
		testArrayFail2 : function ()
		{
			this.signalArray1.dispatch({})
		},
		testArrayFail3 : function ()
		{
			this.signalArray1.dispatch(123)
		},
		testArrayFail4 : function ()
		{
			this.signalArray1.dispatch('Array')
		},

		
		//-------------------------- Object ---------------------------------------//

		testObject : function(){
			this.signalObject1.add(function(x){this.x = x;}, this);
			this.signalObject2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalObject3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var object1 = new Object();
			var object2 = {};
			var object3 = {a:123, b:'abc', c:{}, d:new Date()};
			
			this.signalObject1.dispatch(object1);
			this.signalObject1.dispatch(object2);
			this.signalObject1.dispatch(object3);
			
			this.signalObject2.dispatch(object1, object2);
			this.signalObject2.dispatch(object2, object3);
			
			this.signalObject3.dispatch(object1, object2, object3);
		},
		
		testObjectFail1 : function ()
		{
			this.signalObject1.dispatch()
		},
		testObjectFail2 : function ()
		{
			this.signalObject1.dispatch(undefined)
		},
		testObjectFail3 : function ()
		{
			this.signalObject1.dispatch(123)
		},
		testObjectFail4 : function ()
		{
			this.signalObject1.dispatch('Object')
		},
		
		//-------------------------- CustomClass ---------------------------------------//

		testCustomClass : function(){
			this.signalCustomClass1.add(function(x){this.x = x;}, this);
			this.signalCustomClass2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalCustomClass3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var obj1 = new CustomClass();
			var obj2 = new CustomSubClass();			
			var obj3 = Object.create(CustomClass);
			var obj4 = Object.create(obj1);
			var obj5 = Object.create(obj2);
			
			
			this.signalCustomClass1.dispatch(obj1);
			this.signalCustomClass1.dispatch(obj2);
			this.signalCustomClass1.dispatch(obj3);
			this.signalCustomClass1.dispatch(obj4);
			this.signalCustomClass1.dispatch(obj5);
			
			
			this.signalCustomClass2.dispatch(obj1, obj2);
			this.signalCustomClass2.dispatch(obj2, obj3);
			
			this.signalCustomClass3.dispatch(obj1, obj2, obj3);
		},
		


		testCustomClassFail1 : function ()
		{
			this.signalCustomClass1.dispatch()
		},
		testCustomClassFail2 : function ()
		{
			this.signalCustomClass1.dispatch([])
		},
		testCustomClassFail3 : function ()
		{
			this.signalCustomClass1.dispatch({})
		},
		testCustomClassFail4 : function ()
		{
			this.signalCustomClass1.dispatch('CustomClass')
		},		
		
		//-------------------------- Mixed ---------------------------------------//

		testMixed : function(){
			//this.signalMixed = new signals.Signal(Number, String, Date, Array, Object, CustomClass);

			this.signalMixed.add(function(a, b, c, d, e, f){}, this);

			this.signalMixed.dispatch(0, '', new Date(), [], {}, new CustomClass());
			this.signalMixed.dispatch(-1, 'ABC', new Date(1232456), [1,2,3], {a:123, b:'ABC'}, new CustomSubClass());
		},
		
		testMixedFail1 : function ()
		{
			this.signalMixed.dispatch()
		},
		testMixedFail2 : function ()
		{
			this.signalMixed.dispatch([])
		},
		testMixedFail3 : function ()
		{
			this.signalMixed.dispatch({})
		},
		testMixedFail4 : function ()
		{
			this.signalMixed.dispatch(-1, 'ABC', new Date(1232456), [1,2,3], {a:123, b:'ABC'}, new Object());
		},
		testMixedFail5 : function ()
		{
			this.signalMixed.dispatch(-1, 'ABC', new Date(1232456), [1,2,3], {a:123, b:'ABC'}, new CustomClass(), '');
		}
		
		
		
		
	});




var basic3 = new Y.Test.Case({

		//name of the test case - if not provided, one is auto-generated
		name : "Strict Signal Test -- single object containing dispatch named types.",

		//---------------------------------------------------------------------
		// Special instructions
		//---------------------------------------------------------------------

		_should: {
			ignore: {},
			error : {
				testNumberFail1 : true,
				testNumberFail1a : true,
				testNumberFail1b : true,
				testNumberFail1c : true,
				testNumberFail1d : true,
				testNumberFail1e : true,
				testNumberFail1f : true,
				
				testNumberFail2a : true,
				testNumberFail2b : true,
				testNumberFail2c : true,
				
				testNumberFail4 : true,
				testNumberFail5 : true,
				testNumberFail6 : true,
				
				testStringFail1 : true,
				
				testStringFail3 : true,
				testStringFail4 : true,
				testStringFail5 : true,
				testStringFail6 : true,
				testStringFail7 : true,
				
				testDateFail1	: true,
				testDateFail2	: true,
				testDateFail3	: true,
				
				testArrayFail1	: true,
				testArrayFail2	: true,
				testArrayFail3	: true,
				testArrayFail4	: true,

				testObjectFail1	: true,
				testObjectFail2	: true,
				testObjectFail3	: true,
				testObjectFail4	: true,

				testCustomClassFail1	: true,
				testCustomClassFail2	: true,
				testCustomClassFail3	: true,
				testCustomClassFail4	: true,

				testMixedFail1	: true, 
				testMixedFail2	: true,
				testMixedFail3	: true, 
				testMixedFail4	: true,
				testMixedFail5	: true 
			}
			
/*

 */			
			
			
		},

		//---------------------------------------------------------------------
		// setUp and tearDown
		//---------------------------------------------------------------------

		/*
		 * Sets up data that is needed by each test.
		 */
		setUp : function(){
			
			CustomClass = function () {
				this.foobar = 12345;
			}
			CustomClass.prototype.method = function ()
			{}
			
			
			CustomSubClass = function () {
			}
			
			CustomSubClass.prototype = Object.create(CustomClass.prototype);
			
			CustomSubClass.prototype.method = function ()
			{}
			
			CustomSubClass.prototype.constructor = CustomSubClass;
			CustomSubClass.prototype.superConstructor = CustomClass;
			

			
			this.x;
			this.y;
			this.z;
			
			this.signalNumber1 = new signals.Signal({x:Number});
			this.signalNumber2 = new signals.Signal({x:Number, y:Number});
			this.signalNumber3 = new signals.Signal({x:Number, y:Number, z:Number});

			this.signalString1 = new signals.Signal({x:String});
			this.signalString2 = new signals.Signal({x:String, y:String});
			this.signalString3 = new signals.Signal({x:String, y:String, z:String});

			this.signalDate1 = new signals.Signal({x:Date});
			this.signalDate2 = new signals.Signal({x:Date, y:Date});
			this.signalDate3 = new signals.Signal({x:Date, y:Date, z:Date});
			
			this.signalArray1 = new signals.Signal({x:Array});
			this.signalArray2 = new signals.Signal({x:Array, y:Array});
			this.signalArray3 = new signals.Signal({x:Array, y:Array, z:Array});
			
			this.signalObject1 = new signals.Signal({x:Object});
			this.signalObject2 = new signals.Signal({x:Object, y:Object});
			this.signalObject3 = new signals.Signal({x:Object, y:Object, z:Object});
			
			this.signalCustomClass1 = new signals.Signal({x:CustomClass});
			this.signalCustomClass2 = new signals.Signal({x:CustomClass, y:CustomClass});
			this.signalCustomClass3 = new signals.Signal({x:CustomClass, y:CustomClass, z:CustomClass});
			
			this.signalMixed = new signals.Signal({x:Number, y:String, z:Date, a:Array, b:Object, c:CustomClass});

		},

		/*
		 * Cleans up everything that was created by setUp().
		 */
		tearDown : function(){
			delete this.signalNumber1;
			delete this.signalNumber2;
			delete this.signalNumber3;
			
			delete this.signalString1;
			delete this.signalString2;
			delete this.signalString3;
			
			delete this.signalDate1;
			delete this.signalDate2;
			delete this.signalDate3;
			
			delete this.signalArray1;
			delete this.signalArray2;
			delete this.signalArray3;
			
			delete this.signalObject1;
			delete this.signalObject2;
			delete this.signalObject3;
			
			delete this.signalCustomClass1;
			delete this.signalCustomClass2;
			delete this.signalCustomClass3;
			
			delete this.signalMixed;
		},

		//---------------------------------------------------------------------
		// Test methods - names must begin with "test"
		//---------------------------------------------------------------------

		testSignalType : function(){
			Y.Assert.isObject(this.signalNumber1);
			Y.Assert.isObject(this.signalNumber2);
			Y.Assert.isObject(this.signalNumber3);
			
			Y.Assert.isObject(this.signalString1);
			Y.Assert.isObject(this.signalString2);
			Y.Assert.isObject(this.signalString3);
			
			Y.Assert.isObject(this.signalDate1);
			Y.Assert.isObject(this.signalDate2);
			Y.Assert.isObject(this.signalDate3);
			
			Y.Assert.isObject(this.signalArray1);
			Y.Assert.isObject(this.signalArray2);
			Y.Assert.isObject(this.signalArray3);
			
			Y.Assert.isObject(this.signalObject1);
			Y.Assert.isObject(this.signalObject2);
			Y.Assert.isObject(this.signalObject3);
			
			Y.Assert.isObject(this.signalCustomClass1);
			Y.Assert.isObject(this.signalCustomClass2);
			Y.Assert.isObject(this.signalCustomClass3);
			
			Y.Assert.isObject(this.signalMixed);

			
			Y.Assert.isInstanceOf(signals.Signal, this.signalNumber1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalNumber2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalNumber3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalString1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalString2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalString3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalDate1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalDate2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalDate3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalArray1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalArray2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalArray3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalObject1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalObject2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalObject3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalCustomClass1);
			Y.Assert.isInstanceOf(signals.Signal, this.signalCustomClass2);
			Y.Assert.isInstanceOf(signals.Signal, this.signalCustomClass3);
			
			Y.Assert.isInstanceOf(signals.Signal, this.signalMixed);
		},

		//-------------------------- NUMBER ---------------------------------------//

		testNumber : function(){
			this.signalNumber1.add(function(x){this.x = x;}, this);
			this.signalNumber2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalNumber3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			this.signalNumber1.dispatch({x:0});
			this.signalNumber1.dispatch({x:1});
			this.signalNumber1.dispatch({x:10});
			this.signalNumber1.dispatch({x:-10});
			
			this.signalNumber2.dispatch({x:0, y:0});
			this.signalNumber2.dispatch({x:1, y:1});
			this.signalNumber2.dispatch({x:10, y:100});
			this.signalNumber2.dispatch({x:-10, y:-100});
			
			
			this.signalNumber3.dispatch({x:0, y:0, z:1});
			this.signalNumber3.dispatch({x:1, y:0, z:1});
			this.signalNumber3.dispatch({x:10, y:100, z:1000});
		   	this.signalNumber3.dispatch({x:-10, y:-100, z:-1000});
			
		},

		testNumberFail1 : function(){			
			this.signalNumber1.dispatch();
		},

		testNumberFail1a : function(){			
			this.signalNumber1.dispatch({x:'ABC'});
		},
		testNumberFail1b : function(){			
			this.signalNumber1.dispatch({y:123});
		},
		testNumberFail1c : function(){			
			this.signalNumber1.dispatch({x:[123]});
		},
		testNumberFail1d : function(){			
			this.signalNumber1.dispatch({x:[]});
		},
		testNumberFail1e : function(){			
			this.signalNumber1.dispatch({x:{}});
		},
		testNumberFail1f : function(){			
			this.signalNumber1.dispatch({x:new Date()});
		},

 
		
		testNumberFail2a : function(){			
			this.signalNumber2.dispatch({x:'123', y:0});
		},
		testNumberFail2b : function(){			
			this.signalNumber2.dispatch({x:1, y:'123'});
		},
		testNumberFail2c : function(){			
			this.signalNumber2.dispatch({x:'123', y:'ABC'});
		},


		testNumberFail4 : function(){			
			this.signalNumber3.dispatch({x:-100, y:100});
		},

		testNumberFail5 : function(){			
			this.signalNumber2.dispatch();
		},

		testNumberFail6 : function(){			
			this.signalNumber2.dispatch({x:50});
		},



		//-------------------------- STRING ---------------------------------------//

		testString : function(){
			this.signalString1.add(function(x){this.x = x;}, this);
			this.signalString2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalString3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			this.signalString1.dispatch({x:'0'});
			this.signalString1.dispatch({x:'1'});
			this.signalString1.dispatch({x:''});
			this.signalString1.dispatch({x:'abc'});
			this.signalString1.dispatch({x:'many words'});
			
			this.signalString2.dispatch({x:'0', y:'ABC'});
			this.signalString2.dispatch({x:'ABC', y:'123'});
			
			this.signalString3.dispatch({x:'A', y:'A', z:'B'});
			this.signalString3.dispatch({x:'A', y:'B', z:'C'});
			this.signalString3.dispatch({x:'A', y:'B', z:'a few words'});
			
		},

		testStringFail1 : function(){			
			this.signalString1.dispatch();
		},

		testStringFail3 : function(){			
			this.signalString1.dispatch({x:1});
		},

		testStringFail4 : function(){			
			this.signalString3.dispatch({x:'abc', y:'ABC'});
		},

		testStringFail5 : function(){			
			this.signalString2.dispatch({x:'A', y:123, z:'C'});
		},

		testStringFail6 : function(){			
			this.signalString2.dispatch({x:'A', y:123});
		},

		testStringFail7 : function(){
			this.signalString3.dispatch({x:'ABC', y:'ABC', z:123, a:'ABC'});
		},
		
		//-------------------------- DATE ---------------------------------------//

		testDate : function(){
			this.signalDate1.add(function(x){this.x = x;}, this);
			this.signalDate2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalDate3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var date1 = new Date();
			var date2 = new Date(10000);
			var date3 = new Date(100000);
			
			this.signalDate1.dispatch({x:date1});
			this.signalDate1.dispatch({x:date2});
			this.signalDate1.dispatch({x:date3});
			
			this.signalDate2.dispatch({x:date1, y:date2});
			this.signalDate2.dispatch({x:date2, y:date3});
			
			this.signalDate3.dispatch({x:date1, y:date2, z:date3});
		},
		
		testDateFail1 : function(){			
			this.signalDate1.dispatch();
		},
		
		testDateFail2 : function(){			
			this.signalDate1.dispatch({x:123});
		},
		
		testDateFail3 : function(){			
			this.signalDate2.dispatch({x:new Date(), y:123});
		},
		
		
		
		
		
		//-------------------------- Array ---------------------------------------//

		testArray : function(){
			this.signalArray1.add(function(x){this.x = x;}, this);
			this.signalArray2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalArray3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var array1 = new Array(1,2,3,4,5,6,7,8);
			var array2 = [];
			var array3 = [123, 'abc', {}, new Date()];
			
			this.signalArray1.dispatch({x:array1});
			this.signalArray1.dispatch({x:array2});
			this.signalArray1.dispatch({x:array3});
			
			this.signalArray2.dispatch({x:array1, y:array2});
			this.signalArray2.dispatch({x:array2, y:array3});
			
			this.signalArray3.dispatch({x:array1, y:array2, z:array3});
		},
		
		testArrayFail1 : function ()
		{
			this.signalArray1.dispatch()
		},
		testArrayFail2 : function ()
		{
			this.signalArray1.dispatch({})
		},
		testArrayFail3 : function ()
		{
			this.signalArray1.dispatch({x:123})
		},
		testArrayFail4 : function ()
		{
			this.signalArray1.dispatch({x:'Array'})
		},

		
		//-------------------------- Object ---------------------------------------//

		testObject : function(){
			this.signalObject1.add(function(x){this.x = x;}, this);
			this.signalObject2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalObject3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var object1 = new Object();
			var object2 = {};
			var object3 = {a:123, b:'abc', c:{}, d:new Date()};
			
			this.signalObject1.dispatch({x:object1});
			this.signalObject1.dispatch({x:object2});
			this.signalObject1.dispatch({x:object3});
			
			this.signalObject2.dispatch({x:object1, y:object2});
			this.signalObject2.dispatch({x:object2, y:object3});
			
			this.signalObject3.dispatch({x:object1, y:object2, z:object3});
		},
		
		testObjectFail1 : function ()
		{
			this.signalObject1.dispatch()
		},
		testObjectFail2 : function ()
		{
			this.signalObject1.dispatch({x:undefined})
		},
		testObjectFail3 : function ()
		{
			this.signalObject1.dispatch({x:123})
		},
		testObjectFail4 : function ()
		{
			this.signalObject1.dispatch({x:'Object'})
		},
		
		//-------------------------- CustomClass ---------------------------------------//

		testCustomClass : function(){
			this.signalCustomClass1.add(function(x){this.x = x;}, this);
			this.signalCustomClass2.add(function(x, y){this.x = x; this.y = y;}, this);
			this.signalCustomClass3.add(function(x, y, z){this.x = x; this.y = y; this.z = z;}, this);
			
			var obj1 = new CustomClass();
			var obj2 = new CustomSubClass();			
			var obj3 = Object.create(CustomClass);
			var obj4 = Object.create(obj1);
			var obj5 = Object.create(obj2);
			
			
			this.signalCustomClass1.dispatch({x:obj1});
			this.signalCustomClass1.dispatch({x:obj2});
			this.signalCustomClass1.dispatch({x:obj3});
			this.signalCustomClass1.dispatch({x:obj4});
			this.signalCustomClass1.dispatch({x:obj5});
			
			
			this.signalCustomClass2.dispatch({x:obj1, y:obj2});
			this.signalCustomClass2.dispatch({x:obj2, y:obj3});
			
			this.signalCustomClass3.dispatch({x:obj1, y:obj2, z:obj3});
		},
		


		testCustomClassFail1 : function ()
		{
			this.signalCustomClass1.dispatch()
		},
		testCustomClassFail2 : function ()
		{
			this.signalCustomClass1.dispatch({x:[]})
		},
		testCustomClassFail3 : function ()
		{
			this.signalCustomClass1.dispatch({x:{}})
		},
		testCustomClassFail4 : function ()
		{
			this.signalCustomClass1.dispatch({x:'CustomClass'})
		},		
		
		//-------------------------- Mixed ---------------------------------------//

		testMixed : function(){
			//this.signalMixed = new signals.Signal(Number, String, Date, Array, Object, CustomClass);

			this.signalMixed.add(function(a, b, c, d, e, f){}, this);

			this.signalMixed.dispatch({x:0, y:'', z:new Date(), a:[], b:{}, c:new CustomClass()});
			this.signalMixed.dispatch({x:-1, y:'ABC', z:new Date(1232456), a:[1,2,3], b:{a:123, b:'ABC'}, c:new CustomSubClass()});
		},
		
		testMixedFail1 : function ()
		{
			this.signalMixed.dispatch()
		},
		testMixedFail2 : function ()
		{
			this.signalMixed.dispatch({x:[]})
		},
		testMixedFail3 : function ()
		{
			this.signalMixed.dispatch({x:{}})
		},
		testMixedFail4 : function ()
		{
			this.signalMixed.dispatch({x:0, y:'', z:new Date(), a:[], b:{}, c:new Object()});
		},
		testMixedFail5 : function ()
		{
			//passes???
			this.signalMixed.dispatch({x:0, y:'', z:new Date(), a:[], b:{}, c:''});
		}
		
		
		
		
	});


	//==============================================================================
	// INIT ------------------------------------------------------------------------

	//create the console
	var r = new Y.Console({
		verbose : true,
		newestOnTop : false
	});

	r.render('#testLogger');

	Y.Test.Runner.add(basic);
	Y.Test.Runner.add(basic2);
	Y.Test.Runner.add(basic3);
	


	

	Y.Test.Runner.on('complete', function(){
		var c = document.getElementById('coverageOutput');
		if(c) c.value = Y.Test.Runner.getCoverage(Y.Coverage.Format.JSON);
	});

	//run the tests
	Y.Test.Runner.run();
	
});