<div align = center>
<img src="https://github.com/user-attachments/assets/4d20ae48-add8-48d6-a947-32f387122aa3" alt="Rizzed penguin" style="width: 20%;">

# Kitty Dashboard Panel
</div>

A system panel for Kitty terminal that displays real-time system metrics using terminal-based utilities.
                                               
![](https://github.com/user-attachments/assets/b534600f-8198-4a2e-a88a-f9e1bce06f35)
## Features
- Launches `btop` for system monitoring
- Displays real-time audio visualization with `cava`
- Shows system info (package count, volume, brightness, network SSID)
- Uses `kitty @` commands to create a split-window layout

## Prerequisites
Ensure you have the following installed:
- [Kitty terminal](https://sw.kovidgoyal.net/kitty/)
- `btop` (for system monitoring)
- `cava` (for audio visualization)
- `brightnessctl` (for brightness control)
- `pactl` (PulseAudio control)
- `iwconfig` (for network info, part of `wireless-tools`)
- `yay` (AUR package manager for Arch-based systems)

## Installation
Clone the repository and make the script executable:
```sh
git clone https://github.com/5hubham5ingh/kitty-panel
cd kitty-panel
chmod +x dashboard.sh
```

## Usage
Run the script to launch the panel:
```sh
./dashboard.sh
```
This will:
1. Set the font size.
2. Split the Kitty window and launch `btop`.
3. Further split and launch `cava`.
4. Display real-time system info in another pane.

## Customization
Modify `dashboard.sh` to:
- Change the font size
- Adjust window layout and sizes
- Add or replace utilities
