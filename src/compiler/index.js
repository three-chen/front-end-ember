import { parseHtmlToAst } from "./astParser";
import { generate } from "./generate";
function createRenderFunction(html) {
    const ast = parseHtmlToAst(html);
    const code = generate(ast);
    console.log(ast);
    console.log(code);
}

export {
    createRenderFunction
};

