/*------------------------------------------------------------------------------------------*/
// To change cards, simply edit this section:

// Name of the Files and the Folder of Cards.
let folder = 'PNG-cards-1.3';    
let nameFull = '1_of_spades.png';
let cardBackFile = 'cardBack00.jpg';

// Format file-name:
let var1Arr = ['ace',2,3,4,5,6,7,8,9,10,'jack','queen','king']; //Possible values for var1.
let var2Arr = ['spades', 'hearts', 'diamonds', 'clubs']; //Possible values for var2.
const nameVar = (var1,var2) => {
    // Format of the file name
    return var1Arr[var1]+'_of_'+var2Arr[var2]+'.png';
} 

let var1Range = var1Arr.length;
let var2Range = var2Arr.length;
let maxPair = 30;
/*------------------------------------------------------------------------------------------*/

/*  1.  Variables   */

// For game logic
let t, username, cardWidth, timeLimit; //Timer, user, cards' size and timeLimit.\
let pairBasedMode = 1; //default


// For DOM
const gameMode = document.getElementById('gameMode');
const gameScr = document.getElementsByClassName('gameScr')[0];
const welcomeScr = document.getElementsByClassName('welcomeScr')[0];
document.getElementById('pairs').max = maxPair;

/* 2.   Helper Functions    */

// Toggling timeLimit Input (Time-based = 0, pair-based = 1.)
gameMode.addEventListener('change',()=>{
    pairBasedMode = (Number)(gameMode.value);
    if(!pairBasedMode){
        document.getElementById('timeLimitDiv').style.display = 'block';
    }
    else{
        document.getElementById('timeLimitDiv').style.display = 'none';
    }
})

// Counts from 0 (increasing) if time===0. 
function showTimer(time){
    const timer = document.getElementById('timer');
    timer.innerHTML = time;
    t = time? setInterval(() => {timer.innerHTML = --time;}, 1000): setInterval(() => {timer.innerHTML = ++time;}, 1000);
    if(time){setTimeout(() => {clearInterval(t);}, time * 1000);}
}

/*  3.  Game Flow   */

// Starting the game
function start(sec){

    // Toggling Screens
    gameScr.style.display = 'flex';
    welcomeScr.style.display = 'none';

    // User Info
    username = document.getElementById('playerName').value;
    document.getElementById('profileName').textContent = username;
    // if cannot parse (none-existent user), new user account will be set.
    try {
        userObj = JSON.parse(localStorage.getItem(username));
        document.getElementById('scorePerSec').innerHTML = `${userObj.highScore} pairs / sec`;
    } catch (error) {
        localStorage.setItem(username, JSON.stringify({
            highScore : 0,
        }));
    }

    // Game Settings
    let pairs = (Number)(document.getElementById('pairs').value);
    // Setting the size of cards.
    cardWidth = Math.max(150 - 30 * Math.floor(pairs/6), 60); // Minimum is 60.
    timeLimit = !pairBasedMode? document.getElementById('timeLimit').value : null;

    // Filling in DOM
    document.getElementById('totalPairs').innerHTML = pairs;
    document.getElementsByClassName('profile')[0].style.display = 'flex';

    // Starts the game.
    let deck = new Cards(pairs).deckArr; // Gets a random deck.
    showTimer(sec); // Shows the timer at the bottom.
    new domDeck(deck, sec, pairs); // The rest of the game.
}

// Based on pairs, outputs a randomized deck.
class Cards{
    constructor(pairs){
        this.pairs = pairs;
        this.deckArr = [];
        this.randomizeChosenCards(this.chooseRandomCards());
    }

    chooseRandomCards(){
        let chosenCards = [];
        let card;
        for(let i = 0; i<this.pairs; i++){
            do{
                card = [
                    Math.floor(Math.random()*var1Range),
                    Math.floor(Math.random()*var2Range)
                ];
            }
            while(chosenCards.includes(card))
            chosenCards.push(card);
        }

        // Two cards for a pair.
        for(let i = 0; i<this.pairs; i++){
            chosenCards.push(chosenCards[i]);
        }
        return chosenCards;
}

    randomizeChosenCards(chosenCards){
        // Takes a card from the chosenCards (Array) at random and puts it in the deckArr
        let cardIndex;
        for(let i = 0; i<this.pairs*2; i++){
            // Take a card -> use it -> set it to ''.
            do{
                cardIndex = Math.floor(Math.random()*this.pairs*2);
            }
            while (chosenCards[cardIndex]==='')
            this.deckArr.push(nameVar(chosenCards[cardIndex][0],chosenCards[cardIndex][1]));
            chosenCards[cardIndex] = '';
        }
    }
}

