#!/usr/bin/env bash
# LEGACY (v1/v2): built the first frame sequences straight from the 24 fps segments.
# The live site (v3) is built with retime.py from the Higgsfield 60 fps master instead.
set -euo pipefail
H=${H:-$(dirname "$0")/../../hero/3-segments}
OUT=${OUT:-$(dirname "$0")/../../../site/assets/hero/legacy}
cd "$H"
# 1) one continuous 1440x1440 master: concat segments, dropping the duplicated first frame of segments 2-4
ffmpeg -v error -y -i seg0.mp4 -i seg1.mp4 -i seg2.mp4 -i seg3.mp4 -filter_complex \
 "[0:v]setpts=PTS-STARTPTS[a];[1:v]trim=start_frame=1,setpts=PTS-STARTPTS[b];[2:v]trim=start_frame=1,setpts=PTS-STARTPTS[c];[3:v]trim=start_frame=1,setpts=PTS-STARTPTS[d];[a][b][c][d]concat=n=4:v=1:a=0,format=yuv420p[v]" \
 -map "[v]" -an -c:v libx264 -crf 12 -preset slow master.mp4
N=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 master.mp4)
echo "master frames: $N"
mkdir -p "$OUT/d" "$OUT/m"
# 2) desktop: every 2nd frame (247), mobile: every 3rd (165); both include the last -> desktop square 1200 and mobile 9:16 column (centred on the arch)
ffmpeg -v error -y -i master.mp4 -vf "select='not(mod(n\,2))',scale=1080:1080:flags=lanczos" -fps_mode vfr -c:v libwebp -quality 44 -compression_level 6 -preset photo -start_number 0 "$OUT/d/%03d.webp"
ffmpeg -v error -y -i master.mp4 -vf "select='not(mod(n\,3))',crop=810:1440:344:0,scale=720:1280:flags=lanczos" -fps_mode vfr -c:v libwebp -quality 46 -compression_level 6 -preset photo -start_number 0 "$OUT/m/%03d.webp"
echo "desktop: $(ls $OUT/d | wc -l) frames, $(du -sh $OUT/d | cut -f1)"
echo "mobile:  $(ls $OUT/m | wc -l) frames, $(du -sh $OUT/m | cut -f1)"
# 3) compact preview video of the full sequence (for review / sharing)
ffmpeg -v error -y -i master.mp4 -vf "scale=1080:1080" -an -c:v libx264 -crf 24 -preset slow -movflags +faststart -pix_fmt yuv420p preview_1080.mp4
