// Debugging
let debug = '';
function log(txt, breakLine=true, update=true, log2Console=false) {
	debug = debug + txt;
	if(breakLine) {debug = debug + '<br>';};
	if(update && HTMLconsoleVisible) {document.getElementById('debug').innerHTML = debug;};
	if(log2Console) {console.log(txt);};
};

// General functions
function range (start, end) {
    if(end <= 0) {
        return [];
    };
    return [...Array(end).keys()];
};
function len(array) {
    return array.length;
};
function tutorialPopup () {
    window.alert(`
    || Welcome to Micro Sim. -- Bem Vindo ao Micro Simulador ||
    WASD to Move Camera -- WASD para Mover a Camera
    Space to Pause -- Espaço para Pausar
    Mouse to Grab -- Mouse para Segurar
    Q and E to Zoom -- Q e E para Zoom
    R to Reprogram -- R para Reprogramar
    T to Execute Command -- T para Executar Comando
    F to Clear Paint -- F para Limpar a Tinta
    Z to Remove All -- Z para Remover Tudo
    X to Delete Selected -- X para Deletar Selecionado
    C to Copy Selected -- C para Copiar Selecionado
    V to Paste Copy -- V para Colar Copia
    B to Reset Camera -- B para Resetar a Camera
    N for continuous Slider -- N para Slider Continuo
    1 to Spawn Food -- 1 para Spawnar Comida
    2 to Spawn Cell -- 2 para Spawnar Célula
    3 to Spawn Robot (12, 4, 0.1) -- 2 para Spawnar Robô (12, 4, 0.1)
    3+C to Spawn a Custom Robot -- 3+C para Spawnar Robô Customizado
    4 to Spawn Object -- 4 para Spawnar Objeto
    H for Help Menu -- H para Menu de Ajuda
    G for Microlang Doc -- G para Documentação do Microlang
    P to Toggle Optimization -- P para dar Toggle nas Otimizações
    0 for Fullscreen -- 0 para Tela Cheia
    `);
};

// Geometry and Math functions
function sort (array) {
    let originalLen = len(array);
    let sorted = array;
    let otherCount = 0;
    let count = 0;
    while(count < originalLen) {
        current = array[count];
        for(otherCount in array) {
            if(sorted[otherCount] >= current) {
                break;
            };
        };
        sorted.splice(count, 1);
        sorted.splice(otherCount, 0, current);
        count = parseInt(count) + 1;
    };
    return sorted;
};
function arrayAnd (arrA, arrB) {
    // Get Intersection
    let intersection = arrA.filter(x => arrB.includes(x));
    // Remove Repeats
    return [...new Set(intersection)];
};
function lerp (n, min=0, max=1) {
    return min*(1-n) + max*(n);
};
function invLerp (n, min=0, max=1) {
    return (n-min)/(max-min);
};
function average (array) {
    let toReturn = 0;
    for(let i in array) {
        toReturn = toReturn + parseInt(array[i]);
    };
    return toReturn/len(array);
};
function pointTowards (p1, p2) {
    // P1 is self, P2 is target.
    return Math.atan2( (p2[0] - p1[0]), (p2[1] - p1[1]) );
};
function distance (p1, p2) {
    // P1 is self, P2 is target.
    return Math.sqrt((p1[0] - p2[0])**2 + (p1[1]-p2[1])**2);
};
function angleFix (a) {
    // 180-180 to 360
    let toReturn = a%(Math.PI*2);
    if(toReturn < 0) {
        toReturn += (Math.PI*2);
    };
    return toReturn;
};
function angleMod (a) {
    return angleFix(pointTowards([0, 0], [Math.sin(a), Math.cos(a)]));
};
function angleStuff (a1, a2) {
    let toReturn = 0;
    let a360 = Math.PI*2;
    //let answers = [Math.abs((a1-a360)-a2), Math.abs(a1-(a2-a360))];
    if(Math.abs((a1-a360)-a2) < Math.abs(a1-a2)) {
        toReturn = (a1-a360)-a2;
    } else if(Math.abs(a1-(a2-a360)) < Math.abs(a1-a2)) {
        toReturn = a1 - (a2-a360);
    } else {
        toReturn = a1 - a2;
    };
    return toReturn;
};


// Console HTML DiV Element
let HTMLdivElement = `
		<div class="debug">
            eval(<input placeholder="insert code here..." id="cheatInput" onchange="eval(document.getElementById('cheatInput').value);document.getElementById('cheatInput').value='';"></input>);
			<pre id="debug"></pre>
		</div>
`;
let HTMLconsoleVisible = false;
// Screen Vars
let screen = document.getElementById('screen');
//screen.width = document.body.clientWidth;
//screen.height = document.body.clientHeight;
let screenWidth = screen.width;
let screenHeight = screen.height;
let screenX = screen.getBoundingClientRect().left;
let screenY = screen.getBoundingClientRect().top;
let ctx = screen.getContext("2d");
// FPS & Time Variables
let timeScale = 1;
let timeScaleMult = 1;
let FPS_average = 0;
let FPS_sample = [];
let lastTime = 0;
let frame = 0;
// Mouse vars
let oldMouseX = 0;
let oldMouseY = 0;
let mouseX = 0;
let mouseY = 0;
let mouseOffsetX = 0;
let mouseOffsetY = 0;
let mouseState = 0;
let mTransX = 0;
let mTransY = 0;
let closestObjectToMouseDistance = -1;
let closestObjectToMouseId = -1;
// Keyboard vars
let kbKeys = {};
let paused = 0;
// Selection
let actionType = 'none';
let selected = -1;
let copyPaste = -1;
// Camera vars
let camX = 0;
let camY = 0;
let camZoom = 1;
let camVelX = 0;
let camVelY = 0;
let camVelZoom = 0;
// Environment
let foodCap = 100;
let cellCap = 50;
let dishShape = !0?'circle':'square';
let dishSize = 400;
let dishThickness = dishSize/20;
let foodDecayRate = 1/5;
let foodSpawnRate = 5;
let foodSpawnAmount = 25;
// objects
let objectIndexesToRemove = [];
let objectsToPush = [];
let gIdHighest = 0;
let amountOfFood = 0;
let amountOfCells = 0;
let objects = [];
let oldObjects = [];
let toRender = [];
let intersections = [];
// paint
let paint = [];
// elements
let elements = [];
// Settings
let noSweepNPrune = 0;
// Constants
let codonColors = {
    '-': 'rgb(80, 80, 80, 1)',
   'rc': 'rgb(60, 0, 180, 1)',
   'rr': 'rgb(180, 0, 60, 1)',
   'm': 'rgb(240, 0, 0, 1)',
   'f': 'rgb(0, 120, 120, 1)',
   '+': 'rgb(60, 180, 0, 1)'
};
let codons = [
   '-',
   'rc',
   'rr',
   'm',
   'f',
   '+'
];

