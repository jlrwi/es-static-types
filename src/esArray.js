/*jslint
    unordered
*/

import {
//test     apply_with,
    compose,
    compose2,
    constant,
    flip,
    pipeN
} from "@jlrwi/combinators";
import {
//test     string_concat,
    array_map,
    array_append,
    array_concat,
    method,
    prop,
    is_object,
    functional_if,
    object_has_property,
    array_reduce
} from "@jlrwi/esfunctions";
//test import esString from "../src/esString.js";
//test import esBoolean from "../src/esBoolean_And.js";
//test import {
//test     pair_type,
//test     maybe_type
//test } from "@jlrwi/static-types-basic";
//test import adtTests from "@jlrwi/adt-tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Array
const type_name = "esArray";

// Setoid :: a -> a -> boolean
const equals = function (content_type) {
    return function (xs) {
        return function (ys) {

            if (!Array.isArray(xs) || !Array.isArray(ys)) {
                return false;
            }

            if (xs.length !== ys.length) {
                return false;
            }

// if xs longer than ys, will fail when try ys[idx] === undefined
            return xs.every(function (val, idx) {
                return content_type.equals(val)(ys[idx]);
            });
        };
    };
};

// true at first index where x[n] < y[n] OR
// arrays identical up to identical lengths or y longer
// Ord :: a -> a -> Boolean
const lte = function (content_type) {
    return function (ys) {
        return function (xs) {

            if (!Array.isArray(xs) || !Array.isArray(ys)) {
                return false;
            }

// if .some() finishes, default result is that all xs lte ys
            let result = true;

            xs.some(function (val, idx) {

// xs longer than ys - end loop, not lte
// if xs is empty, will never reach this
                if (idx >= ys.length) {
                    result = false;
                    return true;
                }

// keep iterating - still equal
                if (content_type.equals(ys[idx])(val)) {
                    return false;
                }

// done - found an index where lte
                if (content_type.lte(ys[idx])(val)) {
                    result = true;
                    return true;
                }

// By default, y[idx] > x[idx] - failed!
                result = false;
                return true;
            });

            return result;
        };
    };
};

// Apply :: [(a -> b)] -> [a] -> [b]
const ap = function (fs) {
    return pipeN(
        flip(array_map),
        flip(method("flatMap"))(fs),
        Object.freeze
    );
};

// Semigroup :: [a] -> [a] -> [a]
const concat = array_concat;

// Alt :: [a] -> [a] -> [a]
const alt = concat;

// Chain :: (a -> [b]) -> [a] -> [b]
const chain = compose2(Object.freeze)(method("flatMap"));

// Extend :: ([a] -> b) -> [a] -> [b]
const extend = function (f) {
    return function (xs) {
        return Object.freeze(
            xs.map(function (ignore, idx) {
                return f(xs.slice(idx));
            })
        );
    };
};

// Comonad :: [a] -> a
/* const extract = function (xs) {

    if (xs.length === 0) {
        throw new TypeError("Cannot extract from empty list");
    }

    return xs[0];
}; */

// Monoid :: () -> []
const empty = function () {
    return Object.freeze([]);
};

// Filterable :: (a -> Boolean) -> [a] -> [a]
const filter = compose2(Object.freeze)(method("filter"));
//const filter = function (f) {
//    return function (xs) {
//        return Object.freeze(xs.filter(f));
//    };
//};

// Functor :: (a -> b) -> [a] -> [b]
const map = array_map;

