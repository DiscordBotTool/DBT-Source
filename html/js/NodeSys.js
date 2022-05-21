//Copyright 2016 Sketchpunk Labs

//###########################################################################
//Main Static Object
//###########################################################################
var nodes = [];
var nodeData = [];

var NEditor = {};
NEditor.dragMode = 0;
NEditor.dragItem = null; //reference to the dragging item
NEditor.startPos = null; //Used for starting position of dragging lines
NEditor.offsetX = 0; //OffsetX for dragging nodes
NEditor.offsetY = 0; //OffsetY for dragging nodes
NEditor.svg = null; //SVG where the line paths are drawn.
NEditor.handler = null;

NEditor.pathColor = "#999999";
NEditor.pathColorA = "#609c44";
NEditor.pathWidth = 1.5;
NEditor.pathDashArray = "-1,-1,-1,-1,-1,-1";

NEditor.init = function () {
    NEditor.svg = document.getElementById("connsvg");
    NEditor.svg.ns = NEditor.svg.namespaceURI;
};

/*--------------------------------------------------------
Global Function */

//Trail up the parent nodes to get the X,Y position of an element
NEditor.getOffset = function (elm) {
    var pos = { x: 0, y: 0 };
    while (elm) {
        pos.x += elm.offsetLeft;
        pos.y += elm.offsetTop;
        elm = elm.offsetParent;
    }
    return pos;
};

//Gets the position of one of the connection points
NEditor.getConnPos = function (elm) {
    var pos = NEditor.getOffset(elm);
    pos.x += elm.offsetWidth / 2 + 1.5; //Add some offset so its centers on the element
    pos.y += elm.offsetHeight / 2 + 0.5;
    return pos;
};

//Used to reset the svg path between two nodes
NEditor.updateConnPath = function (o) {
    var pos1 = o.output.getPos(),
        pos2 = o.input.getPos();
    NEditor.setQCurveD(o.path, pos1.x, pos1.y, pos2.x, pos2.y);
};

//Creates an Quadratic Curve path in SVG
NEditor.createQCurve = function (x1, y1, x2, y2, o) {
    var elm = document.createElementNS(NEditor.svg.ns, "path");
    elm.setAttribute("fill", "none");
    elm.setAttribute("stroke", NEditor.pathColor);
    elm.setAttribute("stroke-width", NEditor.pathWidth);
    elm.setAttribute("stroke-dasharray", NEditor.pathDashArray);

    NEditor.setQCurveD(elm, x1, y1, x2, y2);
    return elm;
};

//This is seperated from the create so it can be reused as a way to update an existing path without duplicating code.
NEditor.setQCurveD = function (elm, x1, y1, x2, y2) {
    var dif = Math.abs(x1 - x2) / 1.5,
        str =
            "M" +
            x1 +
            "," +
            y1 +
            " C" + //MoveTo
            (x1 + dif) +
            "," +
            y1 +
            " " + //First Control Point
            (x2 - dif) +
            "," +
            y2 +
            " " + //Second Control Point
            x2 +
            "," +
            y2; //End Point

    elm.setAttribute("d", str);
};

NEditor.setCurveColor = function (elm, isActive, o) {
    let group;

    commands.forEach(node => {
        if (node.group) {
            node.boxFollow.forEach(box => {
                if (box === o?.input?.nName) {
                    group = node;
                }
            });
        }
    });

    try {
        o.input.root.querySelector("i").style.backgroundColor = group?.color ?? "#96ff65";
        o.input.root.querySelector("i").style.border = `1px solid ${pSBC(0.2, group?.color) ?? "#96ff65"}`;

        o.output.root.querySelector("i").style.backgroundColor = group?.color ?? "#96ff65";
        o.output.root.querySelector("i").style.border = `1px solid ${pSBC(0.2, group?.color) ?? "#96ff65"}`;
    } catch (e) {}

    elm.setAttribute("stroke", isActive ? pSBC(0.32, group?.color) ?? NEditor.pathColorA : NEditor.pathColor);
};

/*Unused function at the moment, it creates a straight line
NEditor.createline = function (x1, y1, x2, y2, color, w) {
	var line = document.createElementNS(NEditor.svg.ns, 'line');
	line.setAttribute('x1', x1);
	line.setAttribute('y1', y1);
	line.setAttribute('x2', x2);
	line.setAttribute('y2', y2);
	line.setAttribute('stroke', color);
	line.setAttribute('stroke-width', w);
	return line;
}*/

