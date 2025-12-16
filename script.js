const quoteDisplayElement = document.getElementById('quote-display')
const userInputElement = document.getElementById('user-input')
const timerElement = document.getElementById('timer')
const startButton = document.getElementById('start-button')
const resultsElement = document.getElementById('results')

let timerInterval = null
let startTime = null
let quote = ''

const quotes = [
    "业精于勤，荒于嬉；行成于思，毁于随。",
    "天行健，君子以自强不息；地势坤，君子以厚德载物。",
    "三人行，必有我师焉；择其善者而从之，其不善者而改之。",
    "志当存高远。",
    "少壮不努力，老大徒伤悲。"
]

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)]
}

function updateQuote() {
    quote = getRandomQuote()
    quoteDisplayElement.innerText = ''
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span')
        characterSpan.innerText = character
        quoteDisplayElement.appendChild(characterSpan)
    })
    userInputElement.value = null
}

function startTimer() {
    timerElement.innerText = '00:00'
    startTime = new Date()
    timerInterval = setInterval(() => {
        timerElement.innerText = getTimerTime()
    }, 1000)
}

function getTimerTime() {
    return formatTime(Math.floor((new Date() - startTime) / 1000))
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainder = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`
}

function stopTimer() {
    clearInterval(timerInterval)
}

function calculateTypingSpeed() {
    const timeInSeconds = (new Date() - startTime) / 1000
    const wordsTyped = userInputElement.value.trim().split(/\s+/).length
    const wordsPerMinute = Math.round((wordsTyped / timeInSeconds) * 60)
    return wordsPerMinute > 0 ? wordsPerMinute : 0
}

function calculateAccuracy() {
    let correctCharacters = 0
    let totalCharacters = quote.length
    const quoteCharacters = quoteDisplayElement.querySelectorAll('span')

    quoteCharacters.forEach((characterSpan, index) => {
        if (userInputElement.value[index] == characterSpan.innerText) {
            correctCharacters++
        }
    })
    return Math.round((correctCharacters / totalCharacters) * 100)
}

function displayResults() {
    stopTimer()
    const speed = calculateTypingSpeed()
    const accuracy = calculateAccuracy()
    resultsElement.innerText = `速度: ${speed} WPM | 准确率: ${accuracy}%`

    // Save result to history
    saveResultToHistory(speed, accuracy)

    // Refresh history display
    loadAndRenderHistory()
}

function saveResultToHistory(speed, accuracy) {
    // Create result object
    const result = {
        speed: speed,
        accuracy: accuracy,
        timestamp: new Date().toISOString()
    }

    // Get existing history or create new array
    let history = JSON.parse(localStorage.getItem('typingTestHistory')) || []

    // Add new result to the beginning
    history.unshift(result)

    // Keep only the last 10 results
    if (history.length > 10) {
        history = history.slice(0, 10)
    }

    // Save back to localStorage
    localStorage.setItem('typingTestHistory', JSON.stringify(history))
}

function loadAndRenderHistory() {
    const history = JSON.parse(localStorage.getItem('typingTestHistory')) || []
    const historyElement = document.getElementById('history')

    if (!historyElement) return

    // Clear existing content
    historyElement.innerHTML = ''

    // Create history items
    history.forEach((result, index) => {
        const resultDiv = document.createElement('div')
        resultDiv.className = 'history-item'

        // Format date
        const date = new Date(result.timestamp)
        const formattedDate = date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })

        resultDiv.innerHTML = `
            <div class="history-rank">#${index + 1}</div>
            <div class="history-speed">${result.speed} WPM</div>
            <div class="history-accuracy">${result.accuracy}%</div>
            <div class="history-date">${formattedDate}</div>
        `

        historyElement.appendChild(resultDiv)
    })
}

startButton.addEventListener('click', () => {
    updateQuote()
    startTimer()
    startButton.disabled = true; // 禁用开始按钮
    userInputElement.disabled = false; // 启用输入框
    userInputElement.focus(); // 自动聚焦到输入框
    resultsElement.innerText = ''; // 清空上次结果
})

userInputElement.addEventListener('input', () => {
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayValue = userInputElement.value.split('')
    let correct = true
    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index]
        if (character == null) {
            characterSpan.classList.remove('correct')
            characterSpan.classList.remove('incorrect')
            correct = false
        } else if (character === characterSpan.innerText) {
            characterSpan.classList.add('correct')
            characterSpan.classList.remove('incorrect')
            // 正确输入动效：字符轻微上浮+透明度渐变，伴随粒子飞散效果 (待实现)
        } else {
            characterSpan.classList.remove('correct')
            characterSpan.classList.add('incorrect')
            // 错误输入动效：字符左右抖动+红色边框闪烁（频率0.2秒，持续3次）(待实现)
            characterSpan.classList.add('shake'); // 添加 shake 类来实现抖动效果
            setTimeout(() => {
                characterSpan.classList.remove('shake'); // 0.6秒后移除 shake 类，停止抖动
            }, 600); // 震动持续 0.6 秒
            correct = false
        }
    })

    if (correct && arrayValue.length === quote.length) {
        displayResults()
        startButton.disabled = false; // 重新启用开始按钮
        userInputElement.disabled = true; // 禁用输入框
        clearInterval(timerInterval); // 停止计时器
    }
})


userInputElement.disabled = true; // 初始禁用输入框

// Load and render history when page loads
loadAndRenderHistory()
