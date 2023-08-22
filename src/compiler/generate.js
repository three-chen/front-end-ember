/*
_c('div',
    {id:"app",style:{"color":"red","font-size":1rem}},
    _v("hello,"+_s(name)+"welcom"),
    _c('span',{class:"text"},_v(_s(age))),
    _c('p',undefined,_v("welcom"))
)

*/

const doubleBrace = /\{\{((?:.|\r?\n)+?)\}\}/g;
function generateChild(node) {
    if (node.type === 1) {
        return generate(node);
    } else if (node.type === 3) {
        let text = node.text;
        if (!doubleBrace.test(text)) {
            return `_v(${JSON.stringify(text)})`;
        } else {
            let match;
            let code = [];
            let index = 0;
            let lastIndex = doubleBrace.lastIndex = 0;
            while (match = doubleBrace.exec(text)) {
                index = match.index;
                if (index > lastIndex) {
                    code.push(JSON.stringify(text.slice(lastIndex, index)));
                }
                code.push(`_s(${match[1].trim()})`);
                lastIndex = doubleBrace.lastIndex;
            }
            if (lastIndex < text.length) {
                code.push(JSON.stringify(text.slice(lastIndex)));
            }
            return `_v(${code.join('+')})`;
        }
    } else if (node.type === 8) {
        return `_v("${JSON.stringify(node.text)}")`;
    }
}

function getChildren(ast) {
    let children = ast.children;

    if (children) {
        return children.map((c) => {
            return generateChild(c)
        }).join(',');
    }
}

function formatAttrs(attrs) {
    let attrStr = "";
    for (const key in attrs) {
        if (Object.hasOwnProperty.call(attrs, key)) {
            let value = attrs[key];
            if (key === "style") {
                let style = {};
                let styleArray = value.split(';');
                styleArray.forEach(el => {
                    let [key, value] = el.split(':');
                    style[key] = value;
                });
                value = style;
            }
            attrStr += `${key}:${JSON.stringify(value)},`;
        }
    }
    attrStr = attrStr.substring(0, attrStr.length - 1);
    return attrStr;
}

function generate(ast) {
    let children = getChildren(ast);
    let code = `_c('${ast.sel}',${Object.keys(ast.attrs).length > 0 ? `{${formatAttrs(ast.attrs)}}` : 'undefined'}${children.length > 0 ? `,${children}` : ''})`;

    return code;
}

export {
    generate
};

