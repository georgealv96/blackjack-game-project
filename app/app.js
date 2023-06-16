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

/*----- cached element references -----*/
const chipsEl = document.querySelector('.chips')
const availableAmountEl = document.getElementById('available-amount')
const betAmountEl = document.getElementById('bet-amount')
/*----- event listeners -----*/
chipsEl.addEventListener('click', handleChips)
document.querySelector('button').addEventListener('click', placeBet)
/*----- functions -----*/
init()

function init() {
  availableAmount = 1000
  betAmount = 0
  // render function
}

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
      console.log('hola')
      return
  }

  // Update dollar amount
  availableAmountEl.innerHTML = `AVAILABLE: <br><span> $</span>${availableAmount}`
  betAmountEl.innerHTML = `BET: <br><span> $</span>${betAmount}`
  // document.getElementById('#bet-amount').innerText = betAmount
}

function placeBet(evt) {}

/////////////////////////////
function getNewShuffledDeck() {
  // Create a copy of the originalDeck (leave originalDeck untouched!)
  const tempDeck = [...originalDeck]
  const newShuffledDeck = []
  while (tempDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * tempDeck.length)
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0])
  }
  return newShuffledDeck
}

function buildOriginalDeck() {
  const deck = []
  // Use nested forEach to generate card objects
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      deck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of blackjack, not war
        value: Number(rank) || (rank === 'A' ? 11 : 10)
      })
    })
  })
  return deck
}
// function renderNewShuffledDeck() {
//   // Create a copy of the originalDeck (leave originalDeck untouched!)
//   shuffledDeck = getNewShuffledDeck()
//   renderDeckInContainer(shuffledDeck, shuffledContainer)
// }

// function renderDeckInContainer(deck, container) {
//   container.innerHTML = ''
//   // Let's build the cards as a string of HTML
//   let cardsHtml = ''
//   deck.forEach(function (card) {
//     cardsHtml += `<div class="card ${card.face}"></div>`
//   })
//   // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup
//   // const cardsHtml = deck.reduce(function(html, card) {
//   //   return html + `<div class="card ${card.face}"></div>`;
//   // }, '');
//   container.innerHTML = cardsHtml
// }
