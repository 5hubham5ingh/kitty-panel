#!/usr/bin/js

const IS_BAR = scriptArgs.includes("--bar");
if (!IS_BAR) {
  [
    "kitty @ set-font-size 11",
    "kitty @ launch --type=window --location=hsplit --no-response=yes btop -p 1",
    "kitty @ resize-window -a vertical -i 13",
    "kitty @ launch --type=window --location=vsplit --no-response=yes btop -p 2",
    "kitty @ launch --type=window --location=hsplit --no-response=yes cava",
    "kitty @ resize-window -a vertical -i -15",
    "kitty @ focus-window",
  ].forEach((cmd) => os.exec(cmd.split(" ")));
}

const pendingState = "∙∙∙";

const state = {
  colors: ["#ffffff", "#ffffff", "#ffffff"],
  colorCache: undefined,
  time: pendingState,
  calender: pendingState,
  volume: pendingState,
  brightness: pendingState,
  wifi: pendingState,
  weather: pendingState,
  bluetooth: pendingState,
  battery: pendingState,
  microphone: pendingState,
  camera: pendingState,
  location: pendingState,
  screenShare: pendingState,
  workspace: pendingState,
  iconSize: 25,
};

os.ttySetRaw();
std.out.puts(terminal.cursorHide + terminal.cursorTo(0, 0));
os.signal(os.SIGINT, () => {
  print(terminal.cursorShow);
  std.exit(0);
});

main().catch(print);

async function main() {
  updateWeather();
  updateCalender();
  updateBattery();
  updateScreenShareAndMicrophoneState();
  updateLocationState();
  updateCameraState();
  while (true) {
    if (IS_BAR) renderUiForBar();
    else renderUiForPanel();

    await Promise.all([
      updateColors(),
      updateWifiState(),
      updateVolumeState(),
      updateBrightnessState(),
      updateBluetooth(),
      updateWorkspace(),
    ]);

    await os.sleepAsync(1..seconds);
  }
}

//----------------- Helpers ----------------

function renderUiForBar() {
  const s = "◖".style(state.colors[0]);
  const e = "◗".style(state.colors[0]);

  const formatDetail = (
    symbol,
    detail,
  ) =>
    detail
      ? (s +
        `${symbol ? symbol + " ♦ " : ""}${detail ?? "None"}`.style([
          `bg-${state.colors[0]}`,
          "#000000",
          "bold",
        ]) + e +
        " ")
      : "";

  const now = new Date();
  const ui = (
    formatDetail(undefined, state.workspace) +
    formatDetail(undefined, now.toTimeString().split(" ")[0]) +
    formatDetail(undefined, now.toDateString()) +
    formatDetail("Battery", state.battery) +
    formatDetail("Bluetooth", state.bluetooth) +
    formatDetail("Brightness", state.brightness) +
    formatDetail("Camera", state.camera) +
    formatDetail("Location", state.location) +
    formatDetail("Microphone", state.microphone) +
    formatDetail("Sound", state.volume) +
    formatDetail("Screenshare", state.screenShare) +
    formatDetail("Wifi", state.wifi)
  ).align("center", 205) +
    terminal.cursorTo(0, 0);
  std.out.puts(ui);
  std.out.flush();
}

