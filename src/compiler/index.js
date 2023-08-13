import { parseHtmlToAst } from "./astParser";
function createRenderFunction(html) {
    const ast = parseHtmlToAst(html);
}

export {
    createRenderFunction
};

