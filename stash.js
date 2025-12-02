
#!/usr/bin / js

// 1. Microphone via PipeWire
function detectMic() {
  const dumpJson = exec("pw-dump");
  if (!dumpJson) return { active: 0, apps: "" };

  let pw;
  try { pw = JSON.parse(dumpJson); } catch { return { active: 0, apps: "" }; }

  const inputStreams = pw
    .filter(node =>
      node.type === "PipeWire:Interface:Node" &&
      node.info?.props?.["media.class"] === "Stream/Input/Audio" &&
      (node.info.state === "running" || node.state === "running")
    )
    .map(node => node.info.props["node.name"] || node.info.props["application.name"] || "unknown")
    .filter(Boolean);

  const hasVirtualSource = pw.some(node =>
    node.type === "PipeWire:Interface:Node" &&
    (node.info?.props?.["media.class"] === "Audio/Source" ||
      node.info?.props?.["media.class"] === "Audio/Source/Virtual") &&
    (node.info.state === "running" || node.state === "running")
  );

  const active = (inputStreams.length > 0 || hasVirtualSource) ? 1 : 0;
  return [...new Set(inputStreams)].join(" | ") || (active ? "system" : "");

}

// 2. Camera via /dev/video* in use
function detectCamera() {
  const devices = os.readdir("/dev")[0].filter(d => d.startsWith('video')).map(d => `/dev/${d}`)
  const usedPids = new Set()

  for (const dev of devices) {
    try {
      const pids = exec(`fuser "${dev}"`);
      if (pids) {
        pids.split(/\s+/).forEach(pid => pid && usedPids.add(pid.trim()));
      }
    } catch { }
  }

  if (usedPids.size === 0) return

  const apps = Array.from(usedPids)
    .map(pid => {
      const name = read(`/proc/${pid}/comm`) ||
        exec(`ps -p ${pid} -o comm=`);
      return name || "unknown";
    })
    .filter(Boolean);

  return [...new Set(apps)].join(" | ")
}

// 3. Location via GeoClue
function detectLocation() {
  const pids = exec("pgrep -x geoclue")?.split("\n").filter(Boolean) || [];
  if (pids.length === 0) return { active: 0, apps: "" };

  const apps = pids
    .map(pid => read(`/proc/${pid}/comm`) || "geoclue")
    .filter(Boolean);

  return [...new Set(apps)].join(" | ")
}

// 4. Screen sharing via PipeWire (portal or gamescope/obs)
function detectScreenSharing() {
  const pw = exec("pw-dump")?.parseJson();
  if (!pw) log.fatal("'pw-dump' returned nothing")


  const sharingNodes = pw.filter(node => {
    if (node.type !== "PipeWire:Interface:Node") return false;
    const props = node.info?.props || {};
    const mediaName = props["media.name"] || "";
    const mediaClass = props["media.class"] || "";

    return (
      (mediaClass === "Stream/Input/Video" || mediaClass === "Video/Source") &&
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

  if (sharingNodes.length === 0) return;

  const apps = sharingNodes
    .map(n => n.info.props["media.name"] || n.info.props["application.name"] || "Screen Share")
    .filter(Boolean);

  return [...new Set(apps)].join(" | ")
}

// Main detection
const mic = detectMic();
const cam = detectCamera();
const loc = detectLocation();
const scr = detectScreenSharing();

print({ mic, cam, loc, scr })
