/*jslint
    unordered
*/

/*
A record is essentially a single item of data with attributes. It cannot be a
functor because any function acting on it must be familiar with its structure.
Manipulation can be accomplished with lenses.
*/

import {
//test     compose,
    flip,
    pipe,
    pipeN
} from "@jlrwi/combinators";
import {
//test     array_map,
//test     add,
//test     multiply,
//test     exponent,
    object_has_property,
    object_create_pair,
    is_object,
    method,
    prop
} from "@jlrwi/esfunctions";
//test import esString from "../src/esString.js";
//test import esBoolean from "../src/esBoolean_Or.js";
//test import esNumber from "../src/esNumber_Addition.js";
//test import esArray from "../src/esArray.js";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Object as a record

const create = object_create_pair;

// Setoid :: a -> a -> boolean
const equals = function (spec) {
    return function (xs) {
        return function (ys) {

            // Verify xs has all of ys properties
            if (!Object.keys(ys).every(function (key) {
                return object_has_property(key)(xs);
            })) {
                return false;
            }

            // Will catch if ys doesn't have all of xs props
            return Object.keys(spec).every(function (key) {
                return spec[key].equals(xs[key])(ys[key]);
            });
        };
    };
};

// Semigroup :: {a} -> {a} -> {a}
// Concats each property using the record template
const concat = function (spec) {
    return function (x) {
        return function (y) {
            const mapper = function ([key, type_module]) {
//                const [key, type_module] = key_val;
                if (!object_has_property(key)(x)) {
                    return [key, y[key]];
                }
                if (!object_has_property(key)(y)) {
                    return [key, x[key]];
                }
                return [key, type_module.concat(x[key])(y[key])];
            };

            return Object.freeze(
                Object.fromEntries(
                    Object.entries(spec).map(mapper)
                )
            );
        };
    };
};

// Monoid :: () -> {}
// Uses the empty() from each prop in record spec
const empty = function (spec) {
    return function () {
        return Object.freeze(
            Object.fromEntries(
                Object.entries(spec).map(function ([key, type_module]) {
                    return [key, type_module.empty()];
                })
            )
        );
    };
};


// {(a -> b)} -> {a} -> {b}
// This approximates Apply algebra but is not lawful
// There is an implicit identity function in fs for all properties
const record_map = function (fs) {
    const entries_mapper = function ([key, val]) {
        return [
            key,
            (
                (object_has_property(key)(fs))
                ? fs[key](val)
                : val
            )
        ];
    };

    return pipeN(
        Object.entries,
        method("map")(entries_mapper),
        Object.fromEntries,
        Object.freeze
    );
};

/*
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
    return pipe(
        object_create_pair(key)
    )(
        flip(concat)
    );
};

const validate = function (spec) {
    return function (x) {
        return Object.keys(spec).every(function (key) {
            return spec[key].validate(x[key]);
        });
    };
};

// type_of is a template of the record
// each property value is a type module
const type_factory = function (type_of) {
    const base_type = {
        spec: "curried-static-land",
        version: 1,
        type_name: "esObject_Record",
        get,
        set,
        create,
        record_map
    };

    if (is_object(type_of)) {
        const check_for_prop = function (prop) {
            return Object.values(type_of).every(object_has_property(prop));
        };

        if (check_for_prop("concat")) {
            base_type.concat = concat(type_of);
        }

        if (check_for_prop("empty")) {
            base_type.empty = empty(type_of);
        }

        if (check_for_prop("equals")) {
            base_type.equals = equals(type_of);
        }

        base_type.validate = validate(type_of);
    }

    return Object.freeze(base_type);
};

//test const obj_recT = type_factory({
//test     s: esString(),
//test     n: esNumber(),
//test     b: esBoolean(),
//test     a: esArray(esNumber())
//test });
//test const record_of_numT = type_factory({
//test     a: esNumber(),
//test     b: esNumber(),
//test     c: esNumber(),
//test     d: esNumber()
//test });
//test const num_num_fxs = array_map(jsc.literal)([
//test     add(10),
//test     add(-31),
//test     exponent(2),
//test     multiply(3),
//test     multiply(-7),
//test     multiply(-1)
//test ]);
//test const test_roster = adtTests({
//test     semigroup: {
//test         T: obj_recT,
//test         signature: {
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
//test         }
//test     },
//test     monoid: {
//test         T: obj_recT,
//test         signature: {
//test             a: jsc.object(
//test                 ["s", "n", "b", "a"],
//test                 [
//test                     jsc.string(),
//test                     jsc.integer(),
//test                     jsc.boolean(),
//test                     jsc.array(jsc.integer(3, 5), 11)
//test                 ]
//test             )
//test         }
//test     },
//test     setoid: {
//test         T: obj_recT,
//test         signature: {
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
//test         }
//test     }
//test });
//test jsc.claim({
//test     name: "record_map associativity",
//test     predicate: function (verdict) {
//test         return function ({a, f, g}) {
//test             const composed = pipeN(
//test                 Object.entries,
//test                 method("map")(function ([key, f_function]) {
//test                     return [key, compose(f_function)(g[key])];
//test                 }),
//test                 Object.fromEntries
//test             )(
//test                 f
//test             );
//test
//test             const left = record_map(composed)(a);
//test             const right = record_map(f)(record_map(g)(a));
//test             return verdict(record_of_numT.equals(left)(right));
//test         };
//test     },
//test     signature: {
//test         a: jsc.object(
//test             ["a", "b", "c", "d"],
//test             [
//test                 jsc.integer(),
//test                 jsc.integer(),
//test                 jsc.integer(),
//test                 jsc.integer()
//test             ]
//test         ),
//test         f: jsc.object(
//test             ["a", "b", "c", "d"],
//test             [
//test                 jsc.wun_of(num_num_fxs),
//test                 jsc.wun_of(num_num_fxs),
//test                 jsc.wun_of(num_num_fxs),
//test                 jsc.wun_of(num_num_fxs)
//test             ]
//test         ),
//test         g: jsc.object(
//test             ["a", "b", "c", "d"],
//test             [
//test                 jsc.wun_of(num_num_fxs),
//test                 jsc.wun_of(num_num_fxs),
//test                 jsc.wun_of(num_num_fxs),
//test                 jsc.wun_of(num_num_fxs)
//test             ]
//test         )
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