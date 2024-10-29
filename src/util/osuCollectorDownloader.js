const { OsuCollectorNode } = require("osu-collector-node")
const { DownloaderHelper } = require("node-downloader-helper");
const fs = require('fs');
const path = require("path");
const mirrors = require("./mirrors.js");

class osuCollectorDownloader {
    /**
     * Creates a new client object
     */
    constructor() {
        this.osuCollector = new OsuCollectorNode();
    }

    /**
     * Download a collection to a directory
     * @param {String} Directory Directory to download to
     * @param {number} collectionId Collection Id
     */
    async downloadColleciton(Directory, collectionId) {
        const Collection = await this.osuCollector.getCollection({ id: collectionId }).catch(console.log);
        const downloadDirectory = `${Directory}/${(Collection.name).replace(/[/\\?%*:|"<>]/g, '-')}`; // Remove illegal characters

        if (!Collection) return;
        if (!downloadDirectory) return;

        // Make directory to download beatmaps to.
        if (!fs.existsSync(downloadDirectory)) {
            fs.mkdir(downloadDirectory, (error) => {
                if (error) console.log(error);
                if (!error) console.log("New Directory created successfully");
            });
        }
        console.log(Collection.beatmapsets)
        for (let beatmapset of Collection.beatmapsets) {
            this._attemptBeatmapsetDownload(beatmapset.id, downloadDirectory, 0, true);
        }
    }

    /**
     * Makes an api call
     * @param {number} beatmapId Beatmap Id
     * @param {path} downloadDirectory Beatmap Id
     * @param {number} api
     * @param {boolean} reattempt Resursive searching
     */
    async _attemptBeatmapsetDownload(beatmapId, downloadDirectory, api, reattempt) {
        const mirrorApi = Constants.mirror[api];
        const filename = `${beatmapId}.osz`
        const beatmapDirectory = `${downloadDirectory}/${filename}`

        // If file is already downloaded break
        if (fs.existsSync(beatmapDirectory)) return;

        // Create download process
        console.log(api)
        console.log(`${mirrorApi.url}${beatmapId}`)
        const downloadProcess = new DownloaderHelper(`${mirrorApi.url}${beatmapId}`, downloadDirectory, { fileName: filename });

        // Begin Download
        downloadProcess.start().catch(async (err) => { });;
        console.log(`[${beatmapId}] Beatmap downloading (${mirrorApi.name})`);

        // Successfull Download
        downloadProcess.on("end", () => {
            console.log(`[${beatmapId}] Beatmap download completed successfully (${mirrorApi.name})`);
        });

        // Error Download
        downloadProcess.on('error', (err) => {
            console.warn(`[${beatmapId}] Beatmap download failed`);

            // Delete beatmapset file if it exists
            if (fs.existsSync(beatmapDirectory)) {
                fs.unlinkSync(beatmapDirectory);
            }

            // Reattempt download with another api
            const next = (api + 1);
            if (!reattempt) return // If set to not reattempt search break recursion
            if (!mirrors[next]) return; // If there are no more apis to download from break recursion

            console.warn(`[${beatmapId}] Reattempting download...`);
            this._attemptBeatmapsetDownload(beatmapId, downloadDirectory, next, true);
        })
    }
}

module.exports = Client;