// Drawing/screen functions
function resizeCanvas () {
    let WHICH = 2;
    if(WHICH == 1) {
        screen.width = HTMLconsoleVisible?800:document.body.clientWidth;
        screen.height = HTMLconsoleVisible?450:document.body.clientHeight;
    } else if(WHICH == 2) {
        screen.width = HTMLconsoleVisible?800:document.documentElement.clientWidth - 4;
        screen.height = HTMLconsoleVisible?450:document.documentElement.clientHeight - 4;
    } else if(WHICH == 3) {
        screen.width = HTMLconsoleVisible?800:window.innerWidth;
        screen.height = HTMLconsoleVisible?450:window.innerHeight;
    };
    screenWidth = screen.width;
    screenHeight = screen.height;
    document.getElementById('debugdiv').innerHTML = HTMLconsoleVisible?HTMLdivElement:'';
};

function circle (x, y, radius, color=null) {
    ctx.beginPath();
    if(color != null) {
        ctx.fillStyle = color;
    };
    ctx.arc(x, y, radius, 0, Math.PI*2);
    ctx.fill();
};

function xyToCam (x, y) {
    return [(x-camX)*camZoom, (y-camY)*camZoom];
};

function xToCam (x) {
    return ((x-camX)*camZoom) + screenWidth/2;
};

function yToCam (y) {
    return ((y-camY)*camZoom) + screenHeight/2;
};

function camToX (x) {
    return (((x - screenWidth/2)/camZoom)+camX);
};

function camToY (y) {
    return (((y - screenHeight/2)/camZoom)+camY);
};

function clearScreen () {
    ctx.clearRect(0, 0, screen.width, screen.height);
    ctx.beginPath();
};

function report () {
    log("Unoptimized: " + (len(objects)**2));
    n = 0;
    for(i in intersections) {
        n += (len(intersections[i])**2);
    };
    log("Sweep n' Prune: " + n);
    log("Reality: " + len(objects));
    log("Equivalent: " + Math.round(Math.sqrt(n)));
    log("Improvement: " + Math.round( ( 1 - ( n / len(objects)**2 ) ) * 1000 )/10 + '%');
};

// Misc Functions
function resetSelected () {
    // Reset Selection Vars
    actionType = 'none';
    selected = -1;
    closestObjectToMouseId = -1;
    // Reset Mouse Offset
    mouseOffsetX = 0;
    mouseOffsetY = 0;
};
function isKeyDown (k) {
    if(!(k in kbKeys)) {
        kbKeys[k] = 0;
    };
    return kbKeys[k];
};
function updateMouse (event) {
    screenX = screen.getBoundingClientRect().left;
    screenY = screen.getBoundingClientRect().top;
    mouseX = event.clientX - screenX;
    mouseY = event.clientY - screenY;
};
function findElement (label) {
    for(let countElement in elements) {
        if(elements[countElement].label == label) {
            return countElement;
        };
    };
};

