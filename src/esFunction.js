/*jslint
    fudge
*/

import {
//test     flip,
    apply,
    identity,
    compose,
    constant
} from "@jlrwi/combinators";
import {
//test     log,
//test     lte,
//test     equals,
//test     add,
//test     multiply,
//test     exponent,
//test     array_map,
//test     string_concat,
//test     prop,
    type_check
} from "@jlrwi/esfunctions";
//test import adtTests from "@jlrwi/adt_tests";
//test import jsCheck from "@jlrwi/jscheck";
//test let jsc = jsCheck();

// Static Land implementation of Function

const type_name = "esFunction";

// Semigroupoid :: f -> g -> a -> g a -> f g a
// Uses compose combinator

// back to front composition of array of fxs
const composeN = function (...fs) {
    const last_index = fs.length - 1;

    // If no functions passed in, just give back the input
    if (fs.length === 0) {
        return identity;
    }

    const composer = function (idx) {
        if (idx >= last_index) {
            return fs[idx];
        }

        return compose (fs[idx]) (composer (idx + 1));
    };

    return composer (0);
};

// Setoid :: a -> a -> Boolean
// Checks reference
// Sanctuary uses referential equality, but that is only a subset of equality
//   and thus not helpful

// Category id :: a -> a
const id = identity;

// Functor :: (b -> c) -> (a -> b) -> (a -> c)
const map = compose;

// Apply :: (a -> b -> c) -> (a -> b) -> (a -> c)
// Synonymous with ap combinator
const ap = function (fabc) {
    return function (fab) {
        return function (a) {
            return fabc (a) (fab (a));
        };
    };
};

// Chain :: (b -> a -> c) -> (a -> b) -> (a -> c)
// Synonymous with Warbler (Once Removed)? abc.abcc
const chain = function (fbac) {
    return function (fab) {
        return function (a) {
            return fbac (fab (a)) (a);
        };
    };
};

// Extend :: ((a -> b) -> c) -> (a -> b) -> (a -> c)
// fabc should take a->b and turn it into a c somehow
// inside fabc is a b->c
// Sanctuary uses concat on the input to the first fx
const extend = apply;
const extract = apply (identity);
/*
const extend = function (fabc) {
    return function (fab) {
        return function (a) {
            return fabc (fab) (a);
        };
    };
};
*/

// Profunctor :: (a -> b) -> (c -> d) -> (b -> c) -> (a -> c)
// Synonymous with Robin combinator? abc.bca
const promap = function (f) {
    return function (g) {
        return function (promap) {
            return composeN (g, promap, f);
        };
    };
};

// Applicative :: b -> (a -> b)
const of = constant;

// Contravariant :: (b -> a) -> (a -> c) -> (b  -> c)
// Synonymous with flip (compose)
const contramap = function (f) {
    return function (contravariant) {
        return compose (contravariant) (f);
    };
};

// Sanctuary has chainRec, equals, extend

const validate = type_check ("function");

const create = of;

// (a->b) -> a -> b
const run = apply;

const type_factory = function (ignore) {
    return Object.freeze({
        spec: "StaticLand",
        version: 1,
        type_name,
        ap,
        chain,
        compose,
        composeN,
        id,
        map,
        extend,
        extract,
        promap,
        of,
        contramap,
        create,
        validate,
        run
    });
};

//test const functionT = type_factory ();

//test const string_reverse = function (str) {
//test     return str.split("").reverse().join("");
//test };

//test const str_str_fxs = array_map (jsc.literal) ([
//test     string_concat ("_"),
//test     flip (string_concat) ("!"),
//test     function (str) {
//test         return str.slice(0, 2);
//test     },
//test     string_reverse
//test ]);

//test const str_str_bool_fxs = array_map (jsc.literal) ([
//test     function (s) {
//test         return function (frag) {
//test             return s.endsWith(frag);
//test         };
//test     },
//test     function (s) {
//test         return function (frag) {
//test             return !(s.indexOf(frag) < 0);
//test         };
//test     },
//test     lte
//test ]);

//test const str_num_fxs = array_map (jsc.literal) ([
//test     prop ("length"),
//test     function (str) {
//test         return str.codePointAt(0);
//test     },
//test     function (str) {
//test         return Math.floor(str.length / 2);
//test     }
//test ]);

//test const str_num_str_list = [
//test     function (s) {
//test         return function (len) {
//test             return string_reverse(s.substring(0, len));
//test         };
//test     },
//test     function string_repeat (str) {
//test         return function (count) {
//test             return str.repeat(count);
//test         };
//test     },
//test     function string_left (str) {
//test         return function (pos) {
//test             return str.slice(0, pos);
//test         };
//test     },
//test     function multibang (str) {
//test         return function (n) {
//test             return str + "!".repeat(n);
//test         };
//test     }
//test ];

//test const str_num_str_fxs = array_map (jsc.literal) (str_num_str_list);
//test const num_str_str_fxs = array_map (
//test     compose (jsc.literal) (flip)
//test ) (
//test     str_num_str_list
//test );

//test const num_num_list = [
//test     add (10),
//test     exponent (2),
//test     multiply (3),
//test     multiply (-1),
//test     Math.floor
//test ];

//test const num_num_fxs = array_map (jsc.literal) (num_num_list);

//test const num_bool_fxs = array_map (jsc.literal) ([
//test     function (x) {
//test         return (x % 2 === 0);
//test     },
//test     lte (10)
//test ]);

//test const test_roster = adtTests ({
//test     functor: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.wun_of(str_str_fxs),
//test             f: jsc.wun_of(num_bool_fxs),
//test             g: jsc.wun_of(str_num_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     apply: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.wun_of(str_num_fxs),
//test             u: jsc.wun_of(str_str_bool_fxs),
//test             v: jsc.wun_of(str_num_str_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     applicative: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.wun_of(str_num_fxs),
//test             f: jsc.wun_of(num_num_fxs),
//test             u: jsc.wun_of(str_num_str_fxs),
//test             x: jsc.integer()
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     chain: {
//test         T: functionT,
//test         signature: [{
//test             f: jsc.wun_of(num_str_str_fxs),
//test             g: jsc.wun_of(num_str_str_fxs),
//test             u: jsc.wun_of(str_num_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     monad: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.integer(),
//test             f: jsc.wun_of(num_str_str_fxs),
//test             u: jsc.wun_of(str_num_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     extend: {
//test         T: functionT,
//test         signature: [{
//test             f: compose (compose) (jsc.wun_of(num_num_fxs)),
//test             g: compose (compose) (jsc.wun_of(num_num_fxs)),
//test             w: jsc.wun_of(str_num_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     comonad: {
//test         T: functionT,
//test         signature: [{
//test             f: compose (compose) (jsc.wun_of(num_num_fxs)),
//test             w: jsc.wun_of(str_num_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     profunctor: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.wun_of(num_num_fxs),
//test             f: jsc.wun_of(num_num_fxs),
//test             g: jsc.wun_of(str_num_fxs),
//test             h: jsc.wun_of(num_num_fxs),
//test             i: jsc.wun_of(num_num_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     semigroupoid: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.wun_of(num_num_fxs),
//test             b: jsc.wun_of(str_num_fxs),
//test             c: jsc.wun_of(str_str_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     category: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.wun_of(str_str_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
//test     },
//test     contravariant: {
//test         T: functionT,
//test         signature: [{
//test             a: jsc.wun_of(str_num_fxs),
//test             f: jsc.wun_of(str_str_fxs),
//test             g: jsc.wun_of(str_str_fxs)
//test         }],
//test         compare_with: equals,
//test         input: jsc.string()
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