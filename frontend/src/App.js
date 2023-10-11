import React, { useState } from 'react';
import './App.css';

function App() {
  const [videoURL, setVideoURL] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null);
  const [downloadFilename, setDownloadFilename] = useState(null);

  function extractVideoIdFromURL(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
    const match = url.match(regex);
  
    if (match && match[1]) {
      return match[1];
    }
  
    return null; // Return null if no match is found
  }
  
  const validateYouTubeUrl = (url) => {
    if (url !== undefined || url !== '') {
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
          return true
        }
    }
    return false
  }
  
  const sanitizeFilename = (filename) => {
    // Replace any unwanted characters with underscores
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  };
  
  const getYoutubeMP3FromFlask = async (url) => {
    try {
      const apiUrl = 'http://localhost:5000/download_video';
  
      const requestBody = {
        url: url,
      };
  
      // Make an HTTP POST request to the Flask API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      // Check if the request was successful (status code 200)
      if (response.status === 200) {
        const blob = await response.blob();
        const blobURL = URL.createObjectURL(blob);
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = contentDisposition.split('filename=')[1];

        // sanitize filename https://stackoverflow.com/questions/55341277/chrome-on-windows-adding-trailing-underscores-to-downloaded-files
        filename = filename.replace('"','') // replacing one " charcter
        filename = filename.replace('"','') // replacing second " character
        
        setDownloadLink(blobURL);
        setDownloadFilename(filename);
      } else {
        console.error('Failed to convert YouTube to MP3');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  
  }

  const handleConvertClick = async() => {
    if (validateYouTubeUrl(videoURL) === false) {
      setErrorMsg('Invalid YouTube URL');
      return;
    }
    setIsLoading(true); // Set loading state while converting
    console.log("loading")
    await getYoutubeMP3FromFlask(videoURL);
    console.log("done")
    setIsLoading(false); // Unset loading state after conversion
  };



  return (
    <div className="App">
      <h1>YouTube to MP3 Converter</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter YouTube URL"
          value={videoURL}
          onChange={(e) => setVideoURL(e.target.value)}
        />
        <button className="convert-button" onClick={handleConvertClick}>Convert</button>
        {errorMsg && <p className="error-msg">{errorMsg}</p>}
      </div>
      <div className="download-container">
        {isLoading ? (
          <p>Loading...</p>
        ) : downloadLink && downloadFilename ? (
          <>
            {/* Embed the YouTube video using an iframe */}
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${extractVideoIdFromURL(videoURL)}`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
  
            {/* Centered download button with margin-top and class name */}
            <div className="download-button-container">
              <a href={downloadLink} download={downloadFilename} className="download-button">
                Download MP3
              </a>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
  }

export default App;
