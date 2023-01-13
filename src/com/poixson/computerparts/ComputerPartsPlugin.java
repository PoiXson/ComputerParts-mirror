package com.poixson.computerparts;

import java.util.Iterator;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicReference;
import java.util.logging.Logger;

import org.bstats.bukkit.Metrics;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.event.HandlerList;
import org.bukkit.plugin.java.JavaPlugin;

import com.poixson.commonbukkit.pxnCommonPlugin;
import com.poixson.computerparts.commands.Commands;
import com.poixson.tools.AppProps;


public class ComputerPartsPlugin extends JavaPlugin {
	public static final String LOG_PREFIX  = "[Computer] ";
	public static final String CHAT_PREFIX = ChatColor.AQUA + LOG_PREFIX + ChatColor.WHITE;
	public static final Logger log = Logger.getLogger("Minecraft");
//TODO
	public static final int SPIGOT_PLUGIN_ID = 0;
	public static final int BSTATS_PLUGIN_ID = 17232;
	protected static final AtomicReference<ComputerPartsPlugin> instance = new AtomicReference<ComputerPartsPlugin>(null);
	protected static final AtomicReference<Metrics>             metrics  = new AtomicReference<Metrics>(null);
	protected final AppProps props;

	// listeners
	protected final AtomicReference<Commands>         commandListener = new AtomicReference<Commands>(null);

	public final CopyOnWriteArraySet<ComputerPart> parts = new CopyOnWriteArraySet<ComputerPart>();

	protected final ConcurrentHashMap<UUID, Blinker> blinkers = new ConcurrentHashMap<UUID, Blinker>();



	public ComputerPartsPlugin() {
		try {
			this.props = AppProps.LoadFromClassRef(ComputerPartsPlugin.class);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}



	@Override
	public void onEnable() {
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
		// bStats
		System.setProperty("bstats.relocatecheck","false");
		metrics.set(new Metrics(this, BSTATS_PLUGIN_ID));
		// update checker
		pxnCommonPlugin.GetPlugin()
			.getUpdateCheckManager()
				.addPlugin(this, SPIGOT_PLUGIN_ID, this.getPluginVersion());
	}

	@Override
	public void onDisable() {
		// update checker
		pxnCommonPlugin.GetPlugin()
			.getUpdateCheckManager()
				.removePlugin(SPIGOT_PLUGIN_ID);
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
		// stop schedulers
		try {
			Bukkit.getScheduler()
				.cancelTasks(this);
		} catch (Exception ignore) {}
		// stop listeners
		HandlerList.unregisterAll(this);
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



	public String getPluginVersion() {
		return this.props.version;
	}



}
