import babelTraverse from '@babel/traverse';
import { parse, ParserPlugin } from '@babel/parser';
import generate from '@babel/generator';
import translater from '../src/index';
import sampleJson from '../example-methods.json';

function lowercaseFirstLetter(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

const expectCode = (ast) => {
    expect(
        generate(ast).code
    ).toMatchSnapshot();
}

const printCode = (ast) => {
    console.log(
        generate(ast).code
    );
}

for (const key in sampleJson) {
    const {requestType, responseType} = sampleJson[key];

    it(key, () => {
        expectCode(translater({
            queryInterface: `Use${key}Query`,
            hookName: `use${key}`,
            requestType: requestType,
            responseType: responseType,
            queryServiceMethod: lowercaseFirstLetter(key),
            keyName: `${lowercaseFirstLetter(key)}Query`,
        }));
    });
}