/*----- constants -----*/
const suits = ['s', 'c', 'd', 'h']
const ranks = [
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  'J',
  'Q',
  'K',
  'A'
]
// Build an 'original' deck of 'card' objects used to create shuffled decks
const originalDeck = buildOriginalDeck()
/*----- app's state (variables) -----*/

let availableAmount
let betAmount
let cardCount
let insuranceAmount
let isAce
let playersCardsSum
let dealersCardsSum
let isEnoughMoney
let shuffledDeck
let playersCards
let dealersCards

/*----- cached element references -----*/
const chipsEl = document.querySelector('.chips')
const availableAmountEl = document.getElementById('available-amount')
const betAmountEl = document.getElementById('bet-amount')
const placeBetBtn = document.getElementById('place-bet')
const messageEl = document.createElement('div')
const secondPageEl = document.getElementById('second-page')
const playerSideEl = document.getElementById('player-side')
const dealerSideEl = document.getElementById('dealer-side')
/*----- event listeners -----*/
chipsEl.addEventListener('click', handleChips)
placeBetBtn.addEventListener('click', placeBet)

/*----- functions -----*/
init()

// When the page initializes...
function init() {
  availableAmount = 1000
  betAmount = 0
  cardCount = 0
  // render function
}

// When player selects amount of dollars to bet...
function handleChips(evt) {
  // Identify which chip was selected
  let chipSelected = evt.target.getAttribute('id')
  // Substract from the available amount and add to the
  // bet amount as the player clicks on chips, checking that
  // the player have sufficient funds each time
  switch (chipSelected) {
    case 'chip-1':
      if (availableAmount >= 5) {
        betAmount += 5
        availableAmount -= 5
      }
      break
    case 'chip-2':
      if (availableAmount >= 10) {
        betAmount += 10
        availableAmount -= 10
      }
      break
    case 'chip-3':
      if (availableAmount >= 25) {
        betAmount += 25
        availableAmount -= 25
      }
      break
    case 'chip-4':
      if (availableAmount >= 50) {
        betAmount += 50
        availableAmount -= 50
      }
      break
    case 'chip-5':
      if (availableAmount >= 100) {
        betAmount += 100
        availableAmount -= 100
      }
      break
    case 'chip-clear':
      availableAmount += betAmount
      betAmount = 0
      break
    default:
      return
  }

  // Update available and bet amounts
  availableAmountEl.innerHTML = `AVAILABLE: <br><span> $</span>${availableAmount}`
  betAmountEl.innerHTML = `BET: <br><span> $</span>${betAmount}`
}

// When player is ready to place their bets and start the game...
function placeBet(evt) {
  // If the player placed a bet, start the game when they click the "Place Bet" button
  if (betAmount > 0) {
    renderGame()
  } else {
    evt.preventDefault()
    popUpMsg(`Don't be cheap. Make a bet!`)
    return
  }
}

// When the game needs to pop up a message...
function popUpMsg(message) {
  messageEl.innerText = message
  // Insert the message element in the <div> inside of <footer>
  document.querySelector('footer > div').prepend(messageEl)
  // Style the message banner
  messageEl.style.color = 'black'
  messageEl.style.paddingBottom = '1vmin'
  messageEl.style.fontSize = '2.5vmin'
  // Make the message disappear after 2 seconds
  setTimeout(function () {
    messageEl.style.color = 'transparent'
  }, 2000)
}

// When the game starts and is displayed in the screen...
function renderGame() {
  // This makes the second page display
  secondPageEl.style.zIndex = '1'
  secondPageEl.style.display = 'grid'
  // Reset the shuffled deck
  shuffledDeck = []
  // It's going to check if the deck needs to be shuffled below
  shuffledDeck = getNewShuffledDeck()
  ///////////
  // const shuffledCardContainer = document.createElement('section')
  // secondPageEl.append(shuffledCardContainer)
  // renderDeckInContainer(shuffledDeck, shuffledCardContainer)
  //////////
  renderCards()
}

// When the table is being displayed...
function renderCards() {
  dealersCards = []
  playersCards = []
  for (let i = 0; i < 4; i++) {
    if (i % 2 === 0) {
      playersCards.push(shuffledDeck.shift())
    } else {
      dealersCards.unshift(shuffledDeck.shift())
    }
  }
  console.log(shuffledDeck)
  console.log(playersCards)
  console.log(dealersCards)
  renderDeckInContainer(playersCards, playerSideEl, 0)
  renderDeckInContainer(dealersCards, dealerSideEl, 1)
  // CONTINUE HERE (last edited: 06/16 9pm)
}

function renderDeckInContainer(deck, container, faceDown) {
  container.innerHTML = ''
  // Let's build the cards as a string of HTML
  let cardsHtml = ''
  deck.forEach(function (card, idx) {
    // If this is the dealer's second card then face it down
    if (idx === 0 && faceDown) {
      cardsHtml += `<div class="card ${card.face} ${card.back}"></div>`
    } else {
      cardsHtml += `<div class="card ${card.face}"></div>`
    }
  })
  // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup
  // const cardsHtml = deck.reduce(function(html, card) {
  //   return html + `<div class="card ${card.face}"></div>`;
  // }, '');
  container.innerHTML = cardsHtml
}

// When a shuffled deck is needed... (#)
function getNewShuffledDeck() {
  // Create a copy of the originalDeck (leave originalDeck untouched!)
  const tempDeck = [...originalDeck]
  // If there is less than 8 cards in the deck then shuffle from the original deck
  if (shuffledDeck < 8) {
    while (tempDeck.length) {
      // Get a random index for a card still in the tempDeck
      const rndIdx = Math.floor(Math.random() * tempDeck.length)
      // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
      shuffledDeck.push(tempDeck.splice(rndIdx, 1)[0])
    }
  }
  return shuffledDeck
}

// Build a deck of cards... (#)
function buildOriginalDeck() {
  const deck = []
  // Use nested forEach to generate card objects
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      deck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of blackjack, not war
        value: Number(rank) || (rank === 'A' ? 11 : 10),
        // The 'back' property maps to the library's CSS classes for cards
        back: `back-red`
      })
    })
  })
  return deck
}
/////////////////////////////
/////////////////////////////
/////////////////////////////

// function renderNewShuffledDeck() {
//   // Create a copy of the originalDeck (leave originalDeck untouched!)
//   shuffledDeck = getNewShuffledDeck()
//   renderDeckInContainer(shuffledDeck, shuffledContainer)
// }

// Reference (#): https://git.generalassemb.ly/SEI-CC/SEI-6-5/blob/main/Unit_1/08-libraries-frameworks/8.2-css-card-library.md
