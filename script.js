
       
        const codeEditor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
            lineNumbers: true,
            theme: "monokai",
            mode: "python",
            indentUnit: 4,
            autoCloseBrackets: true,
            matchBrackets: true,
            lineWrapping: true
        });

        
        const codingQuestions = [
            {
                question: "Write a function that finds the maximum element in an array.",
                difficulty: "Easy",
                sampleInput: "[1, 3, 5, 2, 4]",
                sampleOutput: "5",
                timeLimit: 300 
            },
            {
                question: "Implement a function to check if a string is a palindrome.",
                difficulty: "Easy",
                sampleInput: "'racecar'",
                sampleOutput: "true",
                timeLimit: 300
            },
            {
                question: "Write a function to find the first non-repeating character in a string.",
                difficulty: "Medium",
                sampleInput: "'leetcode'",
                sampleOutput: "'l'",
                timeLimit: 600
            }
        ];

        let currentQuestionIndex = 0;
        let questionTimer;
        let timeLeft;

        
        let interviewTimeLeft = 3600; 
        let interviewTimer;

        function updateInterviewTimer() {
            const hours = Math.floor(interviewTimeLeft / 3600);
            const minutes = Math.floor((interviewTimeLeft % 3600) / 60);
            const seconds = interviewTimeLeft % 60;
            document.querySelector('.timer').textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function startInterviewTimer() {
            interviewTimer = setInterval(() => {
                if (interviewTimeLeft > 0) {
                    interviewTimeLeft--;
                    updateInterviewTimer();
                } else {
                    clearInterval(interviewTimer);
                    alert('Interview time is up!');
                    endInterview();
                }
            }, 1000);
        }

        function updateQuestionTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('questionTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function startQuestionTimer() {
            timeLeft = codingQuestions[currentQuestionIndex].timeLimit;
            updateQuestionTimer();
            
            questionTimer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateQuestionTimer();
                } else {
                    clearInterval(questionTimer);
                    alert('Time is up for this question!');
                    nextQuestion();
                }
            }, 1000);
        }

       
        let stream = null;
        let screenStream = null;

        async function toggleCamera() {
            try {
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    localVideo.srcObject = null;
                    stream = null;
                    cameraBtn.classList.remove('active');
                } else {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    localVideo.srcObject = stream;
                    cameraBtn.classList.add('active');
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                alert('Could not access camera');
            }
        }

        async function toggleMicrophone() {
            try {
                if (stream && stream.getAudioTracks().length > 0) {
                    stream.getAudioTracks().forEach(track => track.stop());
                    micBtn.classList.remove('active');
                } else {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    if (stream) {
                        stream.addTrack(audioStream.getAudioTracks()[0]);
                    } else {
                        stream = audioStream;
                    }
                    micBtn.classList.add('active');
                }
            } catch (err) {
                console.error('Error accessing microphone:', err);
                alert('Could not access microphone');
            }
        }

        async function toggleScreenShare() {
            try {
                if (screenStream) {
                    screenStream.getTracks().forEach(track => track.stop());
                    localVideo.srcObject = stream;
                    screenStream = null;
                    screenShareBtn.classList.remove('active');
                } else {
                    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    localVideo.srcObject = screenStream;
                    screenShareBtn.classList.add('active');
                }
            } catch (err) {
                console.error('Error sharing screen:', err);
                alert('Could not share screen');
            }
        }

       
        function addMessage(content, isAI = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
            messageDiv.textContent = content;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        
        const aiResponses = {
            greetings: [
                "Hello! How are you doing today?",
                "Welcome! Are you ready to begin the technical interview?",
                "Hi there! Let's get started with your interview."
            ],
            questions: [
                "Could you explain your approach to solving this problem?",
                "What time complexity does your solution have?",
                "Can you think of any edge cases we should consider?",
                "How would you optimize this solution further?"
            ],
            feedback: [
                "That's a good approach! Let's move on to the next question.",
                "Interesting solution! Have you considered using a different data structure?",
                "Well explained! Your understanding of the concept is clear."
            ]
        };

        function getAIResponse(message) {
            message = message.toLowerCase();
            if (message.includes('hi') || message.includes('hello')) {
                return aiResponses.greetings[Math.floor(Math.random() * aiResponses.greetings.length)];
            } else if (message.includes('approach') || message.includes('solution')) {
                return aiResponses.questions[Math.floor(Math.random() * aiResponses.questions.length)];
            } else {
                return aiResponses.feedback[Math.floor(Math.random() * aiResponses.feedback.length)];
            }
        }

        
        function executeCode(code, language) {
            return new Promise((resolve) => {
                const output = document.getElementById('output');
                output.style.display = 'block';
                output.innerHTML = '<div class="loading"></div> Executing code...';
                
                
                setTimeout(() => {
                    try {
                        let result;
                        if (language === 'javascript') {
                            
                            result = eval(`(function() { ${code} })()`);
                        } else {
                            
                            result = "Code execution simulated.\nOutput: Test cases passed successfully!";
                        }
                        output.innerHTML = `<pre>${result}</pre>`;
                        resolve(true);
                    } catch (error) {
                        output.innerHTML = `<pre style="color: red">Error: ${error.message}</pre>`;
                        resolve(false);
                    }
                }, 2000);
            });
        }

        
        function loadQuestion(index) {
            const question = codingQuestions[index];
            document.getElementById('currentQuestion').innerHTML = `
                <strong>${question.difficulty}</strong><br>
                ${question.question}<br>
                <small>Sample Input: ${question.sampleInput}<br>
                Expected Output: ${question.sampleOutput}</small>
            `;
            clearInterval(questionTimer);
            startQuestionTimer();
        }

        function nextQuestion() {
            if (currentQuestionIndex < codingQuestions.length - 1) {
                currentQuestionIndex++;
                loadQuestion(currentQuestionIndex);
                codeEditor.setValue('');
                document.getElementById('output').style.display = 'none';
                addMessage("Let's move on to the next question. Take your time to read it carefully.", true);
            } else {
                alert("Congratulations! You've completed all the questions.");
                endInterview();
            }
        }

        function endInterview() {
            clearInterval(interviewTimer);
            clearInterval(questionTimer);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
            }
            alert("Interview session has ended. Thank you for your participation!");
        }

        
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            const language = e.target.value;
            let mode;
            switch (language) {
                case 'python':
                    mode = 'python';
                    break;
                case 'javascript':
                    mode = 'javascript';
                    break;
                case 'java':
                case 'cpp':
                    mode = 'clike';
                    break;
            }
            codeEditor.setOption('mode', mode);
        });

        
        document.getElementById('cameraBtn').addEventListener('click', toggleCamera);
        document.getElementById('micBtn').addEventListener('click', toggleMicrophone);
        document.getElementById('screenShareBtn').addEventListener('click', toggleScreenShare);
        
        document.getElementById('sendBtn').addEventListener('click', () => {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            if (message) {
                addMessage(message);
                input.value = '';
                
                
                setTimeout(() => {
                    addMessage(getAIResponse(message), true);
                }, 1000);
            }
        });

        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('sendBtn').click();
            }
        });

        document.getElementById('runBtn').addEventListener('click', async () => {
            const code = codeEditor.getValue();
            const language = document.getElementById('languageSelect').value;
            await executeCode(code, language);
        });

        document.getElementById('submitBtn').addEventListener('click', async () => {
            const code = codeEditor.getValue();
            const language = document.getElementById('languageSelect').value;
            const success = await executeCode(code, language);
            if (success) {
                addMessage("Your solution has been submitted successfully! Let me review it.", true);
                setTimeout(() => {
                    addMessage("Great work! Your solution looks good. Would you like to explain your approach?", true);
                }, 2000);
            }
        });

        document.getElementById('nextBtn').addEventListener('click', nextQuestion);

        
        loadQuestion(currentQuestionIndex);
        startInterviewTimer();
        addMessage("Welcome to the technical interview! I'll be your AI interviewer today. Let's start with the first coding question.", true);
    