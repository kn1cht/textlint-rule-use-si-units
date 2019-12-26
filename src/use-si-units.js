// use-si-unit.js
'use strict';
const P = require('parsimmon');
import { matchCaptureGroupAll } from 'match-index';
import { isUserWrittenNode } from './util/node-util';

const numberWithUnitTarget = /[0-9]+? ([a-zA-Z℃Ω%Åμ^\-\/·･・\(\)]+)/;

const generateSiUnitParser = allowedUnits => {
    const siUnitOneChar = P.oneOf('msAKg');
    const siUnitManyChar = P.regexp(/mol|cd/);
    const siDerivedUnitOneChar = P.oneOf('JWCVFΩSTH℃');
    const siDerivedUnitManyChar = P.regexp(/rad|sr|Hz|N|Pa|Wb|lm|lx|Bq|Gy|Sv|kat/);
    const siPrefixOneChar = P.oneOf('YZEPTGMkhdcmμnpfazy');
    const siPrefixManyChar = P.string('da');
    const concatSymbol = P.oneOf('^-/·･・()');

    // Combine parsers. If two parsers match the same prefix, the longer of the two must come first.
    const siUnits = P.alt(siUnitManyChar, siDerivedUnitManyChar, siUnitOneChar, siDerivedUnitOneChar);
    if(allowedUnits.length > 0) {
      const allowedUnitsString = allowedUnits.reduce((prev, value) => prev === '' ? value : `${prev}|${value}`, '');
      siUnits = P.alt(P.regexp(new RegExp(allowedUnitsString)), siUnits);
    }
    const siSymbols = P.alt(siPrefixManyChar, siPrefixOneChar, concatSymbol);
    // Construct an overall parser.
    return P.alt(siUnits, siSymbols, P.digit)
    .many()
    .assert(
        results => results.reduce((prev, value) => prev || siUnits.parse(value).status, false),
        'Must contain at least one unit symbols'
    );
};

module.exports = (context, options = {}) => {
    const {Syntax, RuleError, report, getSource} = context;
    return {
        [Syntax.Str](node) {
            if (!isUserWrittenNode(node, context)) {
                return;
            }
            const matches = matchCaptureGroupAll(getSource(node), numberWithUnitTarget);

            matches.forEach(match => {
                const parseResult = generateSiUnitParser(options.allowedUnits || []).parse(match.text);
                if(parseResult.status === false) report(
                    node,
                    new RuleError(`「${match.text}」には、SI単位系で使用できない文字が含まれています。SI単位系を使用してください。`, {
                        index: match.index,
                    })
                );
            });
        }
    };
};
