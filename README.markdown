# Strict enhancement by jon@shovemedia.com #
When you create a new Signal, you can do it the normal way:

mySignal = new Signal(); // no argument verification rules will be applied.

or with typed arguments a la Robert Penner's original AS3 implementation:

mySignal = new Signal( Number, String, Array, Date, Function, MyClass );

or with a single argument containing a hash of named keys:

mySignal = new Signal( {x:Number, y:String, z:Array, a:Date, b:Function, c:MyClass} );

when you dispatch, arguments are verified against whatever passed to the constructor.
Currently the only behavior is to throw an error if verification fails.

The idea is to find mis-matches more quickly during development -- you *should* be
able to swap it for the original version during deployment (no checks == better performance).

I haven't done anything yet with allowing nulls in certain cases, i.e. optional arguments.
We'll see if it actually comes up in practice.


# JS-Signals #

Custom event/messaging system for JavaScript inspired by [AS3-Signals](https://github.com/robertpenner/as3-signals).

For a more in-depth introduction read the [JS-Signals Project Page](http://millermedeiros.github.com/js-signals/) and visit the links below.


## Links ##

 * [Project Page](http://millermedeiros.github.com/js-signals/)
 * [Wiki](http://github.com/millermedeiros/js-signals/wiki/)
 * [Documentation](http://millermedeiros.github.com/js-signals/docs)
 * [Changelog](http://github.com/millermedeiros/js-signals/blob/master/CHANGELOG.markdown)
 * [CompoundSignal - special Signal kind](https://github.com/millermedeiros/CompoundSignal)


## License ##

 * [MIT License](http://www.opensource.org/licenses/mit-license.php)


## Distribution Files ##

You can use the same distribution file for all the evironments, browser script
tag, AMD, CommonJS (since v0.7.0).

Files inside `dist` folder:

 * docs/index.html : Documentation.
 * signals.js : Uncompressed source code with comments.
 * signals.min.js : Compressed code.

You can install JS-Signals on Node.js using [NPM](http://npmjs.org/)

    npm install signals


## CompoundSignal

Note that there is an advanced Signal type called `CompoundSignal` that is
compatible with js-signals v0.7.0+. It's useful for cases where you may need to
execute an action after multiple Signals are dispatched. It was split into its'
own repository since this feature isn't always needed and that way it can be
easily distributed trough npm.

[CompoundSignal repository](https://github.com/millermedeiros/CompoundSignal)



## Repository Structure ##

### Folder Structure ###

    dev       ->  development files
    |- build       ->  files used on the build process
    |- src         ->  source files
    |- tests       ->  unit tests
    dist      ->  distribution files
    |- docs        ->  documentation

### Branches ###

    master      ->  always contain code from the latest stable version
    release-**  ->  code canditate for the next stable version (alpha/beta)
    develop     ->  main development branch (nightly)
    **other**   ->  features/hotfixes/experimental, probably non-stable code


## Building your own ##

This project uses [Apache Ant](http://ant.apache.org/) for the build process. If for some reason you need to build a custom version of JS-Signals install Ant and run:

    ant build

This will delete all JS files inside the `dist` folder, merge/update/compress source files, validate generated code using [JSLint](http://www.jslint.com/) and copy the output to the `dist` folder.

There is also another ant task that runs the build task and generate
documentation (used before each deploy):

    ant deploy

**IMPORTANT:** `dist` folder always contain the latest version, regular users should **not** need to run build task.
