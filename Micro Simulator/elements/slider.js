class slider extends element {
    constructor (label='test', x=0, y=0, width=100, height=60, color='rgb(0, 0, 0, 0.3)', align='center', txt=['test'], txtColor='black', txtSize=24, txtAlign='center') {
        super(element);
        this.eType = 'slider';
        this.label = label;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.align = align;
        this.txt = txt;
        this.txtColor = txtColor;
        this.txtSize = txtSize;
        this.txtAlign = txtAlign;
        this.clickable = 1;
        
        this.data = {};

        this.hide = false;
        this.clicked = 0;
        this.slidePos = 0.5;
        this.slideMin = 0;
        this.slideMax = 1;
        this.slideSnap = 9999;
    };
    process () {
        if(this.clicked) {
            let slideRadius = this.width<this.height?this.width/2:this.height/2;
            if(isKeyDown('n')) {
                this.slidePos = Math.max(Math.min(invLerp(mouseX, this.x-this.width/2+slideRadius, this.x+this.width/2-slideRadius), 1), 0);
            } else {
                this.slidePos = Math.round(
                Math.max(Math.min(invLerp(mouseX, this.x-this.width/2+slideRadius, this.x+this.width/2-slideRadius), 1), 0)*
                this.slideSnap)/this.slideSnap;
            };
        };
    };
    setSnapInterval (i) {
        // Set Snap Based on Desired Interval Amount
        this.slideSnap = (this.slideMax-this.slideMin)/i;
    };
    getSlideValue () {
        // Get Lerped Slide Value
        return lerp(this.slidePos, this.slideMin, this.slideMax);
    };
    renderBg() {
        // Render Background
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        ctx.fill();
        if(this.clicked || (this.isMouseOver() && actionType == 'none')) {
            ctx.beginPath();
            ctx.fillStyle = 'rgb(255, 255, 255, 0.1)';
            ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            ctx.fill();
            if(this.clicked) {
                ctx.fill();
            };
        };
        // Render Slider and Current Lerped Slider Value
        let slideRadius = this.width<this.height?this.width/2:this.height/2;
        circle(lerp(this.slidePos, this.x-this.width/2+slideRadius, this.x+this.width/2-slideRadius), this.y, slideRadius, this.color);
        if(this.clicked || (this.isMouseOver() && actionType == 'none')) {
            circle(lerp(this.slidePos, this.x-this.width/2+slideRadius, this.x+this.width/2-slideRadius), this.y, slideRadius, 'rgb(0, 0, 0, 0.1)');
            if(this.clicked) {
                circle(lerp(this.slidePos, this.x-this.width/2+slideRadius, this.x+this.width/2-slideRadius), this.y, slideRadius, 'rgb(0, 0, 0, 0.1)');
            };
            ctx.fillStyle = 'black';
            ctx.font = '24px "Lucida Console", "Courier New", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(Math.round(this.getSlideValue()), mouseX+6, mouseY+4);
        };
    };
};