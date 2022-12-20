package com.poixson.computerparts;

import java.util.logging.Logger;

import org.bukkit.ChatColor;
import org.bukkit.plugin.java.JavaPlugin;

import com.poixson.computerparts.listeners.ComputerPartsCommands;


public class ComputerPartsPlugin extends JavaPlugin {
	public static final String LOG_PREFIX  = "[Computer] ";
	public static final String CHAT_PREFIX = ChatColor.AQUA + "[Computer] " + ChatColor.WHITE;
	public static final Logger log = Logger.getLogger("Minecraft");

	// listeners
	protected final AtomicReference<ComputerPartsCommands> commandListener = new AtomicReference<ComputerPartsCommands>(null);



	public ComputerPartsPlugin() {
	}



	@Override
	public void onEnable() {
		// commands listener
		{
			final ComputerPartsCommands listener = new ComputerPartsCommands(this);
			final ComputerPartsCommands previous = this.commandListener.getAndSet(listener);
			if (previous != null)
				previous.unregister();
			listener.register();
		}
	}

	@Override
	public void onDisable() {
		// commands listener
		{
			final ComputerPartsCommands listener = this.commandListener.getAndSet(null);
			if (listener != null)
				listener.unregister();
		}
	}



}
