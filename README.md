<div align = center>
<img src="https://github.com/user-attachments/assets/4d20ae48-add8-48d6-a947-32f387122aa3" alt="Rizzed penguin" style="width: 20%;">

# Kitty Dashboard Panel
</div>

A system panel for Kitty terminal that displays real-time system metrics using terminal-based utilities.
                                               
![](https://github.com/user-attachments/assets/b534600f-8198-4a2e-a88a-f9e1bce06f35)
## Features
- Launches `btop` for system monitoring
- Displays real-time audio visualization with `cava`
- Shows system info (bluetooth, volume, brightness, wifi, location, microphone, screenshare, time, calender, weather)
- Uses kitty remote control to automate the entire setup.

## Prerequisites
Ensure you have the following installed:
- [Kitty terminal](https://sw.kovidgoyal.net/kitty/)
- `btop` (for system monitoring)
- `cava` (for audio visualization)
- `brightnessctl` (for brightness control)
- `pactl` (PulseAudio control)
- `iwconfig` (for network info, part of `wireless-tools`)
- `yay` (AUR package manager for Arch-based systems)
- `bluetoothctl` (bluetooth management)
- `curl` (for weather)
- `upower` (for power management)
- `pw-dump` (pipewire for screenshare and microphone state monitoring)
- `js` ([script interpreter](https://github.com/5hubham5ingh/js-util))

For more information about the Kitty Config, refer to the [Kitty Configuration Docs](https://sw.kovidgoyal.net/kitty/conf).
## Installation
Clone the repository and make the script executable:
```sh
git clone --depth 1 https://github.com/5hubham5ingh/kitty-panel
cd kitty-panel
chmod +x kittyPanal.js
```

## Usage
Run the script to launch the dashboard:

```sh
kitty -1 -o allow_remote_control=yes -o window_margin_width=0 --hold -o background_opacity=0.8 -o window_border_width=0 ./kittyPanal.js
```

This will:
1. Set the font size.
2. Split the Kitty window and launch `btop`.
3. Further split and launch `cava`.
4. Display real-time system info in another pane.


### Hyprland setup
Set a special workplace to launch the dashboard on keypress or startup-
```text
exec-once = hyprctl dispatch togglespecialworkspace dashboard
$dashboard = kitty -1 -o allow_remote_control=yes -o window_margin_width=0 --hold -o background_opacity=0.8 -o window_border_width=0 "/PATH/TO/kittyPanal.js"
bindd = $mainMod, d, Toggle dashboard workspace, togglespecialworkspace, dashboard
```

## Customization
Modify `kittyPanel.js` to:
- Change the font size
- Adjust window layout and sizes
- Add or replace utilities
- Change style and colors.
