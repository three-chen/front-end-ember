import { parseHtmlToAst } from "./astParser";
function createRenderFunction(html) {
    const ast = parseHtmlToAst(html);
    console.log(ast);
}

export {
    createRenderFunction
};

