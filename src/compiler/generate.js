/*
_C('div',
    {id:"app",style:{color:"red",font-size:1rem}},
    _v("hello,"+_s(name)+"welcom"),
    _c('span',{class:"text"},_v(_s(age))),
    _c('p',undefined,_v("welcom"))
)

*/

const doubleBrace = /\{\{((?:.l\r?\n)+?)\}\}/g;
function generateChild(node) {
    if (node.type === 1) {
        return generate(node);
    } else if (node.type === 3) {
        let text = node.text;
        if (!doubleBrace.test(text)) {
            return `_v(${JSON.stringify(text)})`;
        }
    }
}

function getChildren(ast) {
    let children = ast.children;

    if (children) {
        return children.map((c) => {
            return generateChild(c).join(',');
        })
    }
}

function formatAttrs(attrs) {
    let attrStr = "";
    for (const key in attrs) {
        if (Object.hasOwnProperty.call(attrs, key)) {
            const value = attrs[key];
            if (key === "style") {
                // value.split(';');
            }
        }
    }
    return `${attrStr}`
}

function generate(ast) {
    let children = getChildren(ast);
    let code = `_c('${ast.sel}',
            ${ast.attrs.length > 0 ? `${formatAttrs(ast.attrs)}` : 'undefined'},
            ${children.length > 0 ? children : 'undefined'}`;
}

export {
    generate
};

