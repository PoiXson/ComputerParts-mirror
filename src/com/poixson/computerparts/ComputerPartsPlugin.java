package com.poixson.computerparts;

import java.util.logging.Logger;

import org.bukkit.ChatColor;
import org.bukkit.plugin.java.JavaPlugin;


public class ComputerPartsPlugin extends JavaPlugin {
	public static final String LOG_PREFIX  = "[Computer] ";
	public static final String CHAT_PREFIX = ChatColor.AQUA + "[Computer] " + ChatColor.WHITE;
	public static final Logger log = Logger.getLogger("Minecraft");



	public ComputerPartsPlugin() {
	}



	@Override
	public void onEnable() {
	}

	@Override
	public void onDisable() {
	}



}
