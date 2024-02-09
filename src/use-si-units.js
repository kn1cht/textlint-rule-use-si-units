// use-si-unit.js
'use strict';
const P = require('parsimmon');
import { matchCaptureGroupAll } from 'match-index';
import { isUserWrittenNode } from './util/node-util';

const numberWithUnitTarget = /[0-9]+? ([a-zA-ZΩΩ℧%‰‱℃℉ℊÅμ°′″^\-\/·･・\(\)]+)/;

const defaultOptions = {
    allowedUnits: [],
    restrictNonSIUnits: false,
};

const siUnitOneChar = P.oneOf('-msAKg');
const siUnitManyChar = P.regexp(/mol|cd/);
const allowWordManyChar = P.regexp(/and|or|nor|but|by|for|from|on|out|per|to|of|at|over|under|between|among|into|upon|within|around|plus|minus|times|divided/);
const siDerivedUnitOneChar = P.oneOf('JWCVFΩSTH℃');
const siDerivedUnitManyChar = P.regexp(/rad|sr|Hz|N|Pa|Wb|lm|lx|Bq|Gy|Sv|kat/);
const nonSiUnitOneChar = P.oneOf('hd°′″lLtB');
const nonSiUnitManyChar = P.regexp(/min|au|ha|Da|eV|Np|dB/);
const siPrefixOneChar = P.oneOf('YZEPTGMkhcdmμnpfazy');
const siPrefixManyChar = P.string('da');
const concatSymbol = P.oneOf('^/·･・()');

const generateSiUnitParser = (allowedUnits, restrictNonSIUnits) => {
    // Combine parsers. The longer patterns must come first to avoid confusing patterns with the same prefix.
    let siUnitsManyChar = P.alt(siUnitManyChar, siDerivedUnitManyChar);
    let siUnitsOneChar = P.alt(siUnitOneChar, siDerivedUnitOneChar);

    if(restrictNonSIUnits !== true) {
        siUnitsManyChar = P.alt(siUnitsManyChar, nonSiUnitManyChar);
        siUnitsOneChar = P.alt(siUnitsOneChar, nonSiUnitOneChar);
    }
    if(allowedUnits.length > 0) {
        const allowedUnitsString = allowedUnits.reduce((prev, value) => prev === '' ? value : `${prev}|${value}`, '');
        siUnitsManyChar = P.alt(siUnitsManyChar, P.regexp(new RegExp(allowedUnitsString)));
    }
    const siUnits = P.alt(siUnitsManyChar, allowWordManyChar, siUnitsOneChar);
    const siSymbols = P.alt(siPrefixManyChar, siPrefixOneChar, concatSymbol);

    // Construct an overall parser.
    return P.alt(siUnits, siSymbols, P.digit)
    .many()
    .assert(
        results => results.reduce((prev, value) => prev || siUnits.parse(value).status, false),
        'Must contain at least one unit symbols'
    );
};

module.exports = (context, userOptions = {}) => {
    const options = Object.assign({}, defaultOptions, userOptions);
    const {Syntax, RuleError, report, getSource} = context;
    return {
        [Syntax.Str](node) {
            if (!isUserWrittenNode(node, context)) {
                return;
            }
            const matches = matchCaptureGroupAll(getSource(node), numberWithUnitTarget);

            matches.forEach(match => {
                const siUnitParser = generateSiUnitParser(options.allowedUnits, options.restrictNonSIUnits);
                const parseResult = siUnitParser.parse(match.text);
                const isSymbolOnly = concatSymbol.parse(match.text);
                if(parseResult.status === false && isSymbolOnly.status === false) report(
                    node,
                    new RuleError(`「${match.text}」には、SI単位系で使用できない文字が含まれています。SI単位系を使用してください。`, {
                        index: match.index,
                    })
                );
            });
        }
    };
};
