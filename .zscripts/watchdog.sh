#!/bin/bash
# Dev-server watchdog.
#
# Why this exists: on 2026-09-08 the Next.js dev server (next-server v1) was
# killed by the kernel OOM killer after RSS crept to ~2.2GB on a 4GB box, and
# nothing brought it back - the preview stayed dark until a manual container
# restart. This watchdog closes both failure modes:
#   1. dev server process dies (OOM / crash / stray kill)  -> restart it
#   2. next-server RSS exceeds a hard cap                  -> recycle it BEFORE
#      the global OOM killer takes the whole box down
#
# It is started detached by dev.sh at container boot and runs as an orphan
# (same lifecycle as the dev server itself). All state is in .zscripts/.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEV_PID_FILE="$PROJECT_DIR/.zscripts/dev.pid"
WATCHDOG_PID_FILE="$PROJECT_DIR/.zscripts/watchdog.pid"
LOG="$PROJECT_DIR/.zscripts/watchdog.log"

RSS_CAP_KB=1600000        # recycle next-server above ~1.6GB (box has 4GB total)
POLL_INTERVAL=20          # seconds between checks
DOWN_STREAK_TO_RESTART=2  # 2 consecutive dead checks before restarting
RESTART_BURST_LIMIT=3     # max restarts...
RESTART_BURST_WINDOW=600  # ...per 10 minutes, then back off
BACKOFF_SLEEP=300
LOG_CAP_BYTES=$((5 * 1024 * 1024))

ts() { date '+%F %T'; }

trim_log() {
	local size
	size=$(stat -c%s "$LOG" 2>/dev/null || echo 0)
	if [ "$size" -gt "$LOG_CAP_BYTES" ]; then
		tail -c 1000000 "$LOG" >"$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
	fi
}

start_dev_server() {
	cd "$PROJECT_DIR" || return 1
	setsid nohup bun run dev </dev/null >>"$PROJECT_DIR/dev.log" 2>&1 &
	local pid=$!
	disown "$pid" 2>/dev/null || true
	echo "$pid" >"$DEV_PID_FILE"
	echo "[$(ts)] start: dev server pid $pid" >>"$LOG"
}

stop_dev_server() {
	local pid pgid
	pid=$(cat "$DEV_PID_FILE" 2>/dev/null || true)
	if [ -n "$pid" ]; then
		pgid=$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d '[:space:]')
		if [ -n "$pgid" ]; then
			kill -TERM -- "-$pgid" 2>/dev/null || true
		fi
	fi
	# Fallbacks: pipeline members can outlive the recorded pid in odd states.
	pkill -f 'next dev -p 3000' 2>/dev/null || true
	pkill -f 'next-server' 2>/dev/null || true
	sleep 3
}

# RSS (KB) of the fat next-server worker; empty when not running.
next_server_rss_kb() {
	ps -eo rss,comm 2>/dev/null | awk '$2 ~ /^next-server/ {print $1; exit}'
}

next_server_running() {
	ps -eo comm 2>/dev/null | grep -q '^next-server'
}

watchdog_loop() {
	local fail_count=0 restart_burst=0 last_restart=0 pid alive now rss
	while true; do
		sleep "$POLL_INTERVAL"
		trim_log

		pid=$(cat "$DEV_PID_FILE" 2>/dev/null || true)
		alive=0
		if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
			alive=1
		elif next_server_running; then
			# recorded pid is stale but a next-server worker is alive: re-bind
			alive=1
			pgrep -f 'bun run dev' >/dev/null 2>&1 || true
		fi

		now=$(date +%s)

		if [ "$alive" -eq 0 ]; then
			fail_count=$((fail_count + 1))
			echo "[$(ts)] dev server process not found (streak $fail_count)" >>"$LOG"
			if [ "$fail_count" -ge "$DOWN_STREAK_TO_RESTART" ]; then
				if [ $((now - last_restart)) -lt "$RESTART_BURST_WINDOW" ] &&
					[ "$restart_burst" -ge "$RESTART_BURST_LIMIT" ]; then
					echo "[$(ts)] backoff: $restart_burst restarts in ${RESTART_BURST_WINDOW}s, sleeping ${BACKOFF_SLEEP}s" >>"$LOG"
					sleep "$BACKOFF_SLEEP"
					restart_burst=0
				fi
				stop_dev_server
				start_dev_server
				last_restart=$(date +%s)
				restart_burst=$((restart_burst + 1))
				fail_count=0
			fi
			continue
		fi

		fail_count=0

		rss=$(next_server_rss_kb)
		if [ -n "$rss" ] && [ "$rss" -gt "$RSS_CAP_KB" ]; then
			echo "[$(ts)] recycle: next-server RSS ${rss}KB > ${RSS_CAP_KB}KB cap (OOM prevention)" >>"$LOG"
			stop_dev_server
			start_dev_server
			last_restart=$(date +%s)
			restart_burst=$((restart_burst + 1))
		fi
	done
}

echo "[$(ts)] watchdog up (pid $$, rss cap ${RSS_CAP_KB}KB)" >>"$LOG"
watchdog_loop
