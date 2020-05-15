/*jslint
    fudge
*/

import {
//test     flip,
    constant,
    apply,
    identity
} from "@jlrwi/combinators";

import {
//test     log,
//test     array_map,
    string_concat,
    equals,
    lte,
    type_check
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const type_name = "esString";

// Semigroup :: a -> a -> a
const concat = string_concat;

const append = concat;

// Monoid :: () -> a
const empty = constant ("");

// Setoid :: a -> a -> Boolean
// uses imported equals

// Ord :: a -> a -> Boolean
// Argument format: lte (x) (y) -> lte x is y
// uses imported lte

// Functor :: (a -> b) -> a -> b
const map = apply;

const validate = type_check ("string");

const create = identity;

const type_factory = function (ignore) {
    return Object.freeze({
        spec: "StaticLand",
        version: 1,
        type_name,
        concat,
        append,
        empty,
        equals,
        lte,
        map,
        create,
        validate
    });
};

//test const testT = type_factory ();
//test const test_fxs = array_map (jsc.literal) ([
//test     concat ("_"),
//test     flip (concat) ("!"),
//test     function (str) {
//test         return str.slice(0, 2);
//test     },
//test     function (str) {
//test         return str.split("").reverse().join("");
//test     }
//test ]);
//test const test_roster = adtTests ({
//test     functor: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.string(),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }]
//test     },
//test     semigroup: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.string(),
//test             b: jsc.string(),
//test             c: jsc.string()
//test         }]
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.string()
//test         }]
//test     },
//test     setoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([jsc.string(), "matcher"]),
//test             b: jsc.wun_of([jsc.string(), "matcher"]),
//test             c: jsc.wun_of([jsc.string(), "matcher"])
//test         }]
//test     },
//test     ord: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.string(),
//test             b: jsc.string(),
//test             c: jsc.string()
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