/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

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
  const model = await blazeface.load();
  let hiddenVideo = document.querySelector('video.hidden');
  hiddenVideo.srcObject = stream;
  let hiddenCanvas = document.querySelector('canvas.hidden');
  let ctx = hiddenCanvas.getContext('2d');
  let rVFC = async () => {
    hiddenCanvas.width = hiddenVideo.videoWidth;
    hiddenCanvas.height = hiddenVideo.videoHeight;
    ctx.drawImage(hiddenVideo, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const predictions = await model.estimateFaces(hiddenVideo);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "green";
    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        const start = predictions[i].topLeft;
        const end = predictions[i].bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];
        // Render a rectangle over each detected face.
        ctx.fillRect(start[0], start[1], size[0], size[1]);
      }
    }

    // ctx.fillRect(parseInt(hiddenCanvas.width / 3), parseInt(hiddenCanvas.height / 3), 50, 50);

    hiddenVideo.requestVideoFrameCallback(rVFC);
  }
  hiddenVideo.requestVideoFrameCallback(rVFC);
  let shownVideo = document.querySelector('video.shown');
  shownVideo.srcObject = hiddenCanvas.captureStream();
  // shownVideo.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
