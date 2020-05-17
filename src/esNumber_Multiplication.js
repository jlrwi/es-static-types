/*jslint
    fudge
*/

//erase /*
import esNumber from "../src/esNumber.js";
//erase */
//stage import esNumber from "./esNumber.min.js";
import {
    constant
} from "@jlrwi/combinators";
import {
//test    log,
    multiply,
    object_concat
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Number under Multipication
//   an extension of esNumber
const type_name = "esNumberMultiplication";

// Semigroup :: a -> a -> a
const concat = multiply;

// Monoid :: () -> a
const empty = constant (1);

// Group :: a -> a
const invert = function (x) {
    return (
        x === 0
        ? 0
        : 1 / x
    );
};

const type_factory = function (ignore) {
    return object_concat (esNumber ()) ({
        spec: "StaticLand",
        version: 1,
        type_name,
        concat,
        empty,
        invert
    });
}

//test const testT = type_factory ();
//test const test_roster = adtTests ({
//test     semigroup: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.integer(-999, 999),
//test             b: jsc.integer(-999, 999),
//test             c: jsc.integer(-999, 999)
//test         }]
//test     },
//test     monoid: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.number(-999, 999)
//test         }]
//test     },
//test     group: {
//test         T: testT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 jsc.integer(-48, -1),
//test                 jsc.integer(1, 48)
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