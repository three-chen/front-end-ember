// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`//标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const commentTag = /^<!\--/
const templateText = /\{\{(.+?)\}\}/

function parseHtmlToAst(html) {
    let text = html;
    let status = "tag_open";
    let ast = {};
    let astStack = [];
    let currentMatch = null;
    let brotherTag = ["img", "br", "hr", "input", "link", "meta", "param", "source", "track", "comment"];
    let nextType = "";

    while (text) {
        switch (status) {
            case "tag_open":
                currentMatch = createAstElement("", {}, "", 0, [], null,);
                matchTagOpen();
                break;
            case "tag_start":
                matchTagStart();
                break;
            case "tag_attribute":
                matchTagAttribute();
                break;
            case "tag_end":
                matchTagEnd();
                break;
            case "tag_children":
                matchTagChildren();
                break;
            case "tag_brother":
                matchTagBrother();
                break;
            case "tag_father":
                matchTagFather();
                break;
            case "text":
                matchText();
                break;
            case "tag_close":
                status = "tag_father";
                break;
            default:
                break;
        }
    }
    return ast;

    function matchTagOpen() {
        let endTagMatch = text.match(endTag);
        if (!endTagMatch) {
            if (text.indexOf('<') === 0) {
                status = "tag_start";
            } else {
                status = "text";
            }
        } else {
            advance(endTagMatch[0].length);
            status = "tag_close";
        }
    }

    function matchTagStart() {
        const startTagMatch = text.match(startTagOpen);
        // normal tag
        if (startTagMatch) {
            currentMatch.sel = startTagMatch[1];
            currentMatch.type = 1;
            advance(startTagMatch[0].length);
            status = "tag_attribute";
        }
        //abnomal tag such as annotation
        else {
            const commentTagMatch = text.match(commentTag);
            if (commentTagMatch) {
                currentMatch.sel = "comment";
                currentMatch.type = 8;
                currentMatch.text = text.substring(0, text.indexOf('-->'));
                advance(currentMatch.text.length + 2);
                currentMatch.text += '-->';
            }
            status = "tag_end";
        }
    }

    function matchTagAttribute() {
        const attributeMatch = text.match(attribute);
        if (attributeMatch) {
            currentMatch.attrs[attributeMatch[1]] = attributeMatch[3] || attributeMatch[4] || attributeMatch[5] || '';
            advance(attributeMatch[0].length);
            status = "tag_attribute";
        } else {
            status = "tag_end";
        }
    }

    function matchTagEnd() {
        const endMatch = text.match(startTagClose);
        if (brotherTag.includes(currentMatch.sel)) {
            status = "tag_brother";
        } else {
            status = "tag_children"
        }
        advance(endMatch[0].length);
    }

    function matchText() {
        let tempText = text.substring(0, text.indexOf('<'));
        if (tempText) {
            advance(tempText.length);
            currentMatch.type = 3;
            tempText = tempText.trim();
            if (!tempText) {
                status = "tag_open";
                return;
            }
            let temp = tempText.match(templateText);
            if (temp) {
                currentMatch["token"] = temp[1];
            }
            currentMatch.text = tempText;
        }
        status = "tag_brother";
    }

    function matchTagChildren() {
        pushMatch(currentMatch, "children");
        status = "tag_open";
    }

    function matchTagBrother() {
        pushMatch(currentMatch, "brother");
        status = "tag_open";
    }

    function matchTagFather() {
        pushMatch(currentMatch, "father");
        status = "tag_open";
    }

    function createAstElement(sel, attrs, text, type, children, parent) {
        return {
            sel,
            attrs,
            text,
            type,
            children,
            parent,
        }
    }

    function pushMatch(match, type) {
        let lastType;
        if (type === "father") {
            lastType = nextType;
            nextType = "father";
        }
        if (astStack.length > 0) {
            if (nextType === "children") {
                astStack[astStack.length - 1].children.push(match);
                match.parent = astStack[astStack.length - 1];
                astStack.push(match);
            } else if (nextType === "brother") {
                astStack.pop();
                astStack[astStack.length - 1].children.push(match);
                match.parent = astStack[astStack.length - 1];
                astStack.push(match);
            } else if (nextType === "father") {
                if (astStack[astStack.length - 1].children.length !== 0 || lastType !== "children") {
                    astStack.pop();
                }
                type = "brother";
            }
        } else {
            ast = match;
            astStack.push(match);
        }
        nextType = type;
    }

    function advance(length) {
        text = text.substring(length);
    }
}
export {
    parseHtmlToAst
}

