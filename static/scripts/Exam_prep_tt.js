function Exam_prep() {
  go.innerHTML = '';

  const wrapper = document.createElement('div');
    wrapper.className = 'p-4 border border-gray-200 rounded-lg shadow-md max-w-lg mx-auto';
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'flex items-center space-x-3 mb-4';

    const img_input = document.createElement('input');
    img_input.type = 'file';
    img_input.accept = 'image/*';
    img_input.className = 'w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100';
    inputWrapper.appendChild(img_input);

    const status = document.createElement('div');
    status.style.cssText = 'font-size: 0.8rem; height: 30px; line-height: 30px;';
    status.className = 'text-gray-600 truncate';
    
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'fbutton bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-sm disabled:opacity-50';
    uploadBtn.textContent = 'Upload and Extract Timetable';
    uploadBtn.disabled = true;

    // Append elements to wrapper
    wrapper.appendChild(inputWrapper);
    wrapper.appendChild(status);
    wrapper.appendChild(uploadBtn);
    go.appendChild(wrapper);


    let selectedFile = null; // Store for upload

    // --- Event Listeners ---
    img_input.addEventListener('change', () => {
        // Clear previous messages and results
        if(document.getElementById('msgBox')) document.getElementById("msgBox").style.display = 'none';
        if(document.getElementById('resultsDiv')) document.getElementById('resultsDiv').style.display = 'none';
        
        status.textContent = '';
        status.style.color = 'black';
        const file = img_input.files && img_input.files[0];
        uploadBtn.disabled = true;

        if (!file) return;
        selectedFile = file;

        if (!file.type.startsWith('image/')) {
            status.textContent = 'Selected file is not an image.';
            status.style.color = 'red';
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        const sizeOk = file.size < maxSize;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resolution check relaxed for better compatibility
                const resOk = img.naturalWidth >= 300; 
                const parts = [];
                parts.push(sizeOk ? 'Size OK (<5MB)' : 'Size too large');
                parts.push(resOk ? 'Resolution OK' : 'Low resolution');
                status.textContent = parts.join(' | ');
                status.style.color = (sizeOk && resOk) ? 'green' : 'red';
                uploadBtn.disabled = !(sizeOk && resOk);
            };
            img.onerror = () => {
                status.textContent = 'Unable to read image';
                status.style.color = 'red';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            displayCustomMessage("Please select an image first!", 'error');
            return;
        }

        // --- Start Upload Process ---
        uploadBtn.textContent = 'Processing...';
        uploadBtn.disabled = true;
        if(document.getElementById('msgBox')) document.getElementById("msgBox").style.display = 'none';
        if(document.getElementById('resultsDiv')) document.getElementById('resultsDiv').style.display = 'none';

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            // CRITICAL FIX: Use relative path for internal server calls
            const res = await fetch('https://chroneza-render.onrender.com/upload', { 
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            console.log("Backend Response Data:", data);

            if (!res.ok) {
                displayCustomMessage('Upload failed: ' + (data.details || data.error || 'Server error'), 'error');
                return;
            }

            // 2. Handle successful OCR warning (empty result with status 200)
            if (data.warning) {
                displayCustomMessage('Extraction Complete: ' + data.warning, 'warning');
            }

            // 3. Handle successful extraction
            if (data.exams && data.exams.length > 0) {
                calculateAndDisplayPrepTimetable(data.exams);
                displayCustomMessage(`Successfully extracted ${data.exams.length} exams!`, 'success');
            } else if (!data.warning) {
                 // Fallback message if no exams but no specific warning
                 displayCustomMessage('Extraction finished, but no data was recognized.', 'warning');
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            displayCustomMessage(`A network or server error occurred: ${error.message}`, 'error');
        } finally {
            uploadBtn.textContent = 'Upload and Extract Timetable';
            uploadBtn.disabled = false;
        }
    });

    // --- Custom Message Box ---
    function displayCustomMessage(message, type) {
        let msgBox = document.getElementById('msgBox');
        if (!msgBox) {
            msgBox = document.createElement('div');
            msgBox.setAttribute('id', 'msgBox');
            msgBox.className = 'mt-4 p-3 rounded-lg font-semibold';
            wrapper.appendChild(msgBox);
        }
        
        msgBox.textContent = message;
        msgBox.style.display = 'block';
        msgBox.classList.remove('bg-red-500', 'bg-orange-400', 'bg-green-500');

        switch(type) {
            case 'error':
                msgBox.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                msgBox.classList.add('bg-yellow-400', 'text-black');
                break;
            case 'success':
                msgBox.classList.add('bg-green-500', 'text-white');
                break;
            default:
                msgBox.classList.add('bg-blue-500', 'text-white');
        }
    }
    
    // --- Preparation Timetable Logic ---
    function calculateAndDisplayPrepTimetable(exams) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        // 1. Calculate days remaining and create new objects
        const prepExams = exams.map(exam => {
            const examDate = new Date(exam.date);
            examDate.setHours(0, 0, 0, 0);

            // Calculate difference in milliseconds
            const diffTime = examDate.getTime() - today.getTime();
            // Convert to days, rounding down
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            return {
                subject: exam.subject,
                date: exam.date,
                daysRemaining: diffDays
            };
        });

        // 2. Sort the exams by date (Ascending: closest exam first)
        prepExams.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        renderPrepTimetable(prepExams);
    }

    function renderPrepTimetable(prepExams) {
        let resultsDiv = document.getElementById('resultsDiv');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.setAttribute('id', 'resultsDiv');
            resultsDiv.className = 'mt-6 p-4 bg-white rounded-lg shadow-inner border border-gray-100';
            wrapper.appendChild(resultsDiv);
        }
        
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = '<h3 class="text-xl font-bold text-gray-800 mb-3 border-b pb-1">Your Prep Schedule</h3>';

        const ul = document.createElement('ul');
        ul.className = 'space-y-3';
        
        prepExams.forEach(exam => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center p-3 rounded-lg ' + (exam.daysRemaining < 0 ? 'bg-red-100 text-red-700' : exam.daysRemaining <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-50 text-green-700');
            
            const daysText = exam.daysRemaining < 0 ? 
                             'Exam Passed' : 
                             exam.daysRemaining === 0 ? 
                             'TODAY!' : 
                             `${exam.daysRemaining} days remaining`;

            li.innerHTML = `
                <div class="font-semibold text-gray-800">${exam.subject}</div>
                <div class="text-right">
                    <div class="text-sm font-medium ${exam.daysRemaining < 7 && exam.daysRemaining >= 0 ? 'font-bold' : ''}">${daysText}</div>
                    <div class="text-xs font-mono text-gray-500">${exam.date}</div>
                </div>
            `;
            ul.appendChild(li);
        });

        resultsDiv.appendChild(ul);
        
        // Add a suggestion for the next step
        const tip = document.createElement('p');
        tip.className = 'mt-4 text-sm text-gray-500 italic border-t pt-3';
        tip.textContent = 'This list is sorted by exam date. Now we can start creating tasks for the days remaining!';
        resultsDiv.appendChild(tip);
    }
}
