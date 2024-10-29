const { QWidget, FlexLayout, QPushButton, QLabel } = require("@nodegui/nodegui");

class DownloadButton {
    constructor() {
        this.widget = new QWidget();
        this.layout = new FlexLayout();
        this.widget.setLayout(this.layout);

        this.setupUI();
        this.events = {};  // Event handlers for custom events
    }

    setupUI() {
        this.downloadButton = new QPushButton();
        this.downloadButton.setText("Download");

        this.downloadStatus = new QLabel();
        this.downloadStatus.setText("Status: Idle");

        this.downloadButton.addEventListener("clicked", () => {
            this.emit("downloadClicked"); // Emit custom event for button click
        });

        this.layout.addWidget(this.downloadButton);
        this.layout.addWidget(this.downloadStatus);
    }

    // Method to listen for custom events
    on(eventName, callback) {
        this.events[eventName] = callback;
    }

    // Method to emit custom events
    emit(eventName) {
        if (this.events[eventName]) {
            this.events[eventName]();
        }
    }

    setDownloadStatus(status) {
        this.downloadStatus.setText(status);
    }

    getWidget() {
        return this.widget;
    }
}

module.exports = DownloadButton;
