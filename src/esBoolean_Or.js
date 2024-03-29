/*jslint
    unordered
*/

//erase /*
import esBoolean from "../src/esBoolean.js";
//erase */
//stage import esBoolean from "./esBoolean.min.js";

import {
    constant
} from "@jlrwi/combinators";
import {
    or,
    object_concat
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Boolean under OR
//   an extension of esBoolean
const type_name = "esBooleanOr";

// Semigroup :: a -> a -> a
const concat = or;

// Monoid :: () -> a
const empty = constant(false);

const type_factory = function (ignore) {
    return Object.freeze(
        object_concat(esBoolean())({
            spec: "curried-static-land",
            version: 1,
            type_name,
            concat,
            empty
        })
    );
};

//test const testT = type_factory();
//test const test_roster = adtTests({
//test     semigroup: {
//test         T: testT,
//test         signature: {
//test             a: jsc.boolean(),
//test             b: jsc.boolean(),
//test             c: jsc.boolean()
//test         }
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: {
//test             a: jsc.boolean()
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
