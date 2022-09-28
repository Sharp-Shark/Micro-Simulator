// Microbot (uses Microlang)
class robot extends object {
    constructor (x=0, y=0, a=0, cLen=12, mLen=4, pSpeed=0.1) {
        super(object);
        this.objType = 'robot';
        this.x = x;
        this.y = y;
        this.a = a;
        this.velX = 0;
        this.velY = 0;
        this.velA = 0;
        this.oldX = this.x;
        this.oldY = this.y;
        this.oldA = this.a;
        this.size = 25;
        this.layers = [1, 0];
        this.zIndex = 1;

        // Paint
        this.paintIndex = -1;
        this.penColor = [255, 0, 0];
        this.penWidth = this.size/5;
        // Output
        this.output = '';
        // Code Instruction
        this.codeTxt = new Array(cLen).fill('()');
        this.code = new Array(cLen).fill(['']);
        // Code Memory
        this.binds = {};
        this.mem = new Array(mLen).fill(0);
        // Code Pointer Speed
        this.pSpeed = pSpeed;
        // Code Pointer Time until Move
        this.pTimer = 0;
        // Code Pointer Position
        this.pPos = 0;
    };
    clone () {
        let toReturn = new robot;
        toReturn.a = this.a;
        toReturn.oldA = this.oldA;
        toReturn.size = this.size;
        toReturn.size = this.size;
        toReturn.penColor = structuredClone(this.penColor);
        toReturn.penWidth = this.penWidth;
        toReturn.output = this.output;
        toReturn.codeTxt = structuredClone(this.codeTxt);
        toReturn.code = structuredClone(this.code);
        toReturn.binds = structuredClone(this.binds);
        toReturn.mem = structuredClone(this.mem);
        toReturn.pSpeed = this.pSpeed;
        toReturn.pTimer = this.pTimer;
        toReturn.pPos = this.pPos;
        return toReturn;
    };
    collide () {
        // New Collision (Used)
        // Has Buffer (oldObject)
        // Has Sweep n' Prune (X Axis)
        let angle = 0;
        let newAngle = 0;
        let d = 0;
        let totalR = 0;
        let totalA = 0;
        // Collide
        let set = intersections[this.myIntersection()];
        if(this.id == frame%len(objects) || noSweepNPrune) {
            set = range(0, len(objects));
        };
        for(let countObject in set) {
            let current = set[countObject];
            if(this.id != oldObjects[current].id) {
                if(this.isColliding(oldObjects[current])) {
                    let other = oldObjects[current];
                    // TotalR (radius) = Obj1's Radius + Obj2's Radius
                    totalR = this.size + other.size;
                    // TotalA (area) = Obj1's Area + Obj2's Area
                    totalA = (Math.PI*this.size**2) + (Math.PI*other.size**2);
                    //angle = pointTowards([this.y, this.x], [oldObjects[current].y, oldObjects[current].x]);
                    angle = pointTowards([other.y, other.x], [this.y, this.x]);
                    d = totalR - distance([this.x, this.y], [other.x, other.y]);
                    let thisVelScaler = Math.sqrt(this.velX**2+this.velY**2);
                    let otherVelScaler = Math.sqrt(other.velX**2+other.velY**2);
                    let velScaler = thisVelScaler + otherVelScaler;
                    this.x += Math.cos(angle) * d * lerp((Math.PI*other.size**2)/totalA);
                    this.y += Math.sin(angle) * d * lerp((Math.PI*other.size**2)/totalA);
                    this.velX = lerp(lerp((Math.PI*this.size**2)/totalA), velScaler * Math.cos(angle) * lerp((Math.PI*other.size**2)/totalA), this.velX);
                    this.velY = lerp(lerp((Math.PI*this.size**2)/totalA), velScaler * Math.sin(angle) * lerp((Math.PI*other.size**2)/totalA), this.velY);
                    //this.velX = velScaler * Math.cos(angle) * lerp((Math.PI*other.size**2)/totalA);
                    //this.velY = velScaler * Math.sin(angle) * lerp((Math.PI*other.size**2)/totalA);
                    //this.a = this.a + angleStuff(angleFix(pointTowards([this.oldY, this.oldX], [this.y, this.x])), angleMod(this.a)) * distance([this.oldX, this.oldY], [this.x, this.y])/100;
                 };
            };
        };
    };
    physicsStart () {
        // Fix Velocity
        this.velX += this.x - this.oldX;
        this.velY += this.y - this.oldY;
        this.velA += this.a - this.oldA;
        // Collide
        this.collide();
        // Border
        if(dishShape == 'circle') {
            let a = pointTowards([this.y, this.x], [0, 0]);
            let d = distance([this.x, this.y], [0, 0]);
            let r = dishSize-this.size-dishThickness/2;
            if(d > r) {
                let velScaler = Math.sqrt(this.velX**2+this.velY**2);
                d = d - r;
                this.x += Math.cos(a) * d;
                this.y += Math.sin(a) * d;
                this.velX = velScaler * Math.cos(a);
                this.velY = velScaler * Math.sin(a);
                //this.a = this.a + angleStuff(angleFix(pointTowards([this.oldY, this.oldX], [this.y, this.x])), angleMod(this.a)) * distance([this.oldX, this.oldY], [this.x, this.y])/100;
            };
        } else {
            let r = dishSize-this.size-dishThickness/2;
            if(Math.abs(this.x) > r) {
                this.x += this.x>=0?r-this.x:r*-1-this.x;
                this.velX *= -1;
            };
            if(Math.abs(this.y) > r) {
                this.y += this.y>=0?r-this.y:r*-1-this.y;
                this.velY *= -1;
            };
        };
    };
    compile (txt, index=-1) {
        // Takes Text and Returns Formatted List
        // Removes line breaks
        txt.trim();
        txt = txt.replace(/[\r\n]/gm, "");

        // Generate codeTxt
        let codeTxt = '';
        let stringChar = '';
        let isString = false;
        let count = 0;
        let build = '';
        let char = '';
        while(count < len(txt)) {
            char = txt[count];

            if((char == '"' || char == "'") && (char == stringChar || stringChar == '')) {
                stringChar = isString==0?char:0;
                isString = !isString;
                codeTxt = codeTxt + char;
            } else if((char == '|' || char == ',') && !isString) {
                codeTxt = codeTxt + ' ' + char + ' ';
            } else if(char == '(' && !isString) {
                codeTxt = codeTxt + char + ' ';
            } else if(char == ')' && !isString) {
                codeTxt = codeTxt + ' ' + char;
            } else {
                if(char != ' ' || isString) {
                    codeTxt = codeTxt + char;
                };
            };

            count += 1;
        };
        codeTxt = codeTxt.split(')');
        codeTxt.pop();
        for(let line in codeTxt) {
            codeTxt[line] = codeTxt[line]+')';
        };

        // Generate code
        let code = [[]];
        stringChar = '';
        isString = false;
        count = 0;
        build = '';
        char = '';
        while(count < len(txt)) {
            char = txt[count];

            if((char == '"' || char == "'") && (char == stringChar || stringChar == '')) {
                stringChar = isString==0?char:0;
                isString = !isString;
                build = build + char;
            } else if((char == '(' || char == '|') && !isString) {
                code[len(code)-1].push(build);
                build = '';
            } else if(char == ')' && !isString) {
                if(build != '') {code[len(code)-1].push(build);};
                if(count+1 < len(txt)) {code.push([]);};
                build = '';
            } else {
                if(char != ' ' || isString) {
                    build = build + char;
                };
            };

            count += 1;
        };

        if(index != -1) {
            count = 0;
            while(count < len(code)) {
                this.code[count+index] = code[count];
                count += 1;
            };
            count = 0;
            while(count < len(codeTxt)) {
                this.codeTxt[count+index] = codeTxt[count];
                count += 1;
            };
        };

        return code;
    };
    calculate (txt, index=0) {
        // Polish Notation
        // Removes line breaks
        txt.trim();
        txt = txt.replace(/[\r\n]/gm, "");

        let a = 0;
        let b = 0;
        let c = 0;
        let d = 0;

        let stringChar = '';
        let isString = 0;
        let stack = [];
        let count = 0;
        let build = '';
        let char = '';
        while(count < len(txt)) {
            char = txt[count];

            if((char == '"' || char == "'") && (char == stringChar || stringChar == '')) {
                stringChar = isString==0?char:0;
                isString = isString==0?1:-1;
                if(count+1 >= len(txt) && isString == -1) {
                    stack.push(build);
                };
            } else if((char == ','|| count+1 >= len(txt)) && isString != 1) {
                if(count+1 >= len(txt)) {build = build + char};
              
                // Strings & Their Operators
                if(isString != 0) {
                    // String
                    stack.push(build);
                    isString = 0;
                } else if(build == '$') {
                    // String() (string-ify)
                    a = stack.pop();
                    stack.push(String(a));
                } else if(build == '$@') {
                    // String(a)[b] (char)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a[b]);
                } else if(build == '$[]') {
                    // [... String(a)] (split-up)
                    a = stack.pop();
                    stack.push(... String(a));
                } else if(build == '$_') {
                    // String(a).length (size)
                    a = stack.pop();
                    stack.push(len(a));
                } else if(build == '$E') {
                    // string somatorium
                    let sum = '';
                    while(len(stack) > 0) {
                        sum += String(stack.shift());
                    };
                    stack.push(sum);
                  
                // Sensing & Properties
                } else if(build == 'x') {
                    // position x
                    stack.push(this.x);
                } else if(build == 'velX') {
                    // velocity x
                    stack.push(this.velX);
                } else if(build == 'y') {
                    // position y
                    stack.push(this.y);
                } else if(build == 'velY') {
                    // velocity y
                    stack.push(this.velY);
                } else if(build == 'a') {
                    // angle/direction
                    stack.push(this.a);
                } else if(build == 'velA') {
                    // angular velocity
                    stack.push(this.velA);
                } else if(build == 'mouseX') {
                    // cursor x
                    stack.push(mTransX);
                } else if(build == 'mouseY') {
                    // cursor y
                    stack.push(mTransY);
                } else if(build == 'mouseState') {
                    // cursor state
                    stack.push(mouseState);
                } else if(build == 'size') {
                    // size/radius
                    stack.push(this.size);
                } else if(build == 'penR') {
                    // pen color red channel
                    stack.push(this.penColor[0]);
                } else if(build == 'penG') {
                    // pen color red channel
                    stack.push(this.penColor[1]);
                } else if(build == 'penB') {
                    // pen color red channel
                    stack.push(this.penColor[2]);
                } else if(build == 'penW') {
                    // pen width
                    stack.push(this.penWidth);
                } else if(build == 'line') {
                    // Current Line
                    stack.push(this.pPos);
                  
                // Memory
                } else if(build == '@') {
                    // mem[a] (read operator)
                    a = stack.pop();
                    stack.push(this.mem[a]);
                } else if(build[0] == '@') {
                    // mem[a] (compact read syntax)
                    let value = build.split('@')[len(build.split('@'))-1];
                    while(build[0] == '@') {
                        build = build.slice(1);
                        value = this.mem[value];
                    };
                    stack.push(value);

                // Binds
                } else if(build in this.binds) {
                    // Bind (function)
                    if(count+1 >= len(txt)) {
                        txt = txt.slice(0, count+1) + this.binds[build] + txt.slice(count+1, len(txt));
                    } else {
                        txt = txt.slice(0, count+1) + this.binds[build] + txt.slice(count, len(txt));
                    };

                // Comparison
                } else if(build == '=') {
                    // a==b (equal)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a == b);
                } else if(build == '!=') {
                    // a!+b (unequal)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a != b);
                } else if(build == '>') {
                    // a>b (greater)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a > b);
                } else if(build == '<') {
                    // a<b (lesser)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a < b);
                } else if(build == '>=') {
                    // a>=b (greater or equal)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a >= b);
                } else if(build == '<=') {
                    // a<=b (lesser or equal)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a <= b);

                // Boolean Math
                } else if(build == 'not') {
                    // !a (not)
                    a = stack.pop();
                    stack.push(!a);
                } else if(build == 'and') {
                    // a&&b (and)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a && b);
                } else if(build == 'or') {
                    // a||b (or)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a || b);

                // Custom Operations
                } else if(build == ':') {
                    // duplicate
                    b = stack.pop();
                    a = stack.pop();
                    for(let i=0; i<Math.abs(b); i++) {
                        stack.push(a);
                    };
                } else if(build == '_') {
                    // stack.length (stack size)
                    a = len(stack);
                    stack.push(a);
                } else if(build == '^') {
                    // move to top
                    a = stack.pop();
                    stack.push(stack.splice(a, 1));
                } else if(build == '?') {
                    // a?b:c (ternary)
                    c = stack.pop();
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a?b:c);
                  
                // Misc Math Operators
                } else if(build == 'E') {
                    // number somatorium
                    let sum = 0;
                    while(len(stack) > 0) {
                        sum += parseFloat(stack.shift());
                    };
                    stack.push(sum);
                } else if(build == 'min') {
                    // min(a,b) (min)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(Math.min(a, b));
                } else if(build == 'max') {
                    // max(a,b) (max)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(Math.max(a, b));
                } else if(build == 'abs') {
                    // abs(a) (abs)
                    a = stack.pop();
                    stack.push(Math.abs(a));
                } else if(build == 'sign') {
                    // sign(a) (sign)
                    a = stack.pop();
                    stack.push(Math.sign(a));
                } else if(build == 'round') {
                    // round(a) (round)
                    a = stack.pop();
                    stack.push(Math.round(a));
                } else if(build == 'floor') {
                    // floor(a) (round down)
                    a = stack.pop();
                    stack.push(Math.floor(a));
                } else if(build == 'ceil') {
                    // ceiling(a) (round up)
                    a = stack.pop();
                    stack.push(Math.ceil(a));
                } else if(build == 'lerp') {
                    // lerp(a, b, c) (lerp)
                    c = stack.pop();
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(lerp(a, b, c));
                } else if(build == 'invlerp') {
                    // invLerp(a, b, c) (inverse lerp)
                    c = stack.pop();
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(invLerp(a, b, c));

                // Trigonometry & Geometry
                } else if(build[0] == 'º') {
                    // angle in degrees
                    stack.push(Math.PI*(build.split('º')[1]/180));
                } else if(build == 'tau' || build == 'pi2') {
                    // constant TAU (360º)
                    stack.push(Math.PI*2);
                } else if(build == 'pi') {
                    // constant PI (180°)
                    stack.push(Math.PI);
                } else if(build == 'rad') {
                    // degrees to radians
                    stack.push(Math.PI*(stack.pop()/180));
                } else if(build == 'deg') {
                    // radians to degrees
                    stack.push(180*(stack.pop()/Math.PI));
                } else if(build == 'cos') {
                    // cos(a) (cos)
                    a = stack.pop();
                    stack.push(Math.cos(a));
                } else if(build == 'sin') {
                    // sin(a) (sin)
                    a = stack.pop();
                    stack.push(Math.sin(a));
                } else if(build == 'tan') {
                    // tan(a) (tan)
                    a = stack.pop();
                    stack.push(Math.atan(a));
                } else if(build == 'atan2') {
                    // atan2(a, b) (atan2 a=x b=y)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(Math.atan2(b, a));
                } else if(build == 'geo') {
                    // sqrt(a²+b²) (geometric average)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(Math.sqrt(a**2 + b**2));
                  
                // Numbers & Their Operators
                } else if(build == '#') {
                    // parseFloat() (number-ify)
                    a = stack.pop();
                    stack.push(parseFloat(a));
                } else if(build == '+') {
                    // a+b (add)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a + b);
                } else if(build == '-+') {
                    // a-b (subtract)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a - b);
                } else if(build == '-') {
                    // 0-a (negate)
                    a = stack.pop();
                    stack.push(-1 * a);
                } else if(build == '*') {
                    // a*b (multiply)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a * b);
                } else if(build == '/*') {
                    // a/b (divide)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a / b);
                } else if(build == '/') {
                    // 1/a (invert)
                    a = stack.pop();
                    stack.push(1 / a);
                } else if(build == '%') {
                    // a%b (remainder)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a % b);
                } else if(build == '**') {
                    // a^b (power)
                    b = stack.pop();
                    a = stack.pop();
                    stack.push(a ** b);
                } else {
                    // a (push into stack)
                    stack.push(parseFloat(build));
                };
                build = '';
            } else {
                if(char != ' ' || isString == 1) {
                    build = build + char;
                };
            };

            if(!len(stack) == 0 && (stack[len(stack)-1] == null || stack[len(stack)-1] == NaN || stack[len(stack)-1] == undefined)) {
                throw(stack[len(stack)-1]);
            };

            count += 1;
        };

