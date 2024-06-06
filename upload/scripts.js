document.getElementById('upload-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const music = document.getElementById('music').files[0];
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const tags = document.getElementById('tags').value;
    const description = document.getElementById('description').value;
    const artwork = document.getElementById('artwork').files[0];
    const userId = sessionStorage.getItem('currentuser_id');

    const formData = new FormData();
    formData.append('music', music);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('tags', tags);
    formData.append('description', description);
    formData.append('artwork', artwork);
    formData.append('userId', userId);

    try {
        const response = await fetch('http://localhost:8000/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Upload successful');
        } else {
            const errorData = await response.json();
            alert(`Upload failed: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        alert('An error occurred while uploading');
    }
});
