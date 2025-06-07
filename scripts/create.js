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

function createHourTable(label, isMorning) {
    const go = document.getElementById("her");
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
        row.appendChild(col);
    }

    table.appendChild(row);
    go.appendChild(table);
    go.appendChild(document.createElement('br'));
}

 var count = 0;
let s=1;
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
       messageDiv.style.color = 'red';
       messageDiv.style.fontSize = '0.95em';
       messageDiv.style.margin = '8px 0';
       go.appendChild(messageDiv);
       
        function handleCellClick(event) {
            const clickedCell = event.target.closest('td');
            if (clickedCell) {
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
        
        const tables = go.querySelectorAll('table');
        tables.forEach(table => {
            table.addEventListener('click', handleCellClick);
        });

        if(val=="yes"){
            const H1=document.createElement('input');
            H1.setAttribute('type', 'radio');
            H1.setAttribute('name', 'holidays');
            H1.setAttribute('value', '6');
            H1.textContent = "Saturday";
            go.appendChild(H1);            
        }

        const finalsubmit = document.createElement('button');
        finalsubmit.textContent = 'Ready For Your New Timetable!';
        finalsubmit.setAttribute('id', 'sb');
        finalsubmit.setAttribute('type', 'submit');
        go.appendChild(finalsubmit);
  }
