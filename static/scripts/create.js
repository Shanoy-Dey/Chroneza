let isM = true;
function isMobile() {
    // Returns true for mobile/tablet, false for laptop/desktop
    const ua = navigator.userAgent;
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isLaptopOrDesktop = /Windows NT|Macintosh|Linux x86_64|X11|CrOS/i.test(ua);
    isM = isMobileDevice;
    const nav = document.querySelector('nav');
}
isMobile();

let currentStep = 1;
const totalSteps = 5;
const progressBar = document.querySelector('.progress-bar');
const steps = document.querySelectorAll('.step');
const popup = document.getElementById('progressPopup');

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        updateProgress();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateProgress();
    }
}

function updateProgress() {
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = percent + '%';

    steps.forEach((step, index) => {
        step.classList.toggle('active', index < currentStep);
    });
    steps.forEach((step, index) => {
        step.classList.toggle('completed', index < currentStep - 1);
    });

    // Show popup messages at certain steps
    if (currentStep === 3) {
        showPopup('Only 2 steps to go!');
    }
    else if (currentStep === 4) {
        showPopup('Almost there!');
    }
    else if (currentStep === 5) {
        progressBar.style.background = 'linear-gradient(90deg, #00e676, #66bb6a)';
        steps.forEach(step => step.classList.add('finish'));
        showPopup('All steps completed!');
        popup.textContent = '🎉 All steps completed! 🎉';
    }
}

function showPopup(message) {
    const popupEl = document.getElementById('progressPopup') || popup;
    if (!popupEl) return;
    popupEl.textContent = message;
    popupEl.style.opacity = 1;
}

const step1 = document.getElementById("createstep1");
const nexam = document.getElementById("Exam");
const school = document.getElementById("schooling");
const tname = document.getElementById("tname");
const dcollege = document.getElementById("dcollege");
const submit = document.getElementById("sb");
const back = document.getElementById("bb");
const schooldiv = document.getElementById("schooldiv");
const examdiv = document.getElementById("examdiv");
const boardiv = document.getElementById("boardiv");
const osdiv = document.getElementById("osdiv");
const dcdiv = document.getElementById("dcdiv");
const aldiv = document.getElementById("boardiv");


document.addEventListener('DOMContentLoaded', function () {
    showPopup('Welcome ! Start by filling these basic details.');
    const heroImgs = document.querySelectorAll('#create_hero .hero-img');
    let heroIndex = 0;
    let prevIndex = heroImgs.length - 1;
    let lastSwitch = Date.now();
    const interval = 2500;

    function showHeroImage(newIndex, oldIndex) {
        heroImgs.forEach((img, idx) => {
            img.classList.remove('active', 'prev');
        });
        if (typeof oldIndex === 'number') heroImgs[oldIndex].classList.add('prev');
        heroImgs[newIndex].classList.add('active');
    }
    showHeroImage(heroIndex, prevIndex);

    function heroSlideshowStep() {
        const now = Date.now();
        if (now - lastSwitch >= interval) {
            prevIndex = heroIndex;
            heroIndex = (heroIndex + 1) % heroImgs.length;
            showHeroImage(heroIndex, prevIndex);
            lastSwitch = now;
        }
        requestAnimationFrame(heroSlideshowStep);
    }

    requestAnimationFrame(heroSlideshowStep);

    const urlParams = new URLSearchParams(window.location.search);
    const examParam = urlParams.get('exam');
    if (examParam) {
        const examSelect = document.getElementById('Exam');
        if (examSelect) {
            examSelect.value = examParam;
        }
    }

    const radioButtons = document.querySelectorAll('input[name="optional"]');
    const container = document.getElementById("here");

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            document.querySelectorAll('.optional-subject-input').forEach(input => input.remove());
            const numberOfSubjects = parseInt(this.value);

            if (!isNaN(numberOfSubjects) && numberOfSubjects > 0) {
                for (let i = 1; i <= numberOfSubjects; i++) {
                    const ta = document.createElement("input");
                    ta.setAttribute('type', 'text');
                    ta.setAttribute('placeholder', `Optional Subject ${i}`);
                    ta.setAttribute('id', `os${i}`);
                    ta.classList.add('optional-subject-input');
                    container.appendChild(ta);
                }
            }
            const input = document.getElementsByTagName("input");
            for (let i = 0; i < input.length; i++) {
                input[i].setAttribute('required', 'true');
            }

        });
    });
});



let compexam = ["jee", "neet"];
let schoolexam = ["jee", "neet", "class 9", "class 10"];
school.addEventListener('change', function () {
    aldiv.style.display = "none";
    osdiv.style.display = "none";
    dcdiv.style.display = "none";
    nexam.innerHTML = '<option value="">Select Exam</option>';
    let exams = this.value === "yes" || this.value === "holiday" ? schoolexam : compexam;
    exams.forEach(exam => {
        const option = document.createElement("option");
        option.value = exam;
        option.textContent = exam.toUpperCase();
        nexam.appendChild(option);
    });
});

