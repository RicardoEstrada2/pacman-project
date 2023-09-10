const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Borde{
    static width = 40;
    static height = 40;
    constructor({posicion}) {
        this.posicion = posicion;
        this.width = 40;
        this.height = 40;
    }

    pintar(){
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.posicion.x, this.posicion.y, this.width, this.height);
    }
}

const mapa = [
    ['-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-']
]

const bordes = [];

mapa.forEach((fila, i) => {
    fila.forEach((simbolo, j) => {
        switch (simbolo){
            case '-':
                bordes.push(new Borde({
                    posicion:{
                        x: Borde.width * j,
                        y: Borde.height * i
                    }
                }))
                break
        }
    })
})

bordes.forEach((borde) => {
    borde.pintar()
})

