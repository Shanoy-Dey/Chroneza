document.addEventListener('DOMContentLoaded', function () {
    const radioButtons = document.querySelectorAll('input[name="optional"]');
    const container = document.getElementById("here");

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
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

const input = document.getElementsByTagName("input");
for (let i = 0; i < input.length; i++) {
    input[i].setAttribute('required', 'true');
}

const school=document.getElementById("schooling");
const submit = document.getElementById("sb");
submit.addEventListener('click', function(event) {
  event.preventDefault();
   if (form.checkValidity()) {
    Table();
  } else {
    form.reportValidity();
  }
});

    var j=1;
        const go = document.getElementById("her");

function createHourTable(label, isMorning) {
    const head = document.createElement('h4');
    head.textContent = label;
    head.setAttribute('id', 'heading');
    go.appendChild(head);

    const table = document.createElement('table');
    const row = document.createElement('tr');
    table.setAttribute('id', 'tab');
    for (let i = 0; i <= 11; i++) {
        const col = document.createElement('td');
        if (isMorning) {
            if (i == 0)
                col.textContent = '12 AM to 1 AM';
            else if (i == 11)
                col.textContent = '11 AM to 12 PM';
            else
                col.textContent = `${i} AM to ${i + 1} AM`;
        } else {
            if (i == 0)
                col.textContent = '12 PM to 1 PM';
            else if (i == 11)
                col.textContent = '11 PM to 12 AM';
            else
                col.textContent = `${i} PM to ${i + 1} PM`;
        }
        col.setAttribute('value',j);
        j++;
        row.appendChild(col);
    }

    table.appendChild(row);
    go.appendChild(table);
    go.appendChild(document.createElement('br'));
}
var atime=[];
 var count = 0;
let s=0;
function Table() {
        const val = school.value;
        const go = document.getElementById("her");
        go.innerHTML = "";
        const heading = document.createElement('h3');
        heading.textContent = 'Select Your Study Hours:';
        heading.setAttribute('id', 'heading');
        go.appendChild(heading);
        go.appendChild(document.createElement('br'));

        createHourTable('Morning Hours:', true);
        createHourTable('Evening Hours:', false);

        const messageDiv = document.createElement('div');
       messageDiv.setAttribute('id', 'hour-limit-message');
       go.appendChild(messageDiv);
       
        function handleCellClick(event) {
            const clickedCell = event.target.closest('td');
            if (clickedCell) {
                setTime(clickedCell.getAttribute('value'));
                if (clickedCell.classList.contains('selected')) {
                  clickedCell.classList.remove('selected');
                    count--;
                } else {
                    
                    if (val == "yes" && count >= 12) {
                    messageDiv.textContent = "You can only select a maximum of 12 hours because 6 hours School and 6 hours Sleep is Necessary !";
                    return;
                }
                else if (val == "no" && count >= 18) {
                    messageDiv.textContent = "You can only select a maximum of 18 hours because 6 hours Sleep is Necessary !";
                    return;
                } 
                clickedCell.classList.add('selected');
                count++;
                }
            }
        }
        
        function setTime(i){
            for(let j=0;j<atime.length;j++){
                 if (i == atime[j]) {
                    atime.splice(j, 1);
                    return;
                } 
            }
            atime[s]=i;
            s++;
        }

        const tables = go.querySelectorAll('table');
        tables.forEach(table => {
            table.addEventListener('click', handleCellClick);
        });

        const finalsubmit = document.createElement('button');
        finalsubmit.textContent = ' Finish ';
        finalsubmit.setAttribute('id', 'sb');
        finalsubmit.setAttribute('type', 'submit');
        go.appendChild(finalsubmit);
        finalsubmit.addEventListener('click', function(event) {
            event.preventDefault();
            finalsubmit.disabled = true;
            Processing();
        });
    }

const os=[document.getElementById("os1"), document.getElementById("os2"), document.getElementById("os3")];
const tname = document.getElementById("tname");
const nexam= document.getElementById("Exam");
function Processing(cc) 
{

    atime = atime.filter(item => item !== undefined && item !== null && item !== "");
    atime = atime.map(Number);
    atime.sort((a, b) => a - b);
    var timec=[];
    for(let i=0;i<atime.length;i++){
        const td = document.querySelector('td[value="' + atime[i] + '"]');
        if (td) {
            timec[i] = td.textContent;
        }    
    }
    const ftable = document.createElement('table');
    ftable.setAttribute('id', 'ftable');

    const title=document.createElement('tr');
    const hd= document.createElement('th');
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
    timeHeader.style.border = '1px solid #000';
    timeHeader.style.padding = '4px';
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

    for (let i = 0; i < timec.length; i++) {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = timec[i];
        timeCell.style.border = '1px solid #000';
        timeCell.style.padding = '4px';
        row.appendChild(timeCell);

        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');
            cell.style.border = '1px solid #000';
            cell.style.padding = '4px';
            row.appendChild(cell);
        }
        ftable.appendChild(row);
    }

    go.appendChild(ftable);

    setTimeout(() => {
        html2canvas(ftable).then(canvas => {
            // Create a link to download the image
            const link = document.createElement('a');
            link.download = 'timetable.jpg';
            link.href = canvas.toDataURL('image/jpeg', 1.0);
            link.click();
        });
    }, 500);
}