nexam.addEventListener('change', function () {
    aldiv.style.display = "none";
    osdiv.style.display = "none";
    dcdiv.style.display = "none";
    if (this.value === "class 9" || this.value === "class 10") {
        document.getElementById("createstep1").style.display = "none";
        aldiv.style.display = "flex";
        osdiv.style.display = "flex";
        back.style.display = "block";
        nextStep();
    }
    else if (this.value === "jee" || this.value === "neet") {
        document.getElementById("createstep1").style.display = "none";
        dcdiv.style.display = "flex";
        osdiv.style.display = "flex";
        back.style.display = "block";
        nextStep();
    }
});


function Show_Message() {
    const errorMessage = document.getElementById("warning");
    errorMessage.innerHTML = "";

    const message = document.createElement("span");
    message.setAttribute("id", "error-message");
    message.textContent = 'You may include "Timetable" at the End.';
    errorMessage.appendChild(message);
    message.style.display = "flex";
    if (message.style.display === "flex") {
        setTimeout(function () {
            message.style.display = "none";
        }, 2000);
    }
}

const input = document.getElementsByTagName("input");
for (let i = 0; i < input.length; i++) {
    input[i].setAttribute('required', 'true');
}

submit.addEventListener('click', function (event) {
    event.preventDefault();
    if (tname.value !== "" && nexam.value !== "" && school.value !== "") {

        os = [document.getElementById("os1"), document.getElementById("os2"), document.getElementById("os3")];
        os = os.filter(item => item !== undefined && item !== null && item !== "");
        if (os.length > 0) {
            for (let i = 0; i < os.length; i++) {
                if (os[i].value === "") {
                    const wt = document.getElementById("warn");
                    wt.innerHTML = "";
                    let warnText = document.createElement("span");
                    warnText.setAttribute("id", "warn-text");
                    warnText.textContent = "Please Fill The Optional Subjects !";
                    wt.appendChild(warnText);
                    setTimeout(() => {
                        const warnText = document.getElementById("warn-text");
                        if (warnText) {
                            warnText.style.display = "none";
                        }
                    }, 2000);
                    return;
                }
            }
            Exam_prep();
            nextStep();
        }
        else {
            Exam_prep();
            nextStep();
        }
    }
    else {
        const wt = document.getElementById("warn");
        wt.innerHTML = "";
        let warnText = null;
        if ((tname.value === "" || nexam.value === "") && (school.value === "" || tname.value === "") && (school.value === "" || nexam.value === "")) {
            warnText = document.createElement("span");
            warnText.setAttribute("id", "warn-text");
            warnText.textContent = "Please Fill All The Fields !";
        }
        else if (nexam.value === "") {
            warnText = document.createElement("span");
            warnText.setAttribute("id", "warn-text");
            warnText.textContent = "Please Select Your Exam !";
        }
        else if (tname.value === "") {
            warnText = document.createElement("span");
            warnText.setAttribute("id", "warn-text");
            warnText.textContent = "Please Enter Your Timetable Name !";
        }
        else if (school.value === "") {
            warnText = document.createElement("span");
            warnText.setAttribute("id", "warn-text");
            warnText.textContent = "Please Select Schooling Option !";
        }
        if (warnText) {
            wt.appendChild(warnText);
        }
    }
    setTimeout(() => {
        const warnText = document.getElementById("warn-text");
        if (warnText) {
            warnText.style.display = "none";
        }
    }, 2000);
});

back.addEventListener('click', function (event) {
    event.preventDefault();
    step1.style.display = "block";
    aldiv.style.display = "none";
    osdiv.style.display = "none";
    dcdiv.style.display = "none";
    back.style.display = "none";
    nexam.value = "";
    prevStep();
});

var j = 1;
const go = document.getElementById("her");

function createHourTable(label, isMorning) {
    const container = document.createElement('div'); // wrapper for this instance
    go.appendChild(container);
    const labelpair = document.createElement('div');
    labelpair.setAttribute('id', 'label-pair');
    const icon = document.createElement('img');
    icon.setAttribute('src', 'static/styles/label_icon2.png');
    icon.setAttribute('class', 'label-icon');
    labelpair.appendChild(icon);
    const head = document.createElement('h4');
    head.textContent = label;
    head.setAttribute('id', 'heading2');
    labelpair.appendChild(head);
    container.appendChild(labelpair);
    const table = document.createElement('table');
    table.setAttribute('id', 'tab');
    const row = document.createElement('tr');

    for (let i = 0; i <= 11; i++) {
        const col = document.createElement('td');
        if (isMorning) {
            if (i == 0)
                col.textContent = '12 - 1 AM';
            else if (i == 11)
                col.textContent = '11 - 12 PM';
            else
                col.textContent = `${i} - ${i + 1} AM`;
        } else {
            if (i == 0)
                col.textContent = '12 - 1 PM';
            else if (i == 11)
                col.textContent = '11 - 12 AM';
            else
                col.textContent = `${i} - ${i + 1} PM`;
        }
        col.setAttribute('value', j);
        j++;
        row.appendChild(col);
    }

    table.appendChild(row);
    container.appendChild(table);
    const br = document.createElement('br');
    container.appendChild(br);
}