function renderUiForPanel() {
  updateTime();
  // Rerender logo only when the chromatic configuration has mutated
  if (JSON.stringify(state.colors) !== JSON.stringify(state.colorCache)) {
    renderLogo();
    state.colorCache = state.colors;
  } else {
    std.out.puts(terminal.cursorTo(0, 0));
  }

  // ---------- Stylistic Constructs (Styling + Bordering) ----------

  const c0 = state.colors[0];
  const c1 = state.colors[1];
  const c2 = state.colors[2];

  const volBox = `Volume: ${state.volume}`.style(c1).border("rounded", c1);
  const screenBox = `Screen: ${state.screenShare ?? "None"}`
    .style(c1).border("rounded", c1);

  const btBox = `Bluetooth: ${state.bluetooth}`.style(c2)
    .border("rounded", c2);
  const locBox = `Location: ${state.location ?? "None"}`
    .style(c2).border("rounded", c2);

  const wifiBox = `Wifi: ${state.wifi}`.style(c0).border("rounded", c0);
  const brightBox = `Brightness: ${state.brightness}`.style(c0)
    .border("rounded", c0);
  const battBox = `Battery: ${state.battery}`.style(c0)
    .border("rounded", c0);
  const camBox = `Camera: ${state.camera ?? "None"}`.style(c0)
    .border("rounded", c0);
  const micBox = `Microphone: ${state.microphone}`.style(c0).border(
    "rounded",
    c0,
  );

  const weatherBox = state.weather.border("rounded");
  const calendarBox = state.calender.style(c1).border("rounded", c1);
  const timeBox = state.time.style(c0).border("rounded", c0, 3, 0);

  // ---------- Structural Composition (Join + Stack) ----------

  const volumeAndBluetooth = "\n" +
    volBox.join(screenBox)
      .stack(btBox.join(locBox), "right");

  const volumeBluetoothAndWeather = volumeAndBluetooth.join(weatherBox);

  const wifiBrightnessAndBattery = wifiBox.join(brightBox).join(battBox).join(
    camBox,
  ).join(micBox);

  const infoCollection = volumeBluetoothAndWeather
    .stack(wifiBrightnessAndBattery, "right")
    .join(calendarBox);

  std.out.puts(
    infoCollection
      .join(timeBox)
      .align("right"),
  );
  std.out.flush();
}

async function updateCalender() {
  while (true) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = MONTHS[month];

    const first = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const title = `${monthName} ${year}`;
    const pad = Math.floor((20 - title.length) / 2);

    let out = " ".repeat(Math.max(0, pad)) + title + "\n";
    out += "Su Mo Tu We Th Fr Sa\n";
    out += "   ".repeat(first);

    const day = now.getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      if (d == day) {
        out += String(d).padStart(2, " ").style(["bg-grey", "#000000"]) + " ";
      } else {
        out += String(d).padStart(2, " ") + " ";
      }
      if ((first + d) % 7 === 0) out += "\n";
    }

    const lines = out.lines();
    if (lines.length < 10) {
      lines.splice(
        1,
        0,
        "─".repeat(Math.max(...lines.map((l) => l.stripStyle().length))),
      );
    }
    state.calender = lines.map((l) => l.trimEnd()).join("\n");
    await os.sleepAsync(1..hours);
  }
}

async function updateWeather() {
  while (true) {
    const value = await execAsync(`curl -s -H "Accept: text/*" wttr.in/${""}`);
    const currentWeather = value.lines().map((line) => line.trim()).slice(2, 7)
      .join("\n");
    state.weather = currentWeather;
    await os.sleepAsync(4..hours);
  }
}

function updateTime() {
  const date = new Date();
  const currentTime = date.getHours().toString().padStart(2, "0") +
    ":" + date.getMinutes().toString().padStart(2, "0") +
    ":" + date.getSeconds().toString().padStart(2, "0");
  state.time = "\n" + draw.blockDigits(currentTime).stack(
    "\n" + date.toDateString(),
    "center",
  );
}

function updateColors() {
  return execAsync("kitty @ get-colors").then((result) =>
    result.lines().filter((line) =>
      line.startsWith("cursor ") || line.startsWith("color1 ") ||
      line.startsWith("active_tab_background ")
    )
      .map((line) => line.split(/\s+/)?.[1])
      .pipe((colors) => state.colors = colors)
  );
}

function updateWifiState() {
  return execAsync("iwconfig wlan0").then((val) => {
    const match = val.match(/ESSID:"([^\"]+)"/);
    state.wifi = match ? match[1] : "N/A";
  });
}

