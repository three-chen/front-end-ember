function createElement(tag, attrs = {}, ...children) {
    return vnode(tag, attrs, children);
}

function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, text, undefined);
}

function createCommetVnode(comment) {
    return vnode(undefined, undefined, undefined, undefined, comment);
}

function vnode(tag, props, children, text, comment) {
    return {
        tag,
        props,
        children,
        text,
        comment
    }
}

export {
    createCommetVnode, createElement,
    createTextVnode
};

