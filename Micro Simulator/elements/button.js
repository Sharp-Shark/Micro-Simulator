class button extends element {
    constructor (label='test', x=0, y=0, width=100, height=60, color='rgb(150, 55, 50, 0.5)', align='center', txt=['test'], txtColor='black', txtSize=24, txtAlign='center') {
        super(element);
        this.eType = 'button';
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
    };
};