/*jslint
    fudge
*/

// Generic type for primitive values:
// number, string, boolean, undefined, null, NaN

import {
    identity,
    apply,
    pipe
} from "@jlrwi/combinators";
import {
//test     array_map,
    type_check,
    not,
    or
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Number
const type_name = "esPrimitive";

// Setoid :: a -> a -> boolean
const equals = function (a) {
    return function (b) {
        if (a === undefined) {
            return (b === undefined);
        }

        if (a === null) {
            return (b === null);
        }

        if (Number.isNaN(a)) {
            return Number.isNaN(b);
        }

        return (a === b);
    };
};

// Functor :: (a -> b) -> a -> b
const map = apply;

// Apply :: (a -> b) -> a -> b
const ap = apply;

// Applicative :: x -> x
const of = identity;

const validate = pipe(
    or(type_check("object"))(type_check("function"))
)(
    not
);

const create = identity;

const type_factory = function () {
    return Object.freeze({
        spec: "curried-static-land",
        version: 1,
        type_name,
        equals,
        map,
        ap,
        of,
        create,
        validate
    });
};

//test const testT = type_factory();
//test const predicate = function (verdict) {
//test     return function ({left, right}) {
//test         if (left === undefined) {
//test             return verdict(right === undefined);
//test         }
//test
//test         if (left === null) {
//test             return verdict(right === null);
//test         }
//test
//test         if (Number.isNaN(left)) {
//test             return verdict(Number.isNaN(right));
//test         }
//test
//test         return verdict(left === right);
//test     };
//test };
//test const get_type = function (x) {
//test     return typeof x;
//test };
//test const is_bottom = function (x) {
//test     return ((x === undefined) || (x === null));
//test };
//test const test_fxs = array_map(jsc.literal)([
//test     get_type,
//test     is_bottom,
//test     identity
//test ]);
//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         signature: {
//test             a: jsc.any(),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         },
//test         predicate
//test     },
//test     apply: {
//test         T: testT,
//test         signature: {
//test             a: jsc.any(),
//test             u: jsc.wun_of(test_fxs),
//test             v: jsc.wun_of(test_fxs)
//test         },
//test         predicate
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: {
//test             a: jsc.any(),
//test             f: jsc.wun_of(test_fxs),
//test             u: jsc.wun_of(test_fxs),
//test             x: jsc.any()
//test         },
//test         predicate
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.any(),
//test             b: jsc.any(),
//test             c: jsc.any()
//test         },
//test         predicate
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