// Main Loop Function
function main (time) {
    // FPS and Delta Time
    timeScale = 60/(1/(time - lastTime)*1000);
    FPS_sample.push(time - lastTime);
    lastTime = time;
    if(len(FPS_sample)>29) {
        FPS_average = 1/(average(FPS_sample)/1000);
        FPS_sample = [];
    };
    // Debug Clear
    debug = '';
    // If Selected Stack Doesn't Exist, Unselect
    if(selected > len(objects)-1) {resetSelected();};
    // Mouse Position Translated into World Position
    mTransX = camToX(mouseX);
    mTransY = camToY(mouseY);
    // Panning
    if(actionType != 'pan') {
        oldMouseX = mTransX;
        oldMouseY = mTransY;
        // Keyboard Cam Movement (Only if not panning)
        camVelX += (2/camZoom) * (isKeyDown('d') - isKeyDown('a'));
        camVelY += (2/camZoom) * (isKeyDown('s') - isKeyDown('w'));
    };
    // Keyboard Cam Movement
    camVelZoom += (camZoom/200) * (isKeyDown('q') - isKeyDown('e'));
    // Add Zoom Velocty
    camZoom += camVelZoom * timeScale;
    // Cap camZoom
    camZoom = Math.max(Math.min(camZoom, 20), 0.2);
    // Camera Panning
    camX = oldMouseX - ((mouseX - screenWidth/2)/camZoom);
    camY =  oldMouseY - ((mouseY - screenHeight/2)/camZoom);
    //  Add Camera Velocity
    camX += camVelX * timeScale;
    camY += camVelY * timeScale;
    // Apply Friction
    camVelZoom = camVelZoom / 1.2 ** timeScale;
    camVelX = camVelX / 1.2 ** timeScale;
    camVelY = camVelY / 1.2 ** timeScale;

    // Apply Timescale Multiplier
    timeScale *= timeScaleMult

    // Clear Screen
    toRender = [];
    clearScreen();

    // Dot at (0, 0)
    circle(xToCam(0), yToCam(0), 5*camZoom, 'grey');

    // Actions
    if(mouseState && actionType == 'none') {
        if(closestObjectToMouseId != -1) {
            objects.sort(function(a, b) {
                return a.id - b.id;
            });
            selected = closestObjectToMouseId;
            mouseOffsetX = mTransX - objects[selected].x;
            mouseOffsetY = mTransY - objects[selected].y;
            actionType = 'grab';
        } else {
            actionType = 'pan';
        };
    } else if(actionType == 'grab') {
        objects.sort(function(a, b) {
            return a.id - b.id;
        });
        objects[selected].size = Math.min(objects[selected].size+(isKeyDown('f')-isKeyDown('g'))*2, dishSize*0.8);
        let d = distance([0, 0], [mouseOffsetX, mouseOffsetY]) - objects[selected].size;
        if(d > 0) {
            mouseOffsetX -= Math.cos(pointTowards([0, 0], [mouseOffsetY, mouseOffsetX])) * d;
            mouseOffsetY -= Math.sin(pointTowards([0, 0], [mouseOffsetY, mouseOffsetX])) * d;
        };
        objects[selected].x += (mTransX - mouseOffsetX - objects[selected].x)/10;
        objects[selected].y += (mTransY - mouseOffsetY - objects[selected].y)/10;
        if(paused) {
            objects[selected].oldX = objects[selected].x;
            objects[selected].oldY = objects[selected].y;
        };
        if(objects[selected].size <= 0) {
            objects[selected].die();
        };
    } else if(actionType == 'flick') {
        objects[selected].velX = 0;
        objects[selected].velY = 0;
        if(!isKeyDown('n')) {
            objects[selected].velX += (objects[selected].x - mTransX)/10;
            objects[selected].velY += (objects[selected].y - mTransY)/10;
            actionType = 'wait';
            selected = -1;
        };
    };
    closestObjectToMouseId = -1;
    closestObjectToMouseDistance = -1;

    // Make Inside of Petridish White
    if(dishShape == 'circle') {
        circle(xToCam(0), yToCam(0), dishSize*camZoom, 'white')
    } else {
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.fillRect(xToCam(0-dishSize), yToCam(0-dishSize), dishSize*2*camZoom, dishSize*2*camZoom)
    };

    // Objects
    objects.sort(function(a, b) {
        return a.x - b.x;
    });
    for(let countObject in objects) {
        objects[countObject].index = parseInt(countObject);
    }; 
    oldObjects = structuredClone(objects);
    let leftMost = 0;
    let rightMost = 0;
    // Sweep N' Prune by Finding X Axis Intersections
    intersections = [[]];
    for(let countObject in objects) {
        if(!objects[countObject].layers.includes(1)) {
            intersections[0].push([countObject]);
            continue;
        };
        // Current Object X Position
        let x = objects[countObject].x;
        // Current Object Radius
        let size = objects[countObject].size;
        if(len(intersections) == 0) {
            intersections.push([countObject]);
            leftMost = x - size;
            rightMost = x + size;
            continue;
        };
        if(x + size >= leftMost &&
        x - size <= rightMost) {
            intersections[len(intersections)-1].push(countObject);
            if(x - size < leftMost) {
                leftMost = x - size;
            };
            if(x + size > rightMost) {
                rightMost = x + size;
            };
        } else {
            intersections.push([countObject]);
            leftMost = x - size;
            rightMost = x + size;
        };
    };
    // Physics Initial Step
    for(let countObject in objects) {
        if(!paused) {objects[countObject].physicsStart();};
    };
    // Physics Final Step
    for(let countObject in objects) {
        if(!paused) {objects[countObject].physicsEnd();};
    };
    // Non-Physics Related Logic
    for(let countObject in objects) {
        if(!paused) {
            try {
                objects[countObject].process();
            } catch {
                objects[countObject].output = '!!!';
            };
        };
    };
    // Render Paint
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for(let countSequence in paint) {
        if(len(paint[countSequence]) > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgb('+paint[countSequence][0][0]+','+paint[countSequence][0][1]+','+paint[countSequence][0][2]+', 0.3)';
            ctx.moveTo(xToCam(paint[countSequence][1][0]), yToCam(paint[countSequence][1][1]));
            ctx.lineWidth = paint[countSequence][2][0]*camZoom;
            for(let countLine in paint[countSequence]) {
                if(countLine <= 2) {continue;};
                if(len(paint[countSequence][countLine]) == 3) {
                    ctx.strokeStyle = 'rgb('+paint[countSequence][countLine][0]+','+paint[countSequence][countLine][1]+','+paint[countSequence][countLine][2]+', 0.3)';
                } else if(len(paint[countSequence][countLine]) == 2) {
                    ctx.lineTo(xToCam(paint[countSequence][countLine][0]), yToCam(paint[countSequence][countLine][1]));
                } else if(len(paint[countSequence][countLine]) == 1) {
                    ctx.lineWidth = paint[countSequence][countLine][0]*camZoom;
                };
            };
            ctx.stroke();
        };
    };
    ctx.lineJoin = 'miter';
    ctx.lineCap = 'butt';
    // Rendering
    amountOfFood = 0;
    amountOfCells = 0;
    for(let countObject in objects) {
        while(objects[countObject].zIndex > len(toRender)-1) {
            toRender.push([]);
        };
        toRender[objects[countObject].zIndex].push(objects[countObject]);
        objects[countObject].updateClosestObjectToMouse();
    };
    toRender.reverse();
    for(let countLayer in toRender) {
        for(let countObject in toRender[countLayer]) {
            toRender[countLayer][countObject].render();
        };
    };

    // Sort Objects by ID
    objects.sort(function(a, b) {
        return a.id - b.id;
    });
    for(let countObject in objects) {
        objects[countObject].index = parseInt(countObject);
    };

    // Objects to Remove
    while(len(objectIndexesToRemove) > 0) {
        // Update Other Object's ID
        if(selected == objects[objectIndexesToRemove[0]].id) {
            resetSelected();
            actionType = 'wait';
        };
        for(let countObject in objects) {
            if(objects[countObject].id > objects[objectIndexesToRemove[0]].id) {
                objects[countObject].id -= 1;
            };
        };
        if(selected > objects[objectIndexesToRemove[0]].id) {
            selected -= 1;
        };
        for(let objectIndexToRemoveCount in objectIndexesToRemove) {
            if(objectIndexesToRemove[objectIndexToRemoveCount] > objectIndexesToRemove[0]) {
                objectIndexesToRemove[objectIndexToRemoveCount] -= 1;
            };
        };
        // Remove Object
        objects.splice(objectIndexesToRemove[0], 1);
        // "Increment" "Counter"
        objectIndexesToRemove.shift()
    };

    // Spawn Food
    if(frame%foodSpawnRate == 0 && amountOfFood < foodCap && !paused) {
        for(let loop in range(0, foodSpawnAmount)) {
            if(!((amountOfFood+parseInt(loop)+1) < foodCap)) {break;};
            objects.push(new food(Math.cos(Math.random()*Math.PI*2)*Math.random()*dishSize, Math.sin(Math.random()*Math.PI*2)*Math.random()*dishSize));
        };
    };

    // World Border
    if(dishShape == 'circle') {
        ctx.beginPath();
        ctx.strokeStyle = 'grey';
        ctx.lineWidth = dishThickness*camZoom;
        ctx.arc(xToCam(0), yToCam(0), dishSize*camZoom, 0, Math.PI*2);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.strokeStyle = 'grey';
        ctx.lineWidth = dishThickness*camZoom;
        ctx.strokeRect(xToCam(0-dishSize), yToCam(0-dishSize), dishSize*2*camZoom, dishSize*2*camZoom);
    };

    // Outline for grabbed Object
    if(actionType == 'grab') {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.arc(xToCam(objects[selected].x), yToCam(objects[selected].y), objects[selected].size*camZoom+5, 0, Math.PI*2);
        ctx.stroke();
    } else if(actionType == 'flick') {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 10*camZoom;
        ctx.strokeStyle = 'rgb(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(xToCam(objects[selected].x), yToCam(objects[selected].y))
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'butt';
    } else if(actionType == 'pan') {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.arc(mouseX, mouseY, 10, 0, Math.PI*2);
        ctx.stroke();
    };

    // Cursor
    if(selected == -1) {circle(mouseX, mouseY, 5, 'black');};

    // Physical Text
    ctx.fillStyle = 'black';
    ctx.font = (24*camZoom)+'px "Lucida Console", "Courier New", monospace';
    ctx.textAlign = 'left';
    // Show Info about Selected Object
    elements[findElement('code')].hide = true;
    if(selected != -1) {
        if(objects[selected].objType == 'cell') {
            // Info for Cell
            ctx.fillText('Type '+objects[selected].objType, xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*-2.25)));
            ctx.fillText('Size '+Math.round(objects[selected].size*10)/10, xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*-1.25)));
            ctx.fillText('Gene ', xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*-0.25)));
            ctx.fillText(Math.round(objects[selected].gPointerTimerStart), xToCam(objects[selected].x+objects[selected].size+110), yToCam(objects[selected].y+(25*-0.25)));
            // Render Genetic Sequence
            circle(xToCam(objects[selected].x+objects[selected].size+95), yToCam(objects[selected].y+(25*-0.5)), 13.5*camZoom, 'black')
            ctx.lineWidth = (0.15)*camZoom;
            for(let countCodon in objects[selected].gSequence) {
                let a = Math.PI*2*(countCodon/len(objects[selected].gSequence));
                ctx.beginPath();
                ctx.fillStyle = codonColors[objects[selected].gSequence[countCodon]];
                ctx.arc(xToCam(objects[selected].x+objects[selected].size+95), yToCam(objects[selected].y+(25*-0.5)), 12*camZoom, a, a+Math.PI*2/len(objects[selected].gSequence));
                ctx.lineTo(xToCam(objects[selected].x+objects[selected].size+95), yToCam(objects[selected].y+(25*-0.5)));
                ctx.fill();
            };
            let a = Math.PI*2*(objects[selected].gPointer/len(objects[selected].gSequence));
            ctx.beginPath();
            ctx.fillStyle = 'rgb(255, 255, 255, '+lerp(objects[selected].gPointerTimer/objects[selected].gPointerTimerStart, 0.2, 0.6)+')';
            ctx.arc(xToCam(objects[selected].x+objects[selected].size+95), yToCam(objects[selected].y+(25*-0.5)), 12*camZoom, a, a+Math.PI*2/len(objects[selected].gSequence));
            ctx.lineTo(xToCam(objects[selected].x+objects[selected].size+95), yToCam(objects[selected].y+(25*-0.5)));
            ctx.fill();
            // Energy, Membrane and Age %
            ctx.fillStyle = 'black';
            ctx.fillText('Energy '+Math.round(100*objects[selected].energy/objects[selected].size)+'%', xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*0.75)));
            ctx.fillText('Shell '+Math.round(100*(objects[selected].membrane-1)/(objects[selected].size-2)*2)+'%', xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*1.75)));
            ctx.fillText('Age '+Math.round(100*objects[selected].age/objects[selected].size/20)+'%', xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*2.75)));
        } else if(objects[selected].objType == 'robot') {
            // Info for Robots
            ctx.fillText('Type microbot', xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*-0.25)));
            ctx.fillText('Size '+Math.round(objects[selected].size*10)/10, xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*0.75)));

            elements[findElement('code')].txt = [];
            elements[findElement('code')].txt.push('cLen='+len(objects[selected].code)+' mLen='+len(objects[selected].mem)+ ' pSpeed='+objects[selected].pSpeed);
            let mem = structuredClone(objects[selected].mem);
            for(let countCell in mem) {
                mem[countCell] = typeof(mem[countCell])=='string'?'"'+mem[countCell]+'"':mem[countCell];
                mem[countCell] = len(String(mem[countCell]))>9?String(mem[countCell]).slice(0, 8)+'…':mem[countCell];
            };
            elements[findElement('code')].txt.push(mem.join('⋯'));
            elements[findElement('code')].txt.push('');
            let longestLine = len(elements[findElement('code')].txt[0])>len(elements[findElement('code')].txt[1])?len(elements[findElement('code')].txt[0]):len(elements[findElement('code')].txt[1]);
            let lineAmount = 3;
            let currentLine = '';
            for(let line in objects[selected].codeTxt) {
                currentLine = objects[selected].codeTxt[line];
                currentLine = objects[selected].pPos==line?'▶'+currentLine:'▷'+currentLine;
                lineAmount += 1;
                elements[findElement('code')].txt.push(currentLine);
                if(len(currentLine) > longestLine) {
                    longestLine = len(currentLine);
                };
            };

            elements[findElement('code')].hide = false;
            elements[findElement('code')].width = longestLine*11;
            elements[findElement('code')].height = lineAmount*18;
            elements[findElement('code')].x = screenWidth - elements[findElement('code')].width/2;
            elements[findElement('code')].y =  elements[findElement('code')].height/2;        
            elements[findElement('code')].txtColor = objects[selected].output=='!!!'?'rgb(255, 100, 100, 1)':'rgb(100, 255, 100, 1)';
        } else {
            // Info for Objects
            ctx.fillText('Type '+objects[selected].objType, xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*-0.25)));
            ctx.fillText('Size '+Math.round(objects[selected].size*10)/10, xToCam(objects[selected].x+objects[selected].size+10), yToCam(objects[selected].y+(25*0.75)));
        };
    };
    // Display Copied Object
    if(copyPaste != -1 && (isKeyDown('c') || isKeyDown('v'))) {
        // Set copyPaste Pos to Mouse Po
        copyPaste.x = mTransX;
        copyPaste.y = mTransY;
        // Render copyPaste
        copyPaste.render();
        // Render Outline
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.arc(xToCam(copyPaste.x), yToCam(copyPaste.y), copyPaste.size*camZoom+5, 0, Math.PI*2);
        ctx.stroke();
    };

    // GUI Text
    ctx.fillStyle = 'black';
    ctx.font = '24px "Lucida Console", "Courier New", monospace';
    // Paused
    ctx.textAlign = 'center';
    ctx.font = '48px "Lucida Console", "Courier New", monospace';
    ctx.fillText(paused?'PAUSED':'', screenWidth/2, screenHeight/2);

    // Update Size of GUI Element "doc"
    elements[findElement('doc')].width = screenWidth;
    elements[findElement('doc')].height = screenHeight;
    elements[findElement('doc')].x = screenWidth/2;
    elements[findElement('doc')].y = screenHeight/2;
  
    // Update Text from GUI Element "info"
    elements[findElement('info')].x = elements[findElement('info')].width/2;
    elements[findElement('info')].y = elements[findElement('info')].height/2;
    elements[findElement('info')].txt[1] = noSweepNPrune?'Unoptimized':'Sweep&Prune';
    elements[findElement('info')].txt[2] = 'Cells'+' '.repeat(
    Math.max(14-len('Cells '+amountOfCells+'/'+cellCap), 0)
    )+amountOfCells+'/'+cellCap, 5, 20+(25*2);
    elements[findElement('info')].txt[3] = 'Food'+' '.repeat(
    Math.max(14-len('Food '+amountOfFood+'/'+foodCap), 0)
    )+amountOfFood+'/'+foodCap, 5, 20+(25*3);
    elements[findElement('info')].txt[4] = actionType;
    elements[findElement('info')].txt[5] = Math.round(FPS_average);
    
    // Show Sliders on Pause, Hide Otherwise
    elements[findElement('info')].height = paused?345:145;
    elements[findElement('dishSize')].hide = !paused;
    elements[findElement('cellCap')].hide = !paused;
    elements[findElement('foodCap')].hide = !paused;

    // Setting Sliders
    dishSize = elements[findElement('dishSize')].getSlideValue();
    dishThickness = dishSize/20;
    cellCap = Math.round(elements[findElement('cellCap')].getSlideValue());
    foodCap = Math.round(elements[findElement('foodCap')].getSlideValue());

    for(let countElement in elements) {
        elements[countElement].tick();
    };

    /*
    let energyInSystem = 0;
    for(let countObject in objects) {
        energyInSystem += Math.PI*objects[countObject].size**2 * Math.sqrt(objects[countObject].velX**2+objects[countObject].velY**2)
    };
    log(energyInSystem);
    */

    frame += 1;
    frame = frame * (frame < 9999);

    screenWidth = screen.width;
    screenHeight = screen.height;

    report();
    
    /*
    if(amountOfCells < 15 && amountOfCells+1<cellCap && !paused) {
        objects.push(new cell(Math.cos(Math.random()*Math.PI*2)*Math.random()*dishSize, Math.sin(Math.random()*Math.PI*2)*Math.random()*dishSize));
    };
    */
    requestAnimationFrame(main);
};