function updateVolumeState() {
  return execAsync("pactl get-sink-volume @DEFAULT_SINK@").then((val) => {
    const match = val.match(/(\d+)%/);
    state.volume = match ? match[0] : "N/A";
  });
}

function updateBrightnessState() {
  return Promise.all([
    execAsync("brightnessctl g"),
    execAsync("brightnessctl max"),
  ])
    .then(([currentBrightness, maxBrightness]) => {
      const percentage = Math.floor((currentBrightness * 100) / maxBrightness);
      state.brightness = percentage;
    });
}

function updateBluetooth() {
  return execAsync("systemctl status bluetooth").then((stat) =>
    stat.lines().filter((l) => l.trim().startsWith("Active:")).find((line) =>
      line.includes("running")
    )
  )
    .then((service) => {
      if (!service) {
        state.bluetooth = "Disabled";
        return;
      }
      return execAsync("bluetoothctl show")
        .then((showOutput) => {
          const isBtOn = showOutput.split("\n").some((line) =>
            line.trim() === "Powered: yes"
          );

          if (!isBtOn) {
            return state.bluetooth = "Off";
          }

          return execAsync("bluetoothctl devices Connected")
            .then((device) => {
              const deviceName = device?.trim().words().slice(2).join(" ");
              state.bluetooth = deviceName.length ? deviceName : "Disconnected";
            });
        })
        .catch(() => {
          state.bluetooth = "Error";
        });
    }).catch((_) => state.bluetooth = "Disabled");
}

async function updateBattery() {
  while (true) {
    await execAsync("upower -i /org/freedesktop/UPower/devices/DisplayDevice")
      .then((batStat) => {
        const capacity = batStat.words().find((word) => word.includes("%"));
        state.battery = capacity;
        if (parseInt(capacity) < 20) {
          return execAsync(`notify-send -u critical "Battery low"`);
        }
      });
    await os.sleepAsync(5..seconds);
  }
}

async function updateCameraState() {
  while (true) {
    const devices = os.readdir("/dev")[0].filter((d) => d.startsWith("video"))
      .map((d) => `/dev/${d}`);
    const usedPids = new Set();

    for (const dev of devices) {
      const pids = await execAsync(`fuser "${dev}"`).catch((_) => {});
      if (pids) {
        pids.split(/\s+/).forEach((pid) => pid && usedPids.add(pid.trim()));
      }
    }

    if (usedPids.size === 0) {
      state.camera = undefined;
      await os.sleepAsync(5..seconds);
      continue;
    }

    const apps = await Promise.all(
      Array.from(usedPids)
        .map(async (pid) => {
          const name = read(`/proc/${pid}/comm`) ||
            await execAsync(`ps -p ${pid} -o comm=`);
          return name || "unknown";
        })
        .filter(Boolean),
    );

    state.camera = [...new Set(apps)].join(" | ") || "Error";

    await os.sleepAsync(5..seconds);
  }
}

async function updateLocationState() {
  while (true) {
    const pids =
      (await execAsync("pgrep -x geoclue").catch((_) => {}))?.split("\n")
        .filter(Boolean) || [];

    if (pids.length === 0) {
      state.location = undefined;
      await os.sleepAsync(5..seconds);
      continue;
    }

    const apps = pids
      .map((pid) => read(`/proc/${pid}/comm`) || "geoclue")
      .filter(Boolean);

    state.location = [...new Set(apps)].join(" | ") || "Error";
    await os.sleepAsync(5..seconds);
  }
}

