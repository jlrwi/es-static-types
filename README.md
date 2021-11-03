# es-static-types   
Factories for curried-static-land algebraic data type modules based on ECMAScript types.

## Type factories    
   
Factory | Maximal algebras
--------|------------------
array_type | Alternative, Monad, Chain, Extend, Traversable, Filterable, Monoid, *Ord*  
boolean_type | Functor, Ord 
boolean_and_type | Functor, Monoid,  Ord 
boolean_or_type | Functor, Monoid,  Ord 
function_type | Monad, Chain, Comonad, Profunctor, Category, Contravariant
map_dictionary_type | Plus, Apply, Traversable, Filterable, Monoid, *Setoid*  
number_type | Functor, Ord
number_addition_type | Functor, Group, Ord
number_multiplication_type | Functor, Group, Ord
object_dictionary_type | Plus, Apply, Extend, Traversable, Filterable, Monoid, *Ord*
object_record_type | *Monoid*, *Setoid*
primitive_type | Functor, Applicative, Setoid
string_type | Functor, Monoid, Ord
undefined_type | Functor, Monoid, Ord

*Italicized* algebras are only achieved when a type module for the contents is supplied to the factory.

### Usage

No or generic contents:
```
const type_module = factory();
```
    
With typed contents:
```
    const type_module = factory(content_type_module);
```

## Generic types

The exported `slm` object contains generic (instantiated without any internal types) type modules. These are ready for use as-is.
- array
- bool
- bool_and
- bool_or
- dict
- func
- map
- num
- num_sum
- num_prod
- primitive
- record
- str
- undefined