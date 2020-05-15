/*jslint
    fudge
*/

import {
    identity
} from "@jlrwi/combinators";
import {
//test     log,
//test     array_map,
//test     add,
//test     multiply,
//test     exponent,
    equals,
    lte,
    type_check
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Number
const type_name = "esNumber";

// Setoid :: a -> a -> Boolean
const num_equals = function (x) {
    return function (y) {
        return (
            Number.isNaN(x)
            ? Number.isNaN(y)
            : equals (x) (y)
        );
    };
};

// Ord :: a -> a -> Boolean
// Order reads "lte y is x"
const num_lte = function (y) {
    return function (x) {
        return Number.isNaN(x) || lte (x) (y);
    };
};

// Functor :: (a -> b) -> a -> b
const map = identity;

const validate = type_check ("number");

const create = identity;

const type_factory = function (ignore) {
    return Object.freeze({
        spec: "StaticLand",
        version: 1,
        type_name,
        equals: num_equals,
        lte: num_lte,
        map,
        create,
        validate
    });
};

//test const testT = type_factory ();
//test const test_fxs = array_map (jsc.literal) ([
//test     add (10),
//test     exponent (2),
//test     multiply (3),
//test     multiply (-1)
//test ]);
//test const test_roster = adtTests ({
//test     functor: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.number(),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }]
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([jsc.number(), 103]),
//test             b: jsc.wun_of([jsc.number(), 103]),
//test             c: jsc.wun_of([jsc.number(), 103])
//test         }]
//test     },
//test     ord: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.number(),
//test             b: jsc.number(),
//test             c: jsc.number()
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