// User Input
window.addEventListener('click', (event) => {
});

window.addEventListener('contextmenu', (event) => {
});

window.addEventListener('keypress', (event) => {
});

window.onresize = () => {
    resizeCanvas();
};

window.addEventListener('keydown', (event) => {
    if(event.code == 'Space' && !isKeyDown('Space')) {
        paused = !paused;
    };
    if (event.key == 'z' && !isKeyDown('z')) {
        resetSelected();
        objects = [];
    };
    if(event.key == 'x' && selected != -1 && !isKeyDown('x')) {
        objects[selected].die();
    };
    if(event.key == 'c' && selected != -1 && !isKeyDown('c')) {
        copyPaste = objects[selected].clone();
    };
    if(event.key == 'v' && copyPaste != -1 && !isKeyDown('v')) {
        copyPaste.index = len(objects)-1;
        copyPaste.id = len(objects);
        copyPaste.x = mTransX;
        copyPaste.y = mTransY;
        copyPaste.oldX = copyPaste.x;
        copyPaste.oldY = copyPaste.y;
        objects.push(copyPaste);
        copyPaste = copyPaste.clone();
    };
    if(event.key == 'b' && !isKeyDown('b')) {
        camX = 0; camY = 0; camZoom = 1;
    };
    if(event.key == 'r' && selected != -1 && objects[selected].objType == 'robot' && !isKeyDown('r')) {
        // Add Line Numbers to codeTxt
        let codeTxt = structuredClone(objects[selected].codeTxt);
        for(let line in codeTxt) {
            codeTxt[line] = '0'.repeat( len(String(len(codeTxt)-1))-len(String(line)) )+line+'| '+codeTxt[line];
        };
        codeTxt = 'PROGRAM\n'+codeTxt.join('\n');

        let codeInsert = window.prompt(codeTxt+'\n\nInsert Code:');
        if(codeInsert != '' && codeInsert != undefined) {
            let codeLine = window.prompt(codeTxt+'\n\nInsert Line:');
            if(codeLine != '' && codeLine != undefined) {
                codeLine = parseInt(codeLine);
                objects[selected].compile(codeInsert, codeLine);
                objects[selected].pPos = 0;
                objects[selected].output = objects[selected].output=='!!!'?0:objects[selected].output;
            } else {
                alert('Cancelled!');
            };
        } else {
            alert('Cancelled!');
        };
    };
    if(event.key == 't' && selected != -1 && objects[selected].objType == 'robot' && !isKeyDown('t')) {
        // Add Line Numbers to memTxt
        let memTxt = structuredClone(objects[selected].mem);
        for(let cell in memTxt) {
            memTxt[cell] = typeof(memTxt[cell])=='string'?'"'+memTxt[cell]+'"':memTxt[cell];
            memTxt[cell] = '0'.repeat( len(String(len(memTxt)-1))-len(String(cell)) )+cell+'| '+memTxt[cell];
        };
        memTxt = 'MEMORY\n'+memTxt.join('\n');

        let codeInsert = window.prompt(memTxt+'\n\nInsert Code:');
        if(codeInsert != '' && codeInsert != undefined) {
            codeInsert = objects[selected].compile(codeInsert);
            for(let line in codeInsert) {
                objects[selected].execute(codeInsert[line], true);
            };
        } else {
            window.alert('Cancelled!');
        };
    };
    if (event.key == 'y' && !isKeyDown('y')) {
        paint = [];
        for(let countObject in objects) {
            if(objects[countObject].objType == 'robot') {
                objects[countObject].paintIndex = -1;
            };
        };
    };
    if(event.key == '1' && !isKeyDown('1')) {
        objects.push(new food(mTransX, mTransY));
    };
    if(event.key == '2' && !isKeyDown('2')) {
        objects.push(new cell(mTransX, mTransY));
    };
    if(event.key == '3' && !isKeyDown('3')) {
        if(isKeyDown('c')) {
            let cLen = parseInt(window.prompt('Insert Program Size:'))
            let mLen = parseInt(window.prompt('Insert Memory Size:'))
            let pSpeed = parseFloat(window.prompt('Insert Pointer Speed:'))
            if(cLen!='' && mLen!='' && pSpeed!='') {
                objects.push(new robot(mTransX, mTransY, 0, cLen, mLen, pSpeed));
            } else {
                window.alert('Cancelled!');
            };
        } else {
            objects.push(new robot(mTransX, mTransY));
        };
    };
    if(event.key == '4' && !isKeyDown('4')) {
        objects.push(new object(mTransX, mTransY));
    };
    if(event.key == 'n' && !isKeyDown('n') && actionType=='grab') {
        actionType = 'flick';
    };
    if(event.key == 'j' && !isKeyDown('j')) {
        if(elements[findElement('doc')].hide) {
            elements[findElement('doc')].data.stage = 0;
            elements[findElement('doc')].hide = false;
        } else if(elements[findElement('doc')].data.stage < len(this.data.stageTxt)-1) {
            elements[findElement('doc')].data.stage += 1;
        } else {
            elements[findElement('doc')].hide = true;
        };
    };
    if(event.key == 'h' && !isKeyDown('h')) {
        tutorialPopup();
    };
    if(event.key == 'p' && !isKeyDown('p')) {
        noSweepNPrune = !noSweepNPrune;
    };
    if(event.key == '0' && !isKeyDown('0')) {
        HTMLconsoleVisible = !HTMLconsoleVisible;
        resizeCanvas();
    };
    // Update kbKeys
    if(event.code == 'Space') {
        kbKeys['space'] = 1;
    };
    kbKeys[event.key] = 1;
});