/*--------------------------------------------------------
Dragging Nodes */
NEditor.beginNodeDrag = function (n, x, y) {
    if (NEditor.dragMode != 0) return;

    NEditor.dragMode = 1;
    NEditor.dragItem = n;
    this.offsetX = n.offsetLeft - x;
    this.offsetY = n.offsetTop - y;

    window.addEventListener("mousemove", NEditor.onNodeDragMouseMove);
    window.addEventListener("mouseup", NEditor.onNodeDragMouseUp);
};

NEditor.onNodeDragMouseUp = function (e) {
    e.stopPropagation();
    e.preventDefault();
    NEditor.dragItem = null;
    NEditor.dragMode = 0;

    window.removeEventListener("mousemove", NEditor.onNodeDragMouseMove);
    window.removeEventListener("mouseup", NEditor.onNodeDragMouseUp);
};

NEditor.onNodeDragMouseMove = function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (NEditor.dragItem) {
        NEditor.dragItem.style.left = e.pageX + NEditor.offsetX + "px";
        NEditor.dragItem.style.top = e.pageY + NEditor.offsetY + "px";
        NEditor.dragItem.ref.updatePaths();
    }

    NEditor.dragItem.setSet = false;
    new SavePos(NEditor.dragItem.id, e.pageX + NEditor.offsetX, e.pageY + NEditor.offsetY);
};

/*--------------------------------------------------------
Dragging Paths */
NEditor.beginConnDrag = function (path, o) {
    if (NEditor.dragMode != 0) return;
    o = o || null;

    NEditor.dragMode = 2;
    NEditor.dragItem = path;
    NEditor.startPos = path.output.getPos();

    console.log("wh");

    NEditor.setCurveColor(path.path, false, o);
    let wrappedFunc = NEditor.onConnDragClick.bind(null, event, o);
    NEditor.handler = wrappedFunc;
    window.addEventListener("click", wrappedFunc);
    window.addEventListener("mousemove", NEditor.onConnDragMouseMove);
};

NEditor.endConnDrag = function (o) {
    NEditor.dragMode = 0;
    NEditor.dragItem = null;

    window.removeEventListener("click", NEditor.handler);
    window.removeEventListener("mousemove", NEditor.onConnDragMouseMove);
};

NEditor.onConnDragClick = function (e, o) {
    e.stopPropagation();
    e.preventDefault();
    // console.log(o);
    NEditor.dragItem?.output?.removePath(NEditor.dragItem, o);
    NEditor.endConnDrag(0);
};

NEditor.onConnDragMouseMove = function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (NEditor.dragItem) NEditor.setQCurveD(NEditor.dragItem.path, NEditor.startPos.x, NEditor.startPos.y, e.pageX, e.pageY);
};

/*--------------------------------------------------------
Connection Event Handling */
NEditor.onOutputClick = function (e) {
    e.stopPropagation();
    e.preventDefault();
    var path = e.target.parentNode.ref.addPath();

    NEditor.beginConnDrag(path);
};

NEditor.onInputClick = function (e) {
    e.stopPropagation();
    e.preventDefault();
    var o = this.parentNode.ref;

    switch (NEditor.dragMode) {
        case 2: //Path Drag
            o.applyPath(NEditor.dragItem, true);
            NEditor.endConnDrag();
            break;
        case 0: //Not in drag mode
            var path = o.clearPath();
            new RemoveConnection(o.nName);

            if (path != null) NEditor.beginConnDrag(path, o);
            break;
    }
};

//###########################################################################
// Connector Object
//###########################################################################

//Connector UI Object. Ideally this should be an abstract class as a base for an output and input class, but save time
//I wrote this object to handle both types. Its a bit hokey but if it becomes a problem I'll rewrite it in a better OOP way.
NEditor.Connector = function (pElm, isInput, name, nName) {
    this.name = name;
    this.nName = nName;
    this.root = document.createElement("li");
    this.dot = document.createElement("i");
    this.label = document.createElement("span");

    //Input/Output Specific values
    if (isInput) this.OutputConn = null;
    //Input can only handle a single connection.
    else this.paths = []; //Outputs can connect to as many inputs is needed

    //Create Elements
    pElm.appendChild(this.root);
    this.root.appendChild(this.dot);
    this.root.appendChild(this.label);
    this.root.id = this.nName + name;

    //Define the Elements
    this.root.className = isInput ? "Input" : "Output";
    this.root.ref = this;
    this.label.innerHTML = name;
    this.dot.innerHTML = "&nbsp;";

    this.dot.addEventListener("click", isInput ? NEditor.onInputClick : NEditor.onOutputClick);
};

/*--------------------------------------------------------
Common Methods */

//Get the position of the connection ui element
NEditor.Connector.prototype.getPos = function () {
    return NEditor.getConnPos(this.dot);
};

