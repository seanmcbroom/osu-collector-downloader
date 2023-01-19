const { OsuCollectorNode } = require("osu-collector-node")
const { DownloaderHelper } = require("node-downloader-helper");
const fs = require('fs');

const mirrors = {
    chimu: "https://api.chimu.moe/v1/download/",
    kitsu: "https://kitsu.moe/api/d/",
};

const osuCollector = new OsuCollectorNode()

async function downloadCollection(Directory, CollectionId) {
    const Collection = await osuCollector.getCollection({ id: CollectionId }).catch(console.log);
    const downloadDirectory = `${Directory}/${Collection.name}`;

    if (!Collection) return;
    if (!downloadDirectory) return;

    // Make directory to download beatmaps to.
    if (!fs.existsSync(downloadDirectory)) {
        fs.mkdir(downloadDirectory, (error) => {
            if (error) console.log(error);
            if (!error) console.log("New Directory created successfully");
        });
    }

    // Attempt to download all beatmapsets
    for (beatmapset of Collection.beatmapsets) {
        const beatmapId = beatmapset.id;
        const filename = `${beatmapId}.osz`
        const beatmapDirectory = `${downloadDirectory}/${filename}`

        function AttemptDownload(api) {
            const Download = new DownloaderHelper(`${mirrors[api]}${beatmapId}`, downloadDirectory, { fileName: filename });

            Download.start().catch(async (err) => { });;
            console.log(`[${beatmapId}] Beatmap downloading (${api})`);

            Download.on("end", () => {
                console.log(`[${beatmapId}] Beatmap download completed successfully (${api})`);
            });

            Download.on('error', (err) => {
                console.warn(`[${beatmapId}] Beatmap download failed`);

                if (fs.existsSync(beatmapDirectory)) {
                    fs.unlinkSync(beatmapDirectory);
                }

                if (api == "kitsu") return;

                console.warn(`[${beatmapId}] Reattempting download`);
                AttemptDownload("kitsu");
            })
        }

        if (!fs.existsSync(beatmapDirectory)) {
            AttemptDownload("chimu");
        }
    };
}

module.exports = downloadCollection;