async function updateScreenShareAndMicrophoneState() {
  while (true) {
    // Screen share
    const pw = (await execAsync("pw-dump"))?.parseJson();
    if (!pw) log.fatal("'pw-dump' returned nothing");

    const sharingNodes = pw.filter((node) => {
      if (node.type !== "PipeWire:Interface:Node") return false;
      const props = node.info?.props || {};
      const mediaName = props["media.name"] || "";
      const mediaClass = props["media.class"] || "";

      return (
        (mediaClass === "Stream/Input/Video" ||
          mediaClass === "Video/Source") &&
        (node.info.state === "running" || node.state === "running") &&
        (
          mediaName.includes("xdph-streaming") ||
          mediaName.includes("portal") ||
          mediaName === "gsr-default_output" ||
          mediaName.includes("game capture") ||
          mediaName.includes("OBS") ||
          mediaName.includes("Screen") ||
          mediaName.includes("Capture")
        )
      );
    });

    if (sharingNodes.length === 0) {
      state.screenShare = undefined;
    } else {
      const apps = sharingNodes
        .map((n) =>
          n.info.props["media.name"] || n.info.props["application.name"] ||
          "Screen Share"
        )
        .filter(Boolean);

      state.screenShare = [...new Set(apps)].join(" | ") || "Error";
    }

    // Microphone
    const inputStreams = pw
      .filter((node) =>
        node.type === "PipeWire:Interface:Node" &&
        node.info?.props?.["media.class"] === "Stream/Input/Audio" &&
        (node.info.state === "running" || node.state === "running")
      )
      .map((node) =>
        node.info.props["node.name"] || node.info.props["application.name"] ||
        "unknown"
      )
      .filter(Boolean);

    const hasVirtualSource = pw.some((node) =>
      node.type === "PipeWire:Interface:Node" &&
      (node.info?.props?.["media.class"] === "Audio/Source" ||
        node.info?.props?.["media.class"] === "Audio/Source/Virtual") &&
      (node.info.state === "running" || node.state === "running")
    );

    const active = (inputStreams.length > 0 || hasVirtualSource) ? 1 : 0;
    state.microphone = [...new Set(inputStreams)].join(" | ") ||
      (active ? "system" : "None");
    await os.sleepAsync(5..seconds);
  }
}

function updateWorkspace() {
  return Promise.all([
    execAsync(["hyprctl", "workspaces", "-j"]),
    execAsync(["hyprctl", "monitors", "-j"]),
  ]).then(([hyprSpcaes, monitors]) => {
    const activeWorkspaceIds = [];
    JSON.parse(monitors).find((monitor) => {
      activeWorkspaceIds.push(monitor.activeWorkspace.id);
    });
    state.workspace = JSON.parse(hyprSpcaes).filter((ws) =>
      !ws.name.includes("special")
    ).map((wr) => {
      if (activeWorkspaceIds.includes(wr.id)) return "●";
      return "♦";
    }).join(" ");
  }).catch((_) => state.workspace = undefined);
}

