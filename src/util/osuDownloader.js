const { OsuCollectorNode } = require("osu-collector-node");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mirrors = require("./mirrors.js");
const { EventEmitter } = require("events");

class osuDownloader extends EventEmitter {
  constructor() {
    super();

    this.osuCollector = new OsuCollectorNode();
    this.downloadQueue = [];
    this.downloadDirectory = undefined;
    this.isDownloading = false;
  }

  /**
   * Download a collection to a directory
   * @param {String} directory Directory to download to
   * @param {number} collectionId Collection Id
   */
  async downloadCollection(directory, collectionId) {
    const collection = await this.osuCollector.getCollection({ id: collectionId }).catch(console.log);
    const downloadDirectory = `${directory}/${collection.name.replace(/[/\\?%*:|"<>]/g, "-")}`; // Remove illegal characters

    if (collection && downloadDirectory) {
      this.downloadDirectory = downloadDirectory;

      // Create directory
      if (!fs.existsSync(downloadDirectory)) {
        fs.mkdirSync(downloadDirectory, { recursive: true });
        this.emit("directoryCreated", downloadDirectory);
      }

      this.emit("collectionRetrieved", collection.beatmapsets);

      // Add all beatmaps to download queue
      for (let beatmapset of collection.beatmapsets) {
        this.downloadQueue.push(beatmapset.id);
      }

      this._processQueue();
    }
  }

  /**
   * Processes the download queue
   */
  async _processQueue() {
    if (!this.isDownloading && !this.downloadQueue.length == 0) {
      this.isDownloading = true;

      while (this.downloadQueue.length > 0) {
        const beatmapId = this.downloadQueue.shift();
        await this._attemptBeatmapsetDownload(beatmapId, 0);
      }

      this.isDownloading = false;

      this.emit("downloadCompleted");
    }
  }

  /**
   * Attempts to download a beatmap set
   * @param {number} beatmapId Beatmap Id
   * @param {number} api API index for mirrors
   * @param {boolean} reattempt Recursive searching
   */
  async _attemptBeatmapsetDownload(beatmapId, api, reattempt = true) {
    const mirrorApi = mirrors[api];
    const fileUrl = `${mirrorApi.url}${beatmapId}`;

    // If file is already downloaded, skip
    const existingFiles = fs.readdirSync(this.downloadDirectory);
    const alreadyDownloaded = existingFiles.some((file) => file.includes(toString(beatmapId)));

    if (alreadyDownloaded) {
      this.emit("beatmapAlreadyDownloaded", beatmapId);
      return this.processQueue(downloadDirectory); // Continue to next download
    }

    const response = await axios({
      method: "get",
      url: fileUrl,
      responseType: "stream",
    });

    /**
     * Extract the filename from the 'Content-Disposition' header if available
     * Fallback to default naming convention if filename is not found
     */
    let fileName;
    try {
      fileName = response.headers["content-disposition"].match(/filename="(.+)"/)[1];
    } catch {
      fileName = `${beatmapId}(${mirrorApi.name}).osz`;
    }

    this.emit("beatmapDownloading", fileName, mirrorApi.name);

    const beatmapDirectory = path.join(this.downloadDirectory, fileName);

    /**
     * Attempt to download beatmap from request stream.
     * If the download fails/errors, remove file and reattemt (if not disabled)
     */
    try {
      const writer = fs.createWriteStream(beatmapDirectory);

      response.data.pipe(writer); // Pipe the response data to the file

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          this.emit("beatmapDownloadSuccess", fileName, mirrorApi.name);
          resolve();
        });

        writer.on("error", (err) => {
          this.emit("beatmapDownloadFailed", fileName);
          reject(err);
        });
      });
    } catch (error) {
      this.emit("beatmapDownloadFailed", fileName, error.message);

      // Delete beatmap file if it exists
      if (fs.existsSync(beatmapDirectory)) {
        fs.unlinkSync(beatmapDirectory);
      }

      // Reattempt download with another API
      const nextApiIndex = api + 1;
      if (reattempt && mirrors[nextApiIndex]) {
        this.emit("beatmapDownloadReattempt", fileName);

        await this._attemptBeatmapsetDownload(beatmapId, nextApiIndex);
      }
    }
  }
}

module.exports = osuDownloader;
