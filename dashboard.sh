#!/usr/bin/env bash

kitty @ set-font-size 12
kitty @ launch --type=window --location=hsplit btop -p 1 >>/dev/null
kitty @ resize-window -a vertical -i 14
kitty @ launch --type=window --location=vsplit btop -p 2 >>/dev/null
kitty @ send-key 5
kitty @ launch --type=window --location=hsplit cava >>/dev/null
kitty @ resize-window -a vertical -i -15
kitty @ focus-window
kitty @ launch --type=window --location=vsplit sh -c "$(
  cat <<'EOF'
# sysInfo.sh content begins here

weather=""
old_packagesCount=""
old_volume_value=""
old_brightness_value=""
old_network_name=""
old_border_colour=""
old_border_colour2=""
temp_file=$(mktemp)
trap 'rm -f "$temp_file"' EXIT

while true; do
  packagesCount=$(yay -Q | wc -l)
  volume_value=$(pactl get-sink-volume @DEFAULT_SINK@ | grep -oP '\d+%' | head -n 1)
  brightness_value=$(( $(brightnessctl g) * 100 / $(brightnessctl max) ))
  network_name=$(iwconfig wlan0 | grep -oP 'ESSID:"\K[^"]+')

  border_colour=$(kitty @ get-colors | grep color0 | sed 's/.*#/#/')
  border_colour2=$(kitty @ get-colors | grep color2 | sed 's/.*#/#/')

  if [[ "$packagesCount" != "$old_packagesCount" ]] ||
     [[ "$volume_value" != "$old_volume_value" ]] ||
     [[ "$brightness_value" != "$old_brightness_value" ]] ||
     [[ "$network_name" != "$old_network_name" ]] ||
     [[ "$border_colour" != "$old_border_colour" ]] ||
     [[ "$border_colour2" != "$old_border_colour2" ]]; then

    old_packagesCount="$packagesCount"
    old_volume_value="$volume_value"
    old_brightness_value="$brightness_value"
    old_network_name="$network_name"
    old_border_colour="$border_colour"
    old_border_colour2="$border_colour2"

    packages=$(gum style --border=rounded --border-foreground="$border_colour2" --padding="0 1" "Packages: $packagesCount")
    volume=$(gum style --border=rounded --border-foreground="$border_colour2" --padding="0 1" "Volume: $volume_value")
    brightness=$(gum style --border=rounded --border-foreground="$border_colour2" --padding="0 1" "Brightness: $brightness_value%")
    network=$(gum style --border=rounded --border-foreground="$border_colour2" --padding="0 1" "Wifi: $network_name")
    cal=$(cal --color=always | sed -n '1,7p' | gum style --border=rounded --padding="0 2" --border-foreground="$border_colour" --margin="0 0")

    volAndWifi=$(gum join "$volume" "$network")
    sysInfo=$(gum join --vertical --align="right" "$packages" "$brightness" "$volAndWifi")

    echo -e "\u001Bc"
    gum join "$sysInfo" "$cal" 
    kitten @ scroll-window 1-
  fi

  sleep 5s
done
EOF
)" >>/dev/null

kitty @ resize-window -a horizontal -i -29
kitty @ focus-window
kitty @ launch --type=window --location=vsplit peaclock >>/dev/null
kitty @ resize-window -a horizontal -i 15
kitten @ send-key s
sleep 0.5
kitten @ send-key d
kitten @ focus-window
kitten @ resize-window -a horizontal -i 6

kitty @ launch --type=window --location=vsplit sh -c "$(
  cat <<'EOF'
while true; do
  echo -e "\u001Bc"
  curl -s wttr.in/"$city" | sed -n '2,7p' 
  sleep 4h
done
EOF
)" >>/dev/null

kitty @ focus-window
kitty @ resize-window -a horizontal -i -18
kitty +kitten icat --align=center --place 20x20@1x1 --scale ~/pics/ss.png
read