//Just updates the UI if the connection is currently active
NEditor.Connector.prototype.resetState = function () {
    var isActive = (this.paths && this.paths.length > 0) || this.OutputConn != null;

    if (isActive) this.root.classList.add("Active");
    else this.root.classList.remove("Active");
};

//Used mostly for dragging nodes, so this allows the paths to be redrawn
NEditor.Connector.prototype.updatePaths = function () {
    if (this.paths && this.paths.length > 0) for (var i = 0; i < this.paths.length; i++) NEditor.updateConnPath(this.paths[i]);
    else if (this.OutputConn) NEditor.updateConnPath(this.OutputConn);
};

/*--------------------------------------------------------
Output Methods */

//This creates a new path between nodes
NEditor.Connector.prototype.addPath = function () {
    var pos = NEditor.getConnPos(this.dot),
        dat = {
            path: NEditor.createQCurve(pos.x, pos.y, pos.x, pos.y, this),
            input: null,
            output: this,
        };

    NEditor.svg.appendChild(dat.path);
    this.paths.push(dat);
    return dat;
};

//Remove Path
NEditor.Connector.prototype.removePath = function (o, triggers) {
    var i = this.paths.indexOf(o);

    if (i > -1) {
        // console.log(triggers);

        if (triggers) {
            // console.log(triggers);
            // new RemoveConnection(o.output.nName, o.output.name, triggers.nName);
        }

        NEditor.svg.removeChild(o.path);
        this.paths.splice(i, 1);
        this.resetState();
    }
};

NEditor.Connector.prototype.connectTo = function (o) {
    if (o.OutputConn === undefined) {
        // console.log("connectTo - not an input");
        return;
    }

    var conn = this.addPath();
    o.applyPath(conn, false);
};

/*--------------------------------------------------------
Input Methods */

//Applying a connection from an output
NEditor.Connector.prototype.applyPath = function (o, saving) {
    //If a connection exists, disconnect it.
    if (this.OutputConn != null) this.OutputConn.output.removePath(this.OutputConn);

    //If moving a connection to here, tell previous input to clear itself.
    if (o.input != null) o.input.clearPath();

    o.input = this; //Saving this connection as the input reference
    this.OutputConn = o; //Saving the path reference to this object
    this.resetState(); //Update the state on both sides of the connection, TODO some kind of event handling scheme would work better maybe
    o.output.resetState();

    NEditor.updateConnPath(o);
    NEditor.setCurveColor(o.path, true, o);

    if (saving) {
        new SaveConnection(o.output.nName, o.output.name, o.input.nName, o.input);
    }
};

//clearing the connection from an output
NEditor.Connector.prototype.clearPath = function () {
    if (this.OutputConn != null) {
        var tmp = this.OutputConn;
        tmp.input = null;

        this.OutputConn = null;
        this.resetState();
        return tmp;
    }
};

//###########################################################################
// Node Object
//###########################################################################
NEditor.Node = function (sTitle, sName, category, type) {
    this.Title = sTitle;
    this.sName = sName;
    this.category = category;
    this.type = type;
    this.Inputs = [];
    this.Outputs = [];

    //.........................
    this.eRoot = document.createElement("div");
    document.body.appendChild(this.eRoot);
    this.eRoot.className = "NodeContainer";
    this.eRoot.setAttribute("onClick", "selectNode(this);");
    this.eRoot.setAttribute("ondblclick", `openResponse('${this.type} Response', '${this.sName}', true)`);
    this.eRoot.ref = this;
    this.eRoot.id = this.sName;

    //.........................
    this.eHeader = document.createElement("header");
    this.eHeader.classList.toggle(this.category.toLowerCase().replace(/ /g, "-"), true);
    this.eRoot.appendChild(this.eHeader);
    this.eHeader.innerHTML = this.Title;
    this.eHeader.addEventListener("mousedown", this.onHeaderDown);

    //.........................
    this.eList = document.createElement("ul");
    this.eRoot.appendChild(this.eList);

    nodes.push(this.sName);

    nodeData.push({
        name: this.sName,
        connections: [],
        inputs: [],
        outputs: [],
    });

    this._index = nodeData.findIndex(x => x.name === this.sName);
};

NEditor.Node.prototype.addInput = function (name) {
    var o = new NEditor.Connector(this.eList, true, name, this.sName);
    this.Inputs.push(o);

    nodeData[this._index].inputs.push(name);

    return o;
};

NEditor.Node.prototype.removeInput = function (name) {
    var o = document.getElementById(this.sName + name);
    this.Inputs.splice(this.Inputs.indexOf(o), 1);

    nodeData[this._index].inputs.splice(nodeData[this._index].inputs.indexOf(name), 1);
    o.remove();

    return o;
};

