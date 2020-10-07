function timeline(
  {
    containerId,
    framesFolder = "data",
    firstFrameName,
    framesCount = 0,
    fps = 24,
    autoPlay = true,
    loop = false,
    periods = {},
    onFinish
  }) {
  let calculatedFps;
  let multiSource = Array.isArray(framesFolder);
  let currentFrameNumber = 0;
  let isPlaying = false;

  if (Array.isArray(fps)) {
    fps.map(f => {
      if (f.default) {
        calculatedFps = +f.fps;
      }
    })
  } else {
    calculatedFps = fps;
  }

  if (multiSource && !Array.isArray(firstFrameName)) {
    console.warn("firstFrameName must be array")
    return;
  }

  if (multiSource && !Array.isArray(framesCount)) {
    console.warn("framesCount must be array")
    return;
  }

  if (!containerId) {
    console.warn("Please, set containerId");
    return;
  }

  if (!firstFrameName) {
    console.warn("Please, set firstFrameName");
    return;
  }

  if (framesFolder === "data") {
    console.warn("framesFolder set by default to 'data'");
  }

  Array.prototype.arraySum = function (count) {
    return this.slice(0, count).reduce((sum, current) => sum + current, 0);
  };

  const initLayout = (layoutContainer, rangeMax) => {
    const container = document.getElementById(layoutContainer);
    container.classList.add("timelineWrapper");

    // progress bar
    const progressBar = document.createElement("div");
    progressBar.classList.add("progressBar");

    // image
    const image = document.createElement("img");
    if (multiSource)
      image.src = `./${framesFolder[0]}/${firstFrameName[0]}`;
    else
      image.src = `./${framesFolder}/${firstFrameName}`;
    image.classList.add("timelineImage");

    // period title
    const periodTitle = document.createElement("div");
    periodTitle.classList.add("periodTitle");
    periodTitle.innerText = "Please wait, loading...";

    // controls wrapper
    const controlsWrapper = document.createElement("div");
    controlsWrapper.classList.add("controlsWrapper");
    controlsWrapper.classList.add("hidden");

    // play button
    const playButton = document.createElement("button");
    playButton.classList.add("playButton");
    playButton.innerText = "Play";
    controlsWrapper.appendChild(playButton);

    // speed select
    if (Array.isArray(fps)) {
      const speedSelect = document.createElement("select");
      speedSelect.classList.add("speedSelect");
      controlsWrapper.appendChild(speedSelect);

      speedSelect.addEventListener("change", () => {
        playerPause();
        calculatedFps = speedSelect.value;
        playerStart();
      });

      for (let i = 0; i < fps.length; i++) {
        let option = document.createElement("option");
        option.value = fps[i].fps;
        option.text = fps[i].label;
        if (fps[i].default) {
          option.selected = true;
        }
        speedSelect.appendChild(option);
      }
    }

    // range control
    const rangeControl = document.createElement("input");
    rangeControl.classList.add("rangeControl");
    rangeControl.type = "range";
    rangeControl.value = "0";
    rangeControl.min = "0";
    rangeControl.max = String(rangeMax - 1);
    controlsWrapper.appendChild(rangeControl);

    container.appendChild(periodTitle);
    container.appendChild(image);
    container.appendChild(progressBar);
    container.appendChild(controlsWrapper);

    return {image, periodTitle, progressBar, controlsWrapper, rangeControl, playButton};
  };

  const setProgressLoading = (percentage) => {
    progressBar.style.width = percentage + "%";
    periodTitle.innerText = `Please wait, loading... ${Math.ceil(100 - percentage)}%`;

    if (percentage === 0) {
      controlsWrapper.classList.remove("hidden");
      progressBar.remove();
      periodTitle.innerText = periods[0];
      if (autoPlay) playerStart();
    }
  }

  const generateFrameData = (folder = "", file = "", count = 0) => {
    let lastDotIndex;
    let name;
    let ext;
    let data = [];

    if (Array.isArray(folder)) {
      name = [];

      folder.map((fold, index) => {
        lastDotIndex = file[index].lastIndexOf('.');
        const localName = file[index].substr(0, lastDotIndex - 5);
        ext = file[index].substr(lastDotIndex, file[index].length - lastDotIndex);

        name.push(localName);

        for (let i = 0; i < count[index]; i++) {
          data.push(`./${fold}/${localName}.${("000" + i).slice(-4)}${ext}`);
        }
      });
    } else {
      lastDotIndex = file.lastIndexOf('.');
      name = file.substr(0, lastDotIndex - 5);
      ext = file.substr(lastDotIndex, file.length - lastDotIndex);

      for (let i = 0; i < count; i++) {
        data.push(`./${folder}/${name}.${("000" + i).slice(-4)}${ext}`);
      }
    }

    return data;
  }

  const cacheImages = (frameData) => {
    if (!cacheImages.list) {
      cacheImages.list = [];
    }
    let list = cacheImages.list;
    for (let i = 0; i < frameData.length; i++) {
      let img = new Image();
      img.onload = function () {
        let index = list.indexOf(this);
        if (index !== -1) {
          list.splice(index, 1);
        }
        setProgressLoading(100 * list.length / frameData.length);
      }
      list.push(img);
      img.src = frameData[i];
    }
  }

  const setFrame = (frameNumber) => {
    currentFrameNumber = frameNumber;
    rangeControl.value = frameNumber;
    image.src = frameData[frameNumber];
    if (periods[frameNumber])
      periodTitle.innerText = periods[frameNumber];
  }

  const player = () => {
    let interval;

    const tick = () => {
      if (currentFrameNumber < (multiSource ? framesCount.reduce((sum, current) => sum + current, 0) : framesCount) - 1) {
        currentFrameNumber += 1;
        setFrame(currentFrameNumber);
      } else {
        currentFrameNumber = 0;
        if (typeof onFinish === "function") onFinish();
        if (!loop) {
          playButton.innerText = "Play";
          clearInterval(interval);
          isPlaying = false;
        }
      }
    }

    const start = () => {
      isPlaying = true;
      playButton.innerText = "Pause";
      interval = setInterval(() => tick(), 1000 / calculatedFps);
    }

    const pause = () => {
      clearInterval(interval);
      isPlaying = false;
      playButton.innerText = "Play";
    }

    return {start, pause};
  };

  const frameData = generateFrameData(framesFolder, firstFrameName, framesCount);
  const {
    image,
    progressBar,
    periodTitle,
    controlsWrapper,
    playButton,
    rangeControl
  } = initLayout(containerId, multiSource ? framesCount.reduce((sum, current) => sum + current, 0)
    : framesCount);
  const {start: playerStart, pause: playerPause} = player();
  cacheImages(frameData);

  rangeControl.addEventListener("input", function () {
    playerPause();
    setFrame(+this.value);
  })

  rangeControl.addEventListener("change", function () {
    playerPause();
    setFrame(+this.value);
  })

  playButton.addEventListener("click", function () {
    if (isPlaying) {
      playerPause();
    } else {
      playerStart();
    }
  });

  return {playerPause, playerStart};
}
