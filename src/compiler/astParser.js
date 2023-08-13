// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`//标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

function parseHtmlToAst(html) {
    let total = 0;
    let text = html;
    let status = "tag_open";
    let match = {
        sel: {},
        attrs: {},
        text: "",
    };

    while (text) {
        switch (status) {
            case "tag_open":
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
                end(match);
                break;
            case "text":
                matchText();
                break;
            case "tag_close":
                status = "tag_open";
                break;
            default:
                break;
        }
    }

    function matchTagOpen() {
        total++;
        let endTagMatch = text.match(endTag);
        console.log(total, endTagMatch, text);
        if (!endTagMatch) {
            if (text.indexOf('<') === 0) {
                status = "tag_start";
            }
        } else {
            text = undefined;
        }
        if (total > 2) {
            text = undefined;
        }
    }

    function matchTagStart() {
        const startTagMatch = text.match(startTagOpen);
        if (startTagMatch) {
            match.sel = startTagMatch[1];
            advance(startTagMatch[0].length);
            status = "tag_attribute";
        } else {
            advance(text.indexOf('>'));
            status = "tag_end";
        }
    }

    function matchTagAttribute() {
        const attributeMatch = text.match(attribute);
        if (attributeMatch) {
            match.attrs[attributeMatch[1]] = attributeMatch[3] || attributeMatch[4] || attributeMatch[5];
            advance(attributeMatch[0].length);
            status = "tag_attribute";
        } else {
            status = "tag_end";
        }
    }

    function matchTagEnd() {
        const endMatch = text.match(startTagClose);
        advance(endMatch[0].length);
        status = "text";
    }

    function matchText() {
        match.text += text.substring(0, text.indexOf('<'));
        if (match.text) {
            advance(match.text.length);
        }
        status = "tag_open";
    }

    function start(tagname, attrs) {
        console.log("start:", tagname, attrs);
    }

    function end(match) {
        console.log("end:", match);
    }

    function chars(text) {
        console.log("chars", text);
    }

    function createAstElement(tagname, attrs) {
        return {
            type: 1,
            tag: tagname,
            attrs,
            children: [],
            // parent:
        }
    }

    function advance(length) {
        text = text.substring(length);
    }
}
export {
    parseHtmlToAst
}

