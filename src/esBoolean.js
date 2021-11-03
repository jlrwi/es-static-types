/*jslint
    fudge
*/

import {
//test     constant,
    identity
} from "@jlrwi/combinators";
import {
//test     and,
//test     or,
//test     not,
//test     array_map,
    log,
    equals,
    type_check
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Boolean
const type_name = "esBoolean";

// Setoid :: a -> a -> Boolean
// Uses imported equals

// Ord :: a -> a -> Boolean
const lte = function (y) {
    return function (x) {
        return !x || y;
    };
};

// Functor :: (a -> b) -> a -> b
const map = identity;

// Custom methods

//test jsc.claim({
//test     name: "validate",
//test     predicate: function (verdict) {
//test         return function (a) {
//test             return verdict(equals(
//test                 validate(a)
//test             )(
//test                 or(a === true)(a === false)
//test             ));
//test         };
//test     },
//test     signature: [
//test         jsc.wun_of([
//test             jsc.any()
//test         ])
//test     ]
//test });

const validate = type_check("boolean");

const create = identity;

// a -> a -> bool -> a
const map_to = function (when_true) {
    return function (when_false) {
        return function (bool) {
            log("Deprecated: esBoolean.js map_to()");
            return (
                bool
                ? when_true
                : when_false
            );
        };
    };
};

const type_factory = function () {
    return Object.freeze({
        spec: "curried-static-land",
        version: 1,
        type_name,
        equals,
        lte,
        map,
        map_to,     // deprecated
        create,
        validate
    });
};

//test const testT = type_factory();
//test const test_fxs = array_map(jsc.literal)([
//test     not,
//test     constant(true),
//test     constant(false),
//test     and(true),
//test     and(false),
//test     or(true),
//test     or(false)
//test ]);
//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: jsc.boolean(),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.boolean(),
//test             b: jsc.boolean(),
//test             c: jsc.boolean()
//test         }
//test     },
//test     ord: {
//test         T: testT,
//test         signature: {
//test             a: jsc.boolean(),
//test             b: jsc.boolean(),
//test             c: jsc.boolean()
//test         }
//test     }
//test });

//test test_roster.forEach(jsc.claim);
//testbatch /*
//test jsc.check({
//test     nr_trials: 50,
//test     on_report: log
//test });
//testbatch */
//testbatch export {jsc};

export default Object.freeze(type_factory);