let timehr = [];
function createTable(label, isMorning, tablediv) {
    const labelpair = document.createElement('div');
    labelpair.setAttribute('id', 'label-pair');
    const head = document.createElement('h4');
    head.textContent = label;
    head.setAttribute('id', 'heading2');
    head.style.textAlign = 'center';
    labelpair.appendChild(head);
    tablediv.appendChild(labelpair);
    const table = document.createElement('table');
    table.setAttribute('id', 'tab2');
    for (let i = 0; i < 2; i++) {
        const row = document.createElement('tr');
        for (let k = 0; k <= 5; k++, j++) {
            const col = document.createElement('td');
            if (isMorning) {
                if (k == 0 && i == 0)
                    col.textContent = '12 - 1 AM';
                else if (j == 12)
                    col.textContent = '11 - 12 PM';
                else
                    col.textContent = `${j - 1} - ${j} AM`;
            } else {
                if (k == 0 && i == 0)
                    col.textContent = '12 - 1 PM';
                else if (j == 24)
                    col.textContent = '11 - 12 AM';
                else
                    col.textContent = `${j - 13} - ${j - 12} PM`;
            }
            col.setAttribute('value', j);
            timehr[j - 1] = col.textContent;
            row.appendChild(col);
        }


        table.appendChild(row);
    }
    tablediv.appendChild(table);
}


