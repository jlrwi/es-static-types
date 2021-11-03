/*jslint
    fudge
*/

// Static Land implementation of Undefined

import {
//test     identity,
    constant,
    compose
} from "@jlrwi/combinators";
import {
//test     array_map,
    equals
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const biconstant = compose(constant)(constant);

const type_name = "esUndefined";

// Setoid :: a -> a -> Boolean
const adt_equals = biconstant(true);

// Ord :: a -> a -> Boolean
const lte = biconstant(true);

// Functor
const map = biconstant(undefined);

// Semigroup
const concat = biconstant(undefined);

// Monoid
const empty = constant(undefined);

const validate = equals(undefined);

const create = constant(undefined);

const type_factory = function () {
    return Object.freeze({
        spec: "curried-static-land",
        version: 1,
        type_name,
        equals: adt_equals,
        lte,
        concat,
        empty,
        map,
        create,
        validate
    });
};

//test const testT = type_factory();
//test const test_fxs = array_map(jsc.literal)([
//test     constant(undefined),
//test     identity
//test ]);
//test const custom_predicate = function (verdict) {
//test     return function ({left, right, compare_with}) {
//test         return verdict(compare_with(left)(right));
//test     };
//test };
//test const test_roster = adtTests({
//test     functor: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.literal(undefined),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     semigroup: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.falsy(),
//test             b: jsc.falsy(),
//test             c: jsc.falsy()
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.literal(undefined)
//test         }
//test     },
//test     setoid: {
//test         T: testT,
//test         predicate: custom_predicate,
//test         signature: {
//test             a: jsc.falsy(),
//test             b: jsc.falsy(),
//test             c: jsc.falsy()
//test         }
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
