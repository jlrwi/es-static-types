/*jslint
    fudge
*/

import {
    compose,
    constant,
    flip,
    pipe,
    pipeN
} from "@jlrwi/combinators";
import {
//test     and,
//test     not,
//test     equals,
    prop,
//test     lt,
//test     string_concat,
//test     add,
//test     multiply,
//test     remainder,
//test     exponent,
    object_has_property,
    method,
    object_create_pair,
    object_append,
    empty_object,
    minimal_object,
    array_map,
    is_object
} from "@jlrwi/esfunctions";
//test import esNumber_Addition from "../src/esNumber_Addition.js";
//test import esBoolean from "../src/esBoolean_Or.js";
//test import {
//test     pair_type,
//test     maybe_type
//test } from "@jlrwi/static-types-basic";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Object as a dictionary

const create = object_create_pair;

// Semigroup :: {a} -> {a} -> {a}
// With overwriting duplicate keys
const concat = function (objA) {
    return function (objB) {
        return Object.freeze(
            Object.assign(empty_object(), objA, objB)
        );
    };
};

const append = object_append;

// Monoid :: () -> {}
const empty = minimal_object;

// Functor :: (a -> b) -> {a} -> {b}
const map = function (f) {
    const mapper = function ([key, value]) {
        return [
            key,
            f(value)
        ];
    };

    return pipeN(
        Object.entries,
        method("map")(mapper),
        Object.fromEntries,
        Object.freeze
    );
};

// Alt :: {a} -> {a} -> {a}
// With overwriting duplicate keys
const alt = concat;

// Plus :: () -> {}
const zero = empty;

// Apply :: {(a -> b)} -> {a} -> {b}
const ap = function (fs) {
    return function (xs) {
        let res = empty_object();
        Object.keys(fs).forEach(function (key) {
            if (object_has_property(key)(xs)) {
                res[key] = fs[key](xs[key]);
            }
        });
        return Object.freeze(res);
    };
};

const object_subset = function (keys) {
    return function (obj) {
        let res = empty_object();
        keys.forEach(function (key) {
            res[key] = obj[key];
        });
        return Object.freeze(res);
    };
};

// Extend :: ({a} -> b) -> {a} -> {b}
const extend = function (f) {
    return function (xs) {
        const key_lists = Object.keys(xs).sort().map(
            function (ignore, idx, keys) {
                return keys.slice(idx);
            }
        );
        let obj = empty_object();
        key_lists.forEach(function (keys) {
            obj[keys[0]] = f(object_subset(keys)(xs));
        });
        return Object.freeze(obj);
    };
};

