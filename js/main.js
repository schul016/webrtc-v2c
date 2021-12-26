/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// CONSTANTS
const UPDATE_FACE_DETECT_EVERY_N_FRAMES = 20

// Put variables in global scope to make them available to the browser console.
const shownVideo = document.querySelector('video.shown');
const shownCanvas = document.querySelector('canvas.shown');
shownCanvas.width = 480;
shownCanvas.height = 360;

const button = document.querySelector('button');
button.onclick = function () {
  shownCanvas.width = shownVideo.videoWidth;
  shownCanvas.height = shownVideo.videoHeight;
  shownCanvas.getContext('2d').drawImage(shownVideo, 0, 0, shownCanvas.width, shownCanvas.height);
};

const constraints = {
  audio: false,
  video: true
};

async function handleSuccess(stream) {
  let hiddenVideo = document.querySelector('video.hidden');
  hiddenVideo.srcObject = stream;
  let canvasVideo = document.querySelector('canvas.hidden');
  let ctx = canvasVideo.getContext('2d');
  let counter = 0;
  const model = await blazeface.load();
  let predictions = null;
  const rVFC = async () => {
    // console.log("counter: ", counter);
    canvasVideo.width = hiddenVideo.videoWidth;
    canvasVideo.height = hiddenVideo.videoHeight;
    ctx.drawImage(hiddenVideo, 0, 0, canvasVideo.width, canvasVideo.height);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "green";
    // test rectangle
    // ctx.fillRect(parseInt(canvasVideo.width / 3), parseInt(canvasVideo.height / 3), 50, 50);
    if (predictions && predictions.length) {
      for (let i = 0; i < predictions.length; i++) {
        const start = predictions[i].topLeft;
        const end = predictions[i].bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];
        // Render a rectangle over each detected face.
        ctx.fillRect(start[0], start[1], size[0], size[1]);
      }
    }
    if (counter % UPDATE_FACE_DETECT_EVERY_N_FRAMES == 0) {
      counter = 1
      predictions = await model.estimateFaces(hiddenVideo);
    }
    counter++;
    hiddenVideo.requestVideoFrameCallback(rVFC);
  }
  hiddenVideo.requestVideoFrameCallback(rVFC);

  let shownVideo = document.querySelector('video.shown');
  shownVideo.srcObject = canvasVideo.captureStream();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

navigator.mediaDevices
  .getUserMedia(constraints)
  .then(handleSuccess)
  .catch(handleError);