        return index==-1?stack:stack[index];
    };
    newPaintSequence (r, g, b, w) {
        // New Sequence
        paint.push([]);
        this.paintIndex = len(paint)-1;
        // Sequence Info
        paint[this.paintIndex].push([r, g, b]);
        paint[this.paintIndex].push([this.x, this.y]);
        paint[this.paintIndex].push([Math.min(w, this.size/2)]);
        
        this.penColor = [r, g, b];
        this.penWidth = w;
    };
    execute (code, terminal=false) {
        let gotoNextLine = true;
        // Executes Formatted List Item
        if(code[0] == 'move') {
            // Move Polar Cooord
            this.velX += Math.cos(this.a) * this.calculate(code[1]);
            this.velY += Math.sin(this.a) * this.calculate(code[1]);
        } else if(code[0] == 'strafe') {
            // Move Vector Coord
            this.velX += this.calculate(code[1]);
            this.velY += this.calculate(code[2]);
        } else if(code[0] == 'movePos') {
            // Change Pos (Polar Coord)
            this.x += Math.cos(this.a) * this.calculate(code[1]);
            this.y += Math.sin(this.a) * this.calculate(code[1]);
            this.oldX = this.x;
            this.oldY = this.y;
        } else if(code[0] == 'strafePos') {
            // Change Pos (Vector Coord)
            this.x += this.calculate(code[1]);
            this.y += this.calculate(code[2]);
            this.oldX = this.x;
            this.oldY = this.y;
        } else if(code[0] == 'point') {
            // Point in Angle
            this.a = this.calculate(code[1]);
            this.oldA = this.a;
        } else if(code[0] == 'rotate') {
            // Rotate Angle
            this.velA += this.calculate(code[1]);
        } else if(code[0] == 'print') {
            // Print to console
            for(let p in code) {
                if(p > 0) {console.log(this.calculate(code[p], -1));};
            };
        } else if(code[0] == 'output') {
            // Display as Text
            this.output = this.calculate(code[1]);
        } else if(code[0] == 'pen-new') {
            // Forces New Sequence
            this.newPaintSequence(this.calculate(code[1]), this.calculate(code[2]), this.calculate(code[3]), this.calculate(code[4]));
        } else if(code[0] == 'pen-add') {
            if(this.paintIndex == -1) {
                // New Sequence if there None
                this.newPaintSequence(this.penColor[0], this.penColor[1], this.penColor[2], this.penWidth);
            } else {
                // Adds a Line
                paint[this.paintIndex].push([this.x, this.y]);
            };
        } else if(code[0] == 'pen-color') {
            if(this.paintIndex == -1) {
                // New Sequence if there None
                this.newPaintSequence(this.calculate(code[1]), this.calculate(code[2]), this.calculate(code[3]), this.penWidth);
            } else {
                // Sets Color
                paint[this.paintIndex].push([this.calculate(code[1]), this.calculate(code[2]), this.calculate(code[3])]);
            };
            this.penColor = [this.calculate(code[1]), this.calculate(code[2]), this.calculate(code[3])];
        } else if(code[0] == 'pen-width') {
            if(this.paintIndex == -1) {
                // New Sequence if there None
                this.newPaintSequence(this.penColor[0], this.penColor[1], this.penColor[2], Math.min(this.calculate(code[1]), this.size/2));
            } else {
                // Sets Width
                paint[this.paintIndex].push([Math.min(this.calculate(code[1]), this.size/2)]);
            };
            this.penWidth = this.calculate(code[1]);
        } else if(code[0] == 'write') {
            // Write Value to Mem Adresses
            let value = this.calculate(code[1]);
            for(let p in code) {
                if(p > 1) {this.mem[this.calculate(code[p])] = value};
            };
        } else if(code[0] == 'bind') {
            // Create Bind(s) to Procedure
            let value = code[1];
            for(let p in code) {
                if(p > 1) {this.binds['.'+code[p]] = value};
            };
        } else if(code[0] == 'jump') {
            // Jump to Line
            this.pPos = this.calculate(code[1]);
            gotoNextLine = false;
        } else if(code[0] == 'if-jump') {
            // Jump to Line if Condition
            if(this.calculate(code[1])) {
                this.pPos = this.calculate(code[2]);
                gotoNextLine = false;
            };
        };
        // Increment Pointer (only if no jumps, and if not called by a terminal)
        if(!terminal && gotoNextLine) {
            this.pPos += 1;
            this.pPos = this.pPos+1>len(this.code)?0:this.pPos;
        };
    };
    process () {
        // Timer
        this.pTimer += this.output=='!!!'?0:(this.pSpeed*timeScale);
        // If Timer Expired, Move Pointer, Execute Instruction and Reset Timer
        while(this.pTimer >= 1) {
            // Execute Current Instruction
            this.execute(this.code[this.pPos]);
            // Resets Timer
            this.pTimer -= 1;
        };
    };
    render () {
        // Body
        circle(xToCam(this.x), yToCam(this.y), this.size*camZoom, 'rgb(75, 75, 100, 0.8)');
        // Angle
        ctx.beginPath();
        ctx.lineWidth = this.size*0.2*camZoom;
        ctx.strokeStyle = 'rgb(75, 75, 100, 0.9)';
        ctx.moveTo(xToCam(this.x), yToCam(this.y));
        ctx.lineTo(xToCam(this.x + Math.cos(this.a)*this.size), yToCam(this.y + Math.sin(this.a)*this.size));
        ctx.stroke();
        // Output Box
        ctx.beginPath();
        ctx.fillStyle = 'rgb(255, 255, 255, 0.3)';
        ctx.rect(xToCam(this.x-this.size*0.75), yToCam(this.y-this.size/3), this.size*camZoom*1.5, this.size*camZoom/1.5);
        ctx.fill();
        // Output Text
        ctx.beginPath();
        ctx.fillStyle = this.output=='!!!'?'rgb(200, 00, 0, 1)':'black';
        ctx.font = this.size*camZoom*0.6+'px "Lucida Console", "Courier New", monospace';
        ctx.textAlign = 'center';
        let outputTxt = String(this.output);
        let lastCharExtraFrames = 1;
        let sliceStart = Math.min(Math.floor(frame/15)%Math.max(len(outputTxt)-(3-lastCharExtraFrames), 1), len(outputTxt)-4);
        outputTxt = outputTxt.slice(Math.max(sliceStart, 0), sliceStart+4);
        ctx.fillText(outputTxt, xToCam(this.x), yToCam(this.y+this.size*0.2));
    };
};