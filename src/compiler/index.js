import { parseHtmlToAst } from "./astParser";
import { generate } from "./generate";
function createRenderFunction(html) {
    const ast = parseHtmlToAst(html);
    const code = generate(ast);
    console.log(code);
    return new Function('_c', '_s', '_v', 'message', `return ${code}`);
}

export {
    createRenderFunction
};

