document.addEventListener('DOMContentLoaded', function () {
    const audioUpload = document.getElementById('audio-upload');
    const playPauseBtn = document.getElementById('play-pause');
    const cutBtn = document.getElementById('cut');
    const copyBtn = document.getElementById('copy');
    const pasteBtn = document.getElementById('paste');
    const deleteBtn = document.getElementById('delete');
    const exportBtn = document.getElementById('export');
    const voiceOverBtn = document.getElementById('voice-over');

    const waveform1 = WaveSurfer.create({
        container: '#waveform-layer-1',
        waveColor: 'violet',
        progressColor: 'purple'
    });

    const waveform2 = WaveSurfer.create({
        container: '#waveform-layer-2',
        waveColor: 'violet',
        progressColor: 'purple'
    });

    let isPlaying = false;
    let copiedSegment = null;

    audioUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                waveform1.load(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    playPauseBtn.addEventListener('click', function () {
        if (isPlaying) {
            waveform1.pause();
            waveform2.pause();
        } else {
            waveform1.play();
            waveform2.play();
        }
        isPlaying = !isPlaying;
    });

    cutBtn.addEventListener('click', function () {
        // Implement cut functionality
    });

    copyBtn.addEventListener('click', function () {
        // Implement copy functionality
    });

    pasteBtn.addEventListener('click', function () {
        // Implement paste functionality
    });

    deleteBtn.addEventListener('click', function () {
        // Implement delete functionality
    });

    exportBtn.addEventListener('click', function () {
        waveform1.exportPCM().then(function (pcmData) {
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

    voiceOverBtn.addEventListener('click', function () {
        // Implement voice over functionality
    });
});
