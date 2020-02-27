let startingTime= 0;
let finalScore = 0;

class Field {
    
    constructor(id, rank, column, status, domPart){
        this._id = id;
        this._rank = rank;
        this._column = column;
        this._status = status;
        this._domPart = domPart;
        this._clicked = false;
        this._rightClicked = false;
        this._traversed = false;
        this._flag = false;
    }
}

class Board {
    
    constructor(fields){
        this._fields = fields;
    }

    getFieldById(id) {

        for(let i=0; i<this._fields.length; i++){
            let field = this._fields[i];
            if(field._id==id){
                return this._fields[i]
            }
        }
    }

    getFieldByCoords(x, y) {

        for(let i=0; i<this._fields.length; i++){
            let field = this._fields[i];
            if(field._rank==x & field._column==y){
                return this._fields[i]
            }
        }
    }

    getFieldByDomPart(domPart){

        for(let i=0; i<this._fields.length; i++){
            let field = this._fields[i];
            if(field._domPart==domPart){
                return this._fields[i];
            }
        }

    }

    getNeighbors(id){

        let neighbors = []

        let center = this.getFieldById(id);
        let i = center._rank;
        let j = center._column;

        // dole-levo
        if(i-1>=0 & j-1>=0)
            neighbors.push(this.getFieldByCoords(i-1, j-1));
        // dole
        if(i-1>=0)
            neighbors.push(this.getFieldByCoords(i-1, j));
        // dole desno
        if(i-1>=0 & j+1<=7)
            neighbors.push(this.getFieldByCoords(i-1, j+1));
        // levo
        if(j-1>=0)
            neighbors.push(this.getFieldByCoords(i, j-1));
        //desno
        if(j+1<=7)
            neighbors.push(this.getFieldByCoords(i, j+1));
        //gore levo
        if(i+1<=7 & j-1>=0)
            neighbors.push(this.getFieldByCoords(i+1, j-1));
        //gore
        if(i+1<=7)
            neighbors.push(this.getFieldByCoords(i+1, j));
        //gore desno
        if(i+1<=7 & j+1<=7)
            neighbors.push(this.getFieldByCoords(i+1, j+1));

        return neighbors;
    }

    initializeBombs() {
        let bombs = [];

        // nekad generator da 2x isti broj, onda se napravi jedna bomba manje
        for(let i=0; i<10; i++){
            let randField = Math.floor(Math.random()*63);
            this.getFieldById(randField)._status = 100;
            bombs.push(randField);
        }
    
    }
    
    getBombs() {
        
        let bombs=[];
        
        for(let i=0; i<this._fields.length; i++){
            let f = this._fields[i];
            if (f._status==100){
                bombs.push(f);
            }   
        }
        return bombs;
    }

    revealBombs(){
        for(let i=0; i<this._fields.length; i++){
            let f = this._fields[i];
            if (f._status==100){
                f._domPart.innerHTML='<img src="resources/bomb.svg"></img>';
            }   
        }
    }

    calculateBoard() {
        let bombs = this.getBombs()
        for (let i=0; i<bombs.length; i++){
            let field = bombs[i];
            let neighbors = board.getNeighbors(field._id)
            for(let i=0; i<neighbors.length; i++){
                if(neighbors[i]._status != 100){
                    neighbors[i]._status += 1;  
                }
            }
        }
    }

    showBoard() {
        for(let i=0; i<this._fields.length; i++){
            this._fields[i]._domPart.innerHTML = this._fields[i]._status; 
        }
    }

}


function createBoard() {
    
    fields = []

    for(let i=0; i<8; i++){

        let row = document.getElementById('row-'+ String(i+1));

        for(let j=0; j<8; j++){
            let field = document.getElementById(i*8+j+1);
            let newField = new Field(i*8+j+1, i, j, 0 , field);

            field.addEventListener('click',  onFieldClick);
            field.addEventListener('contextmenu', onFieldRightClick);
            field.addEventListener('click', checkEnd);
            field.addEventListener('contextmenu', checkEnd);

            fields.push(newField);
            row.appendChild(field);    
            
        }
    }

    board = new Board(fields);
    return board;
}


function onFieldClick() {

    let field = board.getFieldByDomPart(this);

    if(field._clicked)
        return;

    field._clicked = true;

    // klik na bombu - kraj igre
    if(field._status==100){
    
        alert('Wasted...');
        board.revealBombs();
        clearInterval(timer);
        finalScore = 0;

        for(let i=0; i<board._fields.length; i++){
            let domPart = board._fields[i]._domPart;
            domPart.removeEventListener('click', onFieldClick);
            domPart.removeEventListener('contextmenu', onFieldRightClick);
            domPart.addEventListener('contextmenu', disableRightClick);
            
        }
        
    }   
    else if(field._status != 0){
        field._domPart.style.backgroundColor = '#DEDEDE';
        field._domPart.innerHTML = field._status;
    }

    // sta se desava ako je status 0
    else{

        let queue = [];
        queue.push(field);
        while(queue.length != 0){
            let tmp = queue.pop();
            tmp._traversed = true;
            //otkrij polje
            tmp._domPart.style.backgroundColor = '#DEDEDE';
            if(tmp._status != 0){
                tmp._domPart.innerHTML = tmp._status;
                continue;
            }
            let neighbors = board.getNeighbors(tmp._id);
            
            for(let i=0; i<neighbors.length; i++){
                if(neighbors[i]._status !=100  & neighbors[i]._traversed==false){
                    queue.push(neighbors[i]);
                    neighbors[i]._traversed = true;
                    neighbors[i]._clicked = true;
                }
            }
        }
    }
}

function onFieldRightClick(e) {

    let field = board.getFieldByDomPart(this);

    if(field._clicked){
        e.preventDefault();
        return;
    }
    
    if(!field._flag){
        //povecaj flagCounter
        let flagCount = parseInt(document.getElementById('flagCounter').innerHTML);
        if(flagCount == 10){
            e.preventDefault();
            return;
        }

        flagCount += 1;
        document.getElementById('flagCounter').innerHTML = flagCount + '/10';
        field._flag = true;
        field._domPart.innerHTML = '<img src="resources/dark-flag.svg"></img>';
    }
    else{
        //smanji flagCounter
        let flagCount = parseInt(document.getElementById('flagCounter').innerHTML);
        flagCount -= 1;
        document.getElementById('flagCounter').innerHTML = flagCount + '/10';
        field._flag = false;
        field._domPart.innerHTML = '';
    }

    // field._rightClicked = true;
    e.preventDefault();

}

function disableRightClick(e) {
    e.preventDefault();
}

function checkEnd() {

    let bombs = board.getBombs();
    let fieldsClicked = 0;
    for(let i=0; i<board._fields.length; i++){
        if (board._fields[i]._status != 100 & board._fields[i]._clicked==true)
        fieldsClicked += 1;
    }

    let correctBasics = board._fields.length - fieldsClicked == bombs.length;

    let result = false;

    if(correctBasics)
        result = true;

    // uspesno zavrsio
    if(result==true){
        const playerName = prompt("Enter your name");
        // posalji HTTP zahtev
        // alert('Nice job!!!');
        sendResult(playerName, finalScore);
        restartGame();
    }
}

let clockTimer = setInterval(params => {
    finalScore += 1;
}, 1000);

let timer = setInterval(function name(params) {
    let difference = new Date(new Date()-startingTime);
    let minutes = difference.getMinutes();
    let seconds = difference.getSeconds();
    let minutesToDisplay;

    if(minutes < 10){
        minutesToDisplay = '0' + String(minutes);
    }
    else 
        minutesToDisplay = '' +  String(minutes);

    let secondsToDisplay;
    if(seconds < 10){
        secondsToDisplay = '0' + String(seconds);
    }
    else 
        secondsToDisplay = '' + String(seconds);
    
    document.getElementById('timeCounter').innerHTML = minutesToDisplay + ':' + secondsToDisplay;

}, 1000);

// TODO: pauza; da tajmer krece tek kad se 1. put klikne

function beginGame(){
    startingTime = new Date();
    let board = createBoard();
    board.initializeBombs();
    board.calculateBoard();
}

beginGame();

function sendResult(playerName, finalScore) {
    axios.put('http://localhost:3001/players', {
            name: playerName,
            score: finalScore
        })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}

function restartGame() {
    location.reload();
    beginGame();
}

function goToLeaderboard(){
    console.log('Tablica');
    window.open("http://localhost:3000");
}