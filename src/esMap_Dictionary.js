/*jslint
    unordered
*/

import {
//test     pipeN,
//test     compose,
//test     join,
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
//test     string_concat,
//test     method,
    object_has_property,
    functional_new,
    map_get,
    map_set,
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

const set = map_set;
const get = map_get;

const create = function (key) {
    return function (val) {
        return Object.freeze(new_map([[key, val]]));
    };
};

const new_map = functional_new(Map);

// Semigroup :: <a> -> <a> -> <a>
// With overwriting duplicate keys
const concat = function (objA) {
    return function (objB) {
        let result = new_map(objA);
        objB.forEach(function (val, key) {
            result.set(key, val);
        });
        return Object.freeze(result);
    };
};

// Monoid :: () -> {}
const empty = new_map;

const append = map_set;

// Functor :: (a -> b) -> <a> -> <b>
const map = function (f) {
    return function (xs) {
        let obj = new_map();
        xs.forEach(function (val, key) {
            obj.set(key, f(val));
        });
        return Object.freeze(obj);
    };
};

// Bifunctor :: (a -> c) -> (b -> d) -> <a: c> -> <b: d>
const bimap = function (f) {
    return function (g) {
        return function (xs) {
            let result = new_map();
            xs.forEach(function (val, key) {
                result.set(f(key), g(val));
            });
            return Object.freeze(result);
        };
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
        let res = new_map();
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
        return reduce(function (acc) {
            return function (val) {
                const first = val.entries().next().value;
                const key = first[0];
                const value = first[1];

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
                        f(value)
                    )
                )(
                    acc
                );
            };
        })(
            of_T.of(new_map())
        );
    };
};

// Foldable :: ((c, (a, b)) -> c) -> c -> <a: b> -> c
const reduce = function (f) {
    return function (initial) {
        return function (xs) {
            let acc = initial;
            xs.forEach(function (val, key) {
                acc = f(acc)(create(key)(val));
            });
            return acc;
        };
    };
};

// Filterable :: (a -> Boolean) -> <a> -> <a>
const filter = function (f) {
    return function (xs) {
        let result = new_map();
        xs.forEach(function (val, key) {
            if (f(val) === true) {
                result.set(key, val);
            }
        });
        return Object.freeze(result);
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
                return content_type.equals(xs.get(key))(ys.get(key));
            });
        };
    };
};

// Can't do lte because can't sort keys (could be objs)
// Can't do extend for same reason

