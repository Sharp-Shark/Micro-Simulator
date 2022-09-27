// Graphical Object Class
class element {
    constructor (label='test', x=0, y=0, width=100, height=40, color='rgb(0, 0, 0, 0.1)', align='center', txt=['test'], txtColor='black', txtSize=24, txtAlign='center') {
        this.eType = 'element';
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
        this.clickable = 0;
        
        this.data = {};

        this.hide = false;
        this.clicked = 0;
    };
    isMouseOver () {
        // Check for Collision with Mouse
        if(Math.abs(this.x - mouseX) <= this.width/2 &&
        Math.abs(this.y - mouseY) <= this.height/2
        ) {
            return true;
        };
        return false;
    };
    onClick () {
    };
    onRelease () {
    };
    tick () {
        if(this.hide) {return false;};
        if(this.clicked && !mouseState) {
            this.clicked = 0;
            actionType = 'none';
            this.onRelease();
        };
        this.process();
        this.render();
    };
    process () {
    };
    renderBg () {
        // Render Background
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        ctx.fill();
    };
    renderTxt () {
        // Text Settings
        ctx.beginPath();
        ctx.fillStyle = this.txtColor;
        ctx.font = this.txtSize+'px "Lucida Console", "Courier New", monospace';
        ctx.textAlign = this.txtAlign;
        // Render Text
        let txtX = this.x;
        let txtY = this.y;
        if(this.align == 'center') {
            txtX = this.x;
            txtY = this.y - len(this.txt) * this.txtSize/2 + this.txtSize*0.8;
        } else if(this.align == 'topleft') {
            txtX = this.x - this.width/2;
            txtY = this.y - this.height/2 + this.txtSize*0.8;
        } else if(this.align == 'topright') {
            txtX = this.x + this.width/2;
            txtY = this.y - this.height/2 + this.txtSize*0.8;
        } else if(this.align == 'abovecenter') {
            txtX = this.x;
            txtY = this.y - this.height/2 - this.txtSize*0.4;
        } else if(this.align == 'belowcenter') {
            txtX = this.x;
            txtY = this.y + this.height/2 + this.txtSize*1;
        };
        for(let countLine in this.txt) {
            let formatted = [this.txt[countLine]];
            let lastSegment = '';
            while(ctx.measureText(formatted[len(formatted)-1]).width >= this.width) {
                lastSegment = formatted[len(formatted)-1];
                formatted.pop();
                formatted.push(lastSegment.trim().slice(0, Math.floor((this.width-ctx.measureText('_').width)/ctx.measureText('_').width)).trim());
                formatted.push(lastSegment.trim().slice(Math.floor((this.width-ctx.measureText('_').width)/ctx.measureText('_').width)).trim());
            };
            for(let countLineSegment in formatted) {
                ctx.fillText(formatted[countLineSegment], txtX, txtY);
                txtY += this.txtSize;
            };
        };
    };
    render() {
        this.renderBg();
        this.renderTxt();
    };
};