// Physical Object Class
class object {
    constructor (x=0, y=0, a=0) {
        this.objType = 'object';
        this.index = len(objects);
        this.id = len(objects);
        this.x = x;
        this.y = y;
        this.a = a;
        this.velX = 0;
        this.velY = 0;
        this.velA = 0;
        this.oldX = this.x;
        this.oldY = this.y;
        this.oldA = this.a;
        this.size = Math.floor(50 + Math.random()*50);
        this.layers = [1, 1];
        this.zIndex = 0;
    };
    clone () {
        let toReturn = new object;
        toReturn.a = this.a;
        toReturn.oldA = this.oldA;
        toReturn.size = this.size;
        return toReturn;
    };
    die () {
        // Update Other Objects Indexes and IDs
        if(selected == this.id) {
            resetSelected();
            actionType = 'wait';
        };
        for(let countObject in objects) {
            if(objects[countObject].index > this.index) {
                objects[countObject].index -= 1;
            };
            if(objects[countObject].id > this.id) {
                objects[countObject].id -= 1;
            };
        };
        if(selected > this.id) {
            selected -= 1;
        };
        // Destroy Self
        objects.splice(this.index, 1);
    };
    myIntersection () {
        // Returns the Intersection (X) this Object is in
        let myIndex = objects.indexOf(this);
        let n = 0;
        for(let countIntersection in range(0, len(intersections)+1)) {
            n += len(intersections[countIntersection]);
            if(myIndex < n) {
                return countIntersection;
            };
        };
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
    collide () {
        if(!this.layers.includes(1)) {
            return;
        };
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
                    this.a = this.a + angleStuff(angleFix(pointTowards([this.oldY, this.oldX], [this.y, this.x])), angleMod(this.a)) * distance([this.oldX, this.oldY], [this.x, this.y])/100;
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
                this.a = this.a + angleStuff(angleFix(pointTowards([this.oldY, this.oldX], [this.y, this.x])), angleMod(this.a)) * distance([this.oldX, this.oldY], [this.x, this.y])/100;
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
    physicsEnd () {
        // Apply Velocity
        this.x += this.velX * timeScale;
        this.y += this.velY * timeScale;
        this.a += this.velA * timeScale;
        // Apply Friction
        let friction = 1 + (0.15 + (this.size)/500) * timeScale;
        this.velX = this.velX / friction;
        this.velY = this.velY / friction;
        this.velA = this.velA / friction;
        // Old X and Y
        this.oldX = this.x;
        this.oldY = this.y;
        this.oldA = this.a;
    };
    updateClosestObjectToMouse () {
        // Find Closest Object to Mouse
        let d = distance([this.x, this.y], [mTransX, mTransY]);
        if((d < closestObjectToMouseDistance || closestObjectToMouseDistance == -1) && d <= this.size + 5/camZoom) {
            closestObjectToMouseDistance = distance([this.x, this.y], [mTransX, mTransY]);
            closestObjectToMouseId = this.id;
        };
    };
    process () {
    };
    render () {
        circle(xToCam(this.x), yToCam(this.y), this.size*camZoom, 'rgb(175, 175, 175, 0.8)');
        circle(xToCam(this.x), yToCam(this.y), Math.max(this.size-10, this.size*0.8)*camZoom, 'rgb(155, 155, 155, 0.5)');
    };
};