// Foldable :: ((c, {a: b}) -> c) -> c -> {a: b} -> c
const reduce = function (f) {
    return function (initial) {
        return function (xs) {
            let acc = initial;
            Object.entries(xs).forEach(function ([key, val]) {
                acc = f(
                    acc
                )(
                    object_create_pair(key)(val)
                );
            });
            return Object.freeze(acc);
        };
    };
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> {a} -> U<{b}>
const traverse = function (of_T) {
    return function (f) {
        return reduce(function (acc) {
            return function (val) {
                const key = Object.keys(val)[0];

                // Make an apply that's waiting for the acc to concat
                return of_T.ap(
                    of_T.map(
                        // Make the result of f back into an object, then concat
                        pipe(
                            create(key)
                        )(
                            flip(concat)
                        )
                    )(
                        f(val[key])
                    )
                )(
                    acc
                );
            };
        })(
            of_T.of(empty_object())
        );
    };
};

// Filterable :: (a -> Boolean) -> {a} -> {a}
const filter = function (f) {
    return pipeN(
        Object.entries,
        method("filter")(compose(f)(prop(1))),
        Object.fromEntries,
        Object.freeze
    );
};

// Setoid :: a -> a -> boolean
const object_equals = function (content_type) {
    return function (xs) {
        return function (ys) {

            // Verify xs has all of ys properties
            if (!Object.keys(ys).every(function (key) {
                return object_has_property(key)(xs);
            })) {
                return false;
            }

            // Will catch if ys doesn't have all of xs props
            return Object.keys(xs).every(function (key) {
                return content_type.equals(xs[key])(ys[key]);
            });
        };
    };
};

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
            const key_list = concat(
                map(constant(true))(xs)
            )(
                map(constant(true))(ys)
            );

            Object.keys(key_list).sort().some(function (key) {

                // ys has a prop not in xs - end loop, is lte
                if (!object_has_property(key)(xs)) {
                    return true;
                }

                // xs has a prop not in ys - end loop, not lte
                // if xs is empty, will never reach this
                if (!object_has_property(key)(ys)) {
                    result = false;
                    return true;
                }

                // keep iterating - still equal
                if (content_type.equals(ys[key])(xs[key])) {
                    return false;
                }

                // done - found a prop where lte
                if (content_type.lte(ys[key])(xs[key])) {
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

// ((a, b) -> c), {a: b} -> {a: c}
// Could implement using reduce
/*const map_binary = function (f) {
    return function (obj) {
        let res = empty_object();

        Object.keys(obj).forEach(function (key) {
            res[key] = f(key)(obj[key]);
        });

        return res;
    };
}; */

//unused?

// Bifunctor :: f -> g -> a -> a
// (a -> b) -> (c -> d) -> {a: c} -> {b: d}
const bimap = function (f) {
    return function (g) {
        const mapper = function ([key, val]) {
            return [f(key), g(val)];
        };

        return pipeN(
            Object.entries,
            array_map(mapper),
            Object.fromEntries,
            Object.freeze
        );
    };
};

// Comonad :: {a} -> a
// would need to return a pair?
//const extract = function (xs) {
//    return xs[Object.keys(xs).sort()[0]];
//};

const get = prop;
const set = function (key) {
    return pipe(
        object_create_pair(key)
    )(
        flip(concat)
    );
};

const validate = function (content_type) {
    return function (obj) {
        return (
            is_object(obj)
            ? Object.values(obj).every(content_type.validate)
            : false
        );
    };
};

const type_factory = function (type_of) {
    let base_type = {
        spec: "curried-static-land",
        version: 1,
        type_name: "esObject_Dictionary",
        map,
        alt,
        zero,
        ap,
        extend,
        reduce,
        traverse,
        bimap,
        filter,
        concat,
        empty,
        append,
        get,
        set,
        create,
        validate: is_object
    };

    if (is_object(type_of)) {

        const check_for_prop = flip(object_has_property)(type_of);

        if (check_for_prop("equals")) {
            base_type.equals = object_equals(type_of);
        }

        if (check_for_prop("lte")) {
            base_type.lte = lte(type_of);
        }

        if (check_for_prop("validate")) {
            base_type.validate = validate(type_of);
        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

//test const numT = esNumber_Addition();
//test const obj_of_numT = type_factory(numT);
//test const pair_of_bool_numT = pair_type(esBoolean())(numT);
//test const maybe_of_numT = maybe_type(numT);

//test const num_num_fxs = array_map(jsc.literal)([
//test     add(10),
//test     exponent(2),
//test     multiply(3),
//test     multiply(-1)
//test ]);
//test const str_str_fxs = array_map(jsc.literal)([
//test     string_concat("key"),
//test     method("repeat")(3),
//test     method("toUpperCase")()
//test ]);

//test const mapper_to_reducer = function (mapper) {
//test     return jsc.literal(function (acc) {
//test         return pipeN(
//test             Object.values,
//test             prop(0),
//test             mapper(),
//test             numT.concat(acc)
//test         );
//test     });
//test };

//test const extend_fxs = array_map(jsc.literal)([
//test     reduce(function (acc) {
//test         return function (val_obj) {
//test             const val = Object.values(val_obj)[0];
//test             return (
//test                 and(
//test                     not(equals(undefined)(acc))
//test                 )(
//test                     lt(acc)(val)
//test                 )
//test                 ? acc
//test                 : val
//test             );
//test         };
//test     })(),
//test     reduce(function (acc) {
//test         return pipeN(
//test             Object.values,
//test             prop(0),
//test             remainder(3),
//test             add(acc)
//test         );
//test     })(0),
//test     reduce(function (acc) {
//test         return pipeN(
//test             Object.values,
//test             prop(0),
//test             add(acc)
//test         );
//test     })(0)
//test ]);

//test const filters = array_map(jsc.literal)([
//test     lt(0),
//test     compose(equals(0))(remainder(2)),
//test     function (n) {
//test         return (equals(
//test             pipeN(
//test                 exponent(0.5),
//test                 Math.floor,
//test                 exponent(2)
//test             )(n)
//test         )(
//test             n
//test         ));
//test     }
//test ]);

//test const test_roster = adtTests({
//test     functor: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         jsc.integer(3, 5),
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             f: jsc.wun_of(num_num_fxs),
//test             g: jsc.wun_of(num_num_fxs)
//test         }
//test     },
//test     alt: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         jsc.integer(3, 5),
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             b: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         jsc.integer(3, 5),
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             c: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         jsc.integer(3, 5),
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             f: jsc.wun_of(num_num_fxs)
//test         }
//test     },
//test     plus: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         jsc.integer(3, 5),
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             f: jsc.wun_of(num_num_fxs)
//test         }
//test     },
//test     apply: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 5),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "f")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             u: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 5),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "f")
//test                     )
//test                 ),
//test                 jsc.wun_of(num_num_fxs)
//test             ),
//test             v: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 5),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "f")
//test                     )
//test                 ),
//test                 jsc.wun_of(num_num_fxs)
//test             )
//test         }
//test     },
//test     bifunctor: {
//test         T: obj_of_numT,
//test         signature: {
//test             f: jsc.wun_of(str_str_fxs),
//test             g: jsc.wun_of(str_str_fxs),
//test             h: jsc.wun_of(num_num_fxs),
//test             i: jsc.wun_of(num_num_fxs),
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         jsc.integer(3, 5),
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     extend: {
//test         T: obj_of_numT,
//test         signature: {
//test             f: jsc.wun_of(extend_fxs),
//test             g: jsc.wun_of(extend_fxs),
//test             w: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     foldable: {
//test         T: obj_of_numT,
//test         signature: {
//test             f: jsc.wun_of(array_map(mapper_to_reducer)(num_num_fxs)),
//test             x: 0,
//test             u: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             )
//test         },
//test         compare_with: numT.equals
//test     },
//test     traversable: {
//test         T: obj_of_numT,
//test         signature: {
//test             A: pair_of_bool_numT,
//test             B: maybe_of_numT,
//test             a: function () {
//test                 return pair_of_bool_numT.create(
//test                     jsc.boolean()()
//test                 )(
//test                     jsc.integer(-999, 999)()
//test                 );
//test             },
//test             f: jsc.literal(function (pr) {
//test                 return maybe_of_numT.just(pr.snd);
//test             }),
//test             g: jsc.wun_of(num_num_fxs),
//test             u: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(1, jsc.character("a", "z"))
//test                 ),
//test                 function () {
//test                     return pair_of_bool_numT.create(
//test                         jsc.boolean()()
//test                     )(
//test                         maybe_of_numT.just(jsc.integer(-999, 999)())
//test                     );
//test                 }
//test             )
//test         },
//test         compare_with: array_map(
//test             prop("equals")
//test         )([
//test             maybe_of_numT,
//test             compose(maybe_type)(type_factory)(maybe_of_numT),
//test             compose(maybe_type)(type_factory)(pair_of_bool_numT),
//test             pair_type(esBoolean())(maybe_type(obj_of_numT))
//test         ])
//test     },
//test     filterable: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             b: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }
//test     },
//test     semigroup: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             b: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             ),
//test             c: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     monoid: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.object(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.string(
//test                         1,
//test                         jsc.character("a", "z")
//test                     )
//test                 ),
//test                 jsc.integer(-99, 99)
//test             )
//test         }
//test     },
//test     setoid: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
//test                         jsc.string(1, jsc.character("a", "z"))
//test                     ),
//test                     jsc.integer(-999, 999)
//test                 ),
//test                 jsc.object(
//test                     ["x", "y", "z"],
//test                     [13, 13, 13]
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
//test                         jsc.string(1, jsc.character("a", "z"))
//test                     ),
//test                     jsc.integer(-999, 999)
//test                 ),
//test                 jsc.object(
//test                     ["x", "y", "z"],
//test                     [13, 13, 13]
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
//test                         jsc.string(1, jsc.character("a", "z"))
//test                     ),
//test                     jsc.integer(-999, 999)
//test                 ),
//test                 jsc.object(
//test                     ["x", "y", "z"],
//test                     [13, 13, 13]
//test                 )
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: obj_of_numT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
//test                         jsc.string(1, jsc.character("a", "z"))
//test                     ),
//test                     jsc.integer(-999, 999)
//test                 ),
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(3, 5),
//test                         jsc.string(1, jsc.character("a", "f"))
//test                     ),
//test                     13
//test                 )
//test             ]),
//test             b: jsc.wun_of([
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
//test                         jsc.string(1, jsc.character("a", "z"))
//test                     ),
//test                     jsc.integer(-999, 999)
//test                 ),
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(3, 5),
//test                         jsc.string(1, jsc.character("a", "f"))
//test                     ),
//test                     13
//test                 )
//test             ]),
//test             c: jsc.wun_of([
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
//test                         jsc.string(1, jsc.character("a", "z"))
//test                     ),
//test                     jsc.integer(-999, 999)
//test                 ),
//test                 jsc.object(
//test                     jsc.array(
//test                         jsc.integer(3, 5),
//test                         jsc.string(1, jsc.character("a", "f"))
//test                     ),
//test                     13
//test                 )
//test             ])
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