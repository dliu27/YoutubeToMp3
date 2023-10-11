from flask import Flask, request, send_file
from flask_cors import CORS
from pytube import YouTube
import os

print('\nYoutube to Mp3 Format Downloader\n')

app = Flask(__name__)
CORS(app, expose_headers=["Content-Disposition"])

def getYTAudio(URL):
    """
    Downloads the MP3 of URL using pytube and returns the filename.
    Future: LRU for storage management
    """

    yt = YouTube(URL)
    try:
        # filename which is author - title
        FILENAME = f"{yt.vid_info['videoDetails']['author']} - {yt.vid_info['videoDetails']['title']}.mp3"
        
        print(yt.vid_info)
        # if file already exists, return this
        if os.path.exists(FILENAME):
            return FILENAME
        
        YTAUDIO_FILE_PATH = yt.streams.filter(only_audio=True, file_extension='mp4').order_by('abr').desc().first().download(filename=FILENAME)

        print(f"Download Video Completed: {YTAUDIO_FILE_PATH}\n")
        
        return YTAUDIO_FILE_PATH
    
    except Exception as e:
        print(f"Error: {e}")

@app.route('/', methods=['GET'])

def status():
    """
    Status of the Flask app
    """

    return {"success": "Flask app is running"}


@app.route('/download_video', methods=['POST'])
def download_video():
    """
    POST request that downloads the video from the URL in the body and returns the file as a response
    """

    try:
        # Get the YouTube video URL from the body
        video_url = request.json['url']

        # Call the function to download the video
        path = getYTAudio(video_url)
        
        # Get filename
        filename = os.path.basename(path)

        # Send the file as a response
        return send_file(
            path,
            as_attachment=True,
            mimetype='audio/mp3',
            download_name=filename
        )

    except Exception as e:
        return str(e), 400

if __name__ == '__main__':
    app.run(debug=True)
