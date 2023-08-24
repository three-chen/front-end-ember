function patch(oldNode, vnode) {
    console.log(vnode);
    const el = createElement(vnode);
    const parentNode = oldNode.parentNode;
    parentNode.insertBefore(el, oldNode.nextSibling);
    parentNode.removeChild(oldNode);
}

function createElement(vnode) {
    const { tag, props, children, text, comment } = vnode;

    //标签节点
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag);

        // 设置属性
        updateProps(vnode);
        children.forEach(child => vnode.el.appendChild(createElement(child)));
    }
    //文本节点
    else if (text) {
        vnode.el = document.createTextNode(text);
    }
    //注释节点
    else {
        vnode.el = document.createComment(comment);
    }

    return vnode.el;
}

function updateProps(vnode) {
    const el = vnode.el;
    const props = vnode.props || {};
    for (const key in props) {
        const value = props[key];
        if (key === "class") {
            el.className = value;
        } else if (key === "style") {
            for (const style in value) {
                if (Object.hasOwnProperty.call(value, style)) {
                    const element = value[style];
                    el.style[style] = element;
                }
            }
        } else {
            el.setAttribute(key, value);
        }
    }
}

export {
    patch
};

