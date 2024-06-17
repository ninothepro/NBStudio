document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const audioUploadBtn = document.getElementById('audio-upload');
    const playPauseBtn = document.getElementById('play-pause');
    const cutBtn = document.getElementById('cut');
    const copyBtn = document.getElementById('copy');
    const pasteBtn = document.getElementById('paste');
    const deleteBtn = document.getElementById('delete');
    const splitBtn = document.getElementById('split');
    const cropBtn = document.getElementById('crop');
    const exportBtn = document.getElementById('export');
    const voiceOverBtn = document.getElementById('voice-over');
    const timer = document.getElementById('timer');
    const visualizer = document.getElementById('visualizer');
    const fileImportBtn = document.getElementById('file-import');
    const fileExportBtn = document.getElementById('file-export');
    const editCopyBtn = document.getElementById('edit-copy');
    const editPasteBtn = document.getElementById('edit-paste');
    const editUndoBtn = document.getElementById('edit-undo');
    const editCutBtn = document.getElementById('edit-cut');
    const viewZoomInBtn = document.getElementById('view-zoom-in');
    const viewZoomOutBtn = document.getElementById('view-zoom-out');
    const viewDarkModeBtn = document.getElementById('view-dark-mode');
    const viewLightModeBtn = document.getElementById('view-light-mode');
    const effectReverseBtn = document.getElementById('effect-reverse');
    const effectEchoBtn = document.getElementById('effect-echo');
    const effectPitchBtn = document.getElementById('effect-pitch');

    // WaveSurfer instance
    const waveform = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        plugins: [
            WaveSurfer.regions.create()
        ],
        backend: 'MediaElement'
    });

    // State variables
    let isPlaying = false;
    let copiedSegment = null;
    let currentSelection = { start: 0, end: 0 };
    let history = [];

    // Format time function
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Concatenate audio buffers function
    function concatBuffers(buffer, start, end, insert) {
        const part1 = buffer.slice(0, start);
        const part2 = insert || new Float32Array();
        const part3 = buffer.slice(end);
        const newBuffer = new Float32Array(part1.length + part2.length + part3.length);
        newBuffer.set(part1, 0);
        newBuffer.set(part2, part1.length);
        newBuffer.set(part3, part1.length + part2.length);
        return newBuffer;
    }

    // Apply audio effects function
    function applyEffect(effect) {
        const audioContext = waveform.backend.ac;
        const source = audioContext.createBufferSource();
        source.buffer = waveform.backend.buffer;
        let effectNode;

        switch (effect) {
            case 'reverse':
                source.buffer.getChannelData(0).reverse();
                break;
            case 'echo':
                effectNode = audioContext.createDelay();
                effectNode.delayTime.value = 0.2;
                source.connect(effectNode);
                effectNode.connect(audioContext.destination);
                break;
            case 'pitch':
                // Implement pitch effect logic here
                break;
        }

        source.connect(audioContext.destination);
        source.start();
    }

    // Event listeners

    // Upload audio file
    audioUploadBtn.addEventListener('click', function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.onchange = function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    waveform.load(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    });

    // Play/Pause button
    playPauseBtn.addEventListener('click', function () {
        if (isPlaying) {
            waveform.pause();
        } else {
            waveform.play();
        }
        isPlaying = !isPlaying;
    });

    // Cut selected audio segment
    cutBtn.addEventListener('click', function () {
        if (currentSelection.end > currentSelection.start) {
            copiedSegment = waveform.backend.buffer.slice(currentSelection.start, currentSelection.end);
            history.push(waveform.backend.buffer.slice()); // Save current state to history
            waveform.backend.buffer = concatBuffers(waveform.backend.buffer, currentSelection.start, currentSelection.end, null);
            waveform.drawBuffer();
        }
    });

    // Copy selected audio segment
    copyBtn.addEventListener('click', function () {
        if (currentSelection.end > currentSelection.start) {
            copiedSegment = waveform.backend.buffer.slice(currentSelection.start, currentSelection.end);
        }
    });

    // Paste copied audio segment
    pasteBtn.addEventListener('click', function () {
        if (copiedSegment) {
            history.push(waveform.backend.buffer.slice()); // Save current state to history
            waveform.backend.buffer = concatBuffers(waveform.backend.buffer, currentSelection.start, currentSelection.start, copiedSegment);
            waveform.drawBuffer();
        }
    });

    // Delete selected audio segment
    deleteBtn.addEventListener('click', function () {
        if (currentSelection.end > currentSelection.start) {
            history.push(waveform.backend.buffer.slice()); // Save current state to history
            waveform.backend.buffer = concatBuffers(waveform.backend.buffer, currentSelection.start, currentSelection.end, null);
            waveform.drawBuffer();
        }
    });

    // Split audio at selection
    splitBtn.addEventListener('click', function () {
        if (currentSelection.end > currentSelection.start) {
            // Implement split functionality
        }
    });

    // Crop audio to selection
    cropBtn.addEventListener('click', function () {
        if (currentSelection.end > currentSelection.start) {
            history.push(waveform.backend.buffer.slice()); // Save current state to history
            waveform.backend.buffer = waveform.backend.buffer.slice(currentSelection.start, currentSelection.end);
            waveform.drawBuffer();
        }
    });

    // Export edited audio
    exportBtn.addEventListener('click', function () {
        waveform.exportPCM().then(function (pcmData) {
            const blob = new Blob([pcmData], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited_audio.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    });

    // Handle voice-over recording
    voiceOverBtn.addEventListener('click', function () {
        // Implement voice over functionality
    });

    // Update timer with current playback time
    waveform.on('audioprocess', function () {
        const currentTime = waveform.getCurrentTime();
        timer.textContent = formatTime(currentTime);
    });

    // Update current selection on waveform region update
    waveform.on('region-update-end', function (region) {
        currentSelection.start = region.start;
        currentSelection.end = region.end;
    });

    // Enable drag selection on waveform
    waveform.on('ready', function () {
        waveform.enableDragSelection({
            color: 'rgba(0, 255, 0, 0.1)',
        });
    });

    // Visualize audio waveform with frequency data
    function visualize() {
        const canvasCtx = visualizer.getContext('2d');
        const analyser = waveform.backend.ac.createAnalyser();
        waveform.backend.setFilter(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);

            const barWidth = (visualizer.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                canvasCtx.fillRect(x, visualizer.height - barHeight / 2, barWidth, barHeight);
                x += barWidth + 1;
            }
        }

        draw();
    }

    visualize(); // Initialize visualizer

    // Event listeners for additional functionalities

    // Import audio file from external source
    fileImportBtn.addEventListener('click', function () {
        const url = prompt('Enter URL of audio file:');
        if (url) {
            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        waveform.load(event.target.result);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(error => console.error('Error fetching audio file:', error));
        }
    });

    // Export edited audio file to external storage
    fileExportBtn.addEventListener('click', function () {
        waveform.exportPCM().then(function (pcmData) {
            const blob = new Blob([pcmData], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited_audio.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    });

    // Copy selected audio segment
    editCopyBtn.addEventListener('click', function () {
        if (currentSelection.end > currentSelection.start) {
            copiedSegment = waveform.backend.buffer.slice(currentSelection.start, currentSelection.end);
        }
    });

    // Paste copied audio segment
    editPasteBtn.addEventListener('click', function () {
        if (copiedSegment) {
            history.push(waveform.backend.buffer.slice()); // Save current state to history
            waveform.backend.buffer = concatBuffers(waveform.backend.buffer, currentSelection.start, currentSelection.start, copiedSegment);
            waveform.drawBuffer();
        }
    });

    // Undo last action
    editUndoBtn.addEventListener('click', function () {
        if (history.length > 0) {
            waveform.backend.buffer = history.pop();
            waveform.drawBuffer();
        }
    });

    // Cut selected audio segment
    editCutBtn.addEventListener('click', function () {
        if (currentSelection.end > currentSelection.start) {
            copiedSegment = waveform.backend.buffer.slice(currentSelection.start, currentSelection.end);
            history.push(waveform.backend.buffer.slice()); // Save current state to history
            waveform.backend.buffer = concatBuffers(waveform.backend.buffer, currentSelection.start, currentSelection.end, null);
            waveform.drawBuffer();
        }
    });

    // Zoom in on waveform
    viewZoomInBtn.addEventListener('click', function () {
        waveform.zoom(1);
    });

    // Zoom out on waveform
    viewZoomOutBtn.addEventListener('click', function () {
        waveform.zoom(-1);
    });

    // Switch to dark mode
    viewDarkModeBtn.addEventListener('click', function () {
        document.body.classList.add('dark-mode');
    });

    // Switch to light mode
    viewLightModeBtn.addEventListener('click', function () {
        document.body.classList.remove('dark-mode');
    });

    // Apply reverse effect to audio
    effectReverseBtn.addEventListener('click', function () {
        applyEffect('reverse');
    });

    // Apply echo effect to audio
    effectEchoBtn.addEventListener('click', function () {
        applyEffect('echo');
    });

    // Apply pitch effect to audio
    effectPitchBtn.addEventListener('click', function () {
        applyEffect('pitch');
    });
});
