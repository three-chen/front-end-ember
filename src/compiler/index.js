import { parseHtmlToAst } from "./astParser";
import { generate } from "./generate";
function createRenderFunction(html) {
    const ast = parseHtmlToAst(html);
    const code = generate(ast);
    return new Function(`with(this){return ${code}}`);
}

export {
    createRenderFunction
};

