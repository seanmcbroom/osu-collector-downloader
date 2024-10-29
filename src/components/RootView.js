const { QWidget, FlexLayout } = require("@nodegui/nodegui");
const DirectorySelector = require("./DirectorySelector");
const CollectionIdInput = require("./CollectionIdInput");
const DownloadButton = require("./DownloadButton");
const osuDownloader = require("../util/osuDownloader")

class RootView {
  constructor() {
    this.widget = new QWidget();
    this.layout = new FlexLayout();
    this.widget.setLayout(this.layout);
    this.osuDownloader = new osuDownloader();

    this.setupUI();
  }

  setupUI() {
    // Initialize components
    this.directorySelector = new DirectorySelector();
    this.collectionIdInput = new CollectionIdInput();
    this.downloadButton = new DownloadButton();

    // Listen for the download click event
    this.downloadButton.on("downloadClicked", () => {
      const directory = this.directorySelector.getDirectory();
      const collectionId = this.collectionIdInput.getCollectionId();

      if (!directory) {
        this.downloadButton.setDownloadStatus("Please select a directory.");
      } else if (!collectionId) {
        this.downloadButton.setDownloadStatus("Please enter a Collection ID.");
      } else {
        this.downloadButton.setDownloadStatus("Download started...");

        this.osuDownloader.downloadCollection(directory, collectionId);

        this.osuDownloader.on("directoryCreated", (directory) => {
          this.downloadButton.setDownloadStatus(`Directory created: ${directory}`);
        });

        this.osuDownloader.on("collectionRetrieved", (beatmapsets) => {
          this.downloadButton.setDownloadStatus(`Collection retrieved with ${beatmapsets.length} beatmapsets.`);
        });

        this.osuDownloader.on("beatmapAlreadyDownloaded", (beatmapId) => {
          this.downloadButton.setDownloadStatus(`[${beatmapId}] Beatmap already downloaded.`);
        });

        this.osuDownloader.on("beatmapDownloading", (beatmapId, mirrorName) => {
          this.downloadButton.setDownloadStatus(`[${beatmapId}] Beatmap downloading from ${mirrorName}`);
        });

        this.osuDownloader.on("beatmapDownloadSuccess", (beatmapId, mirrorName) => {
          this.downloadButton.setDownloadStatus(`[${beatmapId}] Beatmap download completed successfully from ${mirrorName}`);
        });

        this.osuDownloader.on("beatmapDownloadFailed", (beatmapId, errorMessage) => {
          this.downloadButton.setDownloadStatus(`[${beatmapId}] Beatmap download failed: ${errorMessage}`);
        });

        this.osuDownloader.on("beatmapDownloadReattempt", (beatmapId) => {
          this.downloadButton.setDownloadStatus(`[${beatmapId}] Reattempting download...`);
        });

        this.osuDownloader.on("downloadCompleted", () => {
          this.downloadButton.setDownloadStatus("All downloads completed.");
        });
      }
    });

    // Add components to root layout
    this.layout.addWidget(this.directorySelector.getWidget());
    this.layout.addWidget(this.collectionIdInput.getWidget());
    this.layout.addWidget(this.downloadButton.getWidget());
  }

  getWidget() {
    return this.widget;
  }
}

module.exports = RootView;
