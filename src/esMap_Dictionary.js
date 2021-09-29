/*jslint
    fudge
*/

import {
//test     pipeN,
    compose,
    flip,
    pipe
} from "@jlrwi/combinators";
import {
//test     equals,
//test     prop,
//test     lt,
//test     array_map,
//test     add,
//test     multiply,
//test     remainder,
//test     exponent,
//test     method,
    object_has_property,
    is_object
} from "@jlrwi/esfunctions";
//test import esNumber_Addition from "../src/esNumber_Addition.js";
//test import esBoolean from "../src/esBoolean_Or.js";
//test import pair_type from "../../StaticTypesBasic/Pair_Type.min.js";
//test import maybe_type from "../../StaticTypesBasic/Maybe_Type.min.js";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

const map_set = function (key) {
    return function (val) {
        return function (obj) {
            return new_map(obj).set(key, val);
        };
    };
};

const map_get = function (obj) {
    return function (key) {
        return obj.get(key);
    };
};

const create = function (key) {
    return function (val) {
        return Object.freeze(new Map([[key, val]]));
    };
};

const new_map = function (contents) {
    return Object.freeze(new Map(contents));
};

// Semigroup :: <a> -> <a> -> <a>
// With overwriting duplicate keys
const concat = function (objA) {
    return function (objB) {
        let result = new_map (objA);
        objB.forEach(function (val, key) {
            result.set(key, val);
        });
        return Object.freeze(result);
    };
};

// Monoid :: () -> {}
const empty = new_map;

const append = compose (map_set) (new_map);

// Functor :: (a -> b) -> <a> -> <b>
const map = function (f) {
    return function (xs) {
        let obj = new Map();
        xs.forEach(function (val, key) {
            obj.set(key, f(val));
        });
        return Object.freeze(obj);
    };
};

// Alt :: <a> -> <a> -> <a>
// With overwriting duplicate keys
const alt = concat;

// Plus :: () -> {}
const zero = empty;