window.addEventListener('keyup', (event) => {
    if(event.code == 'Space') {
        kbKeys['space'] = 0;
    };
    kbKeys[event.key] = 0;
});

window.addEventListener('wheel', (event) => {
    camVelZoom += (camZoom/200) * event.deltaY * -0.02;

    updateMouse(event);
});

window.addEventListener('mousemove', (event) => {
    updateMouse(event);
});

window.addEventListener('mousedown', (event) => {
    mouseState = 1;
    // Iterate over Elements in Reverse Order
    for(let countElement in elements) {
        currentElement = elements[len(elements)-countElement-1];
        if(currentElement.isMouseOver() && currentElement.clickable && !currentElement.hide && actionType == 'none') {
            currentElement.clicked = 1;
            currentElement.onClick();
            actionType = 'wait';
        };
    };

    updateMouse(event);
});

window.addEventListener('mouseup', (event) => {
    mouseState = 0;
    resetSelected();
    // Iterate over Elements
    for(let countElement in elements) {
        if(elements[countElement].isMouseOver() && elements[countElement].clicked && elements[countElement].clickable) {
            elements[countElement].clicked = 0;
            elements[countElement].onRelease();
        }
    };

    updateMouse(event);
});

// Pre-Loop
resizeCanvas();
HTMLconsoleVisible = !true;