let weaksub = 0;
var atime = [];
var coach = [];
var count = 0;
let s1 = 0, s2 = 0;
var choice = true;
let step3Clone = null;
function Step3() {
    const val = school.value;
    if (!step3Clone) {
        go.innerHTML = "";
        step3Clone = document.createElement('div');
        const heading = document.createElement('h4');
        heading.textContent = 'Select Your Study Hours';
        heading.style.textAlign = 'center';
        heading.setAttribute('id', 'heading');
        heading.style.padding = '35px 0px 0px 0px';
        heading.setAttribute('class', 'hied');
        step3Clone.appendChild(heading);
        step3Clone.appendChild(document.createElement('br'));

        const total3 = document.createElement('div');
        total3.setAttribute('id', 'total3');
        const labelpair = document.createElement('div');
        createTable('Morning Hours ', true, labelpair);
        createTable('Evening Hours ', false, labelpair);

        total3.appendChild(labelpair);
        const centre = document.createElement('div');
        centre.setAttribute('id', 'centre');
        const choiceTable = document.createElement('table');
        choiceTable.setAttribute('id', 'choice');
        const choiceRow = document.createElement('tr');
        const choiceCell = document.createElement('td');
        choiceCell.setAttribute('id', 'self-study');
        choiceCell.textContent = 'Self Study Hours';
        choiceCell.classList.add('self-study');
        choiceRow.appendChild(choiceCell);
        const choiceRow2 = document.createElement('tr');
        const choiceCell2 = document.createElement('td');
        choiceCell2.setAttribute('id', 'coaching');
        choiceCell2.textContent = 'Coaching Hours';
        choiceRow2.appendChild(choiceCell2);
        choiceTable.appendChild(choiceRow);
        choiceTable.appendChild(choiceRow2);
        centre.appendChild(choiceTable);
        total3.appendChild(centre);
        step3Clone.appendChild(total3);
        step3Clone.appendChild(document.createElement('br'));

        // create (or reuse) a global messageDiv so other code can access it
        if (!window.messageDiv) window.messageDiv = document.createElement('div');
        messageDiv.setAttribute('id', 'hour-limit-message');
        messageDiv.textContent = `You have to study at least a total of 8 hours if you want to crack ${nexam.value.toUpperCase()} !`;
        step3Clone.appendChild(messageDiv);

        if (!window.step4button) window.step4button = document.createElement('button');
        step4button.textContent = ' Next →';
        step4button.setAttribute('class', 'fbutton');
        step4button.setAttribute('id', 'sb');
        step4button.setAttribute('type', 'submit');
        step3Clone.appendChild(step4button);
        step4button.disabled = true;
        go.appendChild(step3Clone);

        step4button.addEventListener('click', function (event) {
            event.preventDefault();
            nextStep();
            if (step4Clone) {
                go.innerHTML = '';
                go.appendChild(step4Clone);
            }
            Step4();
        });
    }

    function chooseCellClick(event) {
        const clickedCell = event.target.closest('td#self-study');
        const clickedCell2 = event.target.closest('td#coaching');

        // locate the actual choice cells anywhere in the document (they may be in different rows)
        const selfStudyCell = document.getElementById('self-study');
        const coachingCell = document.getElementById('coaching');

        if (clickedCell) {
            if (selfStudyCell) selfStudyCell.classList.add('self-study');
            if (coachingCell) coachingCell.classList.remove('coaching');
            choice = true;
        }
        if (clickedCell2) {
            if (coachingCell) coachingCell.classList.add('coaching');
            if (selfStudyCell) selfStudyCell.classList.remove('self-study');
            choice = false;
        }
    }

    if (!step3Clone._delegationAdded) {
        step3Clone.addEventListener('click', function (e) {
            // choice table clicks (self-study / coaching toggle)
            if (e.target.closest('table#choice')) {
                chooseCellClick(e);
                return;
            }
            // time-table clicks
        });
        let isPointerDown = false;
        let dragStartCell = null;
        let lastProcessedCell = null;
        let recentlyHandledByPointer = null;

        function isTargetTable(td) {
            if (!td) return false;
            const tbl = td.closest('table');
            if (!tbl) return false;
            const id = tbl.id;
            return id === 'tab' || id === 'tab2';
        }

        // start dragging: process the initial cell
        step3Clone.addEventListener('pointerdown', function (e) {
            const td = e.target.closest('td');
            if (!td || !isTargetTable(td)) return;
            // only start drag on primary pointer
            if (e.isPrimary === false) return;
            isPointerDown = true;
            dragStartCell = td;
            lastProcessedCell = null;
            e.preventDefault(); // avoid text selection

            // call handleCellClick for the starting cell
            handleCellClick({ target: td });

            // mark recently handled to avoid duplicate on subsequent click event
            recentlyHandledByPointer = td;
            setTimeout(() => {
                if (recentlyHandledByPointer === td) recentlyHandledByPointer = null;
            }, 250);

            lastProcessedCell = td;
        });

        // move across cells: only handle cells in the same row as the start
        step3Clone.addEventListener('pointermove', function (e) {
            if (!isPointerDown || !dragStartCell) return;
            const td = e.target.closest('td');
            if (!td || !isTargetTable(td)) return;
            if (td === lastProcessedCell) return;
            const startRow = dragStartCell.closest('tr');
            const curRow = td.closest('tr');
            if (startRow !== curRow) return; // only allow within same row
            e.preventDefault();
            handleCellClick({ target: td });
            lastProcessedCell = td;
            // mark as recently handled so a quick click after drag doesn't duplicate
            recentlyHandledByPointer = td;
            setTimeout(() => {
                if (recentlyHandledByPointer === td) recentlyHandledByPointer = null;
            }, 250);
        });

        // normal click handling (keeps regular clicks working)
        step3Clone.addEventListener('click', function (e) {
            const td = e.target.closest('td');
            if (!td || !isTargetTable(td)) return;
            // if pointer logic just handled this exact cell, skip to avoid double-invoke
            if (recentlyHandledByPointer === td) {
                recentlyHandledByPointer = null;
                return;
            }
            handleCellClick({ target: td });
        });

        // end dragging
        document.addEventListener('pointerup', function () {
            isPointerDown = false;
            dragStartCell = null;
            lastProcessedCell = null;
            // keep recentlyHandledByPointer for a short time (cleared by timeouts above)
        });

        // also cancel on pointercancel (touch interruptions)
        document.addEventListener('pointercancel', function () {
            isPointerDown = false;
            dragStartCell = null;
            lastProcessedCell = null;
        });

        step3Clone._delegationAdded = true;
    }



    function handleCellClick(event) {
        const clickedCell = event.target.closest('td');
        if (clickedCell) {
            if (clickedCell.classList.contains('self-study')) {
                clickedCell.classList.remove('self-study');
                setTime(clickedCell.getAttribute('value'));
                count--;
                if (count < 8) {
                    messageDiv.textContent = `You have to study at least a total of 8 hours if you want to crack ${nexam.value.toUpperCase()} !`;
                    step4button.disabled = true;
                }
            }
            else if (clickedCell.classList.contains('coaching')) {
                clickedCell.classList.remove('coaching');
                setCoachingTime(clickedCell.getAttribute('value'));
                count--;
                if (count < 8) {
                    messageDiv.textContent = `You have to study at least a total of 8 hours if you want to crack ${nexam.value.toUpperCase()} !`;
                    step4button.disabled = true;
                }
            }
            else {
                atime = atime.filter(item => item !== undefined && item !== null && item !== "");
                coach = coach.filter(item => item !== undefined && item !== null && item !== "");


                if (val == "yes" && count >= 12) {
                    messageDiv.textContent = "You can only select a maximum of 12 hours because 6 hours School and 6 hours Sleep is Necessary !";
                    return;
                }

                else if ((val == "no" || val == "holiday") && count >= 18) {
                    messageDiv.textContent = "You can only select a maximum of 18 hours because 6 hours Sleep is Necessary !";
                    return;
                }

                if (window.choice == true) {
                    clickedCell.classList.add('self-study');
                    setTime(clickedCell.getAttribute('value'));
                    count++;
                }
                else if (window.choice == false && coach.length < 4) {
                    clickedCell.classList.add('coaching');
                    setTime(clickedCell.getAttribute('value'));
                    setCoachingTime(clickedCell.getAttribute('value'));
                    count++;
                }

                if (coach.length > 3) {
                    if (!messageDiv.textContent.includes("maximum of 4 hours")) {
                        messageDiv.textContent += "You can only select a maximum of 4 hours for Coaching !";
                    }
                }

                if (count < 8) {
                    messageDiv.textContent = `You have to study at least a total of 8 hours if you want to crack ${nexam.value.toUpperCase()} !`;
                    step4button.disabled = true;
                }
                else {
                    messageDiv.textContent = "";
                    step4button.disabled = false;
                }
            }
        }
    }

    function setTime(i) {
        for (let j = 0; j < atime.length; j++) {
            if (i == atime[j]) {
                atime.splice(j, 1);
                return;
            }
        }
        atime[s1] = i;
        s1++;
    }

    function setCoachingTime(i) {
        for (let j = 0; j < coach.length; j++) {
            if (i == coach[j]) {
                coach.splice(j, 1);
                return;
            }
        }
        coach[s2] = i;
        s2++;
    }


}