NEditor.Node.prototype.addNote = function (note) {
    const textElement = document.createElement("h4");
    textElement.style.color = "#8a8a8a";
    textElement.innerText = note;

    this.eRoot.appendChild(textElement);
};

NEditor.Node.prototype.addTypeInput = function (placeholder, name, type = "text") {
    const center = document.createElement("center");
    const textElement = document.createElement("input");
    textElement.className = "type-input";
    textElement.placeholder = placeholder;
    textElement.name = name;
    textElement.type = type;
    center.appendChild(textElement);

    this.eRoot.appendChild(center);
};

NEditor.Node.prototype.addTypeTextarea = function (placeholder, name) {
    const center = document.createElement("center");
    const textElement = document.createElement("textarea");
    textElement.className = "type-input";
    textElement.placeholder = placeholder;
    textElement.name = name;
    center.appendChild(textElement);

    this.eRoot.appendChild(center);
};

NEditor.Node.prototype.addTypeSelect = function (placeholder, name, options) {
    const center = document.createElement("center");
    const textElement = document.createElement("select");
    textElement.className = "type-input";
    textElement.placeholder = placeholder;
    textElement.name = name;

    options.forEach(option => {
        textElement.appendChild(option);
    });

    center.appendChild(textElement);

    this.eRoot.appendChild(center);
};

NEditor.Node.prototype.addTypeRange = function (placeholder, name, minValue, maxValue) {
    const center = document.createElement("center");
    const textElement = document.createElement("input");
    textElement.className = "type-input";
    textElement.placeholder = placeholder;
    textElement.name = name;
    textElement.type = "range";
    textElement.max = maxValue;
    textElement.min = minValue;

    center.appendChild(textElement);
    this.eRoot.appendChild(center);
};

NEditor.Node.prototype.addOutput = function (name) {
    var o = new NEditor.Connector(this.eList, false, name, this.sName);
    this.Outputs.push(o);

    nodeData[this._index].outputs.push(name);
    return o;
};

NEditor.Node.prototype.removeOutput = function (name) {
    var o = document.getElementById(this.sName + name);
    this.Outputs.splice(this.Outputs.indexOf(o), 1);

    nodeData[this._index].outputs.splice(nodeData[this._index].outputs.indexOf(name), 1);
    o.remove();

    return o;
};

NEditor.Node.prototype.getInputPos = function (i) {
    return NEditor.getConnPos(this.Inputs[i].dot);
};
NEditor.Node.prototype.getOutputPos = function (i) {
    return NEditor.getConnPos(this.Outputs[i].dot);
};

NEditor.Node.prototype.updatePaths = function () {
    var i;
    for (i = 0; i < this.Inputs.length; i++) this.Inputs[i].updatePaths();
    for (i = 0; i < this.Outputs.length; i++) this.Outputs[i].updatePaths();
};

//Handle the start node dragging functionality
NEditor.Node.prototype.onHeaderDown = function (e) {
    e.stopPropagation();
    NEditor.beginNodeDrag(e.target.parentNode, e.pageX, e.pageY);
};

NEditor.Node.prototype.setPosition = function (x, y) {
    this.eRoot.style.left = x + "px";
    this.eRoot.style.top = y + "px";
};

NEditor.Node.prototype.setWidth = function (w) {
    this.eRoot.style.width = w + "px";
};

//###########################################################################
// SETUP
//###########################################################################
NEditor.init();

const pSBC = (p, c0, c1, l) => {
    let r,
        g,
        b,
        P,
        f,
        t,
        h,
        i = parseInt,
        m = Math.round,
        a = typeof c1 == "string";
    if (typeof p != "number" || p < -1 || p > 1 || typeof c0 != "string" || (c0[0] != "r" && c0[0] != "#") || (c1 && !a))
        return null;
    if (!this.pSBCr)
        this.pSBCr = d => {
            let n = d.length,
                x = {};
            if (n > 9) {
                ([r, g, b, a] = d = d.split(",")), (n = d.length);
                if (n < 3 || n > 4) return null;
                (x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
            } else {
                if (n == 8 || n == 6 || n < 4) return null;
                if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
                d = i(d.slice(1), 16);
                if (n == 9 || n == 5)
                    (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
                else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
            }
            return x;
        };
    (h = c0.length > 9),
        (h = a ? (c1.length > 9 ? true : c1 == "c" ? !h : false) : h),
        (f = this.pSBCr(c0)),
        (P = p < 0),
        (t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
        (p = P ? p * -1 : p),
        (P = 1 - p);
    if (!f || !t) return null;
    if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
    else
        (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
            (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
            (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
    (a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else
        return (
            "#" +
            (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
        );
};
