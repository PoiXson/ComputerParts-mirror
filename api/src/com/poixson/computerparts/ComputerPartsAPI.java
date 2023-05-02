package com.poixson.computerparts;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

import org.bukkit.Bukkit;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.PluginManager;
import org.bukkit.plugin.ServicesManager;


public class ComputerPartsAPI {
	protected static final Logger LOG = Logger.getLogger("Minecraft");

	protected static final String NAME  = "ComputerPartsPlugin";
	protected static final String CLASS = "com.poixson.computerparts.ComputerPartsPlugin";

	protected final ComputerPartsPlugin plugin;

	protected static final AtomicInteger errcount_PluginNotFound = new AtomicInteger(0);



	public static ComputerPartsAPI GetAPI() {
		// existing instance
		{
			final ServicesManager services = Bukkit.getServicesManager();
			final ComputerPartsAPI api = services.load(ComputerPartsAPI.class);
			if (api != null)
				return api;
		}
		// load api
		try {
			if (Class.forName(CLASS) == null)
				throw new ClassNotFoundException(CLASS);
			final PluginManager manager = Bukkit.getPluginManager();
			final Plugin plugin = manager.getPlugin(NAME);
			if (plugin == null) throw new RuntimeException(NAME+" plugin not found");
			return new ComputerPartsAPI(plugin);
		} catch (ClassNotFoundException e) {
			if (errcount_PluginNotFound.getAndIncrement() < 10)
				LOG.severe("Plugin not found: "+NAME);
			return null;
		}
	}

	protected ComputerPartsAPI(final Plugin p) {
		if (p == null) throw new NullPointerException();
		this.plugin = (ComputerPartsPlugin) p;
	}



}
