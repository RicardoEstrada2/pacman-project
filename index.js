const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const puntosSpan = document.querySelector('#puntosSpan');
console.log(puntosSpan);

canvas.width = innerWidth;
canvas.height = innerHeight;


class Player{
    constructor({ posicion, velocity }){
        this.posicion = posicion;
        this.velocity = velocity;
        this.radius = 15;
    }

    pintar(){
        ctx.beginPath();
        ctx.arc(this.posicion.x, this.posicion.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }

    update(){
        this.pintar();
        this.posicion.x += this.velocity.x;
        this.posicion.y += this.velocity.y;
    }
}

class Enemigo{
    static speed = 2;

    constructor({ posicion, velocity, color = "red" }){
        this.posicion = posicion;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.choquesPasados = [];
        this.speed = 2;
    }

    pintar(){
        ctx.beginPath();
        ctx.arc(this.posicion.x, this.posicion.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(){
        this.pintar();
        this.posicion.x += this.velocity.x;
        this.posicion.y += this.velocity.y;
    }
}

class Punto{
    constructor({ posicion }){
        this.posicion = posicion;
        this.radius = 3;
    }

    pintar(){
        ctx.beginPath();
        ctx.arc(this.posicion.x, this.posicion.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
}

class Piso{
    constructor({posicion, image}) {
        this.posicion = posicion;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    pintar(){
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.posicion.x, this.posicion.y, this.width, this.height);
        ctx.drawImage(this.image, this.posicion.x, this.posicion.y)
    }
}

//stage section
class Borde{
    static width = 40;
    static height = 40;
    constructor({posicion, image}) {
        this.posicion = posicion;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    pintar(){
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.posicion.x, this.posicion.y, this.width, this.height);
        ctx.drawImage(this.image, this.posicion.x, this.posicion.y)
    }
}

const bordes = [];
const pisos = [];
const puntos = [];
const enemigos = [
    new Enemigo({
        posicion:{
            x:Borde.width * 3 + Borde.height/2,
            y:Borde.height + Borde.height/2
        },
        velocity:{
            x: Enemigo.speed,
            y: 0
        }
    }),
    new Enemigo({
        posicion:{
            x:Borde.width * 3 + Borde.height/2,
            y:Borde.height * 3 + Borde.height/2
        },
        velocity:{
            x: Enemigo.speed,
            y: 0
        },
        color:"pink"
    })
];
const player = new Player({
    posicion:{
        x:Borde.width + Borde.height/2,
        y:Borde.height + Borde.height/2
    },
    velocity:{
        x:0,
        y:0
    }
});

const keys = {
    w:{
        pressed: false
    },
    a:{
        pressed: false
    },
    s:{
        pressed: false
    },
    d:{
        pressed: false
    }
}

let lastKey = '';
let puntaje = 0;

const mapa = [
    ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '*', '*', '*', '*', '*', '*', '*', '-'],
    ['-', '*', '-', '-', '*', '-', '-', '*', '-'],
    ['-', '*', '-', '*', '*', '*', '-', '*', '-'],
    ['-', '*', '-', '*', '-', '*', '-', '*', '-'],
    ['-', '*', '*', '*', '-', '*', '*', '*', '-'],
    ['-', '*', '-', '*', '*', '*', '-', '*', '-'],
    ['-', '*', '-', '-', '*', '-', '-', '*', '-'],
    ['-', '*', '*', '*', '*', '*', '*', '*', '-'],
    ['-', '*', '-', '*', '-', '*', '-', '*', '-'],
    ['-', '*', '-', '*', '-', '*', '-', '*', '-'],
    ['-', '*', '*', '*', '*', '*', '*', '*', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-', '-']
]

const bush = new Image();
bush.src = './img/bush3.png';
bush.width = 40;
bush.height = 40;

const grass = new Image();
grass.src = './img/grass.png';
grass.width = 40;
grass.height = 40;

mapa.forEach((fila, i) => {
    fila.forEach((simbolo, j) => {
        switch (simbolo){
            case '-':
                bordes.push(new Borde({
                    posicion:{
                        x: Borde.width * j,
                        y: Borde.height * i
                    },
                    image: bush
                }))
            break;
            case '*':
                pisos.push(new Piso({
                    posicion:{
                        x: Borde.width * j,
                        y: Borde.height * i
                    },
                    image: grass
                }))
                puntos.push(new Punto({
                    posicion:{
                        x: Borde.width * j + Borde.width / 2,
                        y: Borde.height * i +  + Borde.height / 2
                    }
                }))
            break;
        }
    })
})

function circuloChocaRectangulo({
        circulo,
        rectangulo
    }){

    const paddin = Borde.width / 2  - circulo.radius - 1;

    return(
        //top
        circulo.posicion.y - circulo.radius + circulo.velocity.y <= rectangulo.posicion.y + rectangulo.height + paddin &&
        //righ
        circulo.posicion.x + circulo.radius + circulo.velocity.x >= rectangulo.posicion.x - paddin &&
        //bottom
        circulo.posicion.y + circulo.radius + circulo.velocity.y >= rectangulo.posicion.y - paddin &&
        //left
        circulo.posicion.x - circulo.radius + circulo.velocity.x <= rectangulo.posicion.x + rectangulo.width + paddin
    )
}

//animate
let animacionID;
function animate(){
    animacionID = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(keys.w.pressed && lastKey === 'w'){
        for(let i = 0; i < bordes.length; i++) {
            const borde = bordes[i];
            if (
                circuloChocaRectangulo({
                    circulo: {
                        ...player,
                        velocity: {
                            x: 0,
                            y: -5
                        }
                    },
                    rectangulo: borde
                } )
            ) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -5;
            }
        }
        // player.velocity.y = -5
    } else if(keys.a.pressed && lastKey === 'a'){
        for(let i = 0; i < bordes.length; i++) {
            const borde = bordes[i];
            if (
                circuloChocaRectangulo({
                    circulo: {
                        ...player,
                        velocity: {
                            x: -5,
                            y: 0
                        }
                    },
                    rectangulo: borde
                } )
            ) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = -5;
            }
        }
        // player.velocity.x = -5
    } else if(keys.s.pressed && lastKey === 's'){
        for(let i = 0; i < bordes.length; i++) {
            const borde = bordes[i];
            if (
                circuloChocaRectangulo({
                    circulo: {
                        ...player,
                        velocity: {
                            x: 0,
                            y: 5
                        }
                    },
                    rectangulo: borde
                } )
            ) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = 5;
            }
        }
        // player.velocity.y = 5
    } else if(keys.d.pressed && lastKey === 'd'){
        for(let i = 0; i < bordes.length; i++) {
            const borde = bordes[i];
            if (
                circuloChocaRectangulo({
                    circulo: {
                        ...player,
                        velocity: {
                            x: 5,
                            y: 0
                        }
                    },
                    rectangulo: borde
                } )
            ) {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = 5;
            }
        }
        // player.velocity.x = 5
    }

    bordes.forEach((borde) => {
        borde.pintar()

        if(
            circuloChocaRectangulo({
                circulo: player,
                rectangulo: borde
            })
        ){
            // console.log('ouch');
            player.velocity.x = 0;
            player.velocity.y = 0;
        }
    })

    pisos.forEach((piso) => {
        piso.pintar();
    })

    //puntos tocan
    for ( let i = puntos.length - 1; 0 < i ; i-- ){
        const punto = puntos[i];

        punto.pintar();

        if(Math.hypot(
                punto.posicion.x - player.posicion.x,
                punto.posicion.y - player.posicion.y) <
            punto.radius + player.radius
        ){
            console.log('te toco');
            puntos.splice(i, 1);
            puntaje += 10;
            puntosSpan.innerHTML = puntaje;
        }
    }

    //enemigos
    enemigos.forEach((enemigo) => {
        enemigo.update();

        if(Math.hypot(
                enemigo.posicion.x - player.posicion.x,
                enemigo.posicion.y - player.posicion.y) <
            enemigo.radius + player.radius
        ){
            cancelAnimationFrame(animacionID);
            console.log('you lose')
        }

        const choques = [];

        bordes.forEach((borde) => {
            if (
                !choques.includes('right') &&
                circuloChocaRectangulo({
                    circulo: {
                        ...enemigo,
                        velocity: {
                            x: enemigo.speed,
                            y: 0
                        }
                    },
                    rectangulo: borde
                } )
            ){
                choques.push('right')
            }

            if (
                !choques.includes('left') &&
                circuloChocaRectangulo({
                    circulo: {
                        ...enemigo,
                        velocity: {
                            x: -enemigo.speed,
                            y: 0
                        }
                    },
                    rectangulo: borde
                } )
            ){
                choques.push('left')
            }

            if (
                !choques.includes('up') &&
                circuloChocaRectangulo({
                    circulo: {
                        ...enemigo,
                        velocity: {
                            x: 0,
                            y: -enemigo.speed
                        }
                    },
                    rectangulo: borde
                } )
            ){
                choques.push('up')
            }

            if (
                !choques.includes('down') &&
                circuloChocaRectangulo({
                    circulo: {
                        ...enemigo,
                        velocity: {
                            x: 0,
                            y: enemigo.speed
                        }
                    },
                    rectangulo: borde
                } )
            ){
                choques.push('down')
            }
        })

        if(choques.length > enemigo.choquesPasados.length)
            enemigo.choquesPasados = choques;

        if( JSON.stringify(choques) !== JSON.stringify(enemigo.choquesPasados) ){

            if (enemigo.velocity.x > 0) {
                enemigo.choquesPasados.push('right');
            } else if (enemigo.velocity.x < 0) {
                enemigo.choquesPasados.push('left');
            } else if (enemigo.velocity.y < 0){
                enemigo.choquesPasados.push('up');
            } else if (enemigo.velocity.y > 0){
                enemigo.choquesPasados.push('down');
            }

            // console.log(choques);
            // console.log(enemigo.choquesPasados);

            const caminos = enemigo.choquesPasados.filter(choque => {
                return !choques.includes(choque)
            })
            // console.log({caminos})

            const direcciones = caminos[Math.floor(Math.random() * caminos.length)]

            switch (direcciones){
                case 'down':
                    enemigo.velocity.y = enemigo.speed;
                    enemigo.velocity.x = 0;
                    break;

                case 'up':
                    enemigo.velocity.y = -enemigo.speed;
                    enemigo.velocity.x = 0;
                    break;

                case 'right':
                    enemigo.velocity.y = 0;
                    enemigo.velocity.x = enemigo.speed;
                    break;

                case 'left':
                    enemigo.velocity.y = 0;
                    enemigo.velocity.x = -enemigo.speed;
                    break;
            }

            enemigo.choquesPasados = [];

        }

        // console.log(enemigo.choquesPasados);
    })

    player.update();
    // player.velocity.x = 0;
    // player.velocity.y = 0;

}

animate();

//Movement
addEventListener('keydown', ({key}) => {
    switch (key){
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;
    }
})
addEventListener('keyup', ({key}) => {
    switch (key){
        case 'w':
            keys.w.pressed = false;
            break;
        case 'a':
            keys.a.pressed = false;
            break;
        case 's':
            keys.s.pressed = false;
            break;
        case 'd':
            keys.d.pressed = false;
            break;
    }
})