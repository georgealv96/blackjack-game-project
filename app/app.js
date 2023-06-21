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

let availableAmount = 1000
let betAmount = 0
let playersCardsSum
let dealersCardsSum
let shuffledDeck = []
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
const dealerHasEl = document.getElementById('dealer-bet-info')
const playerHasEl = document.getElementById('player-bet-info')
const doubleDownBtn = document.createElement('button')
const bottomSideEl = document.getElementById('second-page-buttons')

/*----- event listeners -----*/

chipsEl.addEventListener('click', handleChips)
placeBetBtn.addEventListener('click', placeBet)

/*----- functions -----*/

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
  // Update available amount to bet
  availableAmountEl.innerHTML = `AVAILABLE: <br><span> $</span>${availableAmount}`
  // Update bet amounts
  betAmountEl.innerHTML = `BET: <br><span> $</span>${betAmount}`
}

// When player is ready to place their bets and start the game...
function placeBet(evt) {
  // If the player placed a bet, start the game when they click the "Place Bet" button
  if (betAmount > 0) {
    secondPageEl.style.opacity = '1'
    renderGame()
  } else if (betAmount === 0 && availableAmount === 0) {
    makeYourBetMsg(`Insufficient funds. Reset page.`)
    return
  } else {
    evt.preventDefault()
    makeYourBetMsg(`Don't be cheap. Make a bet!`)
    return
  }
}

