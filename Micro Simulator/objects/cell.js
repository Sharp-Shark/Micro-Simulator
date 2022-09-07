// Cell Class
class cell extends object {
    constructor (x=0, y=0, a=Math.PI, gId='default') {
        super(object);
        this.objType = 'cell';
        this.x = x;
        this.y = y;
        this.a = a;
        this.velX = 0;
        this.velY = 0;
        this.velA = 0;
        this.oldX = this.x;
        this.oldY = this.y;
        this.oldA = this.a;
        this.size = 20;
        this.layers = [1, 0];
        this.zIndex = 2;
        this.rgb = [100, 100, 100];
        // Physical Stats
        this.age = 0;
        this.energy = this.size;
        this.membrane = this.size/2;
        // Genetic Code Variables
        this.gSequence = ['+', 'f', '-'];
        // Where in the Sequence it is
        this.gPointer = 0;
        this.gPointerTimer = 5;
        this.gPointerTimerStart = 20;
    };
    clone () {
        let toReturn = new cell;
        toReturn.a = this.a;
        toReturn.oldA = this.oldA;
        toReturn.size = this.size;
        toReturn.rgb = structuredClone(this.rgb);
        toReturn.age = this.age;
        toReturn.energy = this.energy;
        toReturn.membrane = this.membrane;
        toReturn.gSequence = structuredClone(this.gSequence);
        toReturn.gPointer = this.gPointer;
        toReturn.gPointerTimer = this.gPointerTimer;
        toReturn.gPointerTimerStart = this.gPointerTimerStart;
        return toReturn;
    };
    isColliding (target) {
        // Check Layers
        let sharesLayer = false;
        for(let countLayer in this.layers) {
            if(this.layers[countLayer] && target.layers[countLayer]) {
                sharesLayer = true;
            };
        };
        // If No Shared Layer, Return False
        if(target.objType=='food' && this.energy<this.size) {
            if(distance([this.x, this.y], [target.x, target.y]) < this.size + target.size) {
                let eatAmount = Math.max(Math.min(Math.min(target.size, this.size-this.energy), 0.2), 0);
                this.energy += eatAmount;
                objects[target.index].size -= eatAmount;
                if(objects[target.index].size < 0) {
                    objects[target.index].die()
                };
            };
        };
        if(!sharesLayer) {
            return false;
        };
        // Check Collision
        if(distance([this.x, this.y], [target.x, target.y]) < this.size + target.size) {
            // Shares Layer, Has a Collision, Return True
            return true;
        };
        // Shares Layer, But No Collision, Return False
        return false;
    };
    process () {
        // Countdown Timer
        this.gPointerTimer -= 1 * (this.energy>0);
        // If Timer Reaches 0...
        if(this.gPointerTimer <= 0) {
            this.age += 1;
            // Add 1 to Genetic Pointer if Smaller than Sequence, otherwise Set to 0
            this.gPointer = this.gPointer+1<len(this.gSequence)?this.gPointer+1:0;
            // Execute Code at Pointer Location
            if(this.gSequence[this.gPointer] == 'm') {
                // Move Cell Codon
                if(this.energy >= 0.05) {
                    this.velX += Math.cos(this.a)*4;
                    this.velY += Math.sin(this.a)*4;
                    this.energy -= 0.05;
                };
            } else if(this.gSequence[this.gPointer] == 'rc') {
                // Rotate Center Cell Codon
                if(this.energy >= 0.05) {
                    this.velA = this.velA + angleStuff(angleFix(pointTowards([this.y, this.x], [0, 0])), angleMod(this.a))/10;
                    this.energy -= 0.05;
                };
            } else if(this.gSequence[this.gPointer] == 'rr') {
                // Rotate Random Cell Codon
                if(this.energy >= 0.05) {
                    this.velA += Math.random() - 1/2;
                    this.energy -= 0.05;
                };
            } else if(this.gSequence[this.gPointer] == 'f') {
                // Repair Membrane Codon
                if(this.energy >= (this.size/2 - this.membrane)*this.gPointerTimerStart/800) {
                    this.membrane += (this.size/2 - this.membrane)*this.gPointerTimerStart/80;
                    this.energy -= (this.size/2 - this.membrane)*this.gPointerTimerStart/800;
                };
            } else if(this.gSequence[this.gPointer] == '+') {
                // Duplicate Codon
                if(this.energy >= this.size/2 && amountOfCells < cellCap) {
                    this.age = 0;
                    this.energy -= this.size/4;
                    this.energy = this.energy/2;
                    this.duplicate();
                    this.duplicate();
                    this.die();
                };
            };
            // Reset Timer
            this.gPointerTimer = this.gPointerTimerStart;
        };

        //this.energy -= (this.rgb[0]-100)/100000;
        //this.energy -= (this.rgb[1]-100)/100000;
        //this.energy -= (200-this.rgb[2])/100000;

        // Decay Energy
        this.energy -= 0.001;
        // Cap Energy
        this.energy = Math.max(Math.min(this.energy, this.size), 0);
        // Decay Membrane
        this.membrane -= 0.0005 * this.size;
        // Cap Membrane
        this.membrane = Math.min(this.membrane, this.size/2);

        // If Membrane is too thin, burst cell
        if(this.membrane <= 1 || this.age>this.size*20) {
            objects.push(new food(this.x, this.y, this.a));
            objects[len(objects)-1].size = 0.1*this.size;
            this.die();
        };
    };
    duplicate () {
        objects.push(new cell);
        let newborn = objects[len(objects)-1];
        newborn.x = this.x + Math.random();
        newborn.y = this.y + Math.random();
        newborn.a = this.a + Math.PI;
        newborn.velX = this.velX;
        newborn.velY = this.velY;
        newborn.velA = this.velA;
        newborn.oldX = this.oldX;
        newborn.oldY = this.oldY;
        newborn.oldA = this.oldA + Math.PI;
        newborn.size = Math.max(this.size + Math.random() * 4 - 2, 10);
        newborn.layers = this.layers;
        newborn.zIndex = this.zIndex;
        newborn.rgb = structuredClone(this.rgb);
        for (let countColor in newborn.rgb) {
            let rng = Math.random() * 20 - 10;
            newborn.rgb[countColor] = Math.min(Math.max(this.rgb[countColor] + rng, 100), 200);
        };
        // Physical Stats
        newborn.energy = this.energy;
        newborn.membrane = this.membrane;
        // Genetic Code Variables
        newborn.gSequence = structuredClone(this.gSequence);
        if(Math.random() > 0.8) {
            newborn.gSequence.push('-');
            for (let countColor in newborn.rgb) {
                let rng = Math.random() * 20 - 10;
                newborn.rgb[countColor] = Math.min(Math.max(this.rgb[countColor] + rng, 100), 200);
            };
        };
        if(Math.random() > 0.9 && len(newborn.gSequence)>1) {
            newborn.gSequence.pop(countCodon);
            for (let countColor in newborn.rgb) {
                let rng = Math.random() * 20 - 10;
                newborn.rgb[countColor] = Math.min(Math.max(this.rgb[countColor] + rng, 100), 200);
            };
        };
        if(Math.random() > 0.7) {
            newborn.gSequence[Math.floor(Math.random()*len(newborn.gSequence))] = codons[Math.floor(Math.random()*len(codons))];
            for (let countColor in newborn.rgb) {
                let rng = Math.random() * 20 - 10;
                newborn.rgb[countColor] = Math.min(Math.max(this.rgb[countColor] + rng, 100), 200);
            };
        };
        // Where in the Sequence it is
        newborn.gPointer = this.gPointer;
        newborn.gPointerTimer = this.gPointerTimer;
        newborn.gPointerTimerStart = Math.max(this.gPointerTimerStart+Math.random() * 4 - 2, 1);
    };
    render () {
        amountOfCells += 1;
        // RGB Negative
        let rgbN = [this.rgb[0] - 100, this.rgb[1] - 100, this.rgb[2] - 100];
        // Render
        // Membrane
        ctx.beginPath();
        ctx.strokeStyle = 'rgb('+rgbN[0]+', '+rgbN[1]+', '+rgbN[2]+', 0.35)';
        ctx.lineWidth = this.membrane*camZoom;
        ctx.arc(xToCam(this.x), yToCam(this.y), (this.size-this.membrane/2)*camZoom, this.a, this.a+Math.PI*2);
        ctx.stroke();
        //circle(xToCam(this.x), yToCam(this.y), (this.size)*camZoom, 'rgb('+rgbN[0]+', '+rgbN[1]+', '+rgbN[2]+', 0.35)');
        // Inside
        circle(xToCam(this.x), yToCam(this.y), (this.size-this.membrane)*camZoom, 'rgb('+this.rgb[0]+', '+this.rgb[1]+', '+this.rgb[2]+', 0.5)');
        // Center
        ctx.beginPath();
        ctx.strokeStyle = 'rgb('+rgbN[0]+', '+rgbN[1]+', '+rgbN[2]+', 0.4)';
        ctx.lineWidth = (0.15*this.size)*camZoom;
        ctx.arc(xToCam(this.x), yToCam(this.y), (0.3*this.size)*camZoom, 0, Math.PI*2);
        ctx.stroke();
        // gPointer Arrow
        let a = Math.PI*2 * (this.gPointer/len(this.gSequence));
        //ctx.beginPath();
        ctx.beginPath();
        ctx.strokeStyle = 'rgb('+rgbN[0]+', '+rgbN[1]+', '+rgbN[2]+', 0.4)';
        ctx.lineWidth = (0.15*this.size)*camZoom;
        ctx.arc(xToCam(this.x), yToCam(this.y), (this.size*0.3)*camZoom, a, a+Math.PI*2/len(this.gSequence));
        ctx.stroke();
        // gPointer Codon
        circle(xToCam(this.x), yToCam(this.y), (0.225*this.size)*camZoom, codonColors[this.gSequence[this.gPointer]]);
        // Energy Meter
        circle(xToCam(this.x), yToCam(this.y), (0.1*this.size)*camZoom, 'rgb(255, 255, 255, '+(this.energy/this.size)+')');
        // Angle Marker
        ctx.beginPath();
        ctx.strokeStyle = 'rgb('+rgbN[0]+', '+rgbN[1]+', '+rgbN[2]+', 0.4)';
        ctx.lineWidth = this.membrane*camZoom;
        ctx.arc(xToCam(this.x), yToCam(this.y), (this.size-this.membrane/2)*camZoom, this.a, this.a+Math.PI/6);
        ctx.stroke();
    };
};