document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.getElementsByClassName("processButton");
  const timelineContainer = document.getElementById("timeline");

  const seqCount = {
    "INT3D-11": 398,
    "INT3D-12": 150,
    "INT3D-13": 120,
    "INT3D-14": 125,
    "INT3D-15": 155,
  };

  const getSettings = (id) => ({
    framesFolder: `media/${id}`,
    framesCount: seqCount[id],
    firstFrameName: `${id}.0000.jpg`,
    containerId: "timeline",
    periods: [""],
    fps: [
      {label: "Slow", fps: 7},
      {label: "Normal", fps: 15, default: true},
      {label: "Fast", fps: 30},
    ],
  });

  const clearTimeline = () => {
    timelineContainer.innerHTML = "";
    const activeButton = document.querySelector("button.active");
    if (activeButton) activeButton.classList.remove("active");
  };

  const showVideo = (button) => {
    clearTimeline();
    timeline(getSettings(button.getAttribute("data-process")));
    button.classList.add("active");
  };

  // run initial video
  showVideo(document.querySelector("button[data-process='INT3D-11']"));

  for (let button of buttons) {
    button.addEventListener("click", () => {
      showVideo(button);
    });
  }

  const fullCycle = document.querySelector(".fullCycle")

  fullCycle.addEventListener("click", (e) => {
    clearTimeline();
    timeline({
      framesFolder: ["media/INT3D-11", "media/INT3D-12", "media/INT3D-13", "media/INT3D-14", "media/INT3D-15"],
      framesCount: [397, 150, 119, 124, 155],
      firstFrameName: ["INT3D-11.0000.jpg", "INT3D-12.0000.jpg", "INT3D-13.0000.jpg", "INT3D-14.0000.jpg", "INT3D-15.0000.jpg"],
      containerId: "timeline",
      periods: [""],
      fps: [
        {label: "Slow", fps: 7},
        {label: "Normal", fps: 15, default: true},
        {label: "Fast", fps: 30},
      ],
    });
    fullCycle.classList.add("active");
  });


  //////////////////////////////////////////////
  const black = document.getElementById("blackSwitcher");
  const pad = document.querySelector(".pad");
  black.addEventListener("change", () => {
    if (black.checked)
      pad.classList.add("black");
    else
      pad.classList.remove("black");
  });
});

