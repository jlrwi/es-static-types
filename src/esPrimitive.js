/*jslint
    fudge
*/

// Not passing tests yet - still needs work

import {
    identity,
    apply,
    apply_with,
    second,
    compose
} from "@jlrwi/combinators";
import {
//test     log,
//test     array_map,
//test     add,
//test     multiply,
//test     exponent,
    type_check,
    not,
    or
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Number
const type_name = "esPrimitive";

// Functor :: (a -> b) -> a -> b
const map = apply;

// Functor :: (a -> b) -> a -> b
const ap = apply;

// Applicative :: x -> x
const of = identity;

const validate = compose (not) (
    or (type_check ("object")) (type_check ("function"))
);

const create = identity;

const type_factory = function (ignore) {
    return Object.freeze({
        spec: "StaticLand",
        version: 1,
        type_name,
        map,
        ap,
        of,
        create,
        validate
    });
};

// NEEDS A COMPARE_WITH f

//test const testT = type_factory ();
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
//test const test_fxs = array_map (jsc.literal) ([
//test     get_type,
//test     is_bottom,
//test     identity
//test ]);
//test const test_roster = adtTests ({
//test     functor: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.any(),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }],
//test         predicate
//test     },
//test     apply: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.any(),
//test             u: jsc.wun_of(test_fxs),
//test             v: jsc.wun_of(test_fxs)
//test         }],
//test         predicate
//test     },
//test     applicative: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.any(),
//test             f: jsc.wun_of(test_fxs),
//test             u: jsc.wun_of(test_fxs),
//test             x: jsc.any()
//test         }],
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