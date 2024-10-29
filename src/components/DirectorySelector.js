const { QWidget, FlexLayout, QLabel, QPushButton, QFileDialog, FileMode } = require("@nodegui/nodegui");

class DirectorySelector {
    constructor() {
        this.directory = "";
        this.widget = new QWidget();
        this.layout = new FlexLayout();
        this.widget.setLayout(this.layout);

        this.setupUI();
    }

    setupUI() {
        this.label = new QLabel();
        this.label.setText("Directory to download to:");

        this.button = new QPushButton();
        this.button.setText("Browse");

        this.button.addEventListener("clicked", () => {
            const fileDialog = new QFileDialog();
            fileDialog.setFileMode(FileMode.Directory);
            fileDialog.exec();

            const directories = fileDialog.selectedFiles();
            this.directory = directories[0] || "";
            this.setDirectoryStatus(this.directory);
        });

        this.layout.addWidget(this.label);
        this.layout.addWidget(this.button);
    }

    setDirectoryStatus(directory) {
        this.label.setText(`Selected directory: ${directory}`);
    }

    getDirectory() {
        return this.directory;
    }

    getWidget() {
        return this.widget;
    }
}

module.exports = DirectorySelector;
