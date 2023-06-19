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
let tookInsurance
let aceCount
let playersCardsSum = 0
let dealersCardsSum = 0
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
const hitBtnEl = document.getElementById('hit-btn')
const standBtnEl = document.getElementById('stand-btn')
const dealerHasEl = document.getElementById('dealer-bet-info')
const playerHasEl = document.getElementById('player-bet-info')

/*----- event listeners -----*/

chipsEl.addEventListener('click', handleChips)
placeBetBtn.addEventListener('click', placeBet)
hitBtnEl.addEventListener('click', handleHitBtn)
standBtnEl.addEventListener('click', handleStandBtn)

/*----- functions -----*/
init()

// When the page initializes...
function init() {
  availableAmount = 1000
  betAmount = 0
  cardCount = 0
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
    makeYourBetMsg(`Don't be cheap. Make a bet!`)
    return
  }
}

// When the game needs to pop up a message...
function makeYourBetMsg(message) {
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
  // Show cards on the table with the sum of their values and bet information
  renderTable()

  // If the sum of the player's first two cards is 9, 10 or 11 and they have enough funds then let them double
  if (
    playersCardsSum >= 9 &&
    playersCardsSum <= 11 &&
    availableAmount >= betAmount
  ) {
    // Creating the button to double down
    const doubleDownBtn = document.createElement('button')
    doubleDownBtn.setAttribute('id', 'double-btn')
    doubleDownBtn.innerText = 'DOUBLE'
    document.getElementById('second-page-buttons').append(doubleDownBtn)

    // When the player clicks on the 'double' button...
    doubleDownBtn.addEventListener('click', function () {
      availableAmount -= betAmount
      betAmount *= 2
      updateBetInfo()
      getAnExtraCard()
      showDealersSecondCard()
    })
  }
  // If the dealer is showing an Ace then let the player take insurance
  if (dealersCards[1].value === 11 && availableAmount >= betAmount / 2) {
    const insuranceBtn = document.createElement('button')
    insuranceBtn.setAttribute('id', 'insurance-btn')
    insuranceBtn.innerText = 'INSURANCE'
    document.getElementById('second-page-buttons').append(insuranceBtn)

    // When the player clicks on the 'insurance' button...
    insuranceBtn.addEventListener('click', function () {
      availableAmount -= betAmount / 2
      betAmount += betAmount / 2
      tookInsurance = true
      updateBetInfo()
    })
  }
}

// When the table is being displayed...
function renderTable() {
  // Reset both dealer's and player's hands
  dealersCards = []
  playersCards = []
  // Reset insurance status
  tookInsurance = false
  for (let i = 0; i < 4; i++) {
    if (i % 2 === 0) {
      playersCards.push(shuffledDeck.shift())
    } else {
      dealersCards.unshift(shuffledDeck.shift())
    }
  }

  // Sum the player's first two cards, and the dealer's first two cards
  for (let i = 0; i < 2; i++) {
    playersCardsSum += playersCards[i].value
    dealersCardsSum += dealersCards[i].value
  }
  // If the sum of the player's cards or the sum of the dealer's equal 22 then substract 10
  playersCardsSum = checkForSumOf22(playersCardsSum)
  dealersCardsSum = checkForSumOf22(dealersCardsSum)

  renderDeckInContainer(playersCards, playerSideEl, 0)
  renderDeckInContainer(dealersCards, dealerSideEl, 1)
  ///////////////////////////////
  console.log(playersCards) //
  console.log(dealersCards) //
  console.log(playersCardsSum) //
  ///////////////////////////////
  // Update bet-info
  playerHasEl.innerHTML = `<span id="arrow-2">></span> PLAYER has ${playersCardsSum}`
  dealerHasEl.innerHTML = `<span id="arrow-3">></span> DEALER has ${
    dealersCardsSum - dealersCards[0].value
  }`
  updateBetInfo()
}

// Check for a sum of 22 (two Aces)
function checkForSumOf22(sum) {
  if (sum === 22) {
    return sum - 10
  } else {
    return sum
  }
}

// Search for an Ace in a playing hand
function searchForAce(cardHand) {
  let quantity = 0
  cardHand.forEach(function (card) {
    if (card.isAce) quantity += card.isAce
  })
  return quantity
}

// When player hits...
function handleHitBtn(evt) {
  // Let the player keep clicking on the "Hit" button while the sum of their cards is less than 22
  if (playersCardsSum < 22) {
    getAnExtraCard()
  } else {
    evt.preventDefault()
    // ---> SHOW MESSAGE (PLAYER BUSTED)
  }
}

//
function updateBetInfo() {
  document.getElementById(
    'your-bet-info'
  ).innerHTML = `<span id="arrow-1">></span> YOUR BET: $${betAmount}`
  document.getElementById(
    'available-bet-info'
  ).innerHTML = `<span id="arrow-4">></span> AVAILABLE: $${availableAmount}`
}

//
function getAnExtraCard() {
  playersCards.push(shuffledDeck.shift())
  playersCardsSum += playersCards[playersCards.length - 1].value
  playerSideEl.innerHTML += `<div class="card ${
    playersCards[playersCards.length - 1].face
  }"></div>`
  playerHasEl.innerHTML = `<span id="arrow-2">></span> PLAYER has ${playersCardsSum}`
}

//
function showDealersSecondCard() {
  dealerSideEl.innerHTML = ''
  dealersCards.forEach(function (card) {
    dealerSideEl.innerHTML += `<div class="card ${card.face}"></div>`
  })
  dealerHasEl.innerHTML = `<span id="arrow-2">></span> DEALER has ${dealersCardsSum}`
}

// When player stands...
function handleStandBtn(evt) {
  showDealersSecondCard()
  while (dealersCardsSum < 17) {
    dealersCards.unshift(shuffledDeck.shift())
    dealerSideEl.innerHTML += `<div class="card ${dealersCards[0].face}"></div>`
    dealersCardsSum += dealersCards[0].value
    dealerHasEl.innerHTML = `<span id="arrow-2">></span> DEALER has ${dealersCardsSum}`
    console.log(dealersCardsSum)
    console.log(dealersCards)
  }
  standBtnEl.disabled = true
  hitBtnEl.disabled = true
}

function compareResults() {
  if (playersCardsSum > dealersCardsSum) {
    // what happens when the player wins here
  } else if (playersCardsSum < dealersCardsSum) {
    // what happens when the dealer wins here
  } else {
    // what happens when the player pushes here
  }
}

function renderDeckInContainer(deck, container, faceDown) {
  container.innerHTML = ''
  // Let's build the cards as a string of HTML
  let cardsHtml = ''
  deck.forEach(function (card, idx) {
    // If this is the dealer's second card then face it down
    if (idx === 0 && faceDown) {
      cardsHtml += `<div class="card ${card.face} ${card.back} face-down"></div>`
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
        back: `back-red`,
        // Store if card is an Ace (1) or not (0)
        isAce: rank === 'A' ? 1 : 0
      })
    })
  })
  return deck
}

// Reference (#): https://git.generalassemb.ly/SEI-CC/SEI-6-5/blob/main/Unit_1/08-libraries-frameworks/8.2-css-card-library.md