function renderLogo() {
  color = state.colors[0];

  const ss =
    `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="100%" viewBox="0 0 452 452" enable-background="new 0 0 452 452" xml:space="preserve">

<path fill="${color}" opacity="1.000000" stroke="none" 
	d="
M330.121460,254.796204 
	C307.491425,254.151566 285.343414,253.567734 263.202637,252.780243 
	C261.113892,252.705948 258.054535,251.967896 257.161591,250.496658 
	C246.766235,233.368851 236.700653,216.040909 225.991516,197.819443 
	C268.282654,199.028076 309.596222,200.208755 351.912506,201.418091 
	C348.604645,195.474121 345.201965,190.242630 342.684265,184.615219 
	C339.442139,177.368622 334.319427,175.659653 326.619263,175.584732 
	C259.979553,174.936234 193.343765,173.858856 126.708397,172.808517 
	C103.722488,172.446213 80.740845,171.809006 57.757973,171.267166 
	C55.830860,171.221725 53.909184,170.945618 51.244442,170.711655 
	C57.073185,160.339035 62.512863,150.524612 68.077393,140.781494 
	C84.737709,111.610451 101.640038,82.575005 117.997269,53.235386 
	C121.946938,46.150951 126.409836,43.749088 134.736420,43.798351 
	C198.377808,44.174915 262.023315,43.922436 325.666962,43.697712 
	C329.990326,43.682449 332.403778,44.759457 334.613983,48.752537 
	C342.978516,63.864262 351.880310,78.678177 360.537018,93.629021 
	C362.017578,96.186073 363.282776,98.867828 365.231750,102.615456 
	C291.460541,101.337242 218.649048,100.075661 145.641327,98.810677 
	C143.132523,105.454651 140.708511,111.874130 137.766190,119.666199 
	C155.734665,119.666199 172.513184,119.579773 189.290573,119.681694 
	C250.436996,120.053139 311.583008,120.499924 372.729492,120.857697 
	C375.492310,120.873856 377.069214,121.695030 378.551788,124.256081 
	C396.702454,155.610016 414.873474,186.954926 433.442749,218.061279 
	C436.905090,223.861252 437.728790,228.446869 433.859192,234.255417 
	C429.447296,240.877991 425.970520,248.117645 421.761047,254.886169 
	C420.967957,256.161346 418.628052,257.181183 417.029388,257.143829 
	C388.218872,256.470459 359.412628,255.616364 330.121460,254.796204 
z"/>
<path fill="${color}" opacity="1.000000" stroke="none" 
	d="
M213.967560,222.069977 
	C219.796127,232.070572 225.624695,242.071167 232.033966,253.068085 
	C189.827209,251.972061 148.543549,250.899994 106.643951,249.811935 
	C111.193527,258.184906 115.303772,266.066101 119.826202,273.703186 
	C120.446800,274.751160 123.111519,274.905640 124.839104,274.935364 
	C191.815994,276.086823 258.794159,277.163544 325.771667,278.278442 
	C352.752289,278.727509 379.731842,279.242157 407.581818,279.742615 
	C403.596283,286.707764 399.941895,293.079010 396.301697,299.458405 
	C377.263855,332.822205 358.090271,366.110107 339.332153,399.630493 
	C336.232147,405.170166 332.788025,407.073486 326.508423,407.056488 
	C262.023163,406.882111 197.536728,406.959045 133.051605,407.212921 
	C127.802299,407.233582 125.269150,405.464844 122.796722,400.965210 
	C114.078995,385.099579 104.790604,369.547729 95.743294,353.862640 
	C94.942474,352.474335 94.320473,350.982819 93.384399,349.066223 
	C103.136482,349.066223 112.201294,348.956238 121.262604,349.087860 
	C143.914246,349.416840 166.564285,349.855652 189.214966,350.250031 
	C228.700378,350.937500 268.186340,351.596252 307.670227,352.362976 
	C311.055328,352.428680 313.043304,351.801575 314.105225,348.063812 
	C315.628784,342.701141 318.014557,337.583466 320.311218,331.639282 
	C311.785217,331.639282 303.844177,331.691803 295.903961,331.631073 
	C226.415115,331.099731 156.926697,330.497498 87.437065,330.115234 
	C82.751862,330.089447 80.226738,328.427582 77.989120,324.546997 
	C59.731121,292.883087 41.355331,261.286682 22.873739,229.752747 
	C20.947845,226.466721 20.821711,223.932388 22.796799,220.623901 
	C27.391272,212.927628 31.654354,205.028748 35.883427,197.121948 
	C37.199501,194.661377 38.562416,193.669647 41.631851,193.766983 
	C91.922882,195.362122 142.219879,196.768768 192.515640,198.214798 
	C196.449234,198.327896 200.733276,197.663651 202.667603,203.337402 
	C206.647781,209.958710 210.307663,216.014343 213.967560,222.069977 
z"/>
</svg>
`;
  exec(
    `kitty +kitten icat --align=center --place ${state.iconSize}x${state.iconSize}@0x0 --scale --clear >>/dev/tty`,
    {
      input: ss,
      useShell: true,
    },
  );
}
