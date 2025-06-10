let isM=true;
function isMobile() {
    // Returns true for mobile/tablet, false for laptop/desktop
    const ua = navigator.userAgent;
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isLaptopOrDesktop = /Windows NT|Macintosh|Linux x86_64|X11|CrOS/i.test(ua);
    console.log("User Agent: " + ua);
    console.log("Is Mobile Device: " + isMobileDevice);
    console.log("Is Laptop or Desktop: " + isLaptopOrDesktop);
    isM = isMobileDevice;
    const nav = document.querySelector('nav');
}
isMobile();


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
    os=[document.getElementById("os1"), document.getElementById("os2"), document.getElementById("os3")];
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

function createTable(label, isMorning) {
    const head = document.createElement('h4');
    head.textContent = label;
    head.setAttribute('id', 'heading');
    go.appendChild(head);

    const table = document.createElement('table');
    table.setAttribute('id', 'tab');
    for(let i=0;i<2;i++){
    const row = document.createElement('tr');
    for (let k=0; k <= 5; k++,j++) {
        const col = document.createElement('td');
        if (isMorning) {
            if (k == 0&&i==0)
                col.textContent = '12 AM to 1 AM';
            else if (j == 12)
                col.textContent = '11 AM to 12 PM';
            else
                col.textContent = `${j-1} AM to ${j} AM`;
        } else {
            if (k == 0&&i==0)
                col.textContent = '12 PM to 1 PM';
            else if (j == 24)
                col.textContent = '11 PM to 12 AM';
            else
                col.textContent = `${j-13} PM to ${j-12} PM`;
        }
        col.setAttribute('value',j);
        row.appendChild(col);
    }


    table.appendChild(row);
}
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

        
// Override createHourTable for mobile users
if (isM) {
    // Redefine createHourTable for mobile
        createTable('Morning Hours:', true);
        createTable('Evening Hours:', false);
}
        else{
        createHourTable('Morning Hours:', true);
        createHourTable('Evening Hours:', false);
        }

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
                    if(count<6){
                        messageDiv.textContent =`You have to study at least 6 hours if you want to crack ${nexam.value.toUpperCase()} !`;
                        finalsubmit.disabled = true;
                    }
                    else {
                    messageDiv.textContent = "";
                        finalsubmit.disabled = false;
                    }
                    
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

let os=[];
const tname = document.getElementById("tname");
let nexam= document.getElementById("Exam");
var timec=[];
function Processing() 
{

    atime = atime.filter(item => item !== undefined && item !== null && item !== "");
    atime = atime.map(Number);
    atime.sort((a, b) => a - b);
    for(let i=0;i<atime.length;i++){
        const td = document.querySelector('td[value="' + atime[i] + '"]');
        if (td) {
            timec[i] = td.textContent;
        }    
    }
    // Calculate n once here for NEET
    n = Math.floor((timec.length - 1) / 3);

    var ftable = document.createElement('table');
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

    // Column-wise: for each day (column), create all rows (time slots)
    for (let j = 0; j < 7; j++) { // 6 days/columns (Monday to Saturday)
        
        for (let i = 0; i < timec.length; i++) {
             // time slots/rows
            if(i==0 && j%2==0){
                p=0;
                c=0;
                b=0;
                z=0;
                pcf=0;
                mcq=0;
            }
            let row;
            // Create row only for the first column
            if (j === 0) {
                row = document.createElement('tr');
                row.setAttribute('id', `row${i + 1}`);
                const timeCell = document.createElement('td');
                timeCell.textContent = timec[i];
                timeCell.style.border = '1px solid #000';
                timeCell.style.padding = '4px';
                row.appendChild(timeCell);
                ftable.appendChild(row);
            } else if(j<7) {
                // Get the existing row
                row = ftable.querySelector(`#row${i + 1}`);
            }
            // Create cell for this column and row
            const cell = document.createElement('td');
            // id is now cell{column}_{row}
            cell.setAttribute('id', `cell${j+1}_${i+1}`);
            const ex=nexam.value;
        if(ex=="neet")
        {
             NEET(cell,j+1,i+1);
        }
            cell.style.border = '1px solid #000';
            cell.style.padding = '4px';
            row.appendChild(cell);
        }
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

let n=0;let m=0;let t=0;
function NEET(cell,o,x) {
    
    const subjects=[
        "Physics","Physics Numericals",
        "Chemistry","Chemistry Numericals",
        "Botany","Ncert Reading",
        "Zoology","Ncert Reading",
        "Phy-Chem NEET MCQs ",
        "Biology NEET MCQs "
    ];
    os= os.filter(item => item !== undefined && item !== null && item !== "");
    // n is now calculated once in Processing()
    
    for(let i=o;i<=6;i++){  
    n=Math.floor((timec.length-1)/3);
    
    for(let i=o;i<=6;i++){  
       
        for(let l=x;l<=n*3&&n*3<timec.length;l++){
            console.log(`cell${l}_${i}`);
            
           
            if(x==n*3){
                cell.textContent="Mistake Analysis";
                return;
            }
            if(p!=n){
                if(p==n-1){
                    cell.textContent=subjects[1];
                    p++;
                    return;
                }
                cell.textContent=subjects[0];
                p++;
                return;
            }
            if(c!=n){
                if(c==n-1){
                    cell.textContent=subjects[3];
                    c++;
                    return;
                }
                cell.textContent=subjects[2];
                c++;
                return;
            }
            if(b!=n){
                if(b==n-1&& l!=1&&z==n-1){
                    cell.textContent=subjects[5];
                    b++;
                    return;
                }
                if(b<n-1){
                    cell.textContent=subjects[4];
                    b++;
                    return;
                }
            }
            if(z!=n){
                if(z==n-1){
                    cell.textContent=subjects[7];
                    z++;
                    return;
                }
                cell.textContent=subjects[6];
                z++;
                return;
            }
            if(pcf!=n-1){
                cell.textContent=subjects[8];
                pcf++;
                return;
            }

            if(mcq!=n-1){
                cell.textContent=subjects[9];
                mcq++;
                return;
            }
        }
        ol:for(let l=x;l<=timec.length;l++){
            for(;m<os.length&&t==0;)
                {
                cell.textContent = os[m].value;
                t=1;
                m++;
                if(m==os.length){
                    m=0;
                }
                if(l==timec.length)
                    t=0;
                return;
            }
            if (l==timec.length-1) {
            cell.textContent ="Phy-Chem NCERT Reading";
            return;
            }
            cell.textContent = "Revision";
            t=0;
            return;

        }
        
    
    }
}
    if (o === 7&& x === 1) {
        cell.setAttribute('rowspan', timec.length);
        cell.textContent = "Mixed Tests , NEET Pyqs , Revision of Everything Studied + Focus on Weak Points ";
        cell.style.textAlign = 'center';
        cell.style.fontSize = '20px';
        // No return here, continue with the rest of the function
    }
}


