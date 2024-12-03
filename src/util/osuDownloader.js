const { OsuCollectorNode } = require("osu-collector-node");
const axios = require('axios');
const fs = require('fs');
const path = require("path");
const mirrors = require("./mirrors.js");
const { EventEmitter } = require('events');

class osuDownloader extends EventEmitter {
    /**
     * Creates a new client object
     */
    constructor() {
        super(); // Call the parent constructor
        this.osuCollector = new OsuCollectorNode();
        this.downloadQueue = []; // Queue for managing downloads
        this.isDownloading = false; // Flag to track if a download is in progress
    }

    /**
     * Download a collection to a directory
     * @param {String} directory Directory to download to
     * @param {number} collectionId Collection Id
     */
    async downloadCollection(directory, collectionId) {
        const collection = await this.osuCollector.getCollection({ id: collectionId }).catch(console.log);
        const downloadDirectory = `${directory}/${(collection.name).replace(/[/\\?%*:|"<>]/g, '-')}`; // Remove illegal characters

        if (!collection) return;
        if (!downloadDirectory) return;

        // Make directory to download beatmaps to.
        if (!fs.existsSync(downloadDirectory)) {
            fs.mkdirSync(downloadDirectory, { recursive: true }); // Use synchronous mkdir to ensure the directory is created
            this.emit("directoryCreated", downloadDirectory);
        }

        this.emit("collectionRetrieved", collection.beatmapsets);
        for (let beatmapset of collection.beatmapsets) {
            this.downloadQueue.push(beatmapset.id); // Add to queue
        }

        // Start the download process if not already in progress
        this.processQueue(downloadDirectory);
    }

    /**
     * Processes the download queue
     * @param {path} downloadDirectory Directory to download files to
     */
    async processQueue(downloadDirectory) {
        if (this.isDownloading || this.downloadQueue.length === 0) {
            return; // Exit if already downloading or no more items in the queue
        }

        this.isDownloading = true; // Set flag to true to indicate a download is in progress

        while (this.downloadQueue.length > 0) {
            const beatmapId = this.downloadQueue.shift(); // Get the next beatmap ID from the queue
            await this._attemptBeatmapsetDownload(beatmapId, downloadDirectory, 0, true);
        }

        this.isDownloading = false; // Reset the flag once all downloads are done
        this.emit("downloadCompleted");
    }

    /**
     * Attempts to download a beatmap set
     * @param {number} beatmapId Beatmap Id
     * @param {path} downloadDirectory Directory to download to
     * @param {number} api API index for mirrors
     * @param {boolean} reattempt Recursive searching
     */
    async _attemptBeatmapsetDownload(beatmapId, downloadDirectory, api, reattempt) {
        const mirrorApi = mirrors[api];
        const fileUrl = `${mirrorApi.url}${beatmapId}`;
    
        // If file is already downloaded, skip
        const existingFiles = fs.readdirSync(downloadDirectory);
        const alreadyDownloaded = existingFiles.some(file => file.includes(beatmapId));
        if (alreadyDownloaded) {
            this.emit("beatmapAlreadyDownloaded", beatmapId);
            return this.processQueue(downloadDirectory); // Continue to next download
        }
    
        try {
            // Start the download using axios
            this.emit("beatmapDownloading", beatmapId, mirrorApi.name);
            const response = await axios({
                method: 'get',
                url: fileUrl,
                responseType: 'stream' // Ensure we get the response as a stream
            });
    
            /**
             * Extract the filename from the 'Content-Disposition' header if available
             * Fallback to default naming convention if filename is not found
             */
            let fileName
            try {
                fileName = response.headers['content-disposition']?.match(/filename="(.+)"/)?.[1];
            } catch {
                fileName = `${beatmapId}(${mirrorApi.name}).osz`;
            }
    
            const beatmapDirectory = path.join(downloadDirectory, fileName);
    
            // Create a write stream for the file
            const writer = fs.createWriteStream(beatmapDirectory);
    
            // Pipe the response data to the file
            response.data.pipe(writer);
    
            // Return a promise that resolves when the file is finished writing
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    this.emit("beatmapDownloadSuccess", beatmapId, mirrorApi.name);
                    resolve();
                });
    
                writer.on('error', (err) => {
                    this.emit("beatmapDownloadFailed", beatmapId);
                    reject(err);
                });
            });
        } catch (error) {
            this.emit("beatmapDownloadFailed", beatmapId, error.message);
    
            // Delete beatmap file if it exists
            const beatmapDirectory = path.join(downloadDirectory, fileName);
            if (fs.existsSync(beatmapDirectory)) {
                fs.unlinkSync(beatmapDirectory);
            }
    
            // Reattempt download with another API
            const next = (api + 1);
            if (!reattempt) return; // If set to not reattempt, break recursion
            if (!mirrors[next]) return; // If there are no more APIs to download from, break recursion
    
            this.emit("beatmapDownloadReattempt", beatmapId);
            await this._attemptBeatmapsetDownload(beatmapId, downloadDirectory, next, true);
        }
    }
}

module.exports = osuDownloader;
