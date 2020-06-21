/*jslint
    fudge
*/

/*
A record is essentially a single item of data with attributes. It cannot be a
functor because any function acting on it must be familiar with its structure.
Manipulation can be accomplished with lenses.
*/

import {
//test     log,
    object_has_property,
    is_object,
    prop,
    empty_object
} from "@jlrwi/esfunctions";
//test import esString from "../src/esString.js";
//test import esBoolean from "../src/esBoolean_Or.js";
//test import esNumber from "../src/esNumber_Addition.js";
//test import esArray from "../src/esArray.js";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Object as a record

// Setoid :: a -> a -> boolean
const equals = function (spec) {
    return function (xs) {
        return function (ys) {

            // Verify xs has all of ys properties
            if (!Object.keys(ys).every(function (key) {
                return object_has_property (key) (xs);
            })) {
                return false;
            }

            // Will catch if ys doesn't have all of xs props
            return Object.keys(spec).every(function (key) {
                return spec[key].equals (xs[key]) (ys[key]);
            });
        };
    };
};

// Semigroup :: {a} -> {a} -> {a}
// Concats each property using the record template
const concat = function (spec) {
    return function (x) {
        return function (y) {
            let res = empty_object ();
            Object.keys(spec).forEach(function (key) {
                if (!object_has_property (key) (x)) {
                    res[key] = y[key];
                } else if (!object_has_property (key) (y)) {
                    res[key] = x[key];
                } else {
                    res[key] = spec[key].concat (x[key]) (y[key]);
                }
            });
            return Object.freeze(res);
        };
    };
};

// Monoid :: () -> {}
// Uses the empty() from each prop in record spec
const empty = function (spec) {
    return function () {
        let res = empty_object ();
        Object.keys(spec).forEach(function (key) {
            res[key] = spec[key].empty ();
        });
        return Object.freeze(res);
    };
};

/*
// Apply :: {(a -> b)} -> {a} -> {b}
// This could be a useful method, but it's not lawful
const ap = function (fs) {
    return function (xs) {
        let res = empty_object ();
        Object.keys(fs).forEach(function (key) {
            if (object_has_property (key) (xs)) {
                res[key] = fs[key] (xs[key]);
            }
        });
        return Object.freeze(res);
    };
};

// Functor :: (a -> b) -> a -> b
const map = function (f) {
    return function (obj) {
        return f (obj);
    };
};

// Run f on a specified property of a record
// This can also be accomplished with lenses
const map_prop = function (target_prop) {
    return function (f) {
        const result_calc = pipeN ([
            prop (target_prop),
            f,
            object_create_pair (target_prop)
        ]);

// a (c) (b (c))
        return ap (object_concat) (result_calc);
    };
};
*/

const get = prop;
const set = function (key) {
    return function (val) {
        return function (o) {
            return Object.freeze({...o, [key]: val});
        };
    };
};

const indexer = Object.freeze({
    get,
    set
});

const type_factory = function (type_of) {
    const base_type = {
        spec: "StaticLand",
        version: 1,
        type_name: "esObject_Record",
        indexer
    };

    if (is_object (type_of)) {

        const check_for_prop = function (prop) {
            return Object.values(type_of).every(
                object_has_property (prop)
            );
        };

        if (check_for_prop ("concat")) {
            base_type.concat = concat (type_of);
        }

        if (check_for_prop ("empty")) {
            base_type.empty = empty (type_of);
        }

        if (check_for_prop ("equals")) {
            base_type.equals = equals (type_of);
        }
    }

    return Object.freeze(base_type);
};

//test const obj_recT = type_factory({
//test     s: esString (),
//test     n: esNumber (),
//test     b: esBoolean (),
//test     a: esArray (esNumber ())
//test });

//test const test_roster = adtTests ({
//test     semigroup: {
//test         T: obj_recT,
//test         signature: [{
//test             a: jsc.object(
//test                 ["s", "n", "b", "a"],
//test                 [
//test                     jsc.string(),
//test                     jsc.integer(),
//test                     jsc.boolean(),
//test                     jsc.array(jsc.integer(3, 5), 11)
//test                 ]
//test             ),
//test             b: jsc.object(
//test                 ["s", "n", "b", "a"],
//test                 [
//test                     jsc.string(),
//test                     jsc.integer(),
//test                     jsc.boolean(),
//test                     jsc.array(jsc.integer(3, 5), 11)
//test                 ]
//test             ),
//test             c: jsc.object(
//test                 ["s", "n", "b", "a"],
//test                 [
//test                     jsc.string(),
//test                     jsc.integer(),
//test                     jsc.boolean(),
//test                     jsc.array(jsc.integer(3, 5), 11)
//test                 ]
//test             )
//test         }]
//test     },
//test     monoid: {
//test         T: obj_recT,
//test         signature: [{
//test             a: jsc.object(
//test                 ["s", "n", "b", "a"],
//test                 [
//test                     jsc.string(),
//test                     jsc.integer(),
//test                     jsc.boolean(),
//test                     jsc.array(jsc.integer(3, 5), 11)
//test                 ]
//test             )
//test         }]
//test     },
//test     setoid: {
//test         T: obj_recT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 jsc.object(
//test                     ["s", "n", "b", "a"],
//test                     [
//test                         jsc.string(),
//test                         jsc.integer(),
//test                         jsc.boolean(),
//test                         jsc.array(jsc.integer(3, 5), 11)
//test                     ]
//test                 ),
//test                 jsc.object(
//test                     ["s", "n", "b", "a"],
//test                     [
//test                         "identical",
//test                         37,
//test                         jsc.boolean(),
//test                         jsc.array(jsc.integer(3, 5), 11)
//test                     ]
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 jsc.object(
//test                     ["s", "n", "b", "a"],
//test                     [
//test                         jsc.string(),
//test                         jsc.integer(),
//test                         jsc.boolean(),
//test                         jsc.array(jsc.integer(3, 5), 11)
//test                     ]
//test                 ),
//test                 jsc.object(
//test                     ["s", "n", "b", "a"],
//test                     [
//test                         "identical",
//test                         37,
//test                         jsc.boolean(),
//test                         jsc.array(jsc.integer(3, 5), 11)
//test                     ]
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 jsc.object(
//test                     ["s", "n", "b", "a"],
//test                     [
//test                         jsc.string(),
//test                         jsc.integer(),
//test                         jsc.boolean(),
//test                         jsc.array(jsc.integer(3, 5), 11)
//test                     ]
//test                 ),
//test                 jsc.object(
//test                     ["s", "n", "b", "a"],
//test                     [
//test                         "identical",
//test                         37,
//test                         jsc.boolean(),
//test                         jsc.array(jsc.integer(3, 5), 11)
//test                     ]
//test                 )
//test             ])
//test         }]
//test     }
//test });

//test test_roster.forEach(jsc.claim);
//testbatch /*
//test jsc.check({
//test     on_report: log
//test });
//testbatch */
//testbatch export {jsc};

export default Object.freeze(type_factory);