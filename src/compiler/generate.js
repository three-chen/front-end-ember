/*
_c('div',
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
            return [`_v(${JSON.stringify(text)})`];
        } else {
            let match;
            let code = [];
            while (match = doubleBrace.exec(text)) {
                console.log(match);
                let str = match[1];
                code.push(`_v(${JSON.stringify(str)})`);
            }
            return code;
        }
    } else if (node.type === 8) {
        return [`-v("${node.text}")`];
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
            let value = attrs[key];
            if (key === "style") {
                let styleArray = value.split(';');
                value = styleArray.join(',');
                value = value.substring(0, value.length - 1);
                attrStr += `${key}:{${value}},`
            } else {
                attrStr += `${key}:"${value}",`;
            }
        }
    }
    attrStr = attrStr.substring(0, attrStr.length - 1);
    return `${attrStr}`
}

function generate(ast) {
    let children = getChildren(ast);
    let code = `_c('${ast.sel}',
            {${Object.keys(ast.attrs).length > 0 ? `${formatAttrs(ast.attrs)}` : 'undefined'}},
            ${children.length > 0 ? children : 'undefined'}`;

    return code;
}

export {
    generate
};