const type_factory = function (type_of) {
    let base_type = {
        spec: "curried-static-land",
        version: 1,
        type_name: "esMap_Dictionary",
        map,
        bimap,
        alt,
        zero,
        ap,
        reduce,
        traverse,
        filter,
        concat,
        empty,
        append,
        set,
        get,
        create,
        validate: is_object
    };

    if (is_object(type_of)) {

        const check_for_prop = flip(object_has_property)(type_of);

        if (check_for_prop("equals")) {
            base_type.equals = map_equals(type_of);
        }

//        if (check_for_prop ("validate")) {
//            base_type.validate = validate (type_of);
//        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

//test const numT = esNumber_Addition();
//test const map_of_numT = type_factory(numT);
//test const pair_of_bool_numT = pair_type(esBoolean())(numT);
//test const maybe_of_numT = maybe_type(numT);

//test const num_num_fxs = array_map(jsc.literal)([
//test     add(10),
//test     exponent(2),
//test     multiply(3),
//test     multiply(-1)
//test ]);
//test const str_str_fxs = array_map(jsc.literal)([
//test     join(string_concat),
//test     function (str) {
//test         return str.split("").reverse().join("");
//test     },
//test     string_concat("!prefix!"),
//test     function (str) {
//test         return str.replace("w", "~");
//test     }
//test ]);
//test const entries_to_map = function (jsc_entries) {
//test     return function () {
//test         return new Map(jsc_entries());
//test     };
//test };
//test const mapper_to_reducer = function (mapper) {
//test     return jsc.literal(function (acc) {
//test         return pipeN(
//test             method("values")(),
//test             prop(0),
//test             mapper(),
//test             numT.concat(acc)
//test         );
//test     });
//test };
//test const filters = array_map(jsc.literal)([
//test     lt(0),
//test     compose(equals(0))(remainder(2)),
//test     function (n) {
//test         return (equals(
//test             pipeN(
//test                 exponent(0.5),
//test                 Math.floor,
//test                 exponent(2)
//test             )(
//test                 n
//test             )
//test         )(
//test             n
//test         ));
//test     }
//test ]);

//test const test_roster = adtTests({
//test     functor: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
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
//test         }
//test     },
//test     alt: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
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
//test                     jsc.integer(0, 10),
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
//test                     jsc.integer(0, 10),
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
//test         }
//test     },
//test     plus: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
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
//test         }
//test     },
//test     apply: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
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
//test                     jsc.integer(0, 5),
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
//test                     jsc.integer(0, 5),
//test                     jsc.array([
//test                         jsc.string(
//test                             1,
//test                             jsc.character("a", "f")
//test                         ),
//test                         jsc.wun_of(num_num_fxs)
//test                     ])
//test                 )
//test             )
//test         }
//test     },
//test     foldable: {
//test         T: map_of_numT,
//test         signature: {
//test             f: jsc.wun_of(array_map(mapper_to_reducer)(num_num_fxs)),
//test             x: 0,
//test             u: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(
//test                             jsc.integer(3, 5),
//test                             jsc.character("a", "z")
//test                         ),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             )
//test         },
//test         compare_with: numT.equals
//test     },
//test     traversable: {
//test         T: map_of_numT,
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
//test             u: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         function () {
//test                             return pair_of_bool_numT.create(
//test                                 jsc.boolean()()
//test                             )(
//test                                 maybe_of_numT.just(
//test                                     jsc.integer(-999, 999)()
//test                                 )
//test                             );
//test                         }
//test                     ])
//test                 )
//test             )
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             maybe_of_numT,
//test             compose(maybe_type)(type_factory)(maybe_of_numT),
//test             compose(maybe_type)(type_factory)(pair_of_bool_numT),
//test             pair_type(esBoolean())(maybe_type(map_of_numT))
//test         ])
//test     },
//test     bifunctor: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             f: jsc.wun_of(str_str_fxs),
//test             g: jsc.wun_of(str_str_fxs),
//test             h: jsc.wun_of(num_num_fxs),
//test             i: jsc.wun_of(num_num_fxs)
//test         }
//test     },
//test     filterable: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             b: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }
//test     },
//test     semigroup: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             b: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             ),
//test             c: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             )
//test         }
//test     },
//test     monoid: {
//test         T: map_of_numT,
//test         signature: {
//test             a: entries_to_map(
//test                 jsc.array(
//test                     jsc.integer(0, 10),
//test                     jsc.array([
//test                         jsc.string(1, jsc.character("a", "z")),
//test                         jsc.integer(-99, 99)
//test                     ])
//test                 )
//test             )
//test         }
//test     },
//test     setoid: {
//test         T: map_of_numT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
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
//test                         jsc.integer(0, 10),
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
//test                         jsc.integer(0, 10),
//test                         jsc.array([
//test                             jsc.string(1, jsc.character("a", "z")),
//test                             jsc.integer(-999, 999)
//test                         ])
//test                     )
//test                 ),
//test                 new_map([["x", 13], ["y", 13], ["z", 13]])
//test             ])
//test         }
//test     }
/*
//test     ord: {
//test         T: map_of_numT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 entries_to_map(
//test                     jsc.array(
//test                         jsc.integer(0, 10),
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
//test                         jsc.integer(0, 10),
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
//test                         jsc.integer(0, 10),
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
//test         }
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