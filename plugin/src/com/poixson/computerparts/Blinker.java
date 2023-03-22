package com.poixson.computerparts;

import static com.poixson.computerparts.ComputerPartsPlugin.CHAT_PREFIX;

import java.util.LinkedList;

import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitRunnable;


public class Blinker extends BukkitRunnable {

	protected final ComputerPartsPlugin plugin;

	protected final Player player;
	protected final LinkedList<IOPort> ports = new LinkedList<IOPort>();

	protected final int seconds;
	protected final int half;
	protected int state = 0;



	public Blinker(final ComputerPartsPlugin plugin, final Player player) {
		super();
		this.plugin = plugin;
		this.player = player;
		this.seconds = 4;
		this.half = (int) Math.round( ((double)this.seconds) / 2.0 );
		final int distance = 500;
		// find ports near player
		for (final ComputerPart part : this.plugin.parts) {
			for (final IOPort port : part.ports) {
				if (port.distance(player) <= distance)
					this.ports.add(port);
			}
		}
	}
	public void start() {
		this.player.sendMessage(CHAT_PREFIX + "Blink enabled");
		this.blink(false);
		this.runTaskTimer(this.plugin, 20L, 20L);
	}
	public void unload() {
		try {
			this.cancel();
		} catch (IllegalStateException ignore) {}
		this.restore();
		this.player.sendMessage(CHAT_PREFIX + "Blink off");
	}



	@Override
	public void run() {
		if (this.state >= this.seconds)
			this.state = 0;
		final int state = ++this.state;
		// turn on
		if (state == 1) {
			this.blink(true);
		}
		// turn off
		if (state == this.half) {
			this.blink(false);
		}
	}



	public void blink(final boolean state) {
		for (final IOPort port : this.ports) {
			port.blink(state);
		}
	}

	public void restore() {
		for (final IOPort port : this.ports) {
			port.blinkRestore();
		}
		this.ports.clear();
	}



}
