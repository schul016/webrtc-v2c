/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

"use strict"

const UPDATE_FACE_DETECT_EVERY_N_FRAMES = 30
let counter = window.counter = 0

// Put variables in global scope to make them available to the browser console.
const video = document.querySelector("video")
const canvas = window.canvas = document.querySelector("canvas")
canvas.width = 480
canvas.height = 360
const ctx = window.cctx = canvas.getContext("2d")

video.addEventListener("loadeddata", async () => {
    console.log("loadeddata")
    const model = window.model = await blazeface.load()
    let predictions = window.predictions = null
    requestAnimationFrame(canvasDraw)
    // video.requestVideoFrameCallback(canvasDraw)
})

const canvasDraw = async () => {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    if (counter % UPDATE_FACE_DETECT_EVERY_N_FRAMES == 0) {
        counter = 1
        predictions = await model.estimateFaces(video)
    }
    ctx.globalAlpha = 0.4
    ctx.fillStyle = "green"
    if (predictions && predictions.length) {
        for (let i = 0; i < predictions.length; i++) {
            const start = predictions[i].topLeft
            const end = predictions[i].bottomRight
            const size = [end[0] - start[0], end[1] - start[1]]
            // Render a rectangle over each detected face.
            ctx.fillRect(start[0], start[1], size[0], size[1])
        }
    }
    counter++
    requestAnimationFrame(canvasDraw)
    // video.requestVideoFrameCallback(canvasDraw)
}

const button = document.querySelector("button")
button.onclick = function () {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height)
}

const constraints = {
    audio: false,
    video: true
}

async function handleSuccess(stream) {
    window.stream = stream // make stream available to browser console
    video.srcObject = stream
}

function handleError(error) {
    console.log("navigator.MediaDevices.getUserMedia error: ", error.message, error.name)
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError)