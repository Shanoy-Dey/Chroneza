function Exam_prep(){
    go.innerHTML='';
    const img_input=document.createElement('input');
    img_input.type='file';
    img_input.accept='image/*';
    go.appendChild(img_input);  
    const status = document.createElement('div');
    status.style.cssText = 'display:inline-block; width:220px; margin-right:8px; vertical-align:middle;';
    go.insertBefore(status, img_input);

    img_input.addEventListener('change', () => {
        status.textContent = '';
        status.style.color = 'black';
        const file = img_input.files && img_input.files[0];
        if (!file) return;

        if (!file.type || !file.type.startsWith('image/')) {
            status.textContent = 'Selected file is not an image';
            status.style.color = 'red';
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        const sizeOk = file.size < maxSize;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const resOk = img.naturalWidth >= 600 && img.naturalHeight >= 600;
                const parts = [];
                parts.push(sizeOk ? 'Size OK (<5MB)' : 'Size too large (>=5MB)');
                parts.push(resOk ? 'Resolution OK (>=600px)' : 'Resolution too small (<600px)');
                status.textContent = parts.join(' — ');
                status.style.color = (sizeOk && resOk) ? 'green' : 'red';
            };
            img.onerror = () => {
                status.textContent = 'Unable to read image';
                status.style.color = 'red';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
    
    const uploadBtn = document.createElement('button');
    uploadBtn.setAttribute('class', 'fbutton');
    uploadBtn.textContent = 'Upload and Extract Timetable';
    go.appendChild(uploadBtn);
    uploadBtn.addEventListener('click', uploadImage);


async function uploadImage() {
  img_input.files[0];
  if (!file) return alert("Please select an image first!");

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/upload_timetable', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  console.log(data);

  if (data.status === "success") {
    alert("Extracted Data:\n" + JSON.stringify(data.data, null, 2));
  } else {
    alert("Error: " + data.error);
  }
}


}