/*
// Counter Microbot Object
objects.push(new robot(0, 0, 0, 12, 4, 0.2));
objects[len(objects)-1].compile(`
pen-color(0 | 0 | 0)
output(0@)
write(0@,1,+ | 0)
move(size,2,/*)
strafe(velX,- | velY,-)
pen-add()
point(a,90º,+)
if-jump(0@,1000,!= | line,2,+)
write(0 | 0)
jump(line,-8,+)
('Counter Program written in Microlang')
`, 0);
*/

// Follower Microbot Object
objects.push(new robot(-50, -25, 0, 28, 4));
objects[len(objects)-1].compile(`
bind(0@ | d | distance)
bind(1@ | a | direction)
write(-6 | 2)
write(2@,3@,+ | 2)
output('-_-')
if-jump(2@,0,<= | line,-2,+)
pen-new(75 | 75 | 200 | penW)
write(2@,10,+ | 2)
output('o_o')
write(2@,1,-+ | 2)
write(mouseX,x,-+,mouseY,y,-+,geo | 0)
write(mouseX,x,-+,mouseY,y,-+,atan2 | 1)
point(.direction)
pen-add()
if-jump(.distance,25,> | line,3,+)
strafe(.a,cos,.d,*,4,/* | .a,sin,.d,*,4,/*)
if-jump(2@,0,> | line,-7,+)
strafe(.a,cos,10,* | .a,sin,10,*)
if-jump(2@,0,> | line,-9,+)
jump(line,-19,+)
('Follower Program written in Microlang')
`, 0);

