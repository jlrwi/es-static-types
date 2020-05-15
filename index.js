/*jslint
    fudge
*/

import boolean_type from "./esBoolean.min.js";
import boolean_and_type from "./esBoolean_And.min.js";
import boolean_or_type from "./esBoolean_Or.min.js";
import function_type from "./esFunction.min.js";
import number_type from "./esNumber.min.js";
import number_addition_type from "./esNumber_Addition.min.js";
import number_multiplication_type from "./esNumber_Multiplication.min.js";
import string_type from "./esString.min.js";
import undefined_type from "./esUndefined.min.js";
import array_type from "./esArray.min.js";
import object_dictionary_type from "./esObject_Dictionary.min.js";
import object_record_type from "./esObject_Record.min.js";

export {
    boolean_type,
    boolean_and_type,
    boolean_or_type,
    function_type,
    number_type,
    number_addition_type,
    number_multiplication_type,
    string_type,
    undefined_type,
    array_type,
    object_dictionary_type,
    object_record_type,
    slm: {
        bool: boolean_type(),
        bool_and: boolean_and_type(),
        bool_or: boolean_or_type(),
        func: function_type(),
        num: number_type(),
        num_sum: number_addition_type(),
        num_prod: number_multiplication_type(),
        str: string_type(),
        undefined: undefined_type()
    }
};