set -e
src=$1; dst=$2
W=$(identify -format %w "$src"); H=$(identify -format %h "$src"); IW=$((H*4/3))
convert "$src" -resize ${IW}x${H}^ -gravity center -extent ${IW}x${H} \
  -modulate 100,40 -level 4%,96% -attenuate 0.28 +noise Gaussian \
  \( -size ${IW}x${H} pattern:horizontal2 -alpha set -channel A -evaluate multiply 0.30 +channel \) \
  -compose multiply -composite \
  -blur 0x0.4 -compose over -background black -gravity center -extent ${W}x${H} "$dst"
identify -format "%f mean=%[fx:mean] %wx%h\n" "$dst"
