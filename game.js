class Game{
    constructor(){
        this.canvas = document.getElementById("game")
        this.context = this.canvas.getContext("2d")
        this.context.font  = "30px Arial"
        this.sprites = []
        const game =this
        this.loadJSON("flowers",function(data,game){
            game.spriteData =JSON.parse(data)
            game.spriteImage = new Image()
            game.spriteImage.src = game.spriteData.meta.image
            game.spriteImage.onload = function(){
                game.init()
            }
        })
    }

    loadJSON(json,callback){
        let xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json")
            xobj.open('GET',json + '.json',true)
        const game = this
        xobj.onreadystatechange = function(){
            if(xobj.readyState == 4 && xobj.status == "200"){
                callback(xobj.responseText,game)
            }
        }
        xobj.send(null)
    }


     init(){
        this.score = 0
        this.lastRefreshTime = Date.now()
        this.spawn()
        this.refresh()
        console.log("hhh")
        const game =  this
        function tap(event){
            game.tap(event)
        }

        if('ontouchstart' in window){
            this.canvas.addEventListener('touchstart',tap, supportPassive ? {passive:true} : false)
        }
        else{
            this.canvas.addEventListener("mousedown",tap)
        }
    }

    tap(event){
        const mousePos = this.getMousePos(event)
        for(let sprite of this.sprites){
            if(sprite.hitTest(mousePos)){
                sprite.kill = true
                this.score++    
            }
        }
    }

    getMousePos(event){
        const rect = this.canvas.getBoundingClientRect()
        const clientX = event.targetTouches ? event.targetTouches[0].pageX : event.clientX;
        const clientY = event.targetTouches ? event.targetTouches[0].pageY : event.clientY;

        const canvasScale = this.canvas.width / this.canvas.offsetWidth;
        const loc  = {}

        loc.x = (clientX - rect.left) * canvasScale
        loc.y = (clientY - rect.top) * canvasScale

        return loc
    }
    spawn(){
        const index =Math.floor(Math.random() * 5)
        const frame = this.spriteData.frames[index].frame;
        const sprite = new Sprite({
            context: this.context,
            x:Math.random() * this.canvas.width,
            y:Math.random() * this.canvas.height,
            width: this.spriteImage.width,
            frame,
            index,
            height: this.spriteImage.height,
            image: this.spriteImage,
            states:[{mode:"spawn",duration:0.5},{mode:"static",duration:1.5},{mode:"die",duration:0.8}]
        })
        this.sprites.push(sprite)
        this.sinceLastSpawn = 0
    }

    refresh(){
        const now = Date.now()
        const dt = (now - this.lastRefresTime)/1000.0

        this.update(dt)
        this.render()

        this.lastRefresTime = now

        const game = this
        requestAnimationFrame(function(){game.refresh()})
    }

    update(dt){
        this.sinceLastSpawn += dt;
        if(this.sinceLastSpawn > 1){
            this.spawn()
        }
        let removed
        do{
            removed = false
            for(let sprite of this.sprites){
                if(sprite.kill){
                    const index = this.sprites.indexOf(sprite)
                    this.sprites.splice(index,1)
                    removed = true
                    break
                }
            }
        }while(removed)
        for(let sprite of this.sprites){
                if(sprite == null)continue;
                sprite.update(dt);
        }
        
    }

    render(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height)

        this.sprites.map((value)=>{
            value.render()
        })
    }
}