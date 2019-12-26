'use strict';
const TextLintTester = require('textlint-tester');
const tester = new TextLintTester();
// rule
const rule = require('../src/use-si-units');
// ruleName, rule, { valid, invalid }
tester.run('use-si-units', rule, {
    valid: [
        'はじめくんは1 m離れた学校に向かいます。',
        '点Pが10000 m/sで移動する。',
        '1 Paは1 kg/(m･s^2)だ。'
    ],
    invalid: [
        {
            text: '点Pが10000 m/secで移動する。',
            errors: [
                {
                    message: '「m/sec」には、SI単位系で使用できない文字が含まれています。SI単位系を使用してください。',
                    line: 1,
                    column: 10
                }
            ]
        },
        {
            text: 'はじめくんは1 M離れた学校に向かいます。',
            errors: [
                {
                    message: '「M」には、SI単位系で使用できない文字が含まれています。SI単位系を使用してください。',
                    line: 1,
                    column: 9
                }
            ]
        },
    ]
});
