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
    
    // Create timer element
    const timerEl = document.createElement('div');
    timerEl.id = 'exam-timer';
    timerEl.className = 'exam-timer';
    timerEl.innerHTML = '<i class="bi bi-stopwatch"></i> Время: 00:00';
    
    // Insert before the progress indicator
    progressIndicatorEl.parentNode.insertBefore(timerEl, progressIndicatorEl);
    
    // Set up timer variables
    let timerInterval;
    let timerSeconds = 0;
    let timerStarted = false;
    
    // Function to format time
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    // Function to start timer
    const startTimer = () => {
        if (!timerStarted) {
            timerStarted = true;
            timerInterval = setInterval(() => {
                timerSeconds++;
                timerEl.innerHTML = `<i class="bi bi-stopwatch"></i> Время: ${formatTime(timerSeconds)}`;
            }, 1000);
        }
    };
    
    // Create elements to track required vs optional questions
    const requiredProgressEl = document.createElement('div');
    requiredProgressEl.id = 'required-progress';
    requiredProgressEl.className = 'progress-detail';
    
    const optionalProgressEl = document.createElement('div');
    optionalProgressEl.id = 'optional-progress';
    optionalProgressEl.className = 'progress-detail';
    
    // Insert after progress indicator
    progressIndicatorEl.insertAdjacentElement('afterend', requiredProgressEl);
    requiredProgressEl.insertAdjacentElement('afterend', optionalProgressEl);
    
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

    const totalQuestions = quizData.length;
    
    // Calculate maximum possible score based on required questions
    let maxPossibleScore = 0;
    quizData.forEach(item => {
        maxPossibleScore += (item.status === "Обязательно") ? 1.5 : 1;
    });
    
    scoreTotalEl.textContent = maxPossibleScore.toFixed(1); // Set total score possible with new scoring system
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
            
            // Add entrance animation with delay based on index
            setTimeout(() => {
                questionItem.style.opacity = '1';
                questionItem.style.transform = 'translateY(0)';
            }, i * 50 + 150);
            
            categoryQuestions.appendChild(questionItem);
        });
    });

    // Create filter for optional questions
    const filterContainer = document.createElement('div');
    filterContainer.classList.add('filter-container');
    filterContainer.innerHTML = `
        <div class="filter-option">
            <input type="checkbox" id="show-optional-questions" checked>
            <label for="show-optional-questions">Показывать необязательные вопросы</label>
        </div>
    `;
    
    // Insert filter before the category navigation
    const categoryNav = document.getElementById('category-nav');
    categoryNav.parentNode.insertBefore(filterContainer, categoryNav);
    
    // Add event listener for optional questions toggle
    const showOptionalCheckbox = document.getElementById('show-optional-questions');
    showOptionalCheckbox.addEventListener('change', () => {
        const showOptional = showOptionalCheckbox.checked;
        toggleOptionalQuestions(!showOptional);
        
        // Show notification
        const notif = document.createElement('div');
        notif.className = 'filter-notification';
        notif.textContent = showOptional ? 
            'Показаны все вопросы' : 
            'Показаны только обязательные вопросы';
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.classList.add('show');
            setTimeout(() => {
                notif.classList.remove('show');
                setTimeout(() => {
                    notif.remove();
                }, 300);
            }, 2000);
        }, 10);
    });

    // Function to create question item
    function createQuestionItem(item, qNumber) {
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
            { value: 'correct', label: 'Правильно' },
            { value: 'partial', label: 'Частично правильно' },
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
        // Create a compressed version of answers
        const answerValues = {
            'correct': 'c',
            'partial': 'p',
            'not_asked': 'n',
            'incorrect': 'i'
        };
        
        let answerString = '';
        for (let i = 1; i <= totalQuestions; i++) {
            if (answers[`q${i}`]) {
                answerString += answerValues[answers[`q${i}`]];
            } else {
                answerString += 'x'; // unanswered
            }
        }
        
        // Add score as part of the code
        const score = calculateScore(answers);
        const percentage = totalQuestions > 0 ? ((score / maxPossibleScore) * 100).toFixed(0) : 0;
        
        // Create base64 encoded string
        let codeData = {
            a: answerString,
            s: score,
            p: percentage,
            t: new Date().toISOString(),
            examTime: timerSeconds // Add exam time in seconds
        };
        
        return btoa(JSON.stringify(codeData));
    }
    
    // Function to parse result code
    function parseResultCode(code) {
        try {
            const decoded = JSON.parse(atob(code));
            
            if (!decoded.a || typeof decoded.s !== 'number') {
                throw new Error('Invalid code format');
            }
            
            const answerValues = {
                'c': 'correct',
                'p': 'partial',
                'n': 'not_asked',
                'i': 'incorrect',
                'x': null
            };
            
            let answers = {};
            const answerString = decoded.a;
            
            for (let i = 0; i < answerString.length; i++) {
                const value = answerValues[answerString[i]];
                if (value) {
                    answers[`q${i + 1}`] = value;
                }
            }
            
            return {
                answers,
                score: decoded.s,
                percentage: decoded.p,
                timestamp: new Date(decoded.t),
                examTime: decoded.examTime || 0
            };
        } catch (error) {
            console.error('Failed to parse code:', error);
            return null;
        }
    }
    
    // Function to apply answers from code
    function applyAnswersFromCode(answers) {
        if (!answers) return;
        
        Object.entries(answers).forEach(([questionName, value]) => {
            if (value) {
                const radioInput = document.querySelector(`input[name="${questionName}"][value="${value}"]`);
                if (radioInput) {
                    radioInput.checked = true;
                    const questionItem = radioInput.closest('.question-item');
                    if (questionItem) {
                        questionItem.classList.add('loaded-answer');
                        setTimeout(() => {
                            questionItem.classList.remove('loaded-answer');
                        }, 500);
                    }
                }
            }
        });
        
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
                applyAnswersFromCode(result.answers);
                
                // Visual feedback
                loadCodeBtn.innerHTML = '<i class="bi bi-check"></i> Загружено';
                setTimeout(() => {
                    loadCodeBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Загрузить';
                }, 2000);
                
                // Update UI with info from the result
                const formattedDate = new Date(result.timestamp).toLocaleString();
                resultCodeEl.value = code;
                resultCode = code;
                
                // Set timer to the loaded time
                if (result.examTime) {
                    timerSeconds = result.examTime;
                    timerEl.innerHTML = `<i class="bi bi-stopwatch"></i> Время: ${formatTime(timerSeconds)}`;
                    timerStarted = true;
                }
                
                // Show when this test was taken
                const infoElement = document.createElement('div');
                infoElement.classList.add('loaded-code-info');
                infoElement.innerHTML = `
                    <div><strong>Загружен результат</strong></div>
                    <div>Дата теста: ${formattedDate}</div>
                    <div>Оценка: ${result.score} / ${maxPossibleScore.toFixed(1)} (${result.percentage}%)</div>
                    <div>Время: ${formatTime(result.examTime || 0)}</div>
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
        
        for (let i = 1; i <= totalQuestions; i++) {
            const selectedValue = answers[`q${i}`];
            
            if (selectedValue) {
                // Find the question item to check if it's required
                const questionItem = document.querySelector(`.question-item[data-question-id="${i}"]`);
                const isRequired = questionItem && questionItem.querySelector('.status-required') !== null;
                
                // Base multiplier - 1 for non-required, 1.5 for required questions
                const multiplier = isRequired ? 1.5 : 1;
                
                switch (selectedValue) {
                    case 'correct':
                        score += 1 * multiplier;
                        break;
                    case 'partial':
                        score += 0.5 * multiplier;
                        break;
                    // 'not_asked' and 'incorrect' get 0 points
                }
            }
        }
        
        return score;
    }
    
    const calculateAndUpdateScore = () => {
        let answeredQuestions = 0;
        let answeredRequired = 0;
        let answeredOptional = 0;
        let totalRequired = 0;
        let totalOptional = 0;
        let visibleQuestions = 0;
        currentAnswers = {};

        // Count total required and optional questions
        quizData.forEach(item => {
            if (item.status === "Обязательно") {
                totalRequired++;
            } else {
                totalOptional++;
            }
        });

        for (let i = 1; i <= totalQuestions; i++) {
            // Query within the form for the checked radio in the group
            const selectedOption = quizForm.querySelector(`input[name="q${i}"]:checked`);
            const questionItem = document.querySelector(`.question-item[data-question-id="${i}"]`);
            const isRequired = questionItem && questionItem.querySelector('.status-required') !== null;
            const isVisible = questionItem && questionItem.style.display !== 'none';
            
            // Count visible questions for progress indicator
            if (isVisible) {
                visibleQuestions++;
            }

            if (selectedOption) {
                currentAnswers[`q${i}`] = selectedOption.value;
                
                // Only count answered questions that are visible
                if (isVisible) {
                    answeredQuestions++;
                }
                
                // Track required vs optional answered questions
                if (isRequired) {
                    answeredRequired++;
                } else {
                    answeredOptional++;
                }
            }
        }

        const score = calculateScore(currentAnswers);
        const percentage = totalQuestions > 0 ? ((score / maxPossibleScore) * 100) : 0;
        const progressPercentage = visibleQuestions > 0 ? 
            ((answeredQuestions / visibleQuestions) * 100) : 0;

        // Update Score Display
        scoreValueEl.textContent = score.toFixed(1);
        scorePercentageEl.textContent = `${percentage.toFixed(1)}%`;
        
        // Update progress bar
        progressBarEl.style.width = `${progressPercentage}%`;

        // Get the show optional checkbox state 
        const showOptional = document.getElementById('show-optional-questions').checked;
        
        // Update Progress Indicator - adjust based on filter
        const displayedTotal = !showOptional ? totalRequired : totalQuestions;
        const displayedAnswered = !showOptional ? answeredRequired : answeredQuestions;
        progressIndicatorEl.textContent = `Отвечено: ${displayedAnswered} / ${displayedTotal}`;
        
        // Update required vs optional progress
        requiredProgressEl.textContent = `Обязательные: ${answeredRequired} / ${totalRequired}`;
        requiredProgressEl.className = 'progress-detail required-progress';
        
        optionalProgressEl.textContent = `Не обязательные: ${answeredOptional} / ${totalOptional}`;
        optionalProgressEl.className = 'progress-detail optional-progress';
        
        // Make optional progress invisible if only showing required questions
        if (!showOptional) {
            optionalProgressEl.style.display = 'none';
        } else {
            optionalProgressEl.style.display = 'inline-block';
        }

        // Update Pass/Fail Status in real-time based on the current percentage
        const passThreshold = 70; // Example threshold 70%
        if (percentage >= passThreshold) {
            passFailStatusEl.textContent = 'Результат: Сдал';
            passFailStatusEl.className = 'pass'; // Use class for styling
            
            // Add celebration animation when passing
            if (!scoreBoard.classList.contains('pass-celebration') && answeredQuestions > 5) {
                scoreBoard.classList.add('pass-celebration');
                setTimeout(() => {
                    scoreBoard.classList.remove('pass-celebration');
                }, 1500);
            }
        } else {
            passFailStatusEl.textContent = 'Результат: Не сдал';
            passFailStatusEl.className = 'fail'; // Use class for styling
        }

        // Show actual count of answered questions for better context
        if (!showOptional) {
            // Show remaining required questions
            if (answeredRequired < totalRequired) {
                const remaining = totalRequired - answeredRequired;
                passFailStatusEl.textContent += ` (осталось ${remaining} обязательных ${getWordForm(remaining, 'вопрос', 'вопроса', 'вопросов')})`;
            }
        } else {
            // Show all remaining questions
            if (answeredQuestions < totalQuestions) {
                const remaining = totalQuestions - answeredQuestions;
                passFailStatusEl.textContent += ` (осталось ${remaining} ${getWordForm(remaining, 'вопрос', 'вопроса', 'вопросов')})`;
            }
        }
        
        // Generate and update result code
        resultCode = generateResultCode(currentAnswers);
        resultCodeEl.value = resultCode;
        
        // Show the share container and print button if we have answers
        if (answeredQuestions > 0) {
            shareResultContainer.classList.add('visible');
            shareButton.classList.add('active');
            printReportBtn.style.display = 'block';
        }
    };

    // Helper function for proper word form based on number
    function getWordForm(number, form1, form2, form5) {
        let n = Math.abs(number) % 100;
        let n1 = n % 10;
        if (n > 10 && n < 20) return form5;
        if (n1 > 1 && n1 < 5) return form2;
        if (n1 == 1) return form1;
        return form5;
    }

    // --- Event Listener for Changes ---
    quizForm.addEventListener('change', (event) => {
        // Start timer on first change
        startTimer();
        
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
    
    // Mark all answers as correct
    markAllCorrectBtn.addEventListener('click', () => {
        // Add button animation
        markAllCorrectBtn.classList.add('button-clicked');
        setTimeout(() => {
            markAllCorrectBtn.classList.remove('button-clicked');
        }, 300);
        
        for (let i = 1; i <= totalQuestions; i++) {
            const correctOption = quizForm.querySelector(`input[name="q${i}"][value="correct"]`);
            if (correctOption) {
                correctOption.checked = true;
                
                // Add visual feedback
                const questionItem = correctOption.closest('.question-item');
                if (questionItem) {
                    questionItem.classList.add('selection-highlight');
                    setTimeout(() => {
                        questionItem.classList.remove('selection-highlight');
                    }, 300);
                }
            }
        }
        calculateAndUpdateScore();
    });
    
    // Randomize all answers
    randomizeAnswersBtn.addEventListener('click', () => {
        // Add button animation
        randomizeAnswersBtn.classList.add('button-clicked');
        setTimeout(() => {
            randomizeAnswersBtn.classList.remove('button-clicked');
        }, 300);
        
        const optionValues = ['correct', 'partial', 'not_asked', 'incorrect'];
        
        for (let i = 1; i <= totalQuestions; i++) {
            // Select a random option
            const randomIndex = Math.floor(Math.random() * optionValues.length);
            const randomOption = quizForm.querySelector(`input[name="q${i}"][value="${optionValues[randomIndex]}"]`);
            
            if (randomOption) {
                randomOption.checked = true;
                
                // Add staggered visual feedback
                const questionItem = randomOption.closest('.question-item');
                if (questionItem) {
                    setTimeout(() => {
                        questionItem.classList.add('selection-highlight');
                        setTimeout(() => {
                            questionItem.classList.remove('selection-highlight');
                        }, 300);
                    }, i * 100); // Stagger the animations
                }
            }
        }
        calculateAndUpdateScore();
    });

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
            
            // Apply filter if only showing required questions
            const showOptionalCheckbox = document.getElementById('show-optional-questions');
            if (!showOptionalCheckbox.checked) {
                toggleOptionalQuestions(true);
            }
            
            // Scroll to the top of the form
            quizForm.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Add a button to highlight unanswered questions
    const highlightUnansweredBtn = document.createElement('button');
    highlightUnansweredBtn.id = 'highlight-unanswered';
    highlightUnansweredBtn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Показать неотвеченные вопросы';
    highlightUnansweredBtn.className = 'action-button';
    
    // Add the highlight unanswered button after the scoreBoard
    scoreBoard.insertAdjacentElement('afterend', highlightUnansweredBtn);
    
    // Function to toggle optional questions
    const toggleOptionalQuestions = (showOnlyRequired) => {
        const questionItems = document.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            const isRequired = item.querySelector('.status-required') !== null;
            if (!isRequired && showOnlyRequired) {
                item.style.display = 'none';
            } else {
                item.style.display = 'block';
            }
        });
        
        // Update the counts of visible questions
        updateVisibleQuestionsCounts();
    };
    
    // Function to update the visible questions count
    const updateVisibleQuestionsCounts = () => {
        const categoryContainers = document.querySelectorAll('.category-container');
        categoryContainers.forEach(container => {
            const categoryHeader = container.querySelector('.category-header');
            const categoryCountSpan = categoryHeader.querySelector('.category-count');
            const allQuestions = container.querySelectorAll('.question-item');
            const visibleQuestions = Array.from(allQuestions).filter(q => q.style.display !== 'none');
            
            categoryCountSpan.textContent = `${visibleQuestions.length} вопросов`;
        });
    };
    
    // Add event listener to highlight unanswered questions
    highlightUnansweredBtn.addEventListener('click', () => {
        // Add button animation
        highlightUnansweredBtn.classList.add('button-clicked');
        setTimeout(() => {
            highlightUnansweredBtn.classList.remove('button-clicked');
        }, 300);
        
        const unansweredQuestions = [];
        
        // Find all unanswered questions that are currently visible
        for (let i = 1; i <= totalQuestions; i++) {
            const selectedOption = quizForm.querySelector(`input[name="q${i}"]:checked`);
            if (!selectedOption) {
                const questionItem = document.querySelector(`.question-item[data-question-id="${i}"]`);
                if (questionItem && questionItem.style.display !== 'none') {
                    unansweredQuestions.push(questionItem);
                    
                    // Highlight the unanswered question
                    questionItem.classList.add('unanswered-highlight');
                    setTimeout(() => {
                        questionItem.classList.remove('unanswered-highlight');
                    }, 5000); // Remove highlight after 5 seconds
                }
            }
        }
        
        // If there are unanswered questions, scroll to the first one
        if (unansweredQuestions.length > 0) {
            // Find the first unanswered required question, or just the first unanswered question
            const firstRequiredUnanswered = unansweredQuestions.find(q => 
                q.querySelector('.status-required') !== null
            ) || unansweredQuestions[0];
            
            firstRequiredUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Show a count of unanswered questions
            alert(`Осталось ответить на ${unansweredQuestions.length} ${getWordForm(unansweredQuestions.length, 'вопрос', 'вопроса', 'вопросов')}`);
        } else {
            alert('Все вопросы отвечены!');
        }
    });

    // Add print report button
    const printReportBtn = document.createElement('button');
    printReportBtn.id = 'print-report';
    printReportBtn.innerHTML = '<i class="bi bi-printer"></i> Распечатать результаты';
    printReportBtn.className = 'action-button print-report-btn';
    printReportBtn.style.display = 'none'; // Initially hidden
    
    // Add after the share container
    shareResultContainer.insertAdjacentElement('afterend', printReportBtn);
    
    // Function to generate printable report
    const generatePrintableReport = () => {
        const answeredQuestions = Object.keys(currentAnswers).length;
        
        if (answeredQuestions === 0) {
            alert('Сначала ответьте на вопросы!');
            return;
        }
        
        // Count by category & status
        const categoryCounts = {};
        const statusCounts = {
            'correct': 0,
            'partial': 0,
            'not_asked': 0,
            'incorrect': 0,
            'unanswered': 0
        };
        
        // Create detailed report
        let reportContent = `
            <div class="print-report">
                <h1>Протокол экзамена SAI</h1>
                <div class="report-meta">
                    <p><strong>Дата:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Время:</strong> ${formatTime(timerSeconds)}</p>
                </div>
                
                <div class="report-summary">
                    <h2>Итоговый результат</h2>
                    <p class="report-score">Оценка: ${scoreValueEl.textContent} из ${maxPossibleScore.toFixed(1)} (${scorePercentageEl.textContent})</p>
                    <p class="report-status ${passFailStatusEl.className}">Результат: ${passFailStatusEl.textContent.split('(')[0].trim()}</p>
                </div>
                
                <h2>Детализация по вопросам</h2>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Категория</th>
                            <th>Вопрос</th>
                            <th>Статус</th>
                            <th>Ответ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Process each question
        for (let i = 1; i <= totalQuestions; i++) {
            const questionData = quizData[i-1];
            const selectedValue = currentAnswers[`q${i}`];
            
            if (!categoryCounts[questionData.category]) {
                categoryCounts[questionData.category] = {
                    total: 0,
                    correct: 0,
                    partial: 0,
                    not_asked: 0,
                    incorrect: 0,
                    unanswered: 0
                };
            }
            
            categoryCounts[questionData.category].total++;
            
            let answerText;
            let rowClass = '';
            
            if (selectedValue) {
                switch (selectedValue) {
                    case 'correct':
                        answerText = 'Правильно';
                        statusCounts.correct++;
                        categoryCounts[questionData.category].correct++;
                        rowClass = 'correct-row';
                        break;
                    case 'partial':
                        answerText = 'Частично правильно';
                        statusCounts.partial++;
                        categoryCounts[questionData.category].partial++;
                        rowClass = 'partial-row';
                        break;
                    case 'not_asked':
                        answerText = 'Не спрашивал';
                        statusCounts.not_asked++;
                        categoryCounts[questionData.category].not_asked++;
                        rowClass = 'not-asked-row';
                        break;
                    case 'incorrect':
                        answerText = 'Не правильно';
                        statusCounts.incorrect++;
                        categoryCounts[questionData.category].incorrect++;
                        rowClass = 'incorrect-row';
                        break;
                }
            } else {
                answerText = 'Не отвечено';
                statusCounts.unanswered++;
                categoryCounts[questionData.category].unanswered++;
                rowClass = 'unanswered-row';
            }
            
            // Add row for each question
            reportContent += `
                <tr class="${rowClass}">
                    <td>${i}</td>
                    <td>${questionData.category}</td>
                    <td>${questionData.question} ${questionData.status === "Обязательно" ? '<span class="required-badge">Обязательно</span>' : ''}</td>
                    <td>${answerText}</td>
                    <td>${questionData.answer}</td>
                </tr>
            `;
        }
        
        reportContent += `
                    </tbody>
                </table>
                
                <h2>Статистика по категориям</h2>
                <table class="report-table category-stats">
                    <thead>
                        <tr>
                            <th>Категория</th>
                            <th>Всего</th>
                            <th>Правильно</th>
                            <th>Частично</th>
                            <th>Не спрашивал</th>
                            <th>Не правильно</th>
                            <th>Не отвечено</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add rows for category statistics
        Object.keys(categoryCounts).forEach(category => {
            const stats = categoryCounts[category];
            reportContent += `
                <tr>
                    <td>${category}</td>
                    <td>${stats.total}</td>
                    <td class="correct-cell">${stats.correct}</td>
                    <td class="partial-cell">${stats.partial}</td>
                    <td class="not-asked-cell">${stats.not_asked}</td>
                    <td class="incorrect-cell">${stats.incorrect}</td>
                    <td class="unanswered-cell">${stats.unanswered}</td>
                </tr>
            `;
        });
        
        // Add total stats row
        reportContent += `
                <tr class="total-row">
                    <td><strong>ИТОГО</strong></td>
                    <td>${totalQuestions}</td>
                    <td class="correct-cell">${statusCounts.correct}</td>
                    <td class="partial-cell">${statusCounts.partial}</td>
                    <td class="not-asked-cell">${statusCounts.not_asked}</td>
                    <td class="incorrect-cell">${statusCounts.incorrect}</td>
                    <td class="unanswered-cell">${statusCounts.unanswered}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="report-footer">
            <p>Экзамен для SAI - Тест сгенерирован системой</p>
            <p>Код результата: ${resultCode}</p>
        </div>
    </div>`;
        
        // Create print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Протокол экзамена SAI</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    
                    .print-report {
                        max-width: 900px;
                        margin: 0 auto;
                    }
                    
                    h1, h2 {
                        color: #333;
                    }
                    
                    .report-meta {
                        margin-bottom: 20px;
                    }
                    
                    .report-summary {
                        background-color: #f5f5f5;
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                    }
                    
                    .report-score {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    
                    .report-status {
                        font-size: 20px;
                        font-weight: bold;
                    }
                    
                    .pass {
                        color: #00c853;
                    }
                    
                    .fail {
                        color: #d81b60;
                    }
                    
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    
                    .report-table th, .report-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    
                    .report-table th {
                        background-color: #f2f2f2;
                    }
                    
                    .report-table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    
                    .correct-row {
                        background-color: rgba(0, 200, 83, 0.1) !important;
                    }
                    
                    .partial-row {
                        background-color: rgba(255, 152, 0, 0.1) !important;
                    }
                    
                    .incorrect-row {
                        background-color: rgba(216, 27, 96, 0.1) !important;
                    }
                    
                    .unanswered-row {
                        background-color: rgba(158, 158, 158, 0.1) !important;
                    }
                    
                    .correct-cell {
                        color: #00c853;
                        font-weight: bold;
                    }
                    
                    .partial-cell {
                        color: #ff9800;
                        font-weight: bold;
                    }
                    
                    .incorrect-cell {
                        color: #d81b60;
                        font-weight: bold;
                    }
                    
                    .not-asked-cell {
                        color: #607d8b;
                        font-weight: bold;
                    }
                    
                    .unanswered-cell {
                        color: #9e9e9e;
                        font-weight: bold;
                    }
                    
                    .total-row {
                        background-color: #f2f2f2 !important;
                    }
                    
                    .required-badge {
                        background-color: #d81b60;
                        color: white;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-size: 12px;
                        margin-left: 8px;
                    }
                    
                    .report-footer {
                        margin-top: 30px;
                        border-top: 1px solid #ddd;
                        padding-top: 15px;
                        font-size: 12px;
                        color: #777;
                    }
                    
                    @media print {
                        body {
                            margin: 0;
                            padding: 15px;
                        }
                        
                        .print-report {
                            width: 100%;
                            max-width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                ${reportContent}
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
    };
    
    // Add click event for print report button
    printReportBtn.addEventListener('click', generatePrintableReport);

    // Create autosave toggle button
    const autoSaveToggle = document.createElement('div');
    autoSaveToggle.id = 'autosave-toggle';
    autoSaveToggle.className = 'toggle-switch';
    autoSaveToggle.innerHTML = `
        <label>
            <input type="checkbox" id="autosave-checkbox" checked>
            <span class="toggle-slider"></span>
        </label>
        <span class="toggle-label">Автосохранение</span>
    `;
    
    // Insert before the highlight unanswered button
    highlightUnansweredBtn.insertAdjacentElement('beforebegin', autoSaveToggle);
    
    const autosaveCheckbox = document.getElementById('autosave-checkbox');
    let autoSaveEnabled = true; // Default to true
    
    // Try to load autosave preference from localStorage
    if (localStorage.getItem('sai_autosave_pref') !== null) {
        autoSaveEnabled = localStorage.getItem('sai_autosave_pref') === 'true';
        autosaveCheckbox.checked = autoSaveEnabled;
    }
    
    // Save autosave preference when changed
    autosaveCheckbox.addEventListener('change', () => {
        autoSaveEnabled = autosaveCheckbox.checked;
        localStorage.setItem('sai_autosave_pref', autoSaveEnabled);
        
        // Show notification
        const notif = document.createElement('div');
        notif.className = 'auto-save-notification';
        notif.textContent = autoSaveEnabled ? 'Автосохранение включено' : 'Автосохранение выключено';
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.classList.add('show');
            setTimeout(() => {
                notif.classList.remove('show');
                setTimeout(() => {
                    notif.remove();
                }, 300);
            }, 2000);
        }, 10);
    });
    
    // Function to save progress to localStorage
    const saveProgress = () => {
        if (!autoSaveEnabled) return;
        
        const saveData = {
            answers: currentAnswers,
            timer: timerSeconds,
            timestamp: new Date().toISOString(),
            requiredOnly: !document.getElementById('show-optional-questions').checked // Save filter state
        };
        
        localStorage.setItem('sai_exam_progress', JSON.stringify(saveData));
        
        // Update autosave indicator with timestamp
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        document.querySelector('.toggle-label').textContent = `Автосохранение (${timeString})`;
    };
    
    // Automatically save progress every 30 seconds and when answers change
    setInterval(saveProgress, 30000);
    
    // Load saved progress if available
    const loadSavedProgress = () => {
        // Skip if we have a code parameter in the URL
        if (codeParam) return;
        
        const savedData = localStorage.getItem('sai_exam_progress');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // Check if saved data is recent (less than 24 hours old)
                const savedTime = new Date(data.timestamp);
                const now = new Date();
                const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
                
                if (hoursDiff < 24) {
                    // Restore answers
                    if (data.answers) {
                        applyAnswersFromCode(data.answers);
                        currentAnswers = data.answers;
                    }
                    
                    // Restore timer
                    if (data.timer) {
                        timerSeconds = data.timer;
                        timerEl.innerHTML = `<i class="bi bi-stopwatch"></i> Время: ${formatTime(timerSeconds)}`;
                    }
                    
                    // Restore required-only filter state
                    if (data.requiredOnly !== undefined) {
                        const showOptionalCheckbox = document.getElementById('show-optional-questions');
                        showOptionalCheckbox.checked = !data.requiredOnly;
                        toggleOptionalQuestions(data.requiredOnly);
                    }
                    
                    // Ask if user wants to continue from saved progress
                    const continueFromSave = confirm(`Найден сохраненный прогресс от ${new Date(data.timestamp).toLocaleString()}. Продолжить с сохраненного места?`);
                    
                    if (continueFromSave) {
                        // Start timer
                        startTimer();
                        
                        // Apply the restored answers
                        calculateAndUpdateScore();
                    } else {
                        // Clear saved progress
                        localStorage.removeItem('sai_exam_progress');
                        
                        // Reset form
                        quizForm.reset();
                        
                        // Reset timer
                        timerSeconds = 0;
                        timerEl.innerHTML = `<i class="bi bi-stopwatch"></i> Время: 00:00`;
                        timerStarted = false;
                        
                        // Reset required-only filter
                        const showOptionalCheckbox = document.getElementById('show-optional-questions');
                        showOptionalCheckbox.checked = true;
                        toggleOptionalQuestions(false);
                        
                        // Reset score
                        calculateAndUpdateScore();
                    }
                } else {
                    // Data is too old, remove it
                    localStorage.removeItem('sai_exam_progress');
                }
            } catch (error) {
                console.error('Failed to parse saved progress', error);
                localStorage.removeItem('sai_exam_progress');
            }
        }
    };
    
    // Try to load saved progress
    loadSavedProgress();
    
    // Update calculateAndUpdateScore to save progress
    const originalCalculateAndUpdateScore = calculateAndUpdateScore;
    calculateAndUpdateScore = function() {
        originalCalculateAndUpdateScore.apply(this, arguments);
        saveProgress();
    };
    
    // Add a clear progress button
    const clearProgressBtn = document.createElement('button');
    clearProgressBtn.id = 'clear-progress';
    clearProgressBtn.innerHTML = '<i class="bi bi-trash"></i> Сбросить прогресс';
    clearProgressBtn.className = 'action-button clear-progress-btn';
    
    // Add after the highlight unanswered button
    highlightUnansweredBtn.insertAdjacentElement('afterend', clearProgressBtn);
    
    // Add click event for clear progress button
    clearProgressBtn.addEventListener('click', () => {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
            // Clear localStorage
            localStorage.removeItem('sai_exam_progress');
            
            // Reset form
            quizForm.reset();
            
            // Reset timer
            timerSeconds = 0;
            timerEl.innerHTML = `<i class="bi bi-stopwatch"></i> Время: 00:00`;
            timerStarted = false;
            
            // Reset current answers
            currentAnswers = {};
            
            // Reset required-only filter
            const showOptionalCheckbox = document.getElementById('show-optional-questions');
            showOptionalCheckbox.checked = true;
            toggleOptionalQuestions(false);
            
            // Reset score
            calculateAndUpdateScore();
            
            // Show confirmation
            alert('Прогресс сброшен!');
        }
    });

});