// Applicative :: x -> [x]
const of = function (x) {
    return Object.freeze([x]);
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> [a] -> U<[b]>
const traverse = function (of_T) {
    return function (f) {
        return reduce(function (acc) {
            return function (val) {
// Make an apply that's waiting for the acc to concat
//  Apply f to each value from array (which puts it into an applicative),
//  Then use the applicative's map to concat the value to the accumulator's
//      array of values
                return of_T.ap(
                    of_T.map(
                        compose(flip(concat))(of)
                    )(
                        f(val)
                    )
                )(
                    acc
                );
            };
        })(
            of_T.of([])
        );
    };
};

// Builtin Array.reduce is not curried
// Foldable :: ((b, a) -> b) -> (_->b) -> [a] -> b
const reduce = array_reduce;

// Plus :: () -> []
const zero = empty;

// Sanctuary has chainRec

const get = prop;

const set = function (idx) {
    return function (val) {
        return function (a) {
            return Object.freeze(
                [...a.slice(0, idx), val, ...a.slice(idx + 1)]
            );
        };
    };
};

const validate = function (content_type) {
    return functional_if(
        Array.isArray
    )(
        method("every")(content_type.validate)
    )(
        constant(false)
    );
//    return function (ary) {
//        return (
//            Array.isArray (ary)
//            ? ary.every(content_type.validate)
//            : false
//        );
//    };
};

// Takes an array and returns a frozen copy
// Needs self-reference to get name and validate()
const create = of;

// [a] -> a -> [a]
const append = array_append;

// Have to pass a sl type module to get Setoid
const type_factory = function (type_of) {
    const base_type = {
        spec: "curried-static-land",
        version: 1,
        type_name,
        alt,
        ap,
        chain,
        extend,
//        extract,
        concat,
        empty,
        filter,
        map,
        of,
        append,
        traverse,
        reduce,
        get,
        set,
        validate: Array.isArray,
        create,
        zero
    };

    if (is_object(type_of)) {

        const check_for_prop = flip(object_has_property)(type_of);

        if (check_for_prop("equals")) {
            base_type.equals = equals(type_of);
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

//test const stringT = esString();
//test const array_of_stringT = type_factory(stringT);
//test const pair_of_bool_strT = pair_type(esBoolean())(stringT);
//test const maybe_of_stringT = maybe_type(stringT);

//test const test_fxs = array_map(jsc.literal)([
//test     string_concat("_"),
//test     flip(string_concat)("!"),
//test     method("slice")(0, 2),
//test     pipeN(
//xtest         function (str) {return str.split("");},
//test         method("split")(),
//test         method("reverse")(),
//test         method("join")("")
//test     )
//test ]);

//test const chainer = function (array_of_fs) {
//test     const stripped_array = array_of_fs();
//test     return function (x) {
//test         return array_map(apply_with(x))(stripped_array);
//test     };
//test };

//test const mapper_to_reducer = function (mapper) {
//test     return jsc.literal(function (acc) {
//test         return compose(string_concat(acc))(mapper());
//test     });
//test };

//test const extend_fxs = array_map(jsc.literal)([
//test     reduce(function (acc) {
//test         return function (val) {
//test             return (
//test                 acc < val
//test                 ? acc
//test                 : val
//test             );
//test         };
//test     })(""),
//test     reduce(function (acc) {
//test         return function (val) {
//test             return (
//test                 acc.length < val.length
//test                 ? acc
//test                 : val
//test             );
//test         };
//test     })(""),
//test     reduce(function (acc) {
//test         return compose(string_concat(acc))(prop(0));
//test     })(""),
//test     reduce(function (acc) {
//test         return string_concat(acc);
//test     })("")
//test ]);

//test const filters = array_map(jsc.literal)([
//test     function (str) {
//test         return (str < "m");
//test     },
//test     function (str) {
//test         return (str.length > 10);
//test     },
//test     function (str) {
//test         return (str[0] <= str[str.length - 1]);
//test     }
//test ]);

//test const test_roster = adtTests({
//test     functor: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             f: jsc.wun_of(test_fxs),
//test             g: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     alt: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             b: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             c: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             f: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     plus: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             f: jsc.wun_of(test_fxs)
//test         }
//test     },
//test     apply: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             u: jsc.array(
//test                 jsc.integer(0, 3),
//test                 jsc.wun_of(test_fxs)
//test             ),
//test             v: jsc.array(
//test                 jsc.integer(0, 3),
//test                 jsc.wun_of(test_fxs)
//test             )
//test         }
//test     },
//test     applicative: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             f: jsc.wun_of(test_fxs),
//test             u: jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs)),
//test             x: jsc.string()
//test         }
//test     },
//test     chain: {
//test         T: array_of_stringT,
//test         signature: {
//test             f: function () {
//test                 return chainer(
//test                     jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             g: function () {
//test                 return chainer(
//test                     jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             u: jsc.array(jsc.integer(0, 15), jsc.string())
//test         }
//test     },
//test     alternative: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(
//test                 jsc.integer(0, 3),
//test                 jsc.wun_of(test_fxs)
//test             ),
//test             b: jsc.array(
//test                 jsc.integer(0, 3),
//test                 jsc.wun_of(test_fxs)
//test             ),
//test             c: jsc.array(jsc.integer(0, 15), jsc.string())
//test         }
//test     },
//test     monad: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.string(),
//test             f: function () {
//test                 return chainer(
//test                     jsc.array(jsc.integer(0, 3), jsc.wun_of(test_fxs))
//test                 );
//test             },
//test             u: jsc.array(jsc.integer(0, 15), jsc.string())
//test         }
//test     },
//test     extend: {
//test         T: array_of_stringT,
//test         signature: {
//test             f: jsc.wun_of(extend_fxs),
//test             g: jsc.wun_of(extend_fxs),
//test             w: jsc.array(jsc.integer(0, 15), jsc.string())
//test         }
//test     },
//test     foldable: {
//test         T: array_of_stringT,
//test         signature: {
//test             f: jsc.wun_of(array_map(mapper_to_reducer)(test_fxs)),
//test             x: "",
//test             u: jsc.array(jsc.integer(0, 10), jsc.string())
//test         },
//test         compare_with: stringT.equals
//test     },
//test     traversable: {
//test         T: array_of_stringT,
//test         signature: {
//test             A: pair_of_bool_strT,
//test             B: maybe_of_stringT,
//test             a: function () {
//test                 return pair_of_bool_strT.create(
//test                     jsc.boolean()()
//test                 )(
//test                     jsc.string()()
//test                 );
//test             },
//test             f: jsc.literal(function (pr) {
//test                 return maybe_of_stringT.just(pr.snd);
//test             }),
//test             g: jsc.wun_of(test_fxs),
//test             u: jsc.array(
//test                 jsc.integer(0, 10),
//test                 function () {
//test                     return pair_of_bool_strT.create(
//test                         jsc.boolean()()
//test                     )(
//test                         maybe_of_stringT.just(jsc.string()())
//test                     );
//test                 }
//test             )
//test         },
//test         compare_with: array_map(prop("equals"))([
//test             maybe_of_stringT,
//test             compose(maybe_type)(type_factory)(maybe_of_stringT),
//test             compose(maybe_type)(type_factory)(pair_of_bool_strT),
//test             pair_type(esBoolean())(maybe_type(array_of_stringT))
//test         ])
//test     },
//test     filterable: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 15), jsc.string()),
//test             b: jsc.array(jsc.integer(0, 15), jsc.string()),
//test             f: jsc.wun_of(filters),
//test             g: jsc.wun_of(filters)
//test         }
//test     },
//test     semigroup: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             b: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             c: jsc.array(jsc.integer(0, 25), jsc.string())
//test         }
//test     },
//test     monoid: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string())
//test         }
//test     },
//test     setoid: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.wun_of([
//test                 jsc.array(jsc.integer(0, 15), jsc.string()),
//test                 jsc.array(4, "x")
//test             ]),
//test             b: jsc.wun_of([
//test                 jsc.array(jsc.integer(0, 15), jsc.string()),
//test                 jsc.array(4, "x")
//test             ]),
//test             c: jsc.wun_of([
//test                 jsc.array(jsc.integer(0, 15), jsc.string()),
//test                 jsc.array(4, "x")
//test             ])
//test         }
//test     },
//test     ord: {
//test         T: array_of_stringT,
//test         signature: {
//test             a: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             b: jsc.array(jsc.integer(0, 25), jsc.string()),
//test             c: jsc.array(jsc.integer(0, 25), jsc.string())
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