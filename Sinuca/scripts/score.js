
function Score() {
    this.score = 0

    return {
        getScore: () => {
            return this.score
        },
    
        add: (score) => {
            this.score += score
        },
    
        clear: () => {
            this.score = 0
        },
    
        display: () => {
            fill(255, 255, 255)
            textSize(14);
            text('Pontos: ' + this.score, width -70, 20)
        }
    }

}