// Functor :: <(a -> b)> -> <a> -> <b>
const ap = function (fs) {
    return function (xs) {
        let res = new Map();
        fs.forEach(function (f, key) {
            const val = xs.get(key);
            if (val !== undefined) {
                res.set(key, f(val));
            }
        });
        return Object.freeze(res);
    };
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> <a> -> U<<b>>
const traverse = function (of_T) {
    return function (f) {
        return reduce (function (acc) {
            return function (val) {
                const first = val.entries().next().value;
                const key = first[0];
                const value = first[1];

                // Make an apply that's waiting for the acc to concat
                return of_T.ap (
                    of_T.map (
                        // Make the result of f back into an object, then concat
                        pipe (
                            create (key)
                        ) (
                            flip (concat)
                        )
                    ) (
                        f (value)
                    )
                ) (acc);
            };
        }) (of_T.of(new Map ()));
    };
};

// Foldable :: ((c, (a, b)) -> c) -> c -> <a: b> -> c
const reduce = function (f) {
    return function (initial) {
        return function (xs) {
            let acc = initial;
            xs.forEach(function (val, key) {
                acc = f (acc) (create (key) (val));
            });
            return acc;
        };
    };
};

// Filterable :: (a -> Boolean) -> <a> -> <a>
const filter = function (f) {
    return function (xs) {
        let res = new Map();
        xs.forEach(function (val, key) {
            if (f (val) === true) {
                res.set(key, val);
            }
        });
        return Object.freeze(res);
    };
};

// Setoid :: a -> a -> boolean
const map_equals = function (content_type) {
    return function (xs) {
        return function (ys) {

            // Verify xs has all of ys properties
            if (!Array.from(ys.keys()).every(function (key) {
                return xs.has(key);
            })) {
                return false;
            }

            // Will catch if ys doesn't have all of xs props
            return Array.from(xs.keys()).every(function (key) {
                return content_type.equals (xs.get(key)) (ys.get(key));
            });
        };
    };
};

/*
Can't do lte because can't sort keys (could be objs)
// Ord :: a -> a -> Boolean
// true at either (for sorted list of keys):
// -first index where xs[key] < ys[key]
// -first index where xs is missing one of ys keys
// -both objects identical for all keys
const lte = function (content_type) {
    return function (ys) {
        return function (xs) {
            // if .some() finishes, default result is that all xs lte ys
            let result = true;

            // Create an object with all the keys from both objects
            const key_list = concat (
                map (constant (true)) (xs)
            ) (
                map (constant (true)) (ys)
            );

            key_list.keys().sort().some(function (key) {

                // ys has a prop not in xs - end loop, is lte
                if (!xs.has(key)) {
                    return true;
                }

                // xs has a prop not in ys - end loop, not lte
                // if xs is empty, will never reach this
                if (!ys.has(key)) {
                    result = false;
                    return true;
                }

                // keep iterating - still equal
                if (content_type.equals (ys.get(key)) (xs.get(key))) {
                    return false;
                }

                // done - found a prop where lte
                if (content_type.lte (ys.get(key)) (xs.get(key))) {
                    return true;
                }

                // By default, ys[key] > xs[key] - failed!
                result = false;
                return true;
            });

            return result;
        };
    };
};
*/

const type_factory = function (type_of) {
    let base_type = {
        spec: "StaticLand",
        version: 1,
        type_name: "esMap_Dictionary",
        map,
        alt,
        zero,
        ap,
//        extend,
        reduce,
        traverse,
        filter,
        concat,
        empty,
        append,
        set: map_set,
        get: map_get,
//        indexer,
        create,
        validate: is_object
    };

    if (is_object (type_of)) {

        const check_for_prop = flip (object_has_property) (type_of);

        if (check_for_prop ("equals")) {
            base_type.equals = map_equals (type_of);
        }

//        if (check_for_prop ("lte")) {
//            base_type.lte = lte (type_of);
//        }

//        if (check_for_prop ("validate")) {
//            base_type.validate = validate (type_of);
//        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

//test const numT = esNumber_Addition();
//test const map_of_numT = type_factory (numT);
//test const pair_of_bool_numT = pair_type (esBoolean ()) (numT);
//test const maybe_of_numT = maybe_type (numT);

//test const num_num_fxs = array_map (jsc.literal) ([
//test     add (10),
//test     exponent (2),
//test     multiply (3),
//test     multiply (-1)
//test ]);
//test const entries_to_map = function (jsc_entries) {
//test     return function () {
//test         return new Map(jsc_entries());
//test     };
//test };
//test const mapper_to_reducer = function (mapper) {
//test     return jsc.literal(function (acc) {
//test         return pipeN (
//test             method("values")(),
//test             prop (0),
//test             mapper (),
//test             numT.concat (acc)
//test         );
//test     });
//test };
//test const filters = array_map (jsc.literal) ([
//test     lt (0),
//test     compose (equals (0)) (remainder (2)),
//test     function (n) {
//test         return (equals (
//test             pipeN (
//test                 exponent (0.5),
//test                 Math.floor,
//test                 exponent (2)
//test             ) (n)
//test         ) (
//test             n
//test         ));
//test     }
//test ]);

//test const test_roster = adtTests ({
//test     functor: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             f: jsc.wun_of(num_num_fxs),
//test             g: jsc.wun_of(num_num_fxs)
//test         }]
//test     },
//test     alt: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             b: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             c: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             f: jsc.wun_of(num_num_fxs)
//test         }]
//test     },
//test     plus: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             f: jsc.wun_of(num_num_fxs)
//test         }]
//test     },
//test     apply: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             u: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 5),
//test                     jsc.array([
//test                         jsc.string(
//test                             1,
//test                             jsc.character("a", "f")
//test                         ),
//test                         jsc.wun_of(num_num_fxs)
//test                     ])
//test                 )
//test             ),
//test             v: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 5),
//test                     jsc.array([
//test                         jsc.string(
//test                             1,
//test                             jsc.character("a", "f")
//test                         ),
//test                         jsc.wun_of(num_num_fxs)
//test                     ])
//test                 )
//test             )
//test         }]
//test     },
//test     foldable: {
//test         T: map_of_numT,
//test         signature: [{
//test             f: jsc.wun_of(array_map (mapper_to_reducer) (num_num_fxs)),
//test             x: 0,
//test             u: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             )
//test         }],
//test         compare_with: numT.equals
//test     },
//test     traversable: {
//test         T: map_of_numT,
//test         signature: [{
//test             A: pair_of_bool_numT,
//test             B: maybe_of_numT,
//test             a: function () {
//test                 return pair_of_bool_numT.create (
//test                     jsc.boolean() ()
//test                 ) (
//test                     jsc.integer(-999, 999) ()
//test                 );
//test             },
//test             f: jsc.literal(function (pr) {
//test                 return maybe_of_numT.just (pr.snd);
//test             }),
//test             g: jsc.wun_of(num_num_fxs),
//test             u: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         function () {
//test                             return pair_of_bool_numT.create (
//test                                 jsc.boolean() ()
//test                             ) (
//test                                 maybe_of_numT.just(
//test                                     jsc.integer(-999,999) ()
//test                                 )
//test                             );
//test                         }
//test                     ])
//test                 )
//test             )
//test         }],
//test         compare_with: array_map (prop ("equals")) ([
//test             maybe_of_numT,
//test             compose (maybe_type) (type_factory) (maybe_of_numT),
//test             compose (maybe_type) (type_factory) (pair_of_bool_numT),
//test             pair_type (esBoolean ()) (maybe_type (map_of_numT))
//test         ])
//test     },
//test     filterable: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             b: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }]
//test     },
//test     semigroup: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             b: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             c: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             )
//test         }]
//test     },
//test     monoid: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(3, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             )
//test         }]
//test     },
//test     setoid: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 10),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "z")),
//test                             jsc.integer(-999, 999)
//test                         ])
//test                     )
//test                 ),
//test                 new_map([["x", 13], ["y", 13], ["z", 13]])
//test             ]),
//test             b: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 10),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "z")),
//test                             jsc.integer(-999, 999)
//test                         ])
//test                     )
//test                 ),
//test                 new_map([["x", 13], ["y", 13], ["z", 13]])
//test             ]),
//test             c: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 10),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "z")),
//test                             jsc.integer(-999, 999)
//test                         ])
//test                     )
//test                 ),
//test                 new_map([["x", 13], ["y", 13], ["z", 13]])
//test             ])
//test         }]
//test     }
/*
//test     ord: {
//test         T: map_of_numT,
//test         signature: [{
//test             a: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 10),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "z")),
//test                             jsc.integer(-999, 999)
//test                         ])
//test                     )
//test                 ),
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 5),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "f")),
//test                             13
//test                         ])
//test                     )
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 10),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "z")),
//test                             jsc.integer(-999, 999)
//test                         ])
//test                     )
//test                 ),
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 5),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "f")),
//test                             13
//test                         ])
//test                     )
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 10),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "z")),
//test                             jsc.integer(-999, 999)
//test                         ])
//test                     )
//test                 ),
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(3, 5),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "f")),
//test                             13
//test                         ])
//test                     )
//test                 )
//test             ])
//test         }]
//test     }
*/
//test });

//test test_roster.forEach(jsc.claim);
//testbatch /*
//test jsc.check({
//test     on_report: log
//test });
//testbatch */
//testbatch export {jsc};

export default Object.freeze(type_factory);