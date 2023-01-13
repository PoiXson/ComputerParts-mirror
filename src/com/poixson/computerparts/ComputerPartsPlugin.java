package com.poixson.computerparts;

import java.util.Iterator;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;

import com.poixson.commonmc.tools.plugin.xJavaPlugin;
import com.poixson.computerparts.commands.Commands;


public class ComputerPartsPlugin extends xJavaPlugin {
	public static final String LOG_PREFIX  = "[Computer] ";
	public static final String CHAT_PREFIX = ChatColor.AQUA + LOG_PREFIX + ChatColor.WHITE;
	public static final Logger log = Logger.getLogger("Minecraft");
//TODO
	public static final int SPIGOT_PLUGIN_ID = 0;
	public static final int BSTATS_PLUGIN_ID = 17232;
	protected static final AtomicReference<ComputerPartsPlugin> instance = new AtomicReference<ComputerPartsPlugin>(null);

	// listeners
	protected final AtomicReference<Commands>         commandListener = new AtomicReference<Commands>(null);

	public final CopyOnWriteArraySet<ComputerPart> parts = new CopyOnWriteArraySet<ComputerPart>();

	protected final ConcurrentHashMap<UUID, Blinker> blinkers = new ConcurrentHashMap<UUID, Blinker>();



	public ComputerPartsPlugin() {
		super(ComputerPartsPlugin.class);
	}



	@Override
	public void onEnable() {
		super.onEnable();
		if (!instance.compareAndSet(null, this))
			throw new RuntimeException("Plugin instance already enabled?");
		// commands listener
		{
			final Commands listener = new Commands(this);
			final Commands previous = this.commandListener.getAndSet(listener);
			if (previous != null)
				previous.unregister();
			listener.register();
		}
	}

	@Override
	public void onDisable() {
		super.onDisable();
		// unload emulators
		{
			final Iterator<ComputerPart> it = this.parts.iterator();
			while (it.hasNext()) {
				final ComputerPart part = it.next();
				part.unload();
				it.remove();
			}
		}
		// commands listener
		{
			final Commands listener = this.commandListener.getAndSet(null);
			if (listener != null)
				listener.unregister();
		}
		// stop blinkers
		for (final Blinker blink : this.blinkers.values()) {
			blink.unload();
		}
		if (!instance.compareAndSet(this, null))
			throw new RuntimeException("Disable wrong instance of plugin?");
	}



	public boolean toggleBlink(final Player player) {
		final UUID uuid = player.getUniqueId();
		final Blinker blink = this.blinkers.remove(uuid);
		if (blink != null) {
			blink.unload();
			return false;
		} else {
			final Blinker b = new Blinker(this, player);
			this.blinkers.put(uuid, b);
			return true;
		}
	}



	// -------------------------------------------------------------------------------



	@Override
	protected int getSpigotPluginID() {
		return SPIGOT_PLUGIN_ID;
	}
	@Override
	protected int getBStatsID() {
		return BSTATS_PLUGIN_ID;
	}



}
