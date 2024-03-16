const upload = new FileUploadWithPreview.FileUploadWithPreview('my-unique-id');
function convertImages() {
    const files = document.getElementById('image-input').files;
    const format = document.getElementById('format-select').value; // Ensure this selects between 'image/jpeg' and 'image/png'
    const downloadType = document.querySelector('input[name="download-type"]:checked').value;
    const zip = new JSZip();

    if (files.length === 0) {
      alert('Please select one or more images.');
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(blob => {
            if (downloadType === 'zip') {
              const fileName = file.name.replace(/\.[^/.]+$/, "") + (format === 'image/jpeg' ? '.jpg' : '.png');
              zip.file(fileName, blob);
              if (Array.from(files).indexOf(file) === files.length - 1) {
                zip.generateAsync({type: 'blob'}).then(content => {
                  saveAs(content, 'images.zip');
                });
              }
            } else {
              const dataUrl = URL.createObjectURL(blob);
              downloadImage(dataUrl, file.name, format);
            }
          }, format); // Output format specified here
        };
        // Ensure the src is set to the result to load WebP or any supported format
        img.src = e.target.result; 
      };
      reader.readAsDataURL(file); // Reads the file as Data URL, supports WebP if the browser does
    });
  }

  function downloadImage(dataUrl, originalName, format) {
    const a = document.createElement('a');
    a.href = dataUrl;
    const extension = format === 'image/jpeg' ? '.jpg' : '.png';
    a.download = originalName.replace(/\.[^/.]+$/, "") + extension;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
