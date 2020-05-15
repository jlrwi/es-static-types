/*jslint
    fudge
*/

//UNFINISHED

// Static Land implementation of Set
// Sets cannot be frozen with Object.freeze()

import {
    compose,
    flip,
    second
} from "../combinators.js";
import {
    is_object,
    object_has_property,
    equals,
    type_check
} from "../esFunctions.js";

const new_set = function (xs) {
    return new Set(xs);
};

// Set <a> -> Set<a>
// Make a copy of set and delete first element
const tail = function (xs) {
    let tail_set = new_set (xs);
    let head = true;
    tail_set.forEach(function (x) {
        if (head === true) {
            tail_set.delete(x);
            head = false;
        }
    });
    return tail_set;
};

const iterator_eval = function (terminal) {
    return function (comparator) {
        return function (A) {
            return function (B) {
                let iteratorA = A.values();
                let iteratorB = B.values();

                const evaluator = function () {
                    let a = iteratorA.next();
                    let b = iteratorB.next();

                    if ((a.done === true) || (b.done === true)) {
                        return terminal (a.done) (b.done);
                    }

                    if (!comparator (a.value) (b.value)) {
                        return false;
                    }

                    return evaluator ();
                };

                return evaluator ();
            };
        };
    };
};

// Setoid :: a -> a -> boolean
const set_equals = function (content_type) {
    return iterator_eval (equals) (content_type.equals);
};

// Ord :: a -> a -> boolean
const lte = function (content_type) {
    return iterator_eval (second) (content_type.lte);
};

// Semigroup :: Set a -> Set a -> Set a
const concat = function (xs) {
    return function (ys) {
        let res = new_set (xs);
        ys.forEach(function (val) {
            res.add (val);
        });
        return res;
    };
};

// Monoid :: () -> Set<>
const empty = new_set;

// Foldable :: ((b, a) -> b, b, Set<a>) -> b
const reduce = function (f) {
    return function (initial) {
        return function (xs) {
            let acc = initial;
            xs.forEach (function (val) {
                acc = f (acc) (val);
            });
            return acc;
        };
    };
};

// Functor :: (a -> b) -> Set<a> -> Set<b>
const map = function (f) {
    return function (xs) {
        let res = empty ();
        xs.forEach(function (val) {
            res.add(f (val));
        });
        return res;
    };
};

// Alt :: Set a -> Set a -> Set a
const alt = concat;

// Plus :: () -> Set<>
const zero = empty;

// Apply :: Set (a -> b) -> Set a -> Set b
const ap = function (fs) {
    return function (xs) {
        let res = empty ();
        fs.forEach(function (f) {
            xs.forEach(function (x) {
                res.add (f (x));
            });
        });
        return res;
    };
};

// Applicative :: x -> Set<x>
const of = function (x) {
    return new_set ([x]);
};

// Traversable :: Applicative<U> -> (a -> U<b>) -> Set<a> -> U<Set<b>>
const traverse = function (of_T) {
    return function (f) {
        return reduce (function (acc) {
            return function (val) {
                // Make an apply that's waiting for the acc to concat
                return of_T.ap (
                    of_T.map (compose (flip (concat)) (of)) (f (val))
                ) (acc);
            };
        }) (of_T.of (empty ()));
    };
};

// Chain :: (a -> Set<b>) -> Set<a> -> Set<b>
const chain = function (f) {
    return function (xs) {
        let res = new_set ();

        xs.forEach(function (x) {
            res = concat (res) (f (x));
        });

        return res;
    };
};

// Extend :: (Set<a> -> b) -> Set<a> -> Set<b>
const extend = function (f) {
    let result = empty ();

    // Set<a> -> Set<b> -> Set<b>
    const extender = function (acc) {
        return function (xs) {

            // Append to result by applying f
            acc.add(f (xs));

            // When down to a single item in xs we are finished
            return (
                (xs.size <= 1)
                ? acc
                : extender (acc) (tail (xs))
            );
        };
    };

    // Waiting for Set (aka xs) to be supplied
    return extender (result);
};

// Filterable :: (a -> Boolean) -> [a] -> [a]
const filter = function (f) {
    return function (xs) {
        let res = empty ();
        xs.forEach (function (val) {
            if (f (val) === true) {
                res.add (val);
            }
        });
        return res;
    };
};

// Set<a> -> a -> Set<a>
const append = function (xs) {
    return compose (of) (concat (xs));
};

const validate = function (type_of) {
    return function (x) {
        let iterator = x.values();

        const check = function () {
            let result = iterator.next();

            if (result.done === true) {
                return true;
            }

            return (
                (type_of.validate (result.value))
                ? check ()
                : false
            );
        };

        return check ();
    };
};

const create = new_set;

// Have to pass a sl type module to get Setoid
const type_factory= function (type_of) {
    let base_type = {
        spec: "StaticLand",
        version: 1,
        type_name: "esSet",
        create,
        concat,
        empty,
        reduce,
        traverse,
        map,
        alt: concat,
        zero: empty,
        ap,
        of,
        chain,
        extend,
        filter,
        validate: instance_check (Set),
        create
    };

    if (is_object (type_of)) {

        const check_for_prop = flip (object_has_property) (type_of);

        if (check_for_prop ("equals")) {
            base_type.equals = set_equals (type_of);
        }

        if (check_for_prop ("lte")) {
            base_type.lte = lte (type_of);
        }

        if (check_for_prop ("validate")) {
            base_type.validate = validate (type_of);
        }

        base_type.type_name += "< " + type_of.type_name + " >";
    }

    return Object.freeze(base_type);
};

export default Object.freeze(type_factory);