const FFT_SIZE = 1024;
const SAMPLE_MIDPOINT = 128;
const LEVEL_GAIN = 4;
const MAX_LEVEL = 1;

export type Recording = {
  stop(): Promise<Blob>;
  cancel(): void;
};

function levelOf(samples: Uint8Array) {
  let sumOfSquares = 0;
  for (const sample of samples) {
    const amplitude = (sample - SAMPLE_MIDPOINT) / SAMPLE_MIDPOINT;
    sumOfSquares += amplitude * amplitude;
  }
  const rootMeanSquare = Math.sqrt(sumOfSquares / samples.length);
  return Math.min(MAX_LEVEL, rootMeanSquare * LEVEL_GAIN);
}

export async function startRecording(
  onLevel: (level: number) => void,
): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.addEventListener("dataavailable", (event) =>
    chunks.push(event.data),
  );

  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = FFT_SIZE;
  audioContext.createMediaStreamSource(stream).connect(analyser);
  const samples = new Uint8Array(analyser.fftSize);

  let frame = requestAnimationFrame(function measureLevel() {
    analyser.getByteTimeDomainData(samples);
    onLevel(levelOf(samples));
    frame = requestAnimationFrame(measureLevel);
  });
  recorder.start();

  function release() {
    cancelAnimationFrame(frame);
    for (const track of stream.getTracks()) track.stop();
    audioContext.close();
  }

  return {
    stop() {
      return new Promise((resolve) => {
        recorder.addEventListener(
          "stop",
          () => {
            release();
            resolve(new Blob(chunks, { type: recorder.mimeType }));
          },
          { once: true },
        );
        recorder.stop();
      });
    },
    cancel() {
      recorder.stop();
      release();
    },
  };
}
