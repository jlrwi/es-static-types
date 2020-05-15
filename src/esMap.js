// Not finished - just a collection of notes

const pairKey = R.head;
const pairVal = R.last;

const esMapNew = function (contents) {
    return new Map(contents);
};

//const esMapSet = R.invoker(2, "set");	// set called with key, val, map

const esMapAppendPair = function (esMap, pair) {
//    return esMapSet(pairKey(pair), pairVal(pair), esMap);
    return esMap.set(pairKey(pair), pairVal(pair));
};

const esMapGroupToPair = function (esMap, pair) {
	const key = pairKey(pair);
    const priorVal = (esMap.has(key)) ? esMap.get(key) : [];
//	return esMapSet(key, R.append(pairVal(pair), priorVal), esMap);
    return esMap.set(key, R.append(pairVal(pair), priorVal));
};

const esMap = Object.freeze({
    new: esMapNew,
    appendPair: esMapAppendPair,
    groupPair: esMapGroupToPair
});

export {
    esMap
};