/*
// Reverser Microbot Object
objects.push(new robot(-50, 25, 0, 14, 2));
objects[len(objects)-1].compile(`
output('REV')
write("" | 0)
write("" | 1)
('LOOP')
if-jump(0@,$_,0,= | line,4,+)
write(1@,0@,0@,$_,-1,+,$@,+ | 1)
write(0@,$[],0,:,$E | 0)
jump(line,-4,+)
print(1@)
if-jump(0@,$_,0,= | line)
jump(line,-8,+)
('Reverser Program written in Microlang')
`, 0);
*/

for(let loop in range(0, 5)) {
    objects.push(new object(Math.cos(Math.random()*Math.PI*2)*Math.random()*dishSize, Math.sin(Math.random()*Math.PI*2)*Math.random()*dishSize));
};
for(let loop in range(0, 10)) {
    objects.push(new cell(Math.cos(Math.random()*Math.PI*2)*Math.random()*dishSize, Math.sin(Math.random()*Math.PI*2)*Math.random()*dishSize));
    objects[len(objects)-1].age += Math.round(Math.random()*100);
};

// Code Display Element
elements.push(new element('code', 0, 0, 300, 145));
elements[len(elements)-1].color = 'rgb(0, 0, 0, 0.6)';
elements[len(elements)-1].align = 'topleft';
elements[len(elements)-1].txt = [];
elements[len(elements)-1].txtColor = 'rgb(100, 255, 100, 1)';
elements[len(elements)-1].txtAlign = 'left';
elements[len(elements)-1].txtSize = 18;

// Info Button Element
elements.push(new button('info', 0, 0, 280, 145));
elements[len(elements)-1].color = 'rgb(200, 200, 200, 0.5)';
elements[len(elements)-1].align = 'topleft';
elements[len(elements)-1].txt = ['Click for Help Menu', 'Sweep&Prune', 'Cells   0/'+cellCap, 'Food    0/'+foodCap, 'none', 0];
elements[len(elements)-1].txtAlign = 'left';
elements[len(elements)-1].onClick = function () {
    tutorialPopup();
};

