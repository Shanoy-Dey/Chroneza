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
        });
    });
});


const school=document.getElementById("schooling");
school.addEventListener('change',Table);
 let s=1;
function Table(){
  const val=school.value;
  if(!(val=="why")&& s>0){
    s=s-1;
    const go=document.getElementById("her");
    const heading=document.createElement('h3');
    heading.textContent='Select Your Study Hours:';
    heading.setAttribute('id','heading');
    go.appendChild(heading);
    go.appendChild(document.createElement('br'));

    const head1=document.createElement('h4');
    head1.textContent='Morning Hours:';
    head1.setAttribute('id','heading');
    go.appendChild(head1);

    const timet=document.createElement('table');
    const row=document.createElement('tr');
    timet.setAttribute('id','tab');
    
    for(let i=0;i<=11;i++)
    {
        const col=document.createElement('td');
        if(i==0)
          col.textContent='12 AM to 1 AM';
        else
          col.textContent=`${i} AM to ${i+1} AM`;
        if(i==11)
          col.textContent=`${i} AM to ${i+1} PM`;
        row.appendChild(col);
    }

    timet.appendChild(row);
    go.appendChild(timet);
    go.appendChild(document.createElement('br'));


    const head2=document.createElement('h4');
    head2.textContent='Evening Hours:';
    head2.setAttribute('id','heading');
    go.appendChild(head2);

    const timet2=document.createElement('table');
    const row2=document.createElement('tr');
    timet.setAttribute('id','tab');
    
    for(let i=0;i<=11;i++)
    {
        const col=document.createElement('td');
        if(i==0)
          col.textContent='12 PM to 1 PM';
        else
          col.textContent=`${i} PM to ${i+1} PM`;
        if(i==11)
          col.textContent=`${i} PM to ${i+1} AM`;
        row2.appendChild(col);
    }

    timet2.appendChild(row2);
    go.appendChild(timet2);
    go.appendChild(document.createElement('br'));
  }
}

const tables = document.querySelectorAll("td");
let ticount=0;
tables.forEach( table=> {
    if (table) { 
  table.addEventListener("click", function() {
    if (table.style.borderColor === "yellow") {
      table.style.borderColor = "";
        table.style.backgroundColor="";
        count--;
    } else {
        table.style.backgroundColor="pink";
      table.style.borderColor = "yellow";
      count++;
    }});
    }
});