let step4Clone = null;
function Step4() {
    console.log(currentStep);
    go.innerHTML = "";
    if (!step4Clone) {
        step4Clone = document.createElement('div');

        const heading = document.createElement('h4');
        heading.textContent = 'Additional Features (Optional)';
        heading.style.textAlign = 'center';
        heading.setAttribute('id', 'heading');
        const centre = document.createElement('div');
        centre.appendChild(heading);

        const boxm = document.createElement("label");
        boxm.textContent = "Use Weak-Subject Feature (Recommended) ";
        boxm.setAttribute("id", "boxm");
        window.boxcheckbox = document.createElement("input");
        boxcheckbox.setAttribute("type", "checkbox");
        boxcheckbox.setAttribute("id", "boxcheckbox");
        boxm.prepend(boxcheckbox);
        centre.appendChild(boxm);
        const weakdiv = document.createElement("div");
        weakdiv.setAttribute("id", "weakdiv");
        const weaklabel = document.createElement("label");
        weaklabel.textContent = "Enter Your Weak Subjects (Max 2) : ";
        weaklabel.setAttribute("id", "weaklabel");
        weakdiv.appendChild(weaklabel);

        window.weakinput1 = document.createElement("input");
        window.weakinput1.setAttribute("type", "text");
        window.weakinput1.setAttribute("id", "weak1");
        window.weakinput1.setAttribute("placeholder", "Weak Subject 1");
        window.weakinput1.classList.add('optional-subject-input');
        weakdiv.appendChild(weakinput1);

        const weakinput2 = document.createElement("input");
        weakinput2.setAttribute("type", "text");
        weakinput2.setAttribute("id", "weak2");
        weakinput2.setAttribute("placeholder", "Weak Subject 2");
        weakinput2.classList.add('optional-subject-input');
        weakdiv.appendChild(weakinput2);
        centre.appendChild(weakdiv);
        step4Clone.appendChild(centre);
        weakdiv.style.display = "none";
        step4Clone.appendChild(document.createElement('br'));

        const warnDiv = document.createElement('div');
        warnDiv.setAttribute('id', 'warn');
        const warn4 = document.createElement('span');
        warn4.setAttribute('id', 'warn-text');
        warnDiv.appendChild(warn4);
        step4Clone.appendChild(warnDiv);

        const buttonDiv = document.createElement('div');
        buttonDiv.setAttribute('id', 'buttons');
        backb = document.createElement('button');
        backb.setAttribute('id', 'sb');
        backb.setAttribute('class', 'fbutton');
        backb.textContent = ' ⟵ Back ';
        buttonDiv.appendChild(backb);

        window.step5button = document.createElement('button');
        step5button.textContent = ' Next → ';
        step5button.setAttribute('class', 'fbutton');
        step5button.setAttribute('id', 'sb');
        step5button.setAttribute('type', 'submit');
        buttonDiv.appendChild(step5button);
        step4Clone.appendChild(buttonDiv);
        go.appendChild(step4Clone);

        backb.addEventListener('click', function () {
            go.innerHTML = '';
            go.appendChild(step3Clone);
            Step3();
            prevStep();
        });

        boxcheckbox.addEventListener('change', function () {
            if (this.checked) {
                weakdiv.style.display = "block";
            } else {
                weakdiv.style.display = "none";
                document.getElementById("weak1").value = "";
                document.getElementById("weak2").value = "";
                weaksub = 0;
            }
        });

        step5button.addEventListener('click', function (event) {
            if ((boxcheckbox.checked === true) && (document.getElementById("weak1").value == "" && document.getElementById("weak2").value == "")) {
                warn4.textContent = "Fill at least one weak Subject !";
                setTimeout(() => {
                    warn4.textContent = "";
                }, 2000);
            }
            else {
                event.preventDefault();
                Processing();
                nextStep();
            }
        });
    }
    else
        go.appendChild(step4Clone);

}




