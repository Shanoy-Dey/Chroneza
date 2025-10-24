function neet(cell, o, x) {
    console.log(w1.value,w2.value);
    n = Math.floor((timec.length - coach.length - 1 - weaksub) / 3);
    xy = 0;
    const subjects = [
        "Physics", "Physics Numericals",
        "Chemistry", "Chemistry Numericals",
        "Botany", "Botany Ncert Reading",
        "Zoology", "Revision", "Physics NEET MCQs ",
        "Biology NEET MCQs ", "Zoology Ncert Reading", "Chemistry NEET MCQs"
    ];
    os = os.filter(item => item !== undefined && item !== null && item !== "");
    // n is now calculated once in Processing()
    if (x == 1) {
        if(n==1){
            pcf = 0;
            mcq = 0;
        }
        else{
            pcf=n-1;
            mcq=n-1;
        }
        if (o % 2 == 1) {
            p = 0;
            c = 0;
            b = 0;
            z = 0;
            weaksub = 0;
            if (w1 && typeof w1.value === 'string' && w1.value.trim() !== "") weaksubneet(w1.value.trim());
            if (w2 && typeof w2.value === 'string' && w2.value.trim() !== "") weaksubneet(w2.value.trim());
            if (((p == -1 && b == -1) || (p == -1 && c == -1) || (z == -1 && c == -1) || (z == -1 && b == -1)) && weaksub > 0) {
                weaksub--;
            }
        }
    }
    for (let i = o; i <= 6; i++) {

        for (let i = o; i <= 6; i++) {

            for (let l = x; l <= (n * 3) + coach.length + weaksub && n * 3 < timec.length; l++) {


                if (x == (n * 3) + coach.length + weaksub) {
                    cell.textContent = "Mistake Analysis";
                    return;
                }
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
                if (c != n && o % 2 == 0) {
                    if (c == n - 1) {
                        cell.textContent = subjects[3];
                        c++;
                        return;
                    }
                    cell.textContent = subjects[2];
                    c++;
                    return;
                }
                if (b != n && o % 2 == 0) {
                    if (b == n - 1) {
                        cell.textContent = subjects[5];
                        b++;
                        return;
                    }
                    if (b < n - 1) {
                        cell.textContent = subjects[4];
                        b++;
                        return;
                    }
                }
                if (z != n) {
                    if (z == n - 1) {
                        cell.textContent = subjects[10];
                        z++;
                        return;
                    }
                    cell.textContent = subjects[6];
                    z++;
                    return;
                }

                if (pcf != n) {
                    if (o % 2 == 0)
                        cell.textContent = subjects[11];
                    else
                        cell.textContent = subjects[8];
                    pcf++;
                    return;
                }

                if (mcq != n) {
                    cell.textContent = subjects[9];
                    mcq++;
                    return;
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
                    cell.textContent = "Phy-Chem NCERT Go Through";
                    return;
                }
                cell.textContent = subjects[7];
                t = 0;
                return;

            }


        }
    }
    if (o === 7 && x === 1) {
        cell.setAttribute('rowspan', timec.length);
        cell.setAttribute('id', 'Sunday')
        cell.textContent = "Mixed Tests , NEET Pyqs , Revision of Everything Studied + Focus on Weak Points ";
        cell.style.textAlign = 'center';
        cell.style.fontSize = '20px';
        cell.style.width = '120px';
        // No return here, continue with the rest of the function
    }
}

function weaksubneet(sub) {
    if (sub.charAt(0) === 'P' || sub.charAt(0) === 'p') {
        p += (-1);
    }
    else if (sub.charAt(0) === 'C' || sub.charAt(0) === 'c') {
        c += (-1);
    }
    else if (sub.charAt(0) === 'Z' || sub.charAt(0) === 'z') {
        z += (-1);
    }
    else if (sub.charAt(0) === 'B' || sub.charAt(0) === 'b') {
        b += (-1);
    }
    else
        weaksub--;
    weaksub++;
}