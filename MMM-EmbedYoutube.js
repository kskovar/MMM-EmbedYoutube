/* Magic Mirror
 * Module: Embed Youtube
 * 
 * v 1.5.0
 * 
 * By Nitipoom Unrrom (aka nitpum) https://nitpum.com
 * MIT Licensed.
 */
Module.register("MMM-EmbedYoutube", {
	defaults: {
		autoplay: false,
		cc_load_policy: false,
		color: "red",
		controls: true,
		disablekb: false,
		fs: true,
		height: 315,
		width: 560,
		loop: false,
		modestbranding: false,
		rel: false,
		showinfo: false,
		video_id: "",
		playlist: "",
		video_list: []
	},

	/**
	 * Builds the YouTube embed URL with proper parameters
	 * @returns {string} Complete YouTube embed URL
	 */
	buildEmbedUrl: function() {
		const params = this.buildUrlParams();
		const videoPath = this.getVideoPath();
		return `https://www.youtube.com/embed/${videoPath}?${params}`;
	},

	/**
	 * Determines the video path (single video or playlist)
	 * @returns {string} Video ID or playlist path
	 */
	getVideoPath: function() {
		if (this.config.playlist) {
			return `playlist?list=${this.config.playlist}`;
		}
		return `${this.config.video_id}?version=3`;
	},

	/**
	 * Builds URL parameters for the YouTube embed
	 * @returns {string} URL-encoded parameters
	 */
	buildUrlParams: function() {
		const params = [];

		// Basic parameters
		params.push(`autoplay=${this.config.autoplay ? 1 : 0}`);
		params.push(`cc_load_policy=${this.config.cc_load_policy ? 1 : 0}`);
		params.push(`controls=${this.config.controls ? 1 : 0}`);
		params.push(`rel=${this.config.rel ? 1 : 0}`);
		params.push(`showinfo=${this.config.showinfo ? 1 : 0}`);

		// Conditional parameters
		if (this.config.color && this.config.color !== "red") {
			params.push(`color=${this.config.color}`);
		}

		if (this.config.disablekb) {
			params.push("disablekb=1");
		}

		if (!this.config.fs) {
			params.push("fs=0");
		}

		if (this.config.modestbranding) {
			params.push("modestbranding=1");
		}

		// Handle playlist for looping
		const playlistParam = this.getPlaylistParam();
		if (playlistParam) {
			params.push(playlistParam);
		}

		if (this.config.loop) {
			params.push("loop=1");
		}

		return params.join("&");
	},

	/**
	 * Gets the playlist parameter for the URL
	 * @returns {string|null} Playlist parameter or null
	 */
	getPlaylistParam: function() {
		// If video_list is provided, use it
		if (this.config.video_list && this.config.video_list.length > 0) {
			return `playlist=${this.config.video_list.join(",")}`;
		}
		
		// If no explicit playlist but we need one for looping
		if (!this.config.playlist && this.config.video_id) {
			return `playlist=${this.config.video_id}`;
		}

		return null;
	},

	/**
	 * Validates configuration
	 * @returns {boolean} True if config is valid
	 */
	validateConfig: function() {
		if (!this.config.video_id && !this.config.playlist && 
		    (!this.config.video_list || this.config.video_list.length === 0)) {
			Log.error("MMM-EmbedYoutube: No video_id, playlist, or video_list provided");
			return false;
		}

		if (this.config.width <= 0 || this.config.height <= 0) {
			Log.warn("MMM-EmbedYoutube: Invalid width or height, using defaults");
			this.config.width = this.defaults.width;
			this.config.height = this.defaults.height;
		}

		return true;
	},

	/**
	 * Creates the DOM element for the module
	 * @returns {HTMLElement} Wrapper div containing the iframe
	 */
	getDom: function() {
		const wrapper = document.createElement("div");
		wrapper.className = "MMM-EmbedYoutube-wrapper";

		if (!this.validateConfig()) {
			wrapper.innerHTML = "<div class='dimmed light small'>YouTube module configuration error. Please check logs.</div>";
			return wrapper;
		}

		const embedUrl = this.buildEmbedUrl();
		const iframe = this.createIframe(embedUrl);
		
		wrapper.appendChild(iframe);
		return wrapper;
	},

	/**
	 * Creates the iframe element
	 * @param {string} url - The embed URL
	 * @returns {HTMLIFrameElement} Configured iframe element
	 */
	createIframe: function(url) {
		const iframe = document.createElement("iframe");
		iframe.width = this.config.width;
		iframe.height = this.config.height;
		iframe.src = url;
		iframe.frameBorder = "0";
		iframe.referrerPolicy = "strict-origin-when-cross-origin";
		iframe.allowFullscreen = true;
		iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
		iframe.title = "YouTube video player";
		
		return iframe;
	},

	/**
	 * Gets CSS definitions for the module
	 * @returns {string[]} Array of CSS file paths
	 */
	getStyles: function() {
		return ["MMM-EmbedYoutube.css"];
	}
});
