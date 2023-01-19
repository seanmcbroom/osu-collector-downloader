const { QMainWindow, FlexLayout, QWidget, QLabel, QFileDialog, QPushButton, FileMode, QIcon, QLineEdit } = require("@nodegui/nodegui");
const downloadCollection = require("./modules/downloadCollection.js");

const win = new QMainWindow();
win.setWindowTitle("osu!collector");
win.setFixedSize(400, 150);

const icon = new QIcon('../assets/iconx200.png');
win.setWindowIcon(icon);

// Root view
const rootView = new QWidget();
win.setCentralWidget(rootView);

const rootViewLayout = new FlexLayout();
rootView.setObjectName('rootView');
rootView.setLayout(rootViewLayout);

// Fieldset
const fieldset = new QWidget();
const fieldsetLayout = new FlexLayout();
fieldset.setObjectName('fieldset');
fieldset.setLayout(fieldsetLayout);

// Select directory row
const directoryRow = new QWidget();
const directoryRowLayout = new FlexLayout();
directoryRow.setObjectName('directoryRow');
directoryRow.setLayout(directoryRowLayout);

const directorySelectLabel = new QLabel();
const directorySelectButton = new QPushButton();
directorySelectLabel.setObjectName("directorySelectLabel")
directorySelectLabel.setText('Directory to download to:');
directorySelectButton.setText("Browse");

directoryRowLayout.addWidget(directorySelectLabel);
directoryRowLayout.addWidget(directorySelectButton);

// Second directory row
const directory2Row = new QWidget();
const directory2RowLayout = new FlexLayout();
directory2Row.setObjectName('directory2Row');
directory2Row.setLayout(directory2RowLayout);

const directoryLabel = new QLabel();
directory2RowLayout.addWidget(directoryLabel);
directoryLabel.setObjectName("directoryLabel")

// Collection ID Input
const collectionIdRow = new QWidget();
const collectionIdRowLayout = new FlexLayout();
collectionIdRow.setObjectName('collectionIdRow');
collectionIdRow.setLayout(collectionIdRowLayout);

const collectionIdLabel = new QLabel();
const collectionIdInput = new QLineEdit();
collectionIdLabel.setText('Collection Id:');
collectionIdLabel.setObjectName("collectionIdLabel")

collectionIdRowLayout.addWidget(collectionIdLabel);
collectionIdRowLayout.addWidget(collectionIdInput);

// Button row
const buttonRow = new QWidget();
const buttonRowLayout = new FlexLayout();
buttonRow.setLayout(buttonRowLayout);
buttonRow.setObjectName('buttonRow');

// Buttons
const downloadButton = new QPushButton();
const downloadStatus = new QLabel();
downloadButton.setText('Download');
downloadButton.setObjectName('downloadButton');
downloadStatus.setObjectName('downloadStatus');

// Add the widgets to the respective layouts
rootViewLayout.addWidget(fieldset);
rootViewLayout.addWidget(buttonRow);
fieldsetLayout.addWidget(directoryRow);
fieldsetLayout.addWidget(directory2Row);
fieldsetLayout.addWidget(collectionIdRow);
buttonRowLayout.addWidget(downloadButton);
buttonRowLayout.addWidget(downloadStatus);

// Styling
const rootStyleSheet = `
  #rootView{
    padding: 5px;
  }
  #fieldset {
    padding: 10px;
    border: 2px ridge #bdbdbd;
    margin-bottom: 4px;
  }
  #directoryRow, #directory2Row, #collectionIdRow, #buttonRow {
    margin-right: 3px;
    flex-direction: row;
  }
  #directoryRow {
    margin-bottom: 1px; 
  }
  #directory2Row {
    margin-bottom: 5px; 
  }
  #directorySelectLabel, #collectionIdLabel, #downloadButton {
    margin-right: 2px;
  }
  #directoryLabel {
    color: #427cff;
    width: 400px;
    background-color: #dedede;
  }
  #buttonRow{
    padding: 10px;
    border: 2px ridge #bdbdbd;
    margin-bottom: 4px;
  }
  #downloadStatus {
    width: 400px;
  }
`;

rootView.setStyleSheet(rootStyleSheet);


// Handle directory select button
let directory = "";
directorySelectButton.addEventListener('clicked', (checked) => {
    const fileDialog = new QFileDialog();
    fileDialog.setFileMode(FileMode.Directory);
    fileDialog.exec();

    const directorys = fileDialog.selectedFiles();
    directory = directorys[0];
    directoryLabel.setText(directory);
})

downloadButton.addEventListener('clicked', (checked) => {
    if (directory == "") {
        downloadStatus.setText("Directory not selected.")
        return
    }

    const collectionId = collectionIdInput.text()
    console.log(collectionId)
    if (collectionId == "") {
        downloadStatus.setText("Collection Id not selected.")
        return
    }

    downloadCollection(directory, collectionId);
})

win.show();

global.win = win;