// Show a message when the player wants to play but hasn't bet any money yet
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
  bottomSideEl.innerHTML = `<button id="hit-btn">HIT</button>
  <button id="stand-btn">STAND</button>`
  const hitBtnEl = document.getElementById('hit-btn')
  const standBtnEl = document.getElementById('stand-btn')
  hitBtnEl.addEventListener('click', handleHitBtn)
  standBtnEl.addEventListener('click', function () {
    dealersTurn()
    compareResults()
  })

  // This makes the second page display
  secondPageEl.style.zIndex = '1'
  secondPageEl.style.display = 'grid'

  // Show cards on the table with the sum of their values and bet information
  renderTable()

  // If the sum of the player's first two cards is 9, 10 or 11 and they have enough funds then let them double down
  if (
    playersCardsSum >= 9 &&
    playersCardsSum <= 11 &&
    availableAmount >= betAmount
  ) {
    // Create the button
    doubleDownBtn.setAttribute('id', 'double-btn')
    doubleDownBtn.innerText = 'DOUBLE'
    document.getElementById('second-page-buttons').append(doubleDownBtn)
    console.log(betAmount) // DELETE LATER
    // When the player clicks on the 'double' button...
    doubleDownBtn.addEventListener('click', function () {
      availableAmount -= betAmount
      betAmount *= 2
      updateBetInfo()
      getAnExtraCard()
      dealersTurn()
      compareResults()
      doubleDownBtn.remove()
    })
  }

  // When the table is being displayed...
  function renderTable() {
    if (shuffledDeck.length < 10) {
      shuffledDeck = getNewShuffledDeck()
    }
    hitBtnEl.disabled = false
    standBtnEl.disabled = false
    // Reset both dealer's and player's hands
    dealersCards = []
    playersCards = []
    // Reset both dealer's and player's cards sum
    playersCardsSum = 0
    dealersCardsSum = 0
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

    // Check hands if they aces that need to be converted to ones
    playersCardsSum = searchForAce(playersCards, playersCardsSum)
    dealersCardsSum = searchForAce(dealersCards, dealersCardsSum)

    // Display first two cards on the screen
    renderDeckInContainer(playersCards, playerSideEl, 0)
    renderDeckInContainer(dealersCards, dealerSideEl, 1)

    // Update bet-info
    playerHasEl.innerHTML = `<span id="arrow-2">></span> PLAYER has ${playersCardsSum}`
    dealerHasEl.innerHTML = `<span id="arrow-3">></span> DEALER has ${
      dealersCardsSum - dealersCards[0].value
    }`

    // Check if the player or the dealer have a blackjack
    if (playersCardsSum === 21 && dealersCardsSum !== 21) {
      dealersTurn()
      availableAmount += betAmount * 2.5
      renderResults('BLACKJACK!')
    } else if (playersCardsSum !== 21 && dealersCardsSum === 21) {
      dealersTurn()
      renderResults('DEALER WINS!')
    }

    // Update current bet information on the screen
    updateBetInfo()
  }

  // Search for Aces in a playing hand and convert them to ones if necessary
  function searchForAce(cardHand, cardSum) {
    if (cardSum > 21) {
      for (card of cardHand) {
        if (card.isAce === 1) {
          cardSum -= 10
          card.isAce = 0
          break
        }
      }
    }
    return cardSum
  }

  // When player hits...
  function handleHitBtn(evt) {
    // Remove the 'double' button
    doubleDownBtn.remove()
    // Let the player keep clicking on the "Hit" button while the sum of their cards is less than 22
    if (playersCardsSum < 22) {
      getAnExtraCard()
    } else {
      evt.preventDefault()
    }
    // Check again for the sum of the player's cards and if it's greater or equal than 22 then it's the dealer's turn now
    if (playersCardsSum >= 22) {
      dealersTurn()
      compareResults()
    }
  }

  // Update the bet information on the table
  function updateBetInfo() {
    document.getElementById(
      'your-bet-info'
    ).innerHTML = `<span id="arrow-1">></span> YOUR BET: $${betAmount}`
    document.getElementById(
      'available-bet-info'
    ).innerHTML = `<span id="arrow-4">></span> AVAILABLE: $${availableAmount}`
  }

  // Get the player an extra card
  function getAnExtraCard() {
    // The player's hand gets a new card
    playersCards.push(shuffledDeck.shift())
    // The value of the new card is added to the sum of their previous cards
    playersCardsSum += playersCards[playersCards.length - 1].value
    // The new card gets displayed
    playerSideEl.innerHTML += `<div class="card ${
      playersCards[playersCards.length - 1].face
    }"></div>`
    playersCardsSum = searchForAce(playersCards, playersCardsSum)
    // The new total for the player's hand is displayed
    playerHasEl.innerHTML = `<span id="arrow-2">></span> PLAYER has ${playersCardsSum}`
  }

  // Show the dealer's second card and extra cards if necessary
  function dealersTurn() {
    // Flip the second card face up
    dealerSideEl.innerHTML = ''
    dealersCards.forEach(function (card) {
      dealerSideEl.innerHTML += `<div class="card ${card.face}"></div>`
    })
    // Display the sum of both first cards
    dealerHasEl.innerHTML = `<span id="arrow-2">></span> DEALER has ${dealersCardsSum}`

    // Grab an extra card as long as the total value of the hand is less than 17
    while (dealersCardsSum <= 17) {
      if (
        (dealersCardsSum === 17 &&
          dealersCards.some(function (card) {
            return card.isAce === 1
          })) ||
        dealersCardsSum < 17
      ) {
        dealersCards.unshift(shuffledDeck.shift())
        dealerSideEl.innerHTML += `<div class="card ${dealersCards[0].face}"></div>`
        dealersCardsSum += dealersCards[0].value
        dealersCardsSum = searchForAce(dealersCards, dealersCardsSum)
        dealerHasEl.innerHTML = `<span id="arrow-2">></span> DEALER has ${dealersCardsSum}`
      } else {
        break
      }
    }
    // Disable 'hit' and 'stand' buttons
    standBtnEl.disabled = true
    hitBtnEl.disabled = true
  }

  // When the results are being compared...
  function compareResults() {
    if (
      playersCardsSum < 22 &&
      (playersCardsSum > dealersCardsSum || dealersCardsSum >= 22)
    ) {
      availableAmount += betAmount * 2
      renderResults('PLAYER WINS!')
    } else if (playersCardsSum > 21 || dealersCardsSum > playersCardsSum) {
      renderResults('DEALER WINS!')
    } else {
      availableAmount += betAmount
      renderResults("IT'S A PUSH!")
    }
    // Update the wagering information displaying on the screen
    updateBetInfo()
  }

  // Render results and a 'bet again' button
  function renderResults(message) {
    bottomSideEl.innerHTML = `<h1>${message}</h1>
  <button id="go-back">BET AGAIN</button>`
    const goBackBtn = document.getElementById('go-back')
    // When clicked, this button will take user to the main page
    goBackBtn.addEventListener('click', function (evt) {
      secondPageEl.style.opacity = '0'
      secondPageEl.style.zIndex = '-1'
      // Reset bet to zero
      betAmount = 0
      // Update bet amounts
      betAmountEl.innerHTML = `BET: <br><span> $</span>${betAmount}`
      // Update available amount to bet
      availableAmountEl.innerHTML = `AVAILABLE: <br><span> $</span>${availableAmount}`
      renderTable()
    })
  }

  // When the cards are being delt...
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
    container.innerHTML = cardsHtml
  }
}

// When a shuffled deck is needed... (#)
function getNewShuffledDeck() {
  // Create a copy of the originalDeck
  const tempDeck = [...originalDeck]
  while (tempDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * tempDeck.length)
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    shuffledDeck.push(tempDeck.splice(rndIdx, 1)[0])
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

//    THINGS TO DO:
// > FIX WHAT DEALER STANDS ON
// > WORK ON POSSIBLE BONUSES (AUDIO INCLUDED)
