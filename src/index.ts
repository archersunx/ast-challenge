import babelTraverse from '@babel/traverse';
import { parse, ParserPlugin } from '@babel/parser';

/**
 * Notice: As I'm not familiar with babel traverse API, my implementation may not be perfect.
 * I just checked the sample and try to make it work the same way.
 */

interface Option {
    queryInterface?: string
    hookName?: string
    requestType?: string
    responseType?: string
    queryServiceMethod?: string
    keyName?: string
}

export default ({
    queryInterface,
    hookName,
    requestType,
    responseType,
    queryServiceMethod,
    keyName,
}: Option) => {
    const code = `
export interface UseXXXQuery<TData> extends ReactQueryParams<QueryXXXResponse, TData> {
    request?: QueryXXXRequest;
}
const useXXX = <TData = QueryXXXResponse,>({
    request,
    options
}: UseXXXQuery<TData>) => {
    return useQuery<QueryXXXResponse, Error, TData>(["xxxQuery", request], () => {
        if (!queryService) throw new Error("Query Service not initialized");
        return queryService.serviceMethodXXX(request);
    }, options);
};
`;

    const plugins: ParserPlugin[] = [
        'typescript',
    ];

    const ast = parse(code, {
        sourceType: 'module',
        plugins
    });

    babelTraverse(ast, {
        TSInterfaceDeclaration(path) {
            if (queryInterface && path.node.id.name === 'UseXXXQuery') {
                path.node.id.name = queryInterface
            }
        },
        TSTypeAnnotation(path) {
            if (queryInterface && path.node.typeAnnotation.typeName.name === 'UseXXXQuery') {
                console.log(path.node.typeAnnotation.typeName.name);
                path.node.typeAnnotation.typeName.name = queryInterface;
            }
        },
        VariableDeclarator(path) {
            if (hookName && path.node.id.name === 'useXXX') {
                path.node.id.name = hookName;
            }
        },
        TSTypeReference(path) {
            if (responseType && path.node.typeName.name === 'QueryXXXResponse') {
                path.node.typeName.name = responseType
            }

            if (requestType && path.node.typeName.name === 'QueryXXXRequest') {
                path.node.typeName.name = requestType;
            }
        },
        CallExpression(path) {
            if (path.node.callee.object?.name === 'queryService') {
                babelTraverse(path.node, {
                    MemberExpression(path) {
                        if (queryServiceMethod && path.node.property.name === 'serviceMethodXXX') {
                            path.node.property.name = queryServiceMethod;
                        }
                    },
                }, path.scope);
            }

            if (path.node.callee.name === 'useQuery' && keyName) {
                path.node.arguments[0].elements[0].value = keyName;
            }
        }
    });

    return ast
}