// dishSize Slider Element
elements.push(new slider('dishSize', 250/2 + 15, 190, 250, 25));
elements[len(elements)-1].align = 'abovecenter';
elements[len(elements)-1].txt = ['Petridish Size'];
elements[len(elements)-1].slideMin = 400;
elements[len(elements)-1].slideMax = 800;
elements[len(elements)-1].slidePos = invLerp(dishSize, elements[len(elements)-1].slideMin, elements[len(elements)-1].slideMax);
elements[len(elements)-1].setSnapInterval(50);

// cellCap Slider Element
elements.push(new slider('cellCap', 250/2 + 15, 250, 250, 25));
elements[len(elements)-1].align = 'abovecenter';
elements[len(elements)-1].txt = ['Cell Cap'];
elements[len(elements)-1].slideMin = 0;
elements[len(elements)-1].slideMax = 200;
elements[len(elements)-1].slidePos = invLerp(cellCap, elements[len(elements)-1].slideMin, elements[len(elements)-1].slideMax);
elements[len(elements)-1].setSnapInterval(10);

// foodCap Slider Element
elements.push(new slider('foodCap', 250/2 + 15, 310, 250, 25));
elements[len(elements)-1].align = 'abovecenter';
elements[len(elements)-1].txt = ['Food Cap'];
elements[len(elements)-1].slideMin = 0;
elements[len(elements)-1].slideMax = 200;
elements[len(elements)-1].slidePos = invLerp(foodCap, elements[len(elements)-1].slideMin, elements[len(elements)-1].slideMax);
elements[len(elements)-1].setSnapInterval(10);

// Documentation Button Element
elements.push(new button('doc', 0, 0, 0, 0));
elements[len(elements)-1].color = 'rgb(200, 200, 200, 1)';
elements[len(elements)-1].align = 'topleft';
elements[len(elements)-1].txt = [];
elements[len(elements)-1].txtAlign = 'left';
elements[len(elements)-1].hide = true;
elements[len(elements)-1].data.stage = 0;
elements[len(elements)-1].data.stageTxt = [[
`| LIST OF INSTRUCTIONS |`,
`Movement: move(d) strafe(x | y) movePos(d) strafePos(x | y) point(a) rotate(a)`,
`Text: print(txt1 | txt2 | ...) output(txt)`,
`Paint: pen-new(r | g | b | w) pen-color(r | g | b) pen-width(w) pen-add()`,
`Control: write(v | c1 | c2 | ...) bind(v | b1 | b2 | ...) jump(l) if-jump(b | l)`,
``,
`EX1: instruction(arg1 | arg2 | ...) -> syntax example`,
`EX2: print("abcd",$_,2,/*)jump(line,-1,+) -> prints 2 forever`,
`EX3: write(1 | 0 | 1)output(0@,1@,+) -> writes 1 to cells 0 and 1 & displays 2`,
`EX4: movePos(size)point(a,90º,+)pen-add() -> draws a square it's size`,
`EX5: jump(line) -> does nothing`,
],[
`| LIST OF OPERATIONS |`,
`NOTICE: Microlang uses RPN (Reverse Polish Notation)`,
`Add & Sub: (a,b,+ ⇄ a+b) (a,- ⇄ a*-1) (a,b,-+ ⇄ a,b,-,+ ⇄ a-b)`,
`Mult & Div: (a,b,* ⇄ a*b) (a,/ ⇄ 1/a) (a,b,/* ⇄ a,b,/,* ⇄ a/b)`,
`Pow & Mod: (a,b,** ⇄ a to the power of b) (a,b,% ⇄ rest of a/b)`,
`Extra: min max abs sign round floor ceil lerp invLerp (a,b,…,z,E ⇄ a+b+…+z)`,
`Angles: (pi ⇄ 3.1415... ⇄ 180º ⇄ 180,rad) (tau ⇄ pi,2,* ⇄ 360º ⇄ 360,rad)`,
`Trig: (a,b,geo ⇄ a,2,**,b,2,**,+,0.5,**) sin cos (tan ⇄ sin,cos,/*) atan2`,
`Boolean: not and or = (!= ⇄ unequal) > < >= <= (? ⇄ ternary)`,
`Control: (: ⇄ repeat) (_ ⇄ size) (^ ⇄ move to top) (a,$ ⇄ String(a)) (a,# ⇄ parseFloat(a))`,
`String: ("abc" ⇄ 'abc') (a,b,$@ ⇄ a[b]) (a,$[] ⇄ split a) ($_ ⇄ size) ($E ⇄ join all)`,
`Self: x y velX velY a velA size penR penG penB penW line (a,@ ⇄ a@ ⇄ cell a)`,
`Sensing: mouseX mouseY (mouseState ⇄ 1 if mouse is pressed, 0 otherwise)`,
`Binds: (.bind ⇄ replace with bind)`,
``,
`EX1: print(9,8,-,+,"0",+,#,5,/*) -> prints 2`,
`EX2: print(20,8,3,-+,2,*,/,*) -> prints 2`,
`EX3: print("abc",$[],0,:,$E,$_) -> prints 2`,
`EX4: bind(1 | one)bind(+ | add)bind(.one,.add | next)print(.one,.next) -> prints 2`,
`EX5: print(45,rad,45º,+,sin,pi,2,/*,sin,=,pi,90,180,/*,*,sin,4,/,tau,*,sin,=,+) -> prints 2`
]];
elements[len(elements)-1].process = function () {
    this.txt = this.data.stageTxt[this.data.stage];
};
elements[len(elements)-1].onClick = function () {
    if(this.data.stage < len(this.data.stageTxt)-1) {
        this.data.stage += 1;
    } else {
        this.hide = true;
    };
};

// Tutorial
//tutorialPopup();

// Loop
requestAnimationFrame(main);

/*
TO-DO LIST
    -Implement Quadtrees
*/