// Food Class
class food extends object {
    constructor (x=0, y=0, a=0) {
        super(object);
        this.objType = 'food';
        this.x = x;
        this.y = y;
        this.a = a;
        this.velX = 0;
        this.velY = 0;
        this.velA = 0;
        this.oldX = this.x;
        this.oldY = this.y;
        this.oldA = this.a;
        this.size = Math.floor(5 + Math.random()*5);
        this.layers = [0, 1];
        this.zIndex = 3;
        this.rgb = [155 + Math.random()*55, 55 + Math.random()*55, 0 + Math.random()*55];
    };
    clone () {
        let toReturn = new food;
        toReturn.a = this.a;
        toReturn.oldA = this.oldA;
        toReturn.size = this.size;
        toReturn.rgb = structuredClone(this.rgb);
        return toReturn;
    };
    process () {
        this.size -= 0.02 * foodDecayRate * timeScale;
        if(this.size <= 0) {
            this.size = 0;
            this.die();
        };
    };
    render () {
        amountOfFood += 1;
        circle(xToCam(this.x), yToCam(this.y), this.size*camZoom, 'rgb('+this.rgb[0]+', '+this.rgb[1]+', '+this.rgb[2]+', 0.35)');
    };
};