let font = ["Caveat,cursive", "Times New Roman", "Pacifico,cursive"];
let fcolor = ["purple", "black", "darkblue"];
let bg = ["white", "white", "linear-gradient(90deg, rgb(241, 241, 163),white)"];
let os = [];
var timec = [];
var coaching = [];
let xy = 100;
let box = 0;
const aim = ["AIIMS DELHI", "IIT BOMBAY"];
function Processing() {
    window.w1 = document.getElementById("weak1");
    window.w2 = document.getElementById("weak2");
    go.innerHTML = "";
    go.style.height = "auto";
    document.getElementById("create_hero").style.display = "none";
    go.style.width = "96vw";
    go.style.margin = "-14px 20px 20px 20px";
    atime = atime.filter(item => item !== undefined && item !== null && item !== "");
    atime = atime.map(Number);
    coach = coach.filter(item => item !== undefined && item !== null && item !== "");
    coach = coach.map(Number);
    atime.sort((a, b) => a - b);
    coach.sort((a, b) => a - b);
    console.log(atime);
    console.log(coach);
    for (let i = 0; i < atime.length; i++) {
        if (timehr[atime[i] - 1]) {
            timec[i] = timehr[atime[i] - 1];
        }
    }

    for (let i = 0; i < coach.length; i++) {
        if (timehr[coach[i] - 1]) {
            coaching[i] = timehr[coach[i] - 1];
        }
    }

    n = Math.floor((timec.length - 1 - coach.length) / 3);
    const hr = document.createElement("h2");
    hr.setAttribute("id", "heading2");
    hr.textContent = "Last Step To Go !";
    hr.style.display = "block";
    hr.style.textAlign = "center";
    go.appendChild(hr);
    const tlabel = document.createElement("h3");
    tlabel.setAttribute("id", "heading2");
    tlabel.textContent = "Templates For Your Timetable";
    tlabel.style.textAlign = "center";
    tlabel.style.fontWeight = "bold";
    go.appendChild(tlabel);
    const tempdiv = document.createElement("div");
    tempdiv.setAttribute("id", "templates");

    const temp1 = document.createElement("div");
    temp1.setAttribute("class", "temp");
    const img1 = document.createElement("img");
    img1.setAttribute("src", "static/styles/Template(Purple).jpg");
    temp1.appendChild(img1);
    const tp1 = document.createElement("p");
    tp1.textContent = "CASUAL PURPLE";
    temp1.appendChild(tp1);
    tempdiv.appendChild(temp1);

    const temp2 = document.createElement("div");
    temp2.setAttribute("class", "temp");
    const img2 = document.createElement("img");
    img2.setAttribute("src", "static/styles/Template(Black).jpg");
    temp2.appendChild(img2);
    const tp2 = document.createElement("p");
    tp2.textContent = "FORMAL BLACK";
    temp2.appendChild(tp2);
    tempdiv.appendChild(temp2);

    const temp3 = document.createElement("div");
    temp3.setAttribute("class", "temp");
    const img3 = document.createElement("img");
    img3.setAttribute("src", "static/styles/Template(Blue).jpg");
    temp3.appendChild(img3);
    const tp3 = document.createElement("p");
    tp3.textContent = "CURSIVE BLUE";
    temp3.appendChild(tp3);
    tempdiv.appendChild(temp3);
    go.appendChild(tempdiv);


    const overdiv = document.createElement("div");
    overdiv.setAttribute("id", "overlay");
    const divin = document.createElement("div");
    divin.setAttribute("id", "overlay-div");
    const overlayImg = document.createElement("img");
    overlayImg.setAttribute("id", "overlay-img");
    const apply = document.createElement("button");
    apply.setAttribute("class", "over-btn");
    apply.style.backgroundImage = "url('static/styles/check.png')";
    const close = document.createElement("button");
    close.setAttribute("class", "over-btn");
    close.style.backgroundImage = "url('static/styles/cross.png')";
    overdiv.appendChild(overlayImg);
    divin.appendChild(apply);
    divin.appendChild(close);
    overdiv.appendChild(divin);
    document.body.appendChild(overdiv);

    const templatesDiv = document.getElementById("templates");
    const templateImages = templatesDiv.querySelectorAll(".temp img");

    function showOverlay(index) {
        if (templateImages && templateImages[index]) {
            overlayImg.src = templateImages[index].src;
            overdiv.style.display = "block";
            overdiv.style.opacity = "1";
        } else {
            overdiv.style.display = "none";
        }
    }
    templateImages.forEach((img, idx) => {
        img.addEventListener("click", (e) => {
            e.preventDefault(); // prevent any default action

            // LEFT CLICK (button === 0)
            if (e.button === 0) {
                // Directly apply template without overlay
                selectedTemplateIdx = idx;
                const seltable = document.getElementById("ftable");
                seltable.style.fontFamily = font[idx];
                seltable.style.borderColor = fcolor[idx];
                seltable.style.color = fcolor[idx];
                const cells = seltable.querySelectorAll('td, th');
                cells.forEach(cell => {
                    cell.style.fontFamily = font[idx];
                    cell.style.borderColor = fcolor[idx];
                    cell.style.color = fcolor[idx];
                });
                seltable.style.background = bg[idx];
            }
        });

        // RIGHT CLICK (contextmenu)
        img.addEventListener("contextmenu", (e) => {
            e.preventDefault(); // prevent browser context menu
            selectedTemplateIdx = idx;
            showOverlay(idx);
        });
    });

    apply.addEventListener("click", () => {
        overdiv.style.display = "none";
        overdiv.style.opacity = "0";
        const seltable = document.getElementById("ftable");
        if (selectedTemplateIdx !== null) {
            seltable.style.fontFamily = font[selectedTemplateIdx];
            seltable.style.borderColor = fcolor[selectedTemplateIdx];
            seltable.style.color = fcolor[selectedTemplateIdx];
            const cells = seltable.querySelectorAll('td, th');
            cells.forEach(cell => {
                cell.style.fontFamily = font[selectedTemplateIdx];
                cell.style.borderColor = fcolor[selectedTemplateIdx];
                cell.style.color = fcolor[selectedTemplateIdx];
            });
            seltable.style.background = bg[selectedTemplateIdx];
        }
    });
    close.addEventListener("click", () => {
        overdiv.style.display = "none";
        overdiv.style.opacity = "0";
    });
    document.addEventListener("click", (e) => {
        if (overdiv.style.display === "block" && !overdiv.contains(e.target)) {
            overdiv.style.display = "none";
            overdiv.style.opacity = "0";
        }
    });




    const edit = document.createElement("h3");
    edit.setAttribute("id", "heading2");
    edit.textContent = "Click on the cells to edit them !";
    edit.style.textAlign = "center";
    edit.style.fontWeight = "bold";
    go.appendChild(edit);
    const wrapper = document.createElement('div');
    wrapper.className = 'ftable-wrapper';
    var ftable = document.createElement('table');
    ftable.setAttribute('id', 'ftable');

    const title = document.createElement('tr');
    const hd = document.createElement('th');
    hd.setAttribute('colspan', '8');
    hd.textContent = tname.value + " - For " + nexam.value.toUpperCase();
    hd.style.textAlign = 'center';
    hd.style.fontSize = '24px';
    hd.style.fontWeight = 'bold';
    hd.style.border = '1px solid #000';
    hd.style.padding = '8px';
    title.appendChild(hd);
    ftable.appendChild(title);

    const headerRow = document.createElement('tr');
    const timeHeader = document.createElement('th');
    timeHeader.textContent = 'Time';
    timeHeader.setAttribute('id', 'timeHeader');
    timeHeader.style.textAlign = 'center';
    timeHeader.style.border = '1px solid #000';
    headerRow.appendChild(timeHeader);

    // Days of the week headers
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    days.forEach(day => {
        const dayHeader = document.createElement('th');
        dayHeader.textContent = day;
        dayHeader.style.border = '1px solid #000';
        dayHeader.style.padding = '4px';
        headerRow.appendChild(dayHeader);
    });

    ftable.appendChild(headerRow);
    console.log(timec);
    console.log(coaching);
    // Column-wise: for each day (column), create all rows (time slots)
    for (let j = 0; j < 7; j++) { // 6 days/columns (Monday to Saturday)

        for (let i = 0; i < timec.length; i++) {
            // time slots/rows

            let row;
            // Create row only for the first column
            if (j === 0) {
                row = document.createElement('tr');
                row.setAttribute('id', `row${i + 1}`);
                const timeCell = document.createElement('td');
                timeCell.textContent = timec[i];
                for (let k = 0; k < coach.length; k++) {
                    if (timec[i] == coaching[k]) {
                        coach[k] = i;
                    }
                }
                timeCell.style.border = '1px solid #000';
                timeCell.style.padding = '4px';
                row.appendChild(timeCell);
                ftable.appendChild(row);
            } else if (j < 7) {
                // Get the existing row
                row = ftable.querySelector(`#row${i + 1}`);
            }
            // Create cell for this column and row
            const cell = document.createElement('td');
            // id is now cell{column}_{row}
            cell.setAttribute('id', `cell${j + 1}_${i + 1}`);
            cell.style.textAlign = 'center';
            // Only add the Sunday cell (j==6) to the first row (i==0), with rowspan
            if (j === 6) {
                if (i === 0) {
                    const sundayCell = document.createElement('td');
                    sundayCell.setAttribute('rowspan', timec.length);
                    sundayCell.setAttribute('id', 'Sunday');
                    // Call your function to fill content
                    const ex = nexam.value;
                    if (typeof window[ex] === "function") {
                        window[ex](sundayCell, j + 1, i + 1);
                    }
                    sundayCell.style.textAlign = 'center';
                    sundayCell.style.fontSize = '18px';
                    sundayCell.style.width = '120px';
                    sundayCell.style.border = '1px solid #000';
                    sundayCell.style.padding = '4px';
                    row.appendChild(sundayCell);
                }
                // For other rows, do NOT append a cell for Sunday
            } else {
                // All other days: add a cell as usual
                const cell = document.createElement('td');
                cell.setAttribute('id', `cell${j + 1}_${i + 1}`);
                cell.style.textAlign = 'center';
                if (coach.includes(i)) {
                    cell.textContent = "Coaching";
                } else {
                    if (typeof window[nexam.value] === "function") {
                        window[nexam.value](cell, j + 1, i + 1);
                    }
                }
                cell.style.border = '1px solid #000';
                cell.style.padding = '4px';
                row.appendChild(cell);
            }
        }
    }
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.setAttribute("colspan", "8");
    if (dcollege.value === "") {
        td.textContent = "AIM -for- " + aim[xy];
    } else {
        td.textContent = "AIM -for- " + dcollege.value;
    }
    td.style.textAlign = "center";
    td.style.fontSize = "24px";
    td.style.fontWeight = '500';
    const boxrow = document.createElement("tr");
    boxrow.setAttribute("id", "boxrow");
    const boximg = document.createElement("img");
    boximg.setAttribute("src", "static/styles/box.png");
    boximg.setAttribute("class", "boximg");
    for (let i = 0; i < 8; i++) {
        const boxtd = document.createElement("td");
        boxtd.setAttribute("class", "box");
        if (i == 0)
            boxtd.innerHTML = "%<br>COMPLETED";
        else
            boxtd.appendChild(boximg.cloneNode());
        boxrow.appendChild(boxtd);
    }
    ftable.appendChild(boxrow);
    row.appendChild(td);
    ftable.appendChild(row);
    wrapper.appendChild(ftable);
    go.appendChild(wrapper);

    const editableCells = ftable.querySelectorAll('td');
    editableCells.forEach(td => {
        // Make cells NOT editable if they are in the row with id 'boxrow' or contain an image
        if (td.parentElement && td.parentElement.id === 'boxrow') {
            td.setAttribute('contenteditable', 'false');
        }
        else {
            td.setAttribute('contenteditable', 'true');
            // Prevent image insertion via paste or drag/drop
            td.addEventListener('paste', function (e) {
                const items = (e.clipboardData || window.clipboardData).items;
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type && items[i].type.startsWith('image')) {
                        e.preventDefault();
                        return;
                    }
                }
                // Prevent HTML img tags from being pasted
                const html = (e.clipboardData || window.clipboardData).getData('text/html');
                if (html && /<img[\s\S]*?>/i.test(html)) {
                    e.preventDefault();
                }
            });
            td.addEventListener('drop', function (e) {
                if (e.dataTransfer && e.dataTransfer.types) {
                    for (let i = 0; i < e.dataTransfer.types.length; i++) {
                        if (e.dataTransfer.types[i] === 'Files') {
                            e.preventDefault();
                            return;
                        }
                    }
                    // Prevent HTML img tags from being dropped
                    const html = e.dataTransfer.getData('text/html');
                    if (html && /<img[\s\S]*?>/i.test(html)) {
                        e.preventDefault();
                    }
                }
            });
        }
    });

    const boxm = document.createElement("label");
    boxm.textContent = "Include a Row for Completion Tracking ";
    boxm.setAttribute("id", "boxm");
    const boxcheckbox = document.createElement("input");
    boxcheckbox.setAttribute("type", "checkbox");
    boxcheckbox.setAttribute("id", "boxcheckbox");
    boxm.prepend(boxcheckbox);
    boxcheckbox.addEventListener("change", function () {
        const Boxr = document.getElementById("boxrow");
        if (box == 0)
            Boxr.style.display = "table-row";
        else
            Boxr.style.display = "none";

        if (this.checked == true)
            box = 1;
        else
            box = 0;
    });
    go.appendChild(boxm);

    const Gen = document.createElement("button");
    Gen.setAttribute('class', 'fbutton');
    Gen.setAttribute('id', 'Gen');
    Gen.setAttribute('type', 'submit');
    Gen.textContent = "Generate Timetable Image";
    Gen.addEventListener('click', function (event) {
        event.preventDefault();

        setTimeout(() => {
            html2canvas(ftable, { scale: 3 }).then(canvas => {
                // Create a link to download the image
                const link = document.createElement('a');
                link.download = 'timetable.jpg';
                link.href = canvas.toDataURL('image/jpeg', 1.0);
                link.click();
            });
        }, 500);
    });
    go.appendChild(Gen);
}
let p = 0, c = 0, b = 0, z = 0, m = 0;
let n = 0, pcf = 0, mcq = 0, t = 0, mt = 0, pyq = 0;
