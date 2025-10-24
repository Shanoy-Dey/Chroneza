function jee(cell, o, x) {
    xy = 1;
    const subjects = [
        "Physics", "Physics Numericals",
        "Chemistry", "Chemistry Numericals",
        "Mathematics", "Mathematics Questions",
        "JEE Main PYQs"];
    os = os.filter(item => item !== undefined && item !== null && item !== "");
    // n is now calculated once in Processing()
    if (x == 1) {
        p = 0;
        c = 0;
        mt = 0;
        pyq = 0;
        weaksub = 0;
        if (w1 && typeof w1.value === 'string' && w1.value.trim() !== "") weaksubjee(w1.value.trim());
        if (w2 && typeof w2.value === 'string' && w2.value.trim() !== "") weaksubjee(w2.value.trim());
    }
    for (let i = o; i <= 6; i++) {
        n = Math.floor((timec.length - coach.length - 1-weaksub) / 3);

        for (let i = o; i <= 6; i++) {

            for (let l = x; l <= (n * 3) + coach.length + weaksub && n * 3 < timec.length; l++) {


                if (p != n) {
                    if (p == n - 1) {
                        cell.textContent = subjects[1];
                        p++;
                        return;
                    }
                    cell.textContent = subjects[0];
                    p++;
                    return;
                }
                if (c != n) {
                    if (c == n - 1) {
                        cell.textContent = subjects[3];
                        c++;
                        return;
                    }
                    cell.textContent = subjects[2];
                    c++;
                    return;
                }
                if (mt != n) {
                    if (mt == n - 1) {
                        cell.textContent = subjects[5];
                        mt++;
                        return;
                    }
                    if (mt < n - 1) {
                        cell.textContent = subjects[4];
                        mt++;
                        return;
                    }
                }

            }
            ol: for (let l = x; l <= timec.length; l++) {
                for (; m < os.length && t == 0;) {
                    cell.textContent = os[m].value;
                    t = 1;
                    m++;
                    if (m == os.length) {
                        m = 0;
                    }
                    if (l == timec.length)
                        t = 0;
                    return;
                }
                if (l == timec.length - 1) {
                    cell.textContent = "Notes Review";
                    return;
                }
                if (o % 2 == 0) {
                    if (l % 2 == 1)
                        cell.textContent = "Mistake Analysis";
                    else
                        cell.textContent = subjects[6];
                }
                else {
                    if (l % 2 == 1)
                        cell.textContent = subjects[6];
                    else
                        cell.textContent = "Notes Revision";
                }
                t = 0;
                return;

            }
        }
    }
    if (o === 7 && x === 1) {
        cell.setAttribute('rowspan', timec.length);
        cell.setAttribute('id', 'Sunday')
        cell.textContent = "Mixed Tests , JEE Advanced Pyqs , Revision of Written Notes + Focus on Weak Points ";
        if (cell) {
            cell.style.textAlign = 'center';
            cell.style.fontSize = '18px';
            cell.style.width = '120px';
        }
        // No return here, continue with the rest of the function
    }
}

function weaksubjee(sub){
    weaksub++;
    if(sub.charAt(0) === 'P'|| sub.charAt(0) === 'p'){
        p+=(-1);
    }
    else if(sub.charAt(0) === 'C'|| sub.charAt(0) === 'c'){
        c+=(-1);
    }
    else if(sub.charAt(0) === 'M'|| sub.charAt(0) === 'm'){
        mt+=(-1);
    }
    else{
        weaksub--;
    }
}