// Based on the randomized deck, shows the cards on screen and manages event-listeners.
class domDeck{
    constructor(deck,time,pairs){
        this.pairs = pairs;
        this.deck = deck;
        this.correctCount = 0;
        this.cards = document.getElementsByClassName('cards')[0];

        // Shows cards
        this.cards.innerHTML = '';
        this.deck.forEach(card=>this.toggleCards(folder,card));
        
        // Starting game flow after the time to memorize.
        setTimeout(() => {
            this.cards.innerHTML = '';
            this.deck.forEach(card=>this.toggleCards('.',cardBackFile));
            this.listen();

            // Time-based -> Timer starts from timeLimit. Pair-based -> Timer starts from 0.
            if(!pairBasedMode){
                showTimer(timeLimit);
                setTimeout(() => {
                    this.timesup();
                }, timeLimit * 1000);
            }
            else{
                showTimer(0);
            } 
            }, time*1000);
        }
    toggleCards(foldername, filename){
        // Helper function to show/hide cards.
        this.cards.innerHTML += `<div><img src="${foldername}/${filename}" alt="" width="${cardWidth}" class="card"></div>`;
    };
    listen(){
        this.clickNumber = 0;    // How many cards have been selected.
        let chosenCards = []; 
        let cardObjs = document.querySelectorAll('.cards div');
        let cardArr = Array.from(cardObjs); // Because "arr.indexOf()" cannot be used with nodeLists.
        cardObjs.forEach(card=>{
            card.addEventListener('mousedown',e=>{
                if(this.clickNumber>1){return;} // Only two cards can be selected at a time.

                let index = cardArr.indexOf(e.target.parentElement);
                if(chosenCards[0] === cardObjs[index]){
                    // If the same card is selected twice,
                    return;
                }
                chosenCards[this.clickNumber] = cardObjs[index];
                cardObjs[index].innerHTML = `<img src="${folder}/${this.deck[index]}" alt="" width="${cardWidth}" class="card">`;
                this.clickNumber++;
                if(this.clickNumber === 2){
                    // Compare two cards.
                    chosenCards[0].innerHTML === chosenCards[1].innerHTML? this.correct(chosenCards) : this.wrong(chosenCards);
                }
            });
        })
    }
    correct(arr){
        this.correctCount ++;

        // Shows in DOM
        document.getElementById('pairsFound').innerHTML = this.correctCount;
        document.getElementById('completedIcon').style.transform = 'scale(2)';
        setTimeout(() => {
            document.getElementById('completedIcon').style.transform = 'scale(1)';
        }, 300);
        setTimeout(() => {
            arr.forEach(card=>card.style.visibility = 'hidden');
            this.clickNumber = 0;
        }, 300);
        
        if(this.correctCount === this.pairs){
            clearInterval(t);
            this.winAnimation(1);
        }
    }
    wrong(arr){
        setTimeout(() => {
            this.resetCards(arr);
        }, 500);
    }
    resetCards(arr){
        arr.forEach(n => {
            n.innerHTML = `<img src="./${cardBackFile}" alt="" width="${cardWidth}" class="card">`;
        });
        this.clickNumber = 0;
    }
    winAnimation(mode){
        // Calculating the Score
        let shownOnTimer = (Number)(document.getElementById('timer').innerHTML);
        let timeTaken = mode? shownOnTimer : timeLimit - shownOnTimer ;
        let score = (this.correctCount / timeTaken).toFixed(2) ;

        // Comparing with highScore
        if(score > (JSON.parse(localStorage.getItem(username)).highScore)){
            // Saves in localStorage.
            localStorage.setItem(username, JSON.stringify({
                highScore: score
            }));
            // Shows the highscore on the screen.
            document.getElementById('scorePerSec').innerHTML = `${score} pairs / sec`;
        }

        // Showing Results
        gameScr.style.display = 'none';
        document.getElementsByClassName('gameOverScr')[0].innerHTML = `
        <h2> Congratualations <br> for scoring <span class="resultTxt">${this.correctCount} points</span> <br> in <span class="resultTxt">${timeTaken}<span> seconds. </h2>
        <button class='timeCard' onclick="location.reload()">Restart</button>
        `;
    }
    timesup(){
        // For time-based mode.
        this.clickNumber = 2; // All cards disabled.
        this.winAnimation(0);
    }
}

/* Notes:
    -   Coded around 2022 May 17.
    -   Took over 5 hours.
*/