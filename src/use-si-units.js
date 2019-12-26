// use-si-unit.js
'use strict';
const P = require('parsimmon');
import { matchCaptureGroupAll } from 'match-index';
import { isUserWrittenNode } from './util/node-util';
/*
# use-si-units

- JIS Z 8203:2000「国際単位系(SI)及びその使い方」に基づき、SI単位系の単位以外の使用を禁止します
- SI単位系の単位とは以下のいずれかの単位、またはそれらの組み合わせ（組立単位）を指します
    - SI基本単位（m, kg, s, A, K, mol, cd）
    - 固有の名称をもつSI組立単位（rad, sr, Hz, N, Pa, Jなど19種）
    - 人の健康を守るために認められる固有の名称をもつSI組立単位（Bq, Gy, Sv）
- 以下の文字は単体では単位となることができませんが、単位と組み合わせて使用できます
    - SI接頭語（M, G, k, mなど20種）
    - SI単位を組み合わせる際に使用される記号（\, ^, -, ·, ･, ・, (, )）
    - 次元を表すための数字（e.g. m^2）

    ## 対象とする文字列
- 数値 + 単位の組み合わせを検出します
    - e.g. 「10 m」「273 K」「123 kgm^2/s^3」
    - 数値と単位の間には**半角スペース**が入っている必要があります
        - IDや型番のような単位と関係ない部分を誤検出するのを防ぐためです

## 対象としない文字列
- 単位記号
    - e.g. 「%」「Å」
- 日本語の単位や助数詞
    - e.g. 「枚」「本」「糎」「㌢㍍」
- 小数点や記号入りの数値
    - e.g. 「2.56 m/s」「1.1e-10 m」
    - ただし、小数点・記号より後にも数字があればその部分を検出します
- LaTeX等で数値と単位の間に半角スペース以外を使用しているもの
    - e.g. 「10\,m」「\SI{123}{kgm^2/s^3}」「$123\ \mathrm{kgm^2/s^3}$」

## オプション
- `allowedUnits`
    - この配列にある文字列には、SI単位系に従っていなくとも警告を出しません
 */

const numberWithUnitTarget = /[0-9]+? ([a-zA-Z℃Ωμ^\-\/·･・\(\)]+)/;

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
