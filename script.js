document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('quiz-form');
    const scoreBoard = document.getElementById('score-board');
    const scoreValueEl = scoreBoard.querySelector('.score-value');
    const scoreTotalEl = scoreBoard.querySelector('.score-total');
    const scorePercentageEl = scoreBoard.querySelector('.score-percentage');
    const progressIndicatorEl = document.getElementById('progress-indicator');
    const passFailStatusEl = document.getElementById('pass-fail-status');
    const progressBarEl = document.getElementById('progress-bar');
    const themeToggleBtn = document.getElementById('theme-toggle');
    
    // Test action buttons
    const markAllCorrectBtn = document.getElementById('mark-all-correct');
    const randomizeAnswersBtn = document.getElementById('randomize-answers');

    // Add result code container
    let resultCode = '';
    let currentAnswers = {};

    // Check for result code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');

    // Define question categories
    const categories = {
        "Уголовный кодекс": [],
        "Административный + Дорожный кодексы": [],
        "Законы": [],
        "Процессуальный кодекс": [],
        "Устав LSCSD": []
    };

    // Group questions by category
    quizData.forEach((item, index) => {
        // If question already has a category assigned, use it
        if (item.category && item.category === "Устав LSCSD") {
            categories["Устав LSCSD"].push({item, index});
        }
        // Skip placeholder questions
        else if (item.question === "Упразднено" && item.answer === "Упразднено") {
            // Skip this item
        }
        // Categorize questions based on content
        else if (item.question.includes("УК") || item.answer.includes("УК") || 
            item.question.toLowerCase().includes("статья") || 
            item.question.toLowerCase().includes("гражданин") || 
            item.question.toLowerCase().includes("преступление")) {
            item.category = "Уголовный кодекс";
            categories["Уголовный кодекс"].push({item, index});
        } 
        else if (item.question.includes("АК") || item.answer.includes("АК") || 
                item.question.includes("ДК") || item.answer.includes("ДК") ||
                item.question.toLowerCase().includes("движение") || 
                item.question.toLowerCase().includes("парковка") || 
                item.question.toLowerCase().includes("штраф")) {
            item.category = "Административный + Дорожный кодексы";
            categories["Административный + Дорожный кодексы"].push({item, index});
        }
        else if (item.question.toLowerCase().includes("пк") || item.answer.toLowerCase().includes("пк") ||
                item.question.toLowerCase().includes("допрос") || 
                item.question.toLowerCase().includes("задержани") || 
                item.question.toLowerCase().includes("миранд") ||
                item.question.toLowerCase().includes("адвокат")) {
            item.category = "Процессуальный кодекс";
            categories["Процессуальный кодекс"].push({item, index});
        }
        else {
            item.category = "Законы";
            categories["Законы"].push({item, index});
        }
    });

    // Calculate total questions excluding placeholders
    const totalQuestions = quizData.filter(item => !(item.question === "Упразднено" && item.answer === "Упразднено")).length;
    scoreTotalEl.textContent = totalQuestions; // Set total score possible (1 point per question max)
    progressIndicatorEl.textContent = `Отвечено: 0 / ${totalQuestions}`;

    // Theme Toggle Functionality
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        
        // Toggle icon
        const icon = themeToggleBtn.querySelector('i');
        if (icon.classList.contains('bi-moon-fill')) {
            icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
        } else {
            icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
        }
    });

    // Create category containers
    Object.keys(categories).forEach(categoryName => {
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
        
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('category-header');
        categoryHeader.innerHTML = `
            <h2>${categoryName}</h2>
            <span class="category-count">${categories[categoryName].length} вопросов</span>
            <button class="toggle-category"><i class="bi bi-chevron-up"></i></button>
        `;
        
        // Add toggle functionality
        const toggleBtn = categoryHeader.querySelector('.toggle-category');
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const categoryQuestions = categoryContainer.querySelector('.category-questions');
            const icon = toggleBtn.querySelector('i');
            
            if (categoryQuestions.classList.contains('collapsed')) {
                categoryQuestions.classList.remove('collapsed');
                icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
            } else {
                categoryQuestions.classList.add('collapsed');
                icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
            }
        });
        
        // Make the whole header clickable
        categoryHeader.addEventListener('click', () => {
            const categoryQuestions = categoryContainer.querySelector('.category-questions');
            const icon = toggleBtn.querySelector('i');
            
            if (categoryQuestions.classList.contains('collapsed')) {
                categoryQuestions.classList.remove('collapsed');
                icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
            } else {
                categoryQuestions.classList.add('collapsed');
                icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
            }
        });
        
        // Create questions container for this category
        const categoryQuestions = document.createElement('div');
        categoryQuestions.classList.add('category-questions');
        
        categoryContainer.appendChild(categoryHeader);
        categoryContainer.appendChild(categoryQuestions);
        
        // Add to quiz form
        quizForm.appendChild(categoryContainer);
        
        // Add animation with delay
        setTimeout(() => {
            categoryHeader.style.opacity = '1';
            categoryHeader.style.transform = 'translateY(0)';
        }, 100);
        
        // Populate with questions
        categories[categoryName].forEach(({item, index}, i) => {
            const qNumber = index + 1;
            
            // Create the question item
            const questionItem = createQuestionItem(item, qNumber);
            
            // Only add to DOM if not null (skipped questions will return null)
            if (questionItem) {
                // Add entrance animation with delay based on index
                setTimeout(() => {
                    questionItem.style.opacity = '1';
                    questionItem.style.transform = 'translateY(0)';
                }, i * 50 + 150);
                
                categoryQuestions.appendChild(questionItem);
            }
        });
    });

    // Function to create question item
    function createQuestionItem(item, qNumber) {
        // Skip placeholder/deleted questions
        if (item.question === "Упразднено" && item.answer === "Упразднено") {
            return null;
        }
        
        // Create main container for the question
        const questionItem = document.createElement('div');
        questionItem.classList.add('question-item');
        questionItem.dataset.questionId = qNumber;
        questionItem.dataset.category = item.category;
        
        // Header (Number and Status)
        const header = document.createElement('div');
        header.classList.add('question-header');

        const qNumSpan = document.createElement('span');
        qNumSpan.classList.add('question-number');
        qNumSpan.textContent = `Вопрос ${qNumber}`;

        const statusSpan = document.createElement('span');
        statusSpan.classList.add('question-status');
        statusSpan.textContent = item.status;
        if (item.status === 'Обязательно') {
            statusSpan.classList.add('status-required');
        }

        const categoryBadge = document.createElement('span');
        categoryBadge.classList.add('category-badge');
        categoryBadge.textContent = item.category;
        
        header.appendChild(qNumSpan);
        header.appendChild(categoryBadge);
        header.appendChild(statusSpan);

        // Question Text
        const questionText = document.createElement('div');
        questionText.classList.add('question-text');
        questionText.textContent = item.question;

        // Correct Answer Text
        const correctAnswer = document.createElement('div');
        correctAnswer.classList.add('correct-answer');
        correctAnswer.innerHTML = `<strong>Правильный ответ:</strong> ${item.answer}`;

        // Assessment Options Container
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('assessment-options');

        const options = [
            { value: 'correct', label: '= Правильно' },
            { value: 'partial', label: '- Частично правильно' },
            { value: 'not_asked', label: 'Не спрашивал' },
            { value: 'incorrect', label: 'Не правильно' }
        ];

        // Create Radio Buttons and Labels
        options.forEach(option => {
            const radioId = `q${qNumber}_${option.value}`;

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = `q${qNumber}`; // Group radios by question number
            radioInput.value = option.value;
            radioInput.id = radioId;

            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = radioId;
            radioLabel.textContent = option.label;
            
            // Add click effect
            radioLabel.addEventListener('click', function(e) {
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('ripple-effect');
                
                const x = e.clientX - e.target.getBoundingClientRect().left;
                const y = e.clientY - e.target.getBoundingClientRect().top;
                
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                // Add highlight animation to the question item
                questionItem.classList.add('answer-selected');
                setTimeout(() => {
                    questionItem.classList.remove('answer-selected');
                }, 500);
            });

            optionsContainer.appendChild(radioInput);
            optionsContainer.appendChild(radioLabel);
        });

        // Assemble the question item
        questionItem.appendChild(header);
        questionItem.appendChild(questionText);
        questionItem.appendChild(correctAnswer);
        questionItem.appendChild(optionsContainer);
        
        // Initial styles for animation
        questionItem.style.opacity = '0';
        questionItem.style.transform = 'translateY(20px)';
        questionItem.style.transition = 'all 0.5s ease';

        return questionItem;
    }

    // --- Create Result Code System ---
    // Function to generate result code
    function generateResultCode(answers) {
        let codeString = '';
        
        // Generate code using question numbers and answer values
        Object.keys(answers).sort((a, b) => {
            // Extract numbers and sort numerically
            const numA = parseInt(a.replace('q', ''));
            const numB = parseInt(b.replace('q', ''));
            return numA - numB;
        }).forEach(key => {
            const questionNumber = key.replace('q', '');
            const value = answers[key];
            
            const questionIndex = parseInt(questionNumber) - 1;
            // Skip placeholder questions
            if (questionIndex >= 0 && questionIndex < quizData.length && 
                !(quizData[questionIndex].question === "Упразднено" && quizData[questionIndex].answer === "Упразднено")) {
                
                // Convert value to number code
                let valueCode;
                switch (value) {
                    case 'correct': valueCode = '1'; break;
                    case 'partial': valueCode = '2'; break;
                    case 'incorrect': valueCode = '3'; break;
                    case 'not_asked': valueCode = '4'; break;
                    default: valueCode = '0'; // Unknown
                }
                
                codeString += `${questionNumber}:${valueCode};`;
            }
        });
        
        // Convert to base64 for a shorter URL
        return btoa(codeString);
    }
    
    // Function to parse result code
    function parseResultCode(code) {
        try {
            // Decode the base64 string
            const decodedString = atob(code);
            const answers = {};
            
            // Parse the string in format "1:1;2:2;3:1;"
            const answerPairs = decodedString.split(';').filter(Boolean);
            answerPairs.forEach(pair => {
                const [questionNum, valueCode] = pair.split(':');
                
                // Convert value code back to answer value
                let value;
                switch (valueCode) {
                    case '1': value = 'correct'; break;
                    case '2': value = 'partial'; break;
                    case '3': value = 'incorrect'; break;
                    case '4': value = 'not_asked'; break;
                    default: return; // Skip invalid codes
                }
                
                answers[`q${questionNum}`] = value;
            });
            
            return answers;
        } catch (error) {
            console.error('Failed to parse result code:', error);
            return {};
        }
    }
    
    // Function to apply answers from code
    function applyAnswersFromCode(answers) {
        // Reset any existing selections
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            radio.checked = false;
        });
        
        // Apply the answers from the parsed code
        Object.keys(answers).forEach(key => {
            const questionNumber = key.replace('q', '');
            const value = answers[key];
            
            const questionIndex = parseInt(questionNumber) - 1;
            
            // Skip if this is a placeholder question
            if (questionIndex >= 0 && questionIndex < quizData.length && 
                !(quizData[questionIndex].question === "Упразднено" && quizData[questionIndex].answer === "Упразднено")) {
                
                const radioId = `${key}_${value}`;
                const radioElement = document.getElementById(radioId);
                
                if (radioElement) {
                    radioElement.checked = true;
                }
            }
        });
        
        // Update score display
        calculateAndUpdateScore();
    }

    // Add share result UI
    const shareResultContainer = document.createElement('div');
    shareResultContainer.classList.add('share-result-container');
    shareResultContainer.innerHTML = `
        <div class="code-header">
            <h3><i class="bi bi-share-fill"></i> Код результата</h3>
            <div class="code-description">Этот код содержит ваши ответы. Поделитесь им для проверки результатов.</div>
        </div>
        <div class="code-display">
            <textarea id="result-code" readonly></textarea>
            <button id="copy-code" title="Копировать код"><i class="bi bi-clipboard"></i></button>
        </div>
        <div class="code-actions">
            <button id="share-link"><i class="bi bi-share"></i> Поделиться ссылкой</button>
            <div class="code-input-container">
                <input type="text" id="code-input" placeholder="Вставьте код результата сюда">
                <button id="load-code"><i class="bi bi-arrow-repeat"></i> Загрузить</button>
            </div>
        </div>
    `;
    
    // Create floating share button
    const shareButton = document.createElement('div');
    shareButton.classList.add('floating-share-button');
    shareButton.innerHTML = '<i class="bi bi-share-fill"></i>';
    document.body.appendChild(shareButton);
    
    // Toggle share container visibility
    shareButton.addEventListener('click', () => {
        shareResultContainer.classList.toggle('visible');
        shareButton.classList.toggle('active');
    });
    
    // Insert after scoreboard
    scoreBoard.parentNode.insertBefore(shareResultContainer, scoreBoard.nextSibling);
    
    // Get share result elements
    const resultCodeEl = document.getElementById('result-code');
    const copyCodeBtn = document.getElementById('copy-code');
    const shareLinkBtn = document.getElementById('share-link');
    const codeInputEl = document.getElementById('code-input');
    const loadCodeBtn = document.getElementById('load-code');
    
    // Handle sharing functionality
    copyCodeBtn.addEventListener('click', () => {
        resultCodeEl.select();
        document.execCommand('copy');
        
        // Visual feedback
        copyCodeBtn.innerHTML = '<i class="bi bi-check"></i>';
        copyCodeBtn.classList.add('copied');
        
        setTimeout(() => {
            copyCodeBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
            copyCodeBtn.classList.remove('copied');
        }, 2000);
    });
    
    shareLinkBtn.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('code', resultCode);
        
        navigator.clipboard.writeText(url.toString()).then(() => {
            // Visual feedback
            shareLinkBtn.innerHTML = '<i class="bi bi-check"></i> Ссылка скопирована';
            
            setTimeout(() => {
                shareLinkBtn.innerHTML = '<i class="bi bi-share"></i> Поделиться ссылкой';
            }, 2000);
        });
    });
    
    loadCodeBtn.addEventListener('click', () => {
        const code = codeInputEl.value.trim();
        if (code) {
            const result = parseResultCode(code);
            if (result) {
                applyAnswersFromCode(result);
                
                // Visual feedback
                loadCodeBtn.innerHTML = '<i class="bi bi-check"></i> Загружено';
                setTimeout(() => {
                    loadCodeBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Загрузить';
                }, 2000);
                
                // Update UI with info from the result
                const formattedDate = new Date(result.timestamp).toLocaleString();
                resultCodeEl.value = code;
                resultCode = code;
                
                // Show when this test was taken
                const infoElement = document.createElement('div');
                infoElement.classList.add('loaded-code-info');
                infoElement.innerHTML = `
                    <div><strong>Загружен результат</strong></div>
                    <div>Дата теста: ${formattedDate}</div>
                    <div>Оценка: ${result.score} / ${totalQuestions} (${result.percentage}%)</div>
                `;
                
                // Remove previous info if exists
                const prevInfo = document.querySelector('.loaded-code-info');
                if (prevInfo) {
                    prevInfo.remove();
                }
                
                shareResultContainer.appendChild(infoElement);
            } else {
                loadCodeBtn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Неверный код';
                setTimeout(() => {
                    loadCodeBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Загрузить';
                }, 2000);
            }
        }
    });
    
    // Check if there's a code in the URL
    if (codeParam) {
        codeInputEl.value = codeParam;
        // Trigger the load button click
        setTimeout(() => {
            loadCodeBtn.click();
            // Make sure the share container is visible
            shareResultContainer.classList.add('visible');
            shareButton.classList.add('active');
        }, 500);
    } else {
        // Hide initially if no code
        shareResultContainer.classList.remove('visible');
    }

    // --- Real-time Score Calculation ---
    function calculateScore(answers) {
        let score = 0;
        let total = 0;
        let attempted = 0;
        
        // Count only non-placeholder questions
        Object.keys(answers).forEach(key => {
            const questionIndex = parseInt(key) - 1;
            // Skip placeholder questions
            if (questionIndex >= 0 && questionIndex < quizData.length && 
                !(quizData[questionIndex].question === "Упразднено" && quizData[questionIndex].answer === "Упразднено")) {
                total++;
                
                if (answers[key] === 'correct') {
                    score++;
                    attempted++;
                } else if (answers[key] === 'partial') {
                    score += 0.5;
                    attempted++;
                } else if (answers[key] === 'incorrect') {
                    attempted++;
                } else if (answers[key] === 'not_asked') {
                    attempted++;
                }
            }
        });
        
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        return { score, total, percentage, attempted };
    }
    
    const calculateAndUpdateScore = () => {
        const answers = {};
        
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            // Extract question number from input ID (format: q{number}_{option})
            const questionKey = radio.id.split('_')[0];
            const questionValue = radio.value;
            answers[questionKey] = questionValue;
        });
        
        const resultCode = generateResultCode(answers);
        window.history.replaceState({}, '', `?code=${resultCode}`);
        
        const scoreResult = calculateScore(answers);
        scoreValueEl.textContent = scoreResult.score.toFixed(1);
        scoreTotalEl.textContent = scoreResult.total;
        scorePercentageEl.textContent = `${scoreResult.percentage}%`;
        
        // Update progress
        progressIndicatorEl.textContent = `Отвечено: ${scoreResult.attempted} / ${scoreResult.total}`;
        const progressPercent = Math.round((scoreResult.attempted / scoreResult.total) * 100);
        progressBarEl.style.width = `${progressPercent}%`;
        
        // Pass fail status
        const passThreshold = 70;
        if (scoreResult.percentage >= passThreshold) {
            passFailStatusEl.innerHTML = '<i class="bi bi-check-circle-fill"></i> СДАН';
            passFailStatusEl.classList.add('pass');
            passFailStatusEl.classList.remove('fail');
        } else {
            passFailStatusEl.innerHTML = '<i class="bi bi-x-circle-fill"></i> НЕ СДАН';
            passFailStatusEl.classList.add('fail');
            passFailStatusEl.classList.remove('pass');
        }
        
        // Reveal score board if more than 80% answered
        if (scoreResult.attempted / scoreResult.total >= 0.8) {
            scoreBoard.classList.add('visible');
        }
        
        return answers;
    };

    // --- Event Listener for Changes ---
    quizForm.addEventListener('change', (event) => {
        // Check if the changed element is a radio button within our form
        if (event.target.type === 'radio' && event.target.name.startsWith('q')) {
            // Add visual feedback when a radio is selected
            const questionItem = event.target.closest('.question-item');
            if (questionItem) {
                // Add a brief highlight effect
                questionItem.classList.add('selection-highlight');
                setTimeout(() => {
                    questionItem.classList.remove('selection-highlight');
                }, 300);
            }
            
            calculateAndUpdateScore();
        }
    });
    
    // --- Test Action Buttons ---
    
    // Mark all correct for testing
    if (markAllCorrectBtn) {
        markAllCorrectBtn.addEventListener('click', () => {
            // Uncheck all inputs first
            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                radio.checked = false;
            });
            
            // Mark all valid questions as correct
            quizData.forEach((item, index) => {
                // Skip placeholder questions
                if (!(item.question === "Упразднено" && item.answer === "Упразднено")) {
                    const questionNum = index + 1;
                    const radioId = `q${questionNum}_correct`;
                    const radioElement = document.getElementById(radioId);
                    
                    if (radioElement) {
                        radioElement.checked = true;
                    }
                }
            });
            
            calculateAndUpdateScore();
        });
    }
    
    // Randomize answers for testing
    if (randomizeAnswersBtn) {
        randomizeAnswersBtn.addEventListener('click', () => {
            // Uncheck all inputs first
            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                radio.checked = false;
            });
            
            const options = ['correct', 'partial', 'incorrect', 'not_asked'];
            
            // Randomize all valid questions
            quizData.forEach((item, index) => {
                // Skip placeholder questions
                if (!(item.question === "Упразднено" && item.answer === "Упразднено")) {
                    const questionNum = index + 1;
                    const randomOption = options[Math.floor(Math.random() * options.length)];
                    const radioId = `q${questionNum}_${randomOption}`;
                    const radioElement = document.getElementById(radioId);
                    
                    if (radioElement) {
                        radioElement.checked = true;
                    }
                }
            });
            
            calculateAndUpdateScore();
        });
    }

    // --- Add additional styles for animations ---
    const style = document.createElement('style');
    style.textContent = `
        .button-clicked {
            transform: scale(0.95) !important;
        }
        
        .pass-celebration {
            animation: celebrate 1.5s ease;
        }
        
        @keyframes celebrate {
            0%, 100% {
                transform: translateY(0);
            }
            20%, 60% {
                transform: translateY(-10px);
            }
            40%, 80% {
                transform: translateY(-5px);
            }
        }
        
        .light-theme {
            --primary-bg: #f8f9fa;
            --secondary-bg: #ffffff;
            --card-bg: #f1f3f5;
            --border-color: #dee2e6;
            --text-color: #212529;
            --muted-text: #6c757d;
            --accent-color: #6200ee;
            --accent-hover: #7c4dff;
            --required-color: #d81b60;
            --correct-color: #00c853;
            --incorrect-color: #d81b60;
            --partial-color: #ff9800;
        }
        
        .dark-theme {
            --primary-bg: #121212;
            --secondary-bg: #1e1e1e;
            --card-bg: #242424;
            --border-color: #333333;
            --text-color: #e0e0e0;
            --muted-text: #a0a0a0;
        }
        
        .category-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            margin: 20px 0 10px 0;
            background: var(--card-bg);
            border-radius: 10px;
            border-left: 5px solid var(--accent-color);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease;
        }
        
        .category-header h2 {
            margin: 0;
            font-size: 1.4em;
            color: var(--text-color);
        }
        
        .category-count {
            font-size: 0.9em;
            background: var(--accent-color);
            color: white;
            padding: 3px 10px;
            border-radius: 15px;
        }
        
        .category-questions {
            display: flex;
            flex-direction: column;
            gap: 25px;
            padding-left: 20px;
            border-left: 2px dashed var(--border-color);
            margin-left: 10px;
        }
        
        .category-badge {
            font-size: 0.75em;
            padding: 2px 8px;
            border-radius: 4px;
            background: var(--accent-color);
            color: white;
            margin-right: 10px;
        }
        
        .share-result-container {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .code-header {
            margin-bottom: 15px;
        }
        
        .code-header h3 {
            margin: 0 0 10px 0;
            color: var(--text-color);
        }
        
        .code-description {
            font-size: 0.9em;
            color: var(--muted-text);
        }
        
        .code-display {
            display: flex;
            margin-bottom: 15px;
        }
        
        #result-code {
            flex: 1;
            background: var(--secondary-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 10px;
            font-family: monospace;
            resize: none;
            height: 60px;
        }
        
        #copy-code {
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 8px;
            margin-left: 10px;
            padding: 0 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        #copy-code:hover {
            background: var(--accent-hover);
        }
        
        #copy-code.copied {
            background: var(--correct-color);
        }
        
        .code-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        #share-link {
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 10px 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        #share-link:hover {
            background: var(--accent-hover);
        }
        
        .code-input-container {
            display: flex;
            flex: 1;
        }
        
        #code-input {
            flex: 1;
            background: var(--secondary-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 8px 0 0 8px;
            padding: 10px;
        }
        
        #load-code {
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 0 8px 8px 0;
            padding: 0 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        #load-code:hover {
            background: var(--accent-hover);
        }
        
        .loaded-code-info {
            margin-top: 15px;
            padding: 10px;
            background: rgba(98, 0, 238, 0.1);
            border-radius: 8px;
            border-left: 4px solid var(--accent-color);
        }
        
        .loaded-answer {
            animation: loaded-pulse 1s ease;
        }
        
        @keyframes loaded-pulse {
            0% {
                background-color: var(--card-bg);
            }
            50% {
                background-color: rgba(98, 0, 238, 0.2);
            }
            100% {
                background-color: var(--card-bg);
            }
        }
        
        @media (max-width: 768px) {
            .code-actions {
                flex-direction: column;
            }
            
            .code-input-container {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);

    // --- Initial Calculation ---
    // Call once on load to set initial state (0 score, etc.)
    calculateAndUpdateScore();

    // Add category filter functionality
    const categoryNavItems = document.querySelectorAll('.cat-nav-item');
    
    // Set first nav item as active
    categoryNavItems[0].classList.add('active');
    
    // Add click handlers to category navigation
    categoryNavItems.forEach(navItem => {
        navItem.addEventListener('click', () => {
            // Remove active class from all items
            categoryNavItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked item
            navItem.classList.add('active');
            
            const selectedCategory = navItem.dataset.category;
            
            // Show/hide categories based on selection
            const categoryContainers = document.querySelectorAll('.category-container');
            
            if (selectedCategory === 'all') {
                // Show all categories
                categoryContainers.forEach(container => {
                    container.style.display = 'block';
                });
            } else {
                // Show only selected category, hide others
                categoryContainers.forEach(container => {
                    const categoryHeader = container.querySelector('.category-header h2');
                    if (categoryHeader && categoryHeader.textContent === selectedCategory) {
                        container.style.display = 'block';
                    } else {
                        container.style.display = 'none';
                    }
                });
            }
            
            // Scroll to the top of the form
            quizForm.scrollIntoView({ behavior: 